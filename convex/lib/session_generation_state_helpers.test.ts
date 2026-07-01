import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  completeGeneratedSession,
  failGeneratedSession,
} from './session_generation_state_helpers'

type ExportArtifactRecord = Doc<'exportArtifacts'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type TaskRecord = Doc<'tasks'>
type UsageMetricRecord = Doc<'usageMetrics'>

const sessionId = 'session_generation_state' as Id<'sessions'>

const realConvexOpenUiHandoffCompletion = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  source:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
} as const

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    status: 'streaming',
    createdAt: 1,
    userId: 'user-1',
    anonymousClientIdHash: 'anon-hash',
    isPrivate: false,
    ...overrides,
  }) as SessionRecord

const taskDoc = (overrides: Partial<TaskRecord> = {}): TaskRecord =>
  ({
    _id: 'task_homepage' as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: 'homepage',
    title: 'Generate homepage',
    status: 'running',
    order: 0,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as TaskRecord

const ctxFor = (input: {
  sessions: SessionRecord[]
  tasks?: TaskRecord[]
  siteSpecs?: SiteSpecRecord[]
  generatedModules?: GeneratedModuleRecord[]
}) => {
  const sessions = [...input.sessions]
  const tasks = [...(input.tasks ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const exportArtifacts: ExportArtifactRecord[] = []
  const previews: PreviewRecord[] = []
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
      case 'tasks':
        return tasks
      case 'siteSpecs':
        return siteSpecs
      case 'generatedModules':
        return generatedModules
      case 'exportArtifacts':
        return exportArtifacts
      case 'previews':
        return previews
      case 'generationEvents':
        return generationEvents
      case 'usageMetrics':
        return usageMetrics
      default:
        return []
    }
  }

  const filterRows = (table: string, filters: Map<string, unknown>) =>
    rowsFor(table).filter((row) =>
      Array.from(filters.entries()).every(
        ([field, value]) => (row as Record<string, unknown>)[field] === value,
      ),
    )

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

        return {
          first: async () => filterRows(table, filters)[0] ?? null,
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
        tasks,
        siteSpecs,
        generatedModules,
        exportArtifacts,
        previews,
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
    tasks,
    siteSpecs,
    generatedModules,
    exportArtifacts,
    previews,
    generationEvents,
    usageMetrics,
    schedulerCalls,
  }
}

describe('session generation state helpers', () => {
  it('completes generated sessions with preview, artifacts, metrics, and alert scheduling', async () => {
    const {
      ctx,
      sessions,
      tasks,
      siteSpecs,
      generatedModules,
      previews,
      generationEvents,
      usageMetrics,
      schedulerCalls,
      exportArtifacts,
    } = ctxFor({ sessions: [sessionDoc({ previewVersion: 2 })] })

    await expect(
      completeGeneratedSession(ctx, {
        sessionId,
        html: '<main><h1>Done</h1></main>',
        siteSpecJson: '{"title":"Done"}',
        openUiSource: '<main>OpenUI</main>',
        tasks: [{ id: 'home.openui', label: 'Render home', status: 'DONE' }],
        elapsed: 1234,
        cost: 0.42,
        provider: 'groq',
        now: 500,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
        buildExportArtifact: 'buildExportArtifact' as unknown as Parameters<
          MutationCtx['scheduler']['runAfter']
        >[1],
      }),
    ).resolves.toEqual({ sessionId, previewVersion: 3 })

    expect(tasks).toEqual([
      expect.objectContaining({
        sessionId,
        taskKey: 'homepage',
        title: 'Render home',
        status: 'succeeded',
        order: 0,
        createdAt: 500,
        updatedAt: 500,
      }),
    ])
    expect(siteSpecs).toEqual([
      expect.objectContaining({
        sessionId,
        specJson: '{"title":"Done"}',
        createdAt: 500,
        updatedAt: 500,
      }),
    ])
    expect(generatedModules).toEqual([
      expect.objectContaining({
        sessionId,
        moduleKey: 'home',
        source: '<main>OpenUI</main>',
        status: 'succeeded',
        createdAt: 500,
        updatedAt: 500,
      }),
    ])
    expect(previews).toEqual([
      expect.objectContaining({
        sessionId,
        version: 3,
        html: '<main><h1>Done</h1></main>',
        openUiSource: '<main>OpenUI</main>',
        siteSpecJson: '{"title":"Done"}',
        source: 'generation',
        createdAt: 500,
      }),
    ])
    expect(generationEvents).toEqual([
      expect.objectContaining({
        eventType: 'preview_ready',
        previewVersion: 3,
      }),
      expect.objectContaining({
        eventType: 'run_completed',
        elapsedMs: 1234,
        cost: 0.42,
        provider: 'groq',
        cacheHit: false,
      }),
    ])
    expect(usageMetrics).toEqual([
      expect.objectContaining({
        sessionId,
        eventType: 'run_completed',
        timestamp: 500,
        elapsedMs: 1234,
        cost: 0.42,
        provider: 'groq',
        userId: 'user-1',
        anonymousClientIdHash: 'anon-hash',
      }),
    ])
    expect(sessions).toEqual([
      expect.objectContaining({
        _id: sessionId,
        status: 'preview_ready',
        openuiReady: true,
        previewVersion: 3,
        elapsed: 1234,
        cost: 0.42,
        updatedAt: 500,
      }),
    ])
    expect(exportArtifacts).toEqual([
      expect.objectContaining({
        sessionId,
        target: 'html',
        previewVersion: 3,
        status: 'queued',
      }),
      expect.objectContaining({
        sessionId,
        target: 'react',
        previewVersion: 3,
        status: 'queued',
      }),
      expect.objectContaining({
        sessionId,
        target: 'next',
        previewVersion: 3,
        status: 'queued',
      }),
      expect.objectContaining({
        sessionId,
        target: 'lakebed',
        previewVersion: 3,
        status: 'queued',
      }),
    ])
    expect(schedulerCalls).toEqual([
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          eventType: 'run_completed',
          cost: 0.42,
          provider: 'groq',
        }),
      }),
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          target: 'html',
          previewVersion: 3,
          autoDeployPublic: false,
        }),
      }),
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          target: 'react',
          previewVersion: 3,
          autoDeployPublic: false,
        }),
      }),
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          target: 'next',
          previewVersion: 3,
          autoDeployPublic: false,
        }),
      }),
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          target: 'lakebed',
          previewVersion: 3,
          autoDeployPublic: true,
        }),
      }),
    ])
  })

  it('does not complete a generation with DB-observed OpenUI handoff HTML', async () => {
    const {
      ctx,
      sessions,
      tasks,
      siteSpecs,
      generatedModules,
      previews,
      generationEvents,
      usageMetrics,
      schedulerCalls,
      exportArtifacts,
    } = ctxFor({
      sessions: [
        sessionDoc({
          _id: realConvexOpenUiHandoffCompletion.sessionId as Id<'sessions'>,
          prompt: realConvexOpenUiHandoffCompletion.prompt,
          previewVersion: 0,
        }),
      ],
    })

    await expect(
      completeGeneratedSession(ctx, {
        sessionId:
          realConvexOpenUiHandoffCompletion.sessionId as Id<'sessions'>,
        html: realConvexOpenUiHandoffCompletion.html,
        siteSpecJson: '{"title":"Boutique Coffee Roastery"}',
        openUiSource: realConvexOpenUiHandoffCompletion.source,
        tasks: [{ id: 'home.openui', label: 'Render home', status: 'DONE' }],
        elapsed: 5580,
        cost: 0,
        provider: 'ship-fast-engine-v3',
        now: 1782812244731,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
        buildExportArtifact: 'buildExportArtifact' as unknown as Parameters<
          MutationCtx['scheduler']['runAfter']
        >[1],
      }),
    ).rejects.toMatchObject({ data: { code: 'PREVIEW_NOT_READY' } })

    expect(previews).toEqual([])
    expect(siteSpecs).toEqual([])
    expect(generatedModules).toEqual([])
    expect(exportArtifacts).toEqual([])
    expect(generationEvents).toEqual([])
    expect(usageMetrics).toEqual([])
    expect(schedulerCalls).toEqual([])
    expect(tasks).toEqual([])
    expect(sessions).toContainEqual(
      expect.objectContaining({
        _id: realConvexOpenUiHandoffCompletion.sessionId,
        status: 'streaming',
        previewVersion: 0,
      }),
    )
  })

  it('fails generated sessions and preserves completed previews', async () => {
    const { ctx, sessions, tasks, generationEvents, schedulerCalls } = ctxFor({
      sessions: [sessionDoc()],
      tasks: [taskDoc()],
    })

    await expect(
      failGeneratedSession(ctx, {
        sessionId,
        message: 'provider_timeout',
        elapsed: 321,
        now: 700,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
      }),
    ).resolves.toEqual({ sessionId })

    expect(tasks).toEqual([
      expect.objectContaining({
        _id: 'task_homepage',
        status: 'failed',
        errorMessage: 'provider_timeout',
        updatedAt: 700,
      }),
    ])
    expect(generationEvents).toEqual([
      expect.objectContaining({
        eventType: 'failed',
        message: 'provider_timeout',
        createdAt: 700,
      }),
      expect.objectContaining({
        eventType: 'generation_failed',
        message: 'provider_timeout',
        elapsedMs: 321,
        error: 'provider_timeout',
      }),
    ])
    expect(sessions).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCode: 'GENERATION_FAILED',
        errorMessage: 'provider_timeout',
        elapsed: 321,
        updatedAt: 700,
      }),
    ])
    expect(schedulerCalls).toEqual([
      expect.objectContaining({
        delayMs: 0,
        event: expect.objectContaining({
          eventType: 'generation_failed',
          error: 'provider_timeout',
        }),
      }),
    ])

    const completed = ctxFor({
      sessions: [sessionDoc({ previewVersion: 1 })],
      tasks: [taskDoc()],
    })

    await expect(
      failGeneratedSession(completed.ctx, {
        sessionId,
        message: 'late_failure',
        now: 800,
        sendOperationalNotification:
          'sendOperationalNotification' as unknown as Parameters<
            MutationCtx['scheduler']['runAfter']
          >[1],
      }),
    ).resolves.toEqual({
      sessionId,
      skipped: true,
      reason: 'preview_already_exists',
    })
    expect(completed.generationEvents).toEqual([])
    expect(completed.schedulerCalls).toEqual([])
  })
})
