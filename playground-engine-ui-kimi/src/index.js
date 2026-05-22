import { composeAppShell } from './composers/app-shell.js'
import { composeEditorial } from './composers/editorial.js'
import { composeGallery } from './composers/gallery.js'
import { FAST_MODE } from './utils/contracts.js'
import { composeVerticalDoc } from './composers/vertical-doc.js'
import { injectAmbientStyles } from './media/ambient-effects.js'
import { completeGroq } from './llm/groq.js'
import { planPageGenome } from './planner.js'
import { runDeterministicAudits } from './quality/audits.js'
import { buildRunVariety, selectAnchorPair } from './router.js'
import { normalizeSeed } from './utils/hash.js'
import { sanitizeHtml } from './utils/postprocess.js'
import { validateStitchedHtml } from './utils/seam-repair.js'

export { scoreKimiReadiness } from './quality/kimi-score.js'
export { compareSignatures, varietyDistance, detectVisualSignature } from './quality/variety-metrics.js'
export { runDeterministicAudits } from './quality/audits.js'

function pickComposer(plan, route, grammar) {
  if (plan.pageKind === 'app-shell') {
    return (args) => composeAppShell({
      ...args,
      mode: process.env.KIMI_APP_SHELL_MODE || 'gemini-full',
    })
  }
  if (route.siteHint === 'editorial' && grammar?.id?.startsWith('editorial')) {
    return composeEditorial
  }
  if (route.siteHint === 'blog') {
    return composeEditorial
  }
  if (route.siteHint === 'portfolio' && grammar?.id === 'gallery-masonry') {
    return composeGallery
  }
  return composeVerticalDoc
}

export async function generateKimiHomepage(brief, opts = {}) {
  if (!brief || String(brief).trim().length < 8) {
    throw new Error('brief must be a substantive project description')
  }
  const seed = normalizeSeed(opts.seed)
  const llm = opts.llm || completeGroq
  const startedAt = Date.now()

  const route = selectAnchorPair(brief, { seed })
  const variety = buildRunVariety(brief, seed)
  const grammar = route.grammar

  const planResult = opts.plan
    ? { plan: opts.plan, plannerMs: 0, plannerModel: 'provided' }
    : await planPageGenome({ brief, route, variety, grammar, llm })

  const plan = { ...planResult.plan, brief, grammarId: planResult.plan.grammarId || grammar.id }
  const compose = pickComposer(plan, route, grammar)
  const built = await compose({ brief, plan, route, variety, grammar })

  let html = injectAmbientStyles(sanitizeHtml(built.html, plan, route), plan.mediaStrategy?.treatment || variety.mediaTreatment)
  const stitchCheck = validateStitchedHtml(html)

  const audits = runDeterministicAudits(html, { plan, route, seed, brief })
  const wall = Date.now() - startedAt

  return {
    html,
    plan,
    route,
    variety,
    grammar,
    metrics: {
      wall,
      chars: html.length,
      seed,
      plannerMs: planResult.plannerMs,
      plannerModel: planResult.plannerModel,
      anchor: route.primary?.app || null,
      grammarId: grammar.id,
      pageKind: plan.pageKind,
      palette: `${plan.visualWorld.bg}/${plan.visualWorld.accent}`,
      fonts: `${plan.visualWorld.fontDisplay}+${plan.visualWorld.fontBody}`,
      treatment: plan.mediaStrategy?.treatment,
      under20s: wall < 20000,
      qualityMode: FAST_MODE ? 'fast-groq' : 'gemini-hybrid',
      kimiScore: audits.kimi.score,
      richnessScore: audits.richness.score,
      stitchOk: stitchCheck.ok,
      stitchIssues: stitchCheck.issues,
      ...built.metrics,
    },
    audits,
  }
}
