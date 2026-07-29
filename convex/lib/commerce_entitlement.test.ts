import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import schema from '../schema'
import {
  getCommerceEntitlementForUser,
  isSubscriptionEntitled,
} from './commerce_entitlement'

const modules = import.meta.glob('../**/*.ts')

describe('isSubscriptionEntitled', () => {
  it('is entitled while now is before currentPeriodEnd, even when status is cancelled', () => {
    const now = 1_000_000
    expect(
      isSubscriptionEntitled(
        { status: 'cancelled', currentPeriodEnd: now + 1 },
        now,
      ),
    ).toBe(true)
  })

  it('is not entitled once now reaches currentPeriodEnd', () => {
    const now = 1_000_000
    expect(
      isSubscriptionEntitled(
        { status: 'active', currentPeriodEnd: now },
        now,
      ),
    ).toBe(false)
    expect(
      isSubscriptionEntitled(
        { status: 'active', currentPeriodEnd: now - 1 },
        now,
      ),
    ).toBe(false)
  })

  it('falls back to status when currentPeriodEnd is absent', () => {
    const now = 1_000_000
    expect(
      isSubscriptionEntitled({ status: 'active', currentPeriodEnd: undefined }, now),
    ).toBe(true)
    expect(
      isSubscriptionEntitled(
        { status: 'cancelled', currentPeriodEnd: undefined },
        now,
      ),
    ).toBe(false)
  })
})

describe('getCommerceEntitlementForUser', () => {
  it('entitles a user whose subscription is scheduled to cancel but has not reached period end', async () => {
    const t = convexTest(schema, modules)
    const userId = 'commerce-entitlement-user-1'
    const now = 2_000_000
    await t.run(async (ctx) => {
      await ctx.db.insert('subscriptions', {
        userId,
        provider: 'stripe',
        status: 'cancelled',
        planId: 'pro',
        providerSubscriptionId: 'sub_scheduled_cancel',
        createdAt: now - 1000,
        updatedAt: now - 1000,
        canceledAt: now - 1000,
        currentPeriodEnd: now + 86_400_000,
        cancelAtPeriodEnd: true,
      })
    })

    const result = await t.run((ctx) =>
      getCommerceEntitlementForUser(ctx, userId, now),
    )

    expect(result.entitled).toBe(true)
    expect(result.subscription?.providerSubscriptionId).toBe(
      'sub_scheduled_cancel',
    )
  })

  it('revokes entitlement once the paid period actually ends', async () => {
    const t = convexTest(schema, modules)
    const userId = 'commerce-entitlement-user-2'
    const now = 2_000_000
    await t.run(async (ctx) => {
      await ctx.db.insert('subscriptions', {
        userId,
        provider: 'stripe',
        status: 'cancelled',
        planId: 'pro',
        providerSubscriptionId: 'sub_expired',
        createdAt: now - 1000,
        updatedAt: now - 1000,
        canceledAt: now - 1000,
        currentPeriodEnd: now - 1,
        cancelAtPeriodEnd: true,
      })
    })

    const result = await t.run((ctx) =>
      getCommerceEntitlementForUser(ctx, userId, now),
    )

    expect(result.entitled).toBe(false)
    expect(result.subscription).toBeNull()
  })

  it('returns not entitled for a user with no subscription rows', async () => {
    const t = convexTest(schema, modules)
    const result = await t.run((ctx) =>
      getCommerceEntitlementForUser(ctx, 'commerce-entitlement-user-none', 0),
    )

    expect(result).toEqual({ entitled: false, subscription: null })
  })
})
