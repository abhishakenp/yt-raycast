import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { serializeSession } from './session_serialization_helpers'

type GenerationViewCtx = Pick<QueryCtx, 'db'>

export type GenerationViewLookupArgs = {
  sessionId?: Id<'sessions'>
  lookup?: string
}

export const resolveGenerationViewSessionId = async (
  ctx: GenerationViewCtx,
  args: GenerationViewLookupArgs,
): Promise<Id<'sessions'> | null> => {
  const lookup = args.lookup
  const directSessionId: Id<'sessions'> | null =
    args.sessionId ??
    (lookup === undefined ? null : ctx.db.normalizeId('sessions', lookup))

  if (directSessionId !== null) return directSessionId

  const exportId =
    lookup === undefined ? null : ctx.db.normalizeId('exports', lookup)
  const exportRecord = exportId === null ? null : await ctx.db.get(exportId)

  if (exportRecord !== null) return exportRecord.sessionId
  if (lookup === undefined) return null

  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', lookup))
    .first()

  return deployment?.sessionId ?? null
}

export const loadGenerationView = async (
  ctx: GenerationViewCtx,
  args: GenerationViewLookupArgs,
) => {
  const sessionId = await resolveGenerationViewSessionId(ctx, args)

  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)

  if (session === null) return null

  const [tasks, events, homeModule, siteSpec, latestPreview] =
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
    ])

  return {
    session: serializeSession(session),
    tasks: [...tasks].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    ),
    events: [...events].reverse(),
    homeModule: homeModule as Doc<'generatedModules'> | null,
    siteSpec: siteSpec as Doc<'siteSpecs'> | null,
    latestPreview: latestPreview as Doc<'previews'> | null,
  }
}
