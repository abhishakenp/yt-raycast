import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { canReadPrivateSession } from './session_access_helpers'
import { serializeSession } from './session_serialization_helpers'

type SessionWorkspaceCtx = Pick<QueryCtx, 'db'>

export async function loadSessionWorkspace(
  ctx: SessionWorkspaceCtx,
  sessionId: Id<'sessions'>,
) {
  const session = await ctx.db.get(sessionId)
  if (
    session === null ||
    session.deletedAt !== undefined ||
    !(await canReadPrivateSession(ctx, session))
  ) {
    return null
  }

  const [tasks, preview, deployment, events] = await Promise.all([
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .take(100),
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .first(),
    ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .take(12),
  ])

  return {
    session: serializeSession(session),
    tasks: [...tasks].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    ),
    preview: preview ?? null,
    deployment,
    events: [...events].reverse(),
  }
}
