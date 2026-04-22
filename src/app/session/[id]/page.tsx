import type { Metadata } from 'next'
import Script from 'next/script'
import { DashboardClient } from '../../dashboard/dashboard-client'
import '../../dashboard/dashboard.css'

export const metadata: Metadata = {
  title: 'Ship Fast — Dashboard',
  description: 'Live generation dashboard — watch your website being built in real-time by AI.',
  robots: 'noindex,nofollow',
  themeColor: '#050506',
  icons: '/favicon.svg',
}

export default function SessionPage() {
  return (
    <>
      <Script defer data-domain="ship-fast.io" data-api="/api/event" src="/js/script.js" strategy="afterInteractive" />
      <Script src="/scripts/dashboard-auth.js" type="module" strategy="afterInteractive" />
      <Script src="/js/cmsiffy-animation.js" strategy="afterInteractive" />
      <Script src="/scripts/ecommercify-animation.js" strategy="afterInteractive" />
      <DashboardClient />
      <Script src="/scripts/dashboard-main.js" type="module" strategy="afterInteractive" />
    </>
  )
}
