import { describe, expect, it } from 'vitest'

import type { QueryCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import {
  applyCachedTranslationsToSource,
  extractOpenUISourceStrings,
  loadCachedTranslationsForSource,
} from './session_translation_cache_helpers'

type CacheRow = {
  locale: string
  sourceText: string
  translation: string
}

type OverrideRow = {
  sessionId: string
  locale: string
  sourceText: string
  translation: string
}

function ctxWithTranslations(
  cacheRows: CacheRow[] = [],
  overrideRows: OverrideRow[] = [],
) {
  return {
    db: {
      query: (table: string) => ({
        withIndex: (
          _indexName: string,
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => void,
        ) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }
          applyIndex(index)

          if (table === 'translationCache') {
            return {
              take: async () =>
                cacheRows.filter((row) => row.locale === filters.get('locale')),
            }
          }

          if (table === 'sessionTranslationOverrides') {
            return {
              unique: async () => {
                const match = overrideRows.find(
                  (row) =>
                    row.sessionId === filters.get('sessionId') &&
                    row.locale === filters.get('locale') &&
                    row.sourceText === filters.get('sourceText'),
                )
                return match ? { translation: match.translation } : null
              },
            }
          }

          return { take: async () => [], unique: async () => null }
        },
      }),
    },
  } as unknown as Pick<QueryCtx, 'db'>
}

describe('session translation cache helpers', () => {
  it('extracts user-visible OpenUI string literals without URLs', () => {
    expect(
      extractOpenUISourceStrings(
        'root = RestaurantMenu("Our Brew Selection", "/menu", "https://example.test/logo.svg", "Pineapple Saison")',
      ),
    ).toEqual(['Our Brew Selection', 'Pineapple Saison'])
  })

  it('loads cached translations positionally by locale and applies every matching source occurrence', async () => {
    const source =
      'home = RestaurantMenu("Our Brew Selection", "Pineapple Saison")\nmenu = RestaurantMenu("Our Brew Selection", "Chocolate Stout")\nroot = Stack([home, menu])'
    const translations = await loadCachedTranslationsForSource(
      ctxWithTranslations([
        {
          locale: 'te',
          sourceText: 'Our Brew Selection',
          translation: 'మా బీర్ ఎంపిక',
        },
        {
          locale: 'te',
          sourceText: 'Pineapple Saison',
          translation: 'అనాసపండు సైసన్',
        },
      ]),
      'te',
      source,
    )

    const translated = applyCachedTranslationsToSource(source, translations)

    expect(translated).toContain('మా బీర్ ఎంపిక')
    expect(translated).toContain('అనాసపండు సైసన్')
    expect(translated).not.toContain('Our Brew Selection')
    expect(translated).toContain('Chocolate Stout')
  })

  it('session overrides take priority over the global cache', async () => {
    const source = 'root = Hero("Welcome", "Get started")'
    const sessionId = 's1' as Id<'sessions'>
    const translations = await loadCachedTranslationsForSource(
      ctxWithTranslations(
        [
          {
            locale: 'hi',
            sourceText: 'Welcome',
            translation: 'स्वागत है',
          },
          {
            locale: 'hi',
            sourceText: 'Get started',
            translation: 'शुरू करें',
          },
        ],
        [
          {
            sessionId: 's1',
            locale: 'hi',
            sourceText: 'Welcome',
            translation: 'पधारो म्हारे देस',
          },
        ],
      ),
      'hi',
      source,
      sessionId,
    )

    const translated = applyCachedTranslationsToSource(source, translations)

    // Override wins for "Welcome"
    expect(translated).toContain('पधारो म्हारे देस')
    expect(translated).not.toContain('स्वागत है')
    // Global cache fills in "Get started"
    expect(translated).toContain('शुरू करें')
  })

  it('returns global cache translations when no sessionId is provided', async () => {
    const source = 'root = Hero("Welcome")'
    const translations = await loadCachedTranslationsForSource(
      ctxWithTranslations(
        [
          {
            locale: 'hi',
            sourceText: 'Welcome',
            translation: 'स्वागत है',
          },
        ],
        [
          {
            sessionId: 's1',
            locale: 'hi',
            sourceText: 'Welcome',
            translation: 'पधारो म्हारे देस',
          },
        ],
      ),
      'hi',
      source,
    )

    const translated = applyCachedTranslationsToSource(source, translations)

    // No sessionId → only global cache applies
    expect(translated).toContain('स्वागत है')
    expect(translated).not.toContain('पधारो म्हारे देस')
  })
})
