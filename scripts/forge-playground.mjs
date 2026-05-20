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
import { buildSiteTypeBlock, forgeGenerate } from './forge-lib.mjs'
import { mergeWithGenome } from './forge-genomes.mjs'

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

// siteType → genome (mirrors the engine's pickGenome buckets).
const SITE_TYPE_TO_GENOME = {
  saas: 'vercel-apple', fintech: 'stripe-resend',
  ecommerce: 'boutique-organic', restaurant: 'editorial-warm',
  portfolio: 'vercel-apple', agency: 'vercel-apple',
  fitness: 'bold-conversion', wellness: 'boutique-organic',
  hotel: 'editorial-warm',
}
// genome → concrete palette + font contract (what BOTH legs must obey).
const GENOME_STYLE = {
  'vercel-apple': { palette: 'white + light neutral surfaces, neutral-900 text, ONE confident dark/near-black accent. No chromatic noise.', fonts: '"Inter" display + "Inter" body', bg: 'bg-white' },
  'linear-raycast': { palette: 'near-black bg (#0b0b0f), zinc-50 text, electric violet-500 accent, hairline zinc-800 borders, no shadows.', fonts: '"Inter" display + "JetBrains Mono" for code/labels', bg: 'bg-[#0b0b0f]' },
  'stripe-resend': { palette: 'slate-50 bg, slate-900 text, indigo-600 accent (hover indigo-700), soft elevated shadows.', fonts: '"Sora" display + "Inter" body', bg: 'bg-slate-50' },
  'editorial-warm': { palette: 'warm cream/parchment surfaces, deep stone-900 text, ONE warm accent (terracotta/amber-700). Photography-led.', fonts: '"Fraunces" display + "Inter" body', bg: 'bg-stone-50' },
  'boutique-organic': { palette: 'soft emerald-tinted cream surfaces, emerald-950 text, emerald-700 accent, very rounded corners.', fonts: '"Fraunces" display + "Inter" body', bg: 'bg-emerald-50/40' },
  'bold-conversion': { palette: 'white bg, pure black text + black accent blocks, thick 2px black borders, hard offset shadows, punchy.', fonts: '"Space Grotesk" display + "Inter" body', bg: 'bg-white' },
}

async function geminiGenerate({ user, maxOut = 6000, temperature = 0.5 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`
  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature, maxOutputTokens: maxOut, thinkingConfig: { thinkingBudget: 0 } },
  }
  const t0 = Date.now()
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 200)}`)
  const data = JSON.parse(raw)
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  return { text, ms, tokens: data?.usageMetadata?.candidatesTokenCount }
}

const stripFences = (s) => String(s || '').replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim()

