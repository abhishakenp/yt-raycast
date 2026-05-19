// Genome-aware palette merge for the engine's homepage pipeline.
//
// Ported from scripts/forge-genomes.mjs. Self-contained so the engine package
// doesn't reach across the monorepo. The deterministic rewrites guarantee a
// coherent Tailwind palette regardless of which neutral family the LLM
// happened to emit (slate/zinc/gray/neutral/stone all collapse to the
// genome's target family).
//
// Wired into runner.js between the LLM homepage output and the writeFile.
// Gated by env SHIPFAST_USE_GENOME_MERGE=1 (default off until validated in
// production traffic).

const NEUTRAL_PREFIXES = [
  'bg', 'text', 'border', 'divide', 'from', 'via', 'to', 'ring',
  'fill', 'stroke', 'decoration', 'placeholder', 'caret', 'outline',
  'accent', 'shadow',
]

const VARIANT_PREFIX = '(?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*'

function neutralFamilyRewrites(target) {
  const families = ['slate', 'zinc', 'gray', 'neutral', 'stone'].filter((f) => f !== target)
  const famAlt = families.join('|')
  const rules = []
  for (const prefix of NEUTRAL_PREFIXES) {
    rules.push([
      new RegExp(`\\b(${VARIANT_PREFIX})${prefix}-(?:${famAlt})-(\\d{2,3})\\b`, 'g'),
      `$1${prefix}-${target}-$2`,
    ])
  }
  return rules
}

function allFamilyRewrites(target) {
  const rules = []
  for (const prefix of NEUTRAL_PREFIXES) {
    rules.push([
      new RegExp(`\\b(${VARIANT_PREFIX})${prefix}-(?:slate|zinc|gray|neutral|stone)-(\\d{2,3})\\b`, 'g'),
      `$1${prefix}-${target}-$2`,
    ])
  }
  return rules
}

const SKINS = {
  'vercel-apple': {
    root: 'bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50',
    rewrites: neutralFamilyRewrites('neutral'),
  },
  'linear-raycast': {
    root: 'bg-[#0b0b0f] text-zinc-50',
    rewrites: [
      ...neutralFamilyRewrites('zinc'),
      [/\bbg-white\b(?!\/)/g, 'bg-zinc-950'],
      [/\bdark:bg-white\b/g, 'dark:bg-zinc-50'],
      [/\bdark:text-white\b/g, 'dark:text-zinc-50'],
      [/\bbg-zinc-900\b(?!\s*hover)/g, 'bg-violet-500'],
      [/\btext-white\b/g, 'text-zinc-50'],
    ],
  },
  'stripe-resend': {
    root: 'bg-slate-50 text-slate-900',
    rewrites: [
      ...neutralFamilyRewrites('slate'),
      [/\bbg-slate-900\b/g, 'bg-indigo-600'],
      [/\bhover:bg-slate-800\b/g, 'hover:bg-indigo-700'],
    ],
  },
  'editorial-warm': {
    root: 'bg-stone-50 text-stone-900',
    rewrites: neutralFamilyRewrites('stone'),
  },
  'boutique-organic': {
    root: 'bg-emerald-50/40 text-emerald-950',
    rewrites: [
      ...allFamilyRewrites('emerald'),
      [/\btext-white\b/g, 'text-emerald-50'],
      [/\bdark:bg-white\b/g, 'dark:bg-emerald-50'],
    ],
  },
  'bold-conversion': {
    root: 'bg-white text-black',
    rewrites: [
      ...neutralFamilyRewrites('zinc'),
      [/\bborder-zinc-(\d+)\b/g, 'border-black'],
      [/\bbg-zinc-900\b/g, 'bg-black'],
      [/\btext-zinc-900\b/g, 'text-black'],
    ],
  },
}

export const GENOME_NAMES = Object.keys(SKINS).sort()

