import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const CLAIM_LEASE_MS = 30_000

function cacheKey(locale: string, text: string) {
  return `${locale.trim().toLowerCase()}\n${text.trim()}`
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

export const completeBatch = mutation({
  args: {
    locale: v.string(),
    owner: v.string(),
    entries: v.array(
      v.object({
        text: v.string(),
        translation: v.string(),
      }),
    ),
  },
  returns: v.array(v.union(v.string(), v.null())),
  handler: async (ctx, args) => {
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
      if (claim?.owner !== owner) {
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
  },
  returns: v.number(),
  handler: async (ctx, args) => {
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
