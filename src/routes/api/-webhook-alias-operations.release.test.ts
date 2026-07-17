import { afterEach, describe, expect, it } from 'vitest'

import { Route as RazorpayAliasRoute } from './payments.razorpay.webhook'
import { Route as StripeAliasRoute } from './payments.stripe.webhook'
import { callRouteHandler } from './-route-handler.test-helper'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function readJsonObject(response: Response) {
  const body: unknown = await response.json()
  if (!isRecord(body)) throw new Error('Webhook response must be a JSON object')
  return body
}

function webhookHeaders(name: string, value: string): Headers {
  const headers = new Headers({ 'content-type': 'application/json' })
  headers.set(name, value)
  return headers
}

describe('payment webhook alias release operations', () => {
  afterEach(() => {
    delete process.env.BILLING_WEBHOOK_MUTATION_SECRET
    delete process.env.RAZORPAY_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  it('redacts secrets and payload data on alias signature failures', async () => {
    process.env.BILLING_WEBHOOK_MUTATION_SECRET = 'mutation-release-secret'
    process.env.RAZORPAY_WEBHOOK_SECRET = 'razorpay-release-secret'
    process.env.STRIPE_WEBHOOK_SECRET = 'stripe-release-secret'
    const payloadMarker = 'customer-release-private-data'
    const cases = [
      {
        headers: webhookHeaders('stripe-signature', 't=1,v1=invalid'),
        route: StripeAliasRoute,
        url: 'https://ship-fast.test/api/payments/stripe/webhook',
      },
      {
        headers: webhookHeaders('x-razorpay-signature', 'invalid'),
        route: RazorpayAliasRoute,
        url: 'https://ship-fast.test/api/payments/razorpay/webhook',
      },
    ]

    for (const operation of cases) {
      const response = await callRouteHandler(operation.route, 'POST', {
        request: new Request(operation.url, {
          body: JSON.stringify({ payloadMarker }),
          headers: operation.headers,
          method: 'POST',
        }),
      })
      const body = await readJsonObject(response)
      const serialized = JSON.stringify(body)

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Invalid webhook signature.' })
      expect(serialized).not.toContain(payloadMarker)
      expect(serialized).not.toContain('mutation-release-secret')
      expect(serialized).not.toContain('razorpay-release-secret')
      expect(serialized).not.toContain('stripe-release-secret')
      expect(response.headers.get('access-control-allow-origin')).not.toBe('*')
      expect(response.headers.get('set-cookie')).toBeNull()
    }
  })

  it('rejects oversized alias payloads before signature processing', async () => {
    process.env.BILLING_WEBHOOK_MUTATION_SECRET = 'mutation-release-secret'
    process.env.RAZORPAY_WEBHOOK_SECRET = 'razorpay-release-secret'
    process.env.STRIPE_WEBHOOK_SECRET = 'stripe-release-secret'
    const oversizedBody = JSON.stringify({
      payload: 'x'.repeat(1_048_576),
    })
    const cases = [
      {
        headers: webhookHeaders('stripe-signature', 't=1,v1=invalid'),
        route: StripeAliasRoute,
        url: 'https://ship-fast.test/api/payments/stripe/webhook',
      },
      {
        headers: webhookHeaders('x-razorpay-signature', 'invalid'),
        route: RazorpayAliasRoute,
        url: 'https://ship-fast.test/api/payments/razorpay/webhook',
      },
    ]
    const statuses: number[] = []

    for (const operation of cases) {
      const response = await callRouteHandler(operation.route, 'POST', {
        request: new Request(operation.url, {
          body: oversizedBody,
          headers: operation.headers,
          method: 'POST',
        }),
      })
      statuses.push(response.status)
    }

    expect(statuses).toEqual([413, 413])
  })
})
