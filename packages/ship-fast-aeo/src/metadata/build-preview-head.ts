import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { enrichSiteSpecAeo } from '../compatibility/enrich-aeo.ts'
import { buildStructuredData } from '../structured-data/build.ts'
import { resolvePageSeo } from '../seo/resolve-page-seo.ts'
import { serializeStructuredData } from '../utils.ts'
import { renderSeoHeadMarkup } from './build-head.ts'

export function buildPreviewSeoHead(
  siteSpec: SiteSpecLike | null | undefined,
  brand: string,
  prompt = '',
): string {
  const base: SiteSpecLike =
    siteSpec && typeof siteSpec === 'object' ? siteSpec : {}
  const looseBase = base as SiteSpecLike & {
    tagline?: unknown
    userPrompt?: unknown
  }
  const seoSiteName =
    typeof base.seo?.siteName === 'string' ? base.seo.siteName : undefined
  const seoDescription =
    typeof base.seo?.description === 'string' ? base.seo.description : undefined
  const tagline =
    typeof looseBase.tagline === 'string' ? looseBase.tagline : undefined
  const userPrompt =
    typeof looseBase.userPrompt === 'string' ? looseBase.userPrompt : undefined
  // The AI-decided site title (stored as projectName by the OpenUI phase).
  // Only used when it's a descriptive title distinct from the bare brand name,
  // so legacy specs where projectName === brand still get the "- Preview" suffix.
  const aiTitle =
    typeof base.projectName === 'string' &&
    base.projectName.trim() &&
    base.projectName.trim() !== brand
      ? base.projectName.trim()
      : undefined
  const enriched = enrichSiteSpecAeo(
    {
      ...base,
      projectName: base.projectName || seoSiteName || brand,
      pages: base.pages?.length
        ? base.pages
        : [
            {
              route: '/',
              title: aiTitle || brand,
              description: seoDescription || tagline || `${brand} preview`,
            } as SitePageLike,
          ],
    },
    prompt || userPrompt || tagline || brand,
  )

  const homePage =
    enriched.pages?.find((page) => (page.route || '/') === '/') ||
    ({
      route: '/',
      title: aiTitle || brand,
      description: enriched.seo?.description,
    } as SitePageLike)

  const seo = resolvePageSeo(enriched, {
    ...homePage,
    seo: {
      ...(homePage.seo || {}),
      title: homePage.seo?.title || aiTitle || `${brand} - Preview`,
    },
  })

  const structuredData = buildStructuredData(enriched, homePage)
  return renderSeoHeadMarkup(seo, serializeStructuredData(structuredData))
    .markup
}
