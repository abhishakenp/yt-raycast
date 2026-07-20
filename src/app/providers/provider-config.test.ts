import { describe, expect, it } from 'vitest'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import {
  resolveProviderMode,
  shouldUseAuthenticatedProviders,
  shouldUseConvexProviders,
} from '@/app/providers/provider-config'

describe('provider config', () => {
  it('uses anonymous mode when auth providers are missing', () => {
    expect(resolveProviderMode({})).toBe('anonymous')
  })

  it('activates Convex without Clerk for anonymous generation', () => {
    expect(
      resolveProviderMode({ convexUrl: 'https://convex.ship-fast.io' }),
    ).toBe('convex_anonymous')
  })

  it('activates Clerk and Convex when both public values exist', () => {
    expect(
      resolveProviderMode({
        clerkPublishableKey: 'pk_test_123',
        convexUrl: 'https://convex.ship-fast.io',
      }),
    ).toBe('clerk_convex')
  })

  it('enables authenticated providers on homepage, pricing, partners and generate routes', () => {
    // `/` is included so AppProviders mounts ClerkConvexProvider from first
    // paint: the homepage renders Clerk's <Waitlist /> for non-approved users,
    // which must live inside a <ClerkProvider>. The clerkMounted flag prevents
    // SignInModalHost from stacking a second ClerkProvider on `/`.
    expect(shouldUseAuthenticatedProviders('/')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/pricing')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/partners')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/generate/session_123')).toBe(true)
  })

  it('keeps authenticated providers off other routes', () => {
    expect(shouldUseAuthenticatedProviders('/gallery')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/dashboard')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/blog/post')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/sign-in')).toBe(false)
  })

  it('loads Convex only on routes that call Convex hooks directly or need Clerk', () => {
    // `/` and `/pricing` both need ClerkConvexProvider (Clerk + Convex):
    // `/` renders <Waitlist /> and `/pricing` uses Clerk's <Show>/<SignInButton>.
    // `shouldLoadClerk` in AppProviders depends on `shouldLoadConvex`, so any
    // route in shouldUseAuthenticatedProviders must also be in
    // shouldUseConvexProviders to get a ClerkProvider mounted.
    expect(shouldUseConvexProviders('/')).toBe(true)
    expect(shouldUseConvexProviders('/pricing')).toBe(true)
    expect(shouldUseConvexProviders('/partners')).toBe(true)
    expect(shouldUseConvexProviders('/generate/session_123')).toBe(true)
    expect(shouldUseConvexProviders('/generate/missing-session')).toBe(true)
    expect(shouldUseConvexProviders('/preview/session_123')).toBe(true)
    expect(shouldUseConvexProviders('/examples')).toBe(true)
    expect(shouldUseConvexProviders('/examples/saas')).toBe(true)
    expect(shouldUseConvexProviders('/gallery')).toBe(true)
    expect(shouldUseConvexProviders('/mine')).toBe(true)
    expect(shouldUseConvexProviders('/referrals')).toBe(false)
  })

  it('provides a frosted glass Clerk appearance theme', () => {
    expect(clerkFrostedGlassAppearance).toMatchObject({
      theme: expect.anything(),
      elements: {
        cardBox: expect.objectContaining({ backdropFilter: 'blur(40px)' }),
        headerTitle: expect.objectContaining({ color: '#ffffff' }),
        socialButtonsBlockButtonText: expect.objectContaining({
          color: '#ffffff',
        }),
        formButtonPrimary: expect.objectContaining({
          background: expect.stringContaining('linear-gradient'),
        }),
      },
      variables: {
        borderRadius: '22px',
        colorText: '#ffffff',
      },
    })
  })
})
