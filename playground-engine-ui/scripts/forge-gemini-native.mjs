#!/usr/bin/env bun
/**
 * NEW PATH — "Gemini-native": bet on Gemini's Kimi-close design taste, made
 * fast by (a) banning SVG/image generation (placeholders only, like the real
 * pipeline) so token counts collapse, and (b) parallelising the page into
 * full-width stacked chunks so wall ≈ the slowest chunk, not the sum.
 *
 * North star: final HTML < 20s AND visually close to Kimi K2.5. Nothing else.
 *
 * Pipeline:
 *   1. Planner (GPT-OSS-120B, fast) → JSON: archetype, layoutMode, art, sections[].
 *   2a. vertical-doc → 3 concurrent Gemini calls, each builds a slice of the
 *       full-width section stack; chunk 1 also emits <head>+<body>+nav.
 *   2b. app-shell → ONE Gemini call builds the whole coherent 2D interface.
 *   3. Stitch (plain concat — every chunk is independent full-width sections,
 *      so no cross-chunk container can collide), inject Lucide for preview.
 *
 * Constraints (match the real project): Tailwind via CDN only, NO custom CSS,
 * NO <svg> (use <i data-lucide>), NO inline images (use <div data-img>).
 *
 * Usage:
 *   bun playground-engine-ui/scripts/forge-gemini-native.mjs [brief-slug...]
 *   GEMINI_CHUNKS=3   number of parallel Gemini build calls (vertical-doc)
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { forgeGenerate } from './forge-lib.mjs'

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!API_KEY) { console.error('[gn] GEMINI_API_KEY/GOOGLE_API_KEY not set'); process.exit(1) }
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const PLANNER_MODEL = process.env.PLANNER_MODEL || 'openai/gpt-oss-120b'
const N_CHUNKS = Math.max(1, Math.min(4, parseInt(process.env.GEMINI_CHUNKS || '3', 10)))

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'gemini-native', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

// The canonical 8-vertical breadth set (saas/ecommerce/restaurant/portfolio/
// agency/fitness/wellness/hotel), plus the 4 stress briefs available by slug.
const BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.' },
  { slug: 'ecommerce', brief: 'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.' },
  { slug: 'restaurant', brief: 'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.' },
  { slug: 'portfolio', brief: 'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups and indie creators. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.' },
  { slug: 'agency', brief: 'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland. Clients include Olipop, Necessaire, Allbirds.' },
  { slug: 'fitness', brief: 'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates. Six trainers, three classes per day, signature workout: VTX45.' },
  { slug: 'wellness', brief: 'Homepage for Halo Wellness, a meditation and sound bath studio in Los Angeles. 60-min and 90-min sessions, private and group, monthly membership available. Founded by certified meditation teachers.' },
  { slug: 'hotel', brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, on-site restaurant focused on Pacific Northwest cuisine. Spa, fire pits, hiking trails.' },
  // stress briefs (run explicitly by slug)
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation. B2B, sold to logistics companies.' },
  { slug: 'riso', brief: 'Riso Press — a Brooklyn risograph print studio and zine shop. Bold, playful, ink-on-paper craft. Sells limited-run art prints and zines, runs weekend printing workshops, takes custom client commissions.' },
  { slug: 'music', brief: 'Tessellate — an independent electronic music label and warehouse event series in Berlin. Vinyl + digital releases, a roster of 12 artists, a calendar of upcoming warehouse parties, and a small merch + record shop.' },
  { slug: 'butchery', brief: 'Marrow — a nose-to-tail butchery and supper club in Lisbon. Weekly changing set menus, hands-on butchery classes, whole-animal provenance from a single farm, a small counter selling cuts and charcuterie.' },
]
const DEFAULT_8 = ['saas', 'ecommerce', 'restaurant', 'portfolio', 'agency', 'fitness', 'wellness', 'hotel']

// ── Planner (GPT-OSS) ────────────────────────────────────────────────────────
const PLANNER_SYSTEM =
  'You are a world-class art director + product designer. Decide what the brand\'s front door should BE, invent a distinctive visual world, and lay out its sections. Output ONLY compact JSON.'

function plannerUser(brief) {
  const blog = /\bblog\b/i.test(brief)
  return `Brief: ${brief}

Decide the best front-door page. Look beyond "marketing landing": it may be the actual product UI (dashboard/console), a gallery, an editorial spread, a catalog, an events wall, etc. Pick what a great team would ship for THIS brand.
${blog ? '\nThis brief is a BLOG/PUBLICATION home — plan an article index (featured post + post grid), not a SaaS landing or open-source developer platform.' : ''}

layoutMode: "app-shell" ONLY for genuine operational software (dashboard/console/admin with live data + persistent controls); "vertical-doc" for everything else (default).

Invent a distinctive identity: bold, harmonious palette (exact hex — vary the GROUND across brands: dark, jewel-toned, paper/cream, or high-key), a real Google-Fonts pairing (avoid generic Inter/Roboto unless apt), an edge language, a mood, a reference, and a concrete DECOR treatment (grain, duotone, tape/sticker, hard shadows, hairline rules, glow, halftone, etc.).

Then list 6-9 SECTIONS for a vertical-doc (or the key regions for an app-shell), each a full-width band, in order, concrete to this brand.

Output ONLY:
{
  "archetype": "...", "layoutMode": "vertical-doc"|"app-shell",
  "art": { "bg":"#hex","surface":"#hex","text":"#hex","muted":"#hex","accent":"#hex","accent2":"#hex|null",
           "fontDisplay":"...","fontBody":"...","radius":"...","mood":"...","reference":"...","decor":"..." },
  "sections": [ { "role":"...", "contains":"concrete content (real, specific)" }, ... ]
}`
}

function parseJson(t) {
  try { return JSON.parse(t) } catch {}
  const m = String(t).match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} }
  return null
}

async function plan(brief) {
  const t0 = Date.now()
  let r = await forgeGenerate({ prompt: plannerUser(brief), system: PLANNER_SYSTEM, model: PLANNER_MODEL, temperature: 0.9, maxTokens: 1600 })
  let p = parseJson(r.content)
  // Retry once at lower temperature if the planner emitted unparseable JSON.
  if (!p?.art || !Array.isArray(p.sections)) {
    r = await forgeGenerate({ prompt: plannerUser(brief) + '\n\nReturn ONLY valid JSON, no prose, no markdown fences.', system: PLANNER_SYSTEM, model: PLANNER_MODEL, temperature: 0.4, maxTokens: 1600 })
    p = parseJson(r.content)
  }
  return { plan: p, ms: Date.now() - t0 }
}

// ── Gemini ───────────────────────────────────────────────────────────────────
async function gemini({ user, maxOut = 3000, temperature = 0.6 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`
  const t0 = Date.now()
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature, maxOutputTokens: maxOut, thinkingConfig: { thinkingBudget: 0 } } }),
  })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 200)}`)
  const d = JSON.parse(raw)
  return { text: d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '', ms }
}

const strip = (s) => String(s || '').replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim()

// Repair malformed attributes the model sometimes hallucinates, e.g.
// `<div class Portland="flex ...">` → `<div class="flex ...">` (a stray word
// jammed between `class` and `=` silently kills the element's classes).
function repairAttrs(html) {
  return String(html || '').replace(/\bclass\s+[A-Za-z][\w-]*\s*=/g, 'class=')
}

// Balance <div> tags in the Gemini-top so an unclosed container can't swallow
// the GPT-OSS tail (the #1 cause of whole-page collapse: later sections nest
// inside an earlier half-width column). The <body> tag stays open (the tail
// closes it). Any net-unclosed <div>s are closed here at the seam so the tail
// appends as a sibling at body level, not nested.
function balanceTopDivs(topHtml) {
  const opens = (topHtml.match(/<div\b/gi) || []).length
  const closes = (topHtml.match(/<\/div>/gi) || []).length
  const deficit = opens - closes
  return deficit > 0 ? topHtml + '\n' + '</div>'.repeat(deficit) : topHtml
}

function contract(brief, p) {
  const a = p.art
  const acc2 = a.accent2 && a.accent2 !== 'null' ? `, secondary ${a.accent2}` : ''
  const blog = /\bblog\b/i.test(brief)
  return `Brand: ${brief}
This page is a "${p.archetype}". Build it like a world-class designer would — aim for the polish of the very best Tailwind sites (Linear, Vercel, Stripe, Kimi-grade craft).
${blog ? '\nBLOG/PUBLICATION HOME: article index, not a product landing. Lead with a featured post masthead (title, byline, date, excerpt, read link) then a dense latest-posts grid. NO SaaS hero, NO repo/code mockup, NO Features/Testimonials nav.\n' : ''}

VISUAL WORLD (obey EXACTLY so independently-built parts fuse):
- Palette: bg ${a.bg}, surface ${a.surface}, text ${a.text}, muted ${a.muted}, accent ${a.accent}${acc2}. Use Tailwind arbitrary hex values: bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}].
- Fonts: "${a.fontDisplay}" display + "${a.fontBody}" body (Google Fonts <link> + inline tailwind.config). Use a confident type scale (large, tight-tracked display headings).
- Edge: ${a.radius}. Mood: ${a.mood}. Reference: ${a.reference}.
- DECOR — apply it for craft/depth: ${a.decor}.

HARD RULES:
- Tailwind utilities ONLY (Tailwind CDN). NO <style>, NO custom CSS.
- Every section is a FULL-WIDTH band: <section class="w-full ..."> with ONE inner <div class="mx-auto max-w-7xl px-6 ...">. NO fixed-width structural blocks (no w-80/w-[400px] on layout). Each section is independently full-width and self-contained — do NOT open a flex/grid container in one part that another part must close.
- GRID RULE (critical — prevents broken narrow columns): any COLLECTION of items (products, cards, artists, prints, menu items, posts, stat tiles, team) MUST be a responsive grid that SPANS THE FULL inner width — e.g. <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">. A section's content ALWAYS fills the max-w-7xl inner wrapper edge to edge. NEVER render a collection as a single narrow column, and never leave half the row empty. If a section has one feature item, make it a full-width 2-column split (text + visual), not a narrow card.
- SIMPLE-LAYOUT RULE (critical for robustness): use straightforward grids and vertical stacks. Do NOT use position:absolute/fixed, negative margins, rotation, translate, or overlapping/stacked/fanned cards "for effect" — they break across viewports. Cards sit in a clean responsive grid, evenly spaced. Keep DOM nesting shallow and every <div> properly closed.
- PROSE RULE (critical): NEVER place a long paragraph inside a narrow grid cell or skinny column — that produces an ugly tall thread of text. Cards in a grid carry only SHORT copy (a heading + a ≤2-line description). Any long-form prose (a story, a description block) lives in its OWN block: a centered max-w-2xl/max-w-3xl text column, or one half of a balanced 2-column (prose + image) split — never one tall narrow cell beside short cards. All cells in a grid row should be roughly equal height.
- NO JAVASCRIPT: do NOT write <script> tags. Do NOT use scroll-triggered reveal animations, IntersectionObserver, lightboxes, or any initial opacity-0 / -translate / invisible state that needs JS to appear. The page MUST be fully visible and fully styled on load with ZERO JavaScript. (Hover-only CSS transitions are fine.)
- ICONS: never <svg>; use <i data-lucide="name"> sized with Tailwind.
- IMAGES: never inline images/SVG; use <div data-img="short subject" class="w-full aspect-[4/3] bg-[${a.muted}] rounded-..."></div>. ALWAYS give an image box a sensible aspect ratio (aspect-[4/3], aspect-video, aspect-square) — NEVER a giant full-bleed empty block, and never an image box taller than ~70vh. A section must never be just a wall of empty image boxes: pair images with real copy (titles, captions, prices).
- HERO: keep it clean and legible — a headline, subhead, and 1-2 CTAs (optionally one visual on the side). Do NOT cram a form, a long list, or dense widgets into the hero.
- For blog/publication briefs: the first viewport is a featured post masthead or publication index opener — not a product marketing hero.
- Real, specific copy (no lorem). Generous spacing (py-20+). Pour effort into hierarchy, rhythm, and craft.`
}

// Strip model-authored <script> (rogue reveal/lightbox JS that leaves content
// hidden) and <style> (custom CSS we don't want), then inject ONLY our Lucide
// loader + a preview safety-net that forces any reveal/opacity-0 content
// visible (the real pipeline owns icon+behavior injection downstream).
function sanitize(html) {
  let h = repairAttrs(String(html || ''))
  // Strip <style> blocks (custom CSS / reveal opacity-0 rules we don't want).
  h = h.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  // Strip ONLY rogue <script> — KEEP the Tailwind CDN loader + tailwind.config.
  h = h.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    if (/cdn\.tailwindcss\.com|tailwindcss/i.test(attrs)) return m // Tailwind CDN
    if (/tailwind\s*\.\s*config|tailwind\s*=\s*\{/i.test(body)) return m // inline config
    return '' // rogue reveal/lightbox/etc JS
  })
  const inject = `<script src="https://unpkg.com/lucide@latest"></script>
<style>
[data-reveal],.opacity-0,[class*="reveal"],[class*="fade"]{opacity:1!important;transform:none!important;visibility:visible!important}
/* Preview-only: make image placeholders read as intentional image slots (the
   real pipeline swaps these for Pexels photos), so empty boxes don't look broken. */
