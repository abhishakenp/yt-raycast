import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  isSessionOwner,
} from './session_access_helpers'

async function assertSessionExists(
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
) {
  const session = await ctx.db.get(sessionId)
  if (!session) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'Session not found',
    })
  }
  return session
}

/** Generate a signed upload URL for user-uploaded images. The client POSTs
 *  the file to this URL, receives a storageId, then calls saveUserImage to
 *  record the metadata. Same ownership check as clone uploads. */
export async function generateUserImageUploadUrl(
  ctx: MutationCtx,
  args: { sessionId: Id<'sessions'>; anonymousOwnerSecret?: string },
) {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
  return await ctx.storage.generateUploadUrl()
}

/** After the client uploads the file to the signed URL, save the metadata
 *  so we can list and display uploaded images in the image picker. */
export async function saveUserImage(
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    storageId: Id<'_storage'>
    filename?: string
    contentType: string
    size: number
  },
) {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const contentType = args.contentType.trim().toLowerCase()
  if (!contentType.startsWith('image/')) {
    throw new ConvexError({
      code: 'INVALID_FILE_TYPE',
      message: 'Only image files are allowed',
    })
  }

  if (!Number.isSafeInteger(args.size) || args.size <= 0) {
    throw new ConvexError({
      code: 'INVALID_FILE_SIZE',
      message: 'Image size must be a positive integer',
    })
  }

  const metadata = await ctx.db.system.get('_storage', args.storageId)
  const storedContentType = metadata?.contentType?.trim().toLowerCase()
  if (
    storedContentType === undefined ||
    !storedContentType.startsWith('image/') ||
    storedContentType !== contentType
  ) {
    throw new ConvexError({
      code: 'INVALID_FILE_TYPE',
      message: 'Uploaded file metadata does not match the declared image type',
    })
  }

  const existing = (
    await ctx.db
      .query('userImages')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .collect()
  ).find((image) => image.storageId === args.storageId)

  if (existing !== undefined) {
    if (
      existing.filename !== args.filename ||
      existing.contentType !== contentType ||
      existing.size !== args.size
    ) {
      throw new ConvexError({
        code: 'CONFLICT',
        message: 'Uploaded image was already saved with different metadata',
      })
    }
    return existing._id
  }

  return await ctx.db.insert('userImages', {
    sessionId: args.sessionId,
    storageId: args.storageId,
    filename: args.filename,
    contentType,
    size: args.size,
    createdAt: Date.now(),
  })
}

/** List all user-uploaded images for a session, newest first, with their
 *  resolved storage URLs. */
export async function listUserImages(
  ctx: QueryCtx,
  args: { sessionId: Id<'sessions'> },
) {
  // Suppress uploaded images for private sessions when the caller is not
  // the owner (unauthenticated list queries return an empty array).
  const session = await ctx.db.get(args.sessionId)
  if (session?.isPrivate === true) {
    const owner = await isSessionOwner(ctx, session, undefined)
    if (!owner) return []
  }

  const images = await ctx.db
    .query('userImages')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
    .order('desc')
    .collect()

  // Resolve storage URLs in parallel
  const withUrls = await Promise.all(
    images.map(async (img) => ({
      _id: img._id,
      storageId: img.storageId,
      filename: img.filename,
      contentType: img.contentType,
      size: img.size,
      createdAt: img.createdAt,
      url: await ctx.storage.getUrl(img.storageId),
    })),
  )

  // Filter out any images whose URL couldn't be resolved (e.g. deleted)
  return withUrls.filter((img) => img.url !== null)
}
