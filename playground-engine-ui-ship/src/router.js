import { categoryOfApp, listDnaAppNames, resolveAnchor, resolveDna } from './utils/dna.js'
import { pickSeeded, stableHash } from './utils/hash.js'
import { pickGrammar } from './grammars.js'

const APP_HINTS = {
  Linear: /issue|roadmap|project planning|workflow|kanban|sprint|product operations/i,
  Vercel: /deploy|frontend|next|hosting|edge|developer|build|preview|ship/i,
  Stripe: /payment|billing|checkout|invoice|fintech|marketplace|transaction/i,
  Sentry: /observability|error|incident|monitor|telemetry|uptime|trace/i,
  Figma: /design|prototype|brand|creative|collaboration|portfolio/i,
  Airbnb: /hotel|stay|travel|room|booking|hospitality|guest|coast/i,
  Glossier: /beauty|skincare|makeup|cosmetic|face oil/i,
  Headspace: /meditation|mindfulness|sleep|mental|sound bath|wellness/i,
  Spotify: /music|audio|label|artist|podcast|playlist|vinyl/i,
  Vogue: /fashion|editorial|magazine|lookbook|style|gallery/i,
  Posthog: /analytics|experiment|feature flag|product data|session replay/i,
}

const COOL_DEFAULTS = ['Linear', 'Vercel', 'Stripe', 'Notion', 'Figma', 'Sentry', 'Posthog']

const SITE_ANCHOR_ALLOWLIST = {
  'local-experience': ['Airbnb', 'Patagonia', 'Apple', 'Glossier', 'Headspace', 'Calm', 'Spotify', 'Vogue', 'MasterClass', 'Substack', 'Figma'],
  commerce: ['Glossier', 'Apple', 'Nike', 'Patagonia', 'Stripe', 'Airbnb', 'Vogue', 'Headspace', 'Calm', 'Spotify'],
  portfolio: ['Vogue', 'Substack', 'Apple', 'MasterClass', 'Spotify', 'Patagonia', 'Notion'],
  agency: ['Figma', 'Linear', 'Vercel', 'Notion', 'Apple', 'Vogue', 'MasterClass'],
  fitness: ['Nike', 'Headspace', 'Patagonia', 'Apple', 'Calm', 'Spotify'],
  wellness: ['Headspace', 'Calm', 'Glossier', 'Patagonia', 'Airbnb', 'MasterClass'],
  hotel: ['Airbnb', 'Patagonia', 'Apple', 'Vogue', 'MasterClass'],
  editorial: ['Substack', 'Vogue', 'NYT', 'Spotify', 'MasterClass', 'Patagonia', 'Apple'],
  blog: ['Substack', 'NYT', 'Vogue', 'MasterClass', 'Patagonia', 'Apple'],
  software: COOL_DEFAULTS,
  'ops-console': ['Linear', 'Sentry', 'Posthog', 'Vercel', 'OpenAI'],
}

export const VARIETY_AXES = {
  ground: ['near-black', 'high-key white', 'warm paper', 'saturated jewel', 'misty glass', 'raw editorial'],
  layoutGrammar: ['poster-grid', 'dense-product-surface', 'editorial-rhythm', 'catalog-wall', 'split-console', 'modular-bento', 'timeline-led'],
  proofRhythm: ['logo-strip', 'numbers-first', 'artifact-gallery', 'quote-led', 'table-proof', 'map-proof'],
  edgeLanguage: ['sharp hairlines', 'soft utility corners', 'brutalist blocks', 'rounded editorial cards', 'thin dividers', 'offset shadows'],
  motion: ['quiet reveal', 'ticker', 'counter pulse', 'hover parallax', 'static print-like', 'panel sweep'],
  contentStrategy: ['feature-forward', 'proof-forward', 'story-forward', 'catalog-forward', 'operator-forward'],
  mediaTreatment: ['grain-overlay', 'duotone-blocks', 'halftone-print', 'tape-sticker', 'clean-glass', 'hard-shadow'],
}

