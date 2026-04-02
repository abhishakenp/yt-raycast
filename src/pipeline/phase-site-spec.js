import { groq } from '../llm/groq.js'
import { formatTps } from '../llm/utils.js'
import { parseJson } from './workspace.js'
import {
  buildFallbackSiteSpec,
  normalizeSiteSpec,
  saveSiteSpec,
  validateSiteSpec,
} from '../spec/index.js'
import { siteSpecPrompt } from '../prompts/site-spec.js'
import { sanitizeSiteSpec } from '../contracts/contracts.js'

function cleanJsonContent(text = '') {
  return String(text)
    .replace(/<\|stats\|>[\s\S]*?<\/\|stats\|>/g, '')
    .trim()
}

function logValidation(log, label, errors) {
  if (!errors.length) return
  log(`  ⚠️  ${label}: ${errors.join(' | ')}`)
}

export async function generateSiteSpec({ prompt, ctx, designBrief, siteType, workspace, log }) {
  const fallback = buildFallbackSiteSpec({ prompt, ctx, designBrief, siteType })
  const attempts = []
  let parsed = null
  let normalized = null
  let validation = { valid: false, errors: [] }

  for (let attempt = 0; attempt < 2; attempt++) {
    const promptBlock = siteSpecPrompt({
      prompt,
      ctx,
      designBrief,
      fallbackSpec: fallback,
      mode: 'generate',
    })
    const result = await groq(promptBlock.user, {
      system: promptBlock.system,
      temperature: promptBlock.temperature,
      maxTokens: promptBlock.maxTokens,
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

  const finalSpec =
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

  if (!validation.valid) {
    log('  site-spec: falling back to normalized default site spec')
    logValidation(log, 'site-spec final validation', validation.errors)
  }

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
  })

  const result = await groq(promptBlock.user, {
    system: promptBlock.system,
    temperature: promptBlock.temperature,
    maxTokens: promptBlock.maxTokens,
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
  const finalSpec =
    sanitizeSiteSpec(
      baseInputSpec,
      { projectName: 'Project', prompt },
      {
        fallbackOnInvalid: true,
        fallback: baseSpec,
      },
    ).spec || normalizeSiteSpec(baseSpec, { prompt })
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
