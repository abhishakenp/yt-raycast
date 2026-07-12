import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  qualifyReferralOnPayment,
  refreshReferralReward,
} from './referral_qualification'
import {
  REFERRAL_DISCOUNT_PERCENT,
  REFERRAL_THRESHOLD,
} from './referral_helpers'

type ReferralDoc = Doc<'referrals'>
type ReferralRewardDoc = Doc<'referralRewards'>

function referralId(suffix: string) {
  return `ref_${suffix}` as Id<'referrals'>
}
function rewardId(suffix: string) {
  return `reward_${suffix}` as Id<'referralRewards'>
}

function referralDoc(
  overrides: Partial<ReferralDoc> & {
    referrerUserId: string
    referredUserId: string
  },
): ReferralDoc {
  return {
    _id: referralId(`${overrides.referredUserId}`),
    _creationTime: 1,
    code: 'TESTCODE',
    status: 'pending',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function rewardDoc(
  overrides: Partial<ReferralRewardDoc> & { userId: string },
): ReferralRewardDoc {
  return {
    _id: rewardId(overrides.userId),
    _creationTime: 1,
    unlocked: false,
    qualifiedCount: 0,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
    updatedAt: 1,
    ...overrides,
  }
}

/**
 * Build a mock MutationCtx that supports the db operations used by the
 * referral qualification helpers: query().withIndex().collect()/first(),
 * insert(), and patch().
 */
function mockCtx(input: {
  referrals?: ReferralDoc[]
  rewards?: ReferralRewardDoc[]
}) {
  const referrals = [...(input.referrals ?? [])]
  const rewards = [...(input.rewards ?? [])]
  const inserts: Array<{ table: string; doc: Record<string, unknown> }> = []
  const patches: Array<{ id: string; patch: Record<string, unknown> }> = []

  const db = {
    get: async () => null,
    query: (table) => {
      const rows =
        table === 'referrals'
          ? (referrals as Array<Record<string, unknown>>)
          : (rewards as Array<Record<string, unknown>>)

      const builder = {
        withIndex: (_indexName, applyIndex) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field, value) => {
              filters.set(field, value)
              return index
            },
          }
          applyIndex(index)

          const filtered = rows.filter((row) =>
            Array.from(filters.entries()).every(
              ([field, value]) => row[field] === value,
            ),
          )
          return {
            collect: async () => filtered,
            first: async () => filtered[0] ?? null,
          }
        },
      }
      return builder
    },
    insert: async (table, doc) => {
      inserts.push({ table, doc })
      if (table === 'referralRewards') {
        rewards.push(doc as ReferralRewardDoc)
      }
      return `inserted_${table}_${rewards.length}` as Id<'referralRewards'>
    },
    patch: async (id, patch) => {
      patches.push({ id, patch })
      // Apply the patch to the in-memory store so subsequent reads see it.
      const reward = rewards.find((r) => r._id === id)
      if (reward !== undefined) Object.assign(reward, patch)
      const referral = referrals.find((r) => r._id === id)
      if (referral !== undefined) Object.assign(referral, patch)
    },
  } as unknown as MutationCtx['db']

  const ctx = { db } as unknown as MutationCtx

  return { ctx, referrals, rewards, inserts, patches }
}

const REFERRER = 'user_alice'

