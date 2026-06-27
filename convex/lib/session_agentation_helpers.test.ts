import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertAgentationSyncEnabled,
  clearSessionAnnotations,
  createSessionAnnotation,
  deleteAgentationSyncSessionAnnotation,
  deleteSessionAnnotation,
  deleteSessionAnnotationByAgentationId,
  getSessionIdFromAgentationSessionKey,
  listSessionAnnotations,
  saveSessionAgentationSession,
  serializeAgentationAnnotation,
  updateAgentationSyncSessionAnnotation,
  upsertAgentationSyncSessionAnnotation,
  upsertSessionAnnotation,
} from './session_agentation_helpers'

type AnnotationRecord = Doc<'agentationAnnotations'>
type AgentationTestCtx = Parameters<
  typeof getSessionIdFromAgentationSessionKey
>[0] &
  Parameters<typeof assertAgentationSyncEnabled>[0]

const sessionId = 'session_123' as Id<'sessions'>
const sessionKey = `ship-fast:generate:${sessionId}`

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a site',
    workspace: 'default',
    createdAt: 1,
    ...overrides,
  }) as Doc<'sessions'>

const ctxFor = (session: Doc<'sessions'> | null): AgentationTestCtx => {
  const db = {
    normalizeId: (_tableName: 'sessions', value: string) =>
      value === sessionId ? sessionId : null,
    get: async (id: Id<'sessions'>) => (id === sessionId ? session : null),
  } as unknown as AgentationTestCtx['db']

  return { db }
}

const annotationDoc = (
  overrides: Partial<AnnotationRecord> = {},
): AnnotationRecord =>
  ({
    _id: 'annotation_1' as Id<'agentationAnnotations'>,
    _creationTime: 1,
    sessionId,
    annotationId: 'agentation_annotation_1',
    agentationSessionKey: sessionKey,
    comment: 'Fix the hero',
    elementLabel: 'Hero heading',
    elementPath: 'main > h1',
    url: 'https://example.com/preview',
    payloadJson: '{"id":"agentation_annotation_1"}',
    createdAt: 100,
    updatedAt: 200,
    ...overrides,
  }) as AnnotationRecord

