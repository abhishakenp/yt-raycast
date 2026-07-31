import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { verifyServerSecret as verifySharedServerSecret } from './lib/server_secret'

/**
 * Check whether a share bonus has been claimed for the given IP hash today.
 * The IP hash is computed server-side in the HTTP route — never trusted from
 * the client. Requires a server secret to prevent direct client calls.
 */
export const getShareBonusStatus = query({
  args: {
    clientIpHash: v.string(),
    date: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(args.secret)
    const existing = await ctx.db
      .query('shareBonuses')
      .withIndex('by_clientIpHash_date', (q) =>
        q.eq('clientIpHash', args.clientIpHash).eq('date', args.date),
      )
      .first()
    return existing !== null
  },
})

/**
 * Claim the share bonus for the given IP hash + date.
 * Idempotent — calling twice on the same day is a no-op.
 * The IP hash is computed server-side in the HTTP route.
 * Requires a server secret to prevent direct client calls bypassing the
 * share requirement.
 */
export const claimShareBonus = mutation({
  args: {
    clientIpHash: v.string(),
    date: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(args.secret)
    const existing = await ctx.db
      .query('shareBonuses')
      .withIndex('by_clientIpHash_date', (q) =>
        q.eq('clientIpHash', args.clientIpHash).eq('date', args.date),
      )
      .first()

    if (existing !== null) {
      return { claimed: true, success: false }
    }

    await ctx.db.insert('shareBonuses', {
      clientIpHash: args.clientIpHash,
      date: args.date,
      createdAt: Date.now(),
    })

    return { claimed: true, success: true }
  },
})

function verifyServerSecret(secret: string | undefined): void {
  verifySharedServerSecret('SHARE_BONUS_MUTATION_SECRET', secret)
}
