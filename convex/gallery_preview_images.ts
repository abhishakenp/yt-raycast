import { ConvexError, v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'

const assertPublicSession = async (
  ctx: Pick<QueryCtx, 'db'> | Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)
  if (
    !session ||
    session.isPrivate === true ||
    session.deletedAt !== undefined
  ) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'Preview session not found',
    })
  }
  return session
}

export const get = query({
  args: {
    cacheVersion: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    await assertPublicSession(ctx, args.sessionId)

    const row = await ctx.db
      .query('galleryPreviewImages')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .unique()

    if (!row || row.cacheVersion !== args.cacheVersion) return null

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
  args: {
    cacheVersion: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await assertPublicSession(ctx, args.sessionId)
    const currentVersion = String(session.updatedAt ?? session.createdAt)
    if (currentVersion !== args.cacheVersion) {
      throw new ConvexError({
        code: 'STALE_PREVIEW_VERSION',
        message: 'Preview image version is stale',
      })
    }

    return await ctx.storage.generateUploadUrl()
  },
})

export const commit = mutation({
  args: {
    cacheVersion: v.string(),
    contentType: v.string(),
    sessionId: v.id('sessions'),
    size: v.number(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const session = await assertPublicSession(ctx, args.sessionId)
    const currentVersion = String(session.updatedAt ?? session.createdAt)
    if (currentVersion !== args.cacheVersion) {
      await ctx.storage.delete(args.storageId)
      return { status: 'stale' as const }
    }

    const existing = await ctx.db
      .query('galleryPreviewImages')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .unique()

    const now = Date.now()
    if (existing) {
      if (existing.storageId !== args.storageId) {
        await ctx.storage.delete(existing.storageId)
      }
      await ctx.db.patch(existing._id, {
        cacheVersion: args.cacheVersion,
        contentType: args.contentType,
        size: args.size,
        storageId: args.storageId,
        updatedAt: now,
      })
      return { status: 'stored' as const }
    }

    await ctx.db.insert('galleryPreviewImages', {
      cacheVersion: args.cacheVersion,
      contentType: args.contentType,
      createdAt: now,
      sessionId: args.sessionId,
      size: args.size,
      storageId: args.storageId,
      updatedAt: now,
    })

    return { status: 'stored' as const }
  },
})