function scoreApp(brief, app) {
  const dna = resolveDna(app)
  const haystack = `${brief}\n${app}\n${dna?.layout || ''}\n${dna?.copy || ''}`.toLowerCase()
  let score = 0
  const hint = APP_HINTS[app]
  if (hint?.test(brief)) score += 8
  if (/saas|b2b|platform|developer|api|analytics|infrastructure|tool/i.test(brief) && COOL_DEFAULTS.includes(app)) score += 3
  if (/restaurant|butchery|coffee|cafe|food|skincare|hotel|music|label|studio|portfolio|agency|fitness|wellness|gallery|shop|store/i.test(brief)) {
    if (/Airbnb|Patagonia|Apple|Glossier|Headspace|Calm|Spotify|Vogue|MasterClass|Substack|Figma/.test(app)) score += 3
  }
  return score
}

/** Marketing landing briefs that mention dashboards as hero visuals — not operator consoles. */
export function isMarketingLandingBrief(brief) {
  const text = String(brief ?? '')
  if (/\blanding(?:\s+|-)?(?:page|homepage|site|website)\b/i.test(text)) return true
  if (/\bhomepage\b/i.test(text)) return true
  if (/\bmarketing (?:site|page|website|landing)\b/i.test(text)) return true
  if (/\binvestor-ready\b/i.test(text)) return true
  if (/\bhero section\b/i.test(text) && /\b(?:problem|solution|workflow|impact metrics|final cta)\s section/i.test(text)) {
    return true
  }
  if (/\bprimary cta\b/i.test(text) && /\b(?:secondary cta|final cta)\b/i.test(text)) return true
  if (/\bwhite[- ]background\b|\blight[- ]background\b|\bclean enterprise saas\b/i.test(text)) return true
  if (
    /\b(hospitality|hotel|resort|travel|bakery|restaurant|cafe|portfolio|storefront|shop|ecommerce|fitness|wellness|agency|publication)\b/i.test(
      text,
    ) &&
    /\b(landing|homepage|website|site|page|booking|showcase|reservation|tours)\b/i.test(text)
  ) {
    return true
  }
  return false
}

/** True operator-console briefs — NOT marketing pages that mention dashboards/monitors in passing. */
export function isOpsConsoleBrief(brief) {
  const text = String(brief ?? '').toLowerCase()
  if (isMarketingLandingBrief(brief)) return false
  if (/\b(operator console|ops console|control room|incident desk|fleet ops|teleoperation|noc dashboard|live operator)\b/.test(text)) {
    return true
  }
  if (/\b(admin console|ops dashboard|monitoring console|incident timeline)\b/.test(text)) return true
  return false
}

/** All public marketing front doors use the fast vertical-doc hero-combo path (<20s). */
export function isFrontDoorVerticalDoc(route, brief) {
  if (isMarketingLandingBrief(brief)) return true
  if (/\b(?:homepage|landing(?:\s|-)?(?:page|homepage|site))\b/i.test(String(brief ?? ''))) return true
  const hint = route?.siteHint
  if (hint && hint !== 'ops-console') return true
  if (hint === 'ops-console' && !isOpsConsoleBrief(brief)) return true
  return false
}

