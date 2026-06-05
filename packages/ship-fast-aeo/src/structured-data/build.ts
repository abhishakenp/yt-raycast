import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { extractFaqItems } from '../seo/extract-faq.ts'
import { resolvePageSeo } from '../seo/resolve-page-seo.ts'
import { cleanObject, joinUrl, normalizePath } from '../utils.ts'

const SOFTWARE_SITE_TYPES = new Set(['software', 'saas', 'dashboard', 'landing', 'app'])

function entitySignals(siteSpec: SiteSpecLike | null | undefined, page: SitePageLike | null | undefined) {
  const pageSignals = page?.aeo?.entitySignals
  const homePage = (siteSpec?.pages || []).find((p) => p.route === '/')
  const homeSignals = homePage?.aeo?.entitySignals
  return { ...(homeSignals || {}), ...(pageSignals || {}) }
}

function inferBreadcrumbs(siteSpec: SiteSpecLike | null | undefined, page: SitePageLike | null | undefined) {
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

function isProductPage(page: SitePageLike | null | undefined, siteSpec: SiteSpecLike | null | undefined) {
  const route = normalizePath(page?.route || '/')
  if (route.includes('/product')) return true
  return (page?.sections || []).some((section) => section.type === 'product-detail')
}

export function buildStructuredData(siteSpec: SiteSpecLike | null | undefined, page: SitePageLike | null | undefined) {
  const seo = resolvePageSeo(siteSpec, page)
  const signals = entitySignals(siteSpec, page)
  const entries: Record<string, unknown>[] = []
  const siteType = String(siteSpec?.siteType || 'landing').toLowerCase()

  if (page?.route === '/') {
    entries.push(
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seo.siteName,
        url: seo.siteUrl || seo.canonicalUrl,
        description: seo.description,
      }) as Record<string, unknown>,
    )
  }

  const orgName = String(signals.brandName || seo.siteName || '').trim()
  if (orgName && (seo.siteUrl || seo.canonicalUrl)) {
    entries.push(
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: orgName,
        url: seo.siteUrl || seo.canonicalUrl,
        description: seo.description,
        email: signals.contact?.email,
        telephone: signals.contact?.phone,
        address: signals.contact?.address || signals.contact?.location,
      }) as Record<string, unknown>,
    )
  }

  if (SOFTWARE_SITE_TYPES.has(siteType) && page?.route === '/') {
    entries.push(
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: orgName || seo.siteName,
        url: seo.siteUrl || seo.canonicalUrl,
        applicationCategory: String(signals.category || 'BusinessApplication'),
        operatingSystem: 'Web',
        description: seo.description,
        featureList: signals.benefits?.length ? signals.benefits : signals.useCases,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }) as Record<string, unknown>,
    )
  }

  if (siteType === 'ecommerce' && isProductPage(page, siteSpec)) {
    const productSection = (page?.sections || []).find((section) => section.type === 'product-detail')
    const productItem = productSection?.items?.[0]
    entries.push(
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: String(productItem?.title || page?.title || seo.title),
        description: String(productItem?.body || page?.description || seo.description),
        url: seo.canonicalUrl,
        brand: { '@type': 'Brand', name: orgName || seo.siteName },
        offers: productItem?.price
          ? { '@type': 'Offer', price: productItem.price, priceCurrency: 'USD' }
          : undefined,
      }) as Record<string, unknown>,
    )
  }

  entries.push(
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
    }) as Record<string, unknown>,
  )

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