[data-img]{position:relative!important;background:repeating-linear-gradient(135deg,#dfe3e8,#dfe3e8 14px,#d4d9df 14px,#d4d9df 28px)!important;min-height:8rem}
[data-img]::after{content:"\\1F5BC  "attr(data-img);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:1rem;font:600 .68rem/1.35 ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em;color:#64748b;background:rgba(255,255,255,.35)}
</style>
<script>window.addEventListener('load',()=>{try{lucide.createIcons()}catch(e){}})</script>`
  return /<\/body>/i.test(h) ? h.replace(/<\/body>/i, `${inject}\n</body>`) : h + inject
}

// ── vertical-doc HYBRID: Gemini builds the visually-critical TOP (head+nav+
//    hero + first sections) in ONE coherent call; GPT-OSS builds the TAIL
//    (remaining sections + footer) in parallel. Top = Kimi-grade craft +
//    reliable (no chunk-isolation narrow columns); tail = fast + reliably
//    full-width. wall ≈ Gemini's top call (~13s). The two share the contract
//    so palette/fonts/decor match across the seam.
const list = (arr) => arr.map((s, i) => `${i + 1}. ${s.role} — ${s.contains}`).join('\n')

async function buildVertical(brief, p) {
  const c = contract(brief, p)
  const secs = p.sections || []
  const blog = /\bblog\b/i.test(brief)
  const opener = blog
    ? 'a publication index opener (featured post masthead + latest posts preview — NOT a SaaS marketing hero or product demo)'
    : 'a STUNNING full-width hero'
  // Gemini owns the hero + the first 2-3 sections (the money-shot above-the-
  // fold + first scroll). Capped at 3 so the Gemini call stays fast (it's the
  // wall) and doesn't truncate; GPT-OSS takes the denser tail.
  const topN = Math.min(3, Math.max(2, Math.ceil(secs.length / 2)))
  const top = secs.slice(0, topN)
  const tail = secs.slice(topN)

  const geminiCall = gemini({
    user: `${c}

Build the TOP of the page in ONE coherent pass: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts links + inline tailwind.config + base background ${p.art.bg} and text ${p.art.text} on <body>), the <body ...> opening tag, a sticky full-width <nav> (brand + links + a primary action), ${opener}, THEN these full-width sections:
${list(top)}
This is the part users judge first — make it gorgeous: confident large display type, strong hierarchy, generous rhythm, the DECOR applied. Do NOT close </body> or </html>.`,
    maxOut: 3400, temperature: 0.6,
  })

  const ossCall = tail.length
    ? forgeGenerate({
        prompt: `${c}

The <head>, <body>, sticky <nav>, hero, and the first ${topN} sections ALREADY EXIST above — do NOT repeat them, do NOT output <!DOCTYPE>/<head>/<body>/<nav>. Append these remaining FULL-WIDTH sections (each a self-contained <section class="w-full"> with an inner mx-auto max-w-7xl wrapper), then a full-width multi-column <footer>, then close </body></html>:
${list(tail)}
Match the palette + fonts + DECOR EXACTLY. Use the GRID RULE for any collection. Start directly with the first <section>.`,
        temperature: 0.6, maxTokens: 5000, reasoningEffort: 'low',
      })
    : Promise.resolve({ content: '\n</body></html>', ms: 0 })

  const [g, o] = await Promise.all([geminiCall, ossCall])
  let topHtml = balanceTopDivs(repairAttrs(strip(g.text).replace(/<\/body>\s*<\/html>\s*$/i, '')))
  let tailHtml = strip(o.content || '')
  // refusal/empty guard on the tail
  if (!tailHtml || tailHtml.length < 200 || /\bi'?m sorry\b/i.test(tailHtml.slice(0, 120))) tailHtml = ''
  if (!/<\/html>/i.test(tailHtml)) tailHtml += '\n</body></html>'
  let html = `${topHtml}\n${tailHtml}`
  return { html, legMs: [g.ms, o.ms] }
}

// ── app-shell: single Gemini pass ────────────────────────────────────────────
async function buildApp(brief, p) {
  const c = contract(brief, p)
  const regions = (p.sections || []).map((s) => `- ${s.role}: ${s.contains}`).join('\n')
  const r = await gemini({ user: `${c}\n\nBuild the COMPLETE coherent operational interface as ONE document: <!DOCTYPE html>, <head>, full <body>, </body></html>. ONE consistent layout (top bar + optional sidebar + primary canvas + panels), live-looking data, status pills, tables/charts. Regions:\n${regions}\nMake it feel like one real production tool.`, maxOut: 4000, temperature: 0.55 })
  let html = strip(r.text)
  if (!/<\/html>/i.test(html)) html += '\n</body></html>'
  return { html, legMs: [r.ms] }
}

async function generate(brief) {
  const t0 = Date.now()
  const { plan: p, ms: planMs } = await plan(brief)
  if (!p?.art || !Array.isArray(p.sections)) throw new Error('bad plan')
  const layoutMode = p.layoutMode === 'app-shell' ? 'app-shell' : 'vertical-doc'
  const built = layoutMode === 'app-shell' ? await buildApp(brief, p) : await buildVertical(brief, p)
  const html = sanitize(built.html)
  return { html, plan: p, layoutMode, wall: Date.now() - t0, planMs, legMs: built.legMs, chars: html.length, archetype: p.archetype }
}

/** Programmatic entry — used by engine-triple-compare and tests. */
export async function generateGeminiNativeHomepage(brief) {
  return generate(brief)
}

const isMain = import.meta.main ?? process.argv[1]?.endsWith('forge-gemini-native.mjs')
if (isMain) {
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS.filter((b) => DEFAULT_8.includes(b.slug))
console.log(`[gn] runId=${RUN_ID} model=${GEMINI_MODEL} planner=${PLANNER_MODEL} chunks=${N_CHUNKS} briefs=${briefs.length}`)
const results = []
for (const { slug, brief } of briefs) {
  process.stdout.write(`[gn] ${slug} … `)
  try {
    const r = await generate(brief)
    const file = join(OUT_DIR, `${slug}.html`)
    writeFileSync(file, r.html); writeFileSync(join(OUT_DIR, `${slug}.plan.json`), JSON.stringify(r.plan, null, 2))
    results.push({ slug, ok: true, file, ...r })
    console.log(`${r.wall}ms · ${r.layoutMode} · legs[${r.legMs.join(',')}] · ${r.chars}c · ${r.archetype}`)
  } catch (e) {
    results.push({ slug, ok: false, error: String(e?.message || e) })
    console.log(`FAILED: ${e?.message || e}`)
  }
}

try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  for (const r of results) {
    if (!r.file) continue
    const pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
    await pg.goto(`file://${r.file}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
    await pg.waitForTimeout(500)
    await pg.screenshot({ path: r.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
    await pg.close()
  }
  await b.close()
} catch (e) { console.error(`[gn] shots failed: ${e?.message || e}`) }

console.log(`\n[gn] === RESULTS (${RUN_ID}) ===`)
for (const r of results) {
  if (!r.ok) { console.log(`  ${r.slug.padEnd(9)} ❌ ${r.error}`); continue }
  const flag = r.wall < 20000 ? '✅' : '❌'
  console.log(`  ${r.slug.padEnd(9)} ${flag} ${String(r.wall + 'ms').padStart(7)} ${r.layoutMode.padEnd(12)} ${String(r.chars).padStart(6)}c  ${r.archetype}`)
  console.log(`            open: file://${r.file}`)
}
writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results.map(({ html, ...r }) => r), null, 2))
console.log(`[gn] artifacts: ${OUT_DIR}`)
for (const r of results) if (r.file && existsSync(r.file)) { try { execSync(`open "${r.file}"`) } catch {} }
}
