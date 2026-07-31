import { describe, expect, it } from 'vitest'

import {
  assertNoClientExposedSecrets,
  findClientExposedSecrets,
} from './assert-no-secret-vite-vars'

describe('client-exposed secret guard', () => {
  it('flags a credential that would be inlined into the browser bundle', () => {
    expect(
      findClientExposedSecrets({
        VITE_PEXELS_API_KEY: 'live-key',
        VITE_UNSPLASH_ACCESS_KEY: 'live-key',
        NEXT_PUBLIC_GROQ_API_KEY: 'live-key',
      }),
    ).toEqual([
      'NEXT_PUBLIC_GROQ_API_KEY',
      'VITE_PEXELS_API_KEY',
      'VITE_UNSPLASH_ACCESS_KEY',
    ])
  })

  it('ignores server-side variables with the same names', () => {
    expect(
      findClientExposedSecrets({
        PEXELS_API_KEY: 'live-key',
        RAZORPAY_KEY_SECRET: 'live-key',
        BILLING_WEBHOOK_MUTATION_SECRET: 'live-key',
      }),
    ).toEqual([])
  })

  it('ignores publishable keys that are meant to ship to the browser', () => {
    expect(
      findClientExposedSecrets({
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_x',
        VITE_STRIPE_PUBLISHABLE_KEY: 'pk_live_y',
        VITE_RAZORPAY_KEY_ID: 'rzp_live_z',
      }),
    ).toEqual([])
  })

  it('ignores empty values so an unset placeholder does not fail the build', () => {
    expect(findClientExposedSecrets({ VITE_PEXELS_API_KEY: '  ' })).toEqual([])
  })

  it('throws with the offending names when the guard is enforced', () => {
    expect(() =>
      assertNoClientExposedSecrets({ VITE_PEXELS_API_KEY: 'live-key' }),
    ).toThrow(/VITE_PEXELS_API_KEY/)
  })

  it('passes on an environment with no client-exposed credentials', () => {
    expect(() =>
      assertNoClientExposedSecrets({
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
        NEXT_PUBLIC_BASE_DOMAIN: 'ship-fast.ai',
        GROQ_API_KEY: 'server-only',
      }),
    ).not.toThrow()
  })
})
