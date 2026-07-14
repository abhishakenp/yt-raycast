/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

async function insertSession(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('sessions', {
      userId: `${issuer}|alice`,
      prompt: 'User image persistence fixture',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: true,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: Date.now(),
    })
  })
}

async function storeBlob(
  t: ReturnType<typeof convexTest>,
  contents: string,
  contentType: string,
) {
  return await t.action(async (ctx) => {
    return await ctx.storage.store(new Blob([contents], { type: contentType }))
  })
}

async function imageRows(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const rows = await ctx.db.query('userImages').collect()
    return rows.map((row) => ({
      contentType: row.contentType,
      filename: row.filename ?? null,
      sessionId: row.sessionId,
      size: row.size,
      storageId: row.storageId,
    }))
  })
}

describe('user image storage metadata and replay boundaries', () => {
  it('rejects spoofed MIME types and invalid declared sizes atomically', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t)
    const textStorageId = await storeBlob(t, 'not an image', 'text/plain')
    const imageStorageId = await storeBlob(t, 'image bytes', 'image/png')
    const alice = asUser(t, 'alice')

    const attempts = await Promise.allSettled([
      alice.mutation(api.sessions.saveUserImage, {
        sessionId,
        storageId: textStorageId,
        filename: 'spoofed.png',
        contentType: 'image/png',
        size: 12,
      }),
      alice.mutation(api.sessions.saveUserImage, {
        sessionId,
        storageId: imageStorageId,
        filename: 'negative-size.png',
        contentType: 'image/png',
        size: -1,
      }),
    ])

    expect({
      attempts: attempts.map((attempt) => attempt.status),
      rows: await imageRows(t),
    }).toEqual({ attempts: ['rejected', 'rejected'], rows: [] })
  })

  it('treats an identical save retry as idempotent', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t)
    const storageId = await storeBlob(t, 'image bytes', 'image/png')
    const alice = asUser(t, 'alice')
    const input = {
      sessionId,
      storageId,
      filename: 'hero.png',
      contentType: 'image/png',
      size: 11,
    }

    const first = await alice.mutation(api.sessions.saveUserImage, input)
    const replay = await alice.mutation(api.sessions.saveUserImage, input)

    expect({ first, replay, rows: await imageRows(t) }).toEqual({
      first,
      replay: first,
      rows: [
        {
          contentType: 'image/png',
          filename: 'hero.png',
          sessionId,
          size: 11,
          storageId,
        },
      ],
    })
  })
})
