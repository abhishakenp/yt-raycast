#!/usr/bin/env bun
/**
 * Gemini 3.5 Flash × GPT-OSS-120B combination probe.
 *
 * Goal: a beautiful single homepage in < 20s by using each model where it's
 * strongest. Gemini 3.5 Flash is gorgeous but slow (~255 tps); GPT-OSS-120B
 * on Groq is fast (~600-1000 tps) and the forge splits it 3 ways. So we keep
 * Gemini's token output tiny and let Groq carry the bulk.
 *
 * Modes:
 *   planner   Gemini makes the JSON skeleton (thinking off, tight cap) →
 *             GPT-OSS split3 builds the HTML from it. Sequential.
 *   hero      Gemini builds the hero+nav (above-the-fold, design-critical) in
 *             PARALLEL with GPT-OSS building the body sections; stitch. Wall =
 *             max(geminiHero, ossBody).
 *
 * Each run: writes HTML, renders a screenshot, prints metrics, and OPENS the
 * page in the default browser (per the standing instruction — always open,
 * never metrics-only).
 *
 * Usage:
 *   bun scripts/forge-gemini-combo.mjs planner ["brief"]
 *   bun scripts/forge-gemini-combo.mjs hero    ["brief"]
 *
 * Env: GEMINI_API_KEY (or GOOGLE_API_KEY), GROQ_API_KEY.
 *   GEMINI_MODEL=gemini-3.5-flash (override the model id)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import {
  getSkeletonSystem,
  buildVariantPrompt,
  forgeGenerateSplit3,
  forgeGenerate,
} from './forge-lib.mjs'

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!API_KEY) {
  console.error('[combo] GEMINI_API_KEY / GOOGLE_API_KEY not set')
  process.exit(1)
}
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

const MODE = (process.argv[2] || 'planner').toLowerCase()
const BRIEF =
  process.argv[3] ||
  'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'gemini-combo', `${MODE}-${RUN_ID}`)
mkdirSync(OUT_DIR, { recursive: true })

// ── Gemini helper ────────────────────────────────────────────────────────────
async function geminiGenerate({ system, user, maxOut = 4000, think = false, json = false, temperature = 0.4 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`
  const generationConfig = { temperature, maxOutputTokens: maxOut }
  if (!think) generationConfig.thinkingConfig = { thinkingBudget: 0 }
  if (json) generationConfig.responseMimeType = 'application/json'
  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig,
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  const t0 = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 300)}`)
  const data = JSON.parse(raw)
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  const usage = data?.usageMetadata || {}
  return { text, ms, usage, finishReason: data?.candidates?.[0]?.finishReason }
}

function stripFences(s) {
  return String(s || '')
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

// ── Mode: planner ──────────────────────────────────────────────────────────
async function runPlanner() {
  console.log(`[combo:planner] gemini skeleton → GPT-OSS split3 build`)
  const skeletonSystem = await getSkeletonSystem()

  const tA = Date.now()
  const sk = await geminiGenerate({
    system: skeletonSystem,
    user: `Brief: ${BRIEF}\n\nReturn the JSON plan only.`,
    maxOut: 3000,
    think: false,
    json: true,
    temperature: 0.3,
  })
  const stageAMs = Date.now() - tA

  let skeleton
  try {
    skeleton = JSON.parse(sk.text)
  } catch {
    const m = sk.text.match(/\{[\s\S]*\}/)
    skeleton = m ? JSON.parse(m[0]) : null
  }
  if (!skeleton) throw new Error('skeleton parse failed: ' + sk.text.slice(0, 200))
  writeFileSync(join(OUT_DIR, 'skeleton.json'), JSON.stringify(skeleton, null, 2))

  const skeletonBlock = `── APPROVED SKELETON (stage-A plan, follow it concretely) ──
${JSON.stringify(skeleton, null, 2)}

Use the headline / accent phrase / mockType / mockHints / sections / brand names / stats / theme / voice from this plan VERBATIM where they are specified. Expand each section's contentHints into the actual HTML — do not invent different section kinds or replace named brands.`
  const userPrompt = `${skeletonBlock}\n\n${buildVariantPrompt(BRIEF, 0, { includeReference: true })}`

  const tB = Date.now()
  const build = await forgeGenerateSplit3({
    prompt: userPrompt,
    temperature: 0.55,
    genomeHint: skeleton.genome,
    siteTypeHint: skeleton.siteType,
  })
  const stageBMs = Date.now() - tB
  const html = build.content

  return {
    html,
    metrics: {
      mode: 'planner',
      geminiSkeletonMs: stageAMs,
      geminiOutTokens: sk.usage.candidatesTokenCount,
      geminiThinkTokens: sk.usage.thoughtsTokenCount ?? null,
      ossBuildMs: stageBMs,
      genome: skeleton.genome,
      siteType: skeleton.siteType,
      htmlChars: html.length,
    },
  }
}

// ── Mode: hero (parallel) ────────────────────────────────────────────────────
async function runHero() {
  console.log(`[combo:hero] gemini hero+nav ∥ GPT-OSS body, then stitch`)
  // Shared design contract so the two halves match.
  const contract = `Brand brief: ${BRIEF}
Shared design contract (BOTH halves must obey):
- Single-file HTML, Tailwind via CDN <script src="https://cdn.tailwindcss.com"></script>.
- Palette: warm cream/parchment surfaces + deep espresso text + a single warm accent (amber-600/terracotta). NO blue/indigo/violet.
- Fonts: Google Fonts — "Fraunces" for display headings, "Inter" for body.
- Rounded-2xl cards, generous py-20+ section spacing.`

  const heroUser = `${contract}

Produce ONLY the top of the page: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts links + a tailwind.config inline script defining the fonts), then <body ...> opening tag, a sticky <nav>, and ONE <section> hero (headline ≤8 words two-tone with accent span, subheadline, two CTAs, and a visual mock/image on the right using an Unsplash coffee image URL). Do NOT close </body> or </html>. Do NOT add any sections after the hero. End right after the hero </section>.`

  // Mobbin reference anchors (snapshot — no API quota) for body quality.
  let mobbinBlock = ''
  try {
    const { prefetchForgeMobbin, mobbinIterBlock } = await import('./forge-mobbin.mjs')
    mobbinBlock = mobbinIterBlock(await prefetchForgeMobbin(), 0) || ''
  } catch {}
  const mob = mobbinBlock ? `\n\n${mobbinBlock}` : ''

  // Split the body into TWO parallel GPT-OSS calls so the OSS half stops being
  // the wall. Each ~half the tokens → ~half the time. Stitched in order.
  const bodyTopUser = `${contract}${mob}

Produce ONLY these BODY SECTIONS, in order (no <!DOCTYPE>/<head>/<nav>/hero — they exist already). Start directly with the first <section>:
1. a stats band (4 vertical-appropriate metrics),
2. a story section (origin, family-run since 1987, sensory voice),
3. a 4-step "how we source" process row,
4. a product grid (3-4 coffee bags/subscriptions with prices).
Do NOT close </body> or </html>. Match the shared palette + fonts exactly.`

  const bodyBottomUser = `${contract}${mob}

Produce ONLY these BODY SECTIONS, in order (these come near the BOTTOM of the page; do NOT include <!DOCTYPE>/<head>/<nav>/hero). Start directly with the first <section>:
1. testimonials (3 specific quotes, named authors at real coffee businesses),
2. a subscription pricing trio (3 tiers, middle one highlighted),
3. a contact / newsletter CTA section,
4. a footer.
Then close </body></html>. Match the shared palette + fonts exactly.`

  const tHero = Date.now()
  const [hero, bodyTop, bodyBottom] = await Promise.all([
    geminiGenerate({ user: heroUser, maxOut: 6000, think: false, temperature: 0.5 }),
    forgeGenerate({ prompt: bodyTopUser, temperature: 0.55, maxTokens: 7000, reasoningEffort: 'low' }),
    forgeGenerate({ prompt: bodyBottomUser, temperature: 0.55, maxTokens: 7000, reasoningEffort: 'low' }),
  ])
  const parallelMs = Date.now() - tHero

  let heroHtml = stripFences(hero.text)
  let topHtml = stripFences(bodyTop.content)
  let bottomHtml = stripFences(bodyBottom.content)
  heroHtml = heroHtml.replace(/<\/body>\s*<\/html>\s*$/i, '')
  topHtml = topHtml.replace(/<\/body>\s*<\/html>\s*$/i, '')
  if (!/<\/html>/i.test(bottomHtml)) bottomHtml += '\n</body></html>'
  const html = `${heroHtml}\n${topHtml}\n${bottomHtml}`

  return {
    html,
    metrics: {
      mode: 'hero',
      parallelMs,
      geminiHeroMs: hero.ms,
      geminiHeroTokens: hero.usage.candidatesTokenCount,
      ossBodyTopMs: bodyTop.ms,
      ossBodyBottomMs: bodyBottom.ms,
      ossBodyTokens: (bodyTop.outputTokens || 0) + (bodyBottom.outputTokens || 0),
      mobbin: mobbinBlock ? 'on' : 'off',
      htmlChars: html.length,
    },
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────
const t0 = Date.now()
let result
try {
  result = MODE === 'hero' ? await runHero() : await runPlanner()
} catch (e) {
  console.error(`[combo] FAILED: ${e?.message || e}`)
  process.exit(1)
}
const wall = Date.now() - t0

writeFileSync(join(OUT_DIR, 'index.html'), result.html)
writeFileSync(join(OUT_DIR, 'meta.json'), JSON.stringify({ ...result.metrics, wallMs: wall, brief: BRIEF }, null, 2))

console.log(`\n[combo:${MODE}] === METRICS ===`)
for (const [k, v] of Object.entries(result.metrics)) console.log(`  ${k}: ${v}`)
console.log(`  TOTAL WALL: ${wall}ms  ${wall < 20000 ? '✅ under 20s' : '❌ over 20s'}`)

// Screenshot
try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(`file://${join(OUT_DIR, 'index.html')}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
  await p.waitForTimeout(700)
  await p.screenshot({ path: join(OUT_DIR, 'shot.png'), fullPage: true })
  await b.close()
  console.log(`  shot: ${OUT_DIR}/shot.png`)
} catch (e) {
  console.error(`  screenshot failed: ${e?.message || e}`)
}

// Always open in the browser
try {
  execSync(`open "${join(OUT_DIR, 'index.html')}"`)
  console.log(`  opened in browser`)
} catch {}
console.log(`\n[combo] artifacts: ${OUT_DIR}`)
