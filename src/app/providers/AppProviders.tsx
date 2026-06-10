import type { ReactNode } from 'react'

import { ClerkConvexProvider } from '@/app/providers/ClerkConvexProvider'

type AppProvidersProps = {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <ClerkConvexProvider>{children}</ClerkConvexProvider>
)
