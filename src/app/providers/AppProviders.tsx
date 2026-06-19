import { useRouterState } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { lazy, Suspense, useMemo } from 'react'
import type { ReactNode } from 'react'

import {
  resolveProviderMode,
  shouldUseAuthenticatedProviders,
} from '@/app/providers/provider-config'

const LazyClerkConvexProvider = lazy(() =>
  import('@/app/providers/ClerkConvexProvider').then((module) => ({
    default: module.ClerkConvexProvider,
  })),
)

type AppProvidersProps = {
  children: ReactNode
}

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
const convexUrl =
  import.meta.env.VITE_CONVEX_SELF_HOSTED_URL ??
  import.meta.env.VITE_CONVEX_URL ??
  import.meta.env.CONVEX_SELF_HOSTED_URL ??
  import.meta.env.CONVEX_URL

const ProviderFallback = () => (
  <div
    className="min-h-screen bg-[#06070d]"
    aria-label="Loading secure workspace"
  />
)

export const AppProviders = ({ children }: AppProvidersProps) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mode = resolveProviderMode({ clerkPublishableKey, convexUrl })
  const convex = useMemo(
    () =>
      mode === 'anonymous' || convexUrl === undefined
        ? undefined
        : new ConvexReactClient(convexUrl),
    [mode],
  )
  const shouldLoadClerk =
    mode === 'clerk_convex' &&
    convex !== undefined &&
    typeof clerkPublishableKey === 'string' &&
    shouldUseAuthenticatedProviders(pathname)

  if (shouldLoadClerk) {
    return (
      <Suspense fallback={<ProviderFallback />}>
        <LazyClerkConvexProvider convexClient={convex}>
          {children}
        </LazyClerkConvexProvider>
      </Suspense>
    )
  }

  return convex ? (
    <ConvexProvider client={convex}>{children}</ConvexProvider>
  ) : (
    children
  )
}
