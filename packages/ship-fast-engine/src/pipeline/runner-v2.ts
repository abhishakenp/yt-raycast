// @ts-ignore
import { formatRunAllReport } from './report.js'
import { loadSiteSpec } from '../spec/index.js'
import { requirePromptText } from '../prompt.js'
// @ts-ignore
import { resolvePipelineLanguage } from './prompt-language.js'
// @ts-ignore
import { generateSiteSpec } from './phase-site-spec.js'
import { generateAndWriteOpenUIHome } from './phase-openui-home.ts'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const log = (sessionCtx: any) => (msg: string) => {
  console.log(msg)
  sessionCtx?.broadcast?.({ type: 'log', message: msg })
}

const status = (sessionCtx: any) => (message: string, phase: string) => {
  console.log(`  [${phase}] ${message}`)
  sessionCtx?.broadcast?.({ type: 'status', message, phase })
}

export async function runAllV2({
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
} = {} as any) {
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
      id: 'home.spec',
      label: 'Blueprint site structure',
      status: 'PENDING',
      filename: 'site-spec.json',
      files: ['site-spec.json'],
    },
    {
      id: 'home.openui',
      label: 'Generate Home page',
      status: 'PENDING',
      filename: 'home.openui',
      files: ['home.openui'],
    },
  ]

  const persistTasks = () => {
    writeFileSync(join(workspace, 'tasks.json'), JSON.stringify({ tasks }, null, 2))
  }

  sessionCtx?.setPrompt?.(normalizedPrompt)
  sessionCtx?.setTasks?.(tasks)
  persistTasks()

  // ── Phase 1: Blueprint ────────────────────────────────────────────────────
  _status('Planning site blueprint…', 'spec')
  tasks[0].status = 'IN_PROGRESS'
  sessionCtx?.updateTask?.(tasks[0])
  persistTasks()

  try {
    timings.spec_start = Date.now()
    await generateSiteSpec({
      prompt: languageMode.prompt,
      workspace,
      log: _log,
    })
    timings.spec_end = Date.now()
    tasks[0].status = 'DONE'
    _log(`  ✓ Site blueprint ready (${((timings.spec_end - timings.spec_start) / 1000).toFixed(1)}s)`)
  } catch (specErr) {
    tasks[0].status = 'FAILED'
    _log(`  ⚠ Site spec failed, continuing with defaults: ${(specErr as Error)?.message ?? specErr}`)
  }

  sessionCtx?.updateTask?.(tasks[0])
  persistTasks()

  // ── Phase 2: Generation ───────────────────────────────────────────────────
  _status('Generating homepage with the OpenUI module engine…', 'openui')
  tasks[1].status = 'IN_PROGRESS'
  sessionCtx?.updateTask?.(tasks[1])
  persistTasks()

  let openuiStats: any
  try {
    timings.openui_start = Date.now()
    openuiStats = await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: loadSiteSpec(workspace),
      prompt: languageMode.prompt,
      languageMode,
      log: _log,
      sessionCtx,
      variationSeed: sessionCtx?.id || workspace,
    })
    timings.openui_end = Date.now()
    timings.preview_saved = timings.openui_end

    tasks[1].status = 'DONE'
    sessionCtx?.updateTask?.(tasks[1])
    persistTasks()
    sessionCtx?.signalHomepageReady?.()
    sessionCtx?.signalOpenuiReady?.()

    if (integrations?.afterSiteSpecSaved) {
      const siteSpec = loadSiteSpec(workspace)
      await integrations.afterSiteSpecSaved({ workspace, siteSpec, log: _log, status: _status })
    }

    const elapsed = Number.parseFloat(((Date.now() - t0) / 1000).toFixed(1))
    sessionCtx?.setElapsed?.(elapsed)
    sessionCtx?.setCost?.(openuiStats.cost ?? 0)

    const completed = tasks.filter((t) => t.status === 'DONE').length
    const report = formatRunAllReport(timings, {
      elapsed,
      done: completed,
      total: tasks.length,
      tasks,
      homepageChars: openuiStats.chars ?? 0,
      ctxPages: 0,
    })

    _log(`  ✓ OpenUI module generation complete: ${completed}/${tasks.length} tasks ready in ${elapsed}s`)
    sessionCtx?.broadcast?.({
      type: 'run_completed',
      elapsed,
      completed,
      total: tasks.length,
      report,
    })
  } catch (err) {
    tasks[1].status = 'FAILED'
    sessionCtx?.setTasks?.(tasks)
    persistTasks()
    const message = (err as Error)?.message || String(err)
    _status(`Generation failed: ${message}`, 'failed')
    _log(`Error during generation: ${message}`)
    throw err
  }
}
