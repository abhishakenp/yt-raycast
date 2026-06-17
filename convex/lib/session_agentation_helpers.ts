import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'

const AGENTATION_SESSION_KEY_PREFIX = 'ship-fast:generate:'

export type DeleteSessionAnnotationInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  annotationId: Id<'agentationAnnotations'>
}

export type SessionAnnotationInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  annotationId: string
  agentationSessionKey: string
  comment: string
  elementLabel: string
  elementPath: string
  url?: string
  payloadJson?: string
}

export type SaveSessionAgentationSessionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  agentationSessionId: string
}

export type SyncAnnotationInput = {
  agentationSessionKey: string
  annotationId: string
  comment: string
  elementLabel: string
  elementPath: string
  url?: string
  payloadJson?: string
}

export type UpdateSyncAnnotationInput = Omit<
  SyncAnnotationInput,
  'agentationSessionKey'
>

export type DeleteSyncAnnotationInput = {
  annotationId: string
}

export type DeleteSessionAnnotationByAgentationIdInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  annotationId: string
}

export type ClearSessionAnnotationsInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
}

const requireMutableSession = async (
  ctx: MutationCtx,
  args: { sessionId: Id<'sessions'>; anonymousOwnerSecret?: string },
) => {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
  return session
}

const annotationPayload = (
  args: Omit<SyncAnnotationInput, 'annotationId'>,
  now: number,
) => ({
  agentationSessionKey: args.agentationSessionKey,
  comment: args.comment,
  elementLabel: args.elementLabel,
  elementPath: args.elementPath,
  url: args.url,
  payloadJson: args.payloadJson,
  updatedAt: now,
})

const findAnnotationByAgentationId = async (
  ctx: MutationCtx,
  annotationId: string,
) =>
  ctx.db
    .query('agentationAnnotations')
    .withIndex('by_annotationId', (index) =>
      index.eq('annotationId', annotationId),
    )
    .first()

const upsertAnnotationRecord = async (
  ctx: MutationCtx,
  args: SyncAnnotationInput & {
    sessionId: Id<'sessions'>
    agentationSessionId?: string
  },
) => {
  const now = Date.now()
  const existing = await ctx.db
    .query('agentationAnnotations')
    .withIndex('by_sessionId_annotationId', (index) =>
      index
        .eq('sessionId', args.sessionId)
        .eq('annotationId', args.annotationId),
    )
    .first()
  const payload = {
    ...annotationPayload(args, now),
    ...(args.agentationSessionId === undefined
      ? {}
      : { agentationSessionId: args.agentationSessionId }),
  }

  if (existing !== null) {
    await ctx.db.patch(existing._id, payload)
    return { sessionId: args.sessionId, annotationId: existing._id }
  }

  const annotationDocId = await ctx.db.insert('agentationAnnotations', {
    sessionId: args.sessionId,
    annotationId: args.annotationId,
    ...payload,
    createdAt: now,
  })

  return { sessionId: args.sessionId, annotationId: annotationDocId }
}

export const getSessionIdFromAgentationSessionKey = (
  ctx: Pick<MutationCtx, 'db'>,
  agentationSessionKey: string,
): Id<'sessions'> | null => {
  if (!agentationSessionKey.startsWith(AGENTATION_SESSION_KEY_PREFIX)) {
    return null
  }

  return ctx.db.normalizeId(
    'sessions',
    agentationSessionKey.slice(AGENTATION_SESSION_KEY_PREFIX.length),
  )
}

export const serializeAgentationAnnotation = (
  annotation: Doc<'agentationAnnotations'>,
) => ({
  annotationId: annotation._id,
  agentationSessionKey: annotation.agentationSessionKey,
  comment: annotation.comment,
  elementLabel: annotation.elementLabel,
  elementPath: annotation.elementPath,
  url: annotation.url,
  payloadJson: annotation.payloadJson,
  createdAt: annotation.createdAt,
  updatedAt: annotation.updatedAt,
})

export const listSessionAnnotations = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
) => {
  const annotations = await ctx.db
    .query('agentationAnnotations')
    .withIndex('by_sessionId_annotationId', (index) =>
      index.eq('sessionId', sessionId),
    )
    .take(200)

  return annotations.map(serializeAgentationAnnotation)
}

export const assertAgentationSyncEnabled = async (
  ctx: Pick<MutationCtx, 'db'>,
  agentationSessionKey: string,
): Promise<{ session: Doc<'sessions'>; sessionId: Id<'sessions'> }> => {
  const sessionId = getSessionIdFromAgentationSessionKey(
    ctx,
    agentationSessionKey,
  )

  sessionId !== null ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_SESSION',
        message: 'Invalid Agentation session key',
      })
    })()

  const session = await ctx.db.get(sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const expectedSessionId = session.agentationSessionId ?? agentationSessionKey
  expectedSessionId === agentationSessionKey ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Agentation session key is not enabled for this session',
      })
    })()

  return { session, sessionId }
}

