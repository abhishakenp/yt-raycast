import { ConvexError, v } from 'convex/values'

import { isAuthDisabled } from './lib/session_export_helpers'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

const sessionDataValidator = v.record(v.string(), v.any())
const textEncoder = new TextEncoder()

type AuthCtx = Pick<MutationCtx, 'auth'> | Pick<QueryCtx, 'auth'>

type SessionActor = {
  anonymousOwnerSecretHash?: string
  auth: {
    displayName: string
    email?: string
    emailVerified?: boolean
    isAuthenticated: boolean
    isGuest: boolean
    picture?: string
    provider: 'guest' | 'google'
    user: {
      displayName: string
      email?: string
      emailVerified?: boolean
      id: string
      isGuest: boolean
      picture?: string
      provider: 'guest' | 'google'
      userId: string
    }
    userId: string
  }
  ownerKey: string
  userId?: string
}

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const hashOwnerSecret = async (ownerSecret: string): Promise<string> =>
  toHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(ownerSecret)))

const createGuestAuth = (userId: string, displayName = 'Guest') => ({
  displayName,
  isAuthenticated: false,
  isGuest: true,
  provider: 'guest' as const,
  user: {
    displayName,
    id: userId,
    isGuest: true,
    provider: 'guest' as const,
    userId,
  },
  userId,
})

const createUserAuth = async (ctx: AuthCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  const userId = identity?.tokenIdentifier ?? identity?.subject
  if (!identity || !userId) return null

  const displayName =
    identity.name ?? identity.nickname ?? identity.email ?? 'User'

  return {
    displayName,
    email: identity.email,
    emailVerified: identity.emailVerified,
    isAuthenticated: true,
    isGuest: false,
    picture: identity.pictureUrl,
    provider: 'google' as const,
    user: {
      displayName,
      email: identity.email,
      emailVerified: identity.emailVerified,
      id: userId,
      isGuest: false,
      picture: identity.pictureUrl,
      provider: 'google' as const,
      userId,
    },
    userId,
  }
}

const getSessionOrThrow = async (
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)
  if (!session) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: `Session "${sessionId}" does not exist`,
    })
  }

  return session
}

const getSessionActor = async (
  ctx: QueryCtx | MutationCtx,
  session: {
    anonOwnerSecretHash?: string
    isPrivate?: boolean
    userId?: string
  },
  anonymousOwnerSecret?: string,
): Promise<SessionActor | null> => {
  const auth = await createUserAuth(ctx)
  if (auth) {
    if (session.isPrivate === true && session.userId !== auth.userId) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    }

    return {
      auth,
      ownerKey: `user:${auth.userId}`,
      userId: auth.userId,
    }
  }

  if (anonymousOwnerSecret !== undefined) {
    const anonymousOwnerSecretHash = await hashOwnerSecret(anonymousOwnerSecret)
    const ownsAnonymousSession =
      session.userId === undefined &&
      session.anonOwnerSecretHash !== undefined &&
      session.anonOwnerSecretHash === anonymousOwnerSecretHash

    if (ownsAnonymousSession) {
      const userId = `anonymous:${anonymousOwnerSecretHash}`
      return {
        anonymousOwnerSecretHash,
        auth: createGuestAuth(userId, 'Anonymous Owner'),
        ownerKey: userId,
      }
    }
  }

  if (session.isPrivate === true) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'You do not own this session',
    })
  }

  // When VITE_DISABLE_CLERK=true is set on the deployment, bypass ownership
  // checks so anonymous users can read/write lakebed capsules without signing
  // in. Mirrors `assertCanMutateSession` in `session_access_helpers.ts`.
  if (isAuthDisabled()) {
    const userId = 'guest:public'
    return {
      auth: createGuestAuth(userId, 'Guest'),
      ownerKey: userId,
    }
  }

  return null
}

const getRequiredSessionActor = async (
  ctx: QueryCtx | MutationCtx,
  session: {
    anonOwnerSecretHash?: string
    isPrivate?: boolean
    userId?: string
  },
  anonymousOwnerSecret?: string,
) => {
  const actor = await getSessionActor(ctx, session, anonymousOwnerSecret)
  if (!actor) {
    throw new ConvexError({
      code: 'UNAUTHENTICATED',
      message: 'Sign in to save Lakebed data.',
    })
  }

  return actor
}

const getSessionDataDoc = async (
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  capsule: string,
) => {
  const docs = await ctx.db
    .query('sessionData')
    .withIndex('by_sessionId_capsule', (q) =>
      q.eq('sessionId', sessionId).eq('capsule', capsule),
    )
    .take(64)

  return docs.find((doc) => doc.ownerKey === undefined) ?? null
}

