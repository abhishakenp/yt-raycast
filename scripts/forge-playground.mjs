#!/usr/bin/env bun
/**
 * Gemini × GPT-OSS parallel-hero PLAYGROUND — 8 verticals at once.
 *
 * The sub-12s recipe (from forge-gemini-combo "hero" mode), generalized so it
 * builds ANY vertical, not just coffee:
 *
 *   per vertical, in parallel:
 *     leg 1  Gemini 3.5 Flash → hero + nav + <head> (above-the-fold, the
 *            design-critical part where Gemini's quality shines)
 *     leg 2  GPT-OSS-120B     → top body sections   (from the SITE TYPE PACK)
 *     leg 3  GPT-OSS-120B     → bottom body + footer (from the SITE TYPE PACK)
 *   stitch → deterministic genome merge (unifies the palette across the
 *            Gemini↔GPT-OSS seam so colors can't clash).
 *
 * All 8 verticals run concurrently. Each writes <slug>.html (named after the
 * table row), gets a screenshot, and is opened in the browser.
 *
 * Usage:
 *   bun scripts/forge-playground.mjs                 all 8
 *   bun scripts/forge-playground.mjs saas ecommerce  just listed slugs
 *
 * Env: GEMINI_API_KEY (or GOOGLE_API_KEY), GROQ_API_KEY.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { detectSiteType } from './forge-lib.mjs'
import { generateCreativeHomepage } from './forge-creative.mjs'

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!API_KEY) {
  console.error('[playground] GEMINI_API_KEY / GOOGLE_API_KEY not set')
  process.exit(1)
}
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'playground', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

// 8 verticals — same spread as forge-bench-diverse.
const BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.' },
  { slug: 'ecommerce', brief: 'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.' },
  { slug: 'restaurant', brief: 'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.' },
  { slug: 'portfolio', brief: 'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups and indie creators. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.' },
  { slug: 'agency', brief: 'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland. Clients include Olipop, Necessaire, Allbirds.' },
  { slug: 'fitness', brief: 'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates. Six trainers, three classes per day, signature workout: VTX45.' },
  { slug: 'wellness', brief: 'Homepage for Halo Wellness, a meditation and sound bath studio in Los Angeles. 60-min and 90-min sessions, private and group, monthly membership available. Founded by certified meditation teachers.' },
  { slug: 'hotel', brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, on-site restaurant focused on Pacific Northwest cuisine. Spa, fire pits, hiking trails.' },
]

async function buildOne({ slug, brief }) {
  const siteType = detectSiteType(brief) // informational only — design is planner-driven
  const { html, archetype, plan, metrics } = await generateCreativeHomepage(brief, {
    geminiKey: API_KEY,
    geminiModel: GEMINI_MODEL,
  })
  const file = join(OUT_DIR, `${slug}.html`)
  writeFileSync(file, html)
  writeFileSync(join(OUT_DIR, `${slug}.plan.json`), JSON.stringify(plan, null, 2))
  return { slug, siteType, archetype, file, wall: metrics.wall, chars: metrics.chars, ...metrics }
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS

// Each vertical fires 2 concurrent Groq calls. Running all 8 at once = 16
// concurrent Groq calls, which saturates the account's concurrency limit —
// body legs balloon to ~15s and some return empty. A concurrency pool keeps
// in-flight Groq pressure low so each page builds near its solo ~10-11s.
// Tune with CONCURRENCY env (default 4 → ≤8 concurrent Groq calls; empirically
// the best balance — gave the fastest individual pages, ~9.7-10.5s).
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '4', 10)

async function runPool(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      try {
        out[i] = { status: 'fulfilled', value: await fn(items[i]) }
      } catch (e) {
        out[i] = { status: 'rejected', reason: e }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

console.log(`[playground] runId=${RUN_ID}  verticals=${briefs.length}  model=${GEMINI_MODEL}  concurrency=${CONCURRENCY}`)
console.log(`[playground] building (pool of ${CONCURRENCY})…`)

const settled = await runPool(briefs, CONCURRENCY, buildOne)
const results = []
for (let i = 0; i < settled.length; i++) {
  const s = settled[i]
  if (s.status === 'fulfilled') results.push(s.value)
  else results.push({ slug: briefs[i].slug, error: String(s.reason?.message || s.reason) })
}

// Screenshots (sequential, cheap) then open all in browser.
try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  for (const r of results) {
    if (!r.file) continue
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
    await p.goto(`file://${r.file}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
    await p.waitForTimeout(500)
    await p.screenshot({ path: r.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
    await p.close()
  }
  await b.close()
} catch (e) {
  console.error(`[playground] screenshot pass failed: ${e?.message || e}`)
}

// ── Table ─────────────────────────────────────────────────────────────────────
console.log(`\n[playground] === RESULTS (runId ${RUN_ID}) ===\n`)
const head = `${'FILE'.padEnd(16)}${'ARCHETYPE'.padEnd(24)}${'PALETTE/FONTS'.padEnd(34)}${'WALL'.padStart(8)}   STATUS`
console.log(head)
console.log('-'.repeat(head.length + 4))
for (const r of results) {
  if (r.error) {
    console.log(`${(r.slug + '.html').padEnd(16)}${''.padEnd(24)}${''.padEnd(34)}${''.padStart(8)}   ❌ ${r.error.slice(0, 50)}`)
    continue
  }
  const status = r.wall < 12000 ? '✅ <12s' : r.wall < 20000 ? '🟡 <20s' : '❌ slow'
  const design = `${r.palette} ${r.fonts}`.slice(0, 33)
  console.log(`${(r.slug + '.html').padEnd(16)}${String(r.archetype).slice(0, 23).padEnd(24)}${design.padEnd(34)}${(r.wall + 'ms').padStart(8)}   ${status}${r.dropped ? ' (drop ' + r.dropped + ')' : ''}`)
}
const ok = results.filter((r) => r.wall)
if (ok.length) {
  const mean = Math.round(ok.reduce((a, b) => a + b.wall, 0) / ok.length)
  const slowest = Math.max(...ok.map((r) => r.wall))
  console.log('-'.repeat(head.length + 4))
  console.log(`mean ${mean}ms · slowest ${slowest}ms · under-12s ${ok.filter((r) => r.wall < 12000).length}/${ok.length}`)
}

writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\n[playground] artifacts: ${OUT_DIR}`)

// Open every page in the browser (filenames match the table's FILE column).
for (const r of results) {
  if (r.file) { try { execSync(`open "${r.file}"`) } catch {} }
}
console.log(`[playground] opened ${ok.length} pages in browser (file = <slug>.html)`)