describe('refreshReferralReward', () => {
  it('creates a new reward document when none exists and count is below threshold', async () => {
    const { ctx, inserts, patches } = mockCtx({ referrals: [] })

    const result = await refreshReferralReward(ctx, REFERRER)

    expect(result).toEqual({
      referrerUserId: REFERRER,
      justUnlocked: false,
      qualifiedCount: 0,
    })
    expect(patches).toHaveLength(0)
    expect(inserts).toHaveLength(1)
    expect(inserts[0].table).toBe('referralRewards')
    expect(inserts[0].doc).toMatchObject({
      userId: REFERRER,
      unlocked: false,
      unlockedAt: undefined,
      qualifiedCount: 0,
      discountPercent: REFERRAL_DISCOUNT_PERCENT,
    })
  })

  it('creates a new reward and unlocks immediately when count meets threshold', async () => {
    const qualifiedReferrals = Array.from(
      { length: REFERRAL_THRESHOLD },
      (_, i) =>
        referralDoc({
          referrerUserId: REFERRER,
          referredUserId: `user_${i}`,
          status: 'qualified',
        }),
    )
    const { ctx, inserts, patches } = mockCtx({
      referrals: qualifiedReferrals,
    })

    const result = await refreshReferralReward(ctx, REFERRER)

    expect(result).toEqual({
      referrerUserId: REFERRER,
      justUnlocked: true,
      qualifiedCount: REFERRAL_THRESHOLD,
    })
    expect(patches).toHaveLength(0)
    expect(inserts).toHaveLength(1)
    expect(inserts[0].doc).toMatchObject({
      userId: REFERRER,
      unlocked: true,
      qualifiedCount: REFERRAL_THRESHOLD,
    })
    // unlockedAt should be set (a number) when unlocked.
    expect(inserts[0].doc.unlockedAt).toEqual(expect.any(Number))
  })

  it('patches an existing reward document instead of inserting', async () => {
    const existing = rewardDoc({
      userId: REFERRER,
      unlocked: false,
      qualifiedCount: 0,
    })
    const qualifiedReferrals = [
      referralDoc({
        referrerUserId: REFERRER,
        referredUserId: 'user_bob',
        status: 'qualified',
      }),
    ]
    const { ctx, inserts, patches } = mockCtx({
      referrals: qualifiedReferrals,
      rewards: [existing],
    })

    const result = await refreshReferralReward(ctx, REFERRER)

    expect(result).toEqual({
      referrerUserId: REFERRER,
      justUnlocked: false,
      qualifiedCount: 1,
    })
    expect(inserts).toHaveLength(0)
    expect(patches).toHaveLength(1)
    expect(patches[0].id).toBe(existing._id)
    expect(patches[0].patch).toMatchObject({
      unlocked: false,
      qualifiedCount: 1,
    })
  })

  it('fires justUnlocked on the transition from locked to unlocked via patch', async () => {
    const existing = rewardDoc({
      userId: REFERRER,
      unlocked: false,
      qualifiedCount: 1,
    })
    const qualifiedReferrals = Array.from(
      { length: REFERRAL_THRESHOLD },
      (_, i) =>
        referralDoc({
          referrerUserId: REFERRER,
          referredUserId: `user_${i}`,
          status: 'qualified',
        }),
    )
    const { ctx, patches } = mockCtx({
      referrals: qualifiedReferrals,
      rewards: [existing],
    })

    const result = await refreshReferralReward(ctx, REFERRER)

    expect(result.justUnlocked).toBe(true)
    expect(result.qualifiedCount).toBe(REFERRAL_THRESHOLD)
    expect(patches[0].patch).toMatchObject({
      unlocked: true,
      qualifiedCount: REFERRAL_THRESHOLD,
    })
  })

  it('keeps the reward unlocked (monotonic) when count drops below threshold', async () => {
    const existing = rewardDoc({
      userId: REFERRER,
      unlocked: true,
      unlockedAt: 1000,
      qualifiedCount: REFERRAL_THRESHOLD,
    })
    // Count is now 0 (no qualified referrals), but unlock is permanent.
    const { ctx, patches } = mockCtx({
      referrals: [],
      rewards: [existing],
    })

    const result = await refreshReferralReward(ctx, REFERRER)

    expect(result.justUnlocked).toBe(false)
    expect(result.qualifiedCount).toBe(0)
    expect(patches[0].patch).toMatchObject({
      unlocked: true,
      qualifiedCount: 0,
    })
    // Preserves the original unlockedAt.
    expect(patches[0].patch.unlockedAt).toBe(1000)
  })

  it('preserves an existing non-zero discountPercent on patch', async () => {
    const existing = rewardDoc({
      userId: REFERRER,
      unlocked: false,
      qualifiedCount: 0,
      discountPercent: 25,
    })
    const qualifiedReferrals = [
      referralDoc({
        referrerUserId: REFERRER,
        referredUserId: 'user_bob',
        status: 'qualified',
      }),
    ]
    const { ctx, patches } = mockCtx({
      referrals: qualifiedReferrals,
      rewards: [existing],
    })

    await refreshReferralReward(ctx, REFERRER)

    expect(patches[0].patch.discountPercent).toBe(25)
  })

  it('falls back to the default discountPercent when existing value is 0', async () => {
    const existing = rewardDoc({
      userId: REFERRER,
      unlocked: false,
      qualifiedCount: 0,
      discountPercent: 0,
    })
    const { ctx, patches } = mockCtx({
      referrals: [],
      rewards: [existing],
    })

    await refreshReferralReward(ctx, REFERRER)

    expect(patches[0].patch.discountPercent).toBe(REFERRAL_DISCOUNT_PERCENT)
  })
})

