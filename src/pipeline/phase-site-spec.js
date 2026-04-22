import {
  SHIP_FAST_SITE_SPEC_ENRICH,
  SITE_SPEC_ENRICH_MODEL,
  SITE_SPEC_MODEL,
} from '../config.js'
import { groq } from '../llm/groq.js'
import { formatTps } from '../llm/utils.js'
import { parseJson } from './workspace.js'
import { normalizeSiteSpec, saveSiteSpec, validateSiteSpec } from '../spec/index.js'
import { buildFallbackSiteSpec, buildFallbackThinSiteSpec, SITE_SPEC_VERSION } from '../spec/defaults.js'
import { siteSpecExpandPrompt, siteSpecPrompt, thinSiteSpecPrompt } from '../prompts/site-spec.js'
import { contentPlanPromptAppendix } from '../prompts/content-refs.js'
import { resolveContentPlanRef } from '../prompts/resolve-content-plan-ref.js'
import { resolveDesignRef } from '../prompts/resolve-design-ref.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'
import { sanitizeSiteSpec } from '../contracts/contracts.js'
import { repairThemeColors } from '../spec/theme-contrast.js'
import { reconcileExpandedSiteSpec } from '../spec/reconcile-expanded-spec.js'
import { shouldExpandVagueMarketing } from '../prompts/vague-marketing-brief.js'

function applyPlanResolutionToSpec(spec, contentPlanResolution, archetypePresetKey) {
  if (!spec || !contentPlanResolution) return spec
  const pm = spec.planMeta && typeof spec.planMeta === 'object' ? spec.planMeta : {}
  return {
    ...spec,
    planMeta: {
      ...pm,
      schemaRevision: pm.schemaRevision || SITE_SPEC_VERSION,
      contentRefId: contentPlanResolution.refId || pm.contentRefId || '',
      contentRefStashName: contentPlanResolution.stashName || pm.contentRefStashName || '',
      archetypePresetKey: archetypePresetKey || pm.archetypePresetKey || '',
      resolutionReason: contentPlanResolution.reason || pm.resolutionReason || '',
    },
  }
}

async function maybeEnrichSiteSpec(spec, { prompt, ctx, designBrief, siteType, contentPlanRef, log }) {
  if (!SHIP_FAST_SITE_SPEC_ENRICH || !SITE_SPEC_ENRICH_MODEL) return spec
  const ctxPayload = { prompt, ctx, designBrief, siteType }
  const appendix = contentPlanPromptAppendix(contentPlanRef)
  const user = `Enrich this site specification JSON. Output ONLY valid JSON. Preserve every page id, route, and section id and type. Add or improve planMeta.qualityChecklist, page pageRole and contentGoals, section contentBlocks, and expand thin items arrays (aim for >=3 items in features, testimonials, pricing, blog-list when those section types appear). Do not remove or empty ecommerce product data. Keep "version": "${SITE_SPEC_VERSION}".\n\nUser intent (truncated):\n${String(prompt).slice(0, 900)}\n\nSpec:\n${JSON.stringify(spec)}${appendix}`
  const result = await groq(user, {
    system:
      'You output only valid JSON. No markdown fences. No commentary. The object must match the Ship Fast site spec shape.',
    temperature: 0.15,
    maxTokens: 16000,
    model: SITE_SPEC_ENRICH_MODEL,
    responseFormat: { type: 'json_object' },
  })
  if (result.error) {
    log(`  site-spec enrich: model error — ${result.error}`)
    return spec
  }
  const parsed = parseJson(cleanJsonContent(result.content))
  if (!parsed) {
    log('  site-spec enrich: JSON parse failed — keeping prior spec')
    return spec
  }
  const normalized = normalizeSiteSpec(parsed, ctxPayload)
  const validation = validateSiteSpec(normalized)
  if (!validation.valid) {
    log(`  site-spec enrich: validation failed — ${validation.errors.join(' | ')}`)
    return spec
  }
  log('  site-spec: enrich pass applied')
  return normalized
}

