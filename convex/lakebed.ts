import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

const sessionDataValidator = v.record(v.string(), v.any())

const getSessionDataDoc = async (
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  capsule: string,
) =>
  await ctx.db
    .query('sessionData')
    .withIndex('by_sessionId_capsule', (q) =>
      q.eq('sessionId', sessionId).eq('capsule', capsule),
    )
    .unique()

const assertSessionExists = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)
  if (!session) {
    throw new Error(`Session "${sessionId}" does not exist`)
  }
}

export const getSessionData = query({
  args: {
    capsule: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const doc = await getSessionDataDoc(ctx, args.sessionId, args.capsule)
    return doc?.data ?? {}
  },
})

export const mergeSessionData = mutation({
  args: {
    capsule: v.string(),
    patch: sessionDataValidator,
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    await assertSessionExists(ctx, args.sessionId)

    const now = Date.now()
    const doc = await getSessionDataDoc(ctx, args.sessionId, args.capsule)
    const data = {
      ...(doc?.data ?? {}),
      ...args.patch,
    }

    if (doc) {
      await ctx.db.patch(doc._id, {
        data,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('sessionData', {
        capsule: args.capsule,
        createdAt: now,
        data,
        sessionId: args.sessionId,
        updatedAt: now,
      })
    }

    return data
  },
})

export const replaceSessionData = mutation({
  args: {
    capsule: v.string(),
    data: sessionDataValidator,
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    await assertSessionExists(ctx, args.sessionId)

    const now = Date.now()
    const doc = await getSessionDataDoc(ctx, args.sessionId, args.capsule)

    if (doc) {
      await ctx.db.patch(doc._id, {
        data: args.data,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('sessionData', {
        capsule: args.capsule,
        createdAt: now,
        data: args.data,
        sessionId: args.sessionId,
        updatedAt: now,
      })
    }

    return args.data
  },
})
