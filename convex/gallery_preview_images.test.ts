/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { hashOwnerSecret } from './lib/session_access_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ownerSecret = 'gallery-thumbnail-owner-secret'

const insertPublicSession = async (
  t: ReturnType<typeof convexTest>,
  updatedAt: number,
) =>
  await t.run(async (ctx) => {
    return await ctx.db.insert('sessions', {
      createdAt: 100,
      anonOwnerSecretHash: await hashOwnerSecret(ownerSecret),
      isPrivate: false,
      preferredExportTarget: 'html',
      preferredLanguage: 'en',
      prompt: 'Cached preview image',
      status: 'preview_ready',
      updatedAt,
    })
  })

const storePng = async (t: ReturnType<typeof convexTest>, contents: string) =>
  await t.action(async (ctx) => {
    return await ctx.storage.store(new Blob([contents], { type: 'image/png' }))
  })

const readRows = async (t: ReturnType<typeof convexTest>) =>
  await t.run(async (ctx) => {
    return await ctx.db.query('galleryPreviewImages').collect()
  })

const readStorageExists = async (
  t: ReturnType<typeof convexTest>,
  storageId: Id<'_storage'>,
) =>
  await t.run(async (ctx) => {
    return (await ctx.db.system.get('_storage', storageId)) !== null
  })

describe('gallery preview image storage', () => {
  it('allows thumbnail generation for public sessions without owner secret (gallery generate-on-miss)', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)

    // No anonymousOwnerSecret — gallery visitors are not the session owner.
    // Public sessions allow thumbnail generation so the generate-on-miss
    // fallback works for any visitor.
    await expect(
      t.mutation(api.gallery_preview_images.generateUploadUrl, {
        cacheVersion: '111',
        sessionId,
      }),
    ).resolves.toEqual(expect.any(String))
  })

  it('replaces the session-keyed storage blob when cache version changes', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)
    const firstStorageId = await storePng(t, 'first')

    const first = await t.mutation(api.gallery_preview_images.commit, {
      anonymousOwnerSecret: ownerSecret,
      cacheVersion: '111',
      contentType: 'image/png',
      sessionId,
      size: 5,
      storageId: firstStorageId,
    })

    await t.run(async (ctx) => {
      await ctx.db.patch(sessionId, { updatedAt: 222 })
    })
    const secondStorageId = await storePng(t, 'second')
    const second = await t.mutation(api.gallery_preview_images.commit, {
      anonymousOwnerSecret: ownerSecret,
      cacheVersion: '222',
      contentType: 'image/png',
      sessionId,
      size: 6,
      storageId: secondStorageId,
    })

    const rows = await readRows(t)
    expect(first.status).toBe('stored')
    expect(second.status).toBe('stored')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      cacheVersion: '222',
      sessionId,
      size: 6,
      storageId: secondStorageId,
    })
    expect(await readStorageExists(t, firstStorageId)).toBe(false)
    expect(await readStorageExists(t, secondStorageId)).toBe(true)
  })

  it('deletes stale uploaded blobs without overwriting the current row', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 333)
    const currentStorageId = await storePng(t, 'current')
    await t.mutation(api.gallery_preview_images.commit, {
      anonymousOwnerSecret: ownerSecret,
      cacheVersion: '333',
      contentType: 'image/png',
      sessionId,
      size: 7,
      storageId: currentStorageId,
    })

    await t.run(async (ctx) => {
      await ctx.db.patch(sessionId, { updatedAt: 444 })
    })
    const staleStorageId = await storePng(t, 'stale')
    const stale = await t.mutation(api.gallery_preview_images.commit, {
      anonymousOwnerSecret: ownerSecret,
      cacheVersion: '333',
      contentType: 'image/png',
      sessionId,
      size: 5,
      storageId: staleStorageId,
    })

    const rows = await readRows(t)
    expect(stale.status).toBe('stale')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.storageId).toBe(currentStorageId)
    expect(await readStorageExists(t, staleStorageId)).toBe(false)
  })
})
