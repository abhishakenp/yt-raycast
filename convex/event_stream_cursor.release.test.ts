/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function eventStreamReleaseTest() {
  return convexTest(schema, modules)
}

async function insertSessionWithTiedEvents(
  t: ReturnType<typeof eventStreamReleaseTest>,
) {
  return await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      prompt: 'Event stream cursor release fixture',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: 1,
    })

    for (const message of ['first', 'second', 'third']) {
      await ctx.db.insert('generationEvents', {
        sessionId,
        eventType: 'preview_reload',
        message,
        previewVersion: 1,
        createdAt: 100,
      })
    }

    return sessionId
  })
}

describe('generation event stream cursor release boundaries', () => {
  it('does not lose events sharing the timestamp at a page boundary', async () => {
    const t = eventStreamReleaseTest()
    const sessionId = await insertSessionWithTiedEvents(t)

    const firstPage = await t.query(api.sessions.getEventStream, {
      sessionId,
      limit: 2,
    })
    const secondPage = await t.query(api.sessions.getEventStream, {
      sessionId,
      limit: 2,
      since: firstPage?.cursor ?? undefined,
    })
    const messages = [
      ...(firstPage?.events ?? []),
      ...(secondPage?.events ?? []),
    ].map((event) => event.message)

    expect(messages).toEqual(['first', 'second', 'third'])
    expect(new Set(messages).size).toBe(3)
  })
})
