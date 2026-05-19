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
import { mobbinDoctrineBlock } from './forge-mobbin.mjs'

const URL = `${GROQ_HOST}/openai/v1/chat/completions`

const HOMEPAGE_SYSTEM_LEAN = `You are a world-class frontend engineer + visual designer. Output ONLY a complete self-contained HTML doc starting with <!DOCTYPE html>. No markdown, no fences, no prose.

Build a B2B SaaS marketing homepage at reference-tier quality (match design-03-saas-homepage energy AND every named anchor in the Mobbin Pro DNA block when present).

HARD REQS (each auto-scored — meet every one):
1. ≥12,000 chars. Full HTML document.
2. ≥7 <section> + <header> + <footer>. Every section ≥200px tall with real content (heading + paragraph/cards), NO empty bands.
3. <head>: viewport meta + <script src="https://cdn.tailwindcss.com"> + <script src="https://unpkg.com/lucide@latest"> + tailwind.config={theme:{extend:{colors:{background,surface,elev,primary},fontFamily:{display,body,mono},keyframes:{liquid:{...}},animation:{liquid:'liquid 22s ease-in-out infinite'},boxShadow}}}.
4. Hero ALWAYS has a <canvas id="hero-canvas"> with requestAnimationFrame loop reactive to mousemove (respect prefers-reduced-motion), theme.extend.keyframes.liquid (translate+rotate+scale ~22s), and ONE band that uses -skew-y-3 / clip-path polygon / keyframed rotate for diagonal energy.
Hero-accent SHAPE is anchor-conditional:
  (a) When the active aesthetic IS aurora/festival/cyberpunk/neon OR no Mobbin anchor is present: emit ≥3 absolutely-positioned <div>s whose inline style contains the LITERAL TEXT "radial-gradient(", each with classes "blur-3xl" AND "motion-reduce:hidden" AND opacity-40..70, AND animate-liquid on ≥2 of them. PALETTE LOCK: every radial-gradient stop MUST be derived from the active anchor's sampled hex palette (or, with no anchor, from theme.extend.colors.primary/elev/surface) converted to rgba() with 0.30..0.60 alpha. NEVER invent peach (rgba(255,200,150…)), cyan (rgba(100,200,255…)), amber (rgba(255,180,80…)) or any other "default aurora trio" RGBA — those colors are auto-fail unless they literally appear in the anchor palette. e.g. if primary=#5e6ad2, emit <div class="absolute -top-24 -left-24 w-[520px] h-[520px] blur-3xl opacity-60 motion-reduce:hidden animate-liquid" style="background: radial-gradient(circle at 30% 30%, rgba(94,106,210,0.55), transparent 70%);"></div> — the three blobs vary in POSITION and SIZE, not hue.
  (b) When the active Mobbin Pro anchor's "avoid" list contains "aurora" / "multi-color gradients" (Linear, Vercel, Stripe, Anthropic, Notion, OpenAI, GitHub, Plausible, etc): the hero accent is EITHER ONE subtle full-width linear-gradient ribbon OR ONE corner-anchored radial-gradient spotlight, NOT three. Use class blur-3xl + motion-reduce:hidden + opacity-40..70 on that single accent. The audit's "≥3 radial-gradient" rule is overridden by the forge harness when an anti-aurora anchor is active — DO NOT pad with extra radial-gradients to satisfy a count.
5. ≥4 [data-reveal] elements. CRITICAL: never add opacity-0 / translate-y-* in the initial markup or via JS on page load. The page MUST be fully visible without JS. JS may only ADD class reveal-ready to <html> then animate IN existing visible elements (e.g. transition-opacity). Empty reveal panels are forbidden.
6. ≥2 [data-magnet] CTAs with pointer parallax in inline script.
7. Single inline IIFE before </body>, every querySelector null-guarded. Wire: data-mobile-nav + data-mobile-nav-toggle (is-open class); data-accordion FAQ ≥5 items each with data-accordion-trigger; data-pricing-billing + [data-billing="month"|"year"] toggling [data-show-monthly]/[data-show-yearly]; ≥2 [data-counter][data-counter-target] count-up on intersection; lucide.createIcons() after DOM ready + after dynamic updates.
8. Pricing: 3 tiers, middle featured with ring-2 ring-offset-2; monthly+yearly prices both wired through toggle.
9. Three Google Fonts (fonts.googleapis.com). Display ∈ {Fraunces,Syne,Outfit,DM Serif Display,Playfair Display,Space Grotesk,Bricolage Grotesque,Instrument Serif,Manrope,Sora}. Body: Inter/DM Sans/Manrope. Mono: JetBrains Mono/IBM Plex Mono. NEVER Cabinet Grotesk/Geist (not Google-hosted). Map all 3 in tailwind.config.fontFamily.
10. Theme is anchor-conditional. When the Mobbin anchor's palette resolves a light background (≥ 220/255 luminance — Notion/Anthropic/OpenAI/Stripe/Webflow), use a LIGHT theme: bg-white or warm off-white (#faf9f5), body text-slate-700 / text-zinc-800, cards with ring-1 ring-zinc-200 + soft shadow. When the anchor resolves a dark background (Linear/Cursor/Sentry/Pinecone) OR no anchor is present, use a DARK theme: tinted slate/zinc bg, cards with backdrop-blur + ring-1 ring-white/10, body text-slate-300 (never text-slate-500 on text-lg/text-base/leading-relaxed). Either way, 4.5:1 contrast on body text.
11. Real anchors only. ≥8 nav links across header+footer. ≤55 total href="#" placeholders.
12. ≥3 real <button> CTAs.
13. Penultimate CTA band before footer. Footer ≥4 columns.
14. Lucide icons via data-lucide. STRICT BAN — these names DO NOT EXIST in Lucide and silently render blank: github, twitter, linkedin, discord, facebook, instagram, youtube, "x", "chart", "close", "search-icon", "envelope", "phone-icon". Replace: x → x-circle. chart → bar-chart-3 OR pie-chart. close → x-circle. github/twitter/linkedin/etc → inline <svg viewBox="0 0 24 24"> with the brand path. For brand/social icons use inline <svg viewBox="0 0 24 24">. Safe Lucide names: arrow-right, arrow-up-right, check, check-circle, x-circle, menu, sparkles, zap, shield, rocket, layers, code, terminal, cpu, gauge, lock, users, bot, workflow, git-branch, chevron-down, chevron-right, star, mail, search, settings, bell, user, calendar, clock, globe, map-pin, eye, copy, trash-2, plus, minus, info, alert-circle, file-text, folder, image, tag, bookmark, share-2, download, upload, link-2, external-link, bar-chart-3, pie-chart, activity, trending-up, target, flame, lightbulb, wand-2. Sizes w-5 h-5 md:w-6 md:h-6.
15. NO <style> tags for theme/layout/animation. Vanilla JS only. Only external scripts: Tailwind + Lucide CDNs.
16. Specific product-credible copy. NO Ship Fast / fake addresses / Lorem ipsum / generic placeholders. Concrete numbers ("3.2× faster", "14-day trial"). 3+ testimonial cards with named authors+roles.
17. STRICT IMAGE BAN. NEVER use placeholder image domains — no via.placeholder.com, no placehold.it / placeholder.com / placekitten / dummyimage / picsum.photos / cataas / loremflickr. For logo proof bands, customer logos, and brand marks: inline <svg viewBox="0 0 120 32"> with a real-looking text-mark OR a recognizable abbreviated brand path. For product preview imagery: build the UI as actual HTML (cards, tables, code blocks, charts as inline SVG), not <img> tags. The only <img> tags allowed are: (a) Pexels/Unsplash-verified stock URLs explicitly supplied in a MEDIA URLS block, or (b) <img> tags rendered ENTIRELY as base64 data: URIs (avoid this — prefer inline SVG). If a logo cloud needs N brands, render N <svg> blocks side-by-side, each ~120×32 with the brand name as <text> in a brand-appropriate font-family, NEVER N <img src="placeholder">.
18. STRICT BRAND-NAME BAN for customer/testimonial logos and quotes. NEVER use any of: Acme, AcmeCo, Acme Corp, Foo, Foobar, Bar, Baz, BetaCo, Beta Inc, Gamma Ltd, GammaCo, Globex, Hooli, Initech, Pied Piper, Cyberdyne, Stark Industries, Wayne Enterprises, FakeCo, DemoCo, Example Inc, Sample Co, TestCo, Lorem Inc, Ipsum LLC, Brand A/B/C, Company 1/2/3. These read instantly as fake and break Mobbin Pro fidelity. Pick from this curated bank of believable B2B-SaaS customer names instead (mix freely — diverse mix is fine): HelixOps, Nordbridge Capital, Pacific Mediawire, Lattice Robotics, Foundry47, Saltline Logistics, Quanta Health, Northwind Analytics, Verbera Mobility, Atlas Forge, Cinder Energy, Patternline, Stormharbor Insurance, Cobalt & Co, Westcliff Health, Polaris Audio, Beacon Sciences, Klein Foundry, Trove Capital, Mosaic Defense, Helia Pharma, Aerohelm, Kindred Labs, Sundial Markets, Tessera AI, Greengate Mobility, Continuum Robotics, Pendulum Audio, Cantilever Labs, Riftline Capital. You may ALSO use real public-company names that plausibly appear as Mobbin Pro customer logos (Linear, Vercel, Stripe, Notion, Loom, Figma, OpenAI, Anthropic, Cloudflare, Datadog, Sentry, GitHub, Plaid, Brex, Ramp, Discord, Slack, Asana, Intercom, Postman) — choose names that match the product's positioning (e.g. infra products → Cloudflare/Vercel/Stripe; AI products → OpenAI/Anthropic/Hugging Face; collaboration → Notion/Loom/Figma). For testimonial authors, pair a believable first+last name with a real-sounding role+company; never use "John Doe" / "Jane Smith" / "User 1" / generic role titles like "CEO at Company".
19. STRICT HEADLINE BAN — these generic SaaS patterns are auto-fail and instantly break Mobbin Pro fidelity. Do NOT write a hero h1 that matches any of: "Unleash {anything}", "Supercharge {anything}", "Revolutionize {anything}", "Transform {anything}", "Empower {anything}", "Unlock {anything}", "See Every {X}, Instantly", "{X}, Reimagined", "{X} for the Modern {Y}", "Built for the {Future|Next-Gen|AI Era}", "The {Future|Next} of {X}", "{Faster|Smarter|Better} {X}", "{X} Made Simple", "{X} that Just Works", "The All-in-One {X}", "Beyond {X}", "{X} Without {Y}", "Welcome to the {Future|Era} of {X}". Hero h1 must be EITHER (a) an outcome-driven imperative ≤8 words ("Move work forward" / "Accept payments online" / "Deploy on the edge" / "Build internal tools, faster"), OR (b) a concrete product noun phrase ("The AI code editor" / "Voice AI that understands emotion" / "Vector database for AI" / "Your AI everything app"), OR (c) a measurable-outcome stat-led headline ("20% of the internet runs on our network" / "Cut MTTR by 65%"). Sub-headline (one sentence, ≤24 words) must contain at least one concrete product noun OR one quantified outcome (number/percentage/duration). No exclamation marks anywhere except in single-word UI labels.
20. STRICT NO-VERBATIM-COPY of any named Mobbin anchor's actual marketing copy. When a Mobbin Pro DNA block lists real headline/sub/product-noun shapes for an anchor (Linear / Stripe / Vercel / Notion / Figma / OpenAI / Anthropic / Cursor / etc), those examples are STYLE references — the model MUST paraphrase them, never reproduce them verbatim. Specifically banned in the GENERATED page: hero h1 EXACTLY equal to "Move work forward" / "Accept payments online" / "Deploy on the edge" / "The AI code editor" / "Frontend cloud, built for AI agents" / "Develop. Preview. Ship." / "The connectivity cloud" / "Your AI everything app" / "Nothing great is made alone" / "Models built for reasoning, multimodality, and tool use" / "Pioneering research on the path to AGI" / "Build in a weekend. Scale to millions." / "The open source Firebase alternative" / "Where the world builds software" / "The complete developer platform" / "Async video for work" / "Replace meetings with messages" / "AI research and products that put safety at the frontier" / "Models built to think" / "The most realistic AI voices" / "The Data Intelligence Platform" / "Banking engineered for the ambitious" / "How developers build successful products". Banned product-noun verbatims: "Cycles" + "Triage" + "Initiatives" together (Linear), "Workers" + "R2" + "D1" together (Cloudflare), "Connect" + "Atlas" + "Radar" together (Stripe), "Lakehouse" + "Unity Catalog" together (Databricks). The model MUST invent equivalents that share REGISTER (verb-noun shape, syllable count, tone) — e.g. for an issue-tracking product anchored on Linear, write "Cut shipping cycles by half" not "Move work forward"; for products with Linear's Cycles/Triage/Initiatives IA, write "Sprints / Surface / Roadlines" or similar invented proprietary nouns. Verbatim use of these banned strings is auto-fail.
${mobbinDoctrineBlock()}`

