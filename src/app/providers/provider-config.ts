import { hasConfiguredValue } from '@/shared/env/app-env'

export type ProviderMode = 'anonymous' | 'convex_anonymous' | 'clerk_convex'

export type ProviderConfig = {
  clerkPublishableKey?: string
  convexUrl?: string
}

export const resolveProviderMode = (config: ProviderConfig): ProviderMode =>
  hasConfiguredValue(config.convexUrl)
    ? hasConfiguredValue(config.clerkPublishableKey)
      ? 'clerk_convex'
      : 'convex_anonymous'
    : 'anonymous'

export const shouldUseAuthenticatedProviders = (_pathname: string): boolean =>
  false

export const shouldUseConvexProviders = (pathname: string): boolean =>
  pathname.startsWith('/generate/')
