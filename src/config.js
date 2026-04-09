import './env.js'

export const DASHBOARD_PORT = 7420
export const SITE_NAME = 'Ship Fast'
export const SITE_URL = (process.env.SITE_URL ?? 'https://ship-fast.devliv.io').replace(/\/+$/, '')
export const BASE_DOMAIN = process.env.BASE_DOMAIN ?? 'ship-fast.io'
export const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN ?? new URL(SITE_URL).hostname

export const LEGAL_CONTROLLER_NAME = (process.env.LEGAL_CONTROLLER_NAME ?? 'Livio Gamassia').trim()
export const LEGAL_CONTROLLER_ADDRESS = (process.env.LEGAL_CONTROLLER_ADDRESS ?? '').trim()
export const PRIVACY_CONTACT_EMAIL = (
  process.env.PRIVACY_CONTACT_EMAIL ?? 'liviogama@gmail.com'
).trim()
export const PRIVACY_POLICY_JURISDICTION = (process.env.PRIVACY_POLICY_JURISDICTION ?? '').trim()
export const PRIVACY_POLICY_EFFECTIVE_DATE = (
  process.env.PRIVACY_POLICY_EFFECTIVE_DATE ?? '2026-04-03'
).trim()

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
export const HOMEPAGE_MODEL = 'moonshotai/kimi-k2-instruct-0905'
export const SITE_SPEC_MODEL = (process.env.SITE_SPEC_MODEL ?? '').trim() || HOMEPAGE_MODEL

// ─── RunPod / hex-1 Configuration ───────────────────────
export const RUNPOD_API_URL = process.env.RUNPOD_API_URL ?? ''
export const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY ?? ''
export const RUNPOD_MODEL = process.env.RUNPOD_MODEL ?? 'budecosystem/hex-1'
export const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? ''
export const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export const SANITY_PROJECT_ID = (process.env.SANITY_PROJECT_ID ?? '').trim()
export const SANITY_DATASET = (process.env.SANITY_DATASET ?? 'production').trim()
export const SANITY_API_VERSION = (process.env.SANITY_API_VERSION ?? '2024-01-01').trim()
export const SANITY_READ_TOKEN = (process.env.SANITY_READ_TOKEN ?? '').trim()
export const SANITY_WRITE_TOKEN = (process.env.SANITY_WRITE_TOKEN ?? '').trim()
export const SANITY_MANAGEMENT_TOKEN = (process.env.SANITY_MANAGEMENT_TOKEN ?? '').trim()

export const isSanityConfigured = () =>
  Boolean(SANITY_PROJECT_ID && SANITY_DATASET)

export const isSanityChatWriteConfigured = () =>
  Boolean(isSanityConfigured() && SANITY_WRITE_TOKEN)

// ─── Language Configuration (re-exported from config/languages.js) ──
export { KNOWN_LANGUAGES as SUPPORTED_INDIAN_LANGUAGES, INDIAN_DESIGN_TOKENS, INDIAN_LANGUAGE_CODES } from './config/languages.js'

