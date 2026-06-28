import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

const userImageTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

const createReadySession = async (
  t: ReturnType<typeof userImageTest>,
  prompt = 'Test site',
) => {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_${prompt.toLowerCase().replace(/\W+/g, '_')}_${Math.random().toString(36).slice(2, 8)}`,
    anonymousClientId: `anon_${prompt.toLowerCase().replace(/\W+/g, '_')}_${Math.random().toString(36).slice(2, 8)}`,
    anonymousOwnerSecret: 'owner-secret',
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `<html><body><main><h1>${prompt}</h1></main></body></html>`,
    openUiSource: `$page = "Home"`,
    siteSpecJson: JSON.stringify({ hero: { headline: prompt } }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return sessionId
}

/** Store a blob in Convex storage via an action handler (storage.store is
 *  only available in actions, not mutations). Returns the storageId. */
const createStorageId = async (
  t: ReturnType<typeof userImageTest>,
): Promise<Id<'_storage'>> => {
  return await t.action(
    async (ctx: {
      storage: { store: (blob: Blob) => Promise<Id<'_storage'>> }
    }) => {
      return await ctx.storage.store(
        new Blob(['test-image-data'], { type: 'image/png' }),
      )
    },
  )
}

describe('user image upload helpers', () => {
  it('generateImageUploadUrl returns a URL for an owned session', async () => {
    const t = userImageTest()
    const sessionId = await createReadySession(t)

    const url = await t.mutation(api.sessions.generateImageUploadUrl, {
      sessionId: sessionId as Id<'sessions'>,
      anonymousOwnerSecret: 'owner-secret',
    })

    expect(typeof url).toBe('string')
    expect(url).toContain('http')
  })

  it('generateImageUploadUrl rejects wrong owner secret', async () => {
    const t = userImageTest()
    const sessionId = await createReadySession(t)

    await expect(
      t.mutation(api.sessions.generateImageUploadUrl, {
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toThrow()
  })

  it('saveUserImage stores metadata and listUserImages returns it with URL', async () => {
    const t = userImageTest()
    // Create storage ID first (actions can't run inside mutation transactions)
    const storageId = await createStorageId(t)
    const sessionId = await createReadySession(t)

    await t.mutation(api.sessions.saveUserImage, {
      sessionId: sessionId as Id<'sessions'>,
      anonymousOwnerSecret: 'owner-secret',
      storageId,
      filename: 'hero.png',
      contentType: 'image/png',
      size: 1024,
    })

    const images = await t.query(api.sessions.listUserImages, {
      sessionId: sessionId as Id<'sessions'>,
    })

    expect(images).toHaveLength(1)
    expect(images[0].filename).toBe('hero.png')
    expect(images[0].contentType).toBe('image/png')
    expect(images[0].size).toBe(1024)
    expect(images[0].url).not.toBeNull()
    expect(typeof images[0].url).toBe('string')
  })

  it('saveUserImage rejects non-image MIME types', async () => {
    const t = userImageTest()
    const storageId = await createStorageId(t)
    const sessionId = await createReadySession(t)

    await expect(
      t.mutation(api.sessions.saveUserImage, {
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: 'owner-secret',
        storageId,
        filename: 'doc.pdf',
        contentType: 'application/pdf',
        size: 512,
      }),
    ).rejects.toThrow()
  })

  it('saveUserImage rejects wrong owner secret', async () => {
    const t = userImageTest()
    const storageId = await createStorageId(t)
    const sessionId = await createReadySession(t)

    await expect(
      t.mutation(api.sessions.saveUserImage, {
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: 'wrong-secret',
        storageId,
        filename: 'hero.png',
        contentType: 'image/png',
        size: 100,
      }),
    ).rejects.toThrow()
  })

  it('listUserImages returns empty array for session with no uploads', async () => {
    const t = userImageTest()
    const sessionId = await createReadySession(t)

    const images = await t.query(api.sessions.listUserImages, {
      sessionId: sessionId as Id<'sessions'>,
    })

    expect(images).toEqual([])
  })

  it('listUserImages returns newest first', async () => {
    const t = userImageTest()

    // Create storage IDs first (actions can't run inside mutation transactions)
    const storageIds = []
    for (let i = 0; i < 2; i++) {
      storageIds.push(await createStorageId(t))
    }

    const sessionId = await createReadySession(t)

    for (const [i, name] of ['first.png', 'second.png'].entries()) {
      await t.mutation(api.sessions.saveUserImage, {
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: 'owner-secret',
        storageId: storageIds[i],
        filename: name,
        contentType: 'image/png',
        size: 100,
      })
    }

    const images = await t.query(api.sessions.listUserImages, {
      sessionId: sessionId as Id<'sessions'>,
    })

    expect(images).toHaveLength(2)
    expect(images[0].filename).toBe('second.png')
    expect(images[1].filename).toBe('first.png')
  })

  it('listUserImages only returns images for the specified session', async () => {
    const t = userImageTest()

    // Create storage ID first (actions can't run inside mutation transactions)
    const storageId = await createStorageId(t)

    const sessionA = await createReadySession(
      t,
      'A photography portfolio website',
    )
    const sessionB = await createReadySession(t, 'A coffee shop landing page')

    await t.mutation(api.sessions.saveUserImage, {
      sessionId: sessionA as Id<'sessions'>,
      anonymousOwnerSecret: 'owner-secret',
      storageId,
      filename: 'a.png',
      contentType: 'image/png',
      size: 50,
    })

    const imagesA = await t.query(api.sessions.listUserImages, {
      sessionId: sessionA as Id<'sessions'>,
    })
    const imagesB = await t.query(api.sessions.listUserImages, {
      sessionId: sessionB as Id<'sessions'>,
    })

    expect(imagesA).toHaveLength(1)
    expect(imagesA[0].filename).toBe('a.png')
    expect(imagesB).toEqual([])
  })
})
