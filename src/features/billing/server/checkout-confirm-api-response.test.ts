import { beforeEach, describe, expect, it, vi } from 'vitest'

import { checkoutConfirmHits } from '@/lib/rate-limit'
import { createCheckoutConfirmApiResponse } from './checkout-confirm-api-response'

const env = {
  RAZORPAY_KEY_ID: 'rzp_key',
  RAZORPAY_KEY_SECRET: 'rzp_secret',
}

const client = {
  query: vi.fn(),
  mutation: vi.fn(),
  setAuth: vi.fn(),
}

const hmacSha256 = async (message: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const bytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  )
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

describe('createCheckoutConfirmApiResponse', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    checkoutConfirmHits.clear()
    client.setAuth.mockReset()
    client.query.mockReset().mockResolvedValue({ userId: 'user_123' })
    client.mutation.mockReset().mockResolvedValue({
      processed: true,
      duplicate: false,
    })
  })

  it('requires authentication', async () => {
    const response = await createCheckoutConfirmApiResponse(
      new Request('https://ship-fast.test/api/payments/razorpay/confirm', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId: 'sub_123' }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(401)
  })

  it('rejects invalid Razorpay subscription signatures', async () => {
    const response = await createCheckoutConfirmApiResponse(
      new Request('https://ship-fast.test/api/payments/razorpay/confirm', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          subscriptionId: 'sub_123',
          paymentId: 'pay_123',
          signature: 'bad-signature',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid Razorpay signature.',
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('persists a verified Razorpay subscription for the signed-in user', async () => {
    const signature = await hmacSha256('pay_123|sub_123', 'rzp_secret')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'sub_123',
          status: 'authenticated',
          plan_id: 'plan_pro',
          notes: { userId: 'user_123' },
        }),
      ),
    )

    const response = await createCheckoutConfirmApiResponse(
      new Request('https://ship-fast.test/api/payments/razorpay/confirm', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          subscriptionId: 'sub_123',
          paymentId: 'pay_123',
          signature,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.razorpay.com/v1/subscriptions/sub_123',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${btoa('rzp_key:rzp_secret')}`,
        }),
      }),
    )
    expect(client.mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        provider: 'razorpay',
        status: 'authenticated',
        planId: 'plan_pro',
        providerSubscriptionId: 'sub_123',
        providerCheckoutId: 'pay_123',
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      provider: 'razorpay',
      subscription: {
        active: true,
        providerSubscriptionId: 'sub_123',
        status: 'authenticated',
      },
    })
  })

  it('rejects confirmation when the Razorpay subscription belongs to a different user', async () => {
    const signature = await hmacSha256('pay_123|sub_123', 'rzp_secret')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'sub_123',
          status: 'authenticated',
          plan_id: 'plan_pro',
          notes: { userId: 'other_user' },
        }),
      ),
    )

    const response = await createCheckoutConfirmApiResponse(
      new Request('https://ship-fast.test/api/payments/razorpay/confirm', {
        method: 'POST',
        headers: { authorization: 'Bearer token_123' },
        body: JSON.stringify({
          subscriptionId: 'sub_123',
          paymentId: 'pay_123',
          signature,
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(403)
    expect(client.mutation).not.toHaveBeenCalled()
  })
})
