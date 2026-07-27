import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { canReadPrivateSession } from './session_access_helpers'
import { serializeSession } from './session_serialization_helpers'

type GenerationViewCtx = Pick<QueryCtx, 'db'>

export type GenerationViewLookupArgs = {
  sessionId?: Id<'sessions'>
  lookup?: string
}

export async function resolveGenerationViewSessionId(
  ctx: GenerationViewCtx,
  args: GenerationViewLookupArgs,
): Promise<Id<'sessions'> | null> {
  const lookup = args.lookup
  const directSessionId: Id<'sessions'> | null =
    args.sessionId ??
    (lookup === undefined ? null : ctx.db.normalizeId('sessions', lookup))

  if (directSessionId !== null) return directSessionId

  const exportId =
    lookup === undefined ? null : ctx.db.normalizeId('exports', lookup)
  const exportRecord = exportId === null ? null : await ctx.db.get(exportId)

  if (exportRecord !== null) return exportRecord.sessionId

  const previewId =
    lookup === undefined ? null : ctx.db.normalizeId('previews', lookup)
  const preview = previewId === null ? null : await ctx.db.get(previewId)

  if (preview !== null) return preview.sessionId
  if (lookup === undefined) return null

  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', lookup))
    .first()

  return deployment?.sessionId ?? null
}

export async function loadGenerationView(
  ctx: GenerationViewCtx,
  args: GenerationViewLookupArgs,
) {
  const sessionId = await resolveGenerationViewSessionId(ctx, args)

  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)

  if (
    session === null ||
    session.deletedAt !== undefined ||
    !(await canReadPrivateSession(ctx, session))
  ) {
    return null
  }

  const [tasks, events, homeModule, siteSpec, latestPreview, aiCapsules] =
    await Promise.all([
      ctx.db
        .query('tasks')
        .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
        .take(100),
      ctx.db
        .query('generationEvents')
        .withIndex('by_sessionId_createdAt', (index) =>
          index.eq('sessionId', sessionId),
        )
        .order('desc')
        .take(80),
      ctx.db
        .query('generatedModules')
        .withIndex('by_sessionId_moduleKey', (index) =>
          index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
        )
        .first(),
      ctx.db
        .query('siteSpecs')
        .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
        .first(),
      ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', sessionId),
        )
        .order('desc')
        .first(),
      ctx.db
        .query('aiCapsules')
        .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
        .take(100),
    ])

  return {
    session: serializeSession(session),
    tasks: [...tasks].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    ),
    events: [...events].reverse(),
    homeModule: homeModule as Doc<'generatedModules'> | null,
    siteSpec: siteSpec as Doc<'siteSpecs'> | null,
    latestPreview: latestPreview ? (latestPreview as Doc<'previews'>) : null,
    aiCapsules: aiCapsules as Doc<'aiCapsules'>[],
  }
}
