// Style genomes + genome-aware merge.
// Ported from /Users/livio/Desktop/oss120b-to-kimi/src/compiler/stages/merge.ts.
// After Qwen plans a genome, mergeWithGenome() applies deterministic regex
// rewrites so the rendered HTML actually adheres to the planned palette
// (fixes the "Qwen plans terracotta, GPT-OSS renders blue/purple" drift bug).

import {readFileSync, writeFileSync, readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join, resolve} from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const GENOMES_DIR = resolve(__dirname, '..', 'data', 'style-genomes')

// ── Load all 6 genomes on startup ────────────────────────────────────────────
function loadGenomes() {
  const out = {}
  for (const file of readdirSync(GENOMES_DIR)) {
    if (!file.endsWith('.json')) continue
    const json = JSON.parse(readFileSync(join(GENOMES_DIR, file), 'utf-8'))
    out[json.name] = json
  }
  return out
}

export const STYLE_GENOMES = loadGenomes()
export const GENOME_NAMES = Object.keys(STYLE_GENOMES).sort()

// ── SKINS: regex rewrites per genome ─────────────────────────────────────────
// `root` is the className that must be present on <body> after merge.
// `rewrites` are deterministic regex substitutions applied to the entire HTML.
//
// Coverage: each non-default genome rewrites every "neutral-family" Tailwind
// token (slate/zinc/gray/neutral/stone) — except the genome's target family
// itself — to the target family. Without this, GPT-OSS commonly emits a mix
// (e.g. plans terracotta then renders 70+ slate-* tokens), and a regex limited
// to neutral-* leaves the page off-palette. The alternation excludes the
// target so we don't perform identity rewrites that needlessly bloat the loop.
//
// Prefixes covered: bg, text, border, divide, from, via, to, ring, fill,
// stroke, decoration, placeholder, caret, outline, accent, shadow.
const NEUTRAL_PREFIXES = [
  'bg', 'text', 'border', 'divide', 'from', 'via', 'to', 'ring',
  'fill', 'stroke', 'decoration', 'placeholder', 'caret', 'outline',
  'accent', 'shadow',
]

// Build family-rewrite rules: for each prefix, map all non-target neutral
// families (with optional dark:/hover:/focus: variant prefix and required
// numeric shade) onto the target family. The leading variant prefix capture
// keeps things like "dark:bg-slate-900" intact.
function neutralFamilyRewrites(target) {
  const families = ['slate', 'zinc', 'gray', 'neutral', 'stone'].filter((f) => f !== target)
  const famAlt = families.join('|')
  const rules = []
  for (const prefix of NEUTRAL_PREFIXES) {
    // dark:bg-slate-900 → dark:bg-<target>-900 (also matches no-variant)
    rules.push([
      new RegExp(`\\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)${prefix}-(?:${famAlt})-(\\d{2,3})\\b`, 'g'),
      `$1${prefix}-${target}-$2`,
    ])
  }
  return rules
}

const SKINS = {
  'vercel-apple': {
    root: 'bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50',
    // Target is neutral; collapse slate/zinc/gray/stone → neutral so the
    // surface stays cool-grey-neutral.
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
      // Map every neutral family (incl. neutral itself) → emerald.
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)bg-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1bg-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)text-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1text-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)border-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1border-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)divide-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1divide-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)from-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1from-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)via-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1via-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)to-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1to-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)ring-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1ring-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)placeholder-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1placeholder-emerald-$2'],
      [/\b((?:dark:|hover:|focus:|focus-visible:|group-hover:|peer-hover:|md:|lg:|sm:|xl:|2xl:|aria-[^:]+:)*)decoration-(?:slate|zinc|gray|neutral|stone)-(\d{2,3})\b/g, '$1decoration-emerald-$2'],
      [/\bbg-emerald-900\b/g, 'bg-emerald-900'], // no-op anchor (kept for explicit accent)
      [/\bhover:bg-emerald-800\b/g, 'hover:bg-emerald-800'], // anchor
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

// Expose root classes alongside the loaded JSON for downstream consumers.
for (const name of Object.keys(SKINS)) {
  if (STYLE_GENOMES[name]) STYLE_GENOMES[name].rootClass = SKINS[name].root
}

// ── Ensure rootClass is on <body> ────────────────────────────────────────────
function ensureBodyRootClass(html, rootClass) {
  if (!rootClass) return html
  const tokens = rootClass.split(/\s+/).filter(Boolean)
  // Match the first <body ...> tag (with or without attributes).
  const bodyRe = /<body\b([^>]*)>/i
  const m = html.match(bodyRe)
  if (!m) {
    // No <body> — inject one (rare; HTML fragments).
    return `<body class="${rootClass}">\n${html}\n</body>`
  }
  const attrs = m[1] || ''
  const classRe = /\bclass\s*=\s*("([^"]*)"|'([^']*)')/i
  const cm = attrs.match(classRe)
  let newAttrs
  if (cm) {
    const existing = (cm[2] ?? cm[3] ?? '').trim()
    const existingSet = new Set(existing.split(/\s+/).filter(Boolean))
    const merged = [...existingSet]
    for (const t of tokens) if (!existingSet.has(t)) merged.push(t)
    const mergedStr = merged.join(' ')
    newAttrs = attrs.replace(classRe, `class="${mergedStr}"`)
  } else {
    newAttrs = `${attrs} class="${rootClass}"`
  }
  return html.replace(bodyRe, `<body${newAttrs}>`)
}