export const createSessionAnnotation = async (
  ctx: MutationCtx,
  args: SessionAnnotationInput,
) => {
  await requireMutableSession(ctx, args)

  const now = Date.now()
  await ctx.db.insert('agentationAnnotations', {
    sessionId: args.sessionId,
    annotationId: args.annotationId,
    agentationSessionKey: args.agentationSessionKey,
    comment: args.comment,
    elementLabel: args.elementLabel,
    elementPath: args.elementPath,
    url: args.url,
    payloadJson: args.payloadJson,
    createdAt: now,
    updatedAt: now,
  })

  return { sessionId: args.sessionId }
}

export const upsertSessionAnnotation = async (
  ctx: MutationCtx,
  args: SessionAnnotationInput,
) => {
  await requireMutableSession(ctx, args)
  return upsertAnnotationRecord(ctx, args)
}

export const saveSessionAgentationSession = async (
  ctx: MutationCtx,
  args: SaveSessionAgentationSessionInput,
) => {
  const session = await requireMutableSession(ctx, args)
  const now = Date.now()

  await ctx.db.patch(args.sessionId, {
    agentationEnabled: true,
    agentationEnabledAt: session.agentationEnabledAt ?? now,
    agentationSessionId: args.agentationSessionId,
    updatedAt: now,
  })

  return {
    sessionId: args.sessionId,
    agentationSessionId: args.agentationSessionId,
  }
}

export const upsertAgentationSyncSessionAnnotation = async (
  ctx: MutationCtx,
  args: SyncAnnotationInput,
) => {
  const { sessionId } = await assertAgentationSyncEnabled(
    ctx,
    args.agentationSessionKey,
  )

  return upsertAnnotationRecord(ctx, {
    ...args,
    sessionId,
    agentationSessionId: args.agentationSessionKey,
  })
}

export const updateAgentationSyncSessionAnnotation = async (
  ctx: MutationCtx,
  args: UpdateSyncAnnotationInput,
) => {
  const annotation = await findAnnotationByAgentationId(ctx, args.annotationId)

  annotation !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Annotation not found',
      })
    })()

  await ctx.db.patch(annotation._id, {
    comment: args.comment,
    elementLabel: args.elementLabel,
    elementPath: args.elementPath,
    url: args.url,
    payloadJson: args.payloadJson,
    updatedAt: Date.now(),
  })

  return { sessionId: annotation.sessionId, annotationId: annotation._id }
}

export const deleteAgentationSyncSessionAnnotation = async (
  ctx: MutationCtx,
  args: DeleteSyncAnnotationInput,
) => {
  const annotation = await findAnnotationByAgentationId(ctx, args.annotationId)

  if (annotation !== null) {
    await ctx.db.delete(annotation._id)
  }

  return { annotationId: args.annotationId }
}

export const deleteSessionAnnotation = async (
  ctx: MutationCtx,
  args: DeleteSessionAnnotationInput,
) => {
  await requireMutableSession(ctx, args)

  const annotation = await ctx.db.get(args.annotationId)

  annotation !== null && annotation.sessionId === args.sessionId
    ? await ctx.db.delete(args.annotationId)
    : (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Annotation not found for this session',
        })
      })()

  return { sessionId: args.sessionId }
}

export const deleteSessionAnnotationByAgentationId = async (
  ctx: MutationCtx,
  args: DeleteSessionAnnotationByAgentationIdInput,
) => {
  await requireMutableSession(ctx, args)

  const annotation = await ctx.db
    .query('agentationAnnotations')
    .withIndex('by_sessionId_annotationId', (index) =>
      index
        .eq('sessionId', args.sessionId)
        .eq('annotationId', args.annotationId),
    )
    .first()

  if (annotation !== null) {
    await ctx.db.delete(annotation._id)
  }

  return { sessionId: args.sessionId }
}

export const clearSessionAnnotations = async (
  ctx: MutationCtx,
  args: ClearSessionAnnotationsInput,
) => {
  await requireMutableSession(ctx, args)

  const annotations = await ctx.db
    .query('agentationAnnotations')
    .withIndex('by_sessionId_annotationId', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .take(200)

  await Promise.all(
    annotations.map((annotation) => ctx.db.delete(annotation._id)),
  )

  return { sessionId: args.sessionId }
}
