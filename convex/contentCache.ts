import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'

// Per-prompt cache of the AI-authored composition content. The generator reuses
// this content across sessions for the same prompt (zero model cost) while the
// per-session seed re-randomizes the layout — so the same prompt yields a
// different site every time, but the expensive AI calls run once per prompt.

export const get = internalQuery({
  args: { promptCacheKey: v.string() },
  handler: async (ctx, { promptCacheKey }) => {
    const row = await ctx.db
      .query('sectionContentCache')
      .withIndex('by_promptCacheKey', (q) =>
        q.eq('promptCacheKey', promptCacheKey),
      )
      .order('desc')
      .first()
    return row?.contentJson ?? null
  },
})

export const set = internalMutation({
  args: { promptCacheKey: v.string(), contentJson: v.string() },
  handler: async (ctx, { promptCacheKey, contentJson }) => {
    const existing = await ctx.db
      .query('sectionContentCache')
      .withIndex('by_promptCacheKey', (q) =>
        q.eq('promptCacheKey', promptCacheKey),
      )
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, { contentJson, createdAt: Date.now() })
    } else {
      await ctx.db.insert('sectionContentCache', {
        promptCacheKey,
        contentJson,
        createdAt: Date.now(),
      })
    }
  },
})
