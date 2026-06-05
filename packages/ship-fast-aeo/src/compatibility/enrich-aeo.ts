import type { PageAeoContract, SectionLike, SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { promptSnippet } from './prompt-snippet.ts'

function inferCategory(siteType: string, prompt: string): string {
  const type = siteType.toLowerCase()
  if (type === 'ecommerce') return 'Online store'
  if (type === 'institutional') return 'Institutional website'
  if (['software', 'saas', 'dashboard'].includes(type)) return 'Software product'
  if (/\bblog\b|\bpublication\b|\bnewsletter\b/i.test(prompt)) return 'Publication'
  if (/\bportfolio\b|\bcreative\b/i.test(prompt)) return 'Portfolio'
  return 'Business website'
}

function defaultSuggestedQueries(brand: string, category: string): string[] {
  const name = brand.toLowerCase()
  return [
    `what is ${name}`,
    `who is ${name} for`,
    `${name} ${category.toLowerCase()}`,
  ].filter(Boolean)
}

function buildDirectAnswerSection(brand: string, tagline: string, audience: string): SectionLike {
  return {
    id: 'direct-answer',
    type: 'direct-answer',
    variant: 'default',
    body: tagline || `${brand} helps customers solve real problems with a clear, trustworthy web presence.`,
    items: audience ? [{ title: 'Audience', body: audience }] : [],
  }
}

function buildDefaultFaq(brand: string, category: string, audience: string): SectionLike {
  return {
    id: 'faq',
    type: 'faq',
    variant: 'accordion',
    headline: `Frequently asked questions about ${brand}`,
    items: [
      {
        title: `What is ${brand}?`,
        body: `${brand} is a ${category.toLowerCase()} designed to help ${audience || 'customers'} achieve their goals with clear information and useful features.`,
      },
      {
        title: `Who is ${brand} for?`,
        body: audience || `${brand} is built for people who need a reliable solution in this category.`,
      },
      {
        title: `Why choose ${brand}?`,
        body: `${brand} focuses on clarity, trust, and practical outcomes so visitors can understand the offer quickly and take action.`,
      },
    ],
  }
}

export function enrichPageAeo(
  page: SitePageLike,
  siteSpec: SiteSpecLike,
  prompt: string,
): SitePageLike {
  const brand = String(siteSpec.projectName || siteSpec.seo?.siteName || 'This site').trim()
  const siteType = String(siteSpec.siteType || 'landing')
  const category = inferCategory(siteType, prompt)
  const audience =
    page.aeo?.entitySignals?.audience ||
    (/\bfor\b/i.test(prompt) ? promptSnippet(prompt, 120, 'its target audience') : 'its target audience')

  const aeo: PageAeoContract = {
    objective: page.aeo?.objective || `Explain what ${brand} does and who it serves on ${page.route || '/'}`,
    targetIntent: page.aeo?.targetIntent || `understand ${brand}`,
    suggestedQueries: page.aeo?.suggestedQueries?.length
      ? page.aeo.suggestedQueries
      : defaultSuggestedQueries(brand, category),
    entitySignals: {
      brandName: brand,
      category,
      audience,
      useCases: page.aeo?.entitySignals?.useCases || [],
      benefits: page.aeo?.entitySignals?.benefits || [],
      differentiators: page.aeo?.entitySignals?.differentiators || [],
      contact: page.aeo?.entitySignals?.contact,
    },
  }

  const sections = [...(page.sections || [])]
  const hasDirectAnswer = sections.some((section) => section.type === 'direct-answer')
  const hasFaq = sections.some((section) => section.type === 'faq')

  if (page.route === '/' && !hasDirectAnswer) {
    const heroIndex = sections.findIndex((section) => section.type === 'hero')
    const insertAt = heroIndex >= 0 ? heroIndex + 1 : 0
    sections.splice(
      insertAt,
      0,
      buildDirectAnswerSection(brand, String(page.description || siteSpec.seo?.description || ''), audience),
    )
  }

  if (page.route === '/' && !hasFaq) {
    sections.push(buildDefaultFaq(brand, category, audience))
  }

  return {
    ...page,
    aeo,
    sections,
  }
}

export function enrichSiteSpecAeo(siteSpec: SiteSpecLike, prompt = ''): SiteSpecLike {
  const brand = String(siteSpec.projectName || siteSpec.seo?.siteName || promptSnippet(prompt, 40, 'Generated Project'))
  const siteType = String(siteSpec.siteType || 'landing')
  const category = inferCategory(siteType, prompt)
  const description = String(siteSpec.seo?.description || `${brand} — ${category}`)

  const seo = {
    title: siteSpec.seo?.title || `${brand} | ${category}`,
    description,
    siteName: siteSpec.seo?.siteName || brand,
    siteUrl: siteSpec.seo?.siteUrl || '',
    keywords: siteSpec.seo?.keywords || [brand.toLowerCase(), category.toLowerCase()],
    ogImage: siteSpec.seo?.ogImage || '',
    ogImageAlt: siteSpec.seo?.ogImageAlt || `${brand} preview`,
    twitterCard: siteSpec.seo?.twitterCard || 'summary_large_image',
    locale: siteSpec.seo?.locale || 'en_US',
    robots: siteSpec.seo?.robots || 'index, follow',
  }

  const pages = (siteSpec.pages || []).map((page) => enrichPageAeo(page, { ...siteSpec, projectName: brand, seo }, prompt))

  return {
    ...siteSpec,
    projectName: brand,
    seo,
    pages,
  }
}
