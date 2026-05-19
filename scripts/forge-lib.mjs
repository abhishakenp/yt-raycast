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

/**
 * Site-type taxonomy + per-type prompt packs.
 *
 * The forge's HOMEPAGE_SYSTEM_LEAN system prompt is tuned for B2B SaaS
 * marketing pages — it asks for pricing tiers, dev-tool brand anchors,
 * "How It Works" steps, etc. That shape doesn't fit a coffee roaster, a
 * restaurant, a portfolio, or a fitness studio: those need menus, case
 * studies, class schedules, ingredient stories — different sections,
 * different copy voice, different brand anchors, different aesthetic.
 *
 * detectSiteType() runs a heuristic keyword pass on the brief and picks a
 * type. SITE_TYPE_PACKS encodes per-type overrides: section prescription,
 * brand anchors, aesthetic steer, copy voice. buildSiteTypeBlock(brief)
 * emits a markdown block that the split3 system prompts read alongside
 * the universal HARD REQS — wherever the universal rules conflict with
 * the type pack (e.g. "pricing tiers" vs "menu items"), the type pack
 * wins.
 */
// Order matters — most-specific FIRST so e.g. "hotel ... with an on-site
// restaurant" classifies as hotel, not restaurant. The detector returns the
// first match; later regexes act as fallbacks.
const SITE_TYPE_DETECTORS = [
  ['hotel', /\b(hotel|resort|boutique\s*stay|vacation\s*rental|guesthouse|airbnb|bed\s*and\s*breakfast|inn\b|lodge|retreat\s*center|chalet|bnb)\b/i],
  ['portfolio', /\b(portfolio|personal\s*site|freelance|side\s*projects|case\s*stud|my\s*work|creative\s*director|art\s*director|solo\s*designer|independent\s*(designer|developer|illustrator))\b/i],
  ['agency', /\b(agency|design\s*studio|consultancy|brand\s*identity|design\s*firm|branding\s*agency|advertising|creative\s*shop|brand\s*design\s+agency|our\s*clients\s*include)\b/i],
  ['ecommerce', /\b(shop|store|buy\s+now|cart|product\s*line|merch|tee\s*shirt|apparel|streetwear|fashion|skincare|jewelry|sneaker|fragrance|candle|dtc|direct.to.consumer|cosmetic|subscribe\s*and\s*save)\b/i],
  ['fitness', /\b(gym|fitness|crossfit|workout|personal\s*trainer|class\s*pass|yoga|pilates|spin|barre|hiit|bouldering|martial\s*arts|boxing|kettlebell|strength\s*training)\b/i],
  ['wellness', /\b(wellness|spa|massage|meditation|sound\s*bath|herbal|ayurveda|naturopath|holistic|reiki|sauna|bathhouse)\b/i],
  ['realestate', /\b(real\s*estate|property\s*listing|realtor|broker|interior\s*design|homes?\s*for\s*sale|home\s*tour|MLS\b)\b/i],
  ['education', /\b(course|bootcamp|school|tutor|coaching|certification|workshop|masterclass|cohort|curriculum|syllabus|enroll)\b/i],
  ['nonprofit', /\b(nonprofit|charity|foundation|donate|donat|mission.driven|community\s*org|ngo\b|501\(c\)|fundraising)\b/i],
  ['fintech', /\b(payments?\b|banking|fintech|investment\s*platform|crypto|wallet|trading|brokerage|loan|mortgage|neobank)\b/i],
  ['restaurant', /\b(restaurant|bistro|kitchen|cafe|café|coffee\s*(roaster|shop|bar)|coffee\s*roaster|tea\s*house|bakery|patisserie|menu|chef|cuisine|fine\s*dining|distillery|brewery|tap\s*room)\b/i],
  ['saas', /\b(saas|platform|api\b|developer|devops|infra(structure)?|cloud|dashboard|analytics|crm\b|erp\b|workflow|automation|integration|observability|monitoring|database|serverless)\b/i],
]

export function detectSiteType(brief = '') {
  for (const [type, re] of SITE_TYPE_DETECTORS) {
    if (re.test(brief)) return type
  }
  return 'saas' // fallback — the universal HOMEPAGE_SYSTEM_LEAN is SaaS-flavored anyway
}

