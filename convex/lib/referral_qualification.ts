import type { MutationCtx } from '../_generated/server'
import {
  computeRewardState,
  REFERRAL_DISCOUNT_PERCENT,
} from './referral_helpers'

export type ReferralQualificationResult = {
  /** The referrer whose reward state was touched. */
  referrerUserId: string
  /** True only on the transition from locked → unlocked (apply discount now). */
  justUnlocked: boolean
  /** Current count of qualified referrals for the referrer. */
  qualifiedCount: number
}

const countQualifiedReferrals = async (
  ctx: MutationCtx,
  referrerUserId: string,
): Promise<number> => {
  const qualified = await ctx.db
    .query('referrals')
    .withIndex('by_referrer_status', (index) =>
      index.eq('referrerUserId', referrerUserId).eq('status', 'qualified'),
    )
    .collect()
  return qualified.length
}

/**
 * Recompute and persist a referrer's reward state from their qualified count.
 * Unlock is permanent (monotonic): once unlocked it never reverts here.
 */
export const refreshReferralReward = async (
  ctx: MutationCtx,
  referrerUserId: string,
): Promise<ReferralQualificationResult> => {
  const qualifiedCount = await countQualifiedReferrals(ctx, referrerUserId)
  const existing = await ctx.db
    .query('referralRewards')
    .withIndex('by_userId', (index) => index.eq('userId', referrerUserId))
    .first()

  const { unlocked, justUnlocked } = computeRewardState(
    qualifiedCount,
    existing?.unlocked ?? false,
  )
  const now = Date.now()

  if (existing === null) {
    await ctx.db.insert('referralRewards', {
      userId: referrerUserId,
      unlocked,
      unlockedAt: unlocked ? now : undefined,
      qualifiedCount,
      discountPercent: REFERRAL_DISCOUNT_PERCENT,
      updatedAt: now,
    })
  } else {
    await ctx.db.patch(existing._id, {
      unlocked,
      unlockedAt: existing.unlockedAt ?? (unlocked ? now : undefined),
      qualifiedCount,
      discountPercent: existing.discountPercent || REFERRAL_DISCOUNT_PERCENT,
      updatedAt: now,
    })
  }

  return { referrerUserId, justUnlocked, qualifiedCount }
}

/**
 * Called when `payerUserId` becomes a paying customer. If they were referred,
 * qualify (or disqualify, for disposable emails) that referral and refresh the
 * referrer's reward state. Idempotent: a referral only qualifies once.
 *
 * Returns the referrer's qualification result only when the referrer's reward
 * just transitioned to unlocked (so the caller can apply the provider discount);
 * otherwise returns null.
 */
export const qualifyReferralOnPayment = async (
  ctx: MutationCtx,
  payerUserId: string,
): Promise<ReferralQualificationResult | null> => {
  const referral = await ctx.db
    .query('referrals')
    .withIndex('by_referred', (index) =>
      index.eq('referredUserId', payerUserId),
    )
    .first()

  if (referral === null) return null
  // Already settled — nothing to do (idempotent on repeated webhooks).
  if (referral.status !== 'pending') return null

  const now = Date.now()

  // Disposable-email accounts never count toward the reward.
  if (referral.emailDisposable === true) {
    await ctx.db.patch(referral._id, {
      status: 'disqualified',
      updatedAt: now,
    })
    return null
  }

  await ctx.db.patch(referral._id, {
    status: 'qualified',
    paidAt: now,
    updatedAt: now,
  })

  const result = await refreshReferralReward(ctx, referral.referrerUserId)
  return result.justUnlocked ? result : null
}
