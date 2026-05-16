/**
 * Forge lib — direct Groq homepage caller, audit-aware system prompt,
 * composition + aesthetic variance, optional reference fingerprint, optional
 * winner seed, optional self-critique fix-pass.
 */
import {
  GROQ_API_KEY,
  GROQ_HOST,
  HOMEPAGE_MODEL,
  LLM_CONFIG,
} from '@ship-fast/engine/config.js'
import { stripGroqReasoningLeak } from '@ship-fast/engine/llm/utils.js'
import { referencePromptBlock } from './forge-reference.mjs'

const URL = `${GROQ_HOST}/openai/v1/chat/completions`

const HOMEPAGE_SYSTEM_LEAN = `You are a world-class frontend engineer + visual designer. Output ONLY a complete self-contained HTML doc starting with <!DOCTYPE html>. No markdown, no fences, no prose.

Build a B2B SaaS marketing homepage at reference-tier quality (match design-03-saas-homepage energy).

HARD REQS (each auto-scored — meet every one):
1. ≥12,000 chars. Full HTML document.
2. ≥7 <section> + <header> + <footer>. Every section ≥200px tall with real content (heading + paragraph/cards), NO empty bands.
3. <head>: viewport meta + <script src="https://cdn.tailwindcss.com"> + <script src="https://unpkg.com/lucide@latest"> + tailwind.config={theme:{extend:{colors:{background,surface,elev,primary},fontFamily:{display,body,mono},keyframes:{liquid:{...}},animation:{liquid:'liquid 22s ease-in-out infinite'},boxShadow}}}.
4. Hero MUST contain LITERAL TEXT "radial-gradient(" appearing 3 OR MORE times in the HTML output — count them yourself. Each instance is on an absolutely-positioned <div> with classes containing both "blur-3xl" AND "motion-reduce:hidden" AND opacity-40..70, e.g.:
   <div class="absolute -top-24 -left-24 w-[520px] h-[520px] blur-3xl opacity-60 motion-reduce:hidden animate-liquid" style="background: radial-gradient(circle at 30% 30%, rgba(167,139,250,0.55), transparent 70%);"></div>
Plus: <canvas id="hero-canvas"> with requestAnimationFrame particle loop reactive to mousemove (respect prefers-reduced-motion). theme.extend.keyframes.liquid (translate+rotate+scale ~22s) + animate-liquid on ≥2 orbs. ONE band uses -skew-y-3 / clip-path polygon / keyframed rotate.
5. ≥4 [data-reveal] elements. CRITICAL: never add opacity-0 / translate-y-* in the initial markup or via JS on page load. The page MUST be fully visible without JS. JS may only ADD class reveal-ready to <html> then animate IN existing visible elements (e.g. transition-opacity). Empty reveal panels are forbidden.
6. ≥2 [data-magnet] CTAs with pointer parallax in inline script.
7. Single inline IIFE before </body>, every querySelector null-guarded. Wire: data-mobile-nav + data-mobile-nav-toggle (is-open class); data-accordion FAQ ≥5 items each with data-accordion-trigger; data-pricing-billing + [data-billing="month"|"year"] toggling [data-show-monthly]/[data-show-yearly]; ≥2 [data-counter][data-counter-target] count-up on intersection; lucide.createIcons() after DOM ready + after dynamic updates.
8. Pricing: 3 tiers, middle featured with ring-2 ring-offset-2; monthly+yearly prices both wired through toggle.
9. Three Google Fonts (fonts.googleapis.com). Display ∈ {Fraunces,Syne,Outfit,DM Serif Display,Playfair Display,Space Grotesk,Bricolage Grotesque,Instrument Serif,Manrope,Sora}. Body: Inter/DM Sans/Manrope. Mono: JetBrains Mono/IBM Plex Mono. NEVER Cabinet Grotesk/Geist (not Google-hosted). Map all 3 in tailwind.config.fontFamily.
10. Dark theme. Tinted slate/zinc bg. Cards: backdrop-blur + ring-1 ring-white/10. Body paragraphs text-slate-300 (never text-slate-500 on text-lg/text-base/leading-relaxed). 4.5:1 contrast on body text.
11. Real anchors only. ≥8 nav links across header+footer. ≤55 total href="#" placeholders.
12. ≥3 real <button> CTAs.
13. Penultimate CTA band before footer. Footer ≥4 columns.
14. Lucide icons via data-lucide. STRICT BAN — these names DO NOT EXIST in Lucide and silently render blank: github, twitter, linkedin, discord, facebook, instagram, youtube, "x", "chart", "close", "search-icon", "envelope", "phone-icon". Replace: x → x-circle. chart → bar-chart-3 OR pie-chart. close → x-circle. github/twitter/linkedin/etc → inline <svg viewBox="0 0 24 24"> with the brand path. For brand/social icons use inline <svg viewBox="0 0 24 24">. Safe Lucide names: arrow-right, arrow-up-right, check, check-circle, x-circle, menu, sparkles, zap, shield, rocket, layers, code, terminal, cpu, gauge, lock, users, bot, workflow, git-branch, chevron-down, chevron-right, star, mail, search, settings, bell, user, calendar, clock, globe, map-pin, eye, copy, trash-2, plus, minus, info, alert-circle, file-text, folder, image, tag, bookmark, share-2, download, upload, link-2, external-link, bar-chart-3, pie-chart, activity, trending-up, target, flame, lightbulb, wand-2. Sizes w-5 h-5 md:w-6 md:h-6.
15. NO <style> tags for theme/layout/animation. Vanilla JS only. Only external scripts: Tailwind + Lucide CDNs.
16. Specific product-credible copy. NO Ship Fast / fake addresses / Lorem ipsum / generic placeholders. Concrete numbers ("3.2× faster", "14-day trial"). 3+ testimonial cards with named authors+roles.`

