import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { AppProviders } from '@/app/providers/AppProviders'
import { clerkFrostedGlassAppearance } from '@/app/providers/provider-config'
import { installDynamicImportRecovery } from '@/lib/chunk-load-recovery'

import appCss from '../styles.css?url'

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.CLERK_PUBLISHABLE_KEY

const RootDocument = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => installDynamicImportRecovery(window), [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const RootComponent = () => (
  <RootDocument>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      appearance={clerkFrostedGlassAppearance}
    >
      <AppProviders>
        <Outlet />
      </AppProviders>
    </ClerkProvider>
  </RootDocument>
)

export const Route = createRootRoute({
  head: () => ({
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
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
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
  }),
  component: RootComponent,
})
