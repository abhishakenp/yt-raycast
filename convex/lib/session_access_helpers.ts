import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { deleteSessionGraph } from './session_delete_helpers'
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
  system_role?: string
  systemRole?: string
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

export type ClaimAnonymousSessionsByIpInput = {
  clientIpHash: string
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

/**
 * Returns true when the authenticated user has an admin role in their Clerk
 * publicMetadata (exposed as a JWT claim via the Clerk "convex" JWT template).
 * Accepts both `system_role` and `systemRole` claim names so the Clerk JWT
 * template can use either spelling.
 *
 * Admin users bypass rate limits, quota, the export paywall, AND auth/ownership
 * checks — everything `VITE_DISABLE_CLERK`/`DISABLE_LIMIT`/`DISABLE_PAYWALL`
 * bypass. This is safe because the JWT is signed by Clerk and verified by
 * Convex `auth.config.ts` — no forgeable client-supplied value is involved.
 *
 * The super-admin account `hello@ship-fast.ai` has `system_role: admin` set
 * in Clerk publicMetadata, so it is recognized as admin via the standard
 * JWT role claim — no hardcoded email check needed.
 */
export async function isUserAdmin(ctx: AuthCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity()
  const role = identity?.system_role ?? identity?.systemRole
  return role === 'admin'
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
  session: {
    userId?: string
    anonOwnerSecretHash?: string
    deletedAt?: number
  },
  anonymousOwnerSecret?: string,
) {
  if (session.deletedAt !== undefined) {
    throw new ConvexError({ code: 'NOT_FOUND', message: 'Session not found' })
  }
  if (isAuthDisabled() || (await isUserAdmin(ctx))) return
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
    deletedAt?: number
  },
  anonymousOwnerSecret?: string,
): Promise<boolean> {
  if (session.deletedAt !== undefined) return false
  if (session.isPrivate !== true || isAuthDisabled()) return true
  if (!('auth' in ctx)) return false
  if (await isUserAdmin(ctx)) return true
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
  session: {
    userId?: string
    anonOwnerSecretHash?: string
    deletedAt?: number
  },
  anonymousOwnerSecret?: string,
) {
  if (session.deletedAt !== undefined) {
    throw new ConvexError({ code: 'NOT_FOUND', message: 'Session not found' })
  }
  if (areExportPaywallsDisabled() || isAuthDisabled()) return
  if (await isUserAdmin(ctx)) return
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
  const isAdmin = await isUserAdmin(ctx)

  if (args.sessionId !== undefined) {
    const session = await ctx.db.get(args.sessionId)
    if (session === null || session.deletedAt !== undefined)
      return { deleted: 0 }

    // Admins bypass ownership on the single-session delete path (hover+D on
    // any gallery card). The bulk "delete all my sessions" branch below stays
    // owner-scoped — admin bulk-delete-all-everyone is a catastrophic footgun
    // and is not exposed by any UI. Soft-delete only (deletedAt patch).
    if (!isAdmin) {
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
    }

    await deleteSessionGraph(ctx, session._id)
    return { deleted: 1 }
  }

  let sessions: Doc<'sessions'>[] = []
  if (userId !== undefined) {
    sessions = await ctx.db
      .query('sessions')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
  } else if (args.anonymousClientId !== undefined) {
    const anonymousClientIdHash = await hashOwnerSecret(args.anonymousClientId)
    sessions = await ctx.db
      .query('sessions')
      .withIndex('by_anonymousClientIdHash', (index) =>
        index.eq('anonymousClientIdHash', anonymousClientIdHash),
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
  }

  for (const session of sessions) {
    await deleteSessionGraph(ctx, session._id)
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
    if (session.deletedAt !== undefined) continue
    await ctx.db.patch(session._id, {
      userId,
      anonOwnerSecretHash: undefined,
      updatedAt: now,
    })
    claimed += 1
  }

  return { claimed }
}

// Link ALL anonymous sessions on a given IP to the signed-in userId. Called on
// sign-in so /mine ownership follows the user across the anon→authenticated
// transition. The clientIpHash is derived server-side from request headers
// (unforgeable), unlike the localStorage anonymousClientId. Skips sessions
// already owned by anyone (including the caller). Idempotent.
//
// Note: this is for /mine ownership only. Quota counting uses the union of the
// IP and userId buckets directly in loadGenerationAdmission, so claiming is not
// on the quota critical path.
export async function claimAnonymousSessionsByIp(
  ctx: MutationCtx,
  args: ClaimAnonymousSessionsByIpInput,
) {
  const userId = await getUserId(ctx)
  if (userId === undefined) {
    throw new ConvexError({
      code: 'AUTH_REQUIRED',
      message: 'Sign in to claim anonymous sessions',
    })
  }

  const sessions = await ctx.db
    .query('sessions')
    .withIndex('by_clientIpHash', (index) =>
      index.eq('clientIpHash', args.clientIpHash),
    )
    .collect()

  const now = Date.now()
  let claimed = 0
  for (const session of sessions) {
    if (session.userId?.length) continue
    if (session.deletedAt !== undefined) continue
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
    updatedAt: Date.now(),
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
