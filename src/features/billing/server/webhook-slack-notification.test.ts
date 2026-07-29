import { afterEach, describe, expect, it, vi } from 'vitest'

import { createWebhookApiResponse } from './webhook-api-response'

const WEBHOOK_SECRET = 'whsec_test'
const RAZORPAY_SECRET = 'rzp_secret'
const SLACK_WEBHOOK_URL = 'https://hooks.slack.test/services/T/B/X'

const env: NodeJS.ProcessEnv = {
  BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
  RAZORPAY_WEBHOOK_SECRET: RAZORPAY_SECRET,
  SLACK_WEBHOOK_URL,
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
}

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

async function signedStripeRequest(event: unknown) {
  const rawBody = JSON.stringify(event)
  const t = '1700000000'
  const v1 = await hmacSha256Hex(WEBHOOK_SECRET, `${t}.${rawBody}`)
  return new Request('https://ship-fast.test/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${t},v1=${v1}` },
    body: rawBody,
  })
}

async function signedRazorpayRequest(event: unknown) {
  const rawBody = JSON.stringify(event)
  const signature = await hmacSha256Hex(RAZORPAY_SECRET, rawBody)
  return new Request('https://ship-fast.test/api/razorpay/webhook', {
    method: 'POST',
    headers: { 'x-razorpay-signature': signature },
    body: rawBody,
  })
}

function stubSlackFetch() {
  const calls: { url: string; body: unknown }[] = []
  async function captureFetch(
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ): Promise<Response> {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body ?? 'null')),
    })
    return new Response('ok', { status: 200 })
  }
  vi.spyOn(globalThis, 'fetch').mockImplementation(captureFetch)
  return calls
}

function slackText(payload: unknown): string {
  return JSON.stringify(payload)
}

const client = () => ({ mutation: vi.fn().mockResolvedValue({}) })
const applyDiscount = vi.fn(async () => ({ applied: false, reason: 'noop' }))

afterEach(() => vi.restoreAllMocks())

describe('billing webhook → Slack payment notification', () => {
  it('reports the plan for a Stripe subscription payment', async () => {
    const calls = stubSlackFetch()
    const request = await signedStripeRequest({
      id: 'evt_sub',
      data: {
        object: {
          id: 'cs_sub',
          mode: 'subscription',
          subscription: 'sub_1',
          status: 'active',
          metadata: { userId: 'user_sub', mode: 'subscription', tier: 'pro' },
        },
      },
    })

    const response = await createWebhookApiResponse(
      request,
      'stripe',
      env,
      client(),
      applyDiscount,
    )
    await Promise.resolve()

    expect(response.status).toBe(200)
    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe(SLACK_WEBHOOK_URL)
    const text = slackText(calls[0]?.body)
    expect(text).toContain('Payment Completed')
    expect(text).toContain('subscription')
    expect(text).toContain('*Plan:* `pro`')
    expect(text).toContain('user_sub')
  })

  it('omits the plan for a credit-pack payment', async () => {
    const calls = stubSlackFetch()
    const request = await signedRazorpayRequest({
      event: 'order.paid',
      payload: {
        order: {
          entity: {
            id: 'order_10credits',
            notes: { packId: '10_credits', user_id: 'user_pack' },
          },
        },
      },
    })

    const response = await createWebhookApiResponse(
      request,
      'razorpay',
      env,
      client(),
      applyDiscount,
    )
    await Promise.resolve()

    expect(response.status).toBe(200)
    expect(calls).toHaveLength(1)
    const text = slackText(calls[0]?.body)
    expect(text).toContain('Payment Completed')
    expect(text).toContain('credit_pack')
    expect(text).not.toContain('*Plan:*')
    expect(text).toContain('*Credits:* 10')
  })
})