function cleanJsonContent(text = '') {
  return String(text)
    .replace(/<\|stats\|>[\s\S]*?<\/\|stats\|>/g, '')
    .trim()
}

function logValidation(log, label, errors) {
  if (!errors.length) return
  log(`  ⚠️  ${label}: ${errors.join(' | ')}`)
}

function withSpecPhase(spec, phase) {
  if (!spec || typeof spec !== 'object') return spec
  const pm = spec.planMeta && typeof spec.planMeta === 'object' ? spec.planMeta : {}
  return { ...spec, planMeta: { ...pm, specPhase: phase } }
}

export async function generateThinSiteSpec({
  prompt,
  ctx,
  designBrief,
  siteType,
  workspace,
  log,
  brandProfile = null,
  contentPlanResolution = null,
  archetypePresetKey = '',
}) {
  const fallback = buildFallbackThinSiteSpec({ prompt, ctx, designBrief, siteType })
  const attempts = []
  let parsed = null
  let normalized = null
  let validation = { valid: false, errors: [] }
  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const vagueMarketingBoost = shouldExpandVagueMarketing(prompt, siteType)
  if (vagueMarketingBoost) log('  site-spec thin: vague-prompt density boost (features/metrics/pricing/FAQ in JSON)')
  for (let attempt = 0; attempt < 2; attempt++) {
    const promptBlock = thinSiteSpecPrompt({
      prompt,
      ctx,
      designBrief,
      fallbackSpec: fallback,
      brandProfile,
      hasUserDesignReferences,
      contentPlanRef: contentPlanResolution?.contentPlanRef ?? null,
      archetypePresetKey,
      vagueMarketingBoost,
    })
    const result = await groq(promptBlock.user, {
      system: promptBlock.system,
      temperature: promptBlock.temperature,
      maxTokens: promptBlock.maxTokens,
      model: SITE_SPEC_MODEL,
      responseFormat: { type: 'json_object' },
    })
    attempts.push(result)
    parsed = parseJson(cleanJsonContent(result.content))
    normalized = normalizeSiteSpec(parsed, { prompt, ctx, designBrief, siteType })
    validation = validateSiteSpec(normalized)
    if (parsed && validation.valid) break
    log(`  site-spec thin: attempt ${attempt + 1} invalid`)
    if (result.error) log(`  site-spec thin: model error — ${result.error}`)
    logValidation(log, 'site-spec thin validation', validation.errors)
  }

  const ctxPayload = { prompt, ctx, designBrief, siteType }
  const finalSpecSanitized =
    sanitizeSiteSpec(
      validation.valid
        ? normalized
        : normalizeSiteSpec(fallback, ctxPayload),
      { projectName: 'Project', prompt },
      {
        fallbackOnInvalid: true,
        fallback: normalizeSiteSpec(fallback, ctxPayload),
      },
    ).spec || normalizeSiteSpec(fallback, ctxPayload)

  let finalSpec =
    finalSpecSanitized?.theme
      ? {
          ...finalSpecSanitized,
          theme: repairThemeColors({ ...finalSpecSanitized.theme }, fallback),
        }
      : finalSpecSanitized

  if (!validation.valid) {
    log('  site-spec thin: using fallback thin spec')
    logValidation(log, 'site-spec thin final', validation.errors)
  }

  finalSpec = applyPlanResolutionToSpec(finalSpec, contentPlanResolution, archetypePresetKey)
  finalSpec = withSpecPhase(finalSpec, 'thin')

  const totals = attempts.reduce(
    (acc, result) => {
      acc.inputTokens += result?.inputTokens ?? 0
      acc.outputTokens += result?.outputTokens ?? 0
      acc.cost += result?.cost ?? 0
      return acc
    },
    { inputTokens: 0, outputTokens: 0, cost: 0 },
  )

  const tpsStr = formatTps(attempts.at(-1)) ? ` | ${formatTps(attempts.at(-1))}` : ''
  log(`  site-spec thin: ${finalSpec.pages?.length ?? 0} page(s) (pass A)${tpsStr}`)

  return {
    siteSpec: finalSpec,
    ...totals,
  }
}

