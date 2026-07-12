import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  addGenerationProgressEvent,
  markSessionGenerationStarted,
  upsertGeneratedModuleRecord,
} from './session_generation_progress_helpers'

type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type SessionRecord = Doc<'sessions'>
type TaskRecord = Doc<'tasks'>

const sessionId = 'session_generation_progress' as Id<'sessions'>

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    status: 'queued',
    createdAt: 1,
    ...overrides,
  } as SessionRecord
}

function generatedModuleDoc(
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord {
  return {
    _id: 'generated_module_existing' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '<main>Old</main>',
    status: 'failed',
    errorMessage: 'previous failure',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  } as GeneratedModuleRecord
}

function ctxFor(input: {
  sessions?: SessionRecord[]
  tasks?: TaskRecord[]
  generatedModules?: GeneratedModuleRecord[]
}) {
  const sessions = [...(input.sessions ?? [])]
  const tasks = [...(input.tasks ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const generationEvents: GenerationEventRecord[] = []
  let nextId = 1

  const rowsFor = (table) => {
    switch (table) {
      case 'sessions':
        return sessions
      case 'tasks':
        return tasks
      case 'generatedModules':
        return generatedModules
      case 'generationEvents':
        return generationEvents
      default:
        return []
    }
  }

  const filterRows = (table, filters) =>
    rowsFor(table).filter((row) =>
      Array.from(filters.entries()).every(
        ([field, value]) => (row as Record<string, unknown>)[field] === value,
      ),
    )

  const db = {
    get: async (id) => sessions.find((session) => session._id === id) ?? null,
    query: (table) => ({
      withIndex: (_indexName, applyIndex) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field, value) => {
            filters.set(field, value)
            return index
          },
        }
        applyIndex(index)

        return {
          first: async () => filterRows(table, filters)[0] ?? null,
        }
      },
    }),
    insert: async (table, value) => {
      const row = {
        _id: `${table}_${nextId++}`,
        _creationTime: 1,
        ...value,
      }
      rowsFor(table).push(row as never)
      return row._id
    },
    patch: async (id, value) => {
      for (const rows of [
        sessions,
        tasks,
        generatedModules,
        generationEvents,
      ]) {
        const rowIndex = rows.findIndex((row) => row._id === id)
        if (rowIndex >= 0) {
          rows[rowIndex] = { ...rows[rowIndex], ...value }
          return
        }
      }
      throw new Error(`Missing row ${id}`)
    },
  } as unknown as Pick<MutationCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<MutationCtx, 'db'>,
    sessions,
    tasks,
    generatedModules,
    generationEvents,
  }
}

describe('session generation progress helpers', () => {
  it('marks eligible sessions as streaming and records the homepage task', async () => {
    const { ctx, sessions, tasks, generationEvents } = ctxFor({
      sessions: [sessionDoc({ status: 'created' })],
    })

    await expect(
      markSessionGenerationStarted(ctx, sessionId, 100),
    ).resolves.toEqual({ started: true })

    expect(sessions).toEqual([
      expect.objectContaining({
        _id: sessionId,
        status: 'streaming',
        errorCode: undefined,
        errorMessage: undefined,
        updatedAt: 100,
      }),
    ])
    expect(tasks).toEqual([
      expect.objectContaining({
        sessionId,
        taskKey: 'homepage',
        title: 'Generate homepage',
        status: 'running',
        order: 0,
        createdAt: 100,
        updatedAt: 100,
      }),
    ])
    expect(generationEvents).toEqual([
      expect.objectContaining({
        sessionId,
        eventType: 'status',
        message: 'Generation started',
        createdAt: 100,
      }),
    ])
  })

  it('rejects missing, completed, active, and non-startable sessions without writes', async () => {
    await expect(
      markSessionGenerationStarted(ctxFor({}).ctx, sessionId, 100),
    ).resolves.toEqual({ started: false, reason: 'not_found' })

    await expect(
      markSessionGenerationStarted(
        ctxFor({ sessions: [sessionDoc({ previewVersion: 1 })] }).ctx,
        sessionId,
        100,
      ),
    ).resolves.toEqual({
      started: false,
      reason: 'preview_already_exists',
    })

    await expect(
      markSessionGenerationStarted(
        ctxFor({ sessions: [sessionDoc({ status: 'streaming' })] }).ctx,
        sessionId,
        100,
      ),
    ).resolves.toEqual({
      started: false,
      reason: 'generation_already_started',
    })

    const nonStartable = ctxFor({
      sessions: [sessionDoc({ status: 'failed' })],
    })
    await expect(
      markSessionGenerationStarted(nonStartable.ctx, sessionId, 100),
    ).resolves.toEqual({
      started: false,
      reason: 'generation_not_startable',
    })
    expect(nonStartable.tasks).toEqual([])
    expect(nonStartable.generationEvents).toEqual([])
  })

  it('upserts generated modules and clears stale module errors', async () => {
    const { ctx, generatedModules } = ctxFor({
      generatedModules: [generatedModuleDoc()],
    })

    await upsertGeneratedModuleRecord(ctx, {
      sessionId,
      moduleKey: 'home',
      source: '<main>New</main>',
      status: 'running',
      now: 200,
    })
    await upsertGeneratedModuleRecord(ctx, {
      sessionId,
      moduleKey: 'about',
      source: '<main>About</main>',
      now: 300,
    })

    expect(generatedModules).toEqual([
      expect.objectContaining({
        _id: 'generated_module_existing',
        source: '<main>New</main>',
        status: 'running',
        errorMessage: undefined,
        updatedAt: 200,
      }),
      expect.objectContaining({
        sessionId,
        moduleKey: 'about',
        source: '<main>About</main>',
        status: 'succeeded',
        createdAt: 300,
        updatedAt: 300,
      }),
    ])
  })

  it('adds generation events and only status events advance active sessions', async () => {
    const { ctx, sessions, generationEvents } = ctxFor({
      sessions: [sessionDoc({ status: 'queued' })],
    })

    await addGenerationProgressEvent(ctx, {
      sessionId,
      eventType: 'phase',
      message: 'Planning',
      previewVersion: 2,
      now: 400,
    })
    await addGenerationProgressEvent(ctx, {
      sessionId,
      eventType: 'status',
      message: 'Still working',
      now: 500,
    })

    expect(generationEvents).toEqual([
      expect.objectContaining({
        eventType: 'phase',
        message: 'Planning',
        previewVersion: 2,
        createdAt: 400,
      }),
      expect.objectContaining({
        eventType: 'status',
        message: 'Still working',
        createdAt: 500,
      }),
    ])
    expect(sessions).toEqual([
      expect.objectContaining({
        status: 'streaming',
        updatedAt: 500,
      }),
    ])

    const completed = ctxFor({
      sessions: [sessionDoc({ previewVersion: 1, status: 'preview_ready' })],
    })
    await addGenerationProgressEvent(completed.ctx, {
      sessionId,
      eventType: 'status',
      now: 600,
    })
    expect(completed.sessions[0]).toMatchObject({
      status: 'preview_ready',
    })
    expect(completed.sessions[0]?.updatedAt).toBeUndefined()
  })
})
