import { completeGemini } from '../llm/gemini.js'
import { completeGroq } from '../llm/groq.js'
import { BUILDER_SYSTEM, buildSharedContract, FAST_MODE, sectionList } from '../utils/contracts.js'
import { applyGenomeMerge } from '../utils/genome-merge.js'
import { repairAttrs, sanitizeHtml } from '../utils/postprocess.js'
import { injectMissingSections } from '../utils/section-inject.js'
import {
  closeTopSegmentSafely,
  sealTopBeforeTail,
  stripFences,
  stripOrphanCloseBurst,
  trimIncompleteSuffix,
  validateStitchedHtml,
} from '../utils/seam-repair.js'

const REFUSAL = /\bi'?m sorry\b/i
const GEMINI_QUOTA_RE = /\bgemini\s+429\b|quota|spending cap|rate limit|resource_exhausted/i

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

function isPublicationRoute(route, grammar) {
  return route?.siteHint === 'blog' || grammar?.id === 'editorial-blog-index' || grammar?.id === 'editorial-newsroom'
}

function topOpenerInstruction({ route, grammar }) {
  if (isPublicationRoute(route, grammar)) {
    return `a publication index opener (${grammar?.heroPattern || 'featured post masthead + latest posts preview'} — NOT a SaaS marketing hero or product demo)`
  }
  return 'a STUNNING full-width hero'
}

async function buildGeminiTop(contract, plan, topSections, route, grammar) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const publication = isPublicationRoute(route, grammar)
  const prompt = `${contract}

Build the TOP of the page in ONE coherent pass: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts + tailwind.config + <body class="bg-[${a.bg}] text-[${a.text}]">), sticky full-width <nav>, ${opener}, THEN these full-width sections:
${sectionList(topSections)}

CRITICAL SECTION RULE: Each role above MUST be its own <section class="w-full ..."> ... </section> block. Never merge two roles into one <section>. The first section IS the hero — make it stunning with min-h-[76vh] and decisive display typography.
${publication
    ? 'PUBLICATION RULE: this is not a marketing hero. Use a compact featured masthead, normal section height, byline/date/excerpt, and continue into the archive grid.'
    : 'HERO SCALE (NON-NEGOTIABLE): The hero section MUST carry min-h-[76vh] and the primary headline MUST use text-5xl md:text-7xl tracking-tight (or larger: text-8xl). This is a hard quality gate.'}
Gorgeous hierarchy, generous rhythm, DECOR applied with restraint. Do NOT close </body> or </html>.`
  return completeGemini({ prompt, maxOutputTokens: 3200, temperature: 0.6 })
}

async function buildGroqTop(contract, plan, topSections, route, grammar) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const prompt = `${contract}

Build TOP ONLY: <!DOCTYPE html>, <head>, <body>, sticky <nav>, ${opener}.
${sectionList(topSections)}

STOP after nav + opener (+ first section if listed). Close every tag. Do NOT close </body></html>.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.62,
    maxTokens: 2600,
    reasoningEffort: 'low',
  })
}

/**
 * Build a single <section> element for a tail role.
 * Each call runs in parallel with Gemini top — no cross-section dependency.
 */
async function buildSingleSection(contract, section) {
  const prompt = `${contract}

Build ONLY this ONE complete <section> element for the homepage — no <head>, no <nav>, no other sections:
Role: ${section.role}
Content: ${section.contains}

Requirements:
- <section class="w-full py-20 scroll-mt-24 [palette bg class]"> wrapping <div class="mx-auto max-w-7xl px-6">
- Use the GRID RULE for any collection (products, cards, stats): responsive grid spanning full inner width
- Image placeholders: <div data-img="[concrete subject]" class="w-full aspect-[4/3] rounded-xl bg-[surface]/40 border border-[muted]/30"></div>
- Match palette, fonts, and decor from the contract EXACTLY
- Real specific copy — no lorem, no generic filler
- Close ALL tags before the end of your output
- End IMMEDIATELY after the closing </section>. Do NOT include <footer>, </body>, or </html>.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.6,
    maxTokens: 2000,
    reasoningEffort: 'low',
  })
}

