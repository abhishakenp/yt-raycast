import { afterEach, describe, expect, it, vi } from 'vitest'

import { applyStripeReferralDiscountToSubscription } from './referral-discount'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Stripe referral discount provider request', () => {
  it('updates the encoded subscription with bearer auth and coupon form data', async () => {
    const fetchMock = vi.fn(
      async (_input: string | URL | Request, _init?: RequestInit) =>
        new Response(JSON.stringify({ id: 'sub/customer id' }), {
          status: 200,
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      applyStripeReferralDiscountToSubscription(
        { STRIPE_SECRET_KEY: 'sk_release_test' },
        'sub/customer id',
        'coupon_50_forever',
      ),
    ).resolves.toBe(true)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.stripe.com/v1/subscriptions/sub%2Fcustomer%20id',
    )
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer sk_release_test',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    expect(String(init?.body)).toBe(
      'discounts%5B0%5D%5Bcoupon%5D=coupon_50_forever',
    )
  })

  it('returns false when Stripe rejects the subscription update', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: 'not_found' } }), {
            status: 404,
          }),
      ),
    )

    await expect(
      applyStripeReferralDiscountToSubscription(
        { STRIPE_SECRET_KEY: 'sk_release_test' },
        'sub_missing',
        'coupon_50_forever',
      ),
    ).resolves.toBe(false)
  })
})
