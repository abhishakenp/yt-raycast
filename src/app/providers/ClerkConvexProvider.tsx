import { useAuth } from '@clerk/tanstack-react-start'
import type { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'

type ClerkConvexProviderProps = {
  children: ReactNode
  convexClient: ConvexReactClient
}

export const ClerkConvexProvider = ({
  children,
  convexClient,
}: ClerkConvexProviderProps) => (
  <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>
)
