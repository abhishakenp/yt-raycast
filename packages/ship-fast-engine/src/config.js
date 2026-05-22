import './env.js'

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
export const OPENROUTER_HOST = process.env.OPENROUTER_HOST ?? 'https://openrouter.ai/api'
export const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
export const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'https://ollama.com'
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
/** Slug, translation, language detection — default smaller Groq model. */
export const GROQ_AUX_MODEL = (process.env.GROQ_AUX_MODEL ?? '').trim() || 'llama-3.3-70b-versatile'
export const HOMEPAGE_MODEL = (process.env.HOMEPAGE_MODEL ?? '').trim() || GROQ_MODEL
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
export const GEMINI_MODEL = (process.env.GEMINI_MODEL ?? '').trim() || 'gemini-3.5-flash'
export const HYBRID_PLANNER_MODEL =
  (process.env.HYBRID_PLANNER_MODEL ?? process.env.PLANNER_MODEL ?? '').trim() || HOMEPAGE_MODEL
/** Default on when GEMINI_API_KEY is set; set SHIPFAST_HYBRID_ENGINE=0 to force legacy Groq-only. */
export const SHIPFAST_HYBRID_ENGINE =
  process.env.SHIPFAST_HYBRID_ENGINE !== '0' && Boolean(GEMINI_API_KEY)
/** Kimi-target homepage compiler — default on when Gemini+Groq are available; set SHIPFAST_KIMI_ENGINE=0 to force the older hybrid/Groq path. */
export const SHIPFAST_KIMI_ENGINE =
  process.env.SHIPFAST_KIMI_ENGINE !== '0' && Boolean(GROQ_API_KEY && GEMINI_API_KEY)
/** Mobbin Pro DNA anchors — on by default; set SHIPFAST_MOBBIN=0 to disable. */
export const SHIPFAST_MOBBIN = process.env.SHIPFAST_MOBBIN !== '0'
/** OpenUI `home.openui` generation (matches streaming default for predictable layouts). */
export const OPENUI_HOME_MODEL =
  (process.env.OPENUI_HOME_MODEL ?? '').trim() || 'openai/gpt-oss-120b'
export const SITE_SPEC_MODEL = (process.env.SITE_SPEC_MODEL ?? '').trim() || HOMEPAGE_MODEL
export const SITE_SPEC_ENRICH_MODEL = (process.env.SITE_SPEC_ENRICH_MODEL ?? '').trim()
export const SHIP_FAST_SITE_SPEC_ENRICH = process.env.SHIP_FAST_SITE_SPEC_ENRICH === '1'

export const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? ''
export const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export {
  KNOWN_LANGUAGES as SUPPORTED_INDIAN_LANGUAGES,
  INDIAN_DESIGN_TOKENS,
  INDIAN_LANGUAGE_CODES,
} from './config/languages.js'

export const LLM_CONFIG = {
  default: {
    temperature: 0.3,
    maxTokens: 8000,
  },
  homepage: {
    temperature: 0.62,
    // FORGE-validated default: 10000 keeps reasoning_effort='low' inside the
    // 13-18s generation envelope on GPT-OSS-120b. Caller can opt up to 32000
    // via SHIPFAST_HOMEPAGE_MAX_TOKENS for manual high-budget runs.
    maxTokens: Math.min(
      32000,
      Math.max(
        8000,
        parseInt(process.env.SHIPFAST_HOMEPAGE_MAX_TOKENS || '10000', 10) || 10000,
      ),
    ),
  },
  parallel: {
    temperature: 0.3,
    maxTokens: 8000,
  },
  game: {
    temperature: 0.5,
    maxTokens: 24000,
  },
}

export const VALID_SITE_TYPES = [
  'saas',
  'landing',
  'portfolio',
  'ecommerce',
  'blog',
  'docs',
  'dashboard',
  'marketplace',
  'community',
  'game',
  'institutional',
]

export const HOME_LABELS = ['home', 'homepage', 'index', 'landing']

export const ECOMMERCE_ENVATO_TEMPLATES_URL = 'https://elements.envato.com/web-templates/ecommerce'

