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
  if (session === null || session.deletedAt !== undefined) return null
  await assertCanReadPrivateSession(ctx, session, args.anonymousOwnerSecret)

  const limit = clampEventStreamLimit(args.limit)
  const candidates = await ctx.db
    .query('generationEvents')
    .withIndex('by_sessionId_createdAt', (index) => {
      const scoped = index.eq('sessionId', sessionId)
      return args.since === undefined
        ? scoped
        : scoped.gt('createdAt', args.since)
    })
    .order('asc')
    .take(limit + 1)

  let events = candidates.slice(0, limit)
  const boundary = events.at(-1)?.createdAt
  const overflow = candidates.at(limit)

  // A timestamp alone cannot identify a position inside a tied group. Keep the
  // numeric cursor backward-compatible by treating the requested limit as a
  // soft boundary and returning the complete tie group in the same page.
  if (boundary !== undefined && overflow?.createdAt === boundary) {
    const tiedEvents = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId).eq('createdAt', boundary),
      )
      .order('asc')
      .collect()
    events = [
      ...candidates
        .slice(0, limit)
        .filter((event) => event.createdAt < boundary),
      ...tiedEvents,
    ]
  }

  return {
    session: serializeSession(session),
    events,
    cursor:
      events.length === 0 ? (args.since ?? null) : events.at(-1)!.createdAt,
  }
}
