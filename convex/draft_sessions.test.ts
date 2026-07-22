import { convexTest } from 'convex-test'
import type { FunctionArgs } from 'convex/server'
import { expect, test } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
type CreateSessionArgs = FunctionArgs<typeof api.sessions.create>

const createArgs = {
  prompt: 'Build a speculative draft site',
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  anonymousClientId: 'anon-draft-client',
  workspace: 'workspace_draft_publish',
} satisfies Omit<CreateSessionArgs, 'isDraft'>

test('speculative sessions are stored as drafts until the same workspace is submitted', async () => {
  const t = convexTest(schema, modules)

  const draft = await t.mutation(api.sessions.create, {
    ...createArgs,
    isDraft: true,
  })
  const storedDraft = await t.run((ctx) => ctx.db.get(draft.sessionId))

  expect(storedDraft?.isDraft).toBe(true)

  const published = await t.mutation(api.sessions.create, {
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
      html: '<main>Draft should stay hidden</main>',
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

test('submitting a real generation deletes draft sessions older than fifteen minutes', async () => {
  const t = convexTest(schema, modules)
  const staleDraftId = await t.run(async (ctx) => {
    const createdAt = Date.now() - 16 * 60 * 1_000
    const sessionId = await ctx.db.insert('sessions', {
      prompt: 'Expired speculative draft',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      isDraft: true,
      status: 'queued',
      previewVersion: 0,
      workspace: 'workspace_expired_draft',
      createdAt,
      updatedAt: createdAt,
    })

    await ctx.db.insert('tasks', {
      sessionId,
      taskKey: 'homepage',
      title: 'Generate homepage',
      status: 'pending',
      order: 0,
      createdAt,
      updatedAt: createdAt,
    })

    return sessionId
  })

  await t.mutation(api.sessions.create, {
    ...createArgs,
    prompt: 'Build a submitted public site',
    anonymousClientId: 'anon-submitted-client',
    workspace: 'workspace_submitted_public',
  })

  const staleDraft = await t.run((ctx) => ctx.db.get(staleDraftId))
  const staleDraftTasks = await t.run((ctx) =>
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', staleDraftId))
      .collect(),
  )

  expect(staleDraft).toBeNull()
  expect(staleDraftTasks).toEqual([])
})
