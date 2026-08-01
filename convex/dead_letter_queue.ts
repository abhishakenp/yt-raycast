import { v } from 'convex/values'

import { internalMutation, internalQuery } from './_generated/server'

export const enqueue = internalMutation({
  args: {
    source: v.string(),
    dedupeKey: v.string(),
    payloadJson: v.string(),
    attemptCount: v.number(),
    error: v.string(),
    failedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('deadLetterQueue')
      .withIndex('by_source_and_dedupeKey', (q) =>
        q.eq('source', args.source).eq('dedupeKey', args.dedupeKey),
      )
      .unique()
    if (existing) return existing._id

    return await ctx.db.insert('deadLetterQueue', {
      ...args,
      status: 'open',
      updatedAt: args.failedAt,
    })
  },
})

export const listOpen = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    await ctx.db
      .query('deadLetterQueue')
      .withIndex('by_status_and_failedAt', (q) => q.eq('status', 'open'))
      .order('desc')
      .take(Math.min(Math.max(args.limit ?? 50, 1), 100)),
})

export const resolve = internalMutation({
  args: {
    entryId: v.id('deadLetterQueue'),
    resolvedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId)
    if (!entry || entry.status === 'resolved') return false

    await ctx.db.patch(entry._id, {
      resolvedAt: args.resolvedAt,
      status: 'resolved',
      updatedAt: args.resolvedAt,
    })
    return true
  },
})
