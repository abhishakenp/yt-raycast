import type { Doc } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export type AcquisitionAttribution = Pick<
  Doc<'acquisitionAttributions'>,
  'claimedAt' | 'source' | 'sourceKey' | 'userId'
>

export async function getOrBackfillAcquisitionAttribution(
  ctx: MutationCtx,
  userId: string,
): Promise<AcquisitionAttribution | null> {
  const existing = await ctx.db
    .query('acquisitionAttributions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .unique()
  if (existing) return existing

  const legacyReferral = await ctx.db
    .query('referrals')
    .withIndex('by_referred', (index) => index.eq('referredUserId', userId))
    .unique()
  if (!legacyReferral) return null

  const attribution: AcquisitionAttribution = {
    claimedAt: legacyReferral.createdAt,
    source: 'native_referral',
    sourceKey: legacyReferral.code,
    userId,
  }
  await ctx.db.insert('acquisitionAttributions', attribution)
  return attribution
}

export async function insertAcquisitionAttribution(
  ctx: MutationCtx,
  attribution: AcquisitionAttribution,
): Promise<void> {
  await ctx.db.insert('acquisitionAttributions', attribution)
}
