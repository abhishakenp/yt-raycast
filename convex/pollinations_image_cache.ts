import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const get = query({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('pollinationsImageCache')
      .withIndex('by_cacheKey', (index) => index.eq('cacheKey', args.cacheKey))
      .unique()
    if (!row) return null

    const url = await ctx.storage.getUrl(row.storageId)
    if (url === null) return null

    return {
      contentType: row.contentType,
      size: row.size,
      storageId: row.storageId,
      url,
    }
  },
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const commit = mutation({
  args: {
    cacheKey: v.string(),
    contentType: v.string(),
    size: v.number(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('pollinationsImageCache')
      .withIndex('by_cacheKey', (index) => index.eq('cacheKey', args.cacheKey))
      .unique()

    const now = Date.now()
    if (existing) {
      if (existing.storageId !== args.storageId) {
        await ctx.storage.delete(existing.storageId)
      }
      await ctx.db.patch(existing._id, {
        contentType: args.contentType,
        size: args.size,
        storageId: args.storageId,
        updatedAt: now,
      })
      return { status: 'stored' as const }
    }

    await ctx.db.insert('pollinationsImageCache', {
      cacheKey: args.cacheKey,
      contentType: args.contentType,
      createdAt: now,
      size: args.size,
      storageId: args.storageId,
      updatedAt: now,
    })

    return { status: 'stored' as const }
  },
})
