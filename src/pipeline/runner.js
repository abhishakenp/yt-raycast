import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { stripFences, formatTps } from '../llm/utils.js'
import { groqParallel } from '../llm/groq.js'
import { writeFile } from './workspace.js'
import { generateDesignBrief } from './phase-design.js'
import { detectSiteType } from './phase-detect.js'
import { generateContext } from './phase-context.js'
import { generateSiteSpec, updateSiteSpecFromPrompt } from './phase-site-spec.js'
import { generateHomepage, injectDesignIntoHomepage } from './phase-homepage.js'
import { shouldReplaceLlmHomepageWithRenderer } from './homepage-substance.js'
import { injectLLMHomepageSwiper } from './homepage-swiper.js'
import { deriveTasks, generateAllTasks } from './phase-tasks.js'
import { fixHomepageNav } from './phase-navfix.js'
import { formatRunAllReport, formatEditReport } from './report.js'
import { editPrompt } from '../prompts/edit.js'
import {
  enrichSiteSpecWithWorkspaceBlueprints,
  loadSiteSpec,
  saveSiteSpec,
  stripSiteSpecBlueprints,
} from '../spec/index.js'
import { renderPreviewToWorkspace, writeNextAppToWorkspace } from '../renderers/index.js'
import { detectLanguage } from './detect-language.js'
import {
  alignGeneratedImagesToContext,
  mergeImageHintLists,
  resolvePexelsImageHints,
} from './image-hints.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { withLanguageEnforcementBlock } from './prompt-language.js'
import { getWorkspacePreferredLanguage } from '../server/sessions.js'
import { sanitizeSiteSpec } from '../contracts/contracts.js'
import { normalizePromptText, promptSnippet, requirePromptText } from '../prompt.js'
import { enrichBrandProfile } from './brand-profile.js'
import { syncSiteSettingsFromSiteSpec } from '../sanity/cms-sync.js'
import { syncProductsToMedusa, isMedusaSyncConfigured } from '../server/sync-medusa-catalog.js'
import {
  mergePromptWithDesignReferences,
  readDesignReferenceUrlsFromWorkspace,
} from './ecommerce-design-references.js'

const log = (sessionCtx) => (msg) => {
  console.log(msg)
  sessionCtx.broadcast({ type: 'log', message: msg })
}

const status = (sessionCtx) => (message, phase) => {
  console.log(`  [${phase}] ${message}`)
  sessionCtx.broadcast({ type: 'status', message, phase })
}