export const ECOMMERCE_AWWWARDS_GALLERY_URL = 'https://www.awwwards.com/websites/e-commerce/'

export const ECOMMERCE_DRIBBBLE_TAG_URL = 'https://dribbble.com/tags/ecommerce-website'

export const ECOMMERCE_MEDUSA_DOCS_LEARN = 'https://docs.medusajs.com/learn'

import { ECOMMERCE_CURATED_STYLE_ANCHORS } from './config/ecommerce-inspiration.js'

export const ECOMMERCE_REFERENCE_EXEMPLAR_URLS = Object.freeze([
  'https://www.mvmt.com/home',
  'https://www.ledger.com/',
  'https://www.apple.com/iphone/',
])

export const ECOMMERCE_REFERENCE_EXEMPLARS_FOR_PROMPTS =
  ECOMMERCE_REFERENCE_EXEMPLAR_URLS.join('\n')

export const ECOMMERCE_EDITORIAL_CANVAS_PATTERN =
  'Premium storefront composition bar (invent an original brand; do not copy third-party names or marks). Derive page ground, ink, and accent from the user prompt, product category, and any verified brand colors—avoid repeating the same neutral+cream+wine look on unrelated shops: ' +
  'sticky header with wordmark left, three to five core nav links centered (shop, collections, about pattern), utilities right with small inline SVGs for search, account, and shopping bag cart plus item count or notification dot; ' +
  'split hero: left column display headline (serif or sans—match the brief), supporting line, solid accent primary CTA (e.g. shop), secondary outline or ghost CTA (e.g. story); right column one tall product or lifestyle photo with rounded corners and soft shadow; in CSS include @media (max-width: 900px) for the hero so stacked layout centers headline, subcopy, and button row (justify-content center), not awkward flush-left; hero h1 uses a responsive clamp() so the title stays one or two balanced lines; ' +
  'shop-by-collection as a horizontal rail or carousel of image-forward tiles with bottom gradient scrim and light category titles; ' +
  'featured products as a dense grid: large photo, optional corner badge, product name in a display or strong sans face, short description, bold price, accent-colored star row, full-width solid accent add-to-cart button per card—each such button must include data-product="<exact same title as the product name on that card>" for Medusa line-item wiring; ' +
  'curated sets as two equal editorial panels or one carousel with clear dots and two visible offers; ' +
  'materials and craft as two columns—copy with short checklist and one large supporting image; ' +
  'reviews as three light cards in a row with stars, quote, name or locale, verified buyer cue; ' +
  'newsletter as a full-width band with strong contrast (palette-appropriate, not always charcoal-on-cream); ' +
  'footer four columns of links plus compact social icons as inline SVGs. ' +
  'This checklist is depth and merchandising quality—not a single fixed visual skin.'

export const ECOMMERCE_DRIBBBLE_VISUAL_LANGUAGE =
  `Contemporary ecommerce UI direction (${ECOMMERCE_DRIBBBLE_TAG_URL} — use for layout and craft patterns only; do not copy specific shots, logos, or proprietary artwork): ` +
  `luxury DTC: editorial spacing, disciplined palette, and product-first composition; quiet luxury tone (craftsmanship/materials/provenance) without sounding like generic AI; ` +
  `art-directed hero with strong display typography and layered product or lifestyle photography (or gradient mesh / duotone silhouette when no photo); ` +
  `dense but breathable grids — consistent image aspect ratios, careful baseline alignment, hover lift and subtle image zoom; ` +
  `category rows as full-bleed tiles, horizontal scroll strips, or small bento clusters; ` +
  `pills and micro-labels (e.g. New, Sale, Bestseller) with clear hierarchy; ` +
  `one confident accent on disciplined neutrals (stone/zinc/ink), or intentional duotone / tinted imagery; avoid “default violet-on-gray template”; ` +
  `editorial tension — asymmetric splits, oversized numerals or words as background, or a single full-bleed promo band; ` +
  `polished chrome: sticky store header with search and cart badge, promo strip, fat footer; ` +
  `avoid sparse SaaS symmetry and icon-only merchandising — the page must read as a designed storefront, not a marketing landing with three feature cards.`

