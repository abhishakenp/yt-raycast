import {
  HeadContent,
  Outlet,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AppProviders } from '@/app/providers/AppProviders'
import { MarketingConsentController } from '@/features/partners/components/MarketingConsentController'
import { useAcquisitionCapture } from '@/features/partners/hooks/useAcquisitionCapture'
import { installDynamicImportRecovery } from '@/lib/chunk-load-recovery'
import { initLogRocket, isLogRocketEnabled } from '@/features/logrocket/client/logrocket-init'
import { useLogRocketIdentify } from '@/features/logrocket/client/use-logrocket-identify'

import appCss from '../styles.css?url'

const PLAUSIBLE_TRACKED_DOMAIN = 'ship-fast.ai'
const PLAUSIBLE_SCRIPT_SRC = 'https://plausible.ship-fast.ai/js/script.js'

/**
 * LogRocket async script URL — served from our first-party proxy so ad
 * blockers never see a request to cdn.logrocket.com. This MUST be set
 * before the LogRocket npm module is imported (see logrocket-init.ts).
 */
const LOGROCKET_ASYNC_SCRIPT = '/api/logrocket/cdn/logger.min.js'
function RootDocument({ children }: { children: ReactNode }) {
  useAcquisitionCapture()

  useEffect(() => {
    try {
      const storedTheme =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('theme')
          : null
      const isDark =
        storedTheme === 'dark' ||
        (!storedTheme &&
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark)
    } catch {
      // Theme detection is best-effort; ignore errors when storage/media
      // APIs are unavailable so the app shell stays mounted.
    }
  }, [])

  useEffect(() => installDynamicImportRecovery(window), [])

  useEffect(() => {
    if (isLogRocketEnabled()) initLogRocket()
  }, [])

  useLogRocketIdentify()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* LogRocket: set async script URL before any JS imports so the
            SDK fetches from our first-party proxy, not cdn.logrocket.com. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window._lrAsyncScript="${LOGROCKET_ASYNC_SCRIPT}"`,
          }}
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Ship Fast needs JavaScript to generate and preview websites. Please
            enable JavaScript in your browser settings.
          </div>
        </noscript>
        {children}
        <MarketingConsentController />
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  )
}

const RootComponent = () => (
  <RootDocument>
    <AppProviders>
      <Outlet />
    </AppProviders>
  </RootDocument>
)

// Rendered inside RootComponent's Outlet, which is already wrapped by
// RootDocument > AppProviders. Re-wrapping here would mount a second <html>,
// so this renders only the 404 content.
const NotFoundComponent = () => (
  <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
    <div className="max-w-md space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Go home
      </Link>
    </div>
  </main>
)

export const rootHead = () => ({
  meta: [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      title: 'Ship Fast',
    },
  ],
  links: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '48x48',
      href: '/favicon-48x48.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '64x64',
      href: '/favicon-64x64.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '128x128',
      href: '/favicon-128x128.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '180x180',
      href: '/favicon-180x180.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/favicon-192x192.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '256x256',
      href: '/favicon-256x256.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '512x512',
      href: '/favicon-512x512.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicon-180x180.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '192x192',
      href: '/favicon-192x192.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '256x256',
      href: '/favicon-256x256.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '512x512',
      href: '/favicon-512x512.png',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap',
    },
    {
      rel: 'stylesheet',
      href: appCss,
    },
  ],
  scripts: [
    {
      defer: true,
      'data-domain': PLAUSIBLE_TRACKED_DOMAIN,
      src: PLAUSIBLE_SCRIPT_SRC,
    },
  ],
})

export const Route = createRootRoute({
  head: rootHead,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})
