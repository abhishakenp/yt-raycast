import { VALID_SITE_TYPES } from '../../config.js'

export const GLOBAL_DEFAULT_REF_ID = 'landing-base'

export const DESIGN_REF_ENTRIES = [
  {
    id: 'ecommerce-fashion',
    file: 'ecommerce-fashion',
    contentPlanFile: 'ecommerce-fashion',
    siteTypes: ['ecommerce'],
    keywordPatterns: [
      /\bfashion\b/i,
      /\bapparel\b/i,
      /\bclothing\b/i,
      /\bjewelry\b/i,
      /\bluxury\b/i,
    ],
    priority: 80,
    defaultPreset: 'storefrontEditorial',
    injectAuroraLiquid: false,
  },
  {
    id: 'saas-fintech',
    file: 'saas-fintech',
    contentPlanFile: 'saas-fintech',
    siteTypes: ['saas', 'landing'],
    keywordPatterns: [
      /\bfintech\b/i,
      /\bpayments?\b/i,
      /\bbanking\b/i,
      /\blending\b/i,
      /\bneobank\b/i,
      /\bwallet\b/i,
    ],
    priority: 80,
    defaultPreset: 'marketingDark',
    injectAuroraLiquid: false,
  },
  {
    id: 'saas-devtools',
    file: 'saas-devtools',
    contentPlanFile: 'saas-devtools',
    siteTypes: ['saas', 'landing', 'docs'],
    keywordPatterns: [
      /\b(api|sdk|devtools|developer|github|ci\/cd|observability|infra)\b/i,
      /\b(database|postgres|kubernetes)\b/i,
    ],
    priority: 75,
    defaultPreset: 'docsDev',
    injectAuroraLiquid: false,
  },
  {
    id: 'docs-api',
    file: 'docs-api',
    contentPlanFile: 'docs-api',
    siteTypes: ['docs'],
    keywordPatterns: [
      /\b(rest|graphql|openapi|swagger)\b/i,
      /\bapi docs\b/i,
      /\bendpoint\b/i,
    ],
    priority: 70,
    defaultPreset: 'docsDev',
    injectAuroraLiquid: false,
  },
  {
    id: 'institutional-aurora',
    file: 'aurora',
    contentPlanFile: 'aurora',
    siteTypes: ['institutional'],
    keywordPatterns: [
      /\b(government|ministry|municipal|citizen|tender|portal)\b/i,
      /public\s+sector/i,
    ],
    priority: 90,
    defaultPreset: 'institutionalCivic',
    injectAuroraLiquid: true,
  },
  {
    id: 'ecommerce-digital',
    file: 'ecommerce-digital',
    contentPlanFile: 'ecommerce-digital',
    siteTypes: ['ecommerce'],
    keywordPatterns: [/\b(digital|software|license|download|subscription)\b/i],
    priority: 60,
    defaultPreset: 'storefrontEditorial',
    injectAuroraLiquid: false,
  },
  {
    id: 'dashboard-admin',
    file: 'dashboard-admin',
    contentPlanFile: 'dashboard-admin',
    siteTypes: ['dashboard'],
    keywordPatterns: [/\b(admin|analytics|reports|queue|workflow)\b/i],
    priority: 70,
    defaultPreset: 'dashboardShell',
    injectAuroraLiquid: false,
  },
  {
    id: 'portfolio-creative',
    file: 'portfolio-creative',
    contentPlanFile: 'portfolio-creative',
    siteTypes: ['portfolio'],
    keywordPatterns: [
      /\b(photographer|designer|creative director|illustrator)\b/i,
    ],
    priority: 65,
    defaultPreset: 'portfolioShowcase',
    injectAuroraLiquid: false,
  },
]

for (const st of VALID_SITE_TYPES) {
  const presetMap = {
    ecommerce: 'storefrontEditorial',
    docs: 'docsDev',
    institutional: 'institutionalCivic',
    dashboard: 'dashboardShell',
    portfolio: 'portfolioShowcase',
    blog: 'blogEditorial',
    marketplace: 'marketplaceTwoSided',
    community: 'communitySocial',
    game: 'gameLanding',
    saas: 'marketingDark',
    landing: 'marketingDark',
  }
  DESIGN_REF_ENTRIES.push({
    id: `${st}-base`,
    file: `${st}-base`,
    contentPlanFile: `${st}-base`,
    siteTypes: [st],
    keywordPatterns: [],
    priority: 5,
    defaultPreset: presetMap[st] || 'marketingDark',
    injectAuroraLiquid: false,
  })
}

export function sortEntriesByPriority(entries = DESIGN_REF_ENTRIES) {
  return [...entries].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}