export const FORGE_DEFAULT_PROMPT =
  'A B2B SaaS marketing site for an AI-first agentic workflow product for engineering teams: aurora hero, social proof strip, feature grid, pricing band with monthly/yearly toggle, FAQ, penultimate CTA band, multi-column footer.'

const HERO_ARCHETYPES = [
  'Hero archetype: SPLIT — left text column (badge + headline + subhead + 2 CTAs + trust chips), right column a layered visual panel (mesh + product preview frame).',
  'Hero archetype: CENTERED — oversized display headline center-aligned, max-w-4xl, dual CTAs below, proof strip directly under.',
  'Hero archetype: BENTO — 2x2 bento immediately under nav: top-left big text card, top-right product mock card, bottom-left metric card, bottom-right testimonial snippet card.',
  'Hero archetype: EDITORIAL — left column with eyebrow + serif headline + body paragraph + pull-quote, right column oversized numeral watermark + CTAs.',
  'Hero archetype: POSTER — typographic poster: word lockup with line breaks, oversized number/word as background watermark, single CTA, asymmetric byline footer.',
]

const PRICING_ARCHETYPES = [
  'Pricing archetype: 3-card row, middle tier featured with ring-2 ring-offset-2 ring-primary and a "Most popular" pill, monthly/yearly segmented toggle above.',
  'Pricing archetype: comparison table — features as rows, 3 tiers as columns, check/x icons per cell, toggle above.',
  'Pricing archetype: 3 tiers stacked vertically on mobile, side-by-side on lg, each with badge, price, 6 feature lines, CTA button.',
]

const COMPOSITION_NUDGES = [
  'Section rhythm: alternate full-bleed and contained (max-w-7xl) sections; one diagonal -skew-y-3 transition band between features and pricing.',
  'Section rhythm: every other section gets bg-elev with ring-1 ring-white/5; rule lines between feature columns.',
  'Section rhythm: editorial — large eyebrow tags above each section heading, generous py-24, asymmetric column widths.',
]

const AESTHETIC_NUDGES = [
  'Aesthetic: editorial luxury — Fraunces display, deep aubergine + champagne accents, oversize numerals as watermark.',
  'Aesthetic: brutalist tech — Space Grotesk display, electric lime accent on near-black, monospaced labels, hairline borders.',
  'Aesthetic: aurora midnight — DM Serif Display, violet/teal/amber blobs, pointer-reactive constellation canvas.',
  'Aesthetic: quiet museum minimal — Outfit display, parchment elev, single citrus accent, gallery-grid bento.',
  'Aesthetic: neon nightlife — Syne display, magenta + cyan glow, scanline-overlay canvas, glitch hover on CTAs.',
  'Aesthetic: organic wellness — Fraunces display, sage + clay palette, soft mesh blobs, generous whitespace.',
  'Aesthetic: festival maximalism — Syne display, layered confetti gradients, oversize emoji-free typographic poster hero.',
  'Aesthetic: tactile craft — DM Serif Display, paper-grain noise overlay, terracotta + ink accents, letterpress pricing card.',
  'Aesthetic: nordic SaaS — Outfit display, glacier blue + frost white on charcoal, sharp grid bento.',
  'Aesthetic: cyberpunk dossier — JetBrains Mono everywhere except hero (Space Grotesk), CRT scan canvas, amber on inkblack.',
]

