import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  cloneCachedGeneratedArtifacts,
  upsertHomeGeneratedModule,
  upsertSiteSpec,
} from './session_artifact_helpers'

type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type TaskRecord = Doc<'tasks'>
type UsageMetricRecord = Doc<'usageMetrics'>

const sessionId = 'session_artifacts' as Id<'sessions'>

const siteSpecDoc = (overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord =>
  ({
    _id: 'site_spec_existing' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"title":"Original"}',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as SiteSpecRecord

const generatedModuleDoc = (
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord =>
  ({
    _id: 'generated_module_existing' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '<main>Original</main>',
    status: 'succeeded',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as GeneratedModuleRecord

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
    _id: 'session_cached' as Id<'sessions'>,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    createdAt: 1,
    ...overrides,
  }) as SessionRecord

const previewDoc = (overrides: Partial<PreviewRecord> = {}): PreviewRecord =>
  ({
    _id: 'preview_cached' as Id<'previews'>,
    _creationTime: 1,
    sessionId: 'session_cached' as Id<'sessions'>,
    version: 1,
    html: '<main><h1>Cached</h1></main>',
    source: 'generation',
    createdAt: 1,
    ...overrides,
  }) as PreviewRecord

const taskDoc = (overrides: Partial<TaskRecord> = {}): TaskRecord =>
  ({
    _id: 'task_cached' as Id<'tasks'>,
    _creationTime: 1,
    sessionId: 'session_cached' as Id<'sessions'>,
    taskKey: 'homepage',
    title: 'Generate homepage',
    status: 'succeeded',
    order: 0,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as TaskRecord

const ctxFor = (
  initialSiteSpecs: SiteSpecRecord[] = [],
  initialGeneratedModules: GeneratedModuleRecord[] = [],
) => {
  const siteSpecs = [...initialSiteSpecs]
  const generatedModules = [...initialGeneratedModules]
  let nextSiteSpec = siteSpecs.length + 1
  let nextGeneratedModule = generatedModules.length + 1

  const db = {
    query: (table: 'siteSpecs' | 'generatedModules') => ({
      withIndex: (
        indexName: 'by_sessionId' | 'by_sessionId_moduleKey',
        applyIndex: (index: {
          eq: (field: string, value: unknown) => typeof index
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }

        applyIndex(index)

        return {
          first: async () => {
            if (table === 'siteSpecs' && indexName === 'by_sessionId') {
              return (
                siteSpecs.find(
                  (siteSpec) => siteSpec.sessionId === filters.get('sessionId'),
                ) ?? null
              )
            }

            if (
              table === 'generatedModules' &&
              indexName === 'by_sessionId_moduleKey'
            ) {
              return (
                generatedModules.find(
                  (generatedModule) =>
                    generatedModule.sessionId === filters.get('sessionId') &&
                    generatedModule.moduleKey === filters.get('moduleKey'),
                ) ?? null
              )
            }

            return null
          },
        }
      },
    }),
    insert: async (
      table: 'siteSpecs' | 'generatedModules',
      value: Record<string, unknown>,
    ) => {
      if (table === 'siteSpecs') {
        const id = `site_spec_${nextSiteSpec++}` as Id<'siteSpecs'>
        siteSpecs.push({
          _id: id,
          _creationTime: 1,
          ...value,
        } as SiteSpecRecord)
        return id
      }

      const id =
        `generated_module_${nextGeneratedModule++}` as Id<'generatedModules'>
      generatedModules.push({
        _id: id,
        _creationTime: 1,
        ...value,
      } as GeneratedModuleRecord)
      return id
    },
    patch: async (
      id: Id<'siteSpecs'> | Id<'generatedModules'>,
      value: Record<string, unknown>,
    ) => {
      const specIndex = siteSpecs.findIndex((siteSpec) => siteSpec._id === id)
      if (specIndex >= 0) {
        siteSpecs[specIndex] = {
          ...siteSpecs[specIndex],
          ...value,
        } as SiteSpecRecord
        return
      }

      const generatedModuleIndex = generatedModules.findIndex(
        (generatedModule) => generatedModule._id === id,
      )
      expect(generatedModuleIndex).toBeGreaterThanOrEqual(0)
      generatedModules[generatedModuleIndex] = {
        ...generatedModules[generatedModuleIndex],
        ...value,
      } as GeneratedModuleRecord
    },
  } as unknown as Pick<MutationCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<MutationCtx, 'db'>,
    siteSpecs,
    generatedModules,
  }
}

const cloneCtxFor = (input: {
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  tasks?: TaskRecord[]
}) => {
  const sessions = [...(input.sessions ?? [])]
  const previews = [...(input.previews ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]
  const tasks = [...(input.tasks ?? [])]
  const generationEvents: GenerationEventRecord[] = []
  const usageMetrics: UsageMetricRecord[] = []
  const schedulerCalls: Array<{
    delayMs: number
    event: Record<string, unknown>
  }> = []
  let nextId = 1

  const rowsFor = (table: string) => {
    switch (table) {
      case 'sessions':
        return sessions
      case 'previews':
        return previews
      case 'generatedModules':
        return generatedModules
      case 'siteSpecs':
        return siteSpecs
      case 'tasks':
        return tasks
      case 'generationEvents':
        return generationEvents
      case 'usageMetrics':
        return usageMetrics
      default:
        return []
    }
  }

  const filterRows = (table: string, filters: Map<string, unknown>) => {
    const rows = rowsFor(table)

    return rows.filter((row) =>
      Array.from(filters.entries()).every(
        ([field, value]) => (row as Record<string, unknown>)[field] === value,
      ),
    )
  }

  const db = {
    get: async (id: Id<'sessions'>) =>
      sessions.find((session) => session._id === id) ?? null,
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
        applyIndex: (index: {
          eq: (field: string, value: unknown) => typeof index
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }
        applyIndex(index)

        const first = async () => filterRows(table, filters)[0] ?? null
        const take = async (limit: number) =>
          filterRows(table, filters).slice(0, limit)

        return {
          first,
          take,
          order: (_direction: 'asc' | 'desc') => ({
            first,
          }),
        }
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      const row = {
        _id: `${table}_${nextId++}`,
        _creationTime: 1,
        ...value,
      }
      rowsFor(table).push(row as never)
      return row._id
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      for (const rows of [
        sessions,
        previews,
        generatedModules,
        siteSpecs,
        tasks,
        generationEvents,
        usageMetrics,
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

  const scheduler = {
    runAfter: async (
      delayMs: number,
      _ref: Parameters<MutationCtx['scheduler']['runAfter']>[1],
      event: Record<string, unknown>,
    ) => {
      schedulerCalls.push({ delayMs, event })
    },
  } as unknown as Pick<MutationCtx, 'scheduler'>['scheduler']

  return {
    ctx: { db, scheduler } as Pick<MutationCtx, 'db' | 'scheduler'>,
    sessions,
    previews,
    generatedModules,
    siteSpecs,
    tasks,
    generationEvents,
    usageMetrics,
    schedulerCalls,
  }
}

describe('session artifact helpers', () => {
  it('skips site-spec writes when no spec JSON is available', async () => {
    const { ctx, siteSpecs } = ctxFor()

    await upsertSiteSpec(ctx, sessionId, undefined, 100)

    expect(siteSpecs).toEqual([])
  })

  it('inserts a session site spec', async () => {
    const { ctx, siteSpecs } = ctxFor()

    await upsertSiteSpec(ctx, sessionId, '{"title":"New"}', 200)

    expect(siteSpecs).toMatchObject([
      {
        sessionId,
        specJson: '{"title":"New"}',
        createdAt: 200,
        updatedAt: 200,
      },
    ])
  })

  it('updates an existing session site spec', async () => {
    const existingSpec = siteSpecDoc({
      createdAt: 10,
      updatedAt: 10,
    })
    const { ctx, siteSpecs } = ctxFor([existingSpec])

    await upsertSiteSpec(ctx, sessionId, '{"title":"Updated"}', 300)

    expect(siteSpecs).toEqual([
      {
        ...existingSpec,
        specJson: '{"title":"Updated"}',
        updatedAt: 300,
      },
    ])
  })

  it('skips generated module writes when no home source is available', async () => {
    const { ctx, generatedModules } = ctxFor()

    await upsertHomeGeneratedModule(ctx, sessionId, undefined, 400)

    expect(generatedModules).toEqual([])
  })

  it('inserts the generated home module', async () => {
    const { ctx, generatedModules } = ctxFor()

    await upsertHomeGeneratedModule(ctx, sessionId, '<main>Home</main>', 500)

    expect(generatedModules).toMatchObject([
      {
        sessionId,
        moduleKey: 'home',
        source: '<main>Home</main>',
        status: 'succeeded',
        createdAt: 500,
        updatedAt: 500,
      },
    ])
  })

  it('updates the generated home module as succeeded', async () => {
    const existingModule = generatedModuleDoc({
      status: 'failed',
      createdAt: 10,
      updatedAt: 10,
    })
    const { ctx, generatedModules } = ctxFor([], [existingModule])

    await upsertHomeGeneratedModule(ctx, sessionId, '<main>Updated</main>', 600)

    expect(generatedModules).toEqual([
      {
        ...existingModule,
        source: '<main>Updated</main>',
        status: 'succeeded',
        updatedAt: 600,
      },
    ])
  })

  it('returns false when a cached session has no preview to clone', async () => {
    const cachedSession = sessionDoc()
    const targetSession = sessionDoc({
      _id: 'session_target' as Id<'sessions'>,
    })
    const { ctx, generatedModules, previews } = cloneCtxFor({
      sessions: [cachedSession, targetSession],
      generatedModules: [
        generatedModuleDoc({
          sessionId: cachedSession._id,
          source: '<main>Cached module</main>',
        }),
      ],
    })

    await expect(
      cloneCachedGeneratedArtifacts(ctx, {
        cachedSession,
        targetSessionId: targetSession._id,
        now: 700,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
      }),
    ).resolves.toBe(false)

    expect(generatedModules).toHaveLength(1)
    expect(previews).toHaveLength(0)
  })

  it('clones cached artifacts, tasks, preview, and operational records', async () => {
    const cachedSession = sessionDoc()
    const targetSession = sessionDoc({
      _id: 'session_target' as Id<'sessions'>,
      userId: 'target-user',
    })
    const {
      ctx,
      generatedModules,
      siteSpecs,
      tasks,
      previews,
      generationEvents,
      usageMetrics,
      schedulerCalls,
      sessions,
    } = cloneCtxFor({
      sessions: [cachedSession, targetSession],
      previews: [
        previewDoc({
          sessionId: cachedSession._id,
          html: '<main><h1>Cached preview</h1></main>',
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: cachedSession._id,
          source: '<main>Cached module</main>',
        }),
      ],
      siteSpecs: [
        siteSpecDoc({
          sessionId: cachedSession._id,
          specJson: '{"title":"Cached spec"}',
        }),
      ],
      tasks: [
        taskDoc({
          sessionId: cachedSession._id,
          taskKey: 'homepage',
          status: 'failed',
          title: 'Recover homepage',
        }),
      ],
    })

    await expect(
      cloneCachedGeneratedArtifacts(ctx, {
        cachedSession,
        targetSessionId: targetSession._id,
        userId: 'user-1',
        anonymousClientIdHash: 'anon-hash',
        now: 800,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
      }),
    ).resolves.toBe(true)

    expect(generatedModules).toContainEqual(
      expect.objectContaining({
        sessionId: targetSession._id,
        moduleKey: 'home',
        source: '<main>Cached module</main>',
        status: 'succeeded',
        createdAt: 800,
        updatedAt: 800,
      }),
    )
    expect(siteSpecs).toContainEqual(
      expect.objectContaining({
        sessionId: targetSession._id,
        specJson: '{"title":"Cached spec"}',
      }),
    )
    expect(tasks).toContainEqual(
      expect.objectContaining({
        sessionId: targetSession._id,
        taskKey: 'homepage',
        status: 'succeeded',
        title: 'Recover homepage',
      }),
    )
    expect(previews).toContainEqual(
      expect.objectContaining({
        sessionId: targetSession._id,
        version: 1,
        html: '<main><h1>Cached preview</h1></main>',
        openUiSource: '<main>Cached module</main>',
        siteSpecJson: '{"title":"Cached spec"}',
      }),
    )
    expect(generationEvents).toEqual([
      expect.objectContaining({
        sessionId: targetSession._id,
        eventType: 'preview_ready',
      }),
      expect.objectContaining({
        sessionId: targetSession._id,
        eventType: 'cache_hit',
        cacheHit: true,
        provider: 'prompt-cache-clone',
      }),
    ])
    expect(usageMetrics).toEqual([
      expect.objectContaining({
        sessionId: targetSession._id,
        eventType: 'cache_hit',
        userId: 'user-1',
        anonymousClientIdHash: 'anon-hash',
      }),
    ])
    expect(schedulerCalls).toEqual([
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          eventType: 'cache_hit',
          cacheHit: true,
        }),
      }),
    ])
    expect(sessions).toContainEqual(
      expect.objectContaining({
        _id: targetSession._id,
        status: 'preview_ready',
        homepageReady: true,
        openuiReady: true,
        previewVersion: 1,
        elapsed: 0,
        cost: 0,
        updatedAt: 800,
      }),
    )
  })

  it('creates a default homepage task when cached tasks are missing', async () => {
    const cachedSession = sessionDoc()
    const targetSession = sessionDoc({
      _id: 'session_target' as Id<'sessions'>,
    })
    const { ctx, tasks } = cloneCtxFor({
      sessions: [cachedSession, targetSession],
      previews: [previewDoc({ sessionId: cachedSession._id })],
      generatedModules: [
        generatedModuleDoc({
          sessionId: cachedSession._id,
          source: '<main>Cached module</main>',
        }),
      ],
    })

    await expect(
      cloneCachedGeneratedArtifacts(ctx, {
        cachedSession,
        targetSessionId: targetSession._id,
        now: 900,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
      }),
    ).resolves.toBe(true)

    expect(tasks).toEqual([
      expect.objectContaining({
        sessionId: targetSession._id,
        taskKey: 'homepage',
        title: 'Generate homepage',
        status: 'succeeded',
        order: 0,
        createdAt: 900,
        updatedAt: 900,
      }),
    ])
  })
})
