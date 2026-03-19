export const DASHBOARD_PORT = 7420

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
export const HOMEPAGE_MODEL = 'moonshotai/kimi-k2-instruct-0905'

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
]

export const HOME_LABELS = ['home', 'homepage', 'index', 'landing']

export const SITE_TYPE_INSTRUCTIONS = {
  saas:
    'SaaS product. Typography-first, no hero images. ' +
    'Hero: pill badge + massive headline + subtitle + 1 gradient CTA (rounded-full). ' +
    'Then: features (section label + headline + 2x2 card grid) \u2192 pricing (2-col, featured has Popular badge) \u2192 highlight card (gradient bg with icon) \u2192 logo cloud (company names as text) \u2192 final CTA (headline + 2 buttons) \u2192 footer.',
  dashboard:
    'Dashboard/analytics tool. Typography-first. ' +
    'Hero: pill badge + headline about data insights + subtitle + CTA. ' +
    'Then: metrics cards (2x2 grid with KPI numbers) \u2192 features (2x2 cards) \u2192 integrations (logo cloud as text) \u2192 pricing (2-col) \u2192 CTA \u2192 footer.',
  ecommerce:
    'E-commerce storefront. Product images allowed here. ' +
    'Hero: headline + subtitle + CTA + featured product image (picsum). ' +
    'Then: category cards (2x2, picsum images) \u2192 featured products \u2192 deals banner \u2192 newsletter \u2192 footer.',
  marketplace:
    'Marketplace platform. ' +
    'Hero: search bar centered + category pills + headline. ' +
    'Then: featured listings (2-col cards with picsum images) \u2192 how it works (3-step icons) \u2192 trust stats \u2192 CTA \u2192 footer.',
  blog:
    'Blog/publication. ' +
    'Hero: featured article card with picsum image + title + excerpt. ' +
    'Then: article grid (2-col, picsum images) \u2192 categories \u2192 newsletter signup \u2192 footer.',
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
    'Then: selected works (2-col, picsum images) \u2192 about \u2192 skills/tech \u2192 contact form \u2192 footer.',
  landing:
    'Landing page. Typography-first, no hero images. ' +
    'Hero: pill badge + oversized headline + subtitle + 1 gradient CTA (rounded-full). ' +
    'Then: features (2x2 cards) \u2192 social proof (stats + logo cloud as text) \u2192 pricing (2-col) \u2192 FAQ \u2192 final CTA \u2192 footer.',
}
