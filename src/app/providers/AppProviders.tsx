import { useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  resolveProviderMode,
  shouldUseAuthenticatedProviders,
  shouldUseConvexProviders,
} from '@/app/providers/provider-config'
import { getClerkPublishableKey } from '@/shared/auth/clerk-runtime'
import { openSignInEventName } from '@/shared/auth/use-optional-auth'
import { MaintenanceWall } from '@/components/MaintenanceWall'

const LazyClerkConvexProvider = lazy(() =>
  import('@/app/providers/ClerkConvexProvider').then((module) => ({
    default: module.ClerkConvexProvider,
  })),
)

const LazyConvexAnonymousProvider = lazy(() =>
  import('@/app/providers/ConvexAnonymousProvider').then((module) => ({
    default: module.ConvexAnonymousProvider,
  })),
)

const LazySignInModalHost = lazy(() =>
  import('@/app/providers/SignInModalHost').then((module) => ({
    default: module.SignInModalHost,
  })),
)

const LazyLaunchBackdrop = lazy(() =>
  import('@/components/launch-backdrop').then((module) => ({
    default: module.LaunchBackdrop,
  })),
)

type AppProvidersProps = {
  children: ReactNode
}

const PUBLIC_LAUNCH_BACKDROP_PATHS = new Set([
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/referrals',
])

const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

const clerkPublishableKey = getClerkPublishableKey()
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

function shouldShowPublicLaunchBackdrop(pathname: string): boolean {
  return PUBLIC_LAUNCH_BACKDROP_PATHS.has(pathname)
}

function WithSignInHost({
  children,
  showLaunchBackdrop,
  signInRequestId,
  clerkMounted,
}: AppProvidersProps & {
  showLaunchBackdrop: boolean
  signInRequestId: number
  clerkMounted: boolean
}) {
  return (
    <>
      {showLaunchBackdrop ? (
        <Suspense fallback={null}>
          <LazyLaunchBackdrop />
        </Suspense>
      ) : null}
      <div className="contents" id="ship-fast-app-content">
        {children}
      </div>
      <MaintenanceWall />
      {signInRequestId > 0 ? (
        <Suspense fallback={null}>
          <LazySignInModalHost
            requestId={signInRequestId}
            clerkMounted={clerkMounted}
          />
        </Suspense>
      ) : null}
    </>
  )
}

export function AppProviders({ children }: AppProvidersProps) {
  const [signInRequestId, setSignInRequestId] = useState(0)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mode = resolveProviderMode({ clerkPublishableKey, convexUrl })
  const configuredConvexUrl =
    typeof convexUrl === 'string' && convexUrl.trim().length > 0
      ? convexUrl
      : undefined
  const shouldLoadConvex =
    mode !== 'anonymous' &&
    configuredConvexUrl !== undefined &&
    shouldUseConvexProviders(pathname)
  const shouldLoadClerk =
    mode === 'clerk_convex' &&
    shouldLoadConvex &&
    typeof clerkPublishableKey === 'string' &&
    shouldUseAuthenticatedProviders(pathname)
  const showLaunchBackdrop = shouldShowPublicLaunchBackdrop(pathname)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const openSignIn = () => setSignInRequestId((current) => current + 1)
    window.addEventListener(openSignInEventName, openSignIn)
    return () => window.removeEventListener(openSignInEventName, openSignIn)
  }, [])

  if (shouldLoadClerk) {
    return (
      <QueryClientProvider client={appQueryClient}>
        <Suspense fallback={<ProviderFallback />}>
          <LazyClerkConvexProvider
            clerkPublishableKey={clerkPublishableKey}
            convexUrl={configuredConvexUrl}
          >
            <WithSignInHost
              showLaunchBackdrop={showLaunchBackdrop}
              signInRequestId={signInRequestId}
              clerkMounted
            >
              {children}
            </WithSignInHost>
          </LazyClerkConvexProvider>
        </Suspense>
      </QueryClientProvider>
    )
  }

  if (shouldLoadConvex) {
    return (
      <QueryClientProvider client={appQueryClient}>
        <Suspense fallback={<ProviderFallback />}>
          <LazyConvexAnonymousProvider convexUrl={configuredConvexUrl}>
            <WithSignInHost
              showLaunchBackdrop={showLaunchBackdrop}
              signInRequestId={signInRequestId}
              clerkMounted={false}
            >
              {children}
            </WithSignInHost>
          </LazyConvexAnonymousProvider>
        </Suspense>
      </QueryClientProvider>
    )
  }

  if (shouldUseConvexProviders(pathname)) {
    return (
      <QueryClientProvider client={appQueryClient}>
        <WithSignInHost
          showLaunchBackdrop={showLaunchBackdrop}
          signInRequestId={signInRequestId}
          clerkMounted={false}
        >
          <ProviderFallback />
        </WithSignInHost>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={appQueryClient}>
      <WithSignInHost
        showLaunchBackdrop={showLaunchBackdrop}
        signInRequestId={signInRequestId}
        clerkMounted={false}
      >
        {children}
      </WithSignInHost>
    </QueryClientProvider>
  )
}
