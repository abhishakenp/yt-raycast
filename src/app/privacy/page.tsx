import { PrivacyDocument } from '@/components/privacy/PrivacyDocument'
import { PLAUSIBLE_DOMAIN, SITE_NAME, SITE_URL } from '@/lib/site-config'
import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/privacy.css'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Privacy policy`,
  description: `How ${SITE_NAME} collects, uses, and shares personal data when you use ${SITE_URL}.`,
  robots: 'index, follow',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <>
      <Script defer data-domain={PLAUSIBLE_DOMAIN} data-api="/api/event" src="/js/script.js" />
      <PrivacyDocument />
      <Script type="module" src="/scripts/top-actions-auth.js" strategy="afterInteractive" />
    </>
  )
}
