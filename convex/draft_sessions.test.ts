import { convexTest } from 'convex-test'
import type { FunctionArgs } from 'convex/server'
import { beforeEach, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
type CreateSessionArgs = FunctionArgs<typeof api.sessions.create>

beforeEach(() => {
  vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'test-secret')
})

const createArgs = {
  prompt: 'Build a speculative draft site',
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  anonymousClientId: 'anon-draft-client',
  workspace: 'workspace_draft_publish',
  serverSecret: 'test-secret',
} satisfies Omit<CreateSessionArgs, 'isDraft'>

test('speculative sessions are stored as drafts until the same workspace is submitted', async () => {
  const t = convexTest(schema, modules)

  const draft = await t.mutation(api.sessions.create, {
    serverSecret: process.env.SHARE_BONUS_MUTATION_SECRET,
    ...createArgs,
    isDraft: true,
  })
  const storedDraft = await t.run((ctx) => ctx.db.get(draft.sessionId))

  expect(storedDraft?.isDraft).toBe(true)

  const published = await t.mutation(api.sessions.create, {
    serverSecret: process.env.SHARE_BONUS_MUTATION_SECRET,
    ...createArgs,
    isDraft: false,
  })
  const storedPublished = await t.run((ctx) => ctx.db.get(draft.sessionId))

  expect(published).toMatchObject({
    sessionId: draft.sessionId,
    idempotent: true,
  })
  expect(storedPublished?.isDraft).toBe(false)
})

test('public gallery excludes renderable draft sessions', async () => {
  const t = convexTest(schema, modules)
  const sessionId = await t.run(async (ctx) => {
    const draftSessionId = await ctx.db.insert('sessions', {
      prompt: 'Renderable draft gallery leak',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      isDraft: true,
      status: 'preview_ready',
      previewVersion: 1,
      workspace: 'workspace_renderable_draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await ctx.db.insert('previews', {
      sessionId: draftSessionId,
      version: 1,
      source: 'generation',
      createdAt: Date.now(),
    })

    return draftSessionId
  })

  const gallery = await t.query(api.sessions.listPublicSessions, {
    limit: 12,
    page: 1,
  })
  const detail = await t.query(api.sessions.getPublicGallerySession, {
    sessionId,
  })

  expect(gallery.items.map((item) => item.sessionId)).not.toContain(sessionId)
  expect(detail).toBeNull()
})

test('creating a draft session schedules a one-shot cleanup that hard-deletes it when still a draft', async () => {
  const t = convexTest(schema, modules)

  const draft = await t.mutation(api.sessions.create, {
    serverSecret: process.env.SHARE_BONUS_MUTATION_SECRET,
    ...createArgs,
    isDraft: true,
  })

  // A scheduled cleanup must be registered for this draft session.
  const scheduled = await t.run((ctx) =>
    ctx.db.system.query('_scheduled_functions').take(20),
  )
  expect(scheduled).toContainEqual(
    expect.objectContaining({
      name: 'sessions:deleteDraftSessionIfStillDraft',
      state: expect.objectContaining({ kind: 'pending' }),
    }),
  )

  // Simulate the scheduler firing after the TTL.
  await t.mutation(internal.sessions.deleteDraftSessionIfStillDraft, {
    sessionId: draft.sessionId,
  })

  const gone = await t.run((ctx) => ctx.db.get(draft.sessionId))
  const orphanTasks = await t.run((ctx) =>
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', draft.sessionId),
      )
      .collect(),
  )

  // Draft sessions are hard-deleted (no tombstone), and their graph is removed.
  expect(gone).toBeNull()
  expect(orphanTasks).toEqual([])
})

test('the scheduled draft cleanup is a no-op once the draft has been promoted to a real session', async () => {
  const t = convexTest(schema, modules)

  const draft = await t.mutation(api.sessions.create, {
    serverSecret: process.env.SHARE_BONUS_MUTATION_SECRET,
    ...createArgs,
    isDraft: true,
  })

  // Promote the draft by submitting a real generation for the same workspace.
  await t.mutation(api.sessions.create, {
    serverSecret: process.env.SHARE_BONUS_MUTATION_SECRET,
    ...createArgs,
    isDraft: false,
  })

  // Firing the scheduled cleanup that was registered at draft creation must
  // NOT touch the now-promoted session.
  await t.mutation(internal.sessions.deleteDraftSessionIfStillDraft, {
    sessionId: draft.sessionId,
  })

  const promoted = await t.run((ctx) => ctx.db.get(draft.sessionId))
  expect(promoted).not.toBeNull()
  expect(promoted?.isDraft).toBe(false)
  expect(promoted?.deletedAt).toBeUndefined()
})
