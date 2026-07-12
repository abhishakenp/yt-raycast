import {
  buildNextMetadata as buildNextMetadataFromAeo,
  buildStructuredData as buildStructuredDataFromAeo,
  normalizeSiteUrl,
  resolveAssetUrl,
  resolvePageSeo as resolvePageSeoFromAeo,
  serializeStructuredData,
  type SitePageLike,
  type SiteSpecLike,
} from '@ship-fast/aeo'
import { cleanObject, joinUrl, normalizePath } from '@ship-fast/aeo'

export { normalizeSiteUrl, resolveAssetUrl, serializeStructuredData }

export function resolvePageSeo(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  return resolvePageSeoFromAeo(siteSpec, page)
}

export function buildStructuredData(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  return buildStructuredDataFromAeo(siteSpec, page)
}

export function buildNextMetadata(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
) {
  return buildNextMetadataFromAeo(resolvePageSeo(siteSpec, page))
}

export function buildSitemapEntries(siteSpec: SiteSpecLike | null | undefined) {
  const siteUrl = normalizeSiteUrl(String(siteSpec?.seo?.siteUrl || ''))
  if (!siteUrl) return []

  const lastModified = siteSpec?.generatedTimestamp
    ? new Date(siteSpec.generatedTimestamp).toISOString()
    : new Date().toISOString()

  const pageEntries = (siteSpec?.pages || [])
    .filter((page) => page?.seo?.noIndex !== true)
    .map((page) =>
      cleanObject({
        url: joinUrl(siteUrl, page.route || '/'),
        lastModified,
        changeFrequency: page.route === '/' ? 'weekly' : 'monthly',
        priority: page.route === '/' ? 1 : 0.8,
      }),
    )

  const pages = siteSpec?.pages || []
  const hasRoute = (path) => {
    const n = normalizePath(path)
    return pages.some((p) => normalizePath(p?.route) === n)
  }

  if (siteSpec?.siteType === 'ecommerce') {
    const extra = []
    if (hasRoute('/shop')) {
      extra.push(
        cleanObject({
          url: joinUrl(siteUrl, '/shop'),
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.85,
        }),
      )
    }
    if (hasRoute('/checkout')) {
      extra.push(
        cleanObject({
          url: joinUrl(siteUrl, '/checkout'),
          lastModified,
          changeFrequency: 'monthly',
          priority: 0.6,
        }),
      )
    }
    return [...pageEntries, ...extra]
  }

  return pageEntries
}

export function renderRobotsTxt(siteSpec: SiteSpecLike | null | undefined) {
  const siteUrl = normalizeSiteUrl(String(siteSpec?.seo?.siteUrl || ''))
  const lines = ['User-agent: *', 'Allow: /']
  if (siteUrl) {
    lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
  }
  return `${lines.join('\n')}\n`
}

export function renderSitemapXml(siteSpec: SiteSpecLike | null | undefined) {
  const entries = buildSitemapEntries(siteSpec)
  if (!entries.length) return null

  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${entry?.url}</loc>
    <lastmod>${entry?.lastModified}</lastmod>
    <changefreq>${entry?.changeFrequency}</changefreq>
    <priority>${entry?.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}