async function buildOne({ slug, brief }) {
  const t0 = Date.now()
  // Use the pack ONLY for vertical-correct section/anchor/voice data — NOT the
  // full site-type block, which mandates ≥45K chars and slows GPT-OSS down.
  const { type: siteType, pack } = buildSiteTypeBlock(brief)
  const genome = SITE_TYPE_TO_GENOME[siteType] || 'vercel-apple'
  const style = GENOME_STYLE[genome]
  const anchors = (pack.brandAnchors || []).slice(0, 10).join(', ')

  const contract = `Brand brief: ${brief}

SHARED DESIGN CONTRACT — every part of the page MUST obey this so the page is visually unified:
- Single-file HTML. Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Palette: ${style.palette}
- Fonts: ${style.fonts} (load via Google Fonts <link> + define in an inline tailwind.config).
- Site type: ${siteType}. ${pack.aesthetic}
- Voice: ${pack.voice}
- Rounded-2xl cards, generous py-20+ section spacing, real specific copy (no lorem). Keep markup tight — quality over raw length.`

  const heroUser = `${contract}

Produce ONLY the top of the page and STOP: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts links + inline tailwind.config defining the fonts + base ${style.bg} on body), then the <body ...> opening tag, a sticky <nav> with logo + 4-5 links + a primary CTA button, and exactly ONE <section> hero appropriate to a ${siteType} site (two-tone headline ≤9 words with an accent <span>, subheadline naming the user + outcome, two CTAs, and a strong visual — for image-led verticals use a relevant Unsplash image URL; for SaaS/devtools use a faux UI mock with realistic content). Do NOT close </body> or </html>. Do NOT add any section after the hero.`

  const bodyTopUser = `${contract}

This is a ${pack.label}. The full intended section flow is:
${pack.sections}

You are writing the TOP HALF of the body. The <head>, <nav>, and hero ALREADY EXIST — do NOT repeat them and do NOT output <!DOCTYPE>/<head>/<nav>/hero. Output the FIRST 3-4 sections from the flow above (the early ones), starting directly with the first <section>. Use these real brand names where logos/press/affiliations appear: ${anchors}. Do NOT close </body> or </html>. Obey the palette + fonts. Aim for 3-4 well-built sections, not maximum length.`

  const bodyBottomUser = `${contract}

This is a ${pack.label}. The full intended section flow is:
${pack.sections}

You are writing the BOTTOM HALF of the body. The head, nav, hero, and the first few sections ALREADY EXIST — do NOT repeat them. Output the LATER sections from the flow (social proof / testimonials / pricing-or-equivalent / final CTA), then a full multi-column <footer>, then close </body></html>. Start directly with the first <section>. Use these real brand names where relevant: ${anchors}. Obey the palette + fonts. Aim for 3-4 well-built sections, not maximum length.`

  const [hero, top, bottom] = await Promise.all([
    geminiGenerate({ user: heroUser, maxOut: 5000, temperature: 0.5 }),
    forgeGenerate({ prompt: bodyTopUser, temperature: 0.55, maxTokens: 4800, reasoningEffort: 'low' }),
    forgeGenerate({ prompt: bodyBottomUser, temperature: 0.55, maxTokens: 4800, reasoningEffort: 'low' }),
  ])

  // Guard: a GPT-OSS body leg occasionally refuses ("I'm sorry, but I can't
  // fulfill that request.") or returns near-empty. Don't stitch that text into
  // the page — drop the leg. The hero + the surviving half still render.
  const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i
  const badLeg = (s) => {
    const t = stripFences(s)
    const sections = (t.match(/<section\b/gi) || []).length
    return !t || t.length < 400 || (REFUSAL.test(t) && sections === 0)
  }
  const dropped = []
  let heroHtml = stripFences(hero.text).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let topHtml = badLeg(top.content) ? (dropped.push('top'), '') : stripFences(top.content).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let bottomHtml = badLeg(bottom.content) ? (dropped.push('bottom'), '') : stripFences(bottom.content)
  // Strip any stray refusal sentence that slipped in alongside real markup.
  topHtml = topHtml.replace(/^[^<]*?(i'?m sorry[^<]*)/i, '')
  bottomHtml = bottomHtml.replace(/(i'?m sorry[^<]*)$/i, '')
  if (!/<\/html>/i.test(bottomHtml)) bottomHtml += '\n</body></html>'
  let html = `${heroHtml}\n${topHtml}\n${bottomHtml}`
  // Deterministic palette unification across the Gemini↔GPT-OSS seam.
  html = mergeWithGenome(html, genome)

  const wall = Date.now() - t0
  const file = join(OUT_DIR, `${slug}.html`)
  writeFileSync(file, html)
  return {
    slug, siteType, genome, wall, chars: html.length, file,
    geminiHeroMs: hero.ms, ossTopMs: top.ms, ossBottomMs: bottom.ms,
    dropped: dropped.length ? dropped.join('+') : null,
  }
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
const head = `${'FILE'.padEnd(16)}${'TYPE'.padEnd(12)}${'GENOME'.padEnd(18)}${'WALL'.padStart(8)}${'CHARS'.padStart(9)}   STATUS`
console.log(head)
console.log('-'.repeat(head.length + 4))
for (const r of results) {
  if (r.error) {
    console.log(`${(r.slug + '.html').padEnd(16)}${''.padEnd(12)}${''.padEnd(18)}${''.padStart(8)}${''.padStart(9)}   ❌ ${r.error.slice(0, 50)}`)
    continue
  }
  const status = r.wall < 12000 ? '✅ <12s' : r.wall < 20000 ? '🟡 <20s' : '❌ slow'
  console.log(`${(r.slug + '.html').padEnd(16)}${r.siteType.padEnd(12)}${r.genome.padEnd(18)}${(r.wall + 'ms').padStart(8)}${String(r.chars).padStart(9)}   ${status}`)
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
