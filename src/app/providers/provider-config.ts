import { hasConfiguredValue } from '@/shared/env/has-configured-value'

export type ProviderMode = 'anonymous' | 'convex_anonymous' | 'clerk_convex'

export type ProviderConfig = {
  clerkPublishableKey?: string
  convexUrl?: string
}

export function resolveProviderMode(config: ProviderConfig): ProviderMode {
  return hasConfiguredValue(config.convexUrl)
    ? hasConfiguredValue(config.clerkPublishableKey)
      ? 'clerk_convex'
      : 'convex_anonymous'
    : 'anonymous'
}

export function shouldUseAuthenticatedProviders(pathname: string): boolean {
  // When Clerk is configured, every Convex route should use the Clerk-backed
  // provider so the user's identity follows them everywhere. There's no reason
  // to give /mine or /gallery a lesser provider — the user's identity should
  // be available on all Convex routes, not just /generate.
  return shouldUseConvexProviders(pathname)
}

export function shouldUseConvexProviders(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/partners' ||
    pathname === '/referrals' ||
    pathname.startsWith('/generate/') ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/deployed/') ||
    pathname.startsWith('/examples') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/mine')
  )
}
