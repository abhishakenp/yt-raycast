/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const ownerUserId = 'https://clerk.release.test|public-owner'

function publicIdentityReleaseTest() {
  return convexTest(schema, modules)
}

function editOwnerId(edit: unknown) {
  if (edit === null || typeof edit !== 'object') return null
  const userId = Reflect.get(edit, 'userId')
  return typeof userId === 'string' ? userId : null
}

async function insertPublicOwnedSession(
  t: ReturnType<typeof publicIdentityReleaseTest>,
) {
  return await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      userId: ownerUserId,
      ownerEmail: 'public-owner@example.test',
      prompt: 'Public release sharing fixture',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: 'preview_ready',
      previewVersion: 2,
      createdAt: 1,
      updatedAt: 2,
    })
    await ctx.db.insert('edits', {
      sessionId,
      previewVersion: 2,
      editType: 'text',
      beforeText: 'Before',
      afterText: 'After',
      createdAt: 2,
      userId: ownerUserId,
    })
    return sessionId
  })
}

describe('public session identity redaction release boundaries', () => {
  it('does not disclose the stable owner identifier in anonymous public reads', async () => {
    const t = publicIdentityReleaseTest()
    const sessionId = await insertPublicOwnedSession(t)
    const [eventStream, generationView, readiness, workspace, edits] =
      await Promise.all([
        t.query(api.sessions.getEventStream, { sessionId }),
        t.query(api.sessions.getGenerationView, { sessionId }),
        t.query(api.sessions.getSessionReadiness, { sessionId }),
        t.query(api.sessions.getWorkspace, { sessionId }),
        t.query(api.sessions.listEdits, { lookup: sessionId }),
      ])

    expect({
      editOwnerIds: edits.map(editOwnerId),
      eventStreamOwnerId: eventStream?.session.userId ?? null,
      generationViewOwnerId: generationView?.session.userId ?? null,
      readinessOwnerId: readiness?.session.userId ?? null,
      workspaceOwnerId: workspace?.session.userId ?? null,
    }).toEqual({
      editOwnerIds: [null],
      eventStreamOwnerId: null,
      generationViewOwnerId: null,
      readinessOwnerId: null,
      workspaceOwnerId: null,
    })
  })
})
