import { completeGemini } from '../llm/gemini.js'
import { completeGroq } from '../llm/groq.js'
import { BUILDER_SYSTEM, buildSharedContract, FAST_MODE, sectionList } from '../utils/contracts.js'
import { applyGenomeMerge } from '../utils/genome-merge.js'
import { repairAttrs, sanitizeHtml } from '../utils/postprocess.js'
import {
  closeTopSegmentSafely,
  sealTopBeforeTail,
  stripFences,
  stripOrphanCloseBurst,
  trimIncompleteSuffix,
  validateStitchedHtml,
} from '../utils/seam-repair.js'

const REFUSAL = /\bi'?m sorry\b/i

function strip(html) {
  return stripFences(html).replace(/<\/body>\s*<\/html>\s*$/i, '')
}

function badLeg(html) {
  const s = strip(html)
  return !s || s.length < 200 || (REFUSAL.test(s.slice(0, 120)) && !/<section\b/i.test(s))
}

function balanceTopDivs(topHtml) {
  return closeTopSegmentSafely(String(topHtml ?? ''), { maxClose: 8 })
}

function topOpenerInstruction({ route, grammar }) {
  if (route?.siteHint === 'blog' || grammar?.id === 'editorial-blog-index' || grammar?.id === 'editorial-newsroom') {
    return `a publication index opener (${grammar?.heroPattern || 'featured post masthead only'} — NOT a SaaS marketing hero or product demo)`
  }
  return 'a STUNNING full-width hero'
}

function isPublicationRoute(route, grammar) {
  return route?.siteHint === 'blog' || grammar?.id === 'editorial-blog-index' || grammar?.id === 'editorial-newsroom'
}

/** Blog homes must keep latest grid in the tail — Gemini top often eats the token budget on featured alone. */
function resolveSectionSplit(secs, { route, grammar }) {
  if (isPublicationRoute(route, grammar)) {
    return { topN: 1, topSecs: secs.slice(0, 1), tailSecs: secs.slice(1) }
  }
  const topN = Math.min(3, Math.max(2, Math.ceil(secs.length / 2)))
  return { topN, topSecs: secs.slice(0, topN), tailSecs: secs.slice(topN) }
}

function tailBlogGridReminder(route, grammar) {
  if (!isPublicationRoute(route, grammar)) return ''
  return `

MANDATORY BLOG INDEX: include a "Latest posts" <section id="latest"> with a responsive grid (grid-cols-2 md:grid-cols-3 gap-6) of 6+ <article> cards. Each card needs: <div data-img="..."> thumbnail, category chip, title, excerpt, and read link. Match ship-fast.devliv.io publication index density — NOT a lone featured hero with no archive grid.`
}

function firstViewportLabel(route, grammar) {
  if (isPublicationRoute(route)) return 'featured post masthead (article opener)'
  return 'hero'
}

async function buildGeminiTop(contract, plan, topSections, route, grammar) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const prompt = `${contract}

Build the TOP of the page in ONE coherent pass: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts + tailwind.config + <body class="bg-[${a.bg}] text-[${a.text}]">), sticky full-width <nav>, ${opener}, THEN these full-width sections:
${sectionList(topSections)}

Never use the word "hero" in comments or headings for publication/blog pages. No min-h-screen or min-h-[70vh+] viewport bands.
This is what users judge first — gorgeous hierarchy, generous rhythm, DECOR applied with restraint. Do NOT close </body> or </html>.`
  return completeGemini({ prompt, maxOutputTokens: 3400, temperature: 0.6 })
}

async function buildGroqTop(contract, plan, topSections, route, grammar) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const prompt = `${contract}

Build TOP ONLY: <!DOCTYPE html>, <head>, <body>, sticky <nav>, ${opener}.
${sectionList(topSections)}

Never label this a "hero" on publication/blog pages. No min-h-screen or min-h-[70vh+] bands.
STOP after nav + opener (+ first section if listed). Close every tag. Do NOT close </body></html>.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.62,
    maxTokens: 2600,
    reasoningEffort: 'low',
  })
}

async function buildTail(contract, sections, topCount, { route, grammar } = {}) {
  const existing = firstViewportLabel(route, grammar)
  const prompt = `${contract}

