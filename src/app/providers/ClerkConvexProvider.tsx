import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import type { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'

type ClerkConvexProviderProps = {
  children: ReactNode
  clerkPublishableKey: string
  convexClient: ConvexReactClient
}

export const ClerkConvexProvider = ({
  children,
  clerkPublishableKey,
  convexClient,
}: ClerkConvexProviderProps) => (
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
