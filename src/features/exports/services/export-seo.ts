import {
  buildHeadTags,
  buildNextMetadata,
  buildStructuredData,
  resolvePageSeo,
  serializeStructuredData,
  type ResolvedPageSeo,
} from '@ship-fast/aeo'
import {
  renderRobotsTxt,
  renderSitemapXml,
} from '@ship-fast/engine/renderers/seo.js'
import { renderGeneratedSiteLlmsTxt } from '@ship-fast/engine/renderers/llms-txt.js'

export type ExportRouteSeo = {
  seo: ResolvedPageSeo
  structuredDataJson: string
  headTags: string[]
  nextMetadata: Record<string, unknown>
}

export type ExportSeoBundle = {
  routes: Map<string, ExportRouteSeo>
  robotsTxt: string
  sitemapXml: string | null
  llmsTxt: string
  homeSeo: ExportRouteSeo | null
}

type SiteSpecLike = Record<string, unknown> & {
  projectName?: string
  siteType?: string
  seo?: Record<string, unknown>
  theme?: { colors?: { background?: string } }
  generatedTimestamp?: string
  pages?: Array<
    Record<string, unknown> & {
      route?: string
      title?: string
      name?: string
      seo?: Record<string, unknown>
      aeo?: Record<string, unknown>
    }
  >
}

const parseSiteSpec = (siteSpecJson: string | undefined): SiteSpecLike => {
  if (!siteSpecJson) return {}
  try {
    const parsed = JSON.parse(siteSpecJson) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as SiteSpecLike)
      : {}
  } catch {
    return {}
  }
}

const normalizePath = (value: string): string => {
  const raw = value.trim()
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

/**
 * Build per-route SEO data from siteSpecJson and the OpenUI export routes.
 * Returns null if no siteSpecJson is provided or no meaningful SEO data exists.
 */
export const buildExportSeoBundle = (
  siteSpecJson: string | undefined,
  routePaths: Array<{ path: string; label: string }>,
): ExportSeoBundle | null => {
  const siteSpec = parseSiteSpec(siteSpecJson)
  const specPages = Array.isArray(siteSpec.pages) ? siteSpec.pages : []
  const hasSeoData =
    siteSpec.seo !== undefined ||
    specPages.some(
      (page) =>
        page.seo !== undefined ||
        page.aeo !== undefined ||
        typeof page.description === 'string',
    )
  if (!hasSeoData) return null

  const routes = new Map<string, ExportRouteSeo>()
  let homeSeo: ExportRouteSeo | null = null

  for (const { path, label } of routePaths) {
    const normalized = normalizePath(path)
    const matchingPage = specPages.find(
      (p) => normalizePath(String(p.route ?? '/')) === normalized,
    )
    const page = matchingPage ?? {
      route: normalized,
      title: label,
      name: label,
    }

    const seo = resolvePageSeo(siteSpec, page)
    const structuredData = buildStructuredData(siteSpec, page)
    const structuredDataJson = serializeStructuredData(structuredData)
    const structuredDataScript = structuredDataJson
      ? `<script type="application/ld+json">${structuredDataJson}</script>`
      : ''
    const headTags = buildHeadTags(seo, {
      structuredDataScript,
    })
    const nextMetadata = buildNextMetadata(seo) as Record<string, unknown>

    const routeSeo: ExportRouteSeo = {
      seo,
      structuredDataJson,
      headTags,
      nextMetadata,
    }
    routes.set(normalized, routeSeo)
    if (normalized === '/') homeSeo = routeSeo
  }

  const robotsTxt = renderRobotsTxt(siteSpec)
  const sitemapXml = renderSitemapXml(siteSpec)
  const llmsTxt = renderGeneratedSiteLlmsTxt(siteSpec)

  return {
    routes,
    robotsTxt,
    sitemapXml,
    llmsTxt,
    homeSeo,
  }
}

/**
 * Generate Next.js metadata export string from a route's SEO data.
 */
export const renderNextMetadataExport = (routeSeo: ExportRouteSeo): string => {
  const meta = routeSeo.nextMetadata
  const lines: string[] = ['export const metadata = {']
  for (const [key, value] of Object.entries(meta)) {
    lines.push(`  ${key}: ${JSON.stringify(value)},`)
  }
  lines.push('}')
  return lines.join('\n')
}

/**
 * Generate JSON-LD script tag for a route's structured data.
 */
export const renderJsonLdScript = (routeSeo: ExportRouteSeo): string => {
  if (!routeSeo.structuredDataJson) return ''
  return `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(routeSeo.structuredDataJson)} }} />`
}

/**
 * Generate Next.js robots.ts route content.
 */
export const renderNextRobotsRoute = (robotsTxt: string): string => {
  return `import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return ${JSON.stringify(parseRobotsTxt(robotsTxt), null, 2)}
}
`
}

const parseRobotsTxt = (txt: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {
    rules: [{ userAgent: '*', allow: '/' }],
  }
  const sitemapMatch = txt.match(/Sitemap:\s*(.+)/)
  if (sitemapMatch) {
    result.sitemap = sitemapMatch[1].trim()
  }
  return result
}

/**
 * Generate Next.js sitemap.ts route content.
 */
export const renderNextSitemapRoute = (
  sitemapXml: string | null,
): string | null => {
  if (!sitemapXml) return null
  const urls: Array<Record<string, unknown>> = []
  const urlMatches = sitemapXml.matchAll(
    /<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<changefreq>(.*?)<\/changefreq>\s*<priority>(.*?)<\/priority>/g,
  )
  for (const match of urlMatches) {
    urls.push({
      url: match[1],
      lastModified: match[2],
      changeFrequency: match[3],
      priority: parseFloat(match[4]),
    })
  }
  if (urls.length === 0) return null
  return `import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return ${JSON.stringify(urls, null, 2)}
}
`
}