/**
 * Per-type prompt pack. Each entry overrides the SaaS-shaped HARD REQS
 * for that vertical. Sections list is what should ACTUALLY appear (the
 * universal prompt asks for features+pricing+FAQ; for a restaurant that
 * becomes menu+hours+reservations).
 */
const SITE_TYPE_PACKS = {
  saas: {
    label: 'B2B SaaS / Developer Tool marketing homepage',
    sections:
      'hero (with product UI mock: terminal/dashboard/code editor showing real commands or data), stats strip (technical metrics — uptime, latency, deploys/month, requests/s), 12-card feature grid (technical capabilities), use-cases section (3-4 personas: engineers/ops/product), how-it-works (4 steps with code snippets), logo grid (8+ real B2B SaaS brand names), 3 testimonial cards (B2B engineering buyers), pricing (3 tiers, monthly/yearly toggle, concrete numbers), FAQ (6 items technical), CTA, multi-column footer.',
    heroMock:
      'A faux terminal OR dashboard OR code-editor preview with 18+ lines of CONTEXTUAL real-looking content (SQL queries + results, log lines, table rows, API JSON responses, chart bars). Window chrome at top (3 colored dot circles + URL bar). Syntax-highlight-looking colored spans.',
    brandAnchors: ['Linear', 'Vercel', 'Stripe', 'Resend', 'Cloudflare', 'Supabase', 'Notion', 'Anthropic', 'OpenAI Platform', 'Hashnode', 'PlanetScale', 'Neon'],
    aesthetic: 'developer-docs light OR linear-style light OR dashboard editorial OR stripe-style light. Inter / Manrope / JetBrains Mono. Light bg with one dark stats band.',
    voice: 'concrete, technical, numbers-led. Verb-led headline. No marketing fluff. Use real product terminology.',
    bannedSections: [],
  },
  ecommerce: {
    label: 'DTC / consumer ecommerce homepage selling a physical product line',
    sections:
      'hero (large lifestyle/product photography, headline + benefit subhead + "Shop Now" CTA, optional hero product card with price), benefits strip (free shipping, returns, sustainable materials), featured products (8-card grid, each with image + name + price + add-to-cart), shop-by-category (3-4 collection tiles), ingredient/material story OR press strip ("As seen in Vogue / NYT / Fast Company"), bestsellers (4-card highlight), customer reviews (3 cards: stars + quote + verified-buyer + their photo + product they bought), newsletter signup with discount offer, Instagram/UGC grid (6-9 lifestyle images), footer with shop links + customer service + about. NO pricing tiers, NO "How It Works" steps for SaaS sense.',
    brandAnchors: ['Glossier', 'Allbirds', 'Warby Parker', 'Everlane', 'Outdoor Voices', 'Aesop', 'Necessaire', 'Hims', 'Hers', 'Olipop', 'Hu Kitchen', 'Cuyana'],
    aesthetic: 'editorial luxury OR organic wellness OR tactile craft. Fraunces / Cormorant Garamond / Playfair Display + Inter. Warm cream/off-white bg, photography-led, one accent color (terracotta/sage/dusty pink).',
    voice: 'sensory, aspirational, lifestyle-driven. Product names. Ingredient/material stories. "Yours" / "you" — second person. No metrics-speak.',
    bannedSections: ['pricing tiers', 'monthly/yearly toggle', 'API integrations', 'how it works developer steps'],
  },
  restaurant: {
    label: 'restaurant / cafe / coffee roaster / bakery marketing homepage',
    sections:
      'hero (photography-led: dish or interior, serif display headline naming the experience, eyebrow with year established, address + hours block, "Reserve" or "Order" CTA), our story (chef/founder bio with portrait, origin story 3-4 paragraphs), menu categories (3-5: brunch / lunch / dinner / drinks / dessert OR for coffee: single-origin / blends / wholesale / subscriptions), featured menu items (6-8 dishes: name + 2-line description + price + optional photo + dietary tag), location & hours (table format: day / hours, address, parking notes, map iframe placeholder), reservation/order CTA section, press quotes / awards strip ("Michelin Bib Gourmand / NYT Critic\'s Pick / Eater Best Of"), gallery grid (6 photos), footer with social + newsletter + contact. NO pricing tiers, NO SaaS metrics.',
    brandAnchors: ['Sweetgreen', 'Eleven Madison Park', 'Sqirl', 'Tartine', 'Blue Bottle', 'Stumptown', 'Verve', 'Onyx Coffee Lab', 'Counter Culture', 'OpenTable', 'Resy', 'Tock', 'Atomix'],
    aesthetic: 'editorial warm OR organic wellness OR tactile craft. Playfair Display / Fraunces / DM Serif Display + Inter. Cream/paper bg, warm earth accent (terracotta / forest / espresso), photography-led.',
    voice: 'evocative, sensory, place-based. Menu poetry. Origin stories. Chef voice — first person plural ("we", "our team"). Specific provenance ("Ethiopian Yirgacheffe", "stone-milled Sonora wheat").',
    bannedSections: ['pricing tiers', 'monthly/yearly toggle', 'API integrations', 'how it works developer steps', 'developer-tool brand logos'],
  },
  portfolio: {
    label: 'designer / agency / freelancer creative portfolio',
    sections:
      'hero (oversized typographic name + role + tagline, optional photo or signature illustration, "View Work" + "Contact" CTAs), about section (background, philosophy, what I do, 4-5 paragraphs), case studies grid (6-9 projects, each: hero image + client + 1-line outcome + project category tag; click leads to imagined detail page), services or capabilities strip (4-8 services with icons + 1-line descriptions), process timeline (3-5 steps: discovery → strategy → design → delivery), recognition/awards strip (Webby, Awwwards SOTD, ADC, Pentagram x, etc.), client testimonials (3 cards: stars + quote + client name + role + company), social/links + contact form. NO pricing tiers, NO product-tier feature grids.',
    brandAnchors: ['Pentagram', 'Studio Dumbar', 'Mother NY', '&Co', 'Wieden+Kennedy', 'Bruno Simon', 'Tobias van Schneider', 'Cosmos', 'Linear', 'Awwwards', 'Site Inspire', 'Frank Body'],
    aesthetic: 'brutalist tech OR quiet museum minimal OR poster-style maximalism. Space Grotesk / Outfit / Manrope / DM Serif Display. Monochrome (black/white/one accent), asymmetric grid, oversized type, generous whitespace.',
    voice: 'confident, project-focused, specific. First person OR brand-collective "we", be consistent. Name clients and outcomes (e.g. "redesigned Linear\'s docs site — drove 32% activation lift").',
    bannedSections: ['pricing tiers', 'monthly/yearly toggle', 'API integrations', 'how-it-works developer steps'],
  },
  agency: {
    label: 'creative / branding / digital agency homepage',
    sections:
      'hero (manifesto-style headline + positioning subhead + "See our work" CTA, optional reel/video placeholder), capabilities strip (brand strategy, identity, digital, motion, photography — 4-8 services with descriptions), featured work case studies (6-9 client projects with hero image + client + sector + outcome), client logo grid (real brand names the agency could plausibly have served), our process (4-step methodology), team grid (4-8 team members with photo + name + role), recognition strip (awards), testimonials (3 client quotes), CTA / "Start a project" form, footer with offices.',
    brandAnchors: ['Pentagram', 'Studio Dumbar', 'Mother NY', '&Co', 'Wieden+Kennedy', 'Frog', 'IDEO', 'Adobe', 'Nike', 'Apple', 'Spotify', 'Airbnb'],
    aesthetic: 'minimal Swiss OR poster-style maximalism OR brutalist tech. Outfit / Manrope / DM Serif Display + Inter. Bold typography hierarchy, oversized headlines, asymmetric grids.',
    voice: 'authoritative, third-person plural ("we") OR brand-collective. Specific outcomes for named clients. Avoid agency clichés ("we love what we do").',
    bannedSections: ['pricing tiers', 'monthly/yearly toggle', 'API integrations'],
  },
  fitness: {
    label: 'gym / studio / fitness brand marketing homepage',
    sections:
      'hero (action photography of person mid-workout, bold sans headline naming the transformation, "Book a class" + "First class free" CTAs), class types (4-6 categories: HIIT / strength / yoga / cycling / boxing, each with description + duration + intensity), trainer profiles (3-4 trainers with photo + bio + speciality + certifications), class schedule grid (week view with class types and times), membership tiers (3 levels: drop-in / unlimited / premium — concrete prices, not subscription SaaS-style), transformation stories (3 before/after with testimonial + member name + duration), facility / amenities strip, locations + contact, footer. NO API integrations, NO developer tools voice.',
    brandAnchors: ['Equinox', 'Barry\'s', 'SoulCycle', 'Peloton', 'Tonal', 'F45', 'Orangetheory', 'CrossFit', 'Apple Fitness+', 'ClassPass', 'Strava', 'Whoop'],
    aesthetic: 'brutalist tech OR neon nightlife. Bebas Neue / Space Grotesk / Manrope + Inter. Dark theme + saturated accent (electric lime / magenta / neon red). Action photography, motion-heavy.',
    voice: 'energetic, second-person, outcome-focused. Numbers (calories, reps, watts, hours/week). Imperative verbs ("Push harder. Recover smarter.").',
    bannedSections: ['API integrations', 'developer tools', 'how-it-works SaaS steps', 'monthly/yearly subscription tier shape — use class packs and memberships instead'],
  },
  wellness: {
    label: 'wellness / spa / meditation studio / holistic health homepage',
    sections:
      'hero (calm/soft photography — nature or treatment room — generous serif headline, "Book a session" CTA), services / treatments (4-8 treatments with description + duration + price), practitioner profiles (3-4 with photo + credentials + speciality), client journey / approach (3-step process), packages or membership levels (concrete prices), testimonials (3 calm quotes), location + hours + booking, gallery, newsletter, footer.',
    brandAnchors: ['Headspace', 'Calm', 'Goop', 'Aesop', 'Sakara', 'Heyday', 'Skin Laundry', 'The Now', 'Squeeze', 'Therabody', 'Liquid IV'],
    aesthetic: 'organic wellness OR quiet museum minimal OR editorial warm. Fraunces / Playfair / Cormorant + Inter. Cream / sage / dusty rose palette. Soft photography, generous whitespace.',
    voice: 'calm, sensory, present-tense. Avoid medical claims. Restorative language ("restore", "reset", "soften").',
    bannedSections: ['API integrations', 'developer steps'],
  },
  hotel: {
    label: 'hotel / resort / boutique stay homepage',
    sections:
      'hero (large architectural photography — hero shot of the property, headline naming the experience, date-range picker + "Book Now" CTA), the property / story section (origins, character, what makes it special), rooms & suites grid (4-8 room types with photos + amenities + nightly price), amenities strip (spa, dining, pool, etc.), dining / restaurants (if applicable — featured outlets), experiences / activities (curated guest experiences), location guide (neighborhood, distance to landmarks), guest testimonials, awards / press strip, booking CTA, footer.',
    brandAnchors: ['Aman', 'Soho House', 'Ace Hotel', 'Hoxton', 'Standard', 'Edition', '1 Hotels', 'Six Senses', 'Rosewood', 'Belmond', 'Auberge Resorts'],
    aesthetic: 'editorial luxury OR quiet museum minimal OR organic wellness. Fraunces / Playfair / DM Serif + Inter. Warm neutrals + photography-led, generous whitespace.',
    voice: 'evocative, place-based, sensory. Describe what the guest experiences. Specific details (thread count, sunset times, distance to beach).',
    bannedSections: ['API integrations', 'developer voice', 'SaaS pricing tiers'],
  },
  fintech: {
    label: 'fintech / banking / payments / investment platform homepage',
    sections:
      'hero (trust-led: headline + clear value prop + dashboard/balance preview mock, "Open account" CTA + "FDIC insured" trust note), key benefits strip (4-6: no fees / instant transfer / regulated / secure), product/account types (3-4: checking / savings / business / investing — each with feature highlights + concrete numbers), how it works (4 steps: sign up → verify → fund → transact), security & compliance section (SOC 2, PCI DSS, encryption details, regulators), pricing or fees table (transparent breakdown), customer testimonials (3 with named users + amount/outcome), press/regulator logos (NYT / Forbes / WSJ / Bloomberg / FDIC / SEC), FAQ (KYC, limits, fees, security), CTA.',
    brandAnchors: ['Stripe', 'Plaid', 'Mercury', 'Brex', 'Ramp', 'Wise', 'Wealthfront', 'Robinhood', 'Coinbase', 'Square', 'Chime', 'Bloomberg', 'Forbes', 'FDIC'],
    aesthetic: 'stripe-style light OR linear-style light OR editorial luxury. Inter / Manrope + Sora. Light bg with one dark stats band. Subtle accent (indigo / emerald). Trust-first composition.',
    voice: 'precise, regulatory-aware, numbers-led. Avoid hype. Cite specific protections (FDIC, SIPC, PCI). Use real percentages and rates.',
    bannedSections: ['casual marketing tone', 'developer integrations focus'],
  },
  education: {
    label: 'online course / bootcamp / school marketing homepage',
    sections:
      'hero (instructor photo + course headline + "Enroll now" / "Next cohort" CTA, with concrete dates + price + duration), what you\'ll learn section (8-12 outcomes/skills with checkmarks), curriculum overview (4-8 modules with descriptions + duration + lesson count), instructor bio (photo + credentials + past students + companies they\'ve taught at), social proof (student outcomes — "got hired at X" with named real companies), pricing tiers (3 levels: full / cohort / scholarship — concrete prices, payment plans), student testimonials with photos, FAQ (refund policy, time commitment, prerequisites), CTA.',
    brandAnchors: ['Coursera', 'Udemy', 'Codecademy', 'Skillshare', 'Duolingo', 'Khan Academy', 'MasterClass', 'Maven', 'Stripe Press', 'Y Combinator', 'On Deck'],
    aesthetic: 'editorial warm OR dashboard editorial OR linear-style light. Outfit / Manrope / DM Serif + Inter. Light bg + photo of instructor or students, single accent (orange / blue).',
    voice: 'enthusiastic, outcome-focused, second-person ("you\'ll learn", "you\'ll build"). Specific skills + named companies students went to.',
    bannedSections: ['API integrations', 'developer dashboard voice'],
  },
  realestate: {
    label: 'real estate listings / agent / brokerage homepage',
    sections:
      'hero (large property photography + headline + city/neighborhood search + "Browse listings" CTA), featured listings grid (6-9 properties with hero photo placeholder + price + beds/baths/sqft + neighborhood + agent badge), browse by neighborhood / city (8-12 area cards), services strip (buying / selling / renting / mortgage), agent profiles (3-4 with photo + sales volume + speciality), client testimonials with named clients + dollar outcomes, market insights / blog teasers (3 articles), CTA "Find your home", footer.',
    brandAnchors: ['Compass', 'Zillow', 'Redfin', 'Realtor.com', 'Sotheby\'s International Realty', 'Douglas Elliman', 'Coldwell Banker', 'Keller Williams', 'Architectural Digest', 'Dwell'],
    aesthetic: 'editorial luxury OR quiet museum minimal. Fraunces / Playfair + Inter. Light bg, large photography, single accent (navy / forest).',
    voice: 'authoritative, place-based, market-aware. Specific neighborhoods + sale prices + days on market.',
    bannedSections: ['API integrations', 'developer voice', 'SaaS monthly tiers'],
  },
  nonprofit: {
    label: 'nonprofit / charity / foundation homepage',
    sections:
      'hero (emotional photography + mission headline + "Donate now" CTA + impact stat), impact stats strip (lives reached / projects funded / years active / countries served), our story / mission, programs / initiatives (4-6 with photos + descriptions + impact numbers), how to help (donate / volunteer / fundraise / corporate partnerships), donation tiers (3-5: $25 / $100 / $500 / $1000 — each with concrete impact mapping "buys X for Y people"), partner logos (corporate sponsors + grant-making foundations + media partners), testimonial stories from beneficiaries (with photos + first names + outcomes), press/awards strip, transparency section (financials, charity rating links), FAQ, CTA, footer.',
    brandAnchors: ['charity: water', 'GiveWell', 'Pencils of Promise', 'Heifer International', 'World Wildlife Fund', 'Doctors Without Borders', 'Bill & Melinda Gates Foundation', 'Ford Foundation', 'GuideStar', 'Candid', 'Charity Navigator'],
    aesthetic: 'editorial warm OR organic wellness. Fraunces / Playfair + Inter. Warm earth tones + photography-led, generous whitespace. Single accent (forest / sky-blue / amber).',
    voice: 'emotional, specific, beneficiary-centered. Use named beneficiaries + concrete impact numbers. Avoid empty inspiration language.',
    bannedSections: ['SaaS pricing tiers', 'API integrations', 'developer voice', 'monthly subscription toggle (use donation tiers instead)'],
  },
}

