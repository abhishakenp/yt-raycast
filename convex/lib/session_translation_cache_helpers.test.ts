import { describe, expect, it } from 'vitest'

import type { QueryCtx } from '../_generated/server'
import {
  applyCachedTranslationsToSource,
  extractOpenUISourceStrings,
  loadCachedTranslationsForSource,
} from './session_translation_cache_helpers'

const ctxWithTranslations = (
  rows: Array<{ locale: string; sourceText: string; translation: string }>,
) =>
  ({
    db: {
      query: (table: string) => ({
        withIndex: (
          _indexName: string,
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => unknown,
        ) => {
          expect(table).toBe('translationCache')
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }
          applyIndex(index)
          return {
            take: async () =>
              rows.filter((row) => row.locale === filters.get('locale')),
          }
        },
      }),
    },
  }) as unknown as Pick<QueryCtx, 'db'>

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
})