const getActorSessionDataDoc = async (
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  capsule: string,
  actor: SessionActor,
) =>
  await ctx.db
    .query('sessionData')
    .withIndex('by_sessionId_capsule_ownerKey', (q) =>
      q
        .eq('sessionId', sessionId)
        .eq('capsule', capsule)
        .eq('ownerKey', actor.ownerKey),
    )
    .unique()

const getReadableSessionDataDoc = async (
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  capsule: string,
  actor: SessionActor | null,
) => {
  if (!actor) return null

  return (
    (await getActorSessionDataDoc(ctx, sessionId, capsule, actor)) ??
    (await getSessionDataDoc(ctx, sessionId, capsule))
  )
}

const actorFields = (actor: SessionActor) => ({
  anonymousOwnerSecretHash: actor.anonymousOwnerSecretHash,
  ownerKey: actor.ownerKey,
  userId: actor.userId,
})

const defaultAuth = createGuestAuth('guest:public', 'Guest')

const stateFrom = (
  data: Record<string, unknown>,
  actor: SessionActor | null,
) => {
  const auth = actor?.auth ?? defaultAuth
  return { auth, canWrite: actor !== null, data }
}

export const getSessionData = query({
  args: {
    anonymousOwnerSecret: v.optional(v.string()),
    capsule: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionOrThrow(ctx, args.sessionId)
    const actor = await getSessionActor(ctx, session, args.anonymousOwnerSecret)
    const doc = await getReadableSessionDataDoc(
      ctx,
      args.sessionId,
      args.capsule,
      actor,
    )
    return doc?.data ?? {}
  },
})

export const getSessionState = query({
  args: {
    anonymousOwnerSecret: v.optional(v.string()),
    capsule: v.string(),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionOrThrow(ctx, args.sessionId)
    const actor = await getSessionActor(ctx, session, args.anonymousOwnerSecret)
    const doc = await getReadableSessionDataDoc(
      ctx,
      args.sessionId,
      args.capsule,
      actor,
    )

    return stateFrom(doc?.data ?? {}, actor)
  },
})

export const listSessionData = query({
  args: {
    anonymousOwnerSecret: v.optional(v.string()),
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionOrThrow(ctx, args.sessionId)
    const actor = await getSessionActor(ctx, session, args.anonymousOwnerSecret)
    if (!actor) return []

    const actorDocs = await ctx.db
      .query('sessionData')
      .withIndex('by_sessionId_ownerKey', (q) =>
        q.eq('sessionId', args.sessionId).eq('ownerKey', actor.ownerKey),
      )
      .take(64)
    const legacyDocs = await ctx.db
      .query('sessionData')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .take(64)
    const docsById = new Map(
      [
        ...actorDocs,
        ...legacyDocs.filter((doc) => doc.ownerKey === undefined),
      ].map((doc) => [doc._id, doc]),
    )
    const docs = [...docsById.values()]

    return docs.map((doc) => ({
      capsule: doc.capsule,
      createdAt: doc.createdAt,
      data: doc.data,
      updatedAt: doc.updatedAt,
    }))
  },
})

export const mergeSessionData = mutation({
  args: {
    anonymousOwnerSecret: v.optional(v.string()),
    capsule: v.string(),
    patch: sessionDataValidator,
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionOrThrow(ctx, args.sessionId)
    const actor = await getRequiredSessionActor(
      ctx,
      session,
      args.anonymousOwnerSecret,
    )

    const now = Date.now()
    const doc =
      (await getActorSessionDataDoc(
        ctx,
        args.sessionId,
        args.capsule,
        actor,
      )) ?? (await getSessionDataDoc(ctx, args.sessionId, args.capsule))
    const data = {
      ...(doc?.data ?? {}),
      ...args.patch,
    }

    if (doc) {
      await ctx.db.patch(doc._id, {
        data,
        ...actorFields(actor),
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('sessionData', {
        capsule: args.capsule,
        createdAt: now,
        data,
        ...actorFields(actor),
        sessionId: args.sessionId,
        updatedAt: now,
      })
    }

    return data
  },
})

export const replaceSessionData = mutation({
  args: {
    anonymousOwnerSecret: v.optional(v.string()),
    capsule: v.string(),
    data: sessionDataValidator,
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionOrThrow(ctx, args.sessionId)
    const actor = await getRequiredSessionActor(
      ctx,
      session,
      args.anonymousOwnerSecret,
    )

    const now = Date.now()
    const doc =
      (await getActorSessionDataDoc(
        ctx,
        args.sessionId,
        args.capsule,
        actor,
      )) ?? (await getSessionDataDoc(ctx, args.sessionId, args.capsule))

    if (doc) {
      await ctx.db.patch(doc._id, {
        data: args.data,
        ...actorFields(actor),
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('sessionData', {
        capsule: args.capsule,
        createdAt: now,
        data: args.data,
        ...actorFields(actor),
        sessionId: args.sessionId,
        updatedAt: now,
      })
    }

    return args.data
  },
})
