/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { beforeEach, describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { hashOwnerSecret } from './lib/session_access_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ownerSecret = 'gallery-thumbnail-owner-secret'
const serverSecret = 'gallery-preview-server-secret'

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
  beforeEach(() => {
    process.env.GALLERY_PREVIEW_MUTATION_SECRET = serverSecret
  })

  it('rejects an upload URL request without the server secret', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)

    // Generate-on-miss means ownership cannot gate this path, so the write
    // path is server-only. A browser caller has no secret and must be refused
    // — otherwise it can overwrite any public session's gallery image.
    await expect(
      t.mutation(api.gallery_preview_images.generateUploadUrl, {
        cacheVersion: '111',
        secret: 'wrong-secret',
        sessionId,
      }),
    ).rejects.toThrow('FORBIDDEN')
  })

  it('issues an upload URL to a server caller holding the secret', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)

    await expect(
      t.mutation(api.gallery_preview_images.generateUploadUrl, {
        cacheVersion: '111',
        secret: serverSecret,
        sessionId,
      }),
    ).resolves.toEqual(expect.any(String))
  })

  it('rejects clearCache without the server secret', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)
    const storageId = await storePng(t, 'cached')
    await t.mutation(api.gallery_preview_images.commit, {
      cacheVersion: '111',
      contentType: 'image/png',
      secret: serverSecret,
      sessionId,
      size: 6,
      storageId,
    })

    await expect(
      t.mutation(api.gallery_preview_images.clearCache, { secret: '' }),
    ).rejects.toThrow('FORBIDDEN')
    expect(await readRows(t)).toHaveLength(1)

    await t.mutation(api.gallery_preview_images.clearCache, {
      secret: serverSecret,
    })
    expect(await readRows(t)).toHaveLength(0)
  })

  it('replaces the session-keyed storage blob when cache version changes', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertPublicSession(t, 111)
    const firstStorageId = await storePng(t, 'first')

    const first = await t.mutation(api.gallery_preview_images.commit, {
      secret: serverSecret,
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
      secret: serverSecret,
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
      secret: serverSecret,
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
      secret: serverSecret,
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