const queryCtxForAnnotations = (annotations: AnnotationRecord[]) => {
  const db = {
    query: (table: 'agentationAnnotations') => {
      expect(table).toBe('agentationAnnotations')
      let rows = [...annotations]

      const builder = {
        withIndex: (
          indexName: 'by_sessionId_annotationId',
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => unknown,
        ) => {
          expect(indexName).toBe('by_sessionId_annotationId')
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter(
            (annotation) => annotation.sessionId === filters.get('sessionId'),
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

const mutationCtxForAnnotations = (input: {
  session?: Doc<'sessions'> | null
  annotations?: AnnotationRecord[]
  tokenIdentifier?: string | null
}) => {
  const session =
    input.session === undefined
      ? sessionDoc({ userId: input.tokenIdentifier ?? 'user_1' })
      : input.session
  const annotations = [...(input.annotations ?? [])]
  const deletedIds: Array<Id<'agentationAnnotations'>> = []
  const patches: Array<{
    id: Id<'sessions'> | Id<'agentationAnnotations'>
    patch: Record<string, unknown>
  }> = []
  const insertedAnnotations: AnnotationRecord[] = []

  const queryBySessionAndAnnotation = (
    filters: Map<string, unknown>,
  ): AnnotationRecord | null =>
    annotations.find(
      (annotation) =>
        annotation.sessionId === filters.get('sessionId') &&
        annotation.annotationId === filters.get('annotationId'),
    ) ?? null

  const queryBySession = (filters: Map<string, unknown>): AnnotationRecord[] =>
    annotations.filter(
      (annotation) => annotation.sessionId === filters.get('sessionId'),
    )

  const db = {
    normalizeId: (_tableName: 'sessions', value: string) =>
      value === sessionId ? sessionId : null,
    get: async (id: Id<'sessions'> | Id<'agentationAnnotations'>) =>
      id === sessionId
        ? session
        : (annotations.find((annotation) => annotation._id === id) ?? null),
    query: (table: 'agentationAnnotations') => {
      expect(table).toBe('agentationAnnotations')
      const filters = new Map<string, unknown>()
      const index = {
        eq: (field: string, value: unknown) => {
          filters.set(field, value)
          return index
        },
      }

      return {
        withIndex: (
          indexName: 'by_sessionId_annotationId' | 'by_annotationId',
          applyIndex: (nextIndex: typeof index) => unknown,
        ) => {
          applyIndex(index)

          return {
            first: async () =>
              indexName === 'by_annotationId'
                ? (annotations.find(
                    (annotation) =>
                      annotation.annotationId === filters.get('annotationId'),
                  ) ?? null)
                : queryBySessionAndAnnotation(filters),
            take: async (limit: number) =>
              queryBySession(filters).slice(0, limit),
          }
        },
      }
    },
    insert: async (
      table: 'agentationAnnotations',
      value: Omit<AnnotationRecord, '_id' | '_creationTime'>,
    ) => {
      expect(table).toBe('agentationAnnotations')
      const id =
        `annotation_inserted_${insertedAnnotations.length + 1}` as Id<'agentationAnnotations'>
      const inserted = {
        _id: id,
        _creationTime: 1,
        ...value,
      } as AnnotationRecord

      annotations.push(inserted)
      insertedAnnotations.push(inserted)
      return id
    },
    patch: async (
      id: Id<'sessions'> | Id<'agentationAnnotations'>,
      patch: Record<string, unknown>,
    ) => {
      patches.push({ id, patch })

      if (id === sessionId && session !== null) {
        Object.assign(session, patch)
        return
      }

      const annotation = annotations.find((next) => next._id === id)
      if (annotation !== undefined) Object.assign(annotation, patch)
    },
    delete: async (id: Id<'agentationAnnotations'>) => {
      deletedIds.push(id)
      const index = annotations.findIndex((annotation) => annotation._id === id)
      if (index >= 0) annotations.splice(index, 1)
    },
  } as unknown as MutationCtx['db']

  const ctx = {
    db,
    auth: {
      getUserIdentity: async () =>
        input.tokenIdentifier === null
          ? null
          : {
              tokenIdentifier: input.tokenIdentifier ?? 'user_1',
              subject: input.tokenIdentifier ?? 'user_1',
            },
    },
  } as unknown as MutationCtx

  return { ctx, annotations, deletedIds, insertedAnnotations, patches }
}

describe('session Agentation helpers', () => {
  it('serializes Agentation annotations for clients', () => {
    expect(serializeAgentationAnnotation(annotationDoc())).toEqual({
      annotationId: 'annotation_1',
      agentationSessionKey: sessionKey,
      comment: 'Fix the hero',
      elementLabel: 'Hero heading',
      elementPath: 'main > h1',
      url: 'https://example.com/preview',
      payloadJson: '{"id":"agentation_annotation_1"}',
      createdAt: 100,
      updatedAt: 200,
    })
  })

  it('lists session annotations with bounded indexed reads', async () => {
    const otherSessionId = 'session_other' as Id<'sessions'>
    const annotations = [
      annotationDoc({ _id: 'annotation_a' as Id<'agentationAnnotations'> }),
      annotationDoc({ _id: 'annotation_b' as Id<'agentationAnnotations'> }),
      annotationDoc({
        _id: 'annotation_other' as Id<'agentationAnnotations'>,
        sessionId: otherSessionId,
      }),
    ]

    await expect(
      listSessionAnnotations(queryCtxForAnnotations(annotations), sessionId),
    ).resolves.toEqual([
      expect.objectContaining({ annotationId: 'annotation_a' }),
      expect.objectContaining({ annotationId: 'annotation_b' }),
    ])
  })

  it('creates owned annotations from the public mutation payload', async () => {
    const { ctx, insertedAnnotations } = mutationCtxForAnnotations({})

    await expect(
      createSessionAnnotation(ctx, {
        sessionId,
        annotationId: 'agentation_annotation_create',
        agentationSessionKey: sessionKey,
        comment: 'Create copy note',
        elementLabel: 'Hero CTA',
        elementPath: 'main button',
        url: 'https://example.com',
        payloadJson: '{"kind":"create"}',
      }),
    ).resolves.toEqual({ sessionId })

    expect(insertedAnnotations).toEqual([
      expect.objectContaining({
        sessionId,
        annotationId: 'agentation_annotation_create',
        agentationSessionKey: sessionKey,
        comment: 'Create copy note',
        elementLabel: 'Hero CTA',
        elementPath: 'main button',
        url: 'https://example.com',
        payloadJson: '{"kind":"create"}',
      }),
    ])
  })

  it('upserts owned annotations without setting sync-only session ids', async () => {
    const existing = annotationDoc({
      annotationId: 'agentation_annotation_upsert',
    })
    const { ctx, annotations, insertedAnnotations, patches } =
      mutationCtxForAnnotations({
        annotations: [existing],
      })

    await expect(
      upsertSessionAnnotation(ctx, {
        sessionId,
        annotationId: 'agentation_annotation_upsert',
        agentationSessionKey: sessionKey,
        comment: 'Updated note',
        elementLabel: 'Updated label',
        elementPath: 'main h2',
        payloadJson: '{"kind":"update"}',
      }),
    ).resolves.toEqual({ sessionId, annotationId: existing._id })

    expect(patches.at(-1)).toMatchObject({
      id: existing._id,
      patch: {
        agentationSessionKey: sessionKey,
        comment: 'Updated note',
        elementLabel: 'Updated label',
        elementPath: 'main h2',
        payloadJson: '{"kind":"update"}',
      },
    })
    expect(patches.at(-1)?.patch).not.toHaveProperty('agentationSessionId')

    await expect(
      upsertSessionAnnotation(ctx, {
        sessionId,
        annotationId: 'agentation_annotation_insert',
        agentationSessionKey: sessionKey,
        comment: 'Inserted note',
        elementLabel: 'Inserted label',
        elementPath: 'main p',
      }),
    ).resolves.toEqual({
      sessionId,
      annotationId: 'annotation_inserted_1',
    })

    expect(insertedAnnotations[0]).toMatchObject({
      annotationId: 'agentation_annotation_insert',
      agentationSessionKey: sessionKey,
      comment: 'Inserted note',
    })
    expect(annotations).toHaveLength(2)
  })

  it('saves Agentation session ids only for session owners', async () => {
    const { ctx, patches } = mutationCtxForAnnotations({})

    await expect(
      saveSessionAgentationSession(ctx, {
        sessionId,
        agentationSessionId: sessionKey,
      }),
    ).resolves.toEqual({ sessionId, agentationSessionId: sessionKey })

    expect(patches.at(-1)).toMatchObject({
      id: sessionId,
      patch: {
        agentationEnabled: true,
        agentationEnabledAt: expect.any(Number),
        agentationSessionId: sessionKey,
        updatedAt: expect.any(Number),
      },
    })

    const { ctx: forbiddenCtx } = mutationCtxForAnnotations({
      session: sessionDoc({ userId: 'other_user' }),
    })

    await expect(
      saveSessionAgentationSession(forbiddenCtx, {
        sessionId,
        agentationSessionId: sessionKey,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('upserts Agentation sync annotations after validating the session key', async () => {
    const { ctx, insertedAnnotations } = mutationCtxForAnnotations({
      session: sessionDoc({ agentationSessionId: sessionKey }),
    })

    await expect(
      upsertAgentationSyncSessionAnnotation(ctx, {
        agentationSessionKey: sessionKey,
        annotationId: 'agentation_annotation_sync_insert',
        comment: 'Sync note',
        elementLabel: 'Sync label',
        elementPath: 'main section',
        payloadJson: '{"kind":"sync"}',
      }),
    ).resolves.toEqual({
      sessionId,
      annotationId: 'annotation_inserted_1',
    })

    expect(insertedAnnotations[0]).toMatchObject({
      annotationId: 'agentation_annotation_sync_insert',
      agentationSessionKey: sessionKey,
      agentationSessionId: sessionKey,
    })
  })

  it('updates and deletes Agentation sync annotations by Agentation id', async () => {
    const annotation = annotationDoc({
      _id: 'annotation_sync_update' as Id<'agentationAnnotations'>,
      annotationId: 'agentation_annotation_sync_update',
    })
    const { ctx, deletedIds, patches } = mutationCtxForAnnotations({
      annotations: [annotation],
    })

    await expect(
      updateAgentationSyncSessionAnnotation(ctx, {
        annotationId: 'agentation_annotation_sync_update',
        comment: 'Synced update',
        elementLabel: 'Synced label',
        elementPath: 'main aside',
        url: 'https://example.com/sync',
        payloadJson: '{"kind":"sync-update"}',
      }),
    ).resolves.toEqual({ sessionId, annotationId: annotation._id })

    expect(patches.at(-1)).toMatchObject({
      id: annotation._id,
      patch: {
        comment: 'Synced update',
        elementLabel: 'Synced label',
        elementPath: 'main aside',
        url: 'https://example.com/sync',
        payloadJson: '{"kind":"sync-update"}',
      },
    })

    await expect(
      deleteAgentationSyncSessionAnnotation(ctx, {
        annotationId: 'agentation_annotation_sync_update',
      }),
    ).resolves.toEqual({ annotationId: 'agentation_annotation_sync_update' })

    expect(deletedIds).toEqual([annotation._id])
  })

  it('rejects missing Agentation sync annotation updates', async () => {
    const { ctx } = mutationCtxForAnnotations({})

    await expect(
      updateAgentationSyncSessionAnnotation(ctx, {
        annotationId: 'missing_annotation',
        comment: 'Missing',
        elementLabel: 'Missing',
        elementPath: 'main',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Annotation not found',
      },
    })
  })

  it('deletes owned annotations by Convex document id', async () => {
    const annotation = annotationDoc()
    const { ctx, annotations, deletedIds } = mutationCtxForAnnotations({
      annotations: [annotation],
    })

    await expect(
      deleteSessionAnnotation(ctx, {
        sessionId,
        annotationId: annotation._id,
      }),
    ).resolves.toEqual({ sessionId })

    expect(deletedIds).toEqual([annotation._id])
    expect(annotations).toHaveLength(0)
  })

  it('rejects annotation deletion for missing or foreign records', async () => {
    const foreignAnnotation = annotationDoc({
      sessionId: 'session_other' as Id<'sessions'>,
    })
    const { ctx } = mutationCtxForAnnotations({
      annotations: [foreignAnnotation],
    })

    await expect(
      deleteSessionAnnotation(ctx, {
        sessionId,
        annotationId: foreignAnnotation._id,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Annotation not found for this session',
      },
    })
  })

  it('rejects annotation deletion without session ownership', async () => {
    const annotation = annotationDoc()
    const { ctx } = mutationCtxForAnnotations({
      session: sessionDoc({ userId: 'other_user' }),
      annotations: [annotation],
    })

    await expect(
      deleteSessionAnnotation(ctx, {
        sessionId,
        annotationId: annotation._id,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('deletes owned annotations by Agentation annotation id', async () => {
    const annotation = annotationDoc({
      _id: 'annotation_by_agentation' as Id<'agentationAnnotations'>,
      annotationId: 'agentation_annotation_delete',
    })
    const { ctx, deletedIds } = mutationCtxForAnnotations({
      annotations: [annotation],
    })

    await expect(
      deleteSessionAnnotationByAgentationId(ctx, {
        sessionId,
        annotationId: 'agentation_annotation_delete',
      }),
    ).resolves.toEqual({ sessionId })

    expect(deletedIds).toEqual([annotation._id])
  })

  it('treats missing Agentation annotation ids as idempotent deletes', async () => {
    const { ctx, deletedIds } = mutationCtxForAnnotations({
      annotations: [],
    })

    await expect(
      deleteSessionAnnotationByAgentationId(ctx, {
        sessionId,
        annotationId: 'missing_agentation_annotation',
      }),
    ).resolves.toEqual({ sessionId })

    expect(deletedIds).toEqual([])
  })

  it('clears owned annotations with a bounded indexed read', async () => {
    const first = annotationDoc({
      _id: 'annotation_clear_a' as Id<'agentationAnnotations'>,
    })
    const second = annotationDoc({
      _id: 'annotation_clear_b' as Id<'agentationAnnotations'>,
    })
    const other = annotationDoc({
      _id: 'annotation_clear_other' as Id<'agentationAnnotations'>,
      sessionId: 'session_other' as Id<'sessions'>,
    })
    const { ctx, annotations, deletedIds } = mutationCtxForAnnotations({
      annotations: [first, second, other],
    })

    await expect(clearSessionAnnotations(ctx, { sessionId })).resolves.toEqual({
      sessionId,
    })

    expect(deletedIds).toEqual([first._id, second._id])
    expect(annotations).toEqual([other])
  })

  it('extracts session ids from Agentation session keys', () => {
    const ctx = ctxFor(sessionDoc())

    expect(getSessionIdFromAgentationSessionKey(ctx, sessionKey)).toBe(
      sessionId,
    )
    expect(getSessionIdFromAgentationSessionKey(ctx, 'wrong-prefix')).toBeNull()
    expect(
      getSessionIdFromAgentationSessionKey(
        ctx,
        'ship-fast:generate:not-a-session',
      ),
    ).toBeNull()
  })

  it('allows legacy sessions whose stored Agentation id is absent', async () => {
    await expect(
      assertAgentationSyncEnabled(ctxFor(sessionDoc()), sessionKey),
    ).resolves.toMatchObject({ sessionId })
  })

  it('allows sessions explicitly enabled for the same Agentation key', async () => {
    await expect(
      assertAgentationSyncEnabled(
        ctxFor(sessionDoc({ agentationSessionId: sessionKey })),
        sessionKey,
      ),
    ).resolves.toMatchObject({ sessionId })
  })

  it('rejects malformed or missing sessions', async () => {
    await expect(
      assertAgentationSyncEnabled(ctxFor(sessionDoc()), 'wrong-prefix'),
    ).rejects.toMatchObject({
      data: {
        code: 'INVALID_SESSION',
        message: 'Invalid Agentation session key',
      },
    })

    await expect(
      assertAgentationSyncEnabled(ctxFor(null), sessionKey),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })

  it('rejects mismatched enabled Agentation keys', async () => {
    await expect(
      assertAgentationSyncEnabled(
        ctxFor(
          sessionDoc({
            agentationSessionId: 'ship-fast:generate:session_other',
          }),
        ),
        sessionKey,
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
        message: 'Agentation session key is not enabled for this session',
      },
    })
  })
})