export function inferSiteHint(brief) {
  const text = String(brief ?? '').toLowerCase()
  if (/\bblog\b|\bblogs\b|\bnewsletter\b|\bsubstack\b|\bpost archive\b/.test(text)) return 'blog'
  if (/shop|store|ecommerce|online store|skincare|apparel|merch|record|zine|print/.test(text) || (/\bproducts?\b/.test(text) && !/product reviews?/.test(text))) return 'commerce'
  if (/\b(fitness|gym|hiit|crossfit|strength training|workout studio|class packs|drop-in rates)\b/.test(text)) return 'fitness'
  if (/\b(wellness|meditation|sound bath|mindfulness studio)\b/.test(text)) return 'wellness'
  if (/\b(boutique hotel|ocean-view rooms?|guest rooms?|cliffside|hospitality|luxury hospitality)\b/.test(text)) return 'hotel'
  if (/\b(travel|tours?|itinerary|temple stays|cherry blossom)\b/.test(text)) return 'local-experience'
  if (/\b(agency|creative studio|design agency|brand identity and digital)\b/.test(text) && !/\b(freelance|personal portfolio|my work)\b/.test(text)) return 'agency'
  if (/\b(personal portfolio|freelance (?:brand )?designer|my portfolio)\b/.test(text) || (/portfolio/.test(text) && !/agency/.test(text))) return 'portfolio'
  if (/restaurant|coffee|cafe|butchery|supper|booking|workshop/.test(text)) return 'local-experience'
  if (/music|label|event|editorial|magazine|publication/.test(text)) return 'editorial'
  if (isMarketingLandingBrief(brief)) return 'software'
  if (/saas|b2b|api|developer|platform|analytics/.test(text)) return 'software'
  if (isOpsConsoleBrief(brief)) return 'ops-console'
  return 'general'
}

function chooseFromScored(scored, seed, salt) {
  const sorted = [...scored].sort((a, b) => b.score - a.score || a.app.localeCompare(b.app))
  const topScore = sorted[0]?.score ?? 0
  const pool = sorted.filter((row) => row.score >= Math.max(0, topScore - 3)).slice(0, 12)
  return pickSeeded(pool.length ? pool : sorted.slice(0, 12), seed, salt)
}

export function selectAnchorPair(brief, { seed = 'default' } = {}) {
  const apps = listDnaAppNames()
  const siteHint = inferSiteHint(brief)
  const scored = apps.map((app) => ({ app, score: scoreApp(brief, app) }))
  const allowed = SITE_ANCHOR_ALLOWLIST[siteHint]
  const primaryPool = allowed?.length ? scored.filter((row) => allowed.includes(row.app)) : scored
  const primaryRow = chooseFromScored(primaryPool.length ? primaryPool : scored, seed, `primary:${siteHint}`)
    || { app: pickSeeded(COOL_DEFAULTS, seed, 'primary-default') }
  const primary = resolveAnchor({
    app: primaryRow.app,
    category: categoryOfApp(primaryRow.app),
  })

  const primaryCategory = primary?.category
  const secondaryCandidates = scored
    .filter((row) => row.app !== primary?.app)
    .filter((row) => categoryOfApp(row.app) !== primaryCategory || stableHash(`${seed}:${row.app}`) % 3 === 0)
    .sort((a, b) => b.score - a.score || a.app.localeCompare(b.app))
    .slice(0, 18)
  const secondaryRow = pickSeeded(secondaryCandidates, seed, `secondary:${primary?.app}`) || scored.find((row) => row.app !== primary?.app)
  const secondary = resolveAnchor({
    app: secondaryRow?.app,
    category: categoryOfApp(secondaryRow?.app),
  })

  const grammar = pickGrammar({ brief, siteHint, seed })

  return {
    seed,
    siteHint,
    primary,
    secondary,
    grammar,
    candidates: scored.sort((a, b) => b.score - a.score || a.app.localeCompare(b.app)).slice(0, 8),
  }
}

export function buildRunVariety(brief, seed) {
  const pick = (axis) => pickSeeded(VARIETY_AXES[axis], seed, `${axis}:${brief}`) || VARIETY_AXES[axis][0]
  return {
    fingerprint: stableHash(`${seed}:${brief}`).toString(16).padStart(8, '0'),
    ground: pick('ground'),
    layoutGrammar: pick('layoutGrammar'),
    proofRhythm: pick('proofRhythm'),
    edgeLanguage: pick('edgeLanguage'),
    motion: pick('motion'),
    contentStrategy: pick('contentStrategy'),
    mediaTreatment: pick('mediaTreatment'),
  }
}
