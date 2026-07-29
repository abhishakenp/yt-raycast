/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const storeImage = async (
  t: ReturnType<typeof convexTest>,
  contents: string,
  contentType = 'image/jpeg',
) =>
  await t.action(async (ctx) => {
    return await ctx.storage.store(new Blob([contents], { type: contentType }))
  })

const readRows = async (t: ReturnType<typeof convexTest>) =>
  await t.run(async (ctx) => {
    return await ctx.db.query('pollinationsImageCache').collect()
  })

const readStorageExists = async (
  t: ReturnType<typeof convexTest>,
  storageId: Id<'_storage'>,
) =>
  await t.run(async (ctx) => {
    return (await ctx.db.system.get('_storage', storageId)) !== null
  })

describe('pollinations image cache storage', () => {
  it('inserts a new cache row keyed by cacheKey', async () => {
    const t = convexTest(schema, modules)
    const storageId = await storeImage(t, 'first-bytes')

    const result = await t.mutation(api.pollinations_image_cache.commit, {
      cacheKey: 'craft beer brewery|800x600|42|flux',
      contentType: 'image/jpeg',
      size: 11,
      storageId,
    })

    const rows = await readRows(t)
    expect(result.status).toBe('stored')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      cacheKey: 'craft beer brewery|800x600|42|flux',
      contentType: 'image/jpeg',
      size: 11,
      storageId,
    })
  })

  it('upserts in place and deletes the previous blob when cacheKey already exists', async () => {
    const t = convexTest(schema, modules)
    const firstStorageId = await storeImage(t, 'first')
    await t.mutation(api.pollinations_image_cache.commit, {
      cacheKey: 'hero|1024x768|7|flux',
      contentType: 'image/jpeg',
      size: 5,
      storageId: firstStorageId,
    })

    const secondStorageId = await storeImage(t, 'second')
    const second = await t.mutation(api.pollinations_image_cache.commit, {
      cacheKey: 'hero|1024x768|7|flux',
      contentType: 'image/jpeg',
      size: 6,
      storageId: secondStorageId,
    })

    const rows = await readRows(t)
    expect(second.status).toBe('stored')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      cacheKey: 'hero|1024x768|7|flux',
      storageId: secondStorageId,
      size: 6,
    })
    expect(await readStorageExists(t, firstStorageId)).toBe(false)
    expect(await readStorageExists(t, secondStorageId)).toBe(true)
  })

  it('returns null from get when no row matches the cacheKey', async () => {
    const t = convexTest(schema, modules)
    const result = await t.query(api.pollinations_image_cache.get, {
      cacheKey: 'nope|1x1|0|flux',
    })
    expect(result).toBeNull()
  })

  it('returns the stored blob url + content type from get when a row exists', async () => {
    const t = convexTest(schema, modules)
    const storageId = await storeImage(t, 'bytes', 'image/png')
    await t.mutation(api.pollinations_image_cache.commit, {
      cacheKey: 'portrait|400x600|99|flux',
      contentType: 'image/png',
      size: 5,
      storageId,
    })

    const result = await t.query(api.pollinations_image_cache.get, {
      cacheKey: 'portrait|400x600|99|flux',
    })

    expect(result).not.toBeNull()
    expect(result?.contentType).toBe('image/png')
    expect(result?.storageId).toBe(storageId)
    expect(typeof result?.url).toBe('string')
  })
})
