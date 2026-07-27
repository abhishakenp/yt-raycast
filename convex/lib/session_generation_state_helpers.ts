import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  upsertHomeGeneratedModule,
  upsertSiteSpec,
} from './session_artifact_helpers'
import { queueSessionExportArtifactBuilds } from './session_export_helpers'
import { scheduleOperationalNotification } from './session_operational_notifications'
import { type EngineTaskInput, upsertTask } from './session_task_helpers'

type GenerationStateCtx = Pick<MutationCtx, 'db' | 'scheduler'>
type OperationalNotificationReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]
type ExportArtifactBuildReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

function assertSessionExists(session: Doc<'sessions'> | null): Doc<'sessions'> {
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  return session
}

export async function completeGeneratedSession(
  ctx: GenerationStateCtx,
  args: {
    sessionId: Id<'sessions'>
    siteSpecJson?: string
    openUiSource?: string
    tasks: EngineTaskInput[]
    elapsed?: number
    cost?: number
    provider?: string
    now: number
    sendOperationalNotification: OperationalNotificationReference
    buildExportArtifact: ExportArtifactBuildReference
  },
) {
  const session = assertSessionExists(await ctx.db.get(args.sessionId))
  const cost = args.cost ?? 0
  const provider = args.provider ?? 'ship-fast-engine'

  await Promise.all(
    args.tasks.map((task, index) =>
      upsertTask(ctx, args.sessionId, task, index, args.now),
    ),
  )
  await upsertSiteSpec(ctx, args.sessionId, args.siteSpecJson, args.now)
  await upsertHomeGeneratedModule(
    ctx,
    args.sessionId,
    args.openUiSource,
    args.now,
  )

  const previewVersion = (session.previewVersion ?? 0) + 1

  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: previewVersion,
    openUiSource: args.openUiSource,
    siteSpecJson: args.siteSpecJson,
    source: 'generation',
    createdAt: args.now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_ready',
    message: 'Generated preview ready',
    previewVersion,
    createdAt: args.now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'run_completed',
    message: 'Generation completed',
    previewVersion,
    createdAt: args.now,
    elapsedMs: args.elapsed,
    cost,
    provider,
    cacheHit: false,
  })

  await ctx.db.insert('usageMetrics', {
    sessionId: args.sessionId,
    eventType: 'run_completed',
    timestamp: args.now,
    elapsedMs: args.elapsed ?? 0,
    cost,
    provider,
    userId: session.userId,
    anonymousClientIdHash: session.anonymousClientIdHash,
  })

  await scheduleOperationalNotification(
    ctx,
    {
      sessionId: args.sessionId,
      eventType: 'run_completed',
      message: 'Generation completed',
      elapsedMs: args.elapsed,
      cost,
      provider,
      cacheHit: false,
    },
    args.sendOperationalNotification,
  )

  await queueSessionExportArtifactBuilds(ctx, {
    sessionId: args.sessionId,
    previewVersion,
    isPrivate: session.isPrivate,
    now: args.now,
    buildExportArtifact: args.buildExportArtifact,
  })

  await ctx.db.patch(args.sessionId, {
    status: 'preview_ready',
    errorCode: undefined,
    errorMessage: undefined,
    openuiReady:
      typeof args.openUiSource === 'string' &&
      args.openUiSource.trim().length > 0,
    previewVersion,
    elapsed: args.elapsed,
    cost,
    updatedAt: args.now,
  })

  return { sessionId: args.sessionId, previewVersion }
}

export async function failGeneratedSession(
  ctx: GenerationStateCtx,
  args: {
    sessionId: Id<'sessions'>
    message: string
    elapsed?: number
    now: number
    sendOperationalNotification: OperationalNotificationReference
  },
) {
  const session = assertSessionExists(await ctx.db.get(args.sessionId))

  if ((session.previewVersion ?? 0) > 0) {
    return {
      sessionId: args.sessionId,
      skipped: true,
      reason: 'preview_already_exists',
    }
  }

  const homepageTask = await ctx.db
    .query('tasks')
    .withIndex('by_sessionId_taskKey', (index) =>
      index.eq('sessionId', args.sessionId).eq('taskKey', 'homepage'),
    )
    .first()

  homepageTask !== null &&
    (await ctx.db.patch(homepageTask._id, {
      status: 'failed',
      errorMessage: args.message,
      updatedAt: args.now,
    }))

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'failed',
    message: args.message,
    createdAt: args.now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'generation_failed',
    message: args.message,
    createdAt: args.now,
    elapsedMs: args.elapsed,
    error: args.message,
  })

  await scheduleOperationalNotification(
    ctx,
    {
      sessionId: args.sessionId,
      eventType: 'generation_failed',
      message: args.message,
      elapsedMs: args.elapsed,
      error: args.message,
    },
    args.sendOperationalNotification,
  )

  await ctx.db.patch(args.sessionId, {
    status: 'failed',
    errorCode: 'GENERATION_FAILED',
    errorMessage: args.message,
    elapsed: args.elapsed,
    updatedAt: args.now,
  })

  return { sessionId: args.sessionId }
}
