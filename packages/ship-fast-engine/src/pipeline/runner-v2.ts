import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { toPublicErrorMessage } from '../lib/public-error-message'
import { requirePromptText } from '../prompt'
import { loadSiteSpec } from '../spec/index'
import type { SiteSpecProject } from '../spec/index'
import { enrichBrandProfile } from './brand-profile'
import { resolvePexelsImageHints } from './image-hints'
import { writeSffHtmlHome } from './phase-sff-html.ts'
import { resolvePipelineLanguage } from './prompt-language'
import { formatRunAllReport } from './report'

type RunnerTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED'

type RunnerTask = {
  id: string
  label: string
  status: RunnerTaskStatus
  filename: string
  files: string[]
}

type RunnerSessionContext = {
  id?: string
  broadcast?: (payload: unknown) => void
  setPrompt?: (prompt: string) => void
  setTasks?: (tasks: unknown[]) => void
  updateTask?: (task: unknown) => void
  signalHomepageReady?: () => void
  signalOpenuiReady?: () => void
  setElapsed?: (elapsed: number) => void
  setCost?: (cost: number) => void
}

type RunnerIntegrations = {
  afterSiteSpecSaved?: (options: {
    workspace: string
    siteSpec: unknown
    log: (message: string) => void
    status: (message: string, phase: string) => void
  }) => Promise<void>
}

type RunAllV2Input = {
  prompt?: string
  workspace?: string
  sessionCtx?: RunnerSessionContext
  integrations?: RunnerIntegrations
  preferredLanguage?: string
}

const log =
  (sessionCtx: RunnerSessionContext | undefined) =>
  (message: string): void => {
    const publicMessage = toPublicErrorMessage(message)
    console.log(publicMessage)
    sessionCtx?.broadcast?.({ type: 'log', message: publicMessage })
  }

const status =
  (sessionCtx: RunnerSessionContext | undefined) =>
  (message: string, phase: string): void => {
    const publicMessage = toPublicErrorMessage(message)
    console.log(`  [${phase}] ${publicMessage}`)
    sessionCtx?.broadcast?.({
      type: 'status',
      message: publicMessage,
      phase,
    })
  }

const stringField = (
  value: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  const field = value?.[key]
  return typeof field === 'string' ? field : undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const toMediaSiteSpec = (siteSpec: SiteSpecProject | null) => {
  if (!siteSpec) return undefined

  const metadata = isRecord(siteSpec.metadata) ? siteSpec.metadata : undefined

  return {
    siteType: siteSpec.siteType,
    metadata: { siteType: stringField(metadata, 'siteType') },
    pages: siteSpec.pages?.map((page) => ({
      title: stringField(page, 'title'),
      name: stringField(page, 'name'),
      description: stringField(page, 'description'),
    })),
  }
}

const serializationKey = (value: unknown): string | undefined => {
  try {
    return JSON.stringify(value)
  } catch {
    return undefined
  }
}

export const runAllV2 = async ({
  prompt,
  workspace,
  sessionCtx,
  integrations,
  preferredLanguage,
}: RunAllV2Input = {}): Promise<void> => {
  if (!workspace) throw new Error('workspace is required for runAllV2')

  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)

  const languageMode = await resolvePipelineLanguage({
    prompt: normalizedPrompt,
    preferredLanguage,
    workspace,
  })

  const timings: Record<string, number> = { t0 }

  const tasks: RunnerTask[] = [
    {
      id: 'home.openui',
      label: 'Generate SFF HTML homepage',
      status: 'PENDING',
      filename: 'home.openui',
      files: ['index.html', 'home.openui'],
    },
  ]

  const persistTasks = () => {
    writeFileSync(
      join(workspace, 'tasks.json'),
      JSON.stringify({ tasks }, null, 2),
    )
  }

  sessionCtx?.setPrompt?.(normalizedPrompt)
  sessionCtx?.setTasks?.(tasks)
  persistTasks()

  // ── Generation ────────────────────────────────────────────────────────────
  _status('Generating SFF-style single-file homepage…', 'html')
  tasks[0].status = 'IN_PROGRESS'
  sessionCtx?.updateTask?.(tasks[0])
  persistTasks()

  try {
    timings.html_start = Date.now()
    const siteSpec = loadSiteSpec(workspace)
    const seenMediaProgress = new Set<string>()
    const [resolvedBrandProfile, imageHints] = await Promise.all([
      enrichBrandProfile(languageMode.prompt, workspace, _log).catch(
        (error) => {
          _log(`  brand-profile: skipped (${toPublicErrorMessage(error)})`)
          return null
        },
      ),
      resolvePexelsImageHints(
        {
          prompt: languageMode.prompt,
          hydrationPrompt: languageMode.prompt,
          siteSpec: toMediaSiteSpec(siteSpec),
        },
        {
          onProgress: (partial) => {
            const payload = { ...partial, type: 'media_hints' }
            const key = serializationKey(payload)
            if (key && seenMediaProgress.has(key)) return
            if (key) seenMediaProgress.add(key)
            sessionCtx?.broadcast?.(payload)
          },
        },
      ).catch((error) => {
        _log(`  image-hints: skipped (${toPublicErrorMessage(error)})`)
        return null
      }),
    ])
    const brandProfile = resolvedBrandProfile
      ? { ...resolvedBrandProfile }
      : null
    const htmlStats = await writeSffHtmlHome({
      workspace,
      prompt: languageMode.prompt,
      siteSpec: siteSpec ?? undefined,
      preferredLanguage: languageMode.code ?? preferredLanguage,
      languageMode,
      brandProfile,
      imageHints,
      log: _log,
      sessionCtx,
    })
    timings.html_end = Date.now()
    timings.preview_saved = timings.html_end

    if (integrations?.afterSiteSpecSaved) {
      const savedSiteSpec = loadSiteSpec(workspace)
      await integrations.afterSiteSpecSaved({
        workspace,
        siteSpec: savedSiteSpec,
        log: _log,
        status: _status,
      })
    }

    tasks[0].status = 'DONE'
    sessionCtx?.updateTask?.(tasks[0])
    persistTasks()
    sessionCtx?.signalHomepageReady?.()
    sessionCtx?.signalOpenuiReady?.()

    const elapsed = Number.parseFloat(((Date.now() - t0) / 1000).toFixed(1))
    sessionCtx?.setElapsed?.(elapsed)
    sessionCtx?.setCost?.(htmlStats.cost ?? 0)

    const completed = tasks.filter((t) => t.status === 'DONE').length
    const report = formatRunAllReport(timings, {
      elapsed,
      done: completed,
      total: tasks.length,
      tasks,
      homepageChars: htmlStats.chars ?? 0,
      ctxPages: 0,
    })

    _log(
      `  ✓ SFF HTML generation complete: ${completed}/${tasks.length} tasks ready in ${elapsed}s`,
    )
    sessionCtx?.broadcast?.({
      type: 'run_completed',
      elapsed,
      completed,
      total: tasks.length,
      report,
    })
  } catch (err) {
    tasks[0].status = 'FAILED'
    sessionCtx?.setTasks?.(tasks)
    persistTasks()
    const message = toPublicErrorMessage(err)
    _status(`Generation failed: ${message}`, 'failed')
    _log(`Error during generation: ${message}`)
    throw err
  }
}
