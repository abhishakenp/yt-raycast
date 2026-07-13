import {
  buildHeadTags,
  buildNextMetadata,
  buildNextViewport,
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
  nextViewport: Record<string, unknown>
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseSiteSpec(siteSpecJson: string | undefined): SiteSpecLike {
  if (!siteSpecJson) return {}
  try {
    const parsed: unknown = JSON.parse(siteSpecJson)
    return isPlainObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function normalizePath(value: string): string {
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
export function extractDescriptionFromMarkup(markup: string): string {
  const main = markup.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
  const content = (main ?? markup)
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+\brole=(['"])dialog\1[^>]*>[\s\S]*?<\/[^>]+>/gi, ' ')
  const paragraph = content.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1]
  const text = (paragraph ?? content)
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
export function buildExportSeoBundle(
  siteSpecJson: string | undefined,
  routePaths: Array<{ path: string; label: string }>,
  options: ExportSeoBundleOptions = {},
  routeJsonLdEntries?: Map<string, Record<string, unknown>[]>,
): ExportSeoBundle {
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
    // Use tree-derived JSON-LD entries (from actual UI component props) when
    // available — these describe entities on the page (products, reviews, FAQ)
    // rather than duplicating head metadata. Fall back to siteSpec-based data.
    const treeEntries = routeJsonLdEntries?.get(normalized)
    const structuredData = treeEntries ?? buildStructuredData(siteSpec, page)
    const structuredDataJson = serializeStructuredData(structuredData)
    const structuredDataScript = structuredDataJson
      ? `<script type="application/ld+json">${structuredDataJson}</script>`
      : ''
    const headTags = buildHeadTags(seo, {
      structuredDataScript,
    })
    const nextMetadataValue = buildNextMetadata(seo)
    const nextViewportValue = buildNextViewport(seo)
    const nextMetadata = isPlainObject(nextMetadataValue)
      ? nextMetadataValue
      : {}
    const nextViewport = isPlainObject(nextViewportValue)
      ? nextViewportValue
      : {}

    const routeSeo: ExportRouteSeo = {
      seo,
      structuredDataJson,
      headTags,
      nextMetadata,
      nextViewport,
    }
    routes.set(normalized, routeSeo)
    if (normalized === '/') homeSeo = routeSeo
  }

  const robotsTxt = renderRobotsTxt(siteSpec)
  const sitemapXml = renderSitemapXml(siteSpec)
  // Enrich siteSpec with route-derived pages so llms.txt lists all routes
  // even when the original siteSpec has no pages array
  const specPagesForLlms = Array.isArray(siteSpec.pages) ? siteSpec.pages : []
  const routeDerivedPages = routePaths.map(({ path, label }) => {
    const normalized = normalizePath(path)
    const existing = specPagesForLlms.find(
      (p) => normalizePath(String(p.route ?? '/')) === normalized,
    )
    if (existing) return existing
    return {
      route: normalized,
      name: label,
      title: siteSpec.projectName ? undefined : label,
    }
  })
  const enrichedSiteSpec = { ...siteSpec, pages: routeDerivedPages }
  const llmsTxt = renderGeneratedSiteLlmsTxt(enrichedSiteSpec)

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
export function renderNextMetadataExport(routeSeo: ExportRouteSeo): string {
  const meta = routeSeo.nextMetadata
  const lines: string[] = ['export const metadata = {']
  for (const [key, value] of Object.entries(meta)) {
    lines.push(`  ${key}: ${JSON.stringify(value)},`)
  }
  lines.push('}')
  return lines.join('\n')
}

/**
 * Generate Next.js viewport export string from a route's SEO data.
 * Next.js 16+ requires themeColor in viewport export, not metadata.
 */
export function renderNextViewportExport(routeSeo: ExportRouteSeo): string {
  const viewport = routeSeo.nextViewport
  if (!viewport || Object.keys(viewport).length === 0) return ''
  const lines: string[] = ['export const viewport = {']
  for (const [key, value] of Object.entries(viewport)) {
    lines.push(`  ${key}: ${JSON.stringify(value)},`)
  }
  lines.push('}')
  return lines.join('\n')
}

/**
 * Generate the module-level JSON-LD object literal for a route's structured data.
 * Returns the `const jsonLd = {...}` declaration to be placed outside the
 * component, plus the `<script>` JSX element to render inside it.
 * Uses JSON.stringify with XSS sanitization per Next.js recommendation.
 * @see https://nextjs.org/docs/app/guides/json-ld
 */
export function renderJsonLdScript(routeSeo: ExportRouteSeo): string {
  if (!routeSeo.structuredDataJson) return ''
  const data = JSON.parse(routeSeo.structuredDataJson)
  const objectLiteral = JSON.stringify(data, null, 2)
  return `const jsonLd = ${objectLiteral}

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, '\\\\u003c'),
  }}
/>`
}

/**
 * Generate Next.js robots.ts route content.
 */
export function renderNextRobotsRoute(robotsTxt: string): string {
  return `import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return ${JSON.stringify(parseRobotsTxt(robotsTxt), null, 2)}
}
`
}

function parseRobotsTxt(txt: string): Record<string, unknown> {
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
export function renderNextSitemapRoute(
  sitemapXml: string | null,
): string | null {
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
