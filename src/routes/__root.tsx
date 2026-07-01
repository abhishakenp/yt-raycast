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
import { useReferralCapture } from '@/features/referrals/hooks/useReferralCapture'
import { installDynamicImportRecovery } from '@/lib/chunk-load-recovery'

import appCss from '../styles.css?url'

const PLAUSIBLE_TRACKED_DOMAIN = 'ship-fast.ai'
const PLAUSIBLE_SCRIPT_SRC = 'https://plausible.ship-fast.ai/js/script.js'
const RootDocument = ({ children }: { children: ReactNode }) => {
  useReferralCapture()

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => installDynamicImportRecovery(window), [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
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