export async function expandSiteSpecFromThin({
  thinSpec,
  prompt,
  ctx,
  designBrief,
  siteType,
  workspace,
  log,
  brandProfile = null,
  contentPlanResolution = null,
  archetypePresetKey = '',
}) {
  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const attempts = []
  let parsed = null
  let normalized = null
  let validation = { valid: false, errors: [] }
  const fallbackFull = buildFallbackSiteSpec({ prompt, ctx, designBrief, siteType })

  for (let attempt = 0; attempt < 2; attempt++) {
    const promptBlock = siteSpecExpandPrompt({
      prompt,
      ctx,
      designBrief,
      thinSpecJson: thinSpec,
      contentPlanRef: contentPlanResolution?.contentPlanRef ?? null,
      archetypePresetKey,
      hasUserDesignReferences,
    })
    const result = await groq(promptBlock.user, {
      system: promptBlock.system,
      temperature: promptBlock.temperature,
      maxTokens: promptBlock.maxTokens,
      model: SITE_SPEC_MODEL,
      responseFormat: { type: 'json_object' },
    })
    attempts.push(result)
    parsed = parseJson(cleanJsonContent(result.content))
    normalized = normalizeSiteSpec(parsed, { prompt, ctx, designBrief, siteType })
    normalized = reconcileExpandedSiteSpec(thinSpec, normalized, log)
    validation = validateSiteSpec(normalized)
    if (parsed && validation.valid) break
    log(`  site-spec expand: attempt ${attempt + 1} invalid`)
    if (result.error) log(`  site-spec expand: model error — ${result.error}`)
    logValidation(log, 'site-spec expand validation', validation.errors)
  }

  if (!validation.valid) {
    log('  site-spec expand: falling back to monolithic site spec generation')
    return generateSiteSpec({
      prompt,
      ctx,
      designBrief,
      siteType,
      workspace,
      log,
      brandProfile,
      contentPlanResolution,
      archetypePresetKey,
    })
  }

  const ctxPayload = { prompt, ctx, designBrief, siteType }
  const finalSpecSanitized =
    sanitizeSiteSpec(normalized, { projectName: 'Project', prompt }, {
      fallbackOnInvalid: true,
      fallback: normalizeSiteSpec(fallbackFull, ctxPayload),
    }).spec || normalized

  let finalSpec =
    finalSpecSanitized?.theme
      ? {
          ...finalSpecSanitized,
          theme: repairThemeColors({ ...finalSpecSanitized.theme }, fallbackFull),
        }
      : finalSpecSanitized

  finalSpec = applyPlanResolutionToSpec(finalSpec, contentPlanResolution, archetypePresetKey)
  finalSpec = withSpecPhase(finalSpec, 'full')
  finalSpec = await maybeEnrichSiteSpec(finalSpec, {
    prompt,
    ctx,
    designBrief,
    siteType,
    contentPlanRef: contentPlanResolution?.contentPlanRef ?? null,
    log,
  })
  finalSpec = applyPlanResolutionToSpec(finalSpec, contentPlanResolution, archetypePresetKey)
  finalSpec = withSpecPhase(finalSpec, 'full')

  saveSiteSpec(workspace, finalSpec)

  const totals = attempts.reduce(
    (acc, result) => {
      acc.inputTokens += result?.inputTokens ?? 0
      acc.outputTokens += result?.outputTokens ?? 0
      acc.cost += result?.cost ?? 0
      return acc
    },
    { inputTokens: 0, outputTokens: 0, cost: 0 },
  )

  const tpsStr = formatTps(attempts.at(-1)) ? ` | ${formatTps(attempts.at(-1))}` : ''
  log(`  site-spec expand: ${finalSpec.pages.length} pages (pass B)${tpsStr}`)

  return {
    siteSpec: finalSpec,
    ...totals,
  }
}

