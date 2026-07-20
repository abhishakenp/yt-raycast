import { hasConfiguredValue } from '@/shared/env/app-env'

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
  return (
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/partners' ||
    pathname.startsWith('/generate/')
  )
}

export function shouldUseConvexProviders(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/partners' ||
    pathname.startsWith('/generate/') ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/examples') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/mine')
  )
}
