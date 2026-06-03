import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateAndWriteOpenUIHome } from './phase-openui-home.ts'
import { formatRunAllReport } from './report.js'
import { loadSiteSpec } from '../spec/index.js'
import { requirePromptText } from '../prompt.js'
import { detectLanguage } from './detect-language.js'
import { withLanguageEnforcementBlock } from './prompt-language.js'
import { getWorkspacePreferredLanguage } from '../session-prefs.js'

const log = (sessionCtx) => (msg) => {
  console.log(msg)
  sessionCtx?.broadcast?.({ type: 'log', message: msg })
}

const status = (sessionCtx) => (message, phase) => {
  console.log(`  [${phase}] ${message}`)
  sessionCtx?.broadcast?.({ type: 'status', message, phase })
}

export async function buildOpenUIPromptContext({ prompt, workspace, preferredLanguage } = {}) {
  const normalizedPrompt = requirePromptText(prompt)
  const requestedLanguage = preferredLanguage || getWorkspacePreferredLanguage(workspace)
  const languageMode = await detectLanguage(normalizedPrompt, requestedLanguage)
  return {
    originalPrompt: normalizedPrompt,
    prompt: withLanguageEnforcementBlock(normalizedPrompt, languageMode),
    languageMode,
  }
}

export async function buildOpenUIPrompt({ prompt, workspace, preferredLanguage } = {}) {
  return (await buildOpenUIPromptContext({ prompt, workspace, preferredLanguage })).prompt
}

export async function runAll({
  prompt,
  workspace,
  sessionCtx,
  preferredLanguage,
  integrations,
} = {}) {
  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)
  const openuiPromptContext = await buildOpenUIPromptContext({
    prompt: normalizedPrompt,
    workspace,
    preferredLanguage,
  })
  const timings = { t0 }
  const tasks = [
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

  try {
    _status('Generating homepage with the OpenUI module engine…', 'openui')
    tasks[0].status = 'IN_PROGRESS'
    sessionCtx?.updateTask?.(tasks[0])
    persistTasks()

    timings.openui_start = Date.now()
    const openuiStats = await generateAndWriteOpenUIHome({
      workspace,
      siteSpec: loadSiteSpec(workspace),
      prompt: openuiPromptContext.prompt,
      userPrompt: openuiPromptContext.originalPrompt,
      languageMode: openuiPromptContext.languageMode,
      log: _log,
      sessionCtx,
      variationSeed: sessionCtx?.id || workspace,
    })
    timings.openui_end = Date.now()
    timings.preview_saved = timings.openui_end

    tasks[0].status = 'DONE'
    sessionCtx?.updateTask?.(tasks[0])
    persistTasks()
    sessionCtx?.signalHomepageReady?.()
    sessionCtx?.signalOpenuiReady?.()

    if (integrations?.afterSiteSpecSaved) {
      const siteSpec = loadSiteSpec(workspace)
      await integrations.afterSiteSpecSaved({
        workspace,
        siteSpec,
        log: _log,
        status: _status,
      })
    }

    const elapsed = Number.parseFloat(((Date.now() - t0) / 1000).toFixed(1))
    sessionCtx?.setElapsed?.(elapsed)
    sessionCtx?.setCost?.(openuiStats.cost ?? 0)
    const completed = tasks.filter((task) => task.status === 'DONE').length
    const report = formatRunAllReport(timings, {
      elapsed,
      done: completed,
      total: tasks.length,
      tasks,
      homepageChars: openuiStats.chars ?? 0,
      ctxPages: 0,
    })

    _log(`  ✓ OpenUI module generation complete: ${completed}/${tasks.length} frontend tasks ready in ${elapsed}s`)
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
    const message = err?.message || String(err)
    _status(`Generation failed: ${message}`, 'failed')
    _log(`Error during generation: ${message}`)
    throw err
  }
}

export async function runEdit() {
  throw new Error('Legacy edit pipeline has been removed. Add an OpenUI-native edit engine before enabling edits.')
}

export async function generateAlternativeDesign() {
  throw new Error('Legacy alternative design pipeline has been removed. No fallback design generation is available.')
}