export function pickVariation(i) {
  return {
    aesthetic: AESTHETIC_NUDGES[i % AESTHETIC_NUDGES.length],
    hero: HERO_ARCHETYPES[Math.floor(i / 2) % HERO_ARCHETYPES.length],
    pricing: PRICING_ARCHETYPES[i % PRICING_ARCHETYPES.length],
    composition: COMPOSITION_NUDGES[Math.floor(i / 3) % COMPOSITION_NUDGES.length],
  }
}

export function buildVariantPrompt(basePrompt, i, opts = {}) {
  const v = pickVariation(i)
  const ref = opts.includeReference !== false ? referencePromptBlock() : ''
  const seed = opts.winnerSeedBlock ? `\n${opts.winnerSeedBlock}` : ''
  const mobbin = opts.mobbinBlock ? `\n${opts.mobbinBlock}` : ''
  // Pack the four variation axes onto two compact lines to keep input tokens lean.
  const variation = `${v.aesthetic} ${v.hero}\n${v.pricing} ${v.composition}`
  return `${basePrompt}\n\n${variation}${ref}${mobbin}${seed}`
}

/**
 * Tempo schedule. v1 ran T=0.55–0.75 with 17/50 keep rate. Mirror that range
 * so we don't pay extra reasoning latency for low-T determinism.
 * - 0..9   : 0.6 (tight-ish, balanced)
 * - 10..34 : 0.65 / 0.7 / 0.75 (explore)
 * - 35..49 : 0.6 (converge)
 */
export function temperatureForIter(i) {
  if (i < 10) return 0.6
  if (i < 35) {
    const cyc = (i - 10) % 3
    return cyc === 0 ? 0.65 : cyc === 1 ? 0.7 : 0.75
  }
  return 0.6
}

/**
 * Direct call to Groq.
 */
export async function forgeGenerate({
  prompt = FORGE_DEFAULT_PROMPT,
  model = HOMEPAGE_MODEL || 'openai/gpt-oss-120b',
  system = HOMEPAGE_SYSTEM_LEAN,
  temperature = LLM_CONFIG.homepage.temperature,
  maxTokens = 12000,
  reasoningEffort = 'low',
  reasoningFormat = 'hidden',
  signal,
} = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
    stream: false,
    reasoning_effort: reasoningEffort,
    reasoning_format: reasoningFormat,
  }
  const t0 = Date.now()
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${text.slice(0, 300)}`)
  }
  const data = await res.json()
  const ms = Date.now() - t0
  if (data.error) {
    return { content: '', ms, error: data.error.message ?? String(data.error) }
  }
  const usage = data.usage ?? {}
  return {
    content: stripGroqReasoningLeak(data.choices?.[0]?.message?.content ?? ''),
    ms,
    inputTokens: usage.prompt_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? 0,
    cost: 0,
    model,
  }
}

/**
 * Self-critique fix pass: ask the model to find 3 weakest details + emit fixed HTML.
 * Returns { content, ms } or null if budget exceeded.
 */
export async function forgeFixPass(html, prompt, { remainingBudgetMs = 6000, model } = {}) {
  if (remainingBudgetMs < 4000) return null
  const sys =
    'You are a frontend engineer. Output ONLY a complete HTML document — no markdown, no fences, no prose. Apply minimal targeted fixes to the input HTML to address the 3 weakest details (color contrast, typography hierarchy, empty bands, generic copy, missing depth). Do not regress any working feature. Keep all data-* hooks intact.'
  const user = `Brief: ${prompt}\n\nFix the 3 weakest details in this HTML and emit the FULL fixed HTML. Reply with only HTML.\n\n<<<HTML>>>\n${html}\n<<<END>>>`
  return forgeGenerate({
    system: sys,
    prompt: user,
    temperature: 0.3,
    maxTokens: 14000,
    reasoningEffort: 'low',
    model,
  })
}

/**
 * Build a winner-seed prompt block from a previously kept iteration: extract
 * theme.extend snippet + section ID list. Inject as soft style anchor.
 */
export function buildWinnerSeed(html) {
  if (!html) return ''
  const cfgMatch = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\n\}\s*;)/)
  const themeBlock = cfgMatch ? cfgMatch[1].slice(0, 1400) : ''
  const sectionIds = [...new Set((html.match(/<section[^>]*id=["']([^"']+)["']/gi) || []).map((s) => s.match(/id=["']([^"']+)["']/i)?.[1]).filter(Boolean))]
  if (!themeBlock && sectionIds.length === 0) return ''
  return `\n── PRIOR-WINNER STYLE SEED (use as soft palette/typography anchor; vary aesthetic) ──\nSection IDs: ${sectionIds.join(', ')}\n${themeBlock ? `Tailwind theme.extend snippet:\n${themeBlock}` : ''}`
}
