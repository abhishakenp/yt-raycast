import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'

type ClerkConvexProviderProps = {
  children: ReactNode
  clerkPublishableKey: string
  convexUrl: string
}

export const ClerkConvexProvider = ({
  children,
  clerkPublishableKey,
  convexUrl,
}: ClerkConvexProviderProps) => {
  const convexClient = useMemo(
    () => new ConvexReactClient(convexUrl, { logger: false }),
    [convexUrl],
  )

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      appearance={clerkFrostedGlassAppearance}
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
