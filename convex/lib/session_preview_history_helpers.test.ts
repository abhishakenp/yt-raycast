import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  listSessionEdits,
  listSessionPreviewHistory,
  restoreOwnedPreviewVersion,
  restorePreviewHistoryVersion,
  serializeSessionEdit,
  serializePreviewHistoryItem,
} from './session_preview_history_helpers'

type EditRecord = Doc<'edits'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>

const sessionId = 'session_preview_history' as Id<'sessions'>

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    createdAt: 1,
    previewVersion: 4,
    ...overrides,
  } as SessionRecord
}

function previewDoc(overrides: Partial<PreviewRecord> = {}): PreviewRecord {
  return {
    _id: 'preview_history_3' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 3,
    html: '<main><h1>Version 3</h1></main>',
    openUiSource: '<main>OpenUI v3</main>',
    siteSpecJson: '{"title":"Version 3"}',
    source: 'generation',
    createdAt: 300,
    ...overrides,
  } as PreviewRecord
}

function editDoc(overrides: Partial<EditRecord> = {}): EditRecord {
  return {
    _id: 'edit_history_1' as Id<'edits'>,
    _creationTime: 1,
    sessionId,
    previewVersion: 2,
    editType: 'text',
    targetLabel: 'Hero title',
    beforeText: 'Before',
    afterText: 'After',
    afterHtml: '<h1>After</h1>',
    instruction: 'Make it sharper',
    createdAt: 400,
    userId: 'user_history',
    ...overrides,
  } as EditRecord
}

