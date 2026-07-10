import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { assertCanMutateSession } from './lib/session_access_helpers'

/**
 * Document upload for the auto-admin panel (Q7). Admin uploads a PDF (or any
 * document) into Convex storage and writes the served URL into a `*Url` /
 * `docUrl` string field of a Lakebed row. Ownership-gated the same way as
 * session image uploads; unlike `saveUserImage` this accepts non-image types.
 */
export const generateUploadUrl = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Session not found' })
    }
    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Resolve the public served URL for an uploaded document. Called after the
 * client POSTs the file to the signed upload URL and receives a storageId.
 */
export const getStorageUrl = query({
  args: {
    sessionId: v.id('sessions'),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Session not found' })
    }
    return await ctx.storage.getUrl(args.storageId)
  },
})
