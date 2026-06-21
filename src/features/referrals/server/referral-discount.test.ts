import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  applyReferralDiscountForUser,
  ensureStripeReferralCoupon,
} from './referral-discount'

const stripeEnv = {
  STRIPE_SECRET_KEY: 'sk_test_123',
  BILLING_WEBHOOK_MUTATION_SECRET: 'billing-secret',
} as unknown as NodeJS.ProcessEnv

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ensureStripeReferralCoupon', () => {
  it('prefers an explicit env coupon id', async () => {
    const env = {
      ...stripeEnv,
      STRIPE_REFERRAL_COUPON_ID: 'custom_coupon',
    } as NodeJS.ProcessEnv
    const id = await ensureStripeReferralCoupon(env)
    expect(id).toBe('custom_coupon')
  })

  it('creates a 50%/forever coupon when none is configured', async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      const body = String((init as RequestInit)?.body ?? '')
      expect(body).toContain('percent_off=50')
      expect(body).toContain('duration=forever')
      return new Response(JSON.stringify({ id: 'shipfast_ref_50_forever' }), {
        status: 200,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const id = await ensureStripeReferralCoupon(stripeEnv)
    expect(id).toBe('shipfast_ref_50_forever')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('reuses the coupon if it already exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: { code: 'resource_already_exists' } }),
            { status: 400 },
          ),
      ),
    )
    expect(await ensureStripeReferralCoupon(stripeEnv)).toBe(
      'shipfast_ref_50_forever',
    )
  })

  it('returns null without a Stripe key', async () => {
    expect(
      await ensureStripeReferralCoupon({} as NodeJS.ProcessEnv),
    ).toBeNull()
  })
})

describe('applyReferralDiscountForUser', () => {
  it('no-ops without the server secret', async () => {
    const result = await applyReferralDiscountForUser(
      {} as NodeJS.ProcessEnv,
      'user1',
      { query: vi.fn(), mutation: vi.fn() },
    )
    expect(result).toEqual({ applied: false, reason: 'not_configured' })
  })

  it('skips when the user has not unlocked the reward', async () => {
    const client = {
      query: vi.fn(async () => ({
        unlocked: false,
        discountApplied: false,
        subscription: null,
      })),
      mutation: vi.fn(),
    }
    const result = await applyReferralDiscountForUser(
      stripeEnv,
      'user1',
      client,
    )
    expect(result.reason).toBe('not_unlocked')
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('skips when already applied', async () => {
    const client = {
      query: vi.fn(async () => ({
        unlocked: true,
        discountApplied: true,
        subscription: {
          provider: 'stripe',
          providerSubscriptionId: 'sub_1',
        },
      })),
      mutation: vi.fn(),
    }
    expect(
      (await applyReferralDiscountForUser(stripeEnv, 'user1', client)).reason,
    ).toBe('already_applied')
  })

  it('skips when there is no active subscription', async () => {
    const client = {
      query: vi.fn(async () => ({
        unlocked: true,
        discountApplied: false,
        subscription: null,
      })),
      mutation: vi.fn(),
    }
    expect(
      (await applyReferralDiscountForUser(stripeEnv, 'user1', client)).reason,
    ).toBe('no_active_subscription')
  })

  it('defers Razorpay subscriptions to checkout', async () => {
    const client = {
      query: vi.fn(async () => ({
        unlocked: true,
        discountApplied: false,
        subscription: {
          provider: 'razorpay',
          providerSubscriptionId: 'sub_rzp',
        },
      })),
      mutation: vi.fn(),
    }
    expect(
      (await applyReferralDiscountForUser(stripeEnv, 'user1', client)).reason,
    ).toBe('razorpay_apply_at_checkout')
  })

  it('attaches the coupon and records it for an unlocked Stripe subscriber', async () => {
    const fetchMock = vi.fn(async (url: unknown) => {
      const u = String(url)
      if (u.endsWith('/coupons')) {
        return new Response(
          JSON.stringify({ id: 'shipfast_ref_50_forever' }),
          { status: 200 },
        )
      }
      // subscription update
      expect(u).toContain('/subscriptions/sub_1')
      return new Response(JSON.stringify({ id: 'sub_1' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = {
      query: vi.fn(async () => ({
        unlocked: true,
        discountApplied: false,
        subscription: {
          provider: 'stripe',
          providerSubscriptionId: 'sub_1',
        },
      })),
      mutation: vi.fn(async () => ({ ok: true })),
    }

    const result = await applyReferralDiscountForUser(stripeEnv, 'user1', client)
    expect(result).toEqual({ applied: true, reason: 'ok' })
    expect(client.mutation).toHaveBeenCalledOnce()
    const markArgs = (client.mutation.mock.calls[0] as unknown[])[1] as {
      providerDiscountId: string
      subscriptionId: string
    }
    expect(markArgs.providerDiscountId).toBe('shipfast_ref_50_forever')
    expect(markArgs.subscriptionId).toBe('sub_1')
  })

  it('never throws — returns provider_rejected on a failed attach', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: unknown) =>
        String(url).endsWith('/coupons')
          ? new Response(JSON.stringify({ id: 'shipfast_ref_50_forever' }), {
              status: 200,
            })
          : new Response(JSON.stringify({ error: {} }), { status: 402 }),
      ),
    )
    const client = {
      query: vi.fn(async () => ({
        unlocked: true,
        discountApplied: false,
        subscription: { provider: 'stripe', providerSubscriptionId: 'sub_1' },
      })),
      mutation: vi.fn(),
    }
    const result = await applyReferralDiscountForUser(stripeEnv, 'user1', client)
    expect(result.reason).toBe('provider_rejected')
    expect(client.mutation).not.toHaveBeenCalled()
  })
})
