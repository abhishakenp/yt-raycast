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

  it('enables authenticated providers on all Convex routes when Clerk is configured', () => {
    // Every route that needs Convex should also get the Clerk-backed provider
    // so the user's identity is available everywhere — /mine, /gallery, /preview,
    // /referrals, etc. — not just /generate.
    expect(shouldUseAuthenticatedProviders('/')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/pricing')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/partners')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/referrals')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/generate/session_123')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/mine')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/gallery')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/preview/session_123')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/examples')).toBe(true)
  })

  it('keeps authenticated providers off non-Convex routes', () => {
    expect(shouldUseAuthenticatedProviders('/dashboard')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/blog/post')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/sign-in')).toBe(false)
  })

  it('loads Convex only on routes that call Convex hooks directly or need Clerk', () => {
    // `/` and `/pricing` both need ClerkConvexProvider (Clerk + Convex):
    // `/` renders <Waitlist /> and `/pricing` uses Clerk's <Show>/<SignInButton>.
    // `/referrals` uses Clerk auth to fetch the user's referral status.
    // `shouldLoadClerk` in AppProviders depends on `shouldLoadConvex`, so any
    // route in shouldUseAuthenticatedProviders must also be in
    // shouldUseConvexProviders to get a ClerkProvider mounted.
    expect(shouldUseConvexProviders('/')).toBe(true)
    expect(shouldUseConvexProviders('/pricing')).toBe(true)
    expect(shouldUseConvexProviders('/partners')).toBe(true)
    expect(shouldUseConvexProviders('/referrals')).toBe(true)
    expect(shouldUseConvexProviders('/generate/session_123')).toBe(true)
    expect(shouldUseConvexProviders('/generate/missing-session')).toBe(true)
    expect(shouldUseConvexProviders('/preview/session_123')).toBe(true)
    expect(shouldUseConvexProviders('/deployed/my-site')).toBe(true)
    expect(shouldUseConvexProviders('/deployed/my-site/about')).toBe(true)
    expect(shouldUseConvexProviders('/examples')).toBe(true)
    expect(shouldUseConvexProviders('/examples/saas')).toBe(true)
    expect(shouldUseConvexProviders('/gallery')).toBe(true)
    expect(shouldUseConvexProviders('/mine')).toBe(true)
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
