import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server'
import { v } from 'convex/values'
import { exportTarget } from './lib/session_validators'

const AUTH_REQUIRED = 'AUTH_REQUIRED: Sign in before connecting GitHub.'
const OAUTH_STATE_INVALID =
  'OAUTH_STATE_INVALID: GitHub connection expired. Try again.'

const githubUserArgs = {
  githubUserId: v.number(),
  githubLogin: v.string(),
  accessToken: v.string(),
  scopes: v.array(v.string()),
}

const requireIdentity = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error(AUTH_REQUIRED)
  return identity
}

const normalizeScopes = (scopes: string[]): string[] =>
  Array.from(
    new Set(
      scopes
        .map((scope) => scope.trim().toLowerCase())
        .filter((scope) => scope.length > 0),
    ),
  ).sort()

export const createOAuthState = mutation({
  args: {
    state: v.string(),
    returnTo: v.string(),
    sessionId: v.optional(v.string()),
    target: v.optional(exportTarget),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx)
    const now = Date.now()

    const existingStates = await ctx.db
      .query('githubOAuthStates')
      .withIndex('by_clerkTokenIdentifier', (q) =>
        q.eq('clerkTokenIdentifier', identity.tokenIdentifier),
      )
      .collect()
    await Promise.all(existingStates.map((state) => ctx.db.delete(state._id)))

    await ctx.db.insert('githubOAuthStates', {
      state: args.state,
      clerkTokenIdentifier: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      returnTo: args.returnTo,
      sessionId: args.sessionId,
      target: args.target,
      createdAt: now,
      expiresAt: args.expiresAt,
    })
  },
})

export const cancelOAuthState = mutation({
  args: {
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('githubOAuthStates')
      .withIndex('by_state', (q) => q.eq('state', args.state))
      .unique()

    if (!row) {
      return { returnTo: '/' }
    }

    await ctx.db.delete(row._id)
    return { returnTo: row.returnTo }
  },
})

export const completeOAuthConnection = mutation({
  args: {
    state: v.string(),
    ...githubUserArgs,
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('githubOAuthStates')
      .withIndex('by_state', (q) => q.eq('state', args.state))
      .unique()

    if (!row || row.expiresAt < Date.now()) {
      throw new Error(OAUTH_STATE_INVALID)
    }

    const now = Date.now()
    const scopes = normalizeScopes(args.scopes)
    const existing = await ctx.db
      .query('githubConnections')
      .withIndex('by_clerkTokenIdentifier', (q) =>
        q.eq('clerkTokenIdentifier', row.clerkTokenIdentifier),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkUserId: row.clerkUserId,
        githubUserId: args.githubUserId,
        githubLogin: args.githubLogin,
        accessToken: args.accessToken,
        scopes,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('githubConnections', {
        clerkTokenIdentifier: row.clerkTokenIdentifier,
        clerkUserId: row.clerkUserId,
        githubUserId: args.githubUserId,
        githubLogin: args.githubLogin,
        accessToken: args.accessToken,
        scopes,
        connectedAt: now,
        updatedAt: now,
      })
    }

    await ctx.db.delete(row._id)
    return {
      returnTo: row.returnTo,
      sessionId: row.sessionId,
      target: row.target,
      githubLogin: args.githubLogin,
      scopes,
    }
  },
})

export const getConnectionForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx)
    const connection = await ctx.db
      .query('githubConnections')
      .withIndex('by_clerkTokenIdentifier', (q) =>
        q.eq('clerkTokenIdentifier', identity.tokenIdentifier),
      )
      .unique()

    if (!connection) return null

    return {
      githubUserId: connection.githubUserId,
      githubLogin: connection.githubLogin,
      accessToken: connection.accessToken,
      scopes: connection.scopes,
      connectedAt: connection.connectedAt,
      updatedAt: connection.updatedAt,
    }
  },
})
