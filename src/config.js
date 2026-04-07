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

export const SITE_TYPE_INSTRUCTIONS = {
  saas:
    'SaaS product. Typography-first, no hero images. Premium editorial feel — display font headlines, layered surfaces, optional bento feature grid. ' +
    'Hero: pill badge + massive headline + subtitle + 1 gradient CTA (rounded-full); consider split layout or gradient mesh behind type. ' +
    'Then: features (section label + headline + strong 2-col or bento card grid) \u2192 pricing (2-col, featured has Popular badge + visual emphasis) \u2192 highlight card (gradient/glass with icon) \u2192 logo cloud (company names as text) \u2192 final CTA (headline + 2 buttons) \u2192 footer.',
  dashboard:
    'Dashboard/analytics tool. Typography-first. ' +
    'Hero: pill badge + headline about data insights + subtitle + CTA. ' +
    'Then: metrics cards (2x2 grid with KPI numbers) \u2192 features (2x2 cards) \u2192 integrations (logo cloud as text) \u2192 pricing (2-col) \u2192 CTA \u2192 footer.',
  ecommerce:
    'Premium e-commerce storefront powered by Medusa.js SDK (lib/medusa.js). Product images allowed here. ' +
    'Data functions: getProducts(), getProductByHandle(), getCategories(), createCart(), addLineItem(), getCart(). ' +
    'Hero: bold headline + subtitle + primary CTA (Shop Now) + featured product hero image with overlay gradient. ' +
    'Then: category grid (2x2 cards via getCategories, lifestyle imagery, hover lift) \u2192 ' +
    'featured products section (getProducts grid \u2014 cards with hover-zoom image, product name, currency-formatted price, stock badge, quick-add-to-cart button) \u2192 ' +
    'product detail pages (getProductByHandle \u2014 large gallery, variant selector, size/color pickers, Add to Cart CTA, breadcrumbs) \u2192 ' +
    'cart page (getCart + addLineItem \u2014 line items, qty controls, subtotal, checkout CTA) \u2192 checkout flow \u2192 ' +
    'trust & reviews section (star ratings, testimonial cards, trust badges) \u2192 newsletter signup \u2192 footer.',
  marketplace:
    'Marketplace platform. ' +
    'Hero: search bar centered + category pills + headline. ' +
    'Then: featured listings (2-col cards with relevant listing imagery or non-photo treatments) \u2192 how it works (3-step icons) \u2192 trust stats \u2192 CTA \u2192 footer.',
  blog:
    'Blog/publication. ' +
    'Hero: featured article card with relevant cover image + title + excerpt. ' +
    'Then: article grid (2-col, relevant cover images) \u2192 categories \u2192 newsletter signup \u2192 footer.',
  docs:
    'Documentation site. Typography-first. ' +
    'Hero: search bar + quick start code block (dark surface bg, rounded-xl). ' +
    'Then: topic cards (2x2 grid) \u2192 API reference links \u2192 footer.',
  community:
    'Community platform. Typography-first. ' +
    'Hero: headline + member count stats + Join CTA. ' +
    'Then: trending topics cards \u2192 member highlights \u2192 activity preview \u2192 CTA \u2192 footer.',
  portfolio:
    'Portfolio. Images allowed for projects. ' +
    'Hero: bold name + role title + subtle tagline. ' +
    'Then: selected works (2-col, relevant project imagery or strong graphic panels) \u2192 about \u2192 skills/tech \u2192 contact form \u2192 footer.',
  landing:
    'Landing page. Typography-first, no hero images. High-impact layout — not a generic template: asymmetric hero or full-bleed accent band, display typography, motion-friendly sections. ' +
    'Hero: pill badge + oversized headline + subtitle + 1 gradient CTA (rounded-full). ' +
    'Then: features (2x2 or bento cards) \u2192 social proof (stats + logo cloud as text) \u2192 pricing (2-col) \u2192 FAQ \u2192 final CTA \u2192 footer.',
  game:
    'Fully playable 3D or 2D game using THREE.js. Not a landing page or demo. ' +
    'Fullscreen experience with realistic physics, smooth controls (WASD + mouse), professional HUD, and win/lose conditions. ' +
    'Game loop: MENU state with "Press to Start", then PLAYING state with smooth 60fps gameplay. ' +
    'Graphics: dynamic 3D scene with lighting, particles, camera follow. ' +
    'Audio: sound effect logic (placeholder Web Audio). ' +
    'ONE file only, no external assets except THREE.js CDN. ' +
    'Must be functional and playable without errors.',
}
