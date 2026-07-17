import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'

// Batched content-addressed cache for Prettier-formatted export file output.
// Formatting a given (parser, options, raw content) tuple is a pure function,
// so the same hash always maps to the same formatted output — safe to reuse
// across builds, sessions, and export targets indefinitely.

export const getMany = internalQuery({
  args: { hashes: v.array(v.string()) },
  handler: async (ctx, { hashes }) => {
    const rows = await Promise.all(
      hashes.map((hash) =>
        ctx.db
          .query('exportRenderCache')
          .withIndex('by_hash', (q) => q.eq('hash', hash))
          .first(),
      ),
    )
    const result: Record<string, string> = {}
    rows.forEach((row, index) => {
      if (row !== null) result[hashes[index]] = row.content
    })
    return result
  },
})

export const setMany = internalMutation({
  args: {
    entries: v.array(v.object({ hash: v.string(), content: v.string() })),
  },
  handler: async (ctx, { entries }) => {
    const now = Date.now()
    for (const entry of entries) {
      const existing = await ctx.db
        .query('exportRenderCache')
        .withIndex('by_hash', (q) => q.eq('hash', entry.hash))
        .first()
      if (existing === null) {
        await ctx.db.insert('exportRenderCache', {
          hash: entry.hash,
          content: entry.content,
          updatedAt: now,
        })
      } else {
        await ctx.db.patch(existing._id, {
          content: entry.content,
          updatedAt: now,
        })
      }
    }
  },
})
