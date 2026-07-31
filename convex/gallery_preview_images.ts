import { ConvexError, v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { verifyServerSecret } from './lib/server_secret'

/**
 * Gallery preview images are rendered and uploaded by the server route
 * (`gallery-preview-image-generation.ts`) on a cache miss — never by the
 * browser. The generate-on-miss flow means we cannot require session
 * ownership (any gallery visitor can trigger a render of a public session),
 * so the write path is gated on a server secret instead: without it any
 * anonymous caller could mint an upload URL and overwrite the preview image
 * of any public session, or wipe the whole cache.
 */
const GALLERY_PREVIEW_SECRET_ENV = 'GALLERY_PREVIEW_MUTATION_SECRET'

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

/**
 * Admin utility: delete cached preview image(s) so the next GET request
 * regenerates them from the current SSR HTML. Pass a `sessionId` to clear
 * one session, or omit it to clear all cached preview images.
 */
export const clearCache = mutation({
  args: {
    secret: v.string(),
    sessionId: v.optional(v.id('sessions')),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(GALLERY_PREVIEW_SECRET_ENV, args.secret)
    if (args.sessionId !== undefined) {
      const row = await ctx.db
        .query('galleryPreviewImages')
        .withIndex('by_sessionId', (index) =>
          index.eq('sessionId', args.sessionId as Id<'sessions'>),
        )
        .unique()
      if (row) {
        await ctx.storage.delete(row.storageId)
        await ctx.db.delete(row._id)
      }
      return { cleared: 1 }
    }

    const rows = await ctx.db.query('galleryPreviewImages').collect()
    for (const row of rows) {
      await ctx.storage.delete(row.storageId)
      await ctx.db.delete(row._id)
    }
    return { cleared: rows.length }
  },
})

export const generateUploadUrl = mutation({
  args: {
    cacheVersion: v.string(),
    secret: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(GALLERY_PREVIEW_SECRET_ENV, args.secret)
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
    secret: v.string(),
    sessionId: v.id('sessions'),
    size: v.number(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(GALLERY_PREVIEW_SECRET_ENV, args.secret)
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
