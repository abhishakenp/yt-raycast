import { PricingCountdown } from '@/components/pricing/PricingCountdown'
import { TopActionsNav } from '@/components/marketing/TopActionsNav'
import { applyPricingMainHtmlOverrides } from '@/lib/pricing-overrides'
import { getPricingMainBodyHtml } from '@/lib/pricing-main-body'
import { fetchSiteSettings } from '@/lib/sanity-site-settings'
import { OG_IMAGE_PATH, PLAUSIBLE_DOMAIN, SITE_URL } from '@/lib/site-config'
import type { Metadata } from 'next'
import Script from 'next/script'
import '../../../public/styles/pricing.css'

export const dynamic = 'force-dynamic'

const defaultTitle = 'Ship Fast — Pricing'
const defaultDescription =
  'Simple pricing for Ship Fast. Start free, lock the early adopter rate forever at ₹199/month before slots run out.'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings()
  const title = settings?.pricingPageTitle?.trim() || defaultTitle
  const description = settings?.pricingPageDescription?.trim() || defaultDescription
  const canonicalUrl = `${SITE_URL.replace(/\/$/, '')}/pricing`
  const og = `${SITE_URL.replace(/\/$/, '')}${OG_IMAGE_PATH}`
  return {
    title,
    description,
    robots: 'index, follow',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description:
        settings?.pricingPageDescription?.trim() ||
        'Start free. Lock the early adopter rate at ₹199/month forever.',
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
    other: { 'sf-pricing': 'ssr', 'theme-color': '#050506' },
  }
}

export default async function PricingPage() {
  const siteSettings = await fetchSiteSettings()
  let innerHtml = getPricingMainBodyHtml()
  innerHtml = applyPricingMainHtmlOverrides(innerHtml, siteSettings)

  return (
    <>
      <Script defer data-domain={PLAUSIBLE_DOMAIN} data-api="/api/event" src="/js/script.js" />
      <TopActionsNav showBrand />
      <div dangerouslySetInnerHTML={{ __html: innerHtml }} />
      <PricingCountdown />
      <Script type="module" src="/scripts/top-actions-auth.js" strategy="afterInteractive" />
    </>
  )
}
