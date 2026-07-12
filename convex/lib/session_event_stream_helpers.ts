import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { assertCanReadPrivateSession } from './session_access_helpers'
import { serializeSession } from './session_serialization_helpers'

type EventStreamCtx = Pick<QueryCtx, 'auth' | 'db'>

export type SessionEventStreamArgs = {
  sessionId?: Id<'sessions'>
  lookup?: string
  since?: number
  limit?: number
  anonymousOwnerSecret?: string
}

export function clampEventStreamLimit(limit: number | undefined): number {
  return Math.max(1, Math.min(limit ?? 100, 250))
}

export async function loadSessionEventStream(
  ctx: EventStreamCtx,
  args: SessionEventStreamArgs,
) {
  const sessionId: Id<'sessions'> | null =
    args.sessionId ??
    (args.lookup === undefined
      ? null
      : ctx.db.normalizeId('sessions', args.lookup))

  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)
  if (session === null) return null
  await assertCanReadPrivateSession(ctx, session, args.anonymousOwnerSecret)

  const events = await ctx.db
    .query('generationEvents')
    .withIndex('by_sessionId_createdAt', (index) => {
      const scoped = index.eq('sessionId', sessionId)
      return args.since === undefined
        ? scoped
        : scoped.gt('createdAt', args.since)
    })
    .order('asc')
    .take(clampEventStreamLimit(args.limit))

  return {
    session: serializeSession(session),
    events,
    cursor:
      events.length === 0 ? (args.since ?? null) : events.at(-1)!.createdAt,
  }
}
