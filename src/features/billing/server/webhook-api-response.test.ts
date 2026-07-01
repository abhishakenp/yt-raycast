import { describe, expect, it, vi } from 'vitest'

import { createWebhookApiResponse } from './webhook-api-response'

const sign = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return Array.from(
    new Uint8Array(
      await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)),
    ),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('')
}

describe('createWebhookApiResponse', () => {
  it('rejects invalid signatures', async () => {
    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 't=1,v1=bad' },
        body: JSON.stringify({ id: 'evt_1' }),
      }),
      'stripe',
      {
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      { mutation: vi.fn() },
    )

    expect(response.status).toBe(400)
  })

  it('accepts signed Stripe checkout events and writes billing state', async () => {
    const body = JSON.stringify({
      id: 'evt_1',
      data: {
        object: {
          id: 'cs_1',
          subscription: 'sub_1',
          client_reference_id: 'user_123',
          mode: 'subscription',
          status: 'active',
          metadata: { userId: 'user_123', tier: 'pro' },
        },
      },
    })
    const signature = `t=1,v1=${await sign('whsec_test', `1.${body}`)}`
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': signature },
        body,
      }),
      'stripe',
      {
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: 'mutation_secret',
      provider: 'stripe',
      idempotencyKey: 'evt_1',
      userId: 'user_123',
      subscription: {
        status: 'active',
        planId: 'pro',
        providerSubscriptionId: 'sub_1',
        providerCheckoutId: 'cs_1',
      },
    })
  })

  it('accepts signed Razorpay subscription events and writes billing state', async () => {
    const body = JSON.stringify({
      event: 'subscription.activated',
      payload: {
        subscription: {
          entity: {
            id: 'sub_razorpay_1',
            notes: { tier: 'pro', userId: 'user_razorpay' },
            plan_id: 'plan_pro',
            status: 'authenticated',
          },
        },
      },
    })
    const signature = await sign('rzp_secret', body)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body,
      }),
      'razorpay',
      {
        RAZORPAY_WEBHOOK_SECRET: 'rzp_secret',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: 'mutation_secret',
      provider: 'razorpay',
      idempotencyKey: 'subscription.activated:sub_razorpay_1',
      userId: 'user_razorpay',
      subscription: {
        status: 'authenticated',
        planId: 'plan_pro',
        providerSubscriptionId: 'sub_razorpay_1',
      },
    })
  })

  it('accepts signed Razorpay credit-pack order events', async () => {
    const body = JSON.stringify({
      event: 'order.paid',
      payload: {
        order: {
          entity: {
            id: 'order_10credits',
            notes: { packId: '10_credits', user_id: 'user_credit_pack' },
          },
        },
      },
    })
    const signature = await sign('rzp_secret', body)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body,
      }),
      'razorpay',
      {
        RAZORPAY_WEBHOOK_SECRET: 'rzp_secret',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: 'mutation_secret',
      provider: 'razorpay',
      idempotencyKey: 'order.paid:order_10credits',
      userId: 'user_credit_pack',
      credits: 10,
    })
  })

  it('returns JSON instead of throwing for a signed malformed webhook body', async () => {
    const body = '{not-json'
    const signature = `t=1,v1=${await sign('whsec_test', `1.${body}`)}`
    const client = { mutation: vi.fn() }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': signature },
        body,
      }),
      'stripe',
      {
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      client,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid webhook body.',
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })
})
