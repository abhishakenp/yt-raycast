// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { formatRunAllReport } from './report'
import { loadSiteSpec } from '../spec/index'
import { requirePromptText } from '../prompt'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { resolvePipelineLanguage } from './prompt-language'
import { writeSffHtmlHome } from './phase-sff-html.ts'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { enrichBrandProfile } from './brand-profile'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { resolvePexelsImageHints } from './image-hints'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const enrichBrandProfileTyped = enrichBrandProfile as (
  prompt: string,
  workspace: string,
  log?: (message: string) => void,
) => Promise<Record<string, unknown> | null>

const resolvePexelsImageHintsTyped = resolvePexelsImageHints as unknown as (
  input: {
    prompt: string
    hydrationPrompt: string
    siteSpec?: Record<string, unknown>
  },
  options?: { onProgress?: (partial: unknown) => void },
) => Promise<{
  photos?: Array<{ query?: string; alt?: string; url?: string }>
  videos?: Array<{
    query?: string
    alt?: string
    url?: string
    posterUrl?: string
  }>
} | null>

function log(sessionCtx: any) {
  return (msg) => {
    console.log(msg)
    sessionCtx?.broadcast?.({ type: 'log', message: msg })
  }
}

function status(sessionCtx: any) {
  return (message, phase) => {
    console.log(`  [${phase}] ${message}`)
    sessionCtx?.broadcast?.({ type: 'status', message, phase })
  }
}

export async function runAllV2(
  {
    prompt,
    workspace,
    sessionCtx,
    integrations,
    preferredLanguage,
  }: {
    prompt?: string
    workspace: string
    sessionCtx?: any
    integrations?: any
    preferredLanguage?: string
  } = {} as any,
) {
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

  const tasks = [
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

  let htmlStats: any
  try {
    timings.html_start = Date.now()
    const siteSpec = loadSiteSpec(workspace)
    const [brandProfile, imageHints] = await Promise.all([
      enrichBrandProfileTyped(languageMode.prompt, workspace, _log).catch(
        (error) => {
          _log(
            `  brand-profile: skipped (${(error as Error)?.message ?? String(error)})`,
          )
          return null
        },
      ),
      resolvePexelsImageHintsTyped(
        {
          prompt: languageMode.prompt,
          hydrationPrompt: languageMode.prompt,
          siteSpec: siteSpec ?? undefined,
        },
        {
          onProgress: (partial) => {
            const payload =
              partial && typeof partial === 'object'
                ? (partial as Record<string, unknown>)
                : {}
            sessionCtx?.broadcast?.({ type: 'media_hints', ...payload })
          },
        },
      ).catch((error) => {
        _log(
          `  image-hints: skipped (${(error as Error)?.message ?? String(error)})`,
        )
        return null
      }),
    ])
    htmlStats = await writeSffHtmlHome({
      workspace,
      prompt: languageMode.prompt,
      siteSpec: siteSpec ?? undefined,
      preferredLanguage: languageMode.code ?? preferredLanguage,
      brandProfile,
      imageHints,
      log: _log,
      sessionCtx,
    })
    timings.html_end = Date.now()
    timings.preview_saved = timings.html_end

    tasks[0].status = 'DONE'
    sessionCtx?.updateTask?.(tasks[0])
    persistTasks()
    sessionCtx?.signalHomepageReady?.()
    sessionCtx?.signalOpenuiReady?.()

    if (integrations?.afterSiteSpecSaved) {
      const savedSiteSpec = loadSiteSpec(workspace)
      await integrations.afterSiteSpecSaved({
        workspace,
        siteSpec: savedSiteSpec,
        log: _log,
        status: _status,
      })
    }

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
    const message = (err as Error)?.message || String(err)
    _status(`Generation failed: ${message}`, 'failed')
    _log(`Error during generation: ${message}`)
    throw err
  }
}