describe('qualifyReferralOnPayment', () => {
  it('returns null when no referral is found for the payer', async () => {
    const { ctx, patches } = mockCtx({ referrals: [] })

    const result = await qualifyReferralOnPayment(ctx, 'user_nobody')

    expect(result).toBeNull()
    expect(patches).toHaveLength(0)
  })

  it('returns null when the referral is already qualified (idempotent)', async () => {
    const existing = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_bob',
      status: 'qualified',
      paidAt: 500,
    })
    const { ctx, patches } = mockCtx({ referrals: [existing] })

    const result = await qualifyReferralOnPayment(ctx, 'user_bob')

    expect(result).toBeNull()
    expect(patches).toHaveLength(0)
  })

  it('returns null when the referral is already disqualified (idempotent)', async () => {
    const existing = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_bob',
      status: 'disqualified',
    })
    const { ctx, patches } = mockCtx({ referrals: [existing] })

    const result = await qualifyReferralOnPayment(ctx, 'user_bob')

    expect(result).toBeNull()
    expect(patches).toHaveLength(0)
  })

  it('disqualifies a disposable-email referral and returns null', async () => {
    const existing = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_burner',
      status: 'pending',
      emailDisposable: true,
    })
    const { ctx, patches } = mockCtx({ referrals: [existing] })

    const result = await qualifyReferralOnPayment(ctx, 'user_burner')

    expect(result).toBeNull()
    expect(patches).toHaveLength(1)
    expect(patches[0].id).toBe(existing._id)
    expect(patches[0].patch).toMatchObject({ status: 'disqualified' })
  })

  it('qualifies a pending referral and patches it with paidAt', async () => {
    const existing = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_bob',
      status: 'pending',
    })
    const { ctx, patches } = mockCtx({ referrals: [existing] })

    // Count is 1 — below threshold, so justUnlocked is false → result is null.
    const result = await qualifyReferralOnPayment(ctx, 'user_bob')

    expect(result).toBeNull()
    // The referral itself was patched to qualified.
    const referralPatch = patches.find((p) => p.id === existing._id)
    expect(referralPatch).toBeDefined()
    expect(referralPatch!.patch).toMatchObject({
      status: 'qualified',
      paidAt: expect.any(Number),
    })
  })

  it('returns the result only when the referrer just unlocked (threshold met)', async () => {
    // First referral already qualified (count = 1, not unlocked).
    const firstQualified = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_first',
      status: 'qualified',
      paidAt: 100,
    })
    // Second referral still pending — paying this one triggers the unlock.
    const secondPending = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_second',
      status: 'pending',
    })
    // Existing reward at count=1, locked.
    const existingReward = rewardDoc({
      userId: REFERRER,
      unlocked: false,
      qualifiedCount: 1,
    })
    const { ctx, patches } = mockCtx({
      referrals: [firstQualified, secondPending],
      rewards: [existingReward],
    })

    const result = await qualifyReferralOnPayment(ctx, 'user_second')

    expect(result).not.toBeNull()
    expect(result).toEqual({
      referrerUserId: REFERRER,
      justUnlocked: true,
      qualifiedCount: REFERRAL_THRESHOLD,
    })

    // The pending referral was patched to qualified.
    const referralPatch = patches.find((p) => p.id === secondPending._id)
    expect(referralPatch!.patch).toMatchObject({ status: 'qualified' })

    // The reward was patched to unlocked.
    const rewardPatch = patches.find((p) => p.id === existingReward._id)
    expect(rewardPatch).toBeDefined()
    expect(rewardPatch!.patch).toMatchObject({
      unlocked: true,
      qualifiedCount: REFERRAL_THRESHOLD,
    })
  })

  it('returns null when qualifying does not cross the unlock threshold', async () => {
    const pending = referralDoc({
      referrerUserId: REFERRER,
      referredUserId: 'user_solo',
      status: 'pending',
    })
    const { ctx } = mockCtx({ referrals: [pending] })

    const result = await qualifyReferralOnPayment(ctx, 'user_solo')

    // Only 1 qualified referral — below threshold of 2.
    expect(result).toBeNull()
  })
})
