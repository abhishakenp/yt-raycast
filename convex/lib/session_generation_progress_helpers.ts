import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import type { SessionTaskStatus } from './session_serialization_helpers'
import { upsertTask } from './session_task_helpers'

type GenerationProgressCtx = Pick<MutationCtx, 'db'>

const startableGenerationStatuses = new Set<
  Doc<'sessions'>['status'] | undefined
>([undefined, 'created', 'queued', 'validating'])

export async function markSessionGenerationStarted(
  ctx: GenerationProgressCtx,
  sessionId: Id<'sessions'>,
  now: number,
) {
  const session = await ctx.db.get(sessionId)

  if (session === null || (session.previewVersion ?? 0) > 0) {
    return {
      started: false,
      reason: session === null ? 'not_found' : 'preview_already_exists',
    }
  }

  if (!startableGenerationStatuses.has(session.status)) {
    return {
      started: false,
      reason:
        session.status === 'streaming'
          ? 'generation_already_started'
          : 'generation_not_startable',
    }
  }

  await ctx.db.patch(sessionId, {
    status: 'streaming',
    errorCode: undefined,
    errorMessage: undefined,
    updatedAt: now,
  })

  await upsertTask(
    ctx,
    sessionId,
    {
      id: 'homepage',
      label: 'Generate homepage',
      status: 'IN_PROGRESS',
    },
    0,
    now,
  )

  await ctx.db.insert('generationEvents', {
    sessionId,
    eventType: 'status',
    message: 'Generation started',
    createdAt: now,
  })

  return { started: true }
}

export async function upsertGeneratedModuleRecord(
  ctx: GenerationProgressCtx,
  args: {
    sessionId: Id<'sessions'>
    moduleKey: string
    source: string
    status?: SessionTaskStatus
    now: number
  },
) {
  const existingModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', args.sessionId).eq('moduleKey', args.moduleKey),
    )
    .first()

  existingModule === null
    ? await ctx.db.insert('generatedModules', {
        sessionId: args.sessionId,
        moduleKey: args.moduleKey,
        source: args.source,
        status: args.status ?? 'succeeded',
        createdAt: args.now,
        updatedAt: args.now,
      })
    : await ctx.db.patch(existingModule._id, {
        source: args.source,
        status: args.status ?? 'succeeded',
        errorMessage: undefined,
        updatedAt: args.now,
      })
}

export async function addGenerationProgressEvent(
  ctx: GenerationProgressCtx,
  args: {
    sessionId: Id<'sessions'>
    eventType: string
    message?: string
    previewVersion?: number
    now: number
  },
) {
  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: args.eventType,
    message: args.message,
    previewVersion: args.previewVersion,
    createdAt: args.now,
  })

  if (args.eventType !== 'status') return

  const session = await ctx.db.get(args.sessionId)

  if (session !== null && (session.previewVersion ?? 0) === 0) {
    await ctx.db.patch(args.sessionId, {
      status: 'streaming',
      updatedAt: args.now,
    })
  }
}