export const FORGE_DEFAULT_PROMPT =
  'A B2B SaaS marketing site for an AI-first agentic workflow product for engineering teams. Required sections: hero with a product-preview surface, social-proof / logo-cloud strip, feature grid (≥6 features grouped 2x3 or 3x2), pricing band with monthly/yearly toggle, FAQ accordion, named-customer testimonial band, penultimate CTA band, multi-column footer. Hero visual treatment is dictated by the active Mobbin Pro anchor (if any) or the active aesthetic — DO NOT default to an aurora hero unless explicitly called for.'

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

// v6: which aesthetics actually call for the engine's aurora-tier visual
// rules (3+ radial-gradient stacks, multi-color blobs, ambient liquid motion).
// Aesthetics NOT in this set produce non-aurora heroes by design, and the
// engine's aurora-audit becomes a quality regression for them — the forge
// harness then relaxes those rules via `relaxAuroraAuditForAnchor`.
export const AURORA_AESTHETIC_INDICES = new Set([2, 4, 5, 6, 9]) // aurora-midnight, neon-nightlife, organic-wellness, festival-maximalism, cyberpunk

export function isAuroraAesthetic(i) {
  return AURORA_AESTHETIC_INDICES.has(i % AESTHETIC_NUDGES.length)
}

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
  const rigor = opts.rigorBlock ? `\n${opts.rigorBlock}` : ''
  // Pack the four variation axes onto two compact lines to keep input tokens lean.
  const variation = `${v.aesthetic} ${v.hero}\n${v.pricing} ${v.composition}`
  return `${basePrompt}\n\n${variation}${ref}${mobbin}${rigor}${seed}`
}

