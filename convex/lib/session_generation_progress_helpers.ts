import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import type { SessionTaskStatus } from './session_serialization_helpers'
import { upsertTask } from './session_task_helpers'

type GenerationProgressCtx = Pick<MutationCtx, 'db'>
type GenerationStartCtx = Pick<MutationCtx, 'db' | 'scheduler'>
type ScheduledFunctionReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

export type MarkSessionGenerationStartedReferences = {
  failIfStillStreaming: ScheduledFunctionReference
}

// Explicit result type: the callers in `convex/sessions.ts` reference
// `internal.sessions.failIfStillStreaming`, which makes the module's own type
// circular unless the call sites can annotate the result (same reason
// `CreateGenerationSessionResult` exists).
export type MarkSessionGenerationStartedResult =
  | { started: true }
  | { started: false; reason: string }

/**
 * How long a session may sit in `streaming` before the scheduled reaper
 * declares it stranded. The engine's own budget is
 * GENERATION_TIMEOUT_MS (90s) x GENERATION_ATTEMPTS (2) = 180s, so 240s
 * leaves headroom for a slow-but-live run and only fires when the Node
 * process that owned the run is genuinely gone (e.g. a redeploy).
 */
export const GENERATION_STALL_TTL_MS = 240_000

/** errorCode written when the stall reaper terminates a stranded run. */
export const GENERATION_STALLED_ERROR_CODE = 'GENERATION_STALLED'

export const GENERATION_STALLED_MESSAGE =
  'Generation stopped unexpectedly before it finished. Please try again.'

// `failed` is startable so a session terminated by the stall reaper (or by any
// other generation failure) can be retried. Without it the retry endpoint
// answers `skipped` and the session is stuck forever.
const startableGenerationStatuses = new Set<
  Doc<'sessions'>['status'] | undefined
>([undefined, 'created', 'queued', 'validating', 'failed'])

export async function markSessionGenerationStarted(
  ctx: GenerationStartCtx,
  sessionId: Id<'sessions'>,
  now: number,
  references: MarkSessionGenerationStartedReferences,
): Promise<MarkSessionGenerationStartedResult> {
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
    generationStartedAt: now,
    // The admission layer charges quota when it creates a session, not when a
    // run starts. Incrementing this field makes retries observable without
    // creating another billable session (one retry cycle = one credit).
    generationAttemptCount: (session.generationAttemptCount ?? 0) + 1,
    updatedAt: now,
  })

  // The only terminal writes (complete/fail) come from the Node process that
  // owns this run, so a container redeploy strands the session in `streaming`
  // forever. Schedule a one-shot reaper GENERATION_STALL_TTL_MS later: if the
  // session is still streaming *for this run* it is failed so the user sees
  // the error and can retry. A finished or restarted run makes it a no-op.
  await ctx.scheduler.runAfter(
    GENERATION_STALL_TTL_MS,
    references.failIfStillStreaming,
    { sessionId, startedAt: now },
  )

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
