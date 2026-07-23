import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCheckoutApiResponse } from './checkout-api-response'

const env = {
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

  it('rejects Stripe checkout before calling any payment provider', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({ mode: 'subscription', gateway: 'stripe' }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid payment gateway.',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
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

  it('lets route params override a conflicting checkout body gateway', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'order_override',
          amount: 19900,
          currency: 'INR',
        }),
      ),
    )

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/payments/razorpay/start', {
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
      'razorpay',
    )

    expect(response.status).toBe(200)
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe(
      'https://api.razorpay.com/v1/orders',
    )
    expect(await response.json()).toMatchObject({
      provider: 'razorpay',
      orderId: 'order_override',
    })
  })

  it('rejects an unsupported gateway route override with 400 before calling any payment provider', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/payments/paypal/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({ mode: 'subscription' }),
      }),
      env,
      client,
      'paypal',
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid payment gateway.',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects an unsupported checkout body gateway instead of falling back to country routing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await createCheckoutApiResponse(
      new Request('https://ship-fast.test/api/checkout/start', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          mode: 'subscription',
          gateway: 'paypal',
          countryCode: 'US',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid payment gateway.',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
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
        body: JSON.stringify({ mode: 'lifetime_deal', gateway: 'razorpay' }),
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
          gateway: 'razorpay',
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

  it('returns 401 when Convex rejects the Clerk billing token before checkout starts', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    client.query.mockRejectedValueOnce(
      new Error('ConvexError: UNAUTHENTICATED'),
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

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Sign in before checkout.',
    })
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(fetchSpy).not.toHaveBeenCalled()
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
