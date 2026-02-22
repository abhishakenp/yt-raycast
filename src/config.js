export const DASHBOARD_PORT = 7420
export const PREVIEW_PORT = 3001

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
export const HOMEPAGE_MODEL = 'moonshotai/kimi-k2-instruct-0905'

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
  saas: 'SaaS product. Hero = app UI/dashboard preview (60%+ viewport). Then: key features \u2192 social proof \u2192 CTA.',
  dashboard:
    'Dashboard tool. Hero = realistic data dashboard with charts, KPIs. Then: key metrics \u2192 features \u2192 CTA.',
  ecommerce:
    'E-commerce. Hero = featured products. Then: categories \u2192 deals \u2192 testimonials \u2192 newsletter.',
  marketplace:
    'Marketplace. Hero = search bar + categories. Then: featured listings \u2192 how it works \u2192 trust signals \u2192 CTA.',
  blog: 'Blog/publication. Hero = featured article. Then: article grid \u2192 categories \u2192 newsletter signup.',
  docs: 'Documentation. Hero = search + quick start. Then: popular topics \u2192 API reference links.',
  community:
    'Community platform. Hero = activity feed. Then: trending topics \u2192 member highlights \u2192 join CTA.',
  portfolio:
    'Portfolio. Scroll-driven: hero \u2192 selected works \u2192 about \u2192 skills \u2192 contact.',
  landing:
    'Landing page. Hero + headline + CTA \u2192 features \u2192 social proof \u2192 pricing \u2192 FAQ \u2192 final CTA.',
}
