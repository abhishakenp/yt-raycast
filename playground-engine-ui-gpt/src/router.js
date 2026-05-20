import { categoryOfApp, listDnaAppNames, resolveAnchor, resolveDna } from './dna.js'
import { pickSeeded, stableHash } from './hash.js'

const APP_HINTS = {
  Linear: /issue|roadmap|project planning|workflow|kanban|sprint|product operations/i,
  Vercel: /deploy|frontend|next|hosting|edge|developer|build|preview|ship/i,
  Stripe: /payment|billing|checkout|invoice|fintech|marketplace|transaction/i,
  Sentry: /observability|error|incident|monitor|telemetry|uptime|trace/i,
  Cursor: /\b(code|editor|ai developer|agent|ide|programming)\b/i,
  GitHub: /\b(repository|developer platform|pull request|ci|open source)\b/i,
  Figma: /design|prototype|brand|creative|collaboration|portfolio/i,
  Notion: /workspace|docs|knowledge|notes|wiki|productivity/i,
  Airbnb: /hotel|stay|travel|room|booking|hospitality|guest|coast/i,
  Hopper: /\b(flight|fare|trip|travel app|booking app|fare prediction)\b/i,
  Patagonia: /outdoor|gear|sustainability|repair|climb|hike|nature/i,
  Apple: /hardware|device|luxury|consumer tech|personal computer|phone/i,
  Nike: /sport|training|athlete|shoe|fitness apparel|performance/i,
  Lululemon: /yoga|studio|fitness|training|wellness apparel/i,
  Glossier: /beauty|skincare|makeup|cosmetic|face oil/i,
  Headspace: /meditation|mindfulness|sleep|mental|sound bath|wellness/i,
  Calm: /meditation|sleep|relax|breathing|wellness/i,
  Spotify: /music|audio|label|artist|podcast|playlist|vinyl/i,
  Vogue: /fashion|editorial|magazine|lookbook|style|gallery/i,
  NYT: /news|journalism|editorial|publication|long-read|essay/i,
  Mercury: /banking|treasury|finance|startup bank|cash/i,
  Posthog: /analytics|experiment|feature flag|product data|session replay/i,
  Databricks: /data|lakehouse|warehouse|ml|analytics|intelligence/i,
  OpenAI: /ai model|research|assistant|agentic|llm|reasoning/i,
  Anthropic: /ai safety|research|assistant|model|frontier/i,
  MasterClass: /course|class|learn|education|workshop/i,
  Substack: /newsletter|writer|creator|publication|subscription/i,
}

const COOL_DEFAULTS = ['Linear', 'Vercel', 'Stripe', 'Notion', 'Figma', 'Sentry', 'Cursor', 'GitHub', 'Mercury', 'Posthog']

const SITE_ANCHOR_ALLOWLIST = {
  'local-experience': ['Airbnb', 'Hopper', 'Patagonia', 'Apple', 'Nike', 'Lululemon', 'Glossier', 'Headspace', 'Calm', 'Spotify', 'Vogue', 'MasterClass', 'Substack', 'Figma'],
  commerce: ['Glossier', 'Apple', 'Nike', 'Lululemon', 'Patagonia', 'Stripe', 'Airbnb', 'Vogue', 'Headspace', 'Calm', 'Spotify'],
  portfolio: ['Figma', 'Substack', 'Vogue', 'Apple', 'Linear', 'Vercel', 'Notion', 'MasterClass'],
  editorial: ['Substack', 'Vogue', 'NYT', 'Spotify', 'MasterClass', 'Patagonia', 'Apple'],
  software: COOL_DEFAULTS,
  'ops-console': ['Linear', 'Sentry', 'Cursor', 'GitHub', 'Posthog', 'Databricks', 'Vercel', 'OpenAI'],
}

export const VARIETY_AXES = {
  ground: ['near-black', 'high-key white', 'warm paper', 'saturated jewel', 'misty glass', 'raw editorial'],
  layoutGrammar: ['poster-grid', 'dense-product-surface', 'editorial-rhythm', 'catalog-wall', 'split-console', 'modular-bento', 'timeline-led'],
  proofRhythm: ['logo-strip', 'numbers-first', 'artifact-gallery', 'quote-led', 'table-proof', 'map-proof'],
  edgeLanguage: ['sharp hairlines', 'soft utility corners', 'brutalist blocks', 'rounded editorial cards', 'thin dividers', 'offset shadows'],
  motion: ['quiet reveal', 'ticker', 'counter pulse', 'hover parallax', 'static print-like', 'panel sweep'],
}

function scoreApp(brief, app) {
  const dna = resolveDna(app)
  const haystack = `${brief}\n${app}\n${dna?.layout || ''}\n${dna?.copy || ''}\n${dna?.composition || ''}`.toLowerCase()
  let score = 0
  const hint = APP_HINTS[app]
  if (hint?.test(brief)) score += 8
  if (haystack.includes('dashboard') && /dashboard|console|ops|monitor|operator|admin/.test(brief.toLowerCase())) score += 3
  if (/restaurant|butchery|coffee|cafe|food|skincare|hotel|music|label|studio|portfolio|agency|fitness|wellness|gallery|shop|store/i.test(brief)) {
    if (/Airbnb|Patagonia|Apple|Glossier|Headspace|Calm|Spotify|Vogue|NYT|MasterClass|Substack|Figma/.test(app)) score += 3
  } else if (COOL_DEFAULTS.includes(app)) {
    score += 2
  }
  if (/saas|b2b|platform|developer|api|analytics|infrastructure|tool/i.test(brief) && COOL_DEFAULTS.includes(app)) score += 3
  return score
}

export function inferSiteHint(brief) {
  const text = String(brief ?? '').toLowerCase()
  if (/operator|ops|console|dashboard|monitor|incident|admin|teleoperation|trading terminal/.test(text)) return 'ops-console'
  if (/shop|store|ecommerce|product|skincare|apparel|merch|record|zine|print/.test(text)) return 'commerce'
  if (/restaurant|coffee|cafe|butchery|supper|hotel|booking|studio|class|workshop/.test(text)) return 'local-experience'
  if (/portfolio|agency|designer|case stud/.test(text)) return 'portfolio'
  if (/music|label|event|editorial|magazine|publication/.test(text)) return 'editorial'
  if (/saas|b2b|api|developer|platform|analytics/.test(text)) return 'software'
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

  return {
    seed,
    siteHint,
    primary,
    secondary,
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
  }
}
