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
import { detectSiteType, forgeGenerate } from './forge-lib.mjs'

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

// Creative-director planner. Cheap + fast + high-temperature so it invents a
// DIFFERENT page kind + visual world each run, instead of a fixed hero+genome.
const PLANNER_MODEL = process.env.PLANNER_MODEL || 'llama-3.3-70b-versatile'

const PLANNER_SYSTEM =
  'You are a daring art director and product designer with broad taste across eras and disciplines. You decide what a brand\'s primary web page should actually BE, then invent a distinctive visual world for it. Output ONLY compact JSON, no prose, no markdown fences.'

function plannerUser(brief) {
  return `Brief: ${brief}

Decide, with taste and surprise, the best front-door web page for this brand. Look BEYOND the default "marketing landing page with a centered hero". Depending on the brand, the most fitting page is often the actual product itself rendered as a real, working-looking interface:
- a product app UI — a dashboard, a kanban board, a deploy console with a project/deployment list, a data table, a code editor, an analytics view, an inbox;
- a gallery / lookbook / case-study wall;
- an editorial long-read or manifesto;
- an interactive catalog or storefront;
- or, only if it genuinely fits best, a marketing homepage.
Pick whatever a great team would actually ship as the front door for THIS brand.

Then invent a DISTINCTIVE visual identity — deliberately different from a generic SaaS template and different from what you'd pick for a neighbouring brand. Vary the GROUND boldly across brands: sometimes a dark/near-black canvas, sometimes a saturated or jewel-toned ground, sometimes warm paper/cream, sometimes high-key white — avoid defaulting to the same light grey (#f7f7f7) every time. Choose an unexpected-but-harmonious palette (exact hex), a real Google-Fonts typographic pairing that is NOT just Inter/Montserrat unless it truly fits, a corner/edge language, a layout philosophy (grid, density, whitespace, asymmetry), a mood, and a design reference/era.

Then break the page into EXACTLY 3 build chunks that stack vertically into one scrollable document. Chunk 1 is the identity-defining opening region (for an app archetype this is the app shell / top bar / primary view header, NOT a marketing hero) — keep chunk 1 COMPACT and focused (it will be built first and must render fast). Put the BULK of the content (long tables, big grids, repeated cards, secondary panels) into chunks 2 and 3, which are heavier. Make all 3 concrete.

Output ONLY this JSON shape:
{
  "archetype": "short label of the kind of page (e.g. 'kanban app UI', 'deploy console', 'editorial lookbook', 'marketing homepage')",
  "art": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex or null",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "radius": "edge language e.g. 'sharp / 0px' | 'rounded-2xl' | 'pill'",
    "mood": "3-6 words", "layout": "one-sentence layout philosophy", "reference": "a concrete design reference"
  },
  "chunks": [
    { "role": "what chunk 1 is", "contains": "concrete elements to build, specific to this brand" },
    { "role": "chunk 2", "contains": "..." },
    { "role": "chunk 3 (ends with footer)", "contains": "..." }
  ]
}`
}

function parseJson(text) {
  try { return JSON.parse(text) } catch {}
  const m = String(text).match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch {} }
  return null
}