/**
 * Build the per-site-type prompt block. Emits a structured markdown block
 * the split3 system prompts will read alongside the universal HARD REQS.
 * Returns { block, type, pack } so callers can record the detected type
 * onto meta.json for traceability.
 */
export function buildSiteTypeBlock(brief = '', explicitType = null) {
  const type = explicitType || detectSiteType(brief)
  const pack = SITE_TYPE_PACKS[type] || SITE_TYPE_PACKS.saas
  const banned = (pack.bannedSections || []).length
    ? `\nDO NOT include these sections (they are wrong for this site type): ${pack.bannedSections.join('; ')}.`
    : ''
  const block = `── SITE TYPE PACK: ${pack.label} (detected: ${type}) ──
This brief is NOT a generic B2B SaaS marketing homepage. Adapt every section to the vertical.

REQUIRED SECTIONS (in order, replacing the SaaS template default):
${pack.sections}

BRAND ANCHORS (use these in logo grids, press strips, testimonial author affiliations — NOT B2B SaaS dev-tool brands): ${pack.brandAnchors.join(', ')}.

AESTHETIC STEER: ${pack.aesthetic}

COPY VOICE: ${pack.voice}${banned}

When the universal HARD REQS conflict with this pack (e.g. universal says "pricing tiers", this pack says "menu items"), THIS PACK WINS. Treat universal HARD REQS as accessibility/markup contracts (Tailwind setup, ≥9 sections, ≥45K chars, two-tone headline, real anchors, lucide icon safe list, IIFE wiring) — those still apply. Section semantics come from this pack.`
  return { block, type, pack }
}