/** Build the site footer as a standalone <footer> + closing tags. */
async function buildFooter(contract, footerSection) {
  const contains = footerSection?.contains || 'multi-column links, brand mark, copyright'
  const prompt = `${contract}

Build ONLY the site footer — no <head>, no <nav>, no <section> elements:
Content: ${contains}

Requirements:
- <footer class="w-full py-12 border-t [palette class]"> wrapping <div class="mx-auto max-w-7xl px-6 grid [columns]">
- 3-4 columns with real links grouped by category
- Brand mark + copyright line at the bottom
- Match palette and fonts from the contract EXACTLY
- Close all tags, then output exactly: </body></html>`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.55,
    maxTokens: 1200,
    reasoningEffort: 'low',
  })
}

async function buildTail(contract, sections, topCount) {
  const prompt = `${contract}

The <head>, <body>, sticky <nav>, hero, and the first ${topCount} section(s) ALREADY EXIST — do NOT repeat them.
Append EXACTLY ${sections.length} separate <section> elements — one per role below — then a multi-column <footer>, then </body></html>:
${sectionList(sections)}

CRITICAL: Each role above MUST be its own <section class="w-full ..."> ... </section> block. Never merge two roles into one <section>. Every section must be complete and fully closed before starting the next. Match palette, fonts, and decor EXACTLY. Use the GRID RULE for collections.

DENSITY RULE: Make the lower page feel inhabited, not flat. Each non-footer section needs a clear editorial/product heading, 3-6 named cards/items/rows, one concrete metric or date where appropriate, and at least one meaningful visual surface or structured table/list. Use compact layered grids and sidebars instead of large empty vertical gaps.
BLOG/EDITORIAL RULE: For publications, include bylines, categories, read times, issue/archive modules, writer or contributor references, newsletter framing, and article grids that visibly read as a publication.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.58,
    maxTokens: 7000,
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

/** Quality path: Gemini top + coherent Groq tail, with isolated workers kept as an opt-out fallback. */
async function composeQualityHybrid({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 9)
  // Gemini handles hero + proof (2 sections, ~3000 tokens) — reliably under ~14s.
  // Up to 3 content sections get parallel Groq workers — footer gets its own lightweight worker.
  // Section padding guarantees the 6-section threshold even if Groq workers under-deliver.
  const topN = Math.min(2, secs.length)
  const topSecs = secs.slice(0, topN)
  const allTailSecs = secs.slice(topN)

  // Separate footer role from real content sections
  const footerSec = allTailSecs.find((s) => s.role === 'footer') || null
  const contentTailSecs = allTailSecs.filter((s) => s.role !== 'footer').slice(0, 4)
  const denseTail = process.env.KIMI_DENSE_TAIL !== '0'

  const t0 = Date.now()

  if (denseTail && allTailSecs.length) {
    const [topResult, tailResult] = await Promise.all([
      buildGeminiTop(contract, plan, topSecs),
      buildTail(contract, allTailSecs, topN),
    ])
    const parallelMs = Date.now() - t0
    let topHtml = trimIncompleteSuffix(strip(topResult.content))
    let tailHtml = trimIncompleteSuffix(strip(tailResult.content))
    if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

    let html = stitch(topHtml, tailHtml)
    const sectionCount = (html.match(/<section\b/gi) || []).length
    const minSections = plan?.pageKind === 'app-shell' ? 4 : route?.siteHint === 'editorial' ? 4 : 6
    if (sectionCount < minSections) {
      html = injectMissingSections(html, plan, minSections - sectionCount)
    }

    const validation = validateStitchedHtml(html)
    html = applyGenomeMerge(html, plan)
    html = sanitizeHtml(html, plan, route)

    return {
      html,
      metrics: {
        buildMode: 'vertical-doc-gemini-dense-tail',
        geminiMs: topResult.ms || 0,
        ossMs: tailResult.ms || 0,
        parallelMs,
        topSections: topSecs.length,
        tailSections: allTailSecs.length,
        stitchOk: validation.ok,
        stitchIssues: validation.issues,
      },
    }
  }

  // Compatibility path: Gemini top + isolated section workers + footer worker.
  const [topResult, ...workerResults] = await Promise.all([
    buildGeminiTop(contract, plan, topSecs, route, grammar),
    ...contentTailSecs.map((sec) => buildSingleSection(contract, sec)),
    buildFooter(contract, footerSec),
  ])
  const parallelMs = Date.now() - t0

  // Last workerResult is the footer
  const footerResult = workerResults[workerResults.length - 1]
  const sectionResults = workerResults.slice(0, -1)

  // Concatenate: top + content sections + footer
  const topHtml = trimIncompleteSuffix(strip(topResult.content))
  const sectionPieces = sectionResults
    .map((r) => trimIncompleteSuffix(strip(r?.content || '')).replace(/<\/body>[\s\S]*$/i, ''))
    .filter((p) => p && p.length > 100)

  // Extract footer block from footer worker output
  const footerRaw = footerResult?.content || ''
  const footerMatch = footerRaw.match(/(<footer\b[\s\S]*<\/footer>)/i)
  const footerHtml = footerMatch ? footerMatch[1] : '<footer class="w-full py-8"></footer>'

  let tailHtml = [...sectionPieces, footerHtml, '</body></html>'].join('\n')
  if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

  let html = stitch(topHtml, tailHtml)

  // Count sections and inject deterministic fallback sections if under the threshold.
  const sectionCount = (html.match(/<section\b/gi) || []).length
  const minSections = plan?.pageKind === 'app-shell' ? 4 : route?.siteHint === 'editorial' ? 4 : 6
  if (sectionCount < minSections) {
    html = injectMissingSections(html, plan, minSections - sectionCount)
  }

  const validation = validateStitchedHtml(html)
  html = applyGenomeMerge(html, plan)
  html = sanitizeHtml(html, plan, route)

  const ossMs = workerResults.reduce((sum, r) => sum + (r?.ms || 0), 0)

  return {
    html,
    metrics: {
      buildMode: 'vertical-doc-gemini-hybrid',
      geminiMs: topResult.ms || 0,
      ossMs,
      parallelMs,
      topSections: topSecs.length,
      tailSections: allTailSecs.length,
      stitchOk: validation.ok,
      stitchIssues: validation.issues,
    },
  }
}

function isGeminiQuotaError(error) {
  return GEMINI_QUOTA_RE.test(String(error?.message || error || ''))
}

/** Fast bench path: parallel Groq only (lower craft). */
async function composeFastParallel({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 6)
  const topSecs = secs.slice(0, 1)
  const tailSecs = secs.slice(1)

  const t0 = Date.now()
  const [topResult, tailResult] = await Promise.all([
    buildGroqTop(contract, plan, topSecs, route, grammar),
    tailSecs.length ? buildTail(contract, tailSecs, 1) : Promise.resolve({ content: '\n</body></html>', ms: 0 }),
  ])
  const parallelMs = Date.now() - t0

  let topHtml = trimIncompleteSuffix(strip(topResult.content))
  let tailHtml = trimIncompleteSuffix(strip(tailResult.content))
  if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

  let html = stitch(topHtml, tailHtml)
  const validation = validateStitchedHtml(html)
  html = applyGenomeMerge(html, plan)
  html = sanitizeHtml(html, plan, route)

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
  try {
    return await composeQualityHybrid(args)
  } catch (error) {
    if (!isGeminiQuotaError(error)) throw error
    const fallback = await composeFastParallel(args)
    return {
      ...fallback,
      metrics: {
        ...fallback.metrics,
        buildMode: `${fallback.metrics.buildMode}-quota-fallback`,
        geminiFallback: 'quota',
        geminiError: String(error?.message || error).slice(0, 240),
      },
    }
  }
}
