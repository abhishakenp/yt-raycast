import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('section content cache', () => {
  it('stores and reuses AI-authored content by prompt cache key', async () => {
    const t = convexTest(schema, modules)
    const promptCacheKey = 'homepage:coffee-roastery:en'
    const contentJson = JSON.stringify({
      hero: { headline: 'Portland Coffee Roastery' },
      sections: ['subscriptions', 'tasting events'],
    })

    await expect(
      t.query(internal.contentCache.get, { promptCacheKey }),
    ).resolves.toBeNull()

    await t.mutation(internal.contentCache.set, {
      promptCacheKey,
      contentJson,
    })

    await expect(
      t.query(internal.contentCache.get, { promptCacheKey }),
    ).resolves.toBe(contentJson)
  })

  it('updates existing cached content instead of returning stale model output', async () => {
    const t = convexTest(schema, modules)
    const promptCacheKey = 'homepage:restaurant:es-MX'

    await t.mutation(internal.contentCache.set, {
      promptCacheKey,
      contentJson: '{"headline":"Old"}',
    })
    await t.mutation(internal.contentCache.set, {
      promptCacheKey,
      contentJson: '{"headline":"Updated"}',
    })

    await expect(
      t.query(internal.contentCache.get, { promptCacheKey }),
    ).resolves.toBe('{"headline":"Updated"}')
  })
})
