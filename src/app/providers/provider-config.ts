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

export const shouldUseAuthenticatedProviders = (pathname: string): boolean =>
  // The homepage (`/`) mounts its own ClerkProvider via HomepageAuthControls
  // and only needs anonymous Convex for the public gallery. Letting AppProviders
  // mount Clerk on `/` would stack a second <ClerkProvider> and crash Clerk, so
  // `/` is intentionally excluded here (it stays in shouldUseConvexProviders).
  pathname === '/pricing' || pathname.startsWith('/generate/')

export const shouldUseConvexProviders = (pathname: string): boolean =>
  pathname === '/' ||
  pathname.startsWith('/generate/') ||
  pathname.startsWith('/gallery') ||
  pathname.startsWith('/mine')
