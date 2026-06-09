import { ClerkProvider } from '@clerk/clerk-react'
import type { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export function isClerkConfigured() {
  return Boolean(PUBLISHABLE_KEY)
}

export default function AppClerkProvider({ children }: { children: ReactNode }) {
  if (!PUBLISHABLE_KEY) return <>{children}</>
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}
