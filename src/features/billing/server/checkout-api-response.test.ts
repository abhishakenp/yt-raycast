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

// Observed via:
// npx convex data sessions --limit 10 --format jsonLines
// npx convex data customerCredits --limit 10 --format jsonLines
// npx convex data creditLedger --limit 10 --format jsonLines
// npx convex data subscriptions --limit 10 --format jsonLines
// The billing tables were empty in this deployment; use a real ready session id
// for checkout return URLs and error-leak guards.
const dbObservedReadySessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

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

  it('omits subscription_data from Stripe credit-pack (payment mode) checkout', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'cs_pack',
          url: 'https://stripe.test/checkout',
        }),
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'credit_pack',
          gateway: 'stripe',
          packId: '3_credits',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    const stripeBody = String(fetchSpy.mock.calls[0]?.[1]?.body)
    expect(stripeBody).toContain('mode=payment')
    expect(stripeBody).not.toContain('subscription_data')
  })

  it('includes subscription_data metadata on Stripe subscription checkout', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ id: 'cs_sub', url: 'https://stripe.test/checkout' }),
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
    const stripeBody = String(fetchSpy.mock.calls[0]?.[1]?.body)
    expect(stripeBody).toContain('mode=subscription')
    expect(stripeBody).toContain(
      encodeURIComponent('subscription_data[metadata][userId]'),
    )
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

  it('returns JSON instead of throwing when an authenticated checkout request has malformed JSON', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: '{not-json',
      }),
      env,
      client,
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON.' })
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects unsupported checkout modes before calling payment providers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({ mode: 'lifetime_deal', gateway: 'stripe' }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid checkout mode.',
    })
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns JSON when Stripe checkout returns a malformed upstream body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>stripe unavailable</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 502,
      }),
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

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Stripe checkout failed.',
    })
  })

  it('does not treat a malformed 200 Stripe checkout response as a successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>stripe gateway returned a login page</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
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

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Stripe checkout failed.',
    })
  })

  it('returns stable JSON when Stripe checkout network request rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error(
        'stripe network unavailable for k571fbfbggczv4pfz2evtrxdzx89qqbb',
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'stripe',
          sessionId: 'k571fbfbggczv4pfz2evtrxdzx89qqbb',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Stripe checkout failed.',
    })
  })

  it('returns stable JSON when Convex billing overview lookup fails before checkout starts', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    client.query.mockRejectedValueOnce(
      new Error(
        `Convex billing overview failed for ${dbObservedReadySessionId}`,
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'stripe',
          sessionId: dbObservedReadySessionId,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(503)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    const body = await response.json()
    expect(body).toEqual({ error: 'Unable to start checkout.' })
    expect(JSON.stringify(body)).not.toContain(dbObservedReadySessionId)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not treat a Stripe 200 response without a checkout URL or session id as successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ object: 'checkout.session' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'stripe',
          sessionId: dbObservedReadySessionId,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Stripe checkout failed.',
    })
  })

  it('returns JSON when Razorpay checkout returns a malformed upstream body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>razorpay unavailable</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 503,
      }),
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

    expect(response.status).toBe(503)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay order failed.',
    })
  })

  it('does not treat a malformed 200 Razorpay order response as a successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>razorpay gateway returned a login page</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
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

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay order failed.',
    })
  })

  it('does not treat a Razorpay order 200 response without an order id and amount as successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'created' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'credit_pack',
          gateway: 'razorpay',
          packId: '3_credits',
          sessionId: dbObservedReadySessionId,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay order failed.',
    })
  })

  it('returns stable JSON when Razorpay order network request rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error(
        'razorpay order network unavailable for k571fbfbggczv4pfz2evtrxdzx89qqbb',
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
          sessionId: 'k571fbfbggczv4pfz2evtrxdzx89qqbb',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay order failed.',
    })
  })

  it('returns JSON when Razorpay subscription creation returns a malformed upstream body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>razorpay subscriptions unavailable</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 502,
      }),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'razorpay',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay subscription failed.',
    })
  })

  it('does not treat a malformed 200 Razorpay subscription response as a successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>razorpay gateway returned a login page</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'razorpay',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay subscription failed.',
    })
  })

  it('returns stable JSON when Razorpay subscription network request rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error(
        `razorpay subscription network unavailable for ${dbObservedReadySessionId}`,
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'razorpay',
          sessionId: dbObservedReadySessionId,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    const body = await response.json()
    expect(body).toEqual({ error: 'Razorpay subscription failed.' })
    expect(JSON.stringify(body)).not.toContain(dbObservedReadySessionId)
  })

  it('does not treat a Razorpay subscription 200 response without a subscription id as successful checkout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'created' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'razorpay',
          sessionId: dbObservedReadySessionId,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Razorpay subscription failed.',
    })
  })
})
