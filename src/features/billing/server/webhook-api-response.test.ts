import { describe, expect, it, vi } from 'vitest'

import { createWebhookApiResponse } from './webhook-api-response'

async function sign(secret: string, payload: string): Promise<string> {
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

function currentTimestamp(): string {
  return String(Math.floor(Date.now() / 1000))
}

async function stripeSignature(
  secret: string,
  body: string,
  timestampOverride?: string,
): Promise<string> {
  const t = timestampOverride ?? currentTimestamp()
  return `t=${t},v1=${await sign(secret, `${t}.${body}`)}`
}

describe('createWebhookApiResponse', () => {
  it('rejects invalid signatures', async () => {
    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 't=1,v1=bad' }, // stale timestamp + bad sig
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

  it('rejects validly-signed but stale timestamps (replay attack protection)', async () => {
    const body = JSON.stringify({ id: 'evt_replay', data: { object: {} } })
    // Valid signature but timestamp from 10 minutes ago
    const signature = await stripeSignature(
      'whsec_test',
      body,
      String(Math.floor(Date.now() / 1000) - 600),
    )

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
      { mutation: vi.fn() },
    )

    expect(response.status).toBe(400)
  })

  it('accepts signed Stripe checkout events and writes billing state', async () => {
    const body = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
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
    const signature = await stripeSignature('whsec_test', body)
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
      id: 'evt_sub_activated_001',
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
      idempotencyKey: 'evt_sub_activated_001',
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
      id: 'evt_order_paid_001',
      payload: {
        order: {
          entity: {
            id: 'order_10credits',
            amount_paid: 250000,
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
        RAZORPAY_CREDITS_10_PAISE: '250000',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: 'mutation_secret',
      provider: 'razorpay',
      idempotencyKey: 'evt_order_paid_001',
      userId: 'user_credit_pack',
      credits: 10,
    })
  })

  it('maps a signed Razorpay subscription invoice to a partner sale', async () => {
    const body = JSON.stringify({
      event: 'invoice.paid',
      payload: {
        invoice: {
          entity: {
            amount_paid: 4900,
            currency: 'INR',
            id: 'inv_123',
            payment_id: 'pay_123',
            subscription_id: 'sub_123',
          },
        },
        payment: {
          entity: {
            amount: 4900,
            currency: 'INR',
            id: 'pay_123',
            invoice_id: 'inv_123',
          },
        },
      },
    })
    const signature = await sign('rzp_secret', body)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/razorpay/webhook', {
        body,
        headers: { 'x-razorpay-signature': signature },
        method: 'POST',
      }),
      'razorpay',
      {
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
        DUB_PARTNERS_ENABLED: 'true',
        RAZORPAY_WEBHOOK_SECRET: 'rzp_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: 'invoice.paid:inv_123',
      partnerEvent: {
        amount: 4900,
        currency: 'inr',
        invoiceId: 'inv_123',
        kind: 'sale',
        providerPaymentId: 'pay_123',
        providerSubscriptionId: 'sub_123',
      },
      provider: 'razorpay',
      secret: 'mutation_secret',
    })
  })

  it('maps a signed Stripe paid invoice to a Dub partner sale', async () => {
    const body = JSON.stringify({
      id: 'evt_stripe_1',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_123',
          subscription: 'sub_stripe_123',
          payment_intent: 'pi_123',
          amount_paid: 9900,
          currency: 'USD',
        },
      },
    })
    const signature = await stripeSignature('whsec_test', body)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        body,
        headers: { 'stripe-signature': signature },
        method: 'POST',
      }),
      'stripe',
      {
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
        DUB_PARTNERS_ENABLED: 'true',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: 'invoice.paid:in_123',
      partnerEvent: {
        amount: 9900,
        currency: 'usd',
        invoiceId: 'in_123',
        kind: 'sale',
        providerPaymentId: 'pi_123',
        providerSubscriptionId: 'sub_stripe_123',
      },
      provider: 'stripe',
      secret: 'mutation_secret',
    })
  })

  it('maps a signed Razorpay partial refund with its cumulative remaining amount', async () => {
    const body = JSON.stringify({
      event: 'refund.processed',
      payload: {
        payment: {
          entity: {
            amount: 4900,
            amount_refunded: 1200,
            currency: 'INR',
            id: 'pay_123',
            invoice_id: 'inv_123',
            refund_status: 'partial',
          },
        },
        refund: {
          entity: {
            amount: 1200,
            currency: 'INR',
            id: 'rfnd_123',
            payment_id: 'pay_123',
          },
        },
      },
    })
    const signature = await sign('rzp_secret', body)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/razorpay/webhook', {
        body,
        headers: { 'x-razorpay-signature': signature },
        method: 'POST',
      }),
      'razorpay',
      {
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
        DUB_PARTNERS_ENABLED: 'true',
        RAZORPAY_WEBHOOK_SECRET: 'rzp_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: 'refund.processed:rfnd_123',
      partnerEvent: {
        amount: 1200,
        currency: 'inr',
        invoiceId: 'inv_123',
        kind: 'refund',
        providerPaymentId: 'pay_123',
        remainingAmount: 3700,
        refundId: 'rfnd_123',
      },
      provider: 'razorpay',
      secret: 'mutation_secret',
    })
  })

  it('ignores generic invoices and mismatched Razorpay payment entities', async () => {
    const payloads = [
      {
        event: 'invoice.paid',
        payload: {
          invoice: {
            entity: {
              amount_paid: 4900,
              currency: 'INR',
              id: 'inv_generic',
              payment_id: 'pay_123',
            },
          },
        },
      },
      {
        event: 'refund.processed',
        payload: {
          payment: {
            entity: {
              currency: 'INR',
              id: 'pay_other',
              invoice_id: 'inv_123',
            },
          },
          refund: {
            entity: {
              amount: 4900,
              currency: 'INR',
              id: 'rfnd_mismatch',
              payment_id: 'pay_123',
            },
          },
        },
      },
    ]

    for (const payload of payloads) {
      const body = JSON.stringify(payload)
      const signature = await sign('rzp_secret', body)
      const client = { mutation: vi.fn() }
      const response = await createWebhookApiResponse(
        new Request('https://ship-fast.test/api/razorpay/webhook', {
          body,
          headers: { 'x-razorpay-signature': signature },
          method: 'POST',
        }),
        'razorpay',
        {
          BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
          RAZORPAY_WEBHOOK_SECRET: 'rzp_secret',
        },
        client,
      )

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({
        ignored: true,
        received: true,
      })
      expect(client.mutation).not.toHaveBeenCalled()
    }
  })

  it('returns JSON instead of throwing for a signed malformed webhook body', async () => {
    const body = '{not-json'
    const signature = await stripeSignature('whsec_test', body)
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

  it('returns a stable non-leaking error when a signed webhook cannot be written to Convex', async () => {
    const body = JSON.stringify({
      id: 'evt_write_failure',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_write_failure',
          subscription: 'sub_write_failure',
          client_reference_id: 'user_123',
          mode: 'subscription',
          status: 'active',
          metadata: { userId: 'user_123', tier: 'pro' },
        },
      },
    })
    const signature = await stripeSignature('whsec_test', body)
    const client = {
      mutation: vi
        .fn()
        .mockRejectedValue(
          new Error(
            'Convex billing mutation failed for user_123 with mutation_secret',
          ),
        ),
    }

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
    const result = await response.json()

    expect(response.status).toBe(502)
    expect(result).toEqual({ error: 'Webhook processing failed.' })
    expect(JSON.stringify(result)).not.toContain('mutation_secret')
    expect(JSON.stringify(result)).not.toContain('user_123')
    expect(JSON.stringify(result)).not.toContain('Convex billing mutation')
  })

  it('accepts an event signed by any active secret during a rotation', async () => {
    // Stripe signs with EVERY active endpoint secret while a rotation is in
    // flight, producing `t=..,v1=<old>,v1=<new>`. Parsing the header into an
    // object kept only the last v1, so half the events were rejected.
    const body = JSON.stringify({
      id: 'evt_rotation',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_rotation',
          subscription: 'sub_rotation',
          mode: 'subscription',
          status: 'active',
          metadata: { userId: 'user_rotation', tier: 'pro' },
        },
      },
    })
    const timestamp = currentTimestamp()
    const activeSignature = await sign('whsec_active', `${timestamp}.${body}`)
    const retiredSignature = await sign('whsec_retired', `${timestamp}.${body}`)
    const client = { mutation: vi.fn().mockResolvedValue({ processed: true }) }

    const response = await createWebhookApiResponse(
      new Request('https://ship-fast.test/api/stripe/webhook', {
        method: 'POST',
        headers: {
          // The matching signature is NOT last in the header.
          'stripe-signature': `t=${timestamp},v1=${activeSignature},v1=${retiredSignature}`,
        },
        body,
      }),
      'stripe',
      {
        STRIPE_WEBHOOK_SECRET: 'whsec_active',
        BILLING_WEBHOOK_MUTATION_SECRET: 'mutation_secret',
      },
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledOnce()
  })

  it('ignores Stripe events that are not on the handled list', async () => {
    const body = JSON.stringify({
      id: 'evt_unknown',
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'cs_unknown',
          subscription: 'sub_unknown',
          mode: 'subscription',
          status: 'active',
          metadata: { userId: 'user_unknown', tier: 'pro' },
        },
      },
    })
    const signature = await stripeSignature('whsec_test', body)
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

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      received: true,
      ignored: true,
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('refuses credit-pack grants when the amount paid is below the pack price', async () => {
    const body = JSON.stringify({
      event: 'order.paid',
      id: 'evt_underpaid',
      payload: {
        order: {
          entity: {
            id: 'order_underpaid',
            amount_paid: 100,
            notes: { packId: '10_credits', user_id: 'user_cheap' },
          },
        },
      },
    })
    const signature = await sign('rzp_secret', body)
    const client = { mutation: vi.fn() }

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
        RAZORPAY_CREDITS_10_PAISE: '250000',
      },
      client,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      received: true,
      ignored: true,
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('revokes access on a Stripe refund instead of ignoring it', async () => {
    const body = JSON.stringify({
      id: 'evt_refund',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_1',
          subscription: 'sub_refunded',
          metadata: { userId: 'user_refunded' },
        },
      },
    })
    const signature = await stripeSignature('whsec_test', body)
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
    await expect(response.json()).resolves.toEqual({
      received: true,
      revoked: true,
    })
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: 'mutation_secret',
      provider: 'stripe',
      idempotencyKey: 'revoke:evt_refund',
      providerSubscriptionId: 'sub_refunded',
      userId: 'user_refunded',
      reason: 'charge.refunded',
    })
  })

  it('revokes access when a Razorpay subscription is halted', async () => {
    const body = JSON.stringify({
      event: 'subscription.halted',
      id: 'evt_halted',
      payload: {
        subscription: {
          entity: {
            id: 'sub_halted',
            status: 'halted',
            notes: { userId: 'user_halted' },
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
      idempotencyKey: 'revoke:evt_halted',
      providerSubscriptionId: 'sub_halted',
      userId: 'user_halted',
      reason: 'subscription.halted',
    })
  })

  it('still applies billing state when the Dub partner path also matches', async () => {
    // The partner mutation used to `return` early, so with partner attribution
    // enabled an invoice.paid never reached applyBillingWebhook and the
    // customer's own subscription was never written.
    const body = JSON.stringify({
      id: 'evt_partner_and_billing',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_1',
          subscription: 'sub_partner',
          amount_paid: 99900,
          currency: 'usd',
          payment_intent: 'pi_1',
          status: 'active',
          metadata: { userId: 'user_partner', tier: 'pro' },
        },
      },
    })
    const signature = await stripeSignature('whsec_test', body)
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
        DUB_PARTNERS_ENABLED: 'true',
      },
      client,
      async () => ({ applied: false, reason: 'noop' }),
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledTimes(2)
    const mutatedArgs = client.mutation.mock.calls.map((call) => call[1])
    expect(mutatedArgs.some((args) => 'partnerEvent' in args)).toBe(true)
    expect(mutatedArgs.some((args) => 'subscription' in args)).toBe(true)
  })
})