The <head>, <body>, sticky <nav>, ${existing}, and the first ${topCount} section(s) ALREADY EXIST — do NOT repeat them.
Append these FULL-WIDTH sections (each <section class="w-full"> with inner mx-auto max-w-7xl), then multi-column <footer>, then </body></html>:
${sectionList(sections)}
${tailBlogGridReminder(route, grammar)}

Match palette, fonts, and decor EXACTLY. Use the GRID RULE for collections. Start with the first new <section>.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.58,
    maxTokens: 5000,
    reasoningEffort: 'low',
  })
}

function stitch(topHtml, tailHtml) {
  let top = trimIncompleteSuffix(stripOrphanCloseBurst(repairAttrs(strip(topHtml))))
  let tail = stripOrphanCloseBurst(repairAttrs(strip(tailHtml)))
  top = balanceTopDivs(top)
  top = sealTopBeforeTail(top, tail)
  if (!tail || badLeg(tail)) tail = '\n<footer class="w-full py-8"></footer>\n</body></html>'
  if (!/<\/html>/i.test(tail)) tail += '\n</body></html>'
  return `${top}\n${tail}`
}

/** Quality path: Gemini top (hero + first bands) + Groq tail — matches forge-gemini-native. */
async function composeQualityHybrid({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 8)
  const { topN, topSecs, tailSecs } = resolveSectionSplit(secs, { route, grammar })

  const t0 = Date.now()
  const [topResult, tailResult] = await Promise.all([
    buildGeminiTop(contract, plan, topSecs, route, grammar),
    tailSecs.length
      ? buildTail(contract, tailSecs, topN, { route, grammar })
      : Promise.resolve({ content: '\n</body></html>', ms: 0 }),
  ])
  const parallelMs = Date.now() - t0

  let topHtml = trimIncompleteSuffix(strip(topResult.content))
  let tailHtml = trimIncompleteSuffix(strip(tailResult.content))
  if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

  let html = stitch(topHtml, tailHtml)
  const validation = validateStitchedHtml(html)
  html = applyGenomeMerge(html, plan)
  html = sanitizeHtml(html, plan, route, brief)

  return {
    html,
    metrics: {
      buildMode: 'vertical-doc-gemini-hybrid',
      geminiMs: topResult.ms || 0,
      ossMs: tailResult.ms || 0,
      parallelMs,
      topSections: topSecs.length,
      tailSections: tailSecs.length,
      stitchOk: validation.ok,
      stitchIssues: validation.issues,
    },
  }
}

/** Fast bench path: parallel Groq only (lower craft). */
async function composeFastParallel({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 6)
  const { topN, topSecs, tailSecs } = resolveSectionSplit(secs, { route, grammar })

  const t0 = Date.now()
  const [topResult, tailResult] = await Promise.all([
    buildGroqTop(contract, plan, topSecs, route, grammar),
    tailSecs.length ? buildTail(contract, tailSecs, topN, { route, grammar }) : Promise.resolve({ content: '\n</body></html>', ms: 0 }),
  ])
  const parallelMs = Date.now() - t0

  let topHtml = trimIncompleteSuffix(strip(topResult.content))
  let tailHtml = trimIncompleteSuffix(strip(tailResult.content))
  if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

  let html = stitch(topHtml, tailHtml)
  const validation = validateStitchedHtml(html)
  html = applyGenomeMerge(html, plan)
  html = sanitizeHtml(html, plan, route, brief)

  return {
    html,
    metrics: {
      buildMode: 'vertical-doc-fast-groq',
      geminiMs: 0,
      ossMs: (topResult.ms || 0) + (tailResult.ms || 0),
      parallelMs,
      topSections: topSecs.length,
      tailSections: tailSecs.length,
      stitchOk: validation.ok,
      stitchIssues: validation.issues,
    },
  }
}

export async function composeVerticalDoc(args) {
  if (FAST_MODE) return composeFastParallel(args)
  return composeQualityHybrid(args)
}
