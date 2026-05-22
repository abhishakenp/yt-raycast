import { buildAppIslandPrompt, buildVerticalDocPrompt, BUILDER_SYSTEM } from './contracts.js'
import { completeGeminiTiny } from './gemini.js'
import { completeGroq } from './groq.js'
import { normalizeSeed } from './hash.js'
import { planPageGenome } from './planner.js'
import { buildRunVariety, selectAnchorPair } from './router.js'
import { composeAppShellHtml, parseIslandJson } from './shell.js'
import { ensureMinimumVerticalSections, looksLikeBadLeg, sanitizeFragment, sanitizeHtml } from './postprocess.js'
import { runDeterministicAudits } from './audits.js'

async function buildVerticalDoc({ brief, plan, route, variety, llm }) {
  const prompt = buildVerticalDocPrompt(brief, plan, route, variety)
  let result = await llm({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.72,
    maxTokens: 7600,
    reasoningEffort: 'low',
  })
  let retryMs = 0
  if (looksLikeBadLeg(result.content)) {
    const retry = await llm({
      system: BUILDER_SYSTEM,
      prompt: `${prompt}\n\nPrevious attempt was empty/refusal/stub. Return a complete HTML document only.`,
      temperature: 0.58,
      maxTokens: 7600,
      reasoningEffort: 'low',
    })
    retryMs = retry.ms || 0
    if (!looksLikeBadLeg(retry.content)) result = retry
  }
  let html = sanitizeHtml(result.content, plan, route)
  const sectionCount = (html.match(/<section\b/gi) || []).length
  if (sectionCount < 6) {
    const retry = await llm({
      system: BUILDER_SYSTEM,
      prompt: `${prompt}\n\nPrevious attempt had only ${sectionCount} top-level content sections. Rebuild the full document with 6-9 substantial full-width <section class="w-full ..."> bands, closing every section before the next one. Return HTML only.`,
      temperature: 0.54,
      maxTokens: 7600,
      reasoningEffort: 'low',
    })
    retryMs += retry.ms || 0
    const retryHtml = sanitizeHtml(retry.content, plan, route)
    if (!looksLikeBadLeg(retry.content) && (retryHtml.match(/<section\b/gi) || []).length >= sectionCount) {
      result = retry
      html = retryHtml
    }
  }
  return {
    html: ensureMinimumVerticalSections(html, plan, 6, route),
    metrics: {
      buildMode: 'vertical-doc-single-gpt',
      buildMs: (result.ms || 0) + retryMs,
      builderModel: result.model || null,
      outputTokens: result.outputTokens || 0,
      tps: result.tps || 0,
      retried: retryMs > 0,
    },
  }
}

async function maybeGeminiIdentity({ brief, plan, route, enabled }) {
  if (!enabled) return { identity: '', metrics: { geminiIdentityMs: 0, geminiIdentityModel: null } }
  try {
    const result = await completeGeminiTiny({
      prompt: `Create only a tiny inner HTML fragment for the first status/identity strip of this deterministic app shell. No script, no style, no body, no outer shell. Brief: ${brief}. Archetype: ${plan.archetype}. Anchor: ${route.primary?.app}. Palette: ${JSON.stringify(plan.visualWorld)}.`,
      temperature: 0.45,
      maxOutputTokens: 700,
    })
    return {
      identity: sanitizeFragment(result.content),
      metrics: { geminiIdentityMs: result.ms || 0, geminiIdentityModel: result.model || null },
    }
  } catch (error) {
    return {
      identity: '',
      metrics: { geminiIdentityMs: 0, geminiIdentityModel: null, geminiIdentityError: error.message },
    }
  }
}

async function buildAppShell({ brief, plan, route, variety, llm, useGeminiIdentity = false }) {
  const islandPromise = llm({
    system: BUILDER_SYSTEM,
    prompt: buildAppIslandPrompt(brief, plan, route, variety),
    temperature: 0.62,
    maxTokens: 3600,
    reasoningEffort: 'low',
    responseFormat: { type: 'json_object' },
  }).catch(() => llm({
    system: BUILDER_SYSTEM,
    prompt: `${buildAppIslandPrompt(brief, plan, route, variety)}\n\nReturn valid JSON only, with quoted fragment strings. No markdown.`,
    temperature: 0.48,
    maxTokens: 3600,
    reasoningEffort: 'low',
  }))
  const [islandResult, geminiIdentity] = await Promise.all([
    islandPromise,
    maybeGeminiIdentity({ brief, plan, route, enabled: useGeminiIdentity }),
  ])
  const islands = parseIslandJson(islandResult.content) || {}
  if (geminiIdentity.identity) islands.identity = geminiIdentity.identity
  return {
    html: sanitizeHtml(composeAppShellHtml({ brief, plan, route, islands }), plan, route),
    metrics: {
      buildMode: 'app-shell-deterministic-frame',
      buildMs: islandResult.ms || 0,
      builderModel: islandResult.model || null,
      outputTokens: islandResult.outputTokens || 0,
      tps: islandResult.tps || 0,
      ...geminiIdentity.metrics,
    },
  }
}

export async function generateGptHomepage(brief, opts = {}) {
  if (!brief || String(brief).trim().length < 8) {
    throw new Error('brief must be a substantive project description')
  }
  const seed = normalizeSeed(opts.seed)
  const llm = opts.llm || completeGroq
  const startedAt = Date.now()

  const route = selectAnchorPair(brief, { seed })
  const variety = buildRunVariety(brief, seed)
  const planResult = opts.plan
    ? { plan: opts.plan, rawPlan: opts.plan, plannerMs: 0, plannerModel: 'provided' }
    : await planPageGenome({ brief, route, variety, llm })
  const plan = opts.forcePageKind ? { ...planResult.plan, pageKind: opts.forcePageKind } : planResult.plan

  const built = plan.pageKind === 'app-shell'
    ? await buildAppShell({
      brief,
      plan,
      route,
      variety,
      llm,
      useGeminiIdentity: opts.useGeminiIdentity === true,
    })
    : await buildVerticalDoc({ brief, plan, route, variety, llm })

  const audits = runDeterministicAudits(built.html, { plan, route, seed, brief })
  const wall = Date.now() - startedAt

  return {
    html: built.html,
    plan,
    route,
    metrics: {
      wall,
      chars: built.html.length,
      seed,
      plannerMs: planResult.plannerMs,
      plannerModel: planResult.plannerModel,
      anchor: route.primary?.app || null,
      secondaryAnchor: route.secondary?.app || null,
      siteHint: route.siteHint,
      pageKind: plan.pageKind,
      palette: `${plan.visualWorld.bg}/${plan.visualWorld.accent}`,
      fonts: `${plan.visualWorld.fontDisplay}+${plan.visualWorld.fontBody}`,
      under20s: wall < 20000,
      ...built.metrics,
    },
    audits,
  }
}