export async function runEdit({ prompt, workspace, sessionCtx }) {
  const _log = log(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)

  sessionCtx.setPrompt(normalizedPrompt)

  const preferredLanguage = getWorkspacePreferredLanguage(workspace)
  const pipelinePrompt = withLanguageEnforcementBlock(normalizedPrompt, preferredLanguage)

  const existingSiteSpec = loadSiteSpec(workspace)
  if (existingSiteSpec) {
    _log(`\n  ── Edit mode: updating canonical site spec ──`)
    status(sessionCtx)('Editing site spec…', 'editing')

    const siteSpecStats = await updateSiteSpecFromPrompt({
      prompt: pipelinePrompt,
      currentSpec: existingSiteSpec,
      workspace,
      log: _log,
    })

    const siteSpec = sanitizeSiteSpec(
      stripSiteSpecBlueprints(siteSpecStats.siteSpec),
      { projectName: 'Project' },
      {
        fallbackOnInvalid: true,
        fallback: existingSiteSpec,
      },
    ).spec
    if (!siteSpec) throw new Error('Invalid site spec generated for edit flow.')
    sessionCtx.setSiteSpec?.(siteSpec)
    renderPreviewToWorkspace(siteSpec, workspace)
    sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
    const enrichedSiteSpec = enrichSiteSpecWithWorkspaceBlueprints(siteSpec, workspace)
    saveSiteSpec(workspace, enrichedSiteSpec)
    sessionCtx.setSiteSpec?.(enrichedSiteSpec)
    void syncSiteSettingsFromSiteSpec(enrichedSiteSpec)
    if (
      enrichedSiteSpec?.siteType === 'ecommerce' &&
      enrichedSiteSpec?.ecommerce?.products?.length &&
      isMedusaSyncConfigured()
    ) {
      syncProductsToMedusa(enrichedSiteSpec.ecommerce.products)
        .then(({ synced, errors }) => {
          _log(`  medusa: synced ${synced} product(s)${errors.length ? ` (${errors.length} failed)` : ''}`)
        })
        .catch((err) => _log(`  medusa: catalog sync skipped – ${err.message}`))
    }

    const taskList = deriveTasks(enrichedSiteSpec).map((task) => {
      if (String(task.id).startsWith('backend-')) return { ...task, status: 'DONE' }
      return {
        ...task,
        status: 'DONE',
        files: task.filename ? [task.filename] : [],
      }
    })

    sessionCtx.setTasks(taskList)
    writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))
    sessionCtx.signalHomepageReady()

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    const renderedPageCount = taskList.filter((task) => task.filename).length
    const report = formatEditReport(
      renderedPageCount,
      renderedPageCount,
      elapsed,
      siteSpecStats.inputTokens ?? 0,
      siteSpecStats.outputTokens ?? 0,
      siteSpecStats.cost ?? 0,
    )
    _log(report)
    sessionCtx.broadcast({
      type: 'run_completed',
      elapsed: Number.parseFloat(elapsed),
      completed: taskList.length,
      total: taskList.length,
      report,
    })
    return
  }

  const tasksData = JSON.parse(readFileSync(join(workspace, 'tasks.json'), 'utf-8'))
  const tasks = tasksData.tasks ?? []
  const htmlTasks = tasks.filter((t) => t.filename?.endsWith('.html'))

  const taskList = tasks.map((t) => ({
    ...t,
    status: t.filename?.endsWith('.html') ? 'PENDING' : 'DONE',
  }))
  sessionCtx.setTasks(taskList)
  writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))

  _log(
    `\n  ── Edit mode: applying "${promptSnippet(normalizedPrompt, 80)}" to ${htmlTasks.length} HTML files ──`,
  )
  status(sessionCtx)('Editing pages…', 'editing')

  const homepageHtml = existsSync(join(workspace, 'index.html'))
    ? readFileSync(join(workspace, 'index.html'), 'utf-8')
    : ''
  const homepageRef = homepageHtml
    ? `\n\nHOMEPAGE REFERENCE (match this exact style, head, nav, footer, colors):\n${homepageHtml}\n`
    : ''

  const calls = htmlTasks.map((t) => {
    const filePath = join(workspace, t.filename)
    const html = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : ''
    if (!html) return null
    return editPrompt(pipelinePrompt, t, html, homepageRef)
  })

  const validIndices = calls.map((c, i) => (c ? i : -1)).filter((i) => i >= 0)
  const validCalls = calls.filter(Boolean)

  if (validCalls.length === 0) {
    _log('  No HTML files to edit')
    sessionCtx.broadcast({ type: 'run_completed', elapsed: 0, completed: 0, total: 0 })
    return
  }

  const results = await groqParallel(validCalls)

  let done = 0
  for (let j = 0; j < results.length; j++) {
    const taskIdx = validIndices[j]
    const t = htmlTasks[taskIdx]
    const r = results[j]
    const task = taskList.find((x) => x.id === t.id)

    if (!r?.content || r.error) {
      _log(`  ${t.filename}: FAILED — ${r?.error ?? 'empty response'}`)
      if (task) task.status = 'FAILED'
      sessionCtx.updateTask({ id: t.id, status: 'FAILED' })
      writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))
      continue
    }

    const content = ensureLucideIconRuntime(stripFences(r.content), _log)
    writeFile(workspace, t.filename, content)
    if (task) task.status = 'DONE'
    sessionCtx.updateTask({ id: t.id, status: 'DONE' })
    writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))
    done++
    const tpsStr = formatTps(r) ? ` | ${formatTps(r)}` : ''
    _log(`  ${t.filename}: ${content.length} chars${tpsStr}`)
  }

  sessionCtx.signalHomepageReady()

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  const totalInput = results.reduce((s, r) => s + (r?.inputTokens ?? 0), 0)
  const totalOutput = results.reduce((s, r) => s + (r?.outputTokens ?? 0), 0)
  const totalCost = results.reduce((s, r) => s + (r?.cost ?? 0), 0)

  const report = formatEditReport(
    done,
    htmlTasks.length,
    elapsed,
    totalInput,
    totalOutput,
    totalCost,
  )
  _log(report)
  sessionCtx.broadcast({
    type: 'run_completed',
    elapsed: Number.parseFloat(elapsed),
    completed: done,
    total: htmlTasks.length,
    report,
  })
}