export async function generateSiteSpec({
  prompt,
  ctx,
  designBrief,
  siteType,
  workspace,
  log,
  brandProfile = null,
  contentPlanResolution = null,
  archetypePresetKey = '',
}) {
  const fallback = buildFallbackSiteSpec({ prompt, ctx, designBrief, siteType })
  const attempts = []
  let parsed = null
  let normalized = null
  let validation = { valid: false, errors: [] }

  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  for (let attempt = 0; attempt < 2; attempt++) {
    const promptBlock = siteSpecPrompt({
      prompt,
      ctx,
      designBrief,
      fallbackSpec: fallback,
      brandProfile,
      mode: 'generate',
      hasUserDesignReferences,
      contentPlanRef: contentPlanResolution?.contentPlanRef ?? null,
      archetypePresetKey,
    })
    const result = await groq(promptBlock.user, {
      system: promptBlock.system,
      temperature: promptBlock.temperature,
      maxTokens: promptBlock.maxTokens,
      model: SITE_SPEC_MODEL,
      responseFormat: { type: 'json_object' },
    })
    attempts.push(result)

    const cleaned = cleanJsonContent(result.content)
    parsed = parseJson(cleaned)
    normalized = normalizeSiteSpec(parsed, { prompt, ctx, designBrief, siteType })
    validation = validateSiteSpec(normalized)

    if (parsed && validation.valid) break
    log(`  site-spec: attempt ${attempt + 1} returned invalid structured output`)
    if (result.error) log(`  site-spec: model error — ${result.error}`)
    if (!parsed) log(`  site-spec: JSON parsing failed on attempt ${attempt + 1}`)
    logValidation(log, 'site-spec validation', validation.errors)
  }

  const finalSpecSanitized =
    sanitizeSiteSpec(
      validation.valid
        ? normalized
        : normalizeSiteSpec(fallback, { prompt, ctx, designBrief, siteType }),
      { projectName: 'Project', prompt },
      {
        fallbackOnInvalid: true,
        fallback: normalizeSiteSpec(fallback, { prompt, ctx, designBrief, siteType }),
      },
    ).spec || normalizeSiteSpec(fallback, { prompt, ctx, designBrief, siteType })

  let finalSpec =
    finalSpecSanitized?.theme
      ? {
          ...finalSpecSanitized,
          theme: repairThemeColors({ ...finalSpecSanitized.theme }, fallback),
        }
      : finalSpecSanitized

  if (!validation.valid) {
    log('  site-spec: falling back to normalized default site spec')
    logValidation(log, 'site-spec final validation', validation.errors)
  }

  finalSpec = applyPlanResolutionToSpec(finalSpec, contentPlanResolution, archetypePresetKey)
  finalSpec = await maybeEnrichSiteSpec(finalSpec, {
    prompt,
    ctx,
    designBrief,
    siteType,
    contentPlanRef: contentPlanResolution?.contentPlanRef ?? null,
    log,
  })
  finalSpec = applyPlanResolutionToSpec(finalSpec, contentPlanResolution, archetypePresetKey)

  saveSiteSpec(workspace, finalSpec)

  const totals = attempts.reduce(
    (acc, result) => {
      acc.inputTokens += result?.inputTokens ?? 0
      acc.outputTokens += result?.outputTokens ?? 0
      acc.cost += result?.cost ?? 0
      return acc
    },
    { inputTokens: 0, outputTokens: 0, cost: 0 },
  )

  const tpsStr = formatTps(attempts.at(-1)) ? ` | ${formatTps(attempts.at(-1))}` : ''
  log(`  site-spec.json: ${finalSpec.pages.length} pages, ${finalSpec.forms.length} forms${tpsStr}`)

  return {
    siteSpec: finalSpec,
    ...totals,
  }
}