export const MOTION_DEV_DOCS_REACT = 'https://motion.dev/docs/react'

export const MOTION_REACT_GUIDELINES = `Framer Motion: React — \`import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'\`. Vanilla / static HTML — \`import { animate } from 'framer-motion/dom'\` (or CDN \`esm.sh/framer-motion@12/dom\`) to animate DOM nodes without React. Docs: ${MOTION_DEV_DOCS_REACT}. For infinite horizontal tickers duplicate the row and animate \`x\` from \`0%\` to \`-50%\` with linear \`repeat: Infinity\`.`

export const MOTION_NEXT_EXPORT_SUFFIX = ` Next.js or Vite React exports ship with \`framer-motion\`: import from \`framer-motion\` (${MOTION_DEV_DOCS_REACT}) for interactive motion — scroll-linked sections, hover, staggered grids, carousels, modals — not a fully static page; respect \`useReducedMotion\`.`

export const GLOBAL_UI_CRAFT_GUIDELINES =
  `Spacing: consistent rhythm (e.g. 4/8px steps, generous section padding). Align blocks to a clear grid; avoid arbitrary staggered columns. ` +
  `Typography: limit distinct levels per view (hero, section title, body, caption); keep body copy readable on mobile—never tiny low-contrast gray for primary text. ` +
  `Color: one dominant accent per major view; neutrals for structure; avoid competing rainbow accents and cliché violet/indigo defaults unless the brand demands it. ` +
  `Components: consistent border-radius scale and restrained elevation; interactive elements need clear hover and focus-visible states. ` +
  `Whitespace: separate sections and ideas with space, not decoration; strip non-functional visual noise.`

export const ECOMMERCE_GROWTH_UX_PRINCIPLES =
  `Luxury DTC UX: mobile-first; speed-feeling UI (lean first screen, defer heavy sections), generous rhythm, and confident hierarchy. ` +
  `Discovery: sticky or always-visible search; clear IA so shoppers reach collection or PDP intent in few taps; collection sort stays applied; filters are optional but when present they must be usable on mobile. ` +
  `Merchandising clarity: every product grid item shows name, price, and one trust microline (e.g. “Free shipping over …”, “30-day returns”, “Ships in 24h”) and a real CTA (Add to cart or View details). ` +
  `PDP: clear breadcrumbs; 3–7 gallery items when images exist; meaningful alt text; variant selectors (size/color) with disabled states; show delivery/returns/warranty policy near the CTA; product video only when verified assets are provided. ` +
  `Cart and checkout: guest checkout as default framing; stepped or single-page flow with a visible progress indicator; show subtotal, shipping, tax, and total before payment; minimal fields; use HTML autocomplete on name, email, and address fields where applicable (Medusa-aligned; no invented payment backends). ` +
  `Trust: security and payment badges near checkout summary and in footer; add policy links (Shipping, Returns, Warranty) where it reduces anxiety (PDP and checkout). Optional slim cookie/privacy strip as UI chrome only. ` +
  `Copy tone: premium, concise, specific; avoid hypey clichés and generic AI phrasing. ` +
  `CTAs: clear primary vs secondary on shop, cart, and checkout. When proposing headline or checkout copy variants, name one plausible target KPI (conversion, cart abandonment, AOV) and a one-line test hypothesis.`

const ECOMMERCE_GUIDELINES_EXEMPLAR_LEAD = `Exemplar URLs — study structure, nav depth, section count, and commerce patterns only. For the user's project, invent original naming, copy, and visuals; do not reproduce third-party trademarks, logos, or proprietary text from these pages:\n${ECOMMERCE_REFERENCE_EXEMPLARS_FOR_PROMPTS}\n`

const ECOMMERCE_GUIDELINES_USER_REFS_LEAD = `When the prompt includes "Primary stylistic direction (user-supplied reference links)" with HTTPS URLs and path hints, treat that block as primary for layout, header, hero emphasis, rhythm, and palette family—ahead of named retail exemplars. Invent original naming, copy, and visuals; do not reproduce third-party trademarks, logos, or proprietary text. `

