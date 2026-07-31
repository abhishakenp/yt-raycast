import { v, ConvexError } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  SERVER_MUTATION_SECRET_ENV,
  verifyServerSecret,
} from './lib/server_secret'
import type { Id } from './_generated/dataModel'
import { isAuthDisabled } from './lib/session_export_helpers'

const CLAIM_LEASE_MS = 30_000

function cacheKey(locale: string, text: string) {
  return `${locale.trim().toLowerCase()}\n${text.trim()}`
}

async function requireAuth(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> }
}): Promise<void> {
  if (isAuthDisabled()) return
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new ConvexError('Authentication required')
  }
}

const claimResultValidator = v.union(
  v.object({ state: v.literal('cached'), translation: v.string() }),
  v.object({ state: v.literal('claimed') }),
  v.object({ state: v.literal('pending') }),
)

export const getBatch = query({
  args: {
    locale: v.string(),
    texts: v.array(v.string()),
    sessionId: v.optional(v.id('sessions')),
  },
  handler: async (ctx, args) => {
    const locale = args.locale.trim().toLowerCase()
    const results: Array<string | null> = []

    for (const text of args.texts) {
      const sourceText = text.trim()
      if (!sourceText) {
        results.push('')
        continue
      }

      // Session-level overrides take priority over the global cache so
      // locale-scoped inline edits survive reloads without leaking to
      // other sessions that share the same source text + locale.
      if (args.sessionId !== undefined) {
        const override = await ctx.db
          .query('sessionTranslationOverrides')
          .withIndex('by_sessionId_locale_sourceText', (q) =>
            q
              .eq('sessionId', args.sessionId as Id<'sessions'>)
              .eq('locale', locale)
              .eq('sourceText', sourceText),
          )
          .unique()
        if (override) {
          results.push(override.translation)
          continue
        }
      }

      const row = await ctx.db
        .query('translationCache')
        .withIndex('by_cacheKey', (q) =>
          q.eq('cacheKey', cacheKey(locale, sourceText)),
        )
        .unique()
      results.push(row?.translation ?? null)
    }

    return results
  },
})

export const setBatch = mutation({
  args: {
    locale: v.string(),
    entries: v.array(
      v.object({
        text: v.string(),
        translation: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const locale = args.locale.trim().toLowerCase()
    const now = Date.now()

    for (const entry of args.entries) {
      const sourceText = entry.text.trim()
      const translation = entry.translation.trim()
      if (!sourceText || !translation) continue

      const key = cacheKey(locale, sourceText)
      const existing = await ctx.db
        .query('translationCache')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, { translation, updatedAt: now })
      } else {
        await ctx.db.insert('translationCache', {
          cacheKey: key,
          locale,
          sourceText,
          translation,
          createdAt: now,
          updatedAt: now,
        })
      }

      const claim = await ctx.db
        .query('translationCacheClaims')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()
      if (claim) await ctx.db.delete(claim._id)
    }
  },
})

export const claimBatch = mutation({
  args: {
    locale: v.string(),
    texts: v.array(v.string()),
    owner: v.string(),
  },
  returns: v.array(claimResultValidator),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const locale = args.locale.trim().toLowerCase()
    const owner = args.owner.trim()
    if (!owner) throw new Error('Translation cache claim owner is required.')

    const now = Date.now()
    const expiresAt = now + CLAIM_LEASE_MS
    const results: Array<
      | { state: 'cached'; translation: string }
      | { state: 'claimed' }
      | { state: 'pending' }
    > = []

    for (const text of args.texts) {
      const sourceText = text.trim()
      if (!sourceText) {
        results.push({ state: 'cached', translation: '' })
        continue
      }

      const key = cacheKey(locale, sourceText)
      const cached = await ctx.db
        .query('translationCache')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()
      if (cached) {
        results.push({ state: 'cached', translation: cached.translation })
        continue
      }

      const claim = await ctx.db
        .query('translationCacheClaims')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()
      if (!claim) {
        await ctx.db.insert('translationCacheClaims', {
          cacheKey: key,
          locale,
          sourceText,
          owner,
          expiresAt,
          createdAt: now,
          updatedAt: now,
        })
        results.push({ state: 'claimed' })
        continue
      }

      if (claim.owner === owner || claim.expiresAt <= now) {
        await ctx.db.patch(claim._id, { owner, expiresAt, updatedAt: now })
        results.push({ state: 'claimed' })
      } else {
        results.push({ state: 'pending' })
      }
    }

    return results
  },
})

/**
 * Server-only. The translation cache is shared across every session, so an
 * unauthenticated writer could seed arbitrary "translations" that all future
 * renders reuse.
 */
export const completeBatch = mutation({
  args: {
    locale: v.string(),
    owner: v.string(),
    secret: v.optional(v.string()),
    entries: v.array(
      v.object({
        text: v.string(),
        translation: v.string(),
      }),
    ),
  },
  returns: v.array(v.union(v.string(), v.null())),
  handler: async (ctx, args) => {
    verifyServerSecret(SERVER_MUTATION_SECRET_ENV, args.secret)
    const locale = args.locale.trim().toLowerCase()
    const owner = args.owner.trim()
    if (!owner) throw new Error('Translation cache claim owner is required.')

    const now = Date.now()
    const results: Array<string | null> = []

    for (const entry of args.entries) {
      const sourceText = entry.text.trim()
      const translation = entry.translation.trim()
      if (!sourceText || !translation) {
        results.push(null)
        continue
      }

      const key = cacheKey(locale, sourceText)
      const cached = await ctx.db
        .query('translationCache')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()
      const claim = await ctx.db
        .query('translationCacheClaims')
        .withIndex('by_cacheKey', (q) => q.eq('cacheKey', key))
        .unique()

      if (cached) {
        if (claim?.owner === owner) await ctx.db.delete(claim._id)
        results.push(cached.translation)
        continue
      }
      if (claim?.owner !== owner || claim.expiresAt <= now) {
        results.push(null)
        continue
      }

      await ctx.db.insert('translationCache', {
        cacheKey: key,
        locale,
        sourceText,
        translation,
        createdAt: now,
        updatedAt: now,
      })
      await ctx.db.delete(claim._id)
      results.push(translation)
    }

    return results
  },
})

export const releaseBatch = mutation({
  args: {
    locale: v.string(),
    texts: v.array(v.string()),
    owner: v.string(),
    secret: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    verifyServerSecret(SERVER_MUTATION_SECRET_ENV, args.secret)
    const locale = args.locale.trim().toLowerCase()
    const owner = args.owner.trim()
    if (!owner) return 0

    let released = 0
    for (const text of args.texts) {
      const sourceText = text.trim()
      if (!sourceText) continue
      const claim = await ctx.db
        .query('translationCacheClaims')
        .withIndex('by_cacheKey', (q) =>
          q.eq('cacheKey', cacheKey(locale, sourceText)),
        )
        .unique()
      if (claim?.owner !== owner) continue
      await ctx.db.delete(claim._id)
      released += 1
    }

    return released
  },
})
