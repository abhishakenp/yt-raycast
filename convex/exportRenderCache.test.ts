import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('export render cache', () => {
  it('returns only hashes with a stored entry, batched in one call', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(internal.exportRenderCache.setMany, {
      entries: [
        { hash: 'hash-a', content: 'export const a = 1\n' },
        { hash: 'hash-b', content: 'export const b = 2\n' },
      ],
    })

    const hits = await t.query(internal.exportRenderCache.getMany, {
      hashes: ['hash-a', 'hash-b', 'hash-missing'],
    })

    expect(hits).toEqual({
      'hash-a': 'export const a = 1\n',
      'hash-b': 'export const b = 2\n',
    })
  })

  it('returns an empty object when no hashes match', async () => {
    const t = convexTest(schema, modules)

    const hits = await t.query(internal.exportRenderCache.getMany, {
      hashes: ['unknown-hash'],
    })

    expect(hits).toEqual({})
  })

  it('updates an existing entry in place instead of duplicating it', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(internal.exportRenderCache.setMany, {
      entries: [{ hash: 'hash-a', content: 'old' }],
    })
    await t.mutation(internal.exportRenderCache.setMany, {
      entries: [{ hash: 'hash-a', content: 'new' }],
    })

    const hits = await t.query(internal.exportRenderCache.getMany, {
      hashes: ['hash-a'],
    })
    expect(hits).toEqual({ 'hash-a': 'new' })
  })

  it('accepts an empty batch without error', async () => {
    const t = convexTest(schema, modules)

    // Convex serializes a handler's implicit `undefined` return as `null`.
    await expect(
      t.mutation(internal.exportRenderCache.setMany, { entries: [] }),
    ).resolves.toBeNull()
    await expect(
      t.query(internal.exportRenderCache.getMany, { hashes: [] }),
    ).resolves.toEqual({})
  })
})
