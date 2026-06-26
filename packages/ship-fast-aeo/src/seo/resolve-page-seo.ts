import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { joinUrl, normalizePath, uniqueStrings } from '../utils.ts'

export type ResolvedPageSeo = {
  title: string
  description: string
  siteName: string
  siteUrl: string
  routePath: string
  canonicalUrl: string
  locale: string
  htmlLang: string
  robots: string
  keywords: string[]
  ogImage: string
  ogImageAlt: string
  twitterCard: string
  themeColor: string
  noIndex: boolean
}

export function normalizeSiteUrl(value = ''): string {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return ''
  }
}

export function resolveAssetUrl(value = '', siteUrl = ''): string {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (siteUrl) return joinUrl(siteUrl, raw)
  return raw.startsWith('/') ? raw : ''
}

export function resolvePageSeo(
  siteSpec: SiteSpecLike | null | undefined,
  page: SitePageLike | null | undefined,
): ResolvedPageSeo {
  const siteSeo =
    siteSpec?.seo && typeof siteSpec.seo === 'object' ? siteSpec.seo : {}
  const pageSeo = page?.seo && typeof page.seo === 'object' ? page.seo : {}
  const siteUrl = normalizeSiteUrl(String(siteSeo.siteUrl || ''))
  const routePath = normalizePath(
    String(pageSeo.canonicalPath || page?.route || '/'),
  )
  const canonicalUrl = pageSeo.canonicalUrl
    ? normalizeSiteUrl(String(pageSeo.canonicalUrl))
    : joinUrl(siteUrl, routePath)
  const locale = String(siteSeo.locale || 'en_US').trim() || 'en_US'
  const htmlLang = locale.replace('_', '-')
  const title = String(
    pageSeo.title ||
      page?.title ||
      siteSeo.title ||
      siteSpec?.projectName ||
      '',
  ).trim()
  const description = String(
    pageSeo.description || page?.description || siteSeo.description || '',
  ).trim()
  const siteName = String(
    siteSeo.siteName || siteSpec?.projectName || title || 'Website',
  ).trim()
  const robots = pageSeo.noIndex
    ? 'noindex, nofollow'
    : String(siteSeo.robots || 'index, follow')
  const keywords = uniqueStrings([
    ...(Array.isArray(siteSeo.keywords) ? siteSeo.keywords.map(String) : []),
    ...(Array.isArray(pageSeo.keywords) ? pageSeo.keywords.map(String) : []),
  ])
  const ogImage = resolveAssetUrl(
    String(pageSeo.ogImage || siteSeo.ogImage || ''),
    siteUrl,
  )
  const ogImageAlt = String(
    pageSeo.ogImageAlt ||
      siteSeo.ogImageAlt ||
      `${title || siteName} social preview`,
  ).trim()
  const twitterCard = String(siteSeo.twitterCard || 'summary_large_image')
  const themeColor = String(siteSpec?.theme?.colors?.background || '#09090b')

  return {
    title,
    description,
    siteName,
    siteUrl,
    routePath,
    canonicalUrl,
    locale,
    htmlLang,
    robots,
    keywords,
    ogImage,
    ogImageAlt,
    twitterCard,
    themeColor,
    noIndex: Boolean(pageSeo.noIndex),
  }
}
