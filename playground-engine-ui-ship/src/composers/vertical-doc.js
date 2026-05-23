import { completeGemini } from '../llm/gemini.js'
import { completeGroq } from '../llm/groq.js'
import { BUILDER_SYSTEM, buildHeroContract, buildSharedContract, FAST_MODE, sectionList } from '../utils/contracts.js'
import { applyGenomeMerge } from '../utils/genome-merge.js'
import { injectMissingSections } from '../utils/section-inject.js'
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

function isPublicationRoute(route, grammar) {
  return route?.siteHint === 'blog' || grammar?.id === 'editorial-blog-index' || grammar?.id === 'editorial-newsroom'
}

function topOpenerInstruction({ route, grammar }) {
  if (isPublicationRoute(route, grammar)) {
    return `a publication index opener (${grammar?.heroPattern || 'featured post masthead + latest posts preview'} — NOT a SaaS marketing hero or product demo)`
  }
  return 'ONE stunning full-width hero <section>'
}

/**
 * Forge hero-combo split: Gemini owns ONLY nav + head + hero (above-the-fold craft).
 * Groq owns every content band below — run in parallel so wall ≈ max(gemini, groq).
 */
function resolveHeroComboSplit(secs, { route, grammar }) {
  if (isPublicationRoute(route, grammar)) {
    const topN = Math.min(1, secs.length)
    return { topN, topSecs: secs.slice(0, topN), tailSecs: secs.slice(topN), heroOnly: true }
  }
  return { topN: 0, topSecs: [], tailSecs: secs, heroOnly: true }
}

function tailBlogGridReminder(route, grammar) {
  if (!isPublicationRoute(route, grammar)) return ''
  return `

MANDATORY BLOG INDEX: include a "Latest posts" <section id="latest"> with a responsive grid (grid-cols-2 md:grid-cols-3 gap-6) of 6+ <article> cards. Each card needs: thumbnail, category chip, title, excerpt, and read link.`
}

function firstViewportLabel(route, grammar, { heroOnly } = {}) {
  if (isPublicationRoute(route)) return 'featured post masthead (article opener)'
  return heroOnly ? 'hero section' : 'hero'
}

function minSectionThreshold(plan, route) {
  if (plan?.pageKind === 'app-shell') return 4
  if (isPublicationRoute(route)) return 4
  if (route?.siteHint === 'editorial') return 4
  return 6
}

function padSectionDensity(html, plan, route) {
  if (isPublicationRoute(route)) return html
  const minSections = minSectionThreshold(plan, route)
  const sectionCount = (html.match(/<section\b/gi) || []).length
  if (sectionCount < minSections) {
    return injectMissingSections(html, plan, minSections - sectionCount, {
      insertBefore: /<footer\b/i,
    })
  }
  return html
}

async function buildGeminiTop(heroContract, plan, topSections, route, grammar, { heroOnly = false } = {}) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const publication = isPublicationRoute(route, grammar)
  const sectionBlock = topSections.length ? `THEN these full-width sections:\n${sectionList(topSections)}\n` : ''
  const prompt = `${heroContract}

Build the TOP of the page in ONE coherent pass:
- <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts + tailwind.config), <body class="bg-[${a.bg}] text-[${a.text}]">
- sticky full-width <nav> with inner <div class="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between"> — logo left, links center/right, never bare floating links
- ${opener}
${sectionBlock}
${publication
    ? `PUBLICATION INDEX (critical):
- Nav links: Home, Archive, About, Subscribe — NOT category/topic names in nav.
- Build ONE <section id="featured"> with compact featured post split (cover photo LEFT, title/byline/excerpt/read link RIGHT). Normal section height — no min-h-screen, no marketing billboard, no separate masthead/tagline band.
- Use h2 for the featured headline (not h1).`
    : `HERO SCALE (NON-NEGOTIABLE): hero MUST use min-h-[76vh], primary headline text-5xl md:text-7xl tracking-tight (or text-8xl), subhead + 1-2 CTAs, optional side visual. Kimi / Linear grade craft.`}
${heroOnly ? 'STOP after the hero </section>. Do NOT add feature/pricing/testimonial bands — Groq builds those next.' : ''}
Do NOT close </body> or </html>.`
  return completeGemini({ prompt, maxOutputTokens: heroOnly ? 2600 : 2800, temperature: 0.6 })
}

async function buildGroqTop(contract, plan, topSections, route, grammar) {
  const a = plan.visualWorld
  const opener = topOpenerInstruction({ route, grammar })
  const prompt = `${contract}

Build TOP ONLY: <!DOCTYPE html>, <head>, <body>, sticky <nav>, ${opener}.
${sectionList(topSections)}

STOP after nav + opener. Close every tag. Do NOT close </body></html>.`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.62,
    maxTokens: 2600,
    reasoningEffort: 'low',
  })
}

async function buildTail(contract, sections, topCount, { route, grammar, dense = false, heroOnly = false, closeDoc = true } = {}) {
  const existing = firstViewportLabel(route, grammar, { heroOnly })
  const densityBlock = dense
    ? `

DENSITY RULE: Each section needs a clear heading, 3-6 named cards/items/rows, concrete metrics or dates where appropriate, and meaningful visual surfaces. No empty vertical gaps.
BLOG/EDITORIAL: bylines, categories, read times, article grids that read as a publication.`
    : ''
  const footerBlock = closeDoc
    ? ' (one per role), then multi-column <footer>, then </body></html>'
    : ' (one per role). Do NOT add footer or close </body></html> yet.'
  const prompt = `${contract}

The <head>, <body>, sticky <nav>, and ${existing} ALREADY EXIST — do NOT repeat them.
Append EXACTLY ${sections.length} separate <section class="w-full"> elements${footerBlock}:
${sectionList(sections)}
${closeDoc ? tailBlogGridReminder(route, grammar) : ''}

CRITICAL: Each role = its own closed <section>. Match palette, fonts, decor EXACTLY. Use responsive grids for collections.${densityBlock}`
  return completeGroq({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.58,
    maxTokens: dense ? 4500 : 5000,
    reasoningEffort: 'low',
  })
}