// ── Public API ───────────────────────────────────────────────────────────────
/**
 * Apply the genome's regex rewrites and ensure root classes on <body>.
 * Returns rewritten HTML.
 */
export function mergeWithGenome(html, genomeName) {
  const skin = SKINS[genomeName] ?? SKINS['vercel-apple']
  let out = html
  for (const [re, rep] of skin.rewrites) out = out.replace(re, rep)
  out = ensureBodyRootClass(out, skin.root)
  return out
}

/**
 * Count how many tokens a merge call would rewrite (diagnostic helper).
 */
export function countRewrites(html, genomeName) {
  const skin = SKINS[genomeName] ?? SKINS['vercel-apple']
  let total = 0
  for (const [re] of skin.rewrites) {
    const matches = html.match(new RegExp(re.source, re.flags))
    if (matches) total += matches.length
  }
  return total
}

// ── Markdown description block for Qwen's planner prompt ─────────────────────
const DESCRIPTIONS = {
  'vercel-apple':
    'Clean, minimal, neutral. Use when the brief calls for premium SaaS, dev tools, or any product that wants to feel like Vercel/Apple/Linear-the-marketing-site: confident, restrained, generous whitespace, no chromatic noise. Key tokens: bg-white / dark:bg-neutral-950, text-neutral-900, bg-neutral-900 accent, border-neutral-200.',
  'linear-raycast':
    'Dark, dense, technical. Use for developer tools, IDEs, internal dashboards, command-palette aesthetics, or any product that should feel fast, precise, hacker-friendly. Key tokens: bg-[#0b0b0f] body, text-zinc-50, bg-violet-500 accent, border-zinc-800 hairline borders, no shadows.',
  'stripe-resend':
    'Bright, trustworthy, financial/infrastructure. Use for fintech, APIs, B2B SaaS that needs to convey reliability and polish without being cold. Key tokens: bg-slate-50 body, text-slate-900, bg-indigo-600 accent with hover:bg-indigo-700, blurry elevated shadows, border-slate-200.',
  'editorial-warm':
    'Magazine, editorial, paper-like. Use for content brands, food, lifestyle, journalism, or any product where text and reading experience are the hero. Key tokens: bg-stone-50, text-stone-900, bg-stone-900 dark accent, border-stone-200, Fraunces serif headings paired with Inter body.',
  'boutique-organic':
    'Soft, calm, natural, breathing room. Use for wellness, skincare, sustainable goods, slow brands, or any product targeting calm and craft over speed. Key tokens: bg-emerald-50/40 tint, text-emerald-950, bg-emerald-900 accent, barely-visible emerald-900/10 borders, very rounded corners (rounded-3xl).',
  'bold-conversion':
    'Punchy, high-contrast, conversion-optimized. Use for landing pages, growth-stage startups, bold direct-response sites where clicks matter more than restraint. Key tokens: bg-white body, text-black, bg-black accent, thick 2px border-black borders, hard-offset shadows, tight punchy spacing.',
}

export function describeGenomes() {
  const order = [
    'vercel-apple',
    'linear-raycast',
    'stripe-resend',
    'editorial-warm',
    'boutique-organic',
    'bold-conversion',
  ]
  const lines = ['## Style genomes', '']
  for (const name of order) {
    lines.push(`### ${name}`)
    lines.push(DESCRIPTIONS[name])
    lines.push('')
  }
  return lines.join('\n')
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function isMain() {
  // process.argv[1] is the entry script path under bun/node.
  if (!process.argv[1]) return false
  return resolve(process.argv[1]) === resolve(__filename)
}

if (isMain()) {
  const [cmd, ...rest] = process.argv.slice(2)
  if (cmd === 'describe') {
    process.stdout.write(describeGenomes())
  } else if (cmd === 'merge') {
    const [htmlPath, genomeName] = rest
    if (!htmlPath || !genomeName) {
      console.error('usage: bun scripts/forge-genomes.mjs merge <htmlPath> <genomeName>')
      process.exit(1)
    }
    if (!SKINS[genomeName]) {
      console.error(`unknown genome: ${genomeName}`)
      console.error(`valid: ${GENOME_NAMES.join(', ')}`)
      process.exit(1)
    }
    const html = readFileSync(htmlPath, 'utf-8')
    const rewrittenCount = countRewrites(html, genomeName)
    const merged = mergeWithGenome(html, genomeName)
    const outPath = htmlPath.endsWith('.html')
      ? htmlPath.replace(/\.html$/, '.merged.html')
      : `${htmlPath}.merged.html`
    writeFileSync(outPath, merged, 'utf-8')
    console.log(`merged → ${outPath}`)
    console.log(`rewrites applied: ${rewrittenCount}`)
  } else {
    console.error('usage:')
    console.error('  bun scripts/forge-genomes.mjs describe')
    console.error('  bun scripts/forge-genomes.mjs merge <htmlPath> <genomeName>')
    process.exit(1)
  }
}
