/**
 * Deterministic variation hints from seed + prompt (same NL prompt → different nudges).
 * @param {string | null | undefined} seed
 * @param {string} userPrompt
 * @returns {string} block appended to system prompt
 */
export function buildOpenUIVariationBlock(seed, userPrompt) {
  const base = `${String(seed || 'nosession')}|${String(userPrompt || '').slice(0, 240)}`
  let h = 2166136261
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u = h >>> 0
  const pick = (values, shift) => values[(u >>> shift) % values.length]
  const personas = ['balanced', 'airy', 'dense', 'bold']
  const persona = pick(personas, 0)
  const heroPick = (u >>> 3) % 2 === 0 ? 'EditorialHero' : 'SplitHero'
  const orders = [
    'hero → social proof → features → pricing/FAQ',
    'features → hero → metrics → pricing/FAQ',
    'metrics strip → hero → features → conversion',
  ]
  const editorialLayout = pick(['editorial', 'compact', 'spotlight'], 7)
  const pageRhythm = ['default', 'airy', 'dense', 'bold'][
    persona === 'balanced' ? 0 : persona === 'airy' ? 1 : persona === 'dense' ? 2 : 3
  ]
  const bentoMood = (u >>> 9) % 2 === 0 ? 'even' : 'spotlight-first'
  const fingerprint = ((u ^ (u >>> 16)) >>> 0).toString(16).padStart(8, '0').slice(0, 8)
  const omitPool = [
    'FAQBlock section',
    'TestimonialCard row',
    'MetricGrid strip above the fold',
    'PricingTier grid',
    'PromoBand footer strip',
  ]
  const omitHint = pick(omitPool, 11)
  const dashboardChrome = (u >>> 13) % 2 === 0 ? 'default' : 'minimal'

  return `
── VARIATION (session-specific; avoid generic clone layouts) ──
variationFingerprint: ${fingerprint} (anti-repeat id for this session+brief; do not echo to users)
visualPersona: ${persona}
pageShellVisualRhythm: ${pageRhythm} (optional on PageShell; omit if brief conflicts)
preferredHeroFamily: ${heroPick} when a marketing hero fits the brief
editorialHeroLayoutVariant: ${editorialLayout} when using EditorialHero
featureBentoGridMood: ${bentoMood}
sectionOrderHint: ${pick(orders, 5)}
dashboardShellChrome: ${dashboardChrome} when building DashboardShell
compositionHint: consider omitting ${omitHint} if the brief still feels complete — vary section subset across runs, not only props
rules:
- Same user brief may run again: honor this block so structure, styling hooks, and section subset differ from a default SaaS layout. Never pick a fixed page template id.
- Use allowed enum props only; never invent components or raw CSS.
`
}
