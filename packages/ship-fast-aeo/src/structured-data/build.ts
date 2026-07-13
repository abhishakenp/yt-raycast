import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { extractFaqItems } from '../seo/extract-faq.ts'
import { resolvePageSeo } from '../seo/resolve-page-seo.ts'
import { cleanObject, joinUrl, normalizePath } from '../utils.ts'

const SOFTWARE_SITE_TYPES = new Set(['software', 'saas', 'dashboard', 'app'])

const BLOG_SITE_TYPES = new Set(['blog', 'publication'])

const LOCAL_BUSINESS_SCHEMA_TYPES = new Map([
  ['bakery', 'Bakery'],
  ['restaurant', 'Restaurant'],
  ['hotel', 'Hotel'],
  ['medical-clinic', 'MedicalClinic'],
  ['store', 'Store'],
])

function siteCategory(siteSpec: unknown): string {
  if (!siteSpec || typeof siteSpec !== 'object' || Array.isArray(siteSpec)) {
    return ''
  }
  if (!('genui' in siteSpec)) return ''
  const genui = siteSpec.genui
  if (!genui || typeof genui !== 'object' || Array.isArray(genui)) return ''
  if (!('category' in genui) || typeof genui.category !== 'string') return ''
  return genui.category.trim().toLowerCase()
}

function pushCleanEntry(
  entries: Record<string, unknown>[],
  entry: Record<string, unknown> | undefined,
): void {
  if (entry) entries.push(entry)
}

function isArticlePage(
  page: SitePageLike | null | undefined,
  _siteSpec: SiteSpecLike | null | undefined,
): boolean {
  const route = normalizePath(page?.route || '/')
  const hasArticleSection = (page?.sections || []).some(
    (section) => section.type === 'article' || section.type === 'post',
  )
  if (hasArticleSection) return true
  return /^\/(posts?|blog|article|news)\//i.test(route)
}

function entitySignals(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  const pageSignals = page?.aeo?.entitySignals
  const homePage = (siteSpec?.pages || []).find((p) => p.route === '/')
  const homeSignals = homePage?.aeo?.entitySignals
  return { ...(homeSignals || {}), ...(pageSignals || {}) }
}

function inferBreadcrumbs(
  _siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  if (Array.isArray(page?.breadcrumbs) && page.breadcrumbs.length) {
    return page.breadcrumbs
  }

  const route = normalizePath(page?.route || '/')
  if (route === '/') return []

  const segments = route.replace(/^\/+/, '').split('/').filter(Boolean)
  const crumbs = [{ label: 'Home', href: '/' }]
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    crumbs.push({
      label: segment
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      href: path,
    })
  }
  return crumbs
}

function isProductPage(
  page: SitePageLike | null | undefined,
  _siteSpec: SiteSpecLike | null | undefined,
) {
  const route = normalizePath(page?.route || '/')
  if (route.includes('/product')) return true
  return (page?.sections || []).some(
    (section) => section.type === 'product-detail',
  )
}

export function buildStructuredData(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  const seo = resolvePageSeo(siteSpec, page)
  const signals = entitySignals(siteSpec, page)
  const entries: Record<string, unknown>[] = []
  const siteType = String(siteSpec?.siteType || 'landing').toLowerCase()
  const siteUrl = seo.siteUrl || seo.canonicalUrl
  const logo = String(siteSpec?.seo?.logo || '').trim()

  if (page?.route === '/') {
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seo.siteName,
        url: siteUrl,
        description: seo.description,
        potentialAction: siteUrl
          ? {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/?s={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            }
          : undefined,
      }),
    )
  }

  const orgName = String(signals.brandName || seo.siteName || '').trim()
  if (orgName && (seo.siteUrl || seo.canonicalUrl)) {
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: orgName,
        url: seo.siteUrl || seo.canonicalUrl,
        description: seo.description,
        logo: logo || undefined,
        email: signals.contact?.email,
        telephone: signals.contact?.phone,
        address: signals.contact?.address || signals.contact?.location,
      }),
    )
  }

  if (SOFTWARE_SITE_TYPES.has(siteType) && page?.route === '/') {
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: orgName || seo.siteName,
        url: seo.siteUrl || seo.canonicalUrl,
        applicationCategory: String(signals.category || 'BusinessApplication'),
        operatingSystem: 'Web',
        description: seo.description,
        featureList: signals.benefits?.length
          ? signals.benefits
          : signals.useCases,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }),
    )
  }

  const localBusinessType = LOCAL_BUSINESS_SCHEMA_TYPES.get(
    siteCategory(siteSpec),
  )
  if (localBusinessType && page?.route === '/') {
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': localBusinessType,
        name: orgName || seo.siteName,
        url: seo.siteUrl || seo.canonicalUrl,
        description: seo.description,
        image: seo.ogImage,
        telephone: signals.contact?.phone,
        address: signals.contact?.address || signals.contact?.location,
      }),
    )
  }

  if (isProductPage(page, siteSpec)) {
    const productSection = (page?.sections || []).find(
      (section) => section.type === 'product-detail',
    )
    const productItem = productSection?.items?.[0]
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: String(productItem?.title || page?.title || seo.title),
        description: String(
          productItem?.body || page?.description || seo.description,
        ),
        url: seo.canonicalUrl,
        brand: { '@type': 'Brand', name: orgName || seo.siteName },
        offers: productItem?.price
          ? { '@type': 'Offer', price: productItem.price, priceCurrency: 'USD' }
          : undefined,
      }),
    )
  }

  pushCleanEntry(
    entries,
    cleanObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      isPartOf: seo.siteUrl
        ? {
            '@type': 'WebSite',
            name: seo.siteName,
            url: seo.siteUrl,
          }
        : undefined,
    }),
  )

  if (BLOG_SITE_TYPES.has(siteType) && isArticlePage(page, siteSpec)) {
    const pageSeo = page?.seo && typeof page.seo === 'object' ? page.seo : {}
    const datePublished = String(
      pageSeo.datePublished || pageSeo.date || pageSeo.publishedAt || '',
    ).trim()
    pushCleanEntry(
      entries,
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seo.title,
        description: seo.description,
        url: seo.canonicalUrl,
        author: {
          '@type': 'Organization',
          name: orgName || seo.siteName,
        },
        datePublished: datePublished || new Date().toISOString(),
      }),
    )
  }

  const breadcrumbs = inferBreadcrumbs(siteSpec, page)
  if (breadcrumbs.length > 1 && seo.siteUrl) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: crumb.href ? joinUrl(seo.siteUrl, crumb.href) : undefined,
      })),
    })
  }

  const faqItems = extractFaqItems(page)
  if (faqItems.length) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })
  }

  return entries.filter(Boolean)
}