export async function runAll({ prompt, workspace, sessionCtx, preferredLanguage }) {
  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)
  const timings = {}
  const tick = (name) => {
    timings[name] = Date.now()
  }

  sessionCtx.setPrompt(normalizedPrompt)

  const promptWithRefs = mergePromptWithDesignReferences(normalizedPrompt, workspace)
  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0

  const [brandProfile, indiaMode] = await Promise.all([
    enrichBrandProfile(normalizedPrompt, workspace, _log).catch((error) => {
      _log(`  brand-profile: continuing without verified brand data — ${error.message}`)
      return null
    }),
    detectLanguage(normalizedPrompt, preferredLanguage),
  ])

  const pipelinePrompt = withLanguageEnforcementBlock(promptWithRefs, indiaMode.code)
  writeFileSync(join(workspace, 'prompt.txt'), pipelinePrompt)

  if (indiaMode.code !== 'en') {
    _log(`  Language detected: ${indiaMode.name} (${indiaMode.code})${indiaMode.isIndian ? ' — routing to hex-1' : ''}`)
  }

  let ctx = null
  let homepage = null
  let siteSpec = null

  tick('t0')

  // ── PARALLEL: spec+design AND homepage fire at the same time ──
  _status('Generating spec…', 'spec')

  const specPromise = (async () => {
    const [designStats, detectStats] = await Promise.all([
      generateDesignBrief(pipelinePrompt, workspace, _log, indiaMode),
      detectSiteType(pipelinePrompt, _log),
    ])
    tick('design_end')
    tick('detect_end')
    const ctxStats = await generateContext(
      pipelinePrompt,
      designStats.brief,
      detectStats.siteType,
      workspace,
      _log,
      brandProfile,
    )
    tick('ctx_end')
    const siteSpecStats = await generateSiteSpec({
      prompt: pipelinePrompt,
      ctx: ctxStats.ctx,
      designBrief: designStats.brief,
      siteType: detectStats.siteType,
      workspace,
      log: _log,
      brandProfile,
    })
    tick('site_spec_end')
    return { designStats, detectStats, ctxStats, siteSpecStats }
  })()

  const homepagePromise = (async () => {
    const imageHints = await resolvePexelsImageHints({ prompt: normalizedPrompt })
    try {
      const stats = await generateHomepage(
        pipelinePrompt,
        workspace,
        _log,
        sessionCtx,
        indiaMode,
        imageHints,
        brandProfile,
      )
      tick('homepage_end')
      return { ...stats, imageHints }
    } catch (error) {
      tick('homepage_end')
      _log(`  homepage: falling back to renderer path — ${error.message}`)
      return {
        html: '',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        error: error.message,
        imageHints: null,
      }
    }
  })()

  const [specResult, homepageStats] = await Promise.all([specPromise, homepagePromise])

  const { designStats, detectStats, ctxStats, siteSpecStats } = specResult
  const designBrief = designStats.brief
  ctx = ctxStats.ctx
  siteSpec = siteSpecStats.siteSpec
  siteSpec = sanitizeSiteSpec(
    siteSpec,
    { projectName: 'Project' },
    {
      fallbackOnInvalid: true,
      fallback: {
        pages: [],
        components: [],
        metadata: { title: 'Generated Project' },
        version: '1.0.0',
        design: { theme: 'light' },
        exportTargets: ['html'],
      },
    },
  ).spec
  if (!siteSpec)
    siteSpec = {
      pages: [],
      components: [],
      metadata: { title: 'Generated Project' },
      version: '1.0.0',
      design: { theme: 'light' },
      exportTargets: ['html'],
    }
  if (indiaMode.isIndian && siteSpec) siteSpec._indiaMode = indiaMode
  sessionCtx.setSiteSpec?.(siteSpec)
  homepage = homepageStats.html
  const richImageHints = await resolvePexelsImageHints({
    prompt: normalizedPrompt,
    ctx,
    siteSpec,
  })
  const imageHints = mergeImageHintLists(homepageStats.imageHints, richImageHints)
  if (homepage) {
    homepage = alignGeneratedImagesToContext(homepage, imageHints)
    writeFile(workspace, 'index.html', homepage)
  }

  // Inject design system colors into the homepage now that both are ready
  if (homepage && designBrief) {
    homepage = injectDesignIntoHomepage(homepage, designBrief, workspace, _log)
    if (siteSpec) writeNextAppToWorkspace(siteSpec, workspace)
    const withSwiper = injectLLMHomepageSwiper(homepage, siteSpec)
    if (withSwiper !== homepage) {
      homepage = withSwiper
      writeFile(workspace, 'index.html', homepage)
    }
    const wouldReplaceLlmWithRenderer = shouldReplaceLlmHomepageWithRenderer(homepage, siteSpec)
    const replaceLlmWithRenderer = wouldReplaceLlmWithRenderer && !hasUserDesignReferences
    if (siteSpec?.pages?.length && replaceLlmWithRenderer) {
      _log('  homepage: LLM page body looks too sparse; rendering homepage from site spec instead')
      const recovered = renderPreviewToWorkspace(siteSpec, workspace)
      homepage = recovered.files['index.html'] ?? homepage
      writeFile(workspace, 'index.html', homepage)
    } else if (siteSpec?.pages?.length && wouldReplaceLlmWithRenderer && hasUserDesignReferences) {
      _log(
        '  homepage: keeping LLM HTML — layout inspiration references set (skipping spec renderer substitution for sparse output)',
      )
    }
    sessionCtx.signalHomepageReady()
  } else if (siteSpec) {
    const preview = renderPreviewToWorkspace(siteSpec, workspace)
    sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
    homepage = preview.files['index.html'] ?? ''
    sessionCtx.signalHomepageReady()
  }
  const ctxPages = ctx.pages?.length ?? 0
  const homepageChars = homepage?.length ?? 0

  if (!homepage) {
    _log('  Error: index.html not found')
    return
  }

  tick('derive_start')
  const tasks = deriveTasks(siteSpec || ctx)
  sessionCtx.setTasks(tasks)
  writeFile(workspace, 'tasks.json', JSON.stringify({ tasks }, null, 2))
  _log(
    `  Derived ${tasks.length} tasks (${tasks.filter((t) => t.filename).length} pages, ${tasks.filter((t) => String(t.id).startsWith('backend-')).length} backend)`,
  )
  tick('derive_end')

  tick('gen_start')
  const taskCtx = { taskList: tasks, updateTask: sessionCtx.updateTask }
  const genStats = await generateAllTasks(
    tasks,
    ctx,
    homepage,
    designBrief,
    workspace,
    _log,
    _status,
    taskCtx,
    indiaMode,
    imageHints,
    brandProfile,
    hasUserDesignReferences,
  )
  tick('gen_end')

  tick('navfix_start')
  const navFixStats = (await fixHomepageNav(genStats.navList, workspace, _log)) ?? {
    count: 0,
    inputTokens: 0,
    outputTokens: 0,
  }
  tick('navfix_end')

  if (siteSpec) {
    siteSpec = enrichSiteSpecWithWorkspaceBlueprints(siteSpec, workspace)
    saveSiteSpec(workspace, siteSpec)
    sessionCtx.setSiteSpec?.(siteSpec)
    void syncSiteSettingsFromSiteSpec(siteSpec)
    if (
      siteSpec?.siteType === 'ecommerce' &&
      siteSpec?.ecommerce?.products?.length &&
      isMedusaSyncConfigured()
    ) {
      syncProductsToMedusa(siteSpec.ecommerce.products)
        .then(({ synced, errors }) => {
          _status(`Synced ${synced} product(s) to Medusa${errors.length ? ` (${errors.length} failed)` : ''}`, 'medusa_sync')
        })
        .catch((err) => console.warn(`medusa: catalog auto-sync skipped – ${err.message}`))
    }
  }

  const done = tasks.filter((t) => t.status === 'DONE').length
  const total = tasks.length
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  const totalCost =
    (designStats?.cost ?? 0) +
    (detectStats?.cost ?? 0) +
    (ctxStats?.cost ?? 0) +
    (siteSpecStats?.cost ?? 0) +
    (homepageStats?.cost ?? 0) +
    (genStats?.pages?.cost ?? 0) +
    (genStats?.backend?.cost ?? 0) +
    (navFixStats?.cost ?? 0)
  sessionCtx.setElapsed(Number.parseFloat(elapsed))
  sessionCtx.setCost(totalCost)

  sessionCtx.broadcast({
    type: 'run_completed',
    elapsed: Number.parseFloat(elapsed),
    completed: done,
    total,
  })

  const report = formatRunAllReport(timings, {
    elapsed,
    done,
    total,
    ctxPages,
    homepageChars,
    tasks,
    designStats,
    detectStats,
    ctxStats,
    siteSpecStats,
    homepageStats,
    genStats,
    navFixStats,
    indiaMode,
  })

  _log(report)
  sessionCtx.broadcast({
    type: 'run_completed',
    elapsed: Number.parseFloat(elapsed),
    completed: done,
    total,
    report,
  })

  // Background: Generate alternative design for "Magic Theme"
  _log('  Generating alternative design context...')
  generateAlternativeDesign(normalizedPrompt, workspace, sessionCtx, _log)

  try {
    const homeDir = process.env.HOME
    const logFile = join(homeDir, '.ship.log')
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const logEntry = `\n--- /ship-fast completed at ${timestamp} ---\n  prompt: ${promptSnippet(normalizedPrompt, 120)}\n  workspace: ${workspace}\n  result: ${done}/${total} tasks in ${elapsed}s\n${report}\n`
    writeFileSync(logFile, readFileSync(logFile, 'utf-8') + logEntry)
  } catch {
    /* log writing is best-effort */
  }
}

