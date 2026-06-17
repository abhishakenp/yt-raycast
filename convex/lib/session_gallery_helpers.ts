import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  getGalleryCategories,
  getGalleryCategoryOptions,
  isGalleryVisibleSession,
  matchesGalleryFilters,
} from './gallery_helpers'

export type PublicGalleryArtifacts = {
  preview: Doc<'previews'> | null
  homeModule: Doc<'generatedModules'> | null
  siteSpec: Doc<'siteSpecs'> | null
}

export type PublicGallerySessionOptions = {
  legacySiteSpecFallback?: boolean
  previewReadyFromStoredPreview?: boolean
}

export type PublicGalleryListInput = {
  limit?: number
  page?: number
  search?: string
  category?: string
}

export const loadPublicGalleryArtifacts = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
): Promise<PublicGalleryArtifacts> => {
  const [preview, homeModule, siteSpec] = await Promise.all([
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .first(),
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
  ])

  return { preview, homeModule, siteSpec }
}

export const serializePublicGallerySession = (
  session: Doc<'sessions'>,
  artifacts: PublicGalleryArtifacts,
  options: PublicGallerySessionOptions = {},
) => {
  const previewReady =
    session.status === 'preview_ready' ||
    (options.previewReadyFromStoredPreview === true &&
      artifacts.preview !== null)
  const siteSpecJson =
    artifacts.siteSpec?.specJson ??
    (options.legacySiteSpecFallback === true
      ? artifacts.siteSpec?.spec
      : undefined) ??
    null

  return {
    id: session._id,
    sessionId: session._id,
    prompt: session.prompt,
    preferredLanguage: session.preferredLanguage,
    status: session.status ?? null,
    previewVersion: artifacts.preview?.version ?? session.previewVersion ?? 0,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt ?? session.createdAt,
    html: artifacts.preview?.html ?? null,
    moduleSource: artifacts.homeModule?.source ?? null,
    siteSpecJson,
    categories: getGalleryCategories(session.prompt),
    elapsed: session.elapsed ?? null,
    cost: session.cost ?? null,
    homepageReady: session.homepageReady ?? null,
    siteSpecReady: session.siteSpecReady ?? null,
    openuiReady: session.openuiReady ?? null,
    readiness: {
      homepageReady: session.homepageReady ?? null,
      siteSpecReady: session.siteSpecReady ?? null,
      openuiReady: session.openuiReady ?? null,
      previewReady,
    },
  }
}

export const listPublicGallerySessions = async (
  ctx: Pick<QueryCtx, 'db'>,
  args: PublicGalleryListInput,
) => {
  const limit = Math.min(Math.max(args.limit ?? 12, 1), 48)
  const requestedPage = Math.max(args.page ?? 1, 1)
  const scanLimit = Math.min(Math.max((requestedPage + 1) * limit * 6, 96), 300)
  const publicSessions = await ctx.db
    .query('sessions')
    .withIndex('by_public_createdAt', (index) => index.eq('isPrivate', false))
    .order('desc')
    .take(scanLimit)
  const visibleSessions = publicSessions.filter(isGalleryVisibleSession)
  const searchFilteredSessions = visibleSessions.filter((session) =>
    matchesGalleryFilters(session, args.search, undefined),
  )
  const availableCategories = getGalleryCategoryOptions(searchFilteredSessions)
  const filteredSessions = searchFilteredSessions.filter((session) =>
    matchesGalleryFilters(session, undefined, args.category),
  )

  const total = filteredSessions.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(requestedPage, totalPages)
  const sessions = filteredSessions.slice((page - 1) * limit, page * limit)
  const items = await Promise.all(
    sessions.map(async (session) => {
      const artifacts = await loadPublicGalleryArtifacts(ctx, session._id)
      return serializePublicGallerySession(session, artifacts, {
        legacySiteSpecFallback: true,
        previewReadyFromStoredPreview: true,
      })
    }),
  )

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    availableCategories,
  }
}

export const loadPublicGallerySession = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionIdValue: string,
) => {
  const sessionId = ctx.db.normalizeId('sessions', sessionIdValue)
  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)
  if (
    session === null ||
    session.isPrivate === true ||
    !isGalleryVisibleSession(session)
  ) {
    return null
  }

  const artifacts = await loadPublicGalleryArtifacts(ctx, session._id)
  return serializePublicGallerySession(session, artifacts)
}
