import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const DEFAULT_PREFERRED_EXPORT_TARGET = 'html'
const DEFAULT_PREFERRED_LANGUAGE = 'en'

function normalizePreferredLanguage(value: string): string {
  const requested = String(value || '').trim().toLowerCase()
  if (!requested || requested === 'en') return DEFAULT_PREFERRED_LANGUAGE
  if (requested === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(requested)) return requested
  if (/^[a-z]{2,8}-latn$/.test(requested)) return requested
  return /^[a-z]{2,8}$/.test(requested) ? requested : DEFAULT_PREFERRED_LANGUAGE
}

function normalizePreferredExportTarget(value: string): string {
  const target = String(value || '').trim().toLowerCase()
  return ['html', 'nextjs', 'astro', 'sveltekit'].includes(target)
    ? target
    : DEFAULT_PREFERRED_EXPORT_TARGET
}

export const mirrorLegacySession = mutation({
  args: {
    legacySessionId: v.string(),
    prompt: v.string(),
    workspace: v.string(),
    anonOwnerSecret: v.optional(v.string()),
    preferredExportTarget: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject
    const existing = await ctx.db
      .query('sessions')
      .withIndex('by_legacySessionId', (q) => q.eq('legacySessionId', args.legacySessionId))
      .unique()

    const patch = {
      userId,
      legacySessionId: args.legacySessionId,
      prompt: args.prompt,
      workspace: args.workspace,
      homepageReady: false,
      siteSpecReady: false,
      openuiReady: false,
      preferredExportTarget: normalizePreferredExportTarget(
        args.preferredExportTarget ?? DEFAULT_PREFERRED_EXPORT_TARGET,
      ),
      preferredLanguage: normalizePreferredLanguage(
        args.preferredLanguage ?? DEFAULT_PREFERRED_LANGUAGE,
      ),
      isPrivate: args.isPrivate ?? false,
      anonOwnerSecret: userId ? undefined : args.anonOwnerSecret,
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch)
      return existing._id
    }

    return ctx.db.insert('sessions', {
      ...patch,
      createdAt: Date.now(),
    })
  },
})

export const getByLegacySessionId = query({
  args: { legacySessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_legacySessionId', (q) => q.eq('legacySessionId', args.legacySessionId))
      .unique()
    if (!session) return null

    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject
    if (session.userId && session.userId !== userId) return null
    return session
  },
})

export const claimLegacySession = mutation({
  args: {
    legacySessionId: v.string(),
    anonOwnerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity?.subject) throw new Error('Not authenticated')

    const session = await ctx.db
      .query('sessions')
      .withIndex('by_legacySessionId', (q) => q.eq('legacySessionId', args.legacySessionId))
      .unique()
    if (!session) throw new Error('Session not found')
    if (session.userId) throw new Error('Session already has an owner')
    if (session.anonOwnerSecret !== args.anonOwnerSecret) throw new Error('Invalid secret')

    await ctx.db.patch(session._id, {
      userId: identity.subject,
      anonOwnerSecret: undefined,
    })
    return session._id
  },
})

export const saveProgramOverride = mutation({
  args: {
    sessionId: v.id('sessions'),
    program: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      programOverride: args.program,
    })
  },
})

export const deleteSession = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.userId && session.userId !== userId) throw new Error('Not authorized')

    await ctx.db.delete(args.sessionId)
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_userId', (q) => q.eq('userId', userId ?? undefined))
      .take(20)

    return sessions
  },
})
