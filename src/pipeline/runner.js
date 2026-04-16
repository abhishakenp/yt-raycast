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
import {
  injectMedusaVariantDataAttributes,
  injectStorefrontCartUi,
  stripStorefrontCartUi,
} from './storefront-cart-ui.js'
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
  hydrateStorefrontGradientSlots,
  injectEcommerceHeroResponsiveCss,
  mergeImageHintLists,
  resolvePexelsImageHints,
  verifyTrustedStockImageUrls,
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
    status(sessionCtx)('Recalibrating flight plan…', 'editing')

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
      try {
        const medusaResult = await syncProductsToMedusa(enrichedSiteSpec.ecommerce.products, {
          workspace,
        })
        _log(
          `  medusa: synced ${medusaResult.synced} product(s)${medusaResult.errors.length ? ` (${medusaResult.errors.length} failed)` : ''}`,
        )
        if (
          medusaResult?.byTitle &&
          Object.keys(medusaResult.byTitle).length &&
          existsSync(join(workspace, 'index.html'))
        ) {
          let h = readFileSync(join(workspace, 'index.html'), 'utf8')
          h = injectMedusaVariantDataAttributes(h, medusaResult.byTitle)
          h = stripStorefrontCartUi(h)
          h = injectStorefrontCartUi(h, { workspace, variantMap: medusaResult, force: true })
          writeFile(workspace, 'index.html', h)
        }
      } catch (err) {
        _log(`  medusa: catalog sync skipped – ${err.message}`)
      }
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
  status(sessionCtx)('Patching hull segments…', 'editing')

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

  const brandProfilePromise = enrichBrandProfile(normalizedPrompt, workspace, _log).catch(
    (error) => {
      _log(`  brand-profile: continuing without verified brand data — ${error.message}`)
      return null
    },
  )
  const indiaMode = await detectLanguage(normalizedPrompt, preferredLanguage)
  const brandProfileCached = readBrandProfileFromWorkspace(workspace)

  const pipelinePrompt = withLanguageEnforcementBlock(promptWithRefs, indiaMode.code)
  writeFileSync(join(workspace, 'prompt.txt'), pipelinePrompt)

  if (indiaMode.code !== 'en') {
    _log(
      `  Language detected: ${indiaMode.name} (${indiaMode.code})${indiaMode.isIndian ? ' — routing to hex-1' : ''}`,
    )
  }

  let ctx = null
  let homepage = null
  let siteSpec = null

  tick('t0')

  _status('Plotting launch trajectory…', 'spec')

  const bootstrapImageHintsPromise = resolvePexelsImageHints(
    { prompt: normalizedPrompt, hydrationPrompt: normalizedPrompt },
    {
      onProgress: (evt) =>
        sessionCtx.broadcast({
          type: 'stock_media_preview',
          photos: evt.photos ?? [],
          videos: evt.videos ?? [],
          done: Boolean(evt.done),
        }),
    },
  )

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
      brandProfileCached?.verified ? brandProfileCached : null,
    )
    tick('ctx_end')
    const siteSpecStats = await generateSiteSpec({
      prompt: pipelinePrompt,
      ctx: ctxStats.ctx,
      designBrief: designStats.brief,
      siteType: detectStats.siteType,
      workspace,
      log: _log,
      brandProfile: brandProfileCached?.verified ? brandProfileCached : null,
    })
    tick('site_spec_end')
    return { designStats, detectStats, ctxStats, siteSpecStats }
  })()

  const homepagePromise = (async () => {
    const baseHints = await bootstrapImageHintsPromise
    const imageHints = {
      ...baseHints,
      hydrationPrompt: normalizedPrompt,
      prompt: normalizedPrompt,
    }
    try {
      const stats = await generateHomepage(
        pipelinePrompt,
        workspace,
        _log,
        sessionCtx,
        indiaMode,
        imageHints,
        brandProfileCached?.verified ? brandProfileCached : null,
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
    hydrationPrompt: normalizedPrompt,
    ctx,
    siteSpec,
  })
  const imageHints = {
    ...mergeImageHintLists(homepageStats.imageHints, richImageHints),
    hydrationPrompt: normalizedPrompt,
    prompt: normalizedPrompt,
  }
  if (homepage) {
    homepage = injectStorefrontCartUi(
      injectEcommerceHeroResponsiveCss(
        await verifyTrustedStockImageUrls(
          hydrateStorefrontGradientSlots(
            alignGeneratedImagesToContext(homepage, imageHints),
            imageHints,
          ),
        ),
      ),
      { workspace },
    )
    writeFile(workspace, 'index.html', homepage)
  }

  // Inject design system colors into the homepage now that both are ready
  if (homepage && designBrief) {
    homepage = injectDesignIntoHomepage(homepage, designBrief, workspace, _log)
    if (siteSpec) writeNextAppToWorkspace(siteSpec, workspace, sessionCtx)
    const withSwiper = injectLLMHomepageSwiper(homepage, siteSpec)
    if (withSwiper !== homepage) {
      homepage = withSwiper
      writeFile(workspace, 'index.html', homepage)
    }
    const wouldReplaceLlmWithRenderer = shouldReplaceLlmHomepageWithRenderer(homepage, siteSpec)
    const replaceLlmWithRenderer = wouldReplaceLlmWithRenderer && !hasUserDesignReferences
    if (siteSpec?.pages?.length && replaceLlmWithRenderer) {
      _log('  homepage: LLM page body looks too sparse; rendering homepage from site spec instead')
      const recovered = renderPreviewToWorkspace(siteSpec, workspace, sessionCtx)
      homepage = recovered.files['index.html'] ?? homepage
      writeFile(workspace, 'index.html', homepage)
    } else if (siteSpec?.pages?.length && wouldReplaceLlmWithRenderer && hasUserDesignReferences) {
      _log(
        '  homepage: keeping LLM HTML — layout inspiration references set (skipping spec renderer substitution for sparse output)',
      )
    }
    if (homepage) {
      homepage = injectStorefrontCartUi(injectEcommerceHeroResponsiveCss(homepage), { workspace })
      writeFile(workspace, 'index.html', homepage)
    }
    sessionCtx.signalHomepageReady()
  } else if (siteSpec) {
    const preview = renderPreviewToWorkspace(siteSpec, workspace, sessionCtx)
    sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
    homepage = injectStorefrontCartUi(
      injectEcommerceHeroResponsiveCss(preview.files['index.html'] ?? ''),
      { workspace },
    )
    writeFile(workspace, 'index.html', homepage)
    sessionCtx.signalHomepageReady()
  }

  void brandProfilePromise.then((profile) => {
    if (!profile?.logo) return
    const tryStitch = (attempt = 0) => {
      try {
        const updated = applyBrandLogoToSiteSpec(siteSpec, profile)
        const themed = applyBrandPaletteToSiteSpec(siteSpec, profile)
        if (updated || themed) {
          saveSiteSpec(workspace, siteSpec)
          renderPreviewToWorkspace(siteSpec, workspace, sessionCtx)
        }
        const logoInjected = injectBrandLogoIntoHomepageHtml(workspace, profile)
        const paletteInjected = injectBrandPaletteIntoHomepageHtml(workspace, profile)
        if (logoInjected || paletteInjected) {
          sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
          return
        }
        if (attempt < 6) setTimeout(() => tryStitch(attempt + 1), 450)
      } catch (e) {
        _log(`  brand-logo: rerender failed — ${e?.message || 'error'}`)
      }
    }
    tryStitch(0)
  })
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
    brandProfileCached?.verified ? brandProfileCached : null,
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
      try {
        const medusaResult = await syncProductsToMedusa(siteSpec.ecommerce.products, { workspace })
        _status(
          `Cargo synced: ${medusaResult.synced} unit(s) to station${medusaResult.errors.length ? ` (${medusaResult.errors.length} drift)` : ''}`,
          'medusa_sync',
        )
        if (
          homepage &&
          medusaResult?.byTitle &&
          Object.keys(medusaResult.byTitle).length &&
          existsSync(join(workspace, 'index.html'))
        ) {
          let h = readFileSync(join(workspace, 'index.html'), 'utf8')
          h = injectMedusaVariantDataAttributes(h, medusaResult.byTitle)
          h = stripStorefrontCartUi(h)
          h = injectStorefrontCartUi(h, { workspace, variantMap: medusaResult, force: true })
          homepage = h
          writeFile(workspace, 'index.html', homepage)
        }
      } catch (err) {
        console.warn(`medusa: catalog auto-sync skipped – ${err.message}`)
      }
    }
  }

  if (existsSync(join(workspace, 'index.html'))) {
    homepage = readFileSync(join(workspace, 'index.html'), 'utf8')
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
    void 0
  }
}