async function planArtDirection(brief) {
  const t0 = Date.now()
  const res = await forgeGenerate({
    prompt: plannerUser(brief),
    system: PLANNER_SYSTEM,
    model: PLANNER_MODEL,
    temperature: 0.95,
    maxTokens: 1100,
  })
  const plan = parseJson(res.content)
  return { plan, ms: Date.now() - t0 }
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
  const siteType = detectSiteType(brief) // informational only — design is planner-driven

  // ── Creative direction (the only "decision" step; everything downstream
  //    just executes the plan, so variety lives here, not in hardcoded rules).
  const { plan, ms: plannerMs } = await planArtDirection(brief)
  if (!plan?.art || !Array.isArray(plan.chunks) || plan.chunks.length < 3) {
    throw new Error('planner produced no usable plan')
  }
  const a = plan.art
  const archetype = plan.archetype || 'web page'
  const accent2 = a.accent2 && a.accent2 !== 'null' ? `, secondary accent ${a.accent2}` : ''

  // Shared visual contract built ENTIRELY from the planner's invented world —
  // exact hex tokens so the 3 independently-built chunks fuse seamlessly.
  const contract = `Brand: ${brief}

This page is a "${archetype}". Build it as a real, polished, working-looking ${archetype} — NOT a generic marketing landing unless that is literally the archetype.

SHARED VISUAL WORLD — obey EXACTLY so the 3 chunks form one coherent page:
- Background ${a.bg}; surfaces ${a.surface}; text ${a.text}; muted ${a.muted}; accent ${a.accent}${accent2}.
- Use Tailwind arbitrary values with these exact hexes, e.g. bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}]. Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Fonts: "${a.fontDisplay}" for display + "${a.fontBody}" for body (Google Fonts <link> + inline tailwind.config).
- Edge language: ${a.radius}. Mood: ${a.mood}. Layout: ${a.layout}. Reference: ${a.reference}.
- Real, specific content — no lorem, no placeholder text. Single-file HTML.`

  const chunkUser = (idx, opening) => `${contract}

${opening}

THIS CHUNK:
ROLE: ${plan.chunks[idx].role}
CONTAINS: ${plan.chunks[idx].contains}

Build only this chunk, fully realised in the visual world above. Quality over raw length.`

  const c1 = chunkUser(
    0,
    `Build ONLY CHUNK 1 and STOP. Output <!DOCTYPE html>, a <head> (Tailwind CDN + Google Fonts links + inline tailwind.config with the two fonts + base background ${a.bg} and text ${a.text} on <body>), then the <body ...> opening tag, then chunk 1's region. Keep chunk 1 COMPACT — roughly 120-200 lines of HTML; it is the opening only, the rest of the page comes later. Do NOT close </body> or </html>. Do NOT build later chunks.`,
  )
  const c2 = chunkUser(
    1,
    `The <head>, <body> opening, and CHUNK 1 ALREADY EXIST — do NOT repeat them, do NOT output <!DOCTYPE>/<head>/<body>. Start directly with this chunk's top-level container. Do NOT close </body> or </html>.`,
  )
  const c3 = chunkUser(
    2,
    `The <head>, <body>, CHUNK 1 and CHUNK 2 ALREADY EXIST — do NOT repeat them. Start directly with this chunk's top-level container. End with a matching <footer>, then close </body></html>.`,
  )

  // Gemini builds chunk 1 (the identity-defining region — its quality shines);
  // GPT-OSS builds chunks 2 & 3 in parallel.
  const [r1, r2, r3] = await Promise.all([
    geminiGenerate({ user: c1, maxOut: 2200, temperature: 0.65 }),
    forgeGenerate({ prompt: c2, temperature: 0.7, maxTokens: 4200, reasoningEffort: 'low' }),
    forgeGenerate({ prompt: c3, temperature: 0.7, maxTokens: 4200, reasoningEffort: 'low' }),
  ])

  // Guard: a GPT-OSS leg occasionally refuses or returns near-empty. Don't
  // stitch that text into the page — drop the leg.
  const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i
  const badLeg = (s) => {
    const t = stripFences(s)
    const blocks = (t.match(/<(section|div|main|header|article|nav)\b/gi) || []).length
    return !t || t.length < 400 || (REFUSAL.test(t) && blocks === 0)
  }
  const dropped = []
  let c1Html = stripFences(r1.text).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let c2Html = badLeg(r2.content) ? (dropped.push('c2'), '') : stripFences(r2.content).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let c3Html = badLeg(r3.content) ? (dropped.push('c3'), '') : stripFences(r3.content)
  c2Html = c2Html.replace(/^[^<]*?(i'?m sorry[^<]*)/i, '')
  c3Html = c3Html.replace(/(i'?m sorry[^<]*)$/i, '')
  if (!/<\/html>/i.test(c3Html)) c3Html += '\n</body></html>'
  const html = `${c1Html}\n${c2Html}\n${c3Html}`

  const wall = Date.now() - t0
  const file = join(OUT_DIR, `${slug}.html`)
  writeFileSync(file, html)
  writeFileSync(join(OUT_DIR, `${slug}.plan.json`), JSON.stringify(plan, null, 2))
  return {
    slug, siteType, archetype, wall, chars: html.length, file,
    palette: `${a.bg}/${a.accent}`, fonts: `${a.fontDisplay}+${a.fontBody}`,
    plannerMs, geminiMs: r1.ms, ossC2Ms: r2.ms, ossC3Ms: r3.ms,
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
