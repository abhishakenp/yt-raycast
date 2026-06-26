import type { ResolvedPageSeo } from '../seo/resolve-page-seo.ts'
import { cleanObject } from '../utils.ts'

export function buildNextMetadata(seo: ResolvedPageSeo) {
  return cleanObject({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: cleanObject({
      type: 'website',
      locale: seo.locale,
      url: seo.canonicalUrl,
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage,
              alt: seo.ogImageAlt,
            },
          ]
        : undefined,
    }),
    twitter: cleanObject({
      card: seo.ogImage ? seo.twitterCard : 'summary',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    }),
    themeColor: seo.themeColor,
  })
}
