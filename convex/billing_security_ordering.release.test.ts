/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

async function settlement(promise: Promise<unknown>) {
  try {
    await promise
    return 'fulfilled'
  } catch {
    return 'rejected'
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('billing authorization and event integrity', () => {
  it('rejects anonymous reads keyed by an arbitrary user id', async () => {
    const t = convexTest(schema, modules)
    const victimUserId = `${issuer}|victim`
    const results = await Promise.allSettled([
      t.query(api.billing.hasActiveSubscription, { userId: victimUserId }),
      t.query(api.billing.getUserCredits, { userId: victimUserId }),
      t.query(api.billing.getCreditLedger, {
        userId: victimUserId,
        limit: 10,
      }),
    ])

    expect(results.map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ])
  })

  it('rejects authenticated reads keyed by another user id', async () => {
    const t = convexTest(schema, modules)
    const victimUserId = `${issuer}|victim`
    const attacker = asUser(t, 'attacker')
    const results = await Promise.allSettled([
      attacker.query(api.billing.hasActiveSubscription, {
        userId: victimUserId,
      }),
      attacker.query(api.billing.getUserCredits, { userId: victimUserId }),
      attacker.query(api.billing.getCreditLedger, {
        userId: victimUserId,
        limit: 10,
      }),
    ])

    expect(results.map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ])
  })

  it('scopes provider subscription ids by payment provider', async () => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', 'release-secret')
    const t = convexTest(schema, modules)
    const providerSubscriptionId = 'shared-provider-subscription-id'

    await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'release-secret',
      provider: 'stripe',
      idempotencyKey: 'stripe-event',
      userId: 'stripe-user',
      subscription: {
        status: 'active',
        planId: 'stripe-pro',
        providerSubscriptionId,
      },
    })
    await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'release-secret',
      provider: 'razorpay',
      idempotencyKey: 'razorpay-event',
      userId: 'razorpay-user',
      subscription: {
        status: 'active',
        planId: 'razorpay-pro',
        providerSubscriptionId,
      },
    })

    const rows = await t.run(
      async (ctx) =>
        await ctx.db
          .query('subscriptions')
          .withIndex('by_providerSubscriptionId', (index) =>
            index.eq('providerSubscriptionId', providerSubscriptionId),
          )
          .collect(),
    )

    expect(
      rows.map((row) => ({
        planId: row.planId,
        provider: row.provider,
        userId: row.userId,
      })),
    ).toEqual([
      {
        planId: 'stripe-pro',
        provider: 'stripe',
        userId: 'stripe-user',
      },
      {
        planId: 'razorpay-pro',
        provider: 'razorpay',
        userId: 'razorpay-user',
      },
    ])
  })

  it('rejects fractional credit purchases atomically', async () => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', 'release-secret')
    const t = convexTest(schema, modules)
    const userId = 'fractional-credit-user'
    const idempotencyKey = 'fractional-credit-event'

    const outcome = await settlement(
      t.mutation(api.billing.applyBillingWebhook, {
        secret: 'release-secret',
        provider: 'stripe',
        idempotencyKey,
        userId,
        credits: 1.5,
      }),
    )
    const state = await t.run(async (ctx) => {
      const credits = await ctx.db
        .query('customerCredits')
        .withIndex('by_userId', (index) => index.eq('userId', userId))
        .first()
      const ledger = await ctx.db
        .query('creditLedger')
        .withIndex('by_userId', (index) => index.eq('userId', userId))
        .collect()
      const webhook = await ctx.db
        .query('webhookEvents')
        .withIndex('by_provider_idempotencyKey', (index) =>
          index.eq('provider', 'stripe').eq('idempotencyKey', idempotencyKey),
        )
        .first()
      return {
        credits: credits?.remaining ?? null,
        ledgerEntries: ledger.length,
        webhookRecorded: webhook !== null,
      }
    })

    expect({ outcome, state }).toEqual({
      outcome: 'rejected',
      state: {
        credits: null,
        ledgerEntries: 0,
        webhookRecorded: false,
      },
    })
  })
})