async function buildTailParallel(contract, sections, topCount, ctx) {
  if (sections.length <= 6) {
    return buildTail(contract, sections, topCount, ctx)
  }
  const mid = Math.ceil(sections.length / 2)
  const first = sections.slice(0, mid)
  const second = sections.slice(mid)
  const [firstResult, secondResult] = await Promise.all([
    buildTail(contract, first, topCount, { ...ctx, closeDoc: false }),
    buildTail(contract, second, topCount + mid, { ...ctx, closeDoc: true }),
  ])
  const content = `${strip(firstResult.content)}\n${strip(secondResult.content)}`
  return { content, ms: Math.max(firstResult.ms || 0, secondResult.ms || 0) }
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const geminiHeroTimeoutMs = () =>
  parseInt(process.env.SHIP_GEMINI_HERO_TIMEOUT_MS || process.env.SHIP_GEMINI_TIMEOUT_MS || '17000', 10)

const geminiHeroRetryTimeoutMs = () =>
  parseInt(process.env.SHIP_GEMINI_HERO_RETRY_MS || '8000', 10)

function heroTopLooksUsable(html) {
  const body = String(html ?? '')
  return body.length > 700 && /<nav\b/i.test(body) && (/<section\b/i.test(body) || /<h1\b/i.test(body))
}

async function resolveHeroTop({ brief, contract, heroContract, plan, topSecs, route, grammar, variety, heroOnly }) {
  const timeoutMs = geminiHeroTimeoutMs()
  const groqTopPromise = buildGroqTop(contract, plan, topSecs, route, grammar)
  const buildGemini = () => buildGeminiTop(heroContract, plan, topSecs, route, grammar, { heroOnly })

  const waitGemini = (ms) =>
    Promise.race([
      buildGemini(),
      sleep(ms).then(() => {
        const err = new Error(`gemini hero timeout after ${ms}ms`)
        err.code = 'GEMINI_TIMEOUT'
        throw err
      }),
    ])

  try {
    const topResult = await waitGemini(timeoutMs)
    if (heroTopLooksUsable(topResult.content)) {
      return { topResult, topSource: 'gemini', geminiMs: topResult.ms || 0, groqTopMs: 0 }
    }
  } catch {
    // fall through to retry / groq insurance
  }

  try {
    const retryResult = await waitGemini(geminiHeroRetryTimeoutMs())
    if (heroTopLooksUsable(retryResult.content)) {
      return { topResult: retryResult, topSource: 'gemini-retry', geminiMs: retryResult.ms || 0, groqTopMs: 0 }
    }
  } catch {
    // fall through to groq insurance
  }

  const topResult = await groqTopPromise
  return { topResult, topSource: 'groq-fallback', geminiMs: 0, groqTopMs: topResult.ms || 0 }
}

/** Production: Gemini hero+nav ∥ Groq body — forge combo, hard-capped at ~14s for hero leg. */
async function composeQualityHybrid({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const heroContract = buildHeroContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 9)
  const split = resolveHeroComboSplit(secs, { route, grammar })
  const { topN, topSecs, tailSecs, heroOnly } = split

  const t0 = Date.now()
  const tailPromise = tailSecs.length
    ? buildTailParallel(contract, tailSecs, topN, { route, grammar, dense: true, heroOnly })
    : Promise.resolve({ content: '\n</body></html>', ms: 0 })

  const { topResult, topSource, geminiMs, groqTopMs } = await resolveHeroTop({
    brief,
    contract,
    heroContract,
    plan,
    topSecs,
    route,
    grammar,
    variety,
    heroOnly,
  })
  const tailResult = await tailPromise
  const parallelMs = Date.now() - t0

  let topHtml = trimIncompleteSuffix(strip(topResult.content))
  let tailHtml = trimIncompleteSuffix(strip(tailResult.content))
  if (badLeg(tailHtml)) tailHtml = '\n<footer class="w-full py-8"></footer>\n</body></html>'

  let html = stitch(topHtml, tailHtml)
  html = padSectionDensity(html, plan, route)
  const validation = validateStitchedHtml(html)
  html = applyGenomeMerge(html, plan, route)
  html = sanitizeHtml(html, plan, route, brief)

  return {
    html,
    metrics: {
      buildMode:
        topSource === 'gemini' || topSource === 'gemini-retry'
          ? 'vertical-doc-gemini-hero-combo'
          : 'vertical-doc-gemini-hero-combo-groq-fallback',
      heroTopSource: topSource,
      geminiMs,
      groqTopMs,
      ossMs: (groqTopMs || 0) + (tailResult.ms || 0),
      parallelMs,
      topSections: topSecs.length + (heroOnly ? 1 : 0),
      tailSections: tailSecs.length,
      stitchOk: validation.ok,
      stitchIssues: validation.issues,
    },
  }
}

/** Bench-only: Groq-only parallel (lower hero craft). */
async function composeFastParallel({ brief, plan, route, variety, grammar }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)
  const secs = (plan.sections || []).slice(0, 6)
  const topN = Math.min(2, secs.length)
  const topSecs = secs.slice(0, topN)
  const tailSecs = secs.slice(topN)

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
  html = applyGenomeMerge(html, plan, route)
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
