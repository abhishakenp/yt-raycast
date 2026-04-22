import { DevHomeReload } from '@/components/home/DevHomeReload'
import { HomePageView } from '@/components/home/HomePageView'
import { ShipFastHomeAuthProvider } from '@/components/home/ship-fast-home-auth-provider'
import { SfQueryProvider } from '@/components/providers/sf-query-provider'
import { fetchSiteSettings, resolveSiteImageUrl } from '@/lib/sanity-site-settings'
import { homeStructuredDataJson } from '@/lib/structured-data'
import {
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  OG_IMAGE_PATH,
  PLAUSIBLE_DOMAIN,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-config'
import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/index.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchSiteSettings()
  const pageTitle = HOME_TITLE
  const pageDescription = siteSettings?.homeDescription?.trim() || HOME_DESCRIPTION
  const ogImageAbsolute =
    resolveSiteImageUrl(siteSettings?.ogImageUrl) || `${SITE_URL}${OG_IMAGE_PATH}`
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: HOME_KEYWORDS.split(', '),
    authors: [{ name: SITE_NAME }],
    robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      title: pageTitle,
      description: pageDescription,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        { url: ogImageAbsolute, width: 1200, height: 630, alt: 'Ship Fast homepage preview' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: { url: ogImageAbsolute, alt: 'Ship Fast homepage preview' },
    },
    other: {
      'sf-home': 'ssr',
      'sf-home-tab-title': HOME_TITLE,
      'theme-color': '#050506',
      'format-detection': 'telephone=no',
    },
  }
}

export default async function Home() {
  const siteSettings = await fetchSiteSettings()
  const pageDescription = siteSettings?.homeDescription?.trim() || HOME_DESCRIPTION

  return (
    <>
      <Script id="sf-has-sessions" strategy="beforeInteractive">{`try {
  var __sfAnon = JSON.parse(localStorage.getItem('sf_anon_sessions') || '[]')
  if (__sfAnon.length) document.body.classList.add('has-sessions')
} catch (e) {}`}</Script>
      <Script defer data-domain={PLAUSIBLE_DOMAIN} data-api="/api/event" src="/js/script.js" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: homeStructuredDataJson(pageDescription) }}
      />
      <SfQueryProvider>
        <ShipFastHomeAuthProvider>
          <HomePageView siteSettings={siteSettings} />
        </ShipFastHomeAuthProvider>
      </SfQueryProvider>
      <Script type="module" src="/scripts/homepage.js" strategy="afterInteractive" />
      <DevHomeReload />
    </>
  )
}
