import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

const textEncoder = new TextEncoder()

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

export const hashOwnerSecret = async (ownerSecret: string): Promise<string> =>
  toHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(ownerSecret)))

type AuthCtx = Pick<MutationCtx, 'auth'> | Pick<QueryCtx, 'auth'>

export type DeleteOwnedSessionsInput = {
  anonymousClientId?: string
}

export type ClaimAnonymousSessionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret: string
}

export type SetSessionThemeOverrideInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  themeOverride: string | null
}

export const getUserId = async (ctx: AuthCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? identity?.subject
}

export const isSessionOwner = async (
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
): Promise<boolean> => {
  const userId = await getUserId(ctx)
  const anonymousOwnerSecretHash =
    anonymousOwnerSecret === undefined
      ? undefined
      : await hashOwnerSecret(anonymousOwnerSecret)

  return (
    (session.userId !== undefined && session.userId === userId) ||
    (session.userId === undefined &&
      session.anonOwnerSecretHash !== undefined &&
      session.anonOwnerSecretHash === anonymousOwnerSecretHash)
  )
}

export const assertCanReadOwnedSession = async (
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) => {
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

export const assertCanReadPrivateSession = async (
  ctx: AuthCtx,
  session: {
    isPrivate?: boolean
    userId?: string
    anonOwnerSecretHash?: string
  },
  anonymousOwnerSecret?: string,
) => {
  if (session.isPrivate !== true) return
  await assertCanReadOwnedSession(ctx, session, anonymousOwnerSecret)
}

export const assertCanMutateSession = async (
  ctx: MutationCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) => {
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

export const deleteOwnedSessions = async (
  ctx: MutationCtx,
  args: DeleteOwnedSessionsInput,
) => {
  const userId = await getUserId(ctx)

  let sessions: Doc<'sessions'>[] = []
  if (userId !== undefined) {
    sessions = await ctx.db
      .query('sessions')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .collect()
  } else if (args.anonymousClientId !== undefined) {
    const anonymousClientIdHash = await hashOwnerSecret(args.anonymousClientId)
    sessions = await ctx.db
      .query('sessions')
      .withIndex('by_anonymousClientIdHash', (index) =>
        index.eq('anonymousClientIdHash', anonymousClientIdHash),
      )
      .collect()
  }

  for (const session of sessions) {
    await ctx.db.delete(session._id)
  }

  return { deleted: sessions.length }
}

export const claimAnonymousSession = async (
  ctx: MutationCtx,
  args: ClaimAnonymousSessionInput,
) => {
  const userId = await getUserId(ctx)
  const session = await ctx.db.get(args.sessionId)
  const anonymousOwnerSecretHash = await hashOwnerSecret(
    args.anonymousOwnerSecret,
  )

  userId !== undefined ||
    (() => {
      throw new ConvexError({
        code: 'AUTH_REQUIRED',
        message: 'Sign in to claim this session',
      })
    })()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  session.userId === undefined ||
    (() => {
      throw new ConvexError({
        code: 'ALREADY_OWNED',
        message: 'Session is already owned',
      })
    })()

  session.anonOwnerSecretHash === anonymousOwnerSecretHash ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Invalid anonymous owner secret',
      })
    })()

  await ctx.db.patch(args.sessionId, {
    userId,
    anonOwnerSecretHash: undefined,
    updatedAt: Date.now(),
  })

  return { sessionId: args.sessionId }
}

export const setSessionThemeOverride = async (
  ctx: MutationCtx,
  args: SetSessionThemeOverrideInput,
) => {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  await ctx.db.patch(args.sessionId, {
    themeOverride: args.themeOverride ?? undefined,
  })
}