/**
 * Curated B2B SaaS marketing-page anchors. Goal: name-drop real, well-known
 * products the model has seen in training so it anchors against their actual
 * pages instead of generic "modern SaaS" averages. This is the auth-free
 * structural sibling of forge-mobbin — same density mechanic, no API.
 *
 * Brands chosen for marketing-page rigor (concrete pricing, named logos in
 * social proof, verb-led headlines, real feature copy). Avoid consumer apps,
 * avoid niche tools the model might confuse.
 */
export const BRAND_ANCHORS = {
  'developer-tools': [
    'Linear',
    'Vercel',
    'Cloudflare',
    'Resend',
    'Railway',
    'Render',
    'Supabase',
    'PlanetScale',
    'Fly.io',
    'Neon',
    'Clerk',
    'WorkOS',
  ],
  ai: [
    'OpenAI Platform',
    'Anthropic',
    'ElevenLabs',
    'Hume AI',
    'Replicate',
    'Together AI',
    'Hugging Face',
    'Cohere',
    'Pinecone',
    'LangChain',
    'Modal',
    'Groq',
  ],
  productivity: [
    'Linear',
    'Notion',
    'Felt',
    'Fireflies',
    'Loom',
    'Cron',
    'Raycast',
    'Arc',
    'Superhuman',
    'Height',
    'Pitch',
    'Tella',
  ],
  'data-infra': [
    'Databricks',
    'Snowflake',
    'dbt',
    'Hashnode',
    'PostHog',
    'Sentry',
    'Highlight',
    'Datadog',
    'Grafana',
    'ClickHouse',
    'MotherDuck',
    'Tinybird',
  ],
  'b2b-saas-generic': [
    'Stripe',
    'Plaid',
    'Mercury',
    'Brex',
    'Ramp',
    'Linear',
    'Notion',
    'Intercom',
    'Vanta',
    'Drata',
    'Retool',
    'Airtable',
  ],
}

/**
 * Synchronous, pure rigor block. Rotates category by iter (same pattern as
 * mobbinIterBlock), picks 4 anchor brands deterministically from that
 * category, and emits a structural-rules block. No API calls, no I/O.
 *
 * Use as `rigorBlock` option to buildVariantPrompt. forge-loop A/Bs it via
 * FORGE_RIGOR_MIX=1 (even iters get rigor, odd don't), mirroring the
 * existing FORGE_MOBBIN_MIX shape.
 */
