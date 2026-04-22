import type { Metadata } from 'next'
import './globals.css'
import { SpaceBackdrop } from '@/components/marketing/SpaceBackdrop'
import { SfGlassLensFilter } from '@/components/ui/sf-glass-lens-filter'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'
import '@/styles/space-shell.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <SpaceBackdrop />
        <SfGlassLensFilter />
        {children}
      </body>
    </html>
  )
}
