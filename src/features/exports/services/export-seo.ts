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

export type ExportSeoBundleOptions = {
  /** Per-route description fallback (e.g. extracted from rendered markup). */
  fallbackDescriptions?: Record<string, string>
}

/**
 * Derive a plain-text meta description from rendered page markup.
 * Strips tags/scripts, collapses whitespace, and trims to ~160 chars at a
 * word boundary. Returns '' when no meaningful text exists.
 */
export const extractDescriptionFromMarkup = (markup: string): string => {
  const text = markup
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= 160) return text
  const cut = text.slice(0, 160)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : 160).trim()}…`
}

/**
 * Build per-route SEO data from siteSpecJson and the OpenUI export routes.
 * Always returns a bundle — falls back to project name and route labels for
 * title/description when no explicit SEO data is present in the site spec.
 * Specs without an explicit seo block get baseline metadata synthesized from
 * brand/locale/route labels so every export ships title, description, robots,
 * OG/Twitter, and JSON-LD.
 */
export const buildExportSeoBundle = (
  siteSpecJson: string | undefined,
  routePaths: Array<{ path: string; label: string }>,
  options: ExportSeoBundleOptions = {},
): ExportSeoBundle => {
  const parsedSpec = parseSiteSpec(siteSpecJson)

  // Generated specs carry `brand`/`locale` at the top level without a seo
  // block; fold them into the shape resolvePageSeo understands.
  const brand =
    typeof parsedSpec.brand === 'string' && parsedSpec.brand.trim()
      ? parsedSpec.brand.trim()
      : undefined
  const specLocale =
    typeof parsedSpec.locale === 'string' && parsedSpec.locale.trim()
      ? parsedSpec.locale.trim()
      : undefined
  const siteSpec: SiteSpecLike = {
    ...parsedSpec,
    projectName: parsedSpec.projectName ?? brand,
    seo: parsedSpec.seo ?? (specLocale ? { locale: specLocale } : {}),
  }
  const specPages = Array.isArray(siteSpec.pages) ? siteSpec.pages : []

  const routes = new Map<string, ExportRouteSeo>()
  let homeSeo: ExportRouteSeo | null = null

  for (const { path, label } of routePaths) {
    const normalized = normalizePath(path)
    const matchingPage = specPages.find(
      (p) => normalizePath(String(p.route ?? '/')) === normalized,
    )
    const fallbackDescription = options.fallbackDescriptions?.[normalized]
    // Home falls through to projectName/brand for its title when a projectName
    // is available; otherwise it uses the nav label. Other routes always use
    // their nav label.
    const fallbackTitle =
      normalized === '/' ? (siteSpec.projectName ? undefined : label) : label
    const page = matchingPage
      ? { description: fallbackDescription, ...matchingPage }
      : {
          route: normalized,
          title: fallbackTitle,
          name: label,
          description: fallbackDescription,
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
