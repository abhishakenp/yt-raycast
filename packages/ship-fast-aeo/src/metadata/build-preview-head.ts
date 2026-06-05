import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { enrichSiteSpecAeo } from '../compatibility/enrich-aeo.ts'
import { buildStructuredData } from '../structured-data/build.ts'
import { resolvePageSeo } from '../seo/resolve-page-seo.ts'
import { serializeStructuredData } from '../utils.ts'
import { renderSeoHeadMarkup } from './build-head.ts'

export function buildPreviewSeoHead(siteSpec: SiteSpecLike | null | undefined, brand: string, prompt = ''): string {
  const base: SiteSpecLike = siteSpec && typeof siteSpec === 'object' ? siteSpec : {}
  const enriched = enrichSiteSpecAeo(
    {
      ...base,
      projectName: base.projectName || base.seo?.siteName || brand,
      pages:
        base.pages?.length
          ? base.pages
          : [
              {
                route: '/',
                title: brand,
                description: String(base.seo?.description || base.tagline || `${brand} preview`),
              } as SitePageLike,
            ],
    },
    prompt || String(base.userPrompt || base.tagline || brand),
  )

  const homePage =
    enriched.pages?.find((page) => (page.route || '/') === '/') ||
    ({ route: '/', title: brand, description: enriched.seo?.description } as SitePageLike)

  const seo = resolvePageSeo(enriched, {
    ...homePage,
    seo: {
      ...(homePage.seo || {}),
      noIndex: true,
      title: homePage.seo?.title || `${brand} - Preview`,
    },
  })

  const structuredData = buildStructuredData(enriched, homePage)
  return renderSeoHeadMarkup(seo, serializeStructuredData(structuredData), {
    includeLlmsTxtLink: false,
  }).markup
}
