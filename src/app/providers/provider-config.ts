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
  // `/` is included so AppProviders mounts ClerkConvexProvider from first paint:
  // the homepage renders Clerk's <Waitlist /> (via WaitlistGate) for non-approved
  // users, and <Waitlist /> must live inside a <ClerkProvider>. Previously `/`
  // was excluded to avoid a double <ClerkProvider> from HomepageAuthControls, but
  // the clerkMounted flag now makes SignInModalHost pass wrapProvider={false} on
  // authed routes, so exactly one ClerkProvider mounts on `/`. Public gallery
  // reads still work: Clerk's useAuth returns a null token when signed out, so
  // Convex treats the visitor as anonymous.
  pathname === '/' ||
  pathname === '/pricing' ||
  pathname.startsWith('/generate/')

export const shouldUseConvexProviders = (pathname: string): boolean =>
  pathname === '/' ||
  pathname === '/pricing' ||
  pathname.startsWith('/generate/') ||
  pathname.startsWith('/gallery') ||
  pathname.startsWith('/mine')