export function buildVariantPrompt(basePrompt, i, opts = {}) {
  const v = pickVariation(i)
  const ref = opts.includeReference !== false ? referencePromptBlock() : ''
  const seed = opts.winnerSeedBlock ? `\n${opts.winnerSeedBlock}` : ''
  const mobbin = opts.mobbinBlock ? `\n${opts.mobbinBlock}` : ''
  const rigor = opts.rigorBlock ? `\n${opts.rigorBlock}` : ''
  // Site-type pack runs FIRST — it overrides section semantics from the
  // universal SaaS-shaped template. Skip when caller forces type=null
  // (e.g. legacy SaaS-only flows that don't want detection).
  const siteType =
    opts.siteTypeBlock === false
      ? ''
      : `\n${(opts.siteTypeBlock || buildSiteTypeBlock(basePrompt, opts.forceSiteType).block)}\n`
  // Pack the four variation axes onto two compact lines to keep input tokens lean.
  const variation = `${v.aesthetic} ${v.hero}\n${v.pricing} ${v.composition}`
  return `${basePrompt}\n\n${variation}${siteType}${ref}${mobbin}${rigor}${seed}`
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
      ...HERO MOCK (~6,000-9,000 chars on its own — the single most important visual element). The KIND of mock is dictated by the SITE TYPE PACK in the user prompt:
         - if the pack describes a SaaS / Developer-Tool / Fintech / Education product: faux terminal OR dashboard OR code-editor with 18+ rows of CONTEXTUAL content (SQL + results, log lines, JSON, table rows, chart bars). Window chrome (3 dot circles + URL bar). Syntax-highlight colored spans.
         - if Restaurant / Coffee / Bakery: a styled menu card OR reservation widget OR "Today's pour-over" featured-product card with 6-10 menu items (name + price + 1-line description + dietary icons), styled as a vintage menu / cafe board / takeaway slip with serif type and warm tones.
         - if Ecommerce / DTC: a hero product card showing the actual SKU (product name + price + "Add to bag" CTA + 1-2 quick attributes + reviews-star count) AND/OR a 3-product mini-grid below it. Soft product-photography vibe via a colored gradient placeholder, not a code window.
         - if Portfolio / Agency: a featured-case-study card with project name + client + 1-line outcome + a thumbnail block (large colored placeholder div with overlay label) OR a typographic showcase tile with the designer\'s name and 3 project chips.
         - if Fitness / Wellness / Hotel: a service / class / room card with photo placeholder (gradient block) + name + price/duration/rate + booking CTA + 2-3 quick attributes (intensity / length / amenities). For Wellness add session-time bullets. For Hotel add "from $X/night + room features".
         - if Real Estate: a property listing card with photo placeholder + price + beds/baths/sqft + neighborhood + "Schedule a tour" CTA.
         - if Nonprofit: an impact-stat block + donation widget mock (suggested amounts + impact-per-amount captions).
         For non-SaaS verticals the mock must NOT look like a terminal/dashboard/code editor — that signals "B2B SaaS" and breaks the vertical fit. Use evocative photography placeholder blocks (bg-gradient-to-br with rich color stops + a low-opacity overlay label), styled menu/card chrome, or typographic showcases instead.
    </section>
    <section id="stats">
      ...subtitle row appropriate to the vertical (e.g. "Trusted at scale" for SaaS; "Loved by [thousands of locals/members/guests]" for consumer; "Featured in [press]" for portfolio/agency)
      ...4 stat columns: text-4xl/5xl number with data-counter data-counter-target + label + 1-line context note. Numbers MUST be vertical-appropriate — SaaS uses uptime/latency/deploys; restaurant uses cups-served/years-roasting/origins; fitness uses members/classes/calories; hotel uses rooms/awards/years; ecommerce uses orders-shipped/repeat-buyers/countries. NEVER use SaaS technical metrics ("99.99% uptime", "API requests/sec") on non-SaaS verticals.
    </section>
${SPLIT_MARKER}

That marker ends your output. NOTHING after it — Part B and Part C produce features/how-it-works/logos/testimonials/pricing/faq/cta/footer/IIFE/closing tags. DO NOT close body or html. Target 12,000-18,000 chars for your portion. Quality of hero mock is the most important detail — make it visually rich with believable, vertical-appropriate content.`

const SYSTEM_PART_B3 = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-3-SPLIT MODE — PART B (5 middle sections — exact section types depend on the SITE TYPE PACK):
Part A already produced: <!DOCTYPE>, <head>, <body opening>, <header>, hero, stats. Part C will produce pricing/menu/booking + faq + cta + footer + IIFE + closing tags. Your job: 5 middle sections appropriate to the vertical.

CRITICAL: read the SITE TYPE PACK in the user prompt. The default 5 sections below are the SaaS shape; for other verticals, swap to the PACK's prescription. Common mappings:
  - SaaS / Developer / Fintech: features grid (12 cards) | use-cases (4 personas) | how-it-works (4 steps with code) | logos grid | testimonials
  - Ecommerce / DTC: featured products (8-card grid with price + add-to-cart) | shop-by-category (3-4 collection tiles) | ingredient/material story OR press strip | bestsellers (4-card) | reviews
  - Restaurant / Coffee: our story (chef/founder bio with portrait) | menu categories (3-5: brunch/lunch/dinner/drinks/specials) | featured menu items (6-8 dishes with name + description + price + dietary tag) | press / awards strip | gallery (6-photo grid placeholder)
  - Portfolio / Agency: about/services (capabilities strip) | case studies grid (6-9 projects with thumbnail + client + outcome) | client logo grid (real brand names plausible for the niche) | our process (4-step methodology) | testimonials with client name + outcome
  - Fitness / Wellness: class/treatment types (4-6 categories with description + duration + intensity/benefits) | trainer/practitioner profiles (3-4 with photo + bio + speciality + certifications) | class schedule grid OR client journey | transformation/recovery stories (3 with testimonial + member name) | facility / amenities strip
  - Hotel: property story | rooms & suites grid (4-8 room types with photo + amenities + nightly price) | amenities strip | dining outlets OR experiences | location guide

LOGO GRID brands: pull EXACTLY from the SITE TYPE PACK's brandAnchors field. DO NOT default to Linear/Vercel/Stripe/Cloudflare/Notion/Anthropic/OpenAI/Hashnode unless the PACK explicitly lists them (those are SaaS-only). For a restaurant the logo grid is press logos (NYT, Eater, Bon Appétit) or supplier brands (Counter Culture, Stumptown); for a hotel it's awards (Conde Nast Hot List, Travel + Leisure, Michelin Keys); for an agency it's past client logos. NEVER include B2B SaaS dev-tool logos in non-SaaS verticals.

TESTIMONIAL author affiliations: again pull from the PACK's brandAnchors. Restaurant testimonials should be from food writers / regulars / local press. Fitness testimonials from members. Wellness testimonials from clients citing recovery outcomes. Hotel testimonials from guests citing specific stays. NEVER fabricate "CTO @ Linear" for a coffee shop.

Output EXACTLY (marker first, then 5 sections, then closing marker):
${SPLIT_MARKER}
  ...5 sections in order, matching the SITE TYPE PACK prescription (or the SaaS default above when the brief is SaaS). Each section ≥3,500 chars. Total ≥28,000 chars across all 5.
${SPLIT_MARKER_BC}

Marker is FIRST line, ${SPLIT_MARKER_BC} is LAST line. NO doctype/html/head/body opening/header/hero/stats at start. NO pricing/menu-pricing/faq/cta/footer/script after. Target 28,000-34,000 chars. Use Lucide icons from the safe list.`

const SYSTEM_PART_C3 = HOMEPAGE_SYSTEM_LEAN + `

PARALLEL-3-SPLIT MODE — PART C (closing 4 sections: commerce/booking + faq + cta + footer + IIFE + closing tags):
Parts A and B already produced <!DOCTYPE> through the testimonials/reviews section. Your job: the rest of the page.

CRITICAL: read the SITE TYPE PACK in the user prompt. The first section after the marker is NOT always "pricing" — it depends on the vertical:
  - SaaS / Developer / Fintech / Education / Wellness / Fitness: <section id="pricing"> with 3 tiers, monthly/yearly toggle (data-pricing-billing), data-show-monthly/data-show-yearly, middle tier scale-105 md:scale-110 ring-2 ring-primary + "Most popular" pill + elevated shadow. 7 feature lines per tier. CTA button per tier (one data-magnet). Prices appropriate to vertical — for SaaS use $/mo; for fitness/wellness use class packs OR $/mo memberships with sensible numbers; never put "API requests/mo" on a fitness page.
  - Ecommerce / DTC: <section id="shop-grid"> — 4-6 SKU cards (product image placeholder + product name + price + 1-line description + "Add to bag" CTA + reviews-star count). NO subscription tiers, NO monthly toggle. Optional "Subscribe & save" banner above the grid.
  - Restaurant / Coffee / Bakery: <section id="menu"> with 2-3 menu categories (e.g. "Single Origins", "Blends", "Subscriptions" OR "Brunch", "Lunch", "Dinner"). Each category 4-6 items with name + 2-line description + price + dietary/origin tags. NO monthly/yearly toggle. Add an "Order online" or "Reserve a table" CTA above or below.
  - Portfolio: <section id="contact"> — contact form OR email CTA + 4-6 social/professional links + "Available for new projects" status indicator. NO pricing tiers.
  - Agency: <section id="start-project"> — "Start a project" form/CTA + service-tier guide rails OR engagement-model cards (Sprint $X / Full Engagement / Retainer) WITHOUT subscription toggle. Could include "Average engagement: 8 weeks" stats inline.
  - Hotel: <section id="rooms-rates"> — room type cards with photo placeholder + name + "from $X/night" + amenities + "Book this room" CTA. NO monthly toggle. Add date-range picker / availability widget mock above.
  - Real Estate / Nonprofit: vertical-specific — listings grid / donation tiers respectively.

Output EXACTLY (marker first, no preamble):
${SPLIT_MARKER_BC}
  ...vertical-appropriate commerce/booking section (see above) — ≥7,000 chars with real concrete content.
  <section id="faq">
    ...heading + 2-line subheading + 6 data-accordion items with data-accordion-trigger + 2-3 sentence answer per FAQ. FAQ topics should fit the vertical (refund policy + shipping for ecommerce; booking + cancellation + dietary accommodations for restaurant; class trials + injuries + scheduling for fitness; etc.).
  </section>
  <section id="cta-final">
    ...penultimate CTA band: heading + subheading + 2 CTAs + trust line. Tone matches the COPY VOICE in the SITE TYPE PACK.
  </section>
  <footer>
    ...4 columns appropriate to vertical (e.g. for restaurant: Visit / Order / About / Press; for hotel: Stay / Dine / Experience / Contact; for SaaS: Product / Resources / Company / Legal). Logo + tagline column on left; copyright + social icons (inline <svg viewBox="0 0 24 24"> for brand glyphs).
  </footer>
  <script>(function(){
    ...single IIFE, null-guarded querySelectors. Concise — single helpers, no redundancy.
    ...wire data-mobile-nav + data-mobile-nav-toggle (is-open class)
    ...wire data-accordion items (click toggles is-open)
    ...wire data-pricing-billing (toggle [data-show-monthly]/[data-show-yearly]) — only if the commerce section uses a toggle
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