// Generate alternative design with fallback colors
export async function generateAlternativeDesign(prompt, workspace, sessionCtx, _log) {
  const normalizedPrompt = normalizePromptText(prompt) || 'Generated Project'

  try {
    const designBriefPrompt = `Generate an alternative, high-contrast, sophisticated color scheme for: "${normalizedPrompt}"

Return ONLY a JSON block in this format:
\`\`\`json
{
  "primary": "#HEX",
  "secondary": "#HEX",
  "accent": "#HEX",
  "background": "#HEX",
  "surface": "#HEX",
  "text": "#HEX"
}
\`\`\`

Requirements:
- Use HEX color codes
- Make it visually distinct from typical light/dark defaults
- High contrast for accessibility
- Sophisticated, modern palette
- Different from standard blue/gray themes`

    const res = await generateDesignBrief(designBriefPrompt, workspace, () => {})
    const configMatch = res.brief.match(/```json\s*(\{[\s\S]*?\})\s*```/)

    if (configMatch) {
      try {
        const config = JSON.parse(configMatch[1])
        // Validate required fields
        if (
          config.primary &&
          config.secondary &&
          config.accent &&
          config.background &&
          config.surface &&
          config.text
        ) {
          sessionCtx.setAlternativeDesign(config)
          _log('  ✓ Alternative design generated successfully')
          return config
        } else {
          _log('  ✗ Alternative design missing required color fields')
        }
      } catch (parseErr) {
        _log(`  ✗ Alternative design JSON parse error: ${parseErr.message}`)
      }
    } else {
      _log('  ✗ Alternative design JSON not found in response')
    }
  } catch (err) {
    _log(`  ✗ Alternative design generation failed: ${err.message}`)
  }

  // Fallback: Generate a sophisticated color palette
  const fallbackColors = generateFallbackColors(normalizedPrompt)
  sessionCtx.setAlternativeDesign(fallbackColors)
  _log('  ✓ Alternative design generated from fallback palette')
  return fallbackColors
}

// Generate fallback colors based on hash of prompt
function generateFallbackColors(prompt) {
  const palettes = [
    // Purple & Gold
    {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#FBBF24',
      background: '#1F1335',
      surface: '#2D1B47',
      text: '#F3E8FF',
    },
    // Teal & Coral
    {
      primary: '#14B8A6',
      secondary: '#2DD4BF',
      accent: '#FB7185',
      background: '#0F2F2E',
      surface: '#134E4A',
      text: '#CCFBF1',
    },
    // Emerald & Orange
    {
      primary: '#10B981',
      secondary: '#6EE7B7',
      accent: '#FB923C',
      background: '#051F1C',
      surface: '#065F46',
      text: '#D1FAE5',
    },
    // Indigo & Pink
    {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#EC4899',
      background: '#1E1B4B',
      surface: '#312E81',
      text: '#E0E7FF',
    },
    // Cyan & Rose
    {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      accent: '#F43F5E',
      background: '#082F4F',
      surface: '#0E3A47',
      text: '#CFFAFE',
    },
  ]

  // Use hash to pick palette
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  const paletteIdx = Math.abs(hash) % palettes.length
  return palettes[paletteIdx]
}
