/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const secret = 'release-billing-secret'

async function billingRows(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const credits = await ctx.db.query('customerCredits').collect()
    const ledger = await ctx.db.query('creditLedger').collect()
    const subscriptions = await ctx.db.query('subscriptions').collect()
    const webhooks = await ctx.db.query('webhookEvents').collect()
    return {
      credits: credits.map((row) => ({
        remaining: row.remaining,
        userId: row.userId,
      })),
      ledger: ledger.map((row) => ({
        amount: row.amount,
        balanceAfter: row.balanceAfter,
        userId: row.userId,
      })),
      subscriptions: subscriptions.map((row) => ({
        planId: row.planId,
        provider: row.provider,
        providerSubscriptionId: row.providerSubscriptionId ?? null,
        status: row.status,
        userId: row.userId,
      })),
      webhooks: webhooks.map((row) => ({
        idempotencyKey: row.idempotencyKey,
        provider: row.provider,
      })),
    }
  })
}

describe('billing webhook validation and ownership boundaries', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', secret)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects an event with no subscription or positive credit grant', async () => {
    const t = convexTest(schema, modules)
    const result = await Promise.allSettled([
      t.mutation(api.billing.applyBillingWebhook, {
        secret,
        provider: 'stripe',
        idempotencyKey: 'empty-event',
        userId: 'empty-event-user',
      }),
    ])

    expect({
      mutation: result.map((entry) => entry.status),
      rows: await billingRows(t),
    }).toEqual({
      mutation: ['rejected'],
      rows: { credits: [], ledger: [], subscriptions: [], webhooks: [] },
    })
  })

  it('rejects zero and negative credit grants atomically', async () => {
    const zero = convexTest(schema, modules)
    const negative = convexTest(schema, modules)
    const results = await Promise.all([
      Promise.allSettled([
        zero.mutation(api.billing.applyBillingWebhook, {
          secret,
          provider: 'razorpay',
          idempotencyKey: 'zero-credit-event',
          userId: 'zero-credit-user',
          credits: 0,
        }),
      ]),
      Promise.allSettled([
        negative.mutation(api.billing.applyBillingWebhook, {
          secret,
          provider: 'razorpay',
          idempotencyKey: 'negative-credit-event',
          userId: 'negative-credit-user',
          credits: -5,
        }),
      ]),
    ])

    expect({
      mutations: results.flat().map((entry) => entry.status),
      negative: await billingRows(negative),
      zero: await billingRows(zero),
    }).toEqual({
      mutations: ['rejected', 'rejected'],
      negative: {
        credits: [],
        ledger: [],
        subscriptions: [],
        webhooks: [],
      },
      zero: { credits: [], ledger: [], subscriptions: [], webhooks: [] },
    })
  })

  it('rejects blank durable provider identifiers', async () => {
    const t = convexTest(schema, modules)
    const result = await Promise.allSettled([
      t.mutation(api.billing.applyBillingWebhook, {
        secret,
        provider: 'stripe',
        idempotencyKey: 'blank-provider-subscription',
        userId: 'blank-provider-user',
        subscription: {
          status: 'active',
          planId: 'pro',
          providerSubscriptionId: '   ',
        },
      }),
    ])

    expect({
      mutation: result.map((entry) => entry.status),
      rows: await billingRows(t),
    }).toEqual({
      mutation: ['rejected'],
      rows: { credits: [], ledger: [], subscriptions: [], webhooks: [] },
    })
  })

  it('does not reassign an existing provider subscription to another user', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.billing.applyBillingWebhook, {
      secret,
      provider: 'stripe',
      idempotencyKey: 'owner-created-event',
      userId: 'original-owner',
      subscription: {
        status: 'active',
        planId: 'pro',
        providerSubscriptionId: 'sub-owned',
      },
    })

    const conflicting = await Promise.allSettled([
      t.mutation(api.billing.applyBillingWebhook, {
        secret,
        provider: 'stripe',
        idempotencyKey: 'foreign-cancel-event',
        userId: 'different-owner',
        subscription: {
          status: 'cancelled',
          planId: 'pro',
          providerSubscriptionId: 'sub-owned',
        },
      }),
    ])

    expect({
      mutation: conflicting.map((entry) => entry.status),
      rows: await billingRows(t),
    }).toEqual({
      mutation: ['rejected'],
      rows: {
        credits: [],
        ledger: [],
        subscriptions: [
          {
            planId: 'pro',
            provider: 'stripe',
            providerSubscriptionId: 'sub-owned',
            status: 'active',
            userId: 'original-owner',
          },
        ],
        webhooks: [
          { idempotencyKey: 'owner-created-event', provider: 'stripe' },
        ],
      },
    })
  })
})
