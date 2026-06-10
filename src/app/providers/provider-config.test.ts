import { describe, expect, it } from 'vitest'

import { resolveProviderMode } from '@/app/providers/provider-config'

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
})
