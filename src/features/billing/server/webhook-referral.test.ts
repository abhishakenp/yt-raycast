import { afterEach, describe, expect, it, vi } from 'vitest'

import { createWebhookApiResponse } from './webhook-api-response'

const WEBHOOK_SECRET = 'whsec_test'
const MUTATION_SECRET = 'billing-secret'

const env = {
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
  BILLING_WEBHOOK_MUTATION_SECRET: MUTATION_SECRET,
} as unknown as NodeJS.ProcessEnv

async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  )
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

async function buildSignedStripeRequest(event: unknown) {
  const rawBody = JSON.stringify(event)
  const t = '1700000000'
  const v1 = await hmacSha256Hex(WEBHOOK_SECRET, `${t}.${rawBody}`)
  return new Request('https://ship-fast.io/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${t},v1=${v1}` },
    body: rawBody,
  })
}

afterEach(() => vi.restoreAllMocks())

describe('billing webhook → referral discount wiring', () => {
  it('applies the discount to BOTH the payer and the just-unlocked referrer', async () => {
    const event = {
      id: 'evt_1',
      data: {
        object: {
          id: 'cs_1',
          mode: 'subscription',
          subscription: 'sub_payer',
          status: 'active',
          metadata: { userId: 'payer', mode: 'subscription', tier: 'pro' },
        },
      },
    }
    const request = await buildSignedStripeRequest(event)

    const client = {
      mutation: vi.fn(async () => ({
        processed: true,
        duplicate: false,
        referralUnlock: { referrerUserId: 'referrer' },
      })),
    }
    const applyDiscount = vi.fn(async (_env, _userId) => ({
      applied: true,
      reason: 'ok',
    }))

    const response = await createWebhookApiResponse(
      request,
      'stripe',
      env,
      client,
      applyDiscount,
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })

    expect(client.mutation).toHaveBeenCalledOnce()
    const calledUsers = applyDiscount.mock.calls.map((call) => call[1]).sort()
    expect(calledUsers).toEqual(['payer', 'referrer'])
  })

  it('only reconciles the payer when no referral unlock occurs', async () => {
    const event = {
      id: 'evt_2',
      data: {
        object: {
          id: 'cs_2',
          mode: 'subscription',
          subscription: 'sub_payer2',
          status: 'active',
          metadata: { userId: 'payer2', mode: 'subscription', tier: 'pro' },
        },
      },
    }
    const request = await buildSignedStripeRequest(event)
    const client = {
      mutation: vi.fn(async () => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      })),
    }
    const applyDiscount = vi.fn(async (_env, _userId) => ({
      applied: false,
      reason: 'x',
    }))

    await createWebhookApiResponse(
      request,
      'stripe',
      env,
      client,
      applyDiscount,
    )
    expect(applyDiscount.mock.calls.map((call) => call[1])).toEqual(['payer2'])
  })

  it('rejects an invalid signature without calling Convex', async () => {
    const request = new Request('https://ship-fast.io/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=deadbeef' },
      body: JSON.stringify({ id: 'evt_bad' }),
    })
    const client = { mutation: vi.fn() }
    const applyDiscount = vi.fn()
    const response = await createWebhookApiResponse(
      request,
      'stripe',
      env,
      client,
      applyDiscount,
    )
    expect(response.status).toBe(400)
    expect(client.mutation).not.toHaveBeenCalled()
    expect(applyDiscount).not.toHaveBeenCalled()
  })
})
