import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { forkSessionForOwner } from './session_fork_helpers'

type MutationHandler<Args> = (ctx: MutationCtx, args: Args) => Promise<unknown>

type ForkSessionArgs = {
  sourceSessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  edit?: {
    editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image'
    targetLabel?: string
    beforeText?: string
    afterText?: string
    afterHtml?: string
    instruction?: string
    occurrenceIndex?: number
  }
}

type EditRecord = Doc<'edits'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type TaskRecord = Doc<'tasks'>

const sourceSessionId = 'source_session' as Id<'sessions'>
const targetSessionId = 'target_session_1' as Id<'sessions'>
const notifyFunction =
  'sessions.sendOperationalNotification' as unknown as Parameters<
    MutationCtx['scheduler']['runAfter']
  >[1]

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
    _id: sourceSessionId,
    _creationTime: 1,
    prompt: 'Build a product landing page',
    workspace: 'default',
    status: 'preview_ready',
    userId: 'source-user',
    preferredLanguage: 'typescript',
    preferredExportTarget: 'react',
    designReferenceUrls: ['https://example.com/reference'],
    designReferenceNotes: 'Keep the original direction.',
    cloneUrl: 'https://github.com/example/repo.git',
    engineVersion: 'engine-v1',
    isPrivate: false,
    previewVersion: 1,
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  }) as SessionRecord

const previewDoc = (overrides: Partial<PreviewRecord> = {}): PreviewRecord =>
  ({
    _id: 'source_preview_1' as Id<'previews'>,
    _creationTime: 2,
    sessionId: sourceSessionId,
    version: 1,
    html: '<main><h1>Old headline</h1></main>',
    openUiSource: '<main><h1>Old headline</h1></main>',
    siteSpecJson: '{"headline":"Old headline"}',
    source: 'generation',
    createdAt: 2,
    ...overrides,
  }) as PreviewRecord

