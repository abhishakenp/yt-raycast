import { useRouterState } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  resolveProviderMode,
  shouldUseAuthenticatedProviders,
  shouldUseConvexProviders,
} from '@/app/providers/provider-config'
import { getClerkPublishableKey } from '@/shared/auth/clerk-runtime'
import { openSignInEventName } from '@/shared/auth/use-optional-auth'

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
])

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

const shouldShowPublicLaunchBackdrop = (pathname: string): boolean =>
  PUBLIC_LAUNCH_BACKDROP_PATHS.has(pathname)

const WithSignInHost = ({
  children,
  showLaunchBackdrop,
  signInRequestId,
  clerkMounted,
}: AppProvidersProps & {
  showLaunchBackdrop: boolean
  signInRequestId: number
  clerkMounted: boolean
}) => (
  <>
    {showLaunchBackdrop ? (
      <Suspense fallback={null}>
        <LazyLaunchBackdrop />
      </Suspense>
    ) : null}
    <div className="contents" id="ship-fast-app-content">
      {children}
    </div>
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

export const AppProviders = ({ children }: AppProvidersProps) => {
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
    )
  }

  if (shouldLoadConvex) {
    return (
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
    )
  }

  // Routes that render Convex hook consumers must not mount their children
  // outside a Convex provider. When Convex is required but not configured,
  // render the loading fallback instead of mounting children unprotected.
  if (shouldUseConvexProviders(pathname)) {
    return (
      <WithSignInHost
        showLaunchBackdrop={showLaunchBackdrop}
        signInRequestId={signInRequestId}
        clerkMounted={false}
      >
        <ProviderFallback />
      </WithSignInHost>
    )
  }

  return (
    <WithSignInHost
      showLaunchBackdrop={showLaunchBackdrop}
      signInRequestId={signInRequestId}
      clerkMounted={false}
    >
      {children}
    </WithSignInHost>
  )
}
