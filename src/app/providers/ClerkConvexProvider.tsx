import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { SyncSessions } from '@/shared/auth/SyncSessions'

type ClerkConvexProviderProps = {
  children: ReactNode
  clerkPublishableKey: string
  convexUrl: string
}

export function ClerkConvexProvider({
  children,
  clerkPublishableKey,
  convexUrl,
}: ClerkConvexProviderProps) {
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
        <SyncSessions />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