function readBrandProfileFromWorkspace(workspace) {
  try {
    const fp = join(workspace, 'brand-profile.json')
    if (!existsSync(fp)) return null
    const parsed = JSON.parse(readFileSync(fp, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function applyBrandLogoToSiteSpec(siteSpec, brandProfile) {
  if (!siteSpec?.pages?.length) return false
  const logo = brandProfile?.logo
  if (!logo || (logo.kind !== 'remote' && logo.kind !== 'svg')) return false
  const alt = String(
    logo.alt || `${brandProfile.officialName || brandProfile.requestedName || 'Brand'} logo`,
  )
  const payload =
    logo.kind === 'remote'
      ? { kind: 'remote', src: String(logo.src || ''), alt, provider: String(logo.provider || '') }
      : { kind: 'svg', svg: String(logo.svg || ''), alt, provider: String(logo.provider || '') }
  if (payload.kind === 'remote' && !payload.src) return false
  if (payload.kind === 'svg' && !payload.svg) return false

  let changed = false
  for (const page of siteSpec.pages || []) {
    for (const section of page.sections || []) {
      if (section.type !== 'navbar' && section.type !== 'footer') continue
      const styling = section.styling && typeof section.styling === 'object' ? section.styling : {}
      const existing =
        styling.brandLogo && typeof styling.brandLogo === 'object' ? styling.brandLogo : null
      const same =
        existing &&
        existing.kind === payload.kind &&
        (payload.kind === 'remote' ? existing.src === payload.src : existing.svg === payload.svg)
      if (same) continue
      section.styling = { ...styling, brandLogo: payload }
      changed = true
    }
  }
  return changed
}

function resolveBrandCanvasLight({ brandName = '', primary = '', siteSpec } = {}) {
  const name = String(brandName || '')
  if (/\b(psu|government|ministry|department|authority|limited|ltd)\b/i.test(name)) return true
  if (
    /\b(instacart|grocery|groceries|supermarket|food\s*delivery|meal\s*kit|walmart|target|farm\b|fresh\b|retail|marketplace)\b/i.test(
      name,
    )
  )
    return true
  const h = String(primary || '').trim().replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(h)) {
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let hue = 0
    if (d !== 0) {
      hue =
        max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    }
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    const light = (max + min) / 2
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * light - 1))
    if (hue >= 80 && hue <= 165 && sat > 0.2 && light > 0.15) return true
  }
  const bg = String(siteSpec?.theme?.colors?.background || '').trim()
  return bg.startsWith('#f')
}

function applyBrandPaletteToSiteSpec(siteSpec, brandProfile) {
  const palette = brandProfile?.palette
  if (!siteSpec?.theme) siteSpec.theme = {}
  if (!siteSpec.theme.colors) siteSpec.theme.colors = {}
  if (!palette || palette.confidence == null) return false
  const confidence = Number(palette.confidence || 0)
  if (confidence < 0.75) return false
  const brand = {
    primary: String(palette.primary || '').trim(),
    secondary: String(palette.secondary || '').trim() || String(palette.primary || '').trim(),
    accent: String(palette.accent || '').trim() || String(palette.secondary || '').trim(),
  }
  if (!brand.primary || !/^#[0-9a-f]{6}$/i.test(brand.primary)) return false
  if (brand.secondary && !/^#[0-9a-f]{6}$/i.test(brand.secondary)) brand.secondary = brand.primary
  if (brand.accent && !/^#[0-9a-f]{6}$/i.test(brand.accent))
    brand.accent = brand.secondary || brand.primary

  const derive = (hex, { l, s } = {}) => {
    const h = String(hex || '')
      .trim()
      .replace('#', '')
    if (!/^[0-9a-f]{6}$/i.test(h)) return null
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let hue = 0
    if (d !== 0) {
      hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    }
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    const light = (max + min) / 2
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * light - 1))
    const ll = l == null ? light : l
    const ss = s == null ? sat : s
    const clamp01 = (v) => Math.max(0, Math.min(1, v))
    return { h: hue, s: clamp01(ss), l: clamp01(ll) }
  }

  const primaryHsl = derive(brand.primary)
  const isLight = resolveBrandCanvasLight({
    brandName: brandProfile?.officialName || brandProfile?.requestedName || '',
    primary: brand.primary,
    siteSpec,
  })
  const bg =
    primaryHsl &&
    `hsl(${primaryHsl.h} ${Math.round((isLight ? Math.max(0.08, primaryHsl.s * 0.18) : Math.max(0.1, primaryHsl.s * 0.22)) * 100)}% ${Math.round((isLight ? 0.97 : 0.06) * 100)}%)`
  const surface =
    primaryHsl &&
    `hsl(${primaryHsl.h} ${Math.round((isLight ? Math.max(0.08, primaryHsl.s * 0.14) : Math.max(0.1, primaryHsl.s * 0.18)) * 100)}% ${Math.round((isLight ? 0.995 : 0.11) * 100)}%)`
  const border =
    primaryHsl &&
    `hsl(${primaryHsl.h} ${Math.round((isLight ? Math.max(0.06, primaryHsl.s * 0.12) : Math.max(0.08, primaryHsl.s * 0.16)) * 100)}% ${Math.round((isLight ? 0.88 : 0.18) * 100)}%)`
  const text = isLight ? '#0b0b0b' : '#f4f4f5'
  const mutedText = isLight ? '#334155' : '#a1a1aa'

  const next = {
    primary: brand.primary,
    secondary: brand.secondary,
    accent: brand.accent,
    background: bg || siteSpec.theme.colors.background,
    surface: surface || siteSpec.theme.colors.surface,
    border: border || siteSpec.theme.colors.border,
    text,
    mutedText,
  }

  const existing = siteSpec.theme.colors || {}
  const changed =
    existing.primary !== next.primary ||
    existing.secondary !== next.secondary ||
    existing.accent !== next.accent ||
    existing.background !== next.background ||
    existing.surface !== next.surface ||
    existing.border !== next.border ||
    existing.text !== next.text ||
    existing.mutedText !== next.mutedText
  if (!changed) return false

  siteSpec.theme.colors = {
    ...existing,
    ...next,
  }
  if (!siteSpec.theme.tailwind) siteSpec.theme.tailwind = {}
  siteSpec.theme.tailwind = {
    ...siteSpec.theme.tailwind,
    primary: next.primary,
    secondary: next.secondary,
    accent: next.accent,
  }
  return true
}

function injectBrandLogoIntoHomepageHtml(workspace, brandProfile) {
  if (!brandProfile?.logo) return false
  const fp = join(workspace, 'index.html')
  if (!existsSync(fp)) return false
  const html = readFileSync(fp, 'utf8')
  const brandName = String(brandProfile.officialName || brandProfile.requestedName || '').trim()
  const next = injectBrandLogoIntoHtml(html, brandProfile.logo, brandName)
  if (!next || next === html) return false
  writeFile(workspace, 'index.html', next)
  return true
}

function injectBrandPaletteIntoHomepageHtml(workspace, brandProfile) {
  const palette = brandProfile?.palette
  if (!palette || Number(palette.confidence || 0) < 0.75) return false
  const fp = join(workspace, 'index.html')
  if (!existsSync(fp)) return false
  const themedPalette = buildDerivedBrandPalette(
    palette,
    brandProfile?.officialName || brandProfile?.requestedName || '',
  )
  const html = readFileSync(fp, 'utf8')
  const next = injectBrandPaletteIntoHtml(html, themedPalette)
  if (!next || next === html) return false
  writeFile(workspace, 'index.html', next)
  return true
}

function buildDerivedBrandPalette(palette, brandName = '', siteSpec = null) {
  const primary = String(palette?.primary || '').trim()
  const secondary = String(palette?.secondary || palette?.primary || '').trim()
  const accent = String(palette?.accent || palette?.secondary || palette?.primary || '').trim()
  const confidence = Number(palette?.confidence || 0)
  const clamp01 = (v) => Math.max(0, Math.min(1, v))
  const toHsl = (hex) => {
    const h = String(hex || '')
      .trim()
      .replace('#', '')
    if (!/^[0-9a-f]{6}$/i.test(h)) return null
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let hue = 0
    if (d !== 0) {
      hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    }
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    const light = (max + min) / 2
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * light - 1))
    return { h: hue, s: clamp01(sat), l: clamp01(light) }
  }
  const hsl = toHsl(primary) || toHsl(secondary) || toHsl(accent)
  const wantsLight = resolveBrandCanvasLight({ brandName, primary, siteSpec })
  const background =
    hsl &&
    `hsl(${hsl.h} ${Math.round(Math.max(0.1, hsl.s * (wantsLight ? 0.12 : 0.22)) * 100)}% ${Math.round(
      (wantsLight ? 0.985 : 0.06) * 100,
    )}%)`
  const surface =
    hsl &&
    `hsl(${hsl.h} ${Math.round(Math.max(0.08, hsl.s * (wantsLight ? 0.1 : 0.18)) * 100)}% ${Math.round(
      (wantsLight ? 0.995 : 0.11) * 100,
    )}%)`
  const border =
    hsl &&
    `hsl(${hsl.h} ${Math.round(Math.max(0.06, hsl.s * (wantsLight ? 0.08 : 0.16)) * 100)}% ${Math.round(
      (wantsLight ? 0.9 : 0.18) * 100,
    )}%)`
  const text = wantsLight ? '#0b0b0b' : '#f4f4f5'
  const mutedText = wantsLight ? '#334155' : '#a1a1aa'
  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    border,
    text,
    mutedText,
    confidence,
    provider: String(palette?.provider || ''),
  }
}

