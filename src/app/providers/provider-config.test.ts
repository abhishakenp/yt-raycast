import { describe, expect, it } from 'vitest'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import {
  resolveProviderMode,
  shouldUseAuthenticatedProviders,
} from '@/app/providers/provider-config'

describe('provider config', () => {
  it('uses anonymous mode when auth providers are missing', () => {
    expect(resolveProviderMode({})).toBe('anonymous')
  })

  it('activates Convex without Clerk for anonymous generation', () => {
    expect(resolveProviderMode({ convexUrl: 'https://convex.ship-fast.io' })).toBe('convex_anonymous')
  })

  it('activates Clerk and Convex when both public values exist', () => {
    expect(
      resolveProviderMode({
        clerkPublishableKey: 'pk_test_123',
        convexUrl: 'https://convex.ship-fast.io',
      }),
    ).toBe('clerk_convex')
  })

  it('keeps authenticated providers off the anonymous homepage route', () => {
    expect(shouldUseAuthenticatedProviders('/')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/gallery')).toBe(false)
    expect(shouldUseAuthenticatedProviders('/pricing')).toBe(true)
    expect(shouldUseAuthenticatedProviders('/generate/session_123')).toBe(true)
  })

  it('provides a frosted glass Clerk appearance theme', () => {
    expect(clerkFrostedGlassAppearance).toMatchObject({
      theme: expect.anything(),
      elements: {
        cardBox: expect.objectContaining({ backdropFilter: 'blur(40px)' }),
        headerTitle: expect.objectContaining({ color: '#ffffff' }),
        socialButtonsBlockButtonText: expect.objectContaining({ color: '#ffffff' }),
        formButtonPrimary: expect.objectContaining({ background: expect.stringContaining('linear-gradient') }),
      },
      variables: {
        borderRadius: '22px',
        colorText: '#ffffff',
      },
    })
  })
})
