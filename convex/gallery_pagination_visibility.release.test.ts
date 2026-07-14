/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function galleryReleaseTest() {
  return convexTest(schema, modules)
}

function gallerySessionId(item: unknown) {
  if (item === null || typeof item !== 'object') {
    throw new Error('Gallery item must be an object')
  }
  const sessionId = Reflect.get(item, 'sessionId')
  if (typeof sessionId !== 'string') {
    throw new Error('Gallery item must include a session id')
  }
  return sessionId
}

async function insertPublicSession(
  t: ReturnType<typeof galleryReleaseTest>,
  input: {
    createdAt: number
    prompt: string
    renderable: boolean
    status: 'failed' | 'preview_ready'
  },
) {
  return await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      prompt: input.prompt,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: input.status,
      previewVersion: input.renderable ? 1 : undefined,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    })

    if (input.renderable) {
      await ctx.db.insert('generatedModules', {
        sessionId,
        moduleKey: 'home',
        source: `root = Text(${JSON.stringify(input.prompt)})`,
        status: 'succeeded',
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
      })
    }

    return sessionId
  })
}

describe('public gallery pagination and visibility release boundaries', () => {
  it('paginates every public result beyond the internal scan window', async () => {
    const t = galleryReleaseTest()
    const sessionIds = []

    for (let index = 0; index < 105; index += 1) {
      sessionIds.push(
        await insertPublicSession(t, {
          createdAt: index + 1,
          prompt: `Release gallery item ${index + 1}`,
          renderable: true,
          status: 'preview_ready',
        }),
      )
    }

    const page = await t.query(api.sessions.listPublicSessions, {
      limit: 12,
      page: 9,
    })

    expect(page).toMatchObject({
      page: 9,
      limit: 12,
      total: 105,
      totalPages: 9,
      hasNext: false,
      hasPrev: true,
    })
    expect(page.items).toHaveLength(9)
    expect(page.items.map(gallerySessionId)).toEqual(
      sessionIds.slice(0, 9).reverse(),
    )
  })

  it('filters non-renderable rows before slicing so valid older work remains reachable', async () => {
    const t = galleryReleaseTest()
    const validSessionId = await insertPublicSession(t, {
      createdAt: 1,
      prompt: 'Renderable release portfolio',
      renderable: true,
      status: 'preview_ready',
    })

    for (let index = 0; index < 12; index += 1) {
      await insertPublicSession(t, {
        createdAt: index + 2,
        prompt: `Failed release generation ${index + 1}`,
        renderable: false,
        status: 'failed',
      })
    }

    const page = await t.query(api.sessions.listPublicSessions, {
      limit: 12,
      page: 1,
    })

    expect(page).toMatchObject({
      page: 1,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
    expect(page.items.map(gallerySessionId)).toEqual([validSessionId])
  })

  it('rejects fractional page and limit values instead of returning incoherent metadata', async () => {
    const limitAttempt = Promise.allSettled([
      tQuery(galleryReleaseTest(), { limit: 1.5, page: 1 }),
    ])
    const pageAttempt = Promise.allSettled([
      tQuery(galleryReleaseTest(), { limit: 12, page: 1.5 }),
    ])

    await expect(
      Promise.all([limitAttempt, pageAttempt]).then((attempts) =>
        attempts.flat().map((attempt) => attempt.status),
      ),
    ).resolves.toEqual(['rejected', 'rejected'])
  })
})

function tQuery(
  t: ReturnType<typeof galleryReleaseTest>,
  args: { limit: number; page: number },
) {
  return t.query(api.sessions.listPublicSessions, args)
}
