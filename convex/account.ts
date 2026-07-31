import { ConvexError, v } from 'convex/values'

import { mutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { deleteSessionGraph } from './lib/session_delete_helpers'

/**
 * Account deletion / right to erasure.
 *
 * There was no way for a user to delete their account or their data — not in
 * the product and not as an operator script — which is a GDPR/CCPA obligation
 * and a store-listing requirement for any account-based service.
 *
 * Financial records are intentionally NOT deleted wholesale: `subscriptions`
 * and `creditLedger` rows are the audit trail behind real payments and tax law
 * requires retaining them. They are anonymised instead — the user id is
 * replaced with a tombstone, so amounts stay reconcilable but are no longer
 * linked to a person.
 *
 * Tables are handled explicitly rather than in a loop: Convex types each
 * table's index builder separately, and a generic loop can only be made to
 * compile by casting away exactly the safety that would catch a wrong index.
 */

/** Stable, non-reversible stand-in that keeps rows countable but not linkable. */
export function deletionTombstone(userId: string): string {
  let hash = 0
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0
  }
  return `deleted-user:${(hash >>> 0).toString(36)}`
}

async function deleteOwnedSessions(
  ctx: MutationCtx,
  userId: string,
): Promise<number> {
  const sessions = await ctx.db
    .query('sessions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()

  for (const session of sessions) {
    await deleteSessionGraph(ctx, session._id)
    await ctx.db.delete(session._id)
  }
  return sessions.length
}

async function deletePersonalRows(
  ctx: MutationCtx,
  userId: string,
): Promise<number> {
  let deleted = 0

  const usage = await ctx.db
    .query('usageMetrics')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of usage) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  const sessionData = await ctx.db
    .query('sessionData')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of sessionData) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  const credits = await ctx.db
    .query('customerCredits')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of credits) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  const attributions = await ctx.db
    .query('acquisitionAttributions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of attributions) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  const referralCodes = await ctx.db
    .query('referralCodes')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of referralCodes) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  const referralRewards = await ctx.db
    .query('referralRewards')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of referralRewards) {
    await ctx.db.delete(row._id)
    deleted += 1
  }

  return deleted
}

async function anonymiseRetainedRows(
  ctx: MutationCtx,
  userId: string,
  tombstone: string,
): Promise<number> {
  let anonymised = 0

  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of subscriptions) {
    await ctx.db.patch(row._id, { userId: tombstone })
    anonymised += 1
  }

  const ledger = await ctx.db
    .query('creditLedger')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .collect()
  for (const row of ledger) {
    await ctx.db.patch(row._id, { userId: tombstone })
    anonymised += 1
  }

  const flags = await ctx.db
    .query('contentModerationFlags')
    .withIndex('by_userId_and_createdAt', (index) =>
      index.eq('userId', userId),
    )
    .collect()
  for (const row of flags) {
    await ctx.db.patch(row._id, {
      userId: tombstone,
      userEmail: undefined,
      userName: undefined,
    })
    anonymised += 1
  }

  return anonymised
}

export const deleteAccount = mutation({
  args: {
    /** Present only so a caller can be explicit; it must equal the caller. */
    userId: v.optional(v.string()),
    confirmation: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmation !== 'DELETE MY ACCOUNT') {
      throw new ConvexError({
        code: 'CONFIRMATION_REQUIRED',
        message:
          'Type "DELETE MY ACCOUNT" to confirm permanent deletion of your data.',
      })
    }

    const identity = await ctx.auth.getUserIdentity()
    const callerId = identity?.tokenIdentifier
    if (callerId === undefined) {
      throw new ConvexError({
        code: 'UNAUTHENTICATED',
        message: 'Sign in to delete your account.',
      })
    }

    const targetUserId = args.userId ?? callerId
    if (targetUserId !== callerId) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You can only delete your own account.',
      })
    }

    const sessionsDeleted = await deleteOwnedSessions(ctx, targetUserId)
    const rowsDeleted = await deletePersonalRows(ctx, targetUserId)
    const rowsAnonymised = await anonymiseRetainedRows(
      ctx,
      targetUserId,
      deletionTombstone(targetUserId),
    )

    return { sessionsDeleted, rowsDeleted, rowsAnonymised }
  },
})
