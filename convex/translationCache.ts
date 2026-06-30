import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const cacheKey = (locale: string, text: string) =>
  `${locale.trim().toLowerCase()}\n${text.trim()}`

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
    }
  },
})
