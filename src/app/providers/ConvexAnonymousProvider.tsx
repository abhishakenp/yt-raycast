import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

type ConvexAnonymousProviderProps = {
  children: ReactNode
  convexUrl: string
}

export function ConvexAnonymousProvider({
  children,
  convexUrl,
}: ConvexAnonymousProviderProps) {
  const convexClient = useMemo(
    () => new ConvexReactClient(convexUrl, { logger: false }),
    [convexUrl],
  )

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