export function buildRigorBlock(iter) {
  const categories = Object.keys(BRAND_ANCHORS)
  const category = categories[iter % categories.length]
  const pool = BRAND_ANCHORS[category]
  // Deterministic stride pick — 4 brands spaced across the pool so iters
  // within the same category still vary their concrete anchors.
  const stride = Math.max(1, Math.floor(pool.length / 4))
  const start = iter % pool.length
  const picks = []
  for (let k = 0; k < 4; k++) {
    picks.push(pool[(start + k * stride) % pool.length])
  }
  const brands = [...new Set(picks)]

  const lines = []
  lines.push('── REFERENCE-TIER RIGOR ──')
  lines.push(
    `Anchor against these real B2B SaaS marketing pages (iter ${iter + 1}, category: ${category}): ${brands.join(', ')}.`,
  )
  lines.push('Match their density and copy specificity. Do NOT copy any literally.')
  lines.push('')
  lines.push('STRUCTURAL RULES (non-negotiable):')
  lines.push(
    '- Social proof: name >=3 recognizable companies, not "trusted by leading teams"',
  )
  lines.push(
    '- Pricing: concrete numbers ($29/mo, 10K events/mo), not "Contact Sales" placeholder tiers',
  )
  lines.push(
    '- Hero headline: verb-led, <=8 words, specific outcome (e.g. "Deploy GPUs in 60 seconds")',
  )
  lines.push(
    '- Feature copy: concrete capability + measurable benefit, never marketing fluff',
  )
  lines.push('- CTA: action verb + specific noun ("Start free trial" not "Get started")')
  return { block: lines.join('\n'), category, brands }
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
 * Parallel section-split generation.
 *
 * GPT-OSS-120b on Groq has a practical "natural ceiling" around 30K chars
 * per output (model converges there regardless of higher char-count
 * requests). To reach Kimi K2.5 reference-tier density (~55-60K chars)
 * within a 20s budget, fire two calls in parallel:
 *
 *   Call A: <!DOCTYPE> through end of features section, ends with marker
 *   Call B: section content from how-it-works through footer + IIFE
 *
 * Both run concurrently → wall-clock = slower(A, B), typically 16-19s
 * vs ~20s for single-call. Output: 50-65K chars stitched.
 *
 * Coherence: both calls receive the SAME variation block (aesthetic,
 * hero archetype, pricing archetype, composition, mobbinBlock, rigorBlock)
 * so colors/fonts/theme match. A defines tailwind.config + body classes;
 * B's sections inherit from those at stitch time.
 *
 * Returns { content, ms, msA, msB, inputTokensA, outputTokensA,
 *           inputTokensB, outputTokensB, errorA?, errorB? }
 */
const SPLIT_MARKER = '<!-- FORGE_SPLIT_AB -->'
const SPLIT_MARKER_BC = '<!-- FORGE_SPLIT_BC -->'

const SYSTEM_PART_A = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-SPLIT MODE — PART A:
You are producing PART A of a 2-part split generation. Output the FIRST half of the page with HIGH density. End with the marker (no closing tags, no script).

Output ONLY:
  <!DOCTYPE html>
  <html ...>
  <head>...full head with tailwind.config (colors, fontFamily, keyframes liquid, animation), 3 Google Fonts <link>, viewport meta, Tailwind CDN script, Lucide CDN script...</head>
  <body class="...">
    <header>...nav with ≥6 nav links, mobile-nav-toggle, primary CTA in nav...</header>
    <section id="hero">
      ...eyebrow announcement pill above headline ("New in 2026: …" or "Backed by …" — clickable, with arrow icon)
      ...3+ radial-gradient blur orbs (absolutely positioned, motion-reduce:hidden)
      ...<canvas id="hero-canvas"> for particle loop
      ...two-tone headline (accent color on payoff word/phrase)
      ...4-line subhead/description (not 1-2 lines — go editorial)
      ...2 CTAs (one data-magnet) + 4-item trust chip row (e.g. "SOC 2 Type II", "99.99% SLA", "GDPR ready", "Open-source")
      ...PRODUCT UI MOCK (~400px tall): terminal/dashboard/chat preview with 12+ rows of REAL contextual content — multi-line code with syntax-highlight-looking colored spans, table rows with cell content, conversation bubbles, chart data; NOT a placeholder box. Include a fake browser/window chrome at top (3 dot circles + tab/url bar).
    </section>
    <section id="stats">
      ...subtitle row above ("Trusted at scale")
      ...4 stat columns, each with text-4xl/5xl number + data-counter data-counter-target attribute + label below + 1-line context note under label
    </section>
    <section id="features">
      ...heading + 2-line subheading
      ...12 feature cards in 3 column grid (NOT 6 or 8 — go MAX density); each card has icon + heading + 3-line description + a sub-bullet list of 2-3 specific capabilities. Each card ~150 words minimum.
    </section>
    <section id="how-it-works">
      ...heading + 2-line subheading
      ...4 numbered steps (1./2./3./4.) with icon + step heading + 3-sentence description + a code/command snippet OR a row of sub-points per step; connect with thin line/arrow on lg
    </section>
    <section id="logos">
      ...heading "Trusted by teams at" with 2-line subheading
      ...grid of 8+ NAMED REAL B2B SaaS brands (Linear, Vercel, Stripe, Resend, Notion, Cloudflare, Hashnode, Supabase, Anthropic, OpenAI Platform, ElevenLabs, Hume AI, Clay, Base44, Relevance AI — pick from the variation block's anchor brands). Render brand names as styled text in grayscale, hover to color.
      ...3 mini-quotes UNDER the logo grid with named author + brand (italic, ~2 lines each)
    </section>
    <section id="faq">
      ...heading + 2-line subheading + ≥7 data-accordion items, each with data-accordion-trigger button + 3-sentence answer + (where natural) inline link or code snippet in answer
    </section>
${SPLIT_MARKER}

That marker is the EXACT ending — nothing after it (no </body>, no </html>, no <script>, no <footer>, no testimonials/pricing/faq/cta). Part B will append testimonials, pricing, faq, cta, footer, IIFE, closing tags. DO NOT include those sections. DO NOT close body/html.

YOUR PORTION MUST BE ≥30,000 chars. If you naturally finish under that, you have under-developed: ADD more nested content (3+ sub-bullets per feature card, 4+ sentences per how-it-works step, 8+ logos with mini-quotes underneath, longer hero subhead with more concrete benefit lines, more stat columns with context notes). Reference-tier homepages spend more words per section than a typical SaaS template — match that voice. Target 32,000-40,000 chars.`

const SYSTEM_PART_B = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-SPLIT MODE — PART B:
You are producing PART B of a 2-part split generation. Part A already produced: <!DOCTYPE>, <head>, <body opening>, <header>, hero, stats, features, how-it-works, logos, FAQ. Your job: testimonials + pricing + cta + footer + IIFE + closing tags.

Output EXACTLY (marker first, no preamble):
${SPLIT_MARKER}
  <section id="testimonials">
    ...heading + 2-line subheading + 3 cards in lg:grid-cols-3
    ...each card: ★★★★★ row (5 inline lucide star icons or chars) at top, 3-line quote, author block with colored-circle initial + name + role @ named real company (different real B2B SaaS brand per card — pick from variation block anchors)
  </section>
  <section id="pricing">
    ...heading "Simple, transparent pricing" + 2-line subheading + monthly/yearly segmented toggle (data-pricing-billing with two buttons data-billing="month"/"year") + "save 20%" pill on yearly
    ...3 tiers, middle tier MUST scale-105 md:scale-110 ring-2 ring-primary + "Most popular" pill at top + elevated shadow
    ...each tier: name + price ([data-show-monthly]/[data-show-yearly] for toggle) + 1-line description + 8 feature lines with check icons + CTA button (one data-magnet)
  </section>
  <section id="cta-final">
    ...penultimate CTA band with heading + 2-line subheading + 2 CTAs + trust line; subtle gradient or dark band
  </section>
  <footer>
    ...4 columns: Product / Resources / Company / Legal; each with 4-5 links; logo + tagline column on the left; copyright row at bottom + secondary nav strip; social icons as inline <svg viewBox="0 0 24 24"> (Lucide doesn't have brand icons)
  </footer>
  <script>(function(){
    ...single IIFE, null-guarded querySelectors
    ...wire: data-mobile-nav + data-mobile-nav-toggle (is-open class)
    ...wire: data-accordion items (click trigger toggles is-open)
    ...wire: data-pricing-billing (clicking month/year toggles [data-show-monthly]/[data-show-yearly])
    ...wire: data-counter (IntersectionObserver → count-up from 0 to data-counter-target over 1.2s)
    ...wire: data-magnet (pointer parallax: translate by mouse offset * 0.15)
    ...wire: hero-canvas particle loop (respect prefers-reduced-motion)
    ...call lucide.createIcons() once after DOM ready
    ...add 'reveal-ready' class to <html> on DOMContentLoaded so transition-opacity reveal kicks in
  })();</script>
  </body>
</html>

DO NOT include <!DOCTYPE>, <html>, <head>, <body opening>, <header>, hero, stats, features, how-it-works, logos, or FAQ. The marker is the very first line in your output. Use Lucide icons from data-lucide names (safe list applies).

YOUR PORTION TARGET: 18,000-24,000 chars. Be substantive but DO NOT over-elaborate — total page including Part A should be ~55-60K chars. Keep testimonials at 3 cards, pricing at 8 features per tier. Quality over verbosity.`

export async function forgeGenerateSplit({
  prompt = FORGE_DEFAULT_PROMPT,
  model = HOMEPAGE_MODEL || 'openai/gpt-oss-120b',
  temperature = LLM_CONFIG.homepage.temperature,
  maxTokensPerHalfA = 14000,
  maxTokensPerHalfB = 9000,
  reasoningEffort = 'low',
  signal,
} = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  // Both halves receive the SAME user prompt (variation + brief + mobbin
  // + rigor blocks all live in `prompt`). The system prompt differentiates
  // which sections each half produces.
  const callOne = (system, maxTok) =>
    fetch(URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTok,
        stream: false,
        reasoning_effort: reasoningEffort,
        reasoning_format: 'hidden',
      }),
      signal,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`)
      }
      return res.json()
    })

  const t0 = Date.now()
  let resA, resB
  try {
    ;[resA, resB] = await Promise.all([
      callOne(SYSTEM_PART_A, maxTokensPerHalfA).then((d) => ({ ok: true, ms: Date.now() - t0, data: d })).catch((e) => ({ ok: false, error: String(e?.message || e) })),
      callOne(SYSTEM_PART_B, maxTokensPerHalfB).then((d) => ({ ok: true, ms: Date.now() - t0, data: d })).catch((e) => ({ ok: false, error: String(e?.message || e) })),
    ])
  } catch (e) {
    return { content: '', ms: Date.now() - t0, error: String(e?.message || e) }
  }
  const ms = Date.now() - t0
  if (!resA.ok || !resB.ok) {
    return { content: '', ms, error: `A: ${resA.error || 'ok'} | B: ${resB.error || 'ok'}` }
  }
  const partA = stripGroqReasoningLeak(resA.data.choices?.[0]?.message?.content ?? '')
  const partB = stripGroqReasoningLeak(resB.data.choices?.[0]?.message?.content ?? '')

  // Defensive stitch:
  //   - Take A up to (and excluding) any premature </body></html>
  //   - Strip everything before marker in A; if no marker, append at end of body
  //   - Take B from marker onward; if no marker in B, prepend it
  //   - Concatenate
  let cleanA = partA
  const aMarkerIdx = cleanA.indexOf(SPLIT_MARKER)
  if (aMarkerIdx >= 0) cleanA = cleanA.slice(0, aMarkerIdx)
  // Strip any premature closing tags in A (model sometimes adds them anyway).
  cleanA = cleanA
    .replace(/<\/body>[\s\S]*<\/html>\s*$/i, '')
    .replace(/<\/body>\s*$/i, '')
    .replace(/<\/html>\s*$/i, '')
    .replace(/<script[\s\S]*?<\/script>\s*$/i, '') // strip trailing script if A added one
    .trimEnd()

  let cleanB = partB
  const bMarkerIdx = cleanB.indexOf(SPLIT_MARKER)
  if (bMarkerIdx >= 0) cleanB = cleanB.slice(bMarkerIdx + SPLIT_MARKER.length)
  cleanB = cleanB.trimStart()
  // Defensively strip any rogue <!DOCTYPE>/<html>/<head>/<body> from B start.
  cleanB = cleanB.replace(/^[\s\S]*?<section/i, '<section').trim()
  // Ensure B ends with </body></html>; add if missing.
  if (!/<\/html>\s*$/i.test(cleanB)) {
    if (!/<\/body>\s*<\/html>\s*$/i.test(cleanB)) {
      cleanB = cleanB.replace(/<\/body>\s*$/i, '') + '\n</body>\n</html>'
    }
  }

  const stitched = cleanA + '\n' + cleanB

  const usageA = resA.data.usage ?? {}
  const usageB = resB.data.usage ?? {}
  return {
    content: stitched,
    ms,
    msA: resA.ms,
    msB: resB.ms,
    inputTokensA: usageA.prompt_tokens ?? 0,
    outputTokensA: usageA.completion_tokens ?? 0,
    inputTokensB: usageB.prompt_tokens ?? 0,
    outputTokensB: usageB.completion_tokens ?? 0,
    inputTokens: (usageA.prompt_tokens ?? 0) + (usageB.prompt_tokens ?? 0),
    outputTokens: (usageA.completion_tokens ?? 0) + (usageB.completion_tokens ?? 0),
    cost: 0,
    model,
    partAChars: cleanA.length,
    partBChars: cleanB.length,
  }
}

/**
 * 3-way parallel section split.
 *
 * Goal: hit Kimi K2.5 density (~55-60K chars) within 20s wall-clock budget.
 * 2-way split converges around 20-22s; splitting into 3 lets each call be
 * lighter (~14-17s) so parallel wall = max(A,B,C) ≈ 17s.
 *
 *   A: head + header + hero + stats        (target ~15K, ~13s)
 *   B: features + how-it-works + logos     (target ~22K, ~16s)
 *   C: testimonials + pricing + faq + cta + footer + IIFE (target ~22K, ~16s)
 *
 * Markers: SPLIT_MARKER between A/B end, SPLIT_MARKER_BC between B/C end.
 */
const SYSTEM_PART_A3 = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-3-SPLIT MODE — PART A (head + header + hero + stats only):
Output ONLY:
  <!DOCTYPE html>
  <html ...>
  <head>...full head with tailwind.config (colors, fontFamily, keyframes liquid, animation), 3 Google Fonts <link>, viewport meta, Tailwind CDN script, Lucide CDN script...</head>
  <body class="...">
    <header>...nav with ≥6 nav links, mobile-nav-toggle, primary CTA in nav...</header>
    <section id="hero">
      ...eyebrow announcement pill above headline
      ...3+ radial-gradient blur orbs (motion-reduce:hidden)
      ...<canvas id="hero-canvas"> for particle loop
      ...two-tone headline (accent color on payoff word)
      ...4-line subhead
      ...2 CTAs (one data-magnet) + 4-item trust chip row
      ...PRODUCT UI MOCK ~480px tall: terminal/dashboard/chat with 18+ rows of REAL contextual content. Include browser/window chrome at top (3 colored circle buttons + tab strip with active tab name + url bar). The mock body contains:
         - if terminal: 18-25 lines of code/output with colored spans (text-emerald-400 for keywords, text-amber-400 for strings, text-slate-400 for comments, text-sky-400 for identifiers) + a fake prompt line
         - if dashboard: a stats row at top + a sortable-looking table with 10+ rows + a sidebar with 4-6 nav items + a chart placeholder with bars/lines
         - if chat: 8+ message bubbles alternating sender/agent with timestamps + typing indicator at bottom + tool-use card embedded between messages
         The mock should reach ~6,000-9,000 chars on its own. This is the single most important visual element.
    </section>
    <section id="stats">
      ...subtitle row ("Trusted at scale")
      ...4 stat columns: text-4xl/5xl number with data-counter data-counter-target + label + 1-line context note
    </section>
${SPLIT_MARKER}

That marker ends your output. NOTHING after it — Part B and Part C produce features/how-it-works/logos/testimonials/pricing/faq/cta/footer/IIFE/closing tags. DO NOT close body or html. Target 12,000-18,000 chars for your portion. Quality of hero product-UI mock is the most important detail — make it visually rich with believable content.`

const SYSTEM_PART_B3 = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-3-SPLIT MODE — PART B (features + use-cases + how-it-works + logos + testimonials):
Part A already produced: <!DOCTYPE>, <head>, <body opening>, <header>, hero, stats. Part C will produce pricing, faq, cta, footer, IIFE, closing tags. Your job: the 5 middle sections.

Output EXACTLY:
${SPLIT_MARKER}
  <section id="features">
    ...heading + 2-line subheading
    ...12 feature cards in 3-column grid; each card: icon + heading + 3-line description + sub-bullet list of 2-3 specific capabilities.
  </section>
  <section id="use-cases">
    ...heading "Built for [target users]" + 2-line subheading
    ...4 use-case cards in 2-column grid (NOT same shape as features — wider, with named persona/team + scenario sentence + 3-bullet "what they get" list + small avatar/icon + outcome metric line). Each ~80-100 words.
  </section>
  <section id="how-it-works">
    ...heading + 2-line subheading
    ...4 numbered steps with icon + step heading + 3-sentence description + code/command snippet OR row of sub-points per step
  </section>
  <section id="logos">
    ...heading "Trusted by teams at" + 2-line subheading
    ...grid of 8+ NAMED REAL B2B SaaS brands (Linear, Vercel, Stripe, Resend, Notion, Cloudflare, Hashnode, Supabase, Anthropic, OpenAI Platform, ElevenLabs, Hume AI, Clay, Base44, Relevance AI — pick from variation block anchors). Styled text in grayscale, hover to color.
  </section>
  <section id="testimonials">
    ...heading + 2-line subheading + 3 cards in lg:grid-cols-3
    ...each card: ★★★★★ row (5 inline lucide star icons or chars), 3-line quote, colored-circle initial + name + role @ named real B2B SaaS brand (different per card)
  </section>
${SPLIT_MARKER_BC}

Marker is FIRST line, ${SPLIT_MARKER_BC} is LAST line. NO doctype/html/head/body opening/header/hero/stats at start. NO pricing/faq/cta/footer/script after. Target 28,000-34,000 chars. Use Lucide icons from the safe list.`

const SYSTEM_PART_C3 = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-3-SPLIT MODE — PART C (pricing + faq + cta + footer + IIFE + closing tags):
Parts A and B already produced everything from <!DOCTYPE> through the end of the testimonials section. Your job: the rest of the page.

Output EXACTLY (marker first, no preamble):
${SPLIT_MARKER_BC}
  <section id="pricing">
    ...heading + 2-line subheading + monthly/yearly toggle (data-pricing-billing) + "save 20%" pill on yearly
    ...3 tiers, middle tier scale-105 md:scale-110 ring-2 ring-primary + "Most popular" pill + elevated shadow
    ...each tier: name + price ([data-show-monthly]/[data-show-yearly]) + 1-line description + 7 feature lines with check icons + CTA button (one data-magnet)
  </section>
  <section id="faq">
    ...heading + 2-line subheading + 6 data-accordion items with data-accordion-trigger + 2-3 sentence answer (concrete examples)
  </section>
  <section id="cta-final">
    ...penultimate CTA band: heading + subheading + 2 CTAs + trust line
  </section>
  <footer>
    ...4 columns: Product/Resources/Company/Legal, each 4-5 links; logo + tagline column on left; copyright + secondary nav strip + social icons (inline <svg viewBox="0 0 24 24"> for brand glyphs)
  </footer>
  <script>(function(){
    ...single IIFE, null-guarded querySelectors. Concise — single helpers, no redundancy.
    ...wire data-mobile-nav + data-mobile-nav-toggle (is-open class)
    ...wire data-accordion items (click toggles is-open)
    ...wire data-pricing-billing (toggle [data-show-monthly]/[data-show-yearly])
    ...wire data-counter (IntersectionObserver → count-up over 1.2s)
    ...wire data-magnet (pointer parallax: translate by mouse offset * 0.15)
    ...hero-canvas particle loop (respect prefers-reduced-motion)
    ...lucide.createIcons() once after DOM ready
    ...add 'reveal-ready' class to <html> on DOMContentLoaded
  })();</script>
  </body>
</html>

NO doctype/html/head/body/header/hero/stats/features/how-it-works/logos/testimonials at start. The marker is the very first line. Target 18,000-22,000 chars.`

export async function forgeGenerateSplit3({
  prompt = FORGE_DEFAULT_PROMPT,
  model = HOMEPAGE_MODEL || 'openai/gpt-oss-120b',
  temperature = LLM_CONFIG.homepage.temperature,
  maxTokensA = 8500,
  maxTokensB = 14000,
  maxTokensC = 8500,
  reasoningEffort = 'low',
  signal,
} = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const callOne = (system, maxTok) =>
    fetch(URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTok,
        stream: false,
        reasoning_effort: reasoningEffort,
        reasoning_format: 'hidden',
      }),
      signal,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`)
      }
      return res.json()
    })

  const t0 = Date.now()
  const [resA, resB, resC] = await Promise.all([
    callOne(SYSTEM_PART_A3, maxTokensA).then((d) => ({ ok: true, ms: Date.now() - t0, data: d })).catch((e) => ({ ok: false, error: String(e?.message || e) })),
    callOne(SYSTEM_PART_B3, maxTokensB).then((d) => ({ ok: true, ms: Date.now() - t0, data: d })).catch((e) => ({ ok: false, error: String(e?.message || e) })),
    callOne(SYSTEM_PART_C3, maxTokensC).then((d) => ({ ok: true, ms: Date.now() - t0, data: d })).catch((e) => ({ ok: false, error: String(e?.message || e) })),
  ])
  const ms = Date.now() - t0
  if (!resA.ok || !resB.ok || !resC.ok) {
    return {
      content: '',
      ms,
      error: `A: ${resA.error || 'ok'} | B: ${resB.error || 'ok'} | C: ${resC.error || 'ok'}`,
    }
  }
  const partA = stripGroqReasoningLeak(resA.data.choices?.[0]?.message?.content ?? '')
  const partB = stripGroqReasoningLeak(resB.data.choices?.[0]?.message?.content ?? '')
  const partC = stripGroqReasoningLeak(resC.data.choices?.[0]?.message?.content ?? '')

  // Stitch: A up to SPLIT_MARKER, then B (from SPLIT_MARKER to SPLIT_MARKER_BC),
  // then C (from SPLIT_MARKER_BC). Strip rogue closing tags between segments.
  const sliceBefore = (s, m) => {
    const i = s.indexOf(m)
    return i >= 0 ? s.slice(0, i) : s
  }
  const sliceAfter = (s, m) => {
    const i = s.indexOf(m)
    return i >= 0 ? s.slice(i + m.length) : s
  }
  let cleanA = sliceBefore(partA, SPLIT_MARKER)
  cleanA = cleanA
    .replace(/<\/body>[\s\S]*<\/html>\s*$/i, '')
    .replace(/<\/body>\s*$/i, '')
    .replace(/<\/html>\s*$/i, '')
    .replace(/<script[\s\S]*?<\/script>\s*$/i, '')
    .trimEnd()

  let cleanB = sliceBefore(sliceAfter(partB, SPLIT_MARKER), SPLIT_MARKER_BC)
  cleanB = cleanB.replace(/^[\s\S]*?<section/i, '<section').trim()
  cleanB = cleanB
    .replace(/<\/body>[\s\S]*<\/html>\s*$/i, '')
    .replace(/<\/body>\s*$/i, '')
    .replace(/<\/html>\s*$/i, '')
    .replace(/<script[\s\S]*?<\/script>\s*$/i, '')
    .trimEnd()

  let cleanC = sliceAfter(partC, SPLIT_MARKER_BC)
  cleanC = cleanC.replace(/^[\s\S]*?<section/i, '<section').trim()
  if (!/<\/html>\s*$/i.test(cleanC)) {
    if (!/<\/body>\s*<\/html>\s*$/i.test(cleanC)) {
      cleanC = cleanC.replace(/<\/body>\s*$/i, '') + '\n</body>\n</html>'
    }
  }

  const stitched = `${cleanA}\n${cleanB}\n${cleanC}`

  const sum = (k) =>
    (resA.data.usage?.[k] ?? 0) + (resB.data.usage?.[k] ?? 0) + (resC.data.usage?.[k] ?? 0)
  return {
    content: stitched,
    ms,
    msA: resA.ms,
    msB: resB.ms,
    msC: resC.ms,
    partAChars: cleanA.length,
    partBChars: cleanB.length,
    partCChars: cleanC.length,
    inputTokens: sum('prompt_tokens'),
    outputTokens: sum('completion_tokens'),
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
 * Mobbin-aware fix pass. v6 close-the-loop layer: when the vision judge says
 * the iter didn't inherit (low mobbinFidelity OR judge reasons mention
 * inheritance failure) OR the per-iter palette gate missed, this pass asks
 * the model to specifically address the inheritance gaps named in `gaps`,
 * with the featured anchor's full DNA still in scope.
 *
 * Returns { content, ms } or null if budget exceeded.
 *
 * gaps shape: {
 *   anchor: { app, category, palette, hexHits, hexMissed, dna },
 *   judgeReasons: string[],
 *   mobbinFidelity: number|null,
 * }
 */
export async function mobbinAwareFixPass(html, prompt, gaps, { remainingBudgetMs = 6000, model } = {}) {
  if (remainingBudgetMs < 4000) return null
  if (!gaps?.anchor?.app) return null
  const { anchor, judgeReasons = [], mobbinFidelity } = gaps
  const hexMissed = (anchor.hexMissed || []).slice(0, 5)
  const hexHits = (anchor.hexHits || []).slice(0, 5)
  const dna = anchor.dna || {}
  const doctrine = Array.isArray(dna.doctrine) ? dna.doctrine : []
  const avoid = Array.isArray(dna.avoid) ? dna.avoid : []

  const sys = `You are a senior frontend engineer making a SURGICAL revision to inherit a specific Mobbin Pro anchor. Output ONLY a complete HTML document — no markdown, no fences, no prose. Keep all data-* hooks intact. Make MINIMAL changes; do not redesign — fix only what the inheritance brief identifies.`

  const inheritanceBrief = [
    `ANCHOR: ${anchor.app}${anchor.category ? ` (${anchor.category})` : ''}`,
    anchor.palette?.length ? `Required palette (sampled hex): ${anchor.palette.join(', ')}` : null,
    hexHits.length ? `Already present in HTML: ${hexHits.join(', ')}` : null,
    hexMissed.length
      ? `MISSING from HTML — add these hex values to tailwind.config.theme.extend.colors and/or inline styles in the most prominent surfaces (bg/surface/primary/text): ${hexMissed.join(', ')}`
      : null,
    dna.display ? `Display typography target: ${dna.display}` : null,
    dna.body ? `Body typography target: ${dna.body}` : null,
    dna.mono ? `Mono typography target: ${dna.mono}` : null,
    dna.layout ? `Layout signature: ${dna.layout}` : null,
    dna.copy ? `Copy register: ${dna.copy}` : null,
    doctrine.length ? `Required moves to ensure are present:\n- ${doctrine.join('\n- ')}` : null,
    avoid.length ? `Anti-patterns to REMOVE if found:\n- ${avoid.join('\n- ')}` : null,
    Number.isFinite(mobbinFidelity)
      ? `Vision judge mobbinFidelity score: ${mobbinFidelity}/25 — raise this above 18.`
      : null,
    judgeReasons.length ? `Judge said these are the worst gaps:\n- ${judgeReasons.join('\n- ')}` : null,
    'Surgical edit rules: do NOT change unrelated sections. If you need to shift a color, change the tailwind config + a small number of inline overrides. If you need to fix copy, target only generic phrases. If the page has an aurora hero but the anchor forbids aurora, REMOVE the extra radial-gradient orbs (keep ONE subtle accent at most). NEVER add via.placeholder.com or any placeholder-image domain. ANTI-PLAGIARISM: if the current hero h1 is one of the anchor\'s real marketing headlines verbatim (e.g. "Move work forward" / "Accept payments online" / "Deploy on the edge" / "The AI code editor" / "Async video for work"), REWRITE it with a paraphrased headline that matches register but uses different specific words. If the page uses ≥3 of the anchor\'s proprietary product nouns clustered (e.g. Linear\'s Cycles + Triage + Initiatives), INVENT replacement proprietary nouns that share the verb-noun shape (e.g. Sprints / Surface / Roadlines).',
  ]
    .filter(Boolean)
    .join('\n\n')

  const user = `Brief: ${prompt}\n\nINHERITANCE BRIEF — revise the HTML below so it INHERITS the named Mobbin Pro anchor:\n\n${inheritanceBrief}\n\nEmit the FULL fixed HTML. Reply with ONLY HTML, starting at <!DOCTYPE html>.\n\n<<<HTML>>>\n${html}\n<<<END>>>`

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
