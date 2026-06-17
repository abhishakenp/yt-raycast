import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { serializeSession } from './session_serialization_helpers'

type SessionWorkspaceCtx = Pick<QueryCtx, 'db'>

export const loadSessionWorkspace = async (
  ctx: SessionWorkspaceCtx,
  sessionId: Id<'sessions'>,
) => {
  const [session, tasks, preview, deployment, events] = await Promise.all([
    ctx.db.get(sessionId),
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

  return session === null
    ? null
    : {
        session: serializeSession(session),
        tasks: [...tasks].sort(
          (left, right) => (left.order ?? 0) - (right.order ?? 0),
        ),
        preview,
        deployment,
        events: [...events].reverse(),
      }
}