// ─── LLM Configuration ──────────────────────────────────
export const LLM_CONFIG = {
  default: {
    temperature: 0.3,
    maxTokens: 8000,
  },
  homepage: {
    temperature: 0.4,
    maxTokens: 12000,
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
]

export const HOME_LABELS = ['home', 'homepage', 'index', 'landing']

export const ECOMMERCE_ENVATO_TEMPLATES_URL = 'https://elements.envato.com/web-templates/ecommerce'

export const ECOMMERCE_AWWWARDS_GALLERY_URL = 'https://www.awwwards.com/websites/e-commerce/'

export const ECOMMERCE_MEDUSA_DOCS_LEARN = 'https://docs.medusajs.com/learn'

export const getMedusaAdminAppUrl = () => {
  const explicit = (process.env.MEDUSA_ADMIN_URL || '').trim()
  if (explicit) {
    try {
      const u = new URL(explicit)
      return u.pathname === '/' || u.pathname === ''
        ? `${u.origin}/app`
        : explicit.replace(/\/+$/, '')
    } catch {
      return ''
    }
  }
  const backend = (process.env.MEDUSA_BACKEND_URL || '').trim()
  if (!backend) return ''
  try {
    const u = new URL(backend)
    return `${u.origin}/app`
  } catch {
    return ''
  }
}

export const resolveMedusaAdminEmbedPayload = (eligible) => {
  if (process.env.SHIP_FAST_MEDUSA_ADMIN_EMBED === '0') {
    return { show: false, url: null }
  }
  const url = getMedusaAdminAppUrl()
  if (!url) return { show: false, url: null }
  if (!eligible) return { show: false, url }
  return { show: true, url }
}

export const ECOMMERCE_REFERENCE_EXEMPLAR_URLS = Object.freeze([
  'https://www.mvmt.com/home',
  'https://www.ledger.com/',
  'https://www.apple.com/iphone/',
])

export const ECOMMERCE_REFERENCE_EXEMPLARS_FOR_PROMPTS = ECOMMERCE_REFERENCE_EXEMPLAR_URLS.join('\n')

export const MOTION_DEV_DOCS_REACT = 'https://motion.dev/docs/react'

export const MOTION_REACT_GUIDELINES = `Framer Motion: React — \`import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'\`. Vanilla / static HTML — \`import { animate } from 'framer-motion/dom'\` (or CDN \`esm.sh/framer-motion@12/dom\`) to animate DOM nodes without React. Docs: ${MOTION_DEV_DOCS_REACT}. For infinite horizontal tickers duplicate the row and animate \`x\` from \`0%\` to \`-50%\` with linear \`repeat: Infinity\`.`

export const MOTION_NEXT_EXPORT_SUFFIX = ` Next.js or Vite React exports ship with \`framer-motion\`: import from \`framer-motion\` (${MOTION_DEV_DOCS_REACT}) for interactive motion — scroll-linked sections, hover, staggered grids, carousels, modals — not a fully static page; respect \`useReducedMotion\`.`

export const ECOMMERCE_GENERATION_GUIDELINES =
  `Exemplar URLs — study structure, nav depth, section count, and commerce patterns only. For the user's project, invent original naming, copy, and visuals; do not reproduce third-party trademarks, logos, or proprietary text from these pages:\n${ECOMMERCE_REFERENCE_EXEMPLARS_FOR_PROMPTS}\n` +
  `Pattern mix to emulate (abstractly): lifestyle / accessories storefront density; security-hardware style mega-nav with ecosystem and compare paths; long-form product-line page with chaptered features, lineup, education, and support — adapted to the prompt's industry. ` +
  `Also scan: premium web templates (${ECOMMERCE_ENVATO_TEMPLATES_URL}), storefront gallery (${ECOMMERCE_AWWWARDS_GALLERY_URL}). ` +
  `DTC bar: match real retail homepage depth — multi-level shop navigation, promo strip, category shop, large featured assortment, bundles, learn content, reviews, newsletter, fat footer. Not acceptable: sparse SaaS-style pages. ` +
  `Minimum homepage structure: (1) slim top promo/urgency strip, (2) header with logo, search, account link, cart with numeric badge, shop menu with categories/collections/benefits, (3) hero with headline, subcopy, primary shop CTA, optional three benefit chips, (4) shop-by-category — at least four large image tiles with titles, blurbs, CTAs, (5) featured products — six or more cards with image, label, title, review line or stars, price (and compare-at if discounted), add to cart, (6) bundle or subscription band, (7) three educational or story cards, (8) social proof — stats and/or testimonials with names, (9) reviews or press strip, (10) email capture, (11) multi-column footer plus legal. ` +
  `Visual polish: strong photography or gradient placeholders, editorial typography — not a single-column stack of generic cards. ` +
  `Medusa (${ECOMMERCE_MEDUSA_DOCS_LEARN}): Store API via @medusajs/js-sdk; cart, products, regions, checkout per Medusa commerce modules and ecommerce recipe; Next.js export matches Medusa starter integration patterns. ` +
  `${MOTION_REACT_GUIDELINES} Generated ecommerce exports include \`framer-motion\`: use it for cart drawer, cards, and section entrances — not static-only UI. Product carousels in HTML, Next.js, and Vite React use Swiper when the export policy applies (ecommerce sites and prompts that ask for sliders/carousels); static HTML loads Swiper from CDN and initializes \`[data-sf-swiper]\` roots.`

export const SITE_TYPE_INSTRUCTIONS = {
  saas: `SaaS product. Typography-first, no hero images. Premium editorial feel — display font headlines, layered surfaces, optional bento feature grid. Hero: pill badge + massive headline + subtitle + 1 gradient CTA (rounded-full); consider split layout or gradient mesh behind type. Then: features (section label + headline + strong 2-col or bento card grid) \u2192 pricing (2-col, featured has Popular badge + visual emphasis) \u2192 highlight card (gradient/glass with icon) \u2192 logo cloud (company names as text) \u2192 final CTA (headline + 2 buttons) \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  dashboard: `Dashboard/analytics tool. Typography-first. Hero: pill badge + headline about data insights + subtitle + CTA. Then: metrics cards (2x2 grid with KPI numbers) \u2192 features (2x2 cards) \u2192 integrations (logo cloud as text) \u2192 pricing (2-col) \u2192 CTA \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  ecommerce: `${ECOMMERCE_GENERATION_GUIDELINES} Premium e-commerce storefront powered by Medusa.js SDK (lib/medusa.js). Product images allowed here. Data functions: getProducts(), getProductByHandle(), getCategories(), createCart(), addLineItem(), getCart(). Hero: bold headline + subtitle + primary CTA (Shop Now) + featured product hero image with overlay gradient. Then: category grid (2x2 cards via getCategories, lifestyle imagery, hover lift) \u2192 featured products section (horizontal scrolling marquee of product cards \u2014 hover-zoom image, product name, currency-formatted price, stock badge, quick-add-to-cart; wrap Medusa \`ProductCard\` rows in \`ProductMarquee\` from \`components/ecommerce/ProductMarquee.jsx\` when building shop UIs) \u2192 product detail pages (getProductByHandle \u2014 large gallery, variant selector, size/color pickers, Add to Cart CTA, breadcrumbs) \u2192 cart page (getCart + addLineItem \u2014 line items, qty controls, subtotal, checkout CTA) \u2192 checkout flow \u2192 trust & reviews section (star ratings, testimonial cards, trust badges) \u2192 newsletter signup \u2192 footer.`,
  marketplace: `Marketplace platform. Hero: search bar centered + category pills + headline. Then: featured listings (2-col cards with relevant listing imagery or non-photo treatments) \u2192 how it works (3-step icons) \u2192 trust stats \u2192 CTA \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  blog: `Blog/publication. Hero: featured article card with relevant cover image + title + excerpt. Then: article grid (2-col, relevant cover images) \u2192 categories \u2192 newsletter signup \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  docs: `Documentation site. Typography-first. Hero: search bar + quick start code block (dark surface bg, rounded-xl). Then: topic cards (2x2 grid) \u2192 API reference links \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  community: `Community platform. Typography-first. Hero: headline + member count stats + Join CTA. Then: trending topics cards \u2192 member highlights \u2192 activity preview \u2192 CTA \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  portfolio: `Portfolio. Images allowed for projects. Hero: bold name + role title + subtle tagline. Then: selected works (2-col, relevant project imagery or strong graphic panels) \u2192 about \u2192 skills/tech \u2192 contact form \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  landing: `Landing page. Typography-first, no hero images. High-impact layout — not a generic template: asymmetric hero or full-bleed accent band, display typography, motion-friendly sections. Hero: pill badge + oversized headline + subtitle + 1 gradient CTA (rounded-full). Then: features (2x2 or bento cards) \u2192 social proof (stats + logo cloud as text) \u2192 pricing (2-col) \u2192 FAQ \u2192 final CTA \u2192 footer.${MOTION_NEXT_EXPORT_SUFFIX}`,
  game:
    'Fully playable 3D or 2D game using THREE.js. Not a landing page or demo. ' +
    'Fullscreen experience with realistic physics, smooth controls (WASD + mouse), professional HUD, and win/lose conditions. ' +
    'Game loop: MENU state with "Press to Start", then PLAYING state with smooth 60fps gameplay. ' +
    'Graphics: dynamic 3D scene with lighting, particles, camera follow. ' +
    'Audio: sound effect logic (placeholder Web Audio). ' +
    'ONE file only, no external assets except THREE.js CDN. ' +
    'Must be functional and playable without errors.',
}
