/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ISSUER = 'https://clerk.test'

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer: ISSUER,
    subject: userId,
    tokenIdentifier: `${ISSUER}|${userId}`,
  })
}

function subscriptionArgs(
  userId: string,
  providerSubscriptionId: string,
  status: 'active' | 'trialing' | 'authenticated' | 'past_due' | 'cancelled',
) {
  return {
    userId,
    provider: 'stripe' as const,
    status,
    planId: 'pro',
    providerSubscriptionId,
  }
}

describe('billing read and internal mutation contracts', () => {
  it('rejects unauthenticated self-service billing reads', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.billing.getSubscriptionStatus),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'UNAUTHENTICATED' }),
    })
    await expect(t.query(api.billing.getCreditBalance)).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'UNAUTHENTICATED' }),
    })
    await expect(t.query(api.billing.getBillingOverview)).rejects.toMatchObject(
      {
        data: expect.objectContaining({ code: 'UNAUTHENTICATED' }),
      },
    )
  })

  it('returns a locked empty overview for a new authenticated user', async () => {
    const t = convexTest(schema, modules)
    const userId = `${ISSUER}|new-user`
    const authed = asUser(t, 'new-user')

    await expect(
      authed.query(api.billing.getSubscriptionStatus),
    ).resolves.toEqual({
      active: false,
      status: null,
      provider: null,
      planId: null,
      updatedAt: null,
    })
    await expect(authed.query(api.billing.getCreditBalance)).resolves.toEqual({
      remaining: 0,
    })
    await expect(authed.query(api.billing.getBillingOverview)).resolves.toEqual(
      {
        userId,
        subscription: {
          active: false,
          status: null,
          provider: null,
          planId: null,
        },
        credits: { remaining: 0 },
        exportAccess: {
          unlocked: false,
          viaSubscription: false,
          viaCredits: false,
        },
        generationQuota: {
          activeSubscriptionCount: 0,
          canRenew: false,
          exhausted: false,
          limit: 10,
          remaining: 10,
          used: 0,
        },
      },
    )
  })

  it('adds credits cumulatively and unlocks export access via credits', async () => {
    const t = convexTest(schema, modules)
    const userId = `${ISSUER}|credit-user`

    await expect(
      t.mutation(internal.billing.addCreditsForUser, { userId, amount: 2 }),
    ).resolves.toMatchObject({ remaining: 2 })
    await expect(
      t.mutation(internal.billing.addCreditsForUser, { userId, amount: 3 }),
    ).resolves.toMatchObject({ remaining: 5 })
    await expect(
      t.mutation(internal.billing.addCreditsForUser, { userId, amount: 0 }),
    ).resolves.toEqual({ remaining: 5 })

    await expect(
      asUser(t, 'credit-user').query(api.billing.getBillingOverview),
    ).resolves.toMatchObject({
      credits: { remaining: 5 },
      exportAccess: {
        unlocked: true,
        viaSubscription: false,
        viaCredits: true,
      },
    })
  })

  it.each(['active', 'trialing', 'authenticated'] as const)(
    'treats %s subscriptions as active',
    async (status) => {
      const t = convexTest(schema, modules)
      const userId = `active-${status}`

      await t.mutation(
        internal.billing.upsertSubscriptionForUser,
        subscriptionArgs(userId, `sub-${status}`, status),
      )

      await expect(
        t.query(api.billing.hasActiveSubscription, { userId }),
      ).resolves.toBe(true)
    },
  )

  it.each(['past_due', 'cancelled'] as const)(
    'does not grant subscription access for %s subscriptions',
    async (status) => {
      const t = convexTest(schema, modules)
      const userId = `inactive-${status}`

      await t.mutation(
        internal.billing.upsertSubscriptionForUser,
        subscriptionArgs(userId, `sub-${status}`, status),
      )

      await expect(
        t.query(api.billing.hasActiveSubscription, { userId }),
      ).resolves.toBe(false)
    },
  )

  it('updates an existing provider subscription instead of duplicating it', async () => {
    const t = convexTest(schema, modules)
    const providerSubscriptionId = 'sub-upsert'

    await t.mutation(
      internal.billing.upsertSubscriptionForUser,
      subscriptionArgs('first-owner', providerSubscriptionId, 'active'),
    )
    await t.mutation(internal.billing.upsertSubscriptionForUser, {
      ...subscriptionArgs('second-owner', providerSubscriptionId, 'cancelled'),
      planId: 'enterprise',
    })

    const subscriptions = await t.run(async (ctx) =>
      ctx.db
        .query('subscriptions')
        .withIndex('by_providerSubscriptionId', (index) =>
          index.eq('providerSubscriptionId', providerSubscriptionId),
        )
        .collect(),
    )

    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]).toMatchObject({
      userId: 'second-owner',
      status: 'cancelled',
      planId: 'enterprise',
    })
    expect(subscriptions[0]?.canceledAt).toEqual(expect.any(Number))
  })

  it('rejects export credit consumption when no balance remains', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(internal.billing.consumeCreditForExport, {
        userId: 'no-credit-user',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'INSUFFICIENT_CREDITS' }),
    })
  })

  it('scopes webhook idempotency keys by provider', async () => {
    const t = convexTest(schema, modules)
    const idempotencyKey = 'shared-provider-event-id'

    await expect(
      t.mutation(internal.billing.recordWebhookEvent, {
        provider: 'stripe',
        idempotencyKey,
      }),
    ).resolves.toEqual({ inserted: true })
    await expect(
      t.mutation(internal.billing.recordWebhookEvent, {
        provider: 'stripe',
        idempotencyKey,
      }),
    ).resolves.toEqual({ inserted: false })
    await expect(
      t.mutation(internal.billing.recordWebhookEvent, {
        provider: 'razorpay',
        idempotencyKey,
      }),
    ).resolves.toEqual({ inserted: true })
  })

  it('finds an active subscription after more than twenty older inactive rows', async () => {
    const t = convexTest(schema, modules)
    const userId = 'long-subscription-history-user'

    for (let index = 0; index < 20; index += 1) {
      await t.mutation(
        internal.billing.upsertSubscriptionForUser,
        subscriptionArgs(userId, `sub-cancelled-${index}`, 'cancelled'),
      )
    }
    await t.mutation(
      internal.billing.upsertSubscriptionForUser,
      subscriptionArgs(userId, 'sub-current-active', 'active'),
    )

    await expect(
      t.query(api.billing.hasActiveSubscription, { userId }),
    ).resolves.toBe(true)
  })
})
