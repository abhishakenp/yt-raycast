import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { canReadPrivateSession } from './session_access_helpers'
import { serializeSession } from './session_serialization_helpers'

type SessionReadinessCtx = Pick<QueryCtx, 'db'>

export async function loadSessionReadiness(
  ctx: SessionReadinessCtx,
  lookup: string,
) {
  const sessionId = ctx.db.normalizeId('sessions', lookup)

  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)

  if (session === null || !(await canReadPrivateSession(ctx, session))) {
    return null
  }

  const [tasks, preview, siteSpec, openUiModule] = await Promise.all([
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
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .first(),
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index
          .eq('sessionId', sessionId as Id<'sessions'>)
          .eq('moduleKey', 'home'),
      )
      .first(),
  ])
  const sortedTasks = [...tasks].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  )
  const done = sortedTasks.filter((task) => task.status === 'succeeded').length

  return {
    session: serializeSession(session),
    readiness: {
      homepageReady:
        session.status === 'homepage_ready' ||
        session.status === 'site_spec_ready' ||
        session.status === 'preview_ready' ||
        sortedTasks.some(
          (task) => task.taskKey === 'homepage' && task.status === 'succeeded',
        ),
      openuiReady:
        preview !== null ||
        (openUiModule !== null && openUiModule.status === 'succeeded'),
      siteSpecReady:
        siteSpec !== null ||
        session.status === 'site_spec_ready' ||
        session.status === 'preview_ready',
      done,
      taskCount: sortedTasks.length,
    },
  }
}
