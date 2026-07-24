import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { CommerceProvider } from './commerce-provider'

/**
 * Test-only wrapper that mounts capsule components inside the same
 * `CommerceProvider` boundary they receive in production (see
 * `OpenUIViewer`). Capsules rely on `useCommerce()` to decide whether to
 * route add-to-cart actions through the demo Lakebed mutation path; without a
 * provider the runtime reports `mode: 'disabled'` and every commerce button is
 * disabled. Demo mode keeps the Lakebed mutation path active so stubbed
 * Lakebed clients can mutate shared cart state during fullstack tests.
 */
export function DemoCommerceProvider({
  children,
  fallbackProducts = [],
}: PropsWithChildren<{
  fallbackProducts?: Parameters<typeof CommerceProvider>[0]['fallbackProducts']
}>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <CommerceProvider
        fallbackProducts={fallbackProducts}
        mode="demo"
        scope="sessions"
        tenant="test-session"
      >
        {children}
      </CommerceProvider>
    </QueryClientProvider>
  )
}