export async function updateSiteSpecFromPrompt({ prompt, currentSpec, workspace, log }) {
  const baseSpec = currentSpec || buildFallbackSiteSpec({ prompt })
  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const editPlan = resolveContentPlanRef({
    prompt,
    siteType: baseSpec.siteType,
    businessProfile: baseSpec.businessProfile,
    workspace,
    respectWorkspaceOverride: true,
  })
  const editDesign = resolveDesignRef({
    prompt,
    siteType: baseSpec.siteType,
    businessProfile: baseSpec.businessProfile,
    workspace,
    respectWorkspaceOverride: true,
  })
  const promptBlock = siteSpecPrompt({
    prompt: `Update the existing site spec using this edit request:\n${prompt}\n\nCurrent site spec:\n${JSON.stringify(baseSpec, null, 2)}`,
    ctx: {
      project_name: baseSpec.projectName,
      slug: baseSpec.slug,
      site_type: baseSpec.siteType,
      pages: baseSpec.pages.map((page) => page.name),
      features: baseSpec.backendFeatureHints,
      mood: baseSpec.theme?.mood,
      typography: baseSpec.theme?.typography?.body,
    },
    designBrief: JSON.stringify(baseSpec.theme, null, 2),
    fallbackSpec: baseSpec,
    mode: 'edit',
    hasUserDesignReferences,
    contentPlanRef: editPlan.contentPlanRef,
    archetypePresetKey: editDesign.presetKey,
  })

  const result = await groq(promptBlock.user, {
    system: promptBlock.system,
    temperature: promptBlock.temperature,
    maxTokens: promptBlock.maxTokens,
    model: SITE_SPEC_MODEL,
    responseFormat: { type: 'json_object' },
  })

  const parsed = parseJson(cleanJsonContent(result.content))
  const normalized = normalizeSiteSpec(parsed || baseSpec, {
    prompt: baseSpec.userPrompt,
    ctx: {
      project_name: baseSpec.projectName,
      slug: baseSpec.slug,
      site_type: baseSpec.siteType,
      pages: baseSpec.pages.map((page) => page.name),
      features: baseSpec.backendFeatureHints,
      mood: baseSpec.theme?.mood,
    },
    designBrief: JSON.stringify(baseSpec.theme, null, 2),
    siteType: baseSpec.siteType,
  })
  const validation = validateSiteSpec(normalized)

  if (!validation.valid) {
    log(`  site-spec edit validation failed: ${validation.errors.join(' | ')}`)
  }

  const baseInputSpec = validation.valid ? normalized : normalizeSiteSpec(baseSpec, { prompt })
  const finalSpecSanitized =
    sanitizeSiteSpec(
      baseInputSpec,
      { projectName: 'Project', prompt },
      {
        fallbackOnInvalid: true,
        fallback: baseSpec,
      },
    ).spec || normalizeSiteSpec(baseSpec, { prompt })
  let finalSpec =
    finalSpecSanitized?.theme
      ? {
          ...finalSpecSanitized,
          theme: repairThemeColors({ ...finalSpecSanitized.theme }, baseSpec),
        }
      : finalSpecSanitized
  finalSpec = applyPlanResolutionToSpec(finalSpec, editPlan, editDesign.presetKey)
  finalSpec = await maybeEnrichSiteSpec(finalSpec, {
    prompt: baseSpec.userPrompt,
    ctx: {
      project_name: baseSpec.projectName,
      slug: baseSpec.slug,
      site_type: baseSpec.siteType,
      pages: baseSpec.pages.map((page) => page.name),
      features: baseSpec.backendFeatureHints,
      mood: baseSpec.theme?.mood,
    },
    designBrief: JSON.stringify(baseSpec.theme, null, 2),
    siteType: baseSpec.siteType,
    contentPlanRef: editPlan.contentPlanRef,
    log,
  })
  finalSpec = applyPlanResolutionToSpec(finalSpec, editPlan, editDesign.presetKey)
  saveSiteSpec(workspace, finalSpec)
  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  site-spec edit: ${finalSpec.pages.length} pages restructured${tpsStr}`)

  return {
    siteSpec: finalSpec,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
