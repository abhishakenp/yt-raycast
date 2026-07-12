import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  areExportPaywallsDisabled,
  isAuthDisabled,
} from './session_export_helpers'

const textEncoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function hashOwnerSecret(ownerSecret: string): Promise<string> {
  return toHex(
    await crypto.subtle.digest('SHA-256', textEncoder.encode(ownerSecret)),
  )
}

type AuthIdentity = {
  tokenIdentifier?: string
  subject?: string
  email?: string
}

type AuthCtx = {
  auth: {
    getUserIdentity: () => Promise<AuthIdentity | null>
  }
}

type OptionalAuthCtx = AuthCtx | Pick<QueryCtx, 'db'>

export type DeleteOwnedSessionsInput = {
  anonymousClientId?: string
  sessionId?: Id<'sessions'>
}

export type ClaimAnonymousSessionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret: string
}

export type ClaimAnonymousSessionsByClientIdInput = {
  anonymousClientId: string
}

export type SetSessionThemeOverrideInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  themeOverride?: string | null
  themeMode?: 'light' | 'dark' | null
}

export type SetSessionPreferredLanguageInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  preferredLanguage: string
}

export type SessionBrandLogoSelection = {
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
}

export type SetSessionBrandLogoInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  brandLogo: SessionBrandLogoSelection | null
}

export async function getUserId(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? identity?.subject
}

export async function getUserEmail(ctx: AuthCtx): Promise<string | undefined> {
  const identity = await ctx.auth.getUserIdentity()
  const email = identity?.email?.trim().toLowerCase()
  return email && email.includes('@') ? email : undefined
}

export async function isSessionOwner(
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
): Promise<boolean> {
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

export async function assertCanReadOwnedSession(
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) {
  if (isAuthDisabled()) return
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

export async function canReadPrivateSession(
  ctx: OptionalAuthCtx,
  session: {
    isPrivate?: boolean
    userId?: string
    anonOwnerSecretHash?: string
  },
  anonymousOwnerSecret?: string,
): Promise<boolean> {
  if (session.isPrivate !== true || isAuthDisabled()) return true
  if (!('auth' in ctx)) return false
  return isSessionOwner(ctx, session, anonymousOwnerSecret)
}

export async function assertCanReadPrivateSession(
  ctx: AuthCtx,
  session: {
    isPrivate?: boolean
    userId?: string
    anonOwnerSecretHash?: string
  },
  anonymousOwnerSecret?: string,
) {
  if (await canReadPrivateSession(ctx, session, anonymousOwnerSecret)) return

  throw new ConvexError({
    code: 'FORBIDDEN',
    message: 'You do not own this session',
  })
}

export async function assertCanMutateSession(
  ctx: AuthCtx,
  session: { userId?: string; anonOwnerSecretHash?: string },
  anonymousOwnerSecret?: string,
) {
  if (areExportPaywallsDisabled() || isAuthDisabled()) return
  ;(await isSessionOwner(ctx, session, anonymousOwnerSecret)) ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()
}

export async function deleteOwnedSessions(
  ctx: MutationCtx,
  args: DeleteOwnedSessionsInput,
) {
  const userId = await getUserId(ctx)

  if (args.sessionId !== undefined) {
    const session = await ctx.db.get(args.sessionId)
    if (session === null) return { deleted: 0 }

    if (userId !== undefined) {
      if (session.userId !== userId) return { deleted: 0 }
    } else {
      if (args.anonymousClientId === undefined) return { deleted: 0 }
      const anonymousClientIdHash = await hashOwnerSecret(
        args.anonymousClientId,
      )
      if (session.anonymousClientIdHash !== anonymousClientIdHash) {
        return { deleted: 0 }
      }
    }

    await ctx.db.delete(session._id)
    return { deleted: 1 }
  }

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

export async function claimAnonymousSession(
  ctx: MutationCtx,
  args: ClaimAnonymousSessionInput,
) {
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

// Link ALL of a caller's anonymous sessions (matched by anonymousClientIdHash)
// to their signed-in userId. Called once on sign-in so the user's /mine view
// and ownership checks follow them across the anon→authenticated transition.
// Skips sessions already owned by anyone (including the caller). Idempotent.
export async function claimAnonymousSessionsByClientId(
  ctx: MutationCtx,
  args: ClaimAnonymousSessionsByClientIdInput,
) {
  const userId = await getUserId(ctx)
  if (userId === undefined) {
    throw new ConvexError({
      code: 'AUTH_REQUIRED',
      message: 'Sign in to claim anonymous sessions',
    })
  }

  const anonymousClientIdHash = await hashOwnerSecret(args.anonymousClientId)
  const sessions = await ctx.db
    .query('sessions')
    .withIndex('by_anonymousClientIdHash', (index) =>
      index.eq('anonymousClientIdHash', anonymousClientIdHash),
    )
    .collect()

  const now = Date.now()
  let claimed = 0
  for (const session of sessions) {
    if (session.userId !== undefined) continue
    await ctx.db.patch(session._id, {
      userId,
      anonOwnerSecretHash: undefined,
      updatedAt: now,
    })
    claimed += 1
  }

  return { claimed }
}

export async function setSessionThemeOverride(
  ctx: MutationCtx,
  args: SetSessionThemeOverrideInput,
) {
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
    ...(args.themeOverride === undefined
      ? {}
      : { themeOverride: args.themeOverride ?? undefined }),
    ...(args.themeMode === undefined
      ? {}
      : { themeMode: args.themeMode ?? undefined }),
  })
}

export async function setSessionPreferredLanguage(
  ctx: MutationCtx,
  args: SetSessionPreferredLanguageInput,
) {
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
    preferredLanguage: args.preferredLanguage,
    updatedAt: Date.now(),
  })
}

export async function setSessionBrandLogo(
  ctx: MutationCtx,
  args: SetSessionBrandLogoInput,
) {
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
    selectedBrandLogo: args.brandLogo ?? undefined,
    updatedAt: Date.now(),
  })
}
