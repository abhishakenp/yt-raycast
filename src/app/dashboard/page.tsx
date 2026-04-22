import type { Metadata } from 'next'
import Script from 'next/script'
import { DashboardClient } from './dashboard-client'
import { DashboardAnimationBridge } from './dashboard-animations'
import './dashboard.css'

export const metadata: Metadata = {
  title: 'Ship Fast — Dashboard',
  description: 'Live generation dashboard — watch your website being built in real-time by AI.',
  robots: 'noindex,nofollow',
  themeColor: '#050506',
  icons: { icon: '/favicon.svg' },
}

export default function DashboardPage() {
  return (
    <>
      <Script
        defer
        data-domain="ship-fast.io"
        data-api="/api/event"
        src="/js/script.js"
        strategy="afterInteractive"
      />
      <Script src="/scripts/dashboard-auth.js" type="module" strategy="afterInteractive" />
      <DashboardAnimationBridge />
      <DashboardClient />
      <Script src="/scripts/dashboard-main.js" type="module" strategy="afterInteractive" />
    </>
  )
}
