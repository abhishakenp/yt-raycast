import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { clerkFrostedGlassAppearance, resolveProviderMode } from '@/app/providers/provider-config'

type ClerkConvexProviderProps = {
  children: ReactNode
}

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.CLERK_PUBLISHABLE_KEY
const convexUrl =
  import.meta.env.VITE_CONVEX_SELF_HOSTED_URL ??
  import.meta.env.VITE_CONVEX_URL ??
  import.meta.env.CONVEX_SELF_HOSTED_URL ??
  import.meta.env.CONVEX_URL

export const ClerkConvexProvider = ({ children }: ClerkConvexProviderProps) => {
  const mode = resolveProviderMode({ clerkPublishableKey, convexUrl })
  const convex = useMemo(
    () => (mode === 'anonymous' || convexUrl === undefined ? undefined : new ConvexReactClient(convexUrl)),
    [mode],
  )

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      appearance={clerkFrostedGlassAppearance}
    >
      {mode === 'clerk_convex' && convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      ) : mode === 'convex_anonymous' && convex ? (
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      ) : (
        children
      )}
    </ClerkProvider>
  )
}
