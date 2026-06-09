import { useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'
import { isClerkConfigured } from '../clerk/provider'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null

export function isConvexConfigured() {
  return Boolean(convex)
}

export default function AppConvexProvider({ children }: { children: ReactNode }) {
  if (!convex || !isClerkConfigured()) return <>{children}</>
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