const ctxFor = (input: {
  userId?: string
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
}) => {
  const sessions = [...(input.sessions ?? [])]
  const previews = [...(input.previews ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]
  const tasks: TaskRecord[] = []
  const generationEvents: GenerationEventRecord[] = []
  const edits: EditRecord[] = []
  const schedulerCalls: Array<{ delayMs: number; functionRef: unknown }> = []

  const rowsFor = (table: string): Array<Record<string, unknown>> => {
    switch (table) {
      case 'sessions':
        return sessions as unknown as Array<Record<string, unknown>>
      case 'previews':
        return previews as unknown as Array<Record<string, unknown>>
      case 'generatedModules':
        return generatedModules as unknown as Array<Record<string, unknown>>
      case 'siteSpecs':
        return siteSpecs as unknown as Array<Record<string, unknown>>
      case 'tasks':
        return tasks as unknown as Array<Record<string, unknown>>
      case 'generationEvents':
        return generationEvents as unknown as Array<Record<string, unknown>>
      case 'edits':
        return edits as unknown as Array<Record<string, unknown>>
      default:
        throw new Error(`Unhandled table ${table}`)
    }
  }

  const queryRows = (
    table: string,
    filters: Array<{ field: string; value: unknown }>,
    direction?: 'asc' | 'desc',
  ) => {
    const rows = rowsFor(table).filter((row) =>
      filters.every((filter) => row[filter.field] === filter.value),
    )
    if (direction !== undefined && table === 'previews') {
      rows.sort((left, right) => {
        const leftVersion = Number(left.version ?? 0)
        const rightVersion = Number(right.version ?? 0)
        return direction === 'desc'
          ? rightVersion - leftVersion
          : leftVersion - rightVersion
      })
    }
    return rows
  }

  const ctx = {
    auth: {
      getUserIdentity: async () =>
        input.userId === undefined
          ? null
          : {
              tokenIdentifier: input.userId,
              subject: input.userId,
            },
    },
    db: {
      get: async (id: string) =>
        [...sessions, ...previews, ...generatedModules, ...siteSpecs].find(
          (row) => row._id === id,
        ) ?? null,
      insert: async (table: string, value: Record<string, unknown>) => {
        const rows = rowsFor(table)
        const nextId =
          table === 'sessions'
            ? targetSessionId
            : (`${table}_${rows.length + 1}` as string)
        rows.push({
          _id: nextId,
          _creationTime: 10 + rows.length,
          ...value,
        })
        return nextId
      },
      patch: async (id: string, value: Record<string, unknown>) => {
        const row = [
          ...sessions,
          ...previews,
          ...generatedModules,
          ...siteSpecs,
          ...tasks,
        ].find((item) => item._id === id)
        if (row === undefined) throw new Error(`Missing row ${id}`)
        Object.assign(row, value)
      },
      query: (table: string) => {
        const filters: Array<{ field: string; value: unknown }> = []
        let direction: 'asc' | 'desc' | undefined
        const builder = {
          withIndex: (
            _name: string,
            callback: (index: {
              eq: (field: string, value: unknown) => unknown
            }) => unknown,
          ) => {
            const index = {
              eq: (field: string, value: unknown) => {
                filters.push({ field, value })
                return index
              },
            }
            callback(index)
            return builder
          },
          order: (nextDirection: 'asc' | 'desc') => {
            direction = nextDirection
            return builder
          },
          first: async () => queryRows(table, filters, direction)[0] ?? null,
          take: async (limit: number) =>
            queryRows(table, filters, direction).slice(0, limit),
        }
        return builder
      },
    },
    scheduler: {
      runAfter: async (delayMs: number, functionRef: unknown) => {
        schedulerCalls.push({ delayMs, functionRef })
      },
    },
  } as unknown as MutationCtx

  return {
    ctx,
    store: {
      sessions,
      previews,
      generatedModules,
      siteSpecs,
      tasks,
      generationEvents,
      edits,
      schedulerCalls,
    },
  }
}

describe('forkSessionForOwner', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forks a signed-in user to a copy with fallback preview artifacts', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const { ctx, store } = ctxFor({
      userId: 'target-user',
      sessions: [sessionDoc()],
      previews: [previewDoc()],
    })

    const result = await forkSessionForOwner(
      ctx,
      { sourceSessionId },
      notifyFunction,
    )

    expect(result).toEqual({ sessionId: targetSessionId, editApplied: false })
    expect(store.sessions).toHaveLength(2)
    expect(store.sessions[1]).toMatchObject({
      _id: targetSessionId,
      userId: 'target-user',
      prompt: 'Build a product landing page',
      status: 'preview_ready',
      homepageReady: true,
      openuiReady: true,
      previewVersion: 1,
      createdAt: 1000,
      updatedAt: 1000,
    })
    expect(store.previews.at(-1)).toMatchObject({
      sessionId: targetSessionId,
      version: 1,
      html: '<main><h1>Old headline</h1></main>',
      openUiSource: '<main><h1>Old headline</h1></main>',
      siteSpecJson: '{"headline":"Old headline"}',
      source: 'generation',
      createdAt: 1000,
    })
  })

  it('replays a text edit onto the forked fallback preview', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const { ctx, store } = ctxFor({
      userId: 'target-user',
      sessions: [sessionDoc()],
      previews: [previewDoc()],
    })

    const result = await forkSessionForOwner(
      ctx,
      {
        sourceSessionId,
        edit: {
          editType: 'text',
          beforeText: 'Old headline',
          afterText: 'New headline',
        },
      },
      notifyFunction,
    )

    expect(result).toEqual({
      sessionId: targetSessionId,
      editApplied: true,
      editPreviewVersion: 2,
    })
    expect(store.sessions[1]).toMatchObject({
      status: 'preview_ready',
      previewVersion: 2,
      updatedAt: 1000,
    })
    expect(store.previews.at(-1)).toMatchObject({
      sessionId: targetSessionId,
      version: 2,
      html: '<main><h1>New headline</h1></main>',
      source: 'edit',
    })
    expect(store.generationEvents).toEqual([
      expect.objectContaining({
        sessionId: targetSessionId,
        eventType: 'preview_reload',
        previewVersion: 2,
      }),
    ])
    expect(store.edits).toEqual([
      expect.objectContaining({
        sessionId: targetSessionId,
        previewVersion: 2,
        editType: 'text',
        beforeText: 'Old headline',
        afterText: 'New headline',
        userId: 'target-user',
      }),
    ])
  })

  it('requires an owner when the caller is anonymous', async () => {
    const { ctx } = ctxFor({
      sessions: [sessionDoc()],
      previews: [previewDoc()],
    })

    await expect(
      forkSessionForOwner(ctx, { sourceSessionId }, notifyFunction),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
        message: 'Sign in to save your changes',
      },
    })
  })

  it('fails when the source session does not exist', async () => {
    const { ctx } = ctxFor({ userId: 'target-user' })

    await expect(
      forkSessionForOwner(ctx, { sourceSessionId }, notifyFunction),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })

  it('fails when a non-cloneable source has no preview to copy', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const { ctx } = ctxFor({
      userId: 'target-user',
      sessions: [sessionDoc()],
    })

    await expect(
      forkSessionForOwner(ctx, { sourceSessionId }, notifyFunction),
    ).rejects.toMatchObject({
      data: {
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready',
      },
    })
  })
})

describe('forkSession delegation', () => {
  it('forkSession handler delegates to forkSessionForOwner helper with sendOperationalNotification reference', async () => {
    vi.resetModules()
    vi.doMock('./session_fork_helpers', () => ({
      forkSessionForOwner: vi.fn(async () => ({
        sessionId: 'forked',
        editPreviewVersion: undefined,
      })),
    }))
    try {
      const { forkSession } = await import('../sessions')
      const mockedModule = await import('./session_fork_helpers')
      const mockedForkSessionForOwner = vi.mocked(
        mockedModule.forkSessionForOwner,
      )
      const ctx = { db: {} } as unknown as MutationCtx
      const args: ForkSessionArgs = {
        sourceSessionId: 's1' as Id<'sessions'>,
      }
      const handler = forkSession as unknown as MutationHandler<ForkSessionArgs>
      await handler(ctx, args)
      expect(mockedForkSessionForOwner).toHaveBeenCalledTimes(1)
      const [callCtx, callArgs, notifyRef] =
        mockedForkSessionForOwner.mock.calls[0]
      expect(callCtx).toBe(ctx)
      expect(callArgs).toBe(args)
      expect(notifyRef).toEqual(expect.anything())
    } finally {
      vi.doUnmock('./session_fork_helpers')
      vi.resetModules()
    }
  })
})