const ECOMMERCE_GUIDELINES_SHARED_BODY =
  `${ECOMMERCE_EDITORIAL_CANVAS_PATTERN} ` +
  `When the user prompt omits layout or section specifics, still ship the full section stack above—promo or trust strip when it fits; header with logo left, Shop / Collections / About centered, search + account + cart with badge right; hero with display headline, dual CTAs, and strong product or lifestyle visual; shop-by-collection rail or grid with scrims; 6+ featured products with full-width add-to-cart; curated sets two-up; materials or story two-column with checklist; three review cards; newsletter band; four-column footer—in English unless the prompt requests another language. Vary serif vs sans, light vs dark ground, and accent hue from the brief so storefronts do not all look like the same template. ` +
  `Pattern mix to emulate (abstractly): lifestyle / accessories storefront density; security-hardware style mega-nav with ecosystem and compare paths; long-form product-line page with chaptered features, lineup, education, and support — adapted to the prompt's industry. ` +
  `Also scan: premium web templates (${ECOMMERCE_ENVATO_TEMPLATES_URL}), storefront gallery (${ECOMMERCE_AWWWARDS_GALLERY_URL}), ecommerce UI tag (${ECOMMERCE_DRIBBBLE_TAG_URL}). ` +
  `${ECOMMERCE_DRIBBBLE_VISUAL_LANGUAGE} ` +
  `Luxury DTC bar: match real premium retail depth and restraint — multi-level shop navigation, promo strip, shop-by-collection, featured assortment, gift sets/bundles, brand story, reviews, newsletter, fat footer. Not acceptable: sparse SaaS-style pages or generic “feature-card” layouts. ` +
  `Minimum homepage structure: (1) slim top promo/benefit strip (shipping/returns), (2) sticky header with logo, search, account link, cart with numeric badge, shop menu with collections/categories, (3) hero with headline, subcopy, primary shop CTA, optional three benefit chips, (4) shop by collection/category — at least four large image tiles with titles + 1-line descriptor + CTA, (5) featured products — six or more cards with image, label/badge, title, rating line or review count, price (and compare-at if discounted), primary CTA; add a trust microline, (6) gift set / bundle / subscription band, (7) editorial story band (materials/craft/guarantee) or three learn cards, (8) social proof — testimonials with names and context (role/location optional only if provided), (9) reviews or press strip, (10) email capture, (11) multi-column footer plus legal and policy links. ` +
  `Visual polish: art-directed hero composition, consistent product imagery treatment, editorial typography pairing and whitespace — not a single-column stack of generic cards. ` +
  `${ECOMMERCE_CURATED_STYLE_ANCHORS} ` +
  `Every ecommerce homepage must visually scan as retail: promo band, store-style header (search + cart cues), hero with product or lifestyle imagery, category tiles with photos, dense product grids with price + CTA — not a SaaS marketing page with a few icons. ` +
  `Medusa (${ECOMMERCE_MEDUSA_DOCS_LEARN}): Store API via @medusajs/js-sdk; cart, products, regions, checkout per Medusa commerce modules and ecommerce recipe; Next.js export matches Medusa starter integration patterns. ` +
  `${MOTION_REACT_GUIDELINES} Generated ecommerce exports include \`framer-motion\`: use it for cart drawer, cards, and section entrances — not static-only UI. Product carousels in HTML, Next.js, and Vite React use Swiper when the export policy applies (ecommerce sites and prompts that ask for sliders/carousels); static HTML loads Swiper from CDN and initializes \`[data-sf-swiper]\` roots. ` +
  `${ECOMMERCE_GROWTH_UX_PRINCIPLES}`

export const getEcommerceGenerationGuidelines = ({ hasUserDesignReferences = false } = {}) =>
  hasUserDesignReferences
    ? ECOMMERCE_GUIDELINES_USER_REFS_LEAD + ECOMMERCE_GUIDELINES_SHARED_BODY
    : ECOMMERCE_GUIDELINES_EXEMPLAR_LEAD + ECOMMERCE_GUIDELINES_SHARED_BODY

export const ECOMMERCE_GENERATION_GUIDELINES = getEcommerceGenerationGuidelines({
  hasUserDesignReferences: false,
})