function ensureBodyRootClass(html, rootClass) {
  if (!rootClass) return html
  const tokens = rootClass.split(/\s+/).filter(Boolean)
  const bodyRe = /<body\b([^>]*)>/i
  const m = html.match(bodyRe)
  if (!m) return `<body class="${rootClass}">\n${html}\n</body>`
  const attrs = m[1] || ''
  const classRe = /\bclass\s*=\s*("([^"]*)"|'([^']*)')/i
  const cm = attrs.match(classRe)
  let newAttrs
  if (cm) {
    const existing = (cm[2] ?? cm[3] ?? '').trim()
    const existingSet = new Set(existing.split(/\s+/).filter(Boolean))
    const merged = [...existingSet]
    for (const t of tokens) if (!existingSet.has(t)) merged.push(t)
    newAttrs = attrs.replace(classRe, `class="${merged.join(' ')}"`)
  } else {
    newAttrs = `${attrs} class="${rootClass}"`
  }
  return html.replace(bodyRe, `<body${newAttrs}>`)
}

export function mergeWithGenome(html, genomeName) {
  const skin = SKINS[genomeName]
  if (!skin) return html
  let out = html
  for (const [re, rep] of skin.rewrites) out = out.replace(re, rep)
  return ensureBodyRootClass(out, skin.root)
}

// Heuristic: pick a genome from the engine's available context. The signal
// hierarchy is (1) explicit override on siteSpec.design.genome (future-
// proofing for when the planner picks deliberately), (2) site type buckets,
// (3) brief keywords. Always falls back to vercel-apple (the safest neutral).
const SITE_TYPE_TO_GENOME = {
  saas: 'vercel-apple',
  fintech: 'stripe-resend',
  api: 'stripe-resend',
  devtool: 'linear-raycast',
  ide: 'linear-raycast',
  developer: 'linear-raycast',
  ecommerce: 'boutique-organic',
  dtc: 'boutique-organic',
  retail: 'boutique-organic',
  skincare: 'boutique-organic',
  beauty: 'boutique-organic',
  wellness: 'boutique-organic',
  fitness: 'bold-conversion',
  gym: 'bold-conversion',
  growth: 'bold-conversion',
  restaurant: 'editorial-warm',
  coffee: 'editorial-warm',
  food: 'editorial-warm',
  hotel: 'editorial-warm',
  travel: 'editorial-warm',
  magazine: 'editorial-warm',
  content: 'editorial-warm',
  portfolio: 'vercel-apple',
  agency: 'vercel-apple',
  personal: 'vercel-apple',
}

const BRIEF_KEYWORD_HINTS = [
  [/\b(coffee|roaster|tea|patisserie|bakery|brewery|wine|vineyard)\b/i, 'editorial-warm'],
  [/\b(yoga|meditation|sound bath|wellness|holistic|spa|botanical|skincare|organic|sustainable)\b/i, 'boutique-organic'],
  [/\b(crossfit|hiit|strength|powerlifting|sprint|combat|fight)\b/i, 'bold-conversion'],
  [/\b(devtools?|cli|sdk|ide|terminal|kubernetes|prometheus|grafana|datadog|observability)\b/i, 'linear-raycast'],
  [/\b(stripe|payments?|invoicing|api platform|infrastructure|saas)\b/i, 'stripe-resend'],
]

export function pickGenome({ siteType, design, brief } = {}) {
  if (design?.genome && GENOME_NAMES.includes(design.genome)) {
    return { genome: design.genome, source: 'design.genome' }
  }
  const st = String(siteType || '').toLowerCase()
  if (st && SITE_TYPE_TO_GENOME[st]) {
    return { genome: SITE_TYPE_TO_GENOME[st], source: `siteType:${st}` }
  }
  const briefStr = String(brief || '')
  for (const [re, g] of BRIEF_KEYWORD_HINTS) {
    if (re.test(briefStr)) return { genome: g, source: `brief-keyword:${re.source}` }
  }
  return { genome: 'vercel-apple', source: 'fallback' }
}

// Top-level entry: applies the merge if env flag is set + a genome is picked.
// Returns { html, applied, genome, source, mergeMs } so the runner can log.
export function applyGenomeMerge(html, ctx = {}) {
  if (process.env.SHIPFAST_USE_GENOME_MERGE !== '1') {
    return { html, applied: false, genome: null, source: 'disabled', mergeMs: 0 }
  }
  if (!html || typeof html !== 'string' || html.length < 200) {
    return { html, applied: false, genome: null, source: 'no-html', mergeMs: 0 }
  }
  const { genome, source } = pickGenome(ctx)
  const t0 = Date.now()
  const merged = mergeWithGenome(html, genome)
  const mergeMs = Date.now() - t0
  return { html: merged, applied: true, genome, source, mergeMs }
}