function ctxFor(input: {
  sessions: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  userId?: string | null
}) {
  const sessions = [...input.sessions]
  const previews: PreviewRecord[] = [...(input.previews ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]
  const generationEvents: GenerationEventRecord[] = []
  let nextId = 1

  const rowsFor = (table: string): Record<string, unknown>[] => {
    switch (table) {
      case 'sessions':
        return sessions as unknown as Record<string, unknown>[]
      case 'previews':
        return previews as unknown as Record<string, unknown>[]
      case 'generatedModules':
        return generatedModules as unknown as Record<string, unknown>[]
      case 'siteSpecs':
        return siteSpecs as unknown as Record<string, unknown>[]
      case 'generationEvents':
        return generationEvents as unknown as Record<string, unknown>[]
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
    get: async (id: string) =>
      [...sessions, ...previews, ...generatedModules, ...siteSpecs].find(
        (row) => row._id === id,
      ) ?? null,
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
        applyIndex: (index: {
          eq: (field: string, value: unknown) => typeof index
        }) => void,
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
      for (const rows of [sessions, previews, generatedModules, siteSpecs]) {
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
    ctx: {
      auth: {
        getUserIdentity: async () =>
          input.userId === undefined
            ? null
            : input.userId === null
              ? null
              : {
                  tokenIdentifier: input.userId,
                  subject: input.userId,
                },
      },
      db,
    } as MutationCtx,
    sessions,
    previews,
    generatedModules,
    siteSpecs,
    generationEvents,
  }
}

function queryCtxFor(input: {
  edits?: EditRecord[]
  previews?: PreviewRecord[]
}) {
  const db = {
    query: (table: 'edits' | 'previews') => {
      let rows: Array<EditRecord | PreviewRecord> =
        table === 'edits'
          ? [...(input.edits ?? [])]
          : [...(input.previews ?? [])]

      const builder = {
        withIndex: (
          indexName: string,
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => void,
        ) => {
          expect(indexName).toBe(
            table === 'edits'
              ? 'by_sessionId_createdAt'
              : 'by_sessionId_version',
          )
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter(
            (row) => row.sessionId === filters.get('sessionId'),
          )

          return builder
        },
        order: (direction: 'asc' | 'desc') => {
          rows = [...rows].sort((left, right) =>
            direction === 'desc'
              ? sortValue(table, right) - sortValue(table, left)
              : sortValue(table, left) - sortValue(table, right),
          )

          return builder
        },
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db } as Pick<QueryCtx, 'db'>
}

function sortValue(
  table: 'edits' | 'previews',
  row: EditRecord | PreviewRecord,
) {
  return table === 'edits'
    ? (row as EditRecord).createdAt
    : (row as PreviewRecord).version
}

describe('session preview history helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes edit history rows for the client', () => {
    expect(serializeSessionEdit(editDoc())).toEqual({
      editId: 'edit_history_1',
      editType: 'text',
      targetLabel: 'Hero title',
      beforeText: 'Before',
      afterText: 'After',
      afterHtml: '<h1>After</h1>',
      instruction: 'Make it sharper',
      previewVersion: 2,
      createdAt: 400,
      userId: 'user_history',
    })
  })

  it('lists session edits newest first with the query limit applied', async () => {
    const otherSessionId = 'other_session' as Id<'sessions'>
    const edits = [
      editDoc({ _id: 'edit_old' as Id<'edits'>, createdAt: 100 }),
      editDoc({ _id: 'edit_new' as Id<'edits'>, createdAt: 300 }),
      editDoc({
        _id: 'edit_other' as Id<'edits'>,
        sessionId: otherSessionId,
        createdAt: 500,
      }),
    ]

    await expect(
      listSessionEdits(queryCtxFor({ edits }), sessionId),
    ).resolves.toEqual([
      expect.objectContaining({ editId: 'edit_new', createdAt: 300 }),
      expect.objectContaining({ editId: 'edit_old', createdAt: 100 }),
    ])
  })

  it('serializes preview history rows for the client', () => {
    expect(serializePreviewHistoryItem(previewDoc())).toEqual({
      previewId: 'preview_history_3',
      version: 3,
      source: 'generation',
      createdAt: 300,
    })
  })

  it('lists preview history newest version first with the query limit applied', async () => {
    const otherSessionId = 'other_session' as Id<'sessions'>
    const previews = [
      previewDoc({ _id: 'preview_v1' as Id<'previews'>, version: 1 }),
      previewDoc({ _id: 'preview_v3' as Id<'previews'>, version: 3 }),
      previewDoc({
        _id: 'preview_other' as Id<'previews'>,
        sessionId: otherSessionId,
        version: 5,
      }),
    ]

    await expect(
      listSessionPreviewHistory(queryCtxFor({ previews }), sessionId),
    ).resolves.toEqual([
      expect.objectContaining({ previewId: 'preview_v3', version: 3 }),
      expect.objectContaining({ previewId: 'preview_v1', version: 1 }),
    ])
  })

  it('restores a preview version and activates the restored artifacts', async () => {
    const session = sessionDoc({ previewVersion: 4 })
    const {
      ctx,
      sessions,
      previews,
      generatedModules,
      siteSpecs,
      generationEvents,
    } = ctxFor({ sessions: [session] })

    await expect(
      restorePreviewHistoryVersion(ctx, {
        sessionId,
        session,
        preview: previewDoc(),
        restoredVersion: 3,
        now: 500,
      }),
      // saved:true matches the same {sessionId, previewVersion, saved}
      // contract createEdit/applySectionEdit return — required so an
      // undoLastEdit AI tool can share persistedInlineEditOutputSchema
      // (regression: this mutation was the only edit-persistence path
      // missing `saved`, which is required for TanStack AI tool output).
    ).resolves.toEqual({
      sessionId,
      previewVersion: 5,
      saved: true,
    })

    expect(generatedModules).toEqual([
      expect.objectContaining({
        sessionId,
        moduleKey: 'home',
        source: '<main>OpenUI v3</main>',
        status: 'succeeded',
        createdAt: 500,
        updatedAt: 500,
      }),
    ])
    expect(siteSpecs).toEqual([
      expect.objectContaining({
        sessionId,
        specJson: '{"title":"Version 3"}',
        createdAt: 500,
        updatedAt: 500,
      }),
    ])
    expect(previews).toEqual([
      expect.objectContaining({
        sessionId,
        version: 5,
        openUiSource: '<main>OpenUI v3</main>',
        siteSpecJson: '{"title":"Version 3"}',
        source: 'history_restore',
        createdAt: 500,
      }),
    ])
    expect(sessions).toEqual([
      expect.objectContaining({
        _id: sessionId,
        previewVersion: 5,
        updatedAt: 500,
      }),
    ])
    expect(generationEvents).toEqual([
      expect.objectContaining({
        sessionId,
        eventType: 'preview_reload',
        message: 'Restored preview version 3',
        previewVersion: 5,
        createdAt: 500,
      }),
    ])
  })

  it('falls back to the restored preview version and skips absent artifacts', async () => {
    const session = sessionDoc({ previewVersion: undefined })
    const { ctx, previews, generatedModules, siteSpecs } = ctxFor({
      sessions: [session],
    })

    await restorePreviewHistoryVersion(ctx, {
      sessionId,
      session,
      preview: previewDoc({
        openUiSource: undefined,
        siteSpecJson: undefined,
      }),
      restoredVersion: 3,
      now: 600,
    })

    expect(previews).toEqual([
      expect.objectContaining({
        version: 4,
        openUiSource: undefined,
        siteSpecJson: undefined,
      }),
    ])
    expect(generatedModules).toEqual([])
    expect(siteSpecs).toEqual([])
  })

  it('restores an owned preview version through the public mutation helper', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(700)
    const session = sessionDoc({ userId: 'user_history', previewVersion: 4 })
    const preview = previewDoc({
      _id: 'preview_history_2' as Id<'previews'>,
      version: 2,
      openUiSource: '<main>OpenUI v2</main>',
    })
    const { ctx, previews, generationEvents } = ctxFor({
      sessions: [session],
      previews: [preview],
      userId: 'user_history',
    })

    await expect(
      restoreOwnedPreviewVersion(ctx, {
        sessionId,
        version: 2,
      }),
    ).resolves.toEqual({
      sessionId,
      previewVersion: 5,
      saved: true,
    })

    expect(previews.at(-1)).toMatchObject({
      sessionId,
      version: 5,
      openUiSource: '<main>OpenUI v2</main>',
      source: 'history_restore',
      createdAt: 700,
    })
    expect(generationEvents).toEqual([
      expect.objectContaining({
        eventType: 'preview_reload',
        message: 'Restored preview version 2',
        previewVersion: 5,
      }),
    ])
  })

  it('rejects restore when the session is missing', async () => {
    const { ctx } = ctxFor({ sessions: [], userId: 'user_history' })

    await expect(
      restoreOwnedPreviewVersion(ctx, {
        sessionId,
        version: 2,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })

  it('rejects restore when the caller cannot mutate the session', async () => {
    const { ctx } = ctxFor({
      sessions: [sessionDoc({ userId: 'owner_user' })],
      previews: [previewDoc({ version: 2 })],
      userId: 'other_user',
    })

    await expect(
      restoreOwnedPreviewVersion(ctx, {
        sessionId,
        version: 2,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('rejects restore when the requested preview version is missing', async () => {
    const { ctx } = ctxFor({
      sessions: [sessionDoc({ userId: 'user_history' })],
      previews: [previewDoc({ version: 1 })],
      userId: 'user_history',
    })

    await expect(
      restoreOwnedPreviewVersion(ctx, {
        sessionId,
        version: 2,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Preview version not found',
      },
    })
  })
})