export const ECOMMERCE_SITE_TYPE_MEDUSA_SUFFIX = ` Premium Medusa-backed storefront (lib/medusa.js): getProducts(), getProductByHandle(), getCategories(), createCart(), addLineItem(), getCart(). Flow: editorial hero with bold headline, subtitle, primary shop CTA, and hero product frame → category grid with lifestyle or product photography → featured products as a dense grid or horizontal rail with hover on imagery, clear prices, stock or badge cues, and add-to-cart as real buttons → PDP with gallery, variants, and add-to-cart → cart with line items, quantity controls as buttons, subtotal, checkout CTA → checkout → trust and reviews → newsletter → footer.`

export const buildEcommerceSiteTypeInstructions = (hasUserDesignReferences = false) =>
  `${getEcommerceGenerationGuidelines({ hasUserDesignReferences })}${ECOMMERCE_SITE_TYPE_MEDUSA_SUFFIX}`

export const SITE_TYPE_INSTRUCTIONS = {
  saas: `SaaS product. Typography-first, no hero images. Premium editorial feel — display font headlines, layered surfaces, optional bento feature grid. Hero: pill badge + massive headline + subtitle + dual CTAs; behind them ship a real <canvas> with requestAnimationFrame particles/mesh, stacked radial-gradient + blur-3xl aurora layers with theme.extend keyframed drift, data-magnet on hero CTAs, data-reveal on major bands, skew/rotate or clip-path energy somewhere; body copy on dark uses text-slate-300/400 never slate-500 on large paragraphs. Then: features (section label + headline + strong 2-col or bento card grid) → pricing (2-col, featured has Popular badge + visual emphasis) → highlight card (gradient/glass with icon) → logo cloud (company names as text) → final CTA (headline + 2 buttons) → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  dashboard: `Dashboard/analytics tool. Typography-first. Hero: pill badge + headline about data insights + subtitle + CTA. Then: metrics cards (2x2 grid with KPI numbers) → features (2x2 cards) → integrations (logo cloud as text) → pricing (2-col) → CTA → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  ecommerce: buildEcommerceSiteTypeInstructions(false),
  marketplace: `Marketplace platform. Hero: search bar centered + category pills + headline. Then: featured listings (2-col cards with relevant listing imagery or non-photo treatments) → how it works (3-step icons) → trust stats → CTA → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  blog: `Blog/publication. Hero: featured article card with relevant cover image + title + excerpt. Then: article grid (2-col, relevant cover images) → categories → newsletter signup → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  docs: `Documentation site. Typography-first. Hero: search bar + quick start code block (dark surface bg, rounded-xl). Then: topic cards (2x2 grid) → API reference links → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  community: `Community platform. Typography-first. Hero: headline + member count stats + Join CTA. Then: trending topics cards → member highlights → activity preview → CTA → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  portfolio: `Portfolio. Images allowed for projects. Hero: bold name + role title + subtle tagline. Then: selected works (2-col, relevant project imagery or strong graphic panels) → about → skills/tech → contact form → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  landing: `Landing page. Typography-first, no hero images. High-impact layout — not a generic template: asymmetric hero or full-bleed accent band, display typography, motion-friendly sections. Hero: pill badge + oversized headline + subtitle + dual CTAs; same motion craft as SaaS — hero <canvas> rAF field, multi radial-gradient blur mesh + keyframed liquid motion, data-magnet + data-reveal, diagonal/slant energy, strong paragraph contrast on dark. Then: features (2x2 or bento cards) → social proof (stats + logo cloud as text) → pricing (2-col) → FAQ → final CTA → footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  game:
    'Fully playable 3D or 2D game using THREE.js. Not a landing page or demo. ' +
    'Fullscreen experience with realistic physics, smooth controls (WASD + mouse), professional HUD, and win/lose conditions. ' +
    'Game loop: MENU state with "Press to Start", then PLAYING state with smooth 60fps gameplay. ' +
    'Graphics: dynamic 3D scene with lighting, particles, camera follow. ' +
    'Audio: sound effect logic (placeholder Web Audio). ' +
    'ONE file only, no external assets except THREE.js CDN. ' +
    'Must be functional and playable without errors.',
}
