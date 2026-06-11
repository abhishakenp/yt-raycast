import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCheckoutApiResponse } from './checkout-api-response'

const env = {
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_PRO_PRICE_ID: 'price_pro',
  STRIPE_CREDITS_3_PRICE_ID: 'price_credits_3',
  RAZORPAY_KEY_ID: 'rzp_key',
  RAZORPAY_KEY_SECRET: 'rzp_secret',
  RAZORPAY_PRO_PLAN_ID: 'plan_pro',
  RAZORPAY_CREDITS_3_PAISE: '19900',
}

const client = {
  query: vi.fn(),
  setAuth: vi.fn(),
}

describe('createCheckoutApiResponse', () => {
  beforeEach(() => {
    client.query.mockReset().mockResolvedValue({ userId: 'user_123' })
    client.setAuth.mockReset()
    vi.restoreAllMocks()
  })

  it('requires authentication', async () => {
    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        body: JSON.stringify({ mode: 'subscription' }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(401)
  })

  it('creates a Stripe checkout session', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ id: 'cs_test', url: 'https://stripe.test/checkout' }),
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({ mode: 'subscription', gateway: 'stripe' }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(await response.json()).toMatchObject({
      provider: 'stripe',
      checkoutSessionId: 'cs_test',
      url: 'https://stripe.test/checkout',
    })
  })

  it('creates a Razorpay credit-pack order', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ id: 'order_123', amount: 19900, currency: 'INR' }),
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'credit_pack',
          gateway: 'razorpay',
          packId: '3_credits',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      provider: 'razorpay',
      orderId: 'order_123',
      amount: 19900,
    })
  })
})
