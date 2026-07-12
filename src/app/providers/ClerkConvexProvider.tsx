import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { useClaimAnonymousSessionsOnSignIn } from '@/shared/auth/useClaimAnonymousSessionsOnSignIn'

type ClerkConvexProviderProps = {
  children: ReactNode
  clerkPublishableKey: string
  convexUrl: string
}

// Mounts the claim-on-sign-in effect inside the Convex+Clerk provider tree so
// the mutation is available. Renders nothing. Only mounted here, where both
// Clerk and Convex are configured, so anonymous sessions are linked to the
// signed-in userId on the anon→authenticated transition.
const AnonymousSessionClaimer = () => {
  useClaimAnonymousSessionsOnSignIn()
  return null
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
        <AnonymousSessionClaimer />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
