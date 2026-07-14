/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const secret = 'release-referral-secret'

type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'authenticated'
  | 'past_due'
  | 'cancelled'

async function insertSubscription(
  t: ReturnType<typeof convexTest>,
  userId: string,
  providerSubscriptionId: string,
  status: SubscriptionStatus,
) {
  return await t.run(async (ctx) => {
    const now = Date.now()
    return await ctx.db.insert('subscriptions', {
      userId,
      provider: 'stripe',
      status,
      planId: 'pro',
      providerSubscriptionId,
      createdAt: now,
      updatedAt: now,
    })
  })
}

async function insertReward(
  t: ReturnType<typeof convexTest>,
  userId: string,
  unlocked: boolean,
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('referralRewards', {
      userId,
      unlocked,
      qualifiedCount: unlocked ? 2 : 1,
      discountPercent: 50,
      updatedAt: Date.now(),
    })
  })
}

async function discountState(
  t: ReturnType<typeof convexTest>,
  rewardId: Id<'referralRewards'> | null,
  subscriptionId: Id<'subscriptions'>,
) {
  return await t.run(async (ctx) => {
    const reward = rewardId === null ? null : await ctx.db.get(rewardId)
    const subscription = await ctx.db.get(subscriptionId)
    return {
      reward:
        reward === null
          ? null
          : {
              appliedAt: reward.discountAppliedAt ?? null,
              provider: reward.discountProvider ?? null,
              providerId: reward.discountProviderId ?? null,
              subscriptionId: reward.discountSubscriptionId ?? null,
            },
      subscription:
        subscription === null
          ? null
          : {
              appliedAt: subscription.referralDiscountAppliedAt ?? null,
              percent: subscription.referralDiscountPercent ?? null,
              providerId: subscription.referralDiscountProviderId ?? null,
            },
    }
  })
}

async function applyDiscount(
  t: ReturnType<typeof convexTest>,
  userId: string,
  provider: 'stripe' | 'razorpay',
  subscriptionId: string,
) {
  return await Promise.allSettled([
    t.mutation(api.referrals.markReferralDiscountApplied, {
      secret,
      userId,
      provider,
      providerDiscountId: 'release-referral-50',
      subscriptionId,
    }),
  ])
}

describe('referral discount persistence integrity', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', secret)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects applying a discount while the reward remains locked', async () => {
    const t = convexTest(schema, modules)
    const rewardId = await insertReward(t, 'locked-user', false)
    const subscriptionId = await insertSubscription(
      t,
      'locked-user',
      'sub-locked',
      'active',
    )

    const result = await applyDiscount(t, 'locked-user', 'stripe', 'sub-locked')

    expect({
      mutation: result.map((entry) => entry.status),
      state: await discountState(t, rewardId, subscriptionId),
    }).toEqual({
      mutation: ['rejected'],
      state: {
        reward: {
          appliedAt: null,
          provider: null,
          providerId: null,
          subscriptionId: null,
        },
        subscription: { appliedAt: null, percent: null, providerId: null },
      },
    })
  })

  it('rejects applying a discount when no reward exists', async () => {
    const t = convexTest(schema, modules)
    const subscriptionId = await insertSubscription(
      t,
      'missing-reward-user',
      'sub-missing-reward',
      'active',
    )

    const result = await applyDiscount(
      t,
      'missing-reward-user',
      'stripe',
      'sub-missing-reward',
    )

    expect({
      mutation: result.map((entry) => entry.status),
      state: await discountState(t, null, subscriptionId),
    }).toEqual({
      mutation: ['rejected'],
      state: {
        reward: null,
        subscription: { appliedAt: null, percent: null, providerId: null },
      },
    })
  })

  it('rejects a subscription owned by a different user atomically', async () => {
    const t = convexTest(schema, modules)
    const rewardId = await insertReward(t, 'reward-owner', true)
    const subscriptionId = await insertSubscription(
      t,
      'different-owner',
      'sub-different-owner',
      'active',
    )

    const result = await applyDiscount(
      t,
      'reward-owner',
      'stripe',
      'sub-different-owner',
    )

    expect({
      mutation: result.map((entry) => entry.status),
      state: await discountState(t, rewardId, subscriptionId),
    }).toEqual({
      mutation: ['rejected'],
      state: {
        reward: {
          appliedAt: null,
          provider: null,
          providerId: null,
          subscriptionId: null,
        },
        subscription: { appliedAt: null, percent: null, providerId: null },
      },
    })
  })

  it('rejects a provider that does not own the subscription', async () => {
    const t = convexTest(schema, modules)
    const rewardId = await insertReward(t, 'provider-user', true)
    const subscriptionId = await insertSubscription(
      t,
      'provider-user',
      'sub-provider',
      'active',
    )

    const result = await applyDiscount(
      t,
      'provider-user',
      'razorpay',
      'sub-provider',
    )

    expect({
      mutation: result.map((entry) => entry.status),
      state: await discountState(t, rewardId, subscriptionId),
    }).toEqual({
      mutation: ['rejected'],
      state: {
        reward: {
          appliedAt: null,
          provider: null,
          providerId: null,
          subscriptionId: null,
        },
        subscription: { appliedAt: null, percent: null, providerId: null },
      },
    })
  })

  it('rejects applying the reward to an inactive subscription', async () => {
    const t = convexTest(schema, modules)
    const rewardId = await insertReward(t, 'cancelled-user', true)
    const subscriptionId = await insertSubscription(
      t,
      'cancelled-user',
      'sub-cancelled',
      'cancelled',
    )

    const result = await applyDiscount(
      t,
      'cancelled-user',
      'stripe',
      'sub-cancelled',
    )

    expect({
      mutation: result.map((entry) => entry.status),
      state: await discountState(t, rewardId, subscriptionId),
    }).toEqual({
      mutation: ['rejected'],
      state: {
        reward: {
          appliedAt: null,
          provider: null,
          providerId: null,
          subscriptionId: null,
        },
        subscription: { appliedAt: null, percent: null, providerId: null },
      },
    })
  })
})