function injectBrandPaletteIntoHtml(html = '', palette) {
  if (!palette?.primary) return ''
  const primary = String(palette.primary || '').trim()
  const secondary = String(palette.secondary || palette.primary || '').trim()
  const accent = String(palette.accent || palette.secondary || palette.primary || '').trim()
  const vars = [
    ['--color-primary', primary],
    ['--color-secondary', secondary],
    ['--color-accent', accent],
    ['--color-background', String(palette.background || '').trim()],
    ['--color-surface', String(palette.surface || '').trim()],
    ['--color-border', String(palette.border || '').trim()],
    ['--color-text', String(palette.text || '').trim()],
    ['--color-muted', String(palette.mutedText || palette.muted || '').trim()],
  ]
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}:${String(v).trim()}`)
    .join(';')
  if (!vars) return ''
  const style = `<style id="sf-brand-palette">:root{${vars}}</style>`
  if (/<style[^>]+id=["']sf-brand-palette["']/i.test(html)) return ''
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${style}</head>`)
  return `${style}\n${html}`
}

function injectBrandLogoIntoHtml(html = '', logo, brandName = '') {
  const kind = logo?.kind
  if (kind !== 'remote' && kind !== 'svg') return ''
  const src =
    kind === 'remote' ? String(logo.src || '').trim() : svgToDataUri(String(logo.svg || '').trim())
  if (!src) return ''
  if (/\bbrand-logo\b/i.test(html)) return ''
  const img = `<span class="brand-logo"><img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(
    String(logo.alt || 'Company logo'),
  )}" decoding="async" loading="eager" /></span>`
  let patched = html.replace(
    /<a([^>]*\bclass=["'][^"']*\bbrand\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/i,
    (_m, attrs, inner) => `<a${attrs}>${img}<span class="brand-name">${inner}</span></a>`,
  )
  if (patched === html) {
    patched = html.replace(
      /<(div|span)([^>]*\bclass=["'][^"']*\bbrand\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/i,
      (_m, tag, attrs, inner) =>
        `<${tag}${attrs}>${img}<span class="brand-name">${inner}</span></${tag}>`,
    )
  }
  if (patched === html && brandName) {
    const safe = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    patched = html.replace(/<header\b[\s\S]*?<\/header>/i, (header) =>
      header.replace(
        new RegExp(`>(\\s*${safe}\\s*)<`, 'i'),
        (_mm, t) => `>${img}<span class="brand-name">${t}</span><`,
      ),
    )
  }
  if (patched === html) return ''
  const style =
    '<style>.brand{display:inline-flex;align-items:center;gap:.9rem;min-height:3.5rem}.brand-logo{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;max-width:280px}.brand-logo img,.brand-logo svg{height:72px;width:auto;display:block}.brand-name{white-space:nowrap;font-weight:800;letter-spacing:-0.01em}</style>'
  if (/<\/head>/i.test(patched) && !/\.brand-logo\{/i.test(patched)) {
    return patched.replace(/<\/head>/i, `${style}</head>`)
  }
  return patched
}

function svgToDataUri(svg = '') {
  const raw = String(svg || '').trim()
  if (!raw) return ''
  const compact = raw.replace(/\s+/g, ' ').trim()
  const encoded = encodeURIComponent(compact)
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

function escapeHtmlAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
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
