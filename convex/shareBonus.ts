import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

/**
 * Check whether a share bonus has been claimed for the given IP hash today.
 * The IP hash is computed server-side in the HTTP route — never trusted from
 * the client.
 */
export const getShareBonusStatus = query({
  args: {
    clientIpHash: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
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
 */
export const claimShareBonus = mutation({
  args: {
    clientIpHash: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
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
