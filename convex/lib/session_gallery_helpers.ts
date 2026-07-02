import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { isUnsafePublicPreviewHtml } from './openui_error_html'
import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from './session_edit_helpers'
import {
  applyCachedTranslationsToSource,
  loadCachedTranslationsForSource,
  type CachedSourceTranslation,
} from './session_translation_cache_helpers'
import {
  getGalleryCategories,
  getGalleryCategoryOptions,
  isGalleryVisibleSession,
  matchesGalleryFilters,
} from './gallery_helpers'
import { getUserId, hashOwnerSecret } from './session_access_helpers'

export type PublicGalleryArtifacts = {
  preview: Doc<'previews'> | null
  homeModule: Doc<'generatedModules'> | null
  siteSpec: Doc<'siteSpecs'> | null
  edits?: Doc<'edits'>[] | null
  translations?: CachedSourceTranslation[] | null
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

export type OwnedGalleryListInput = PublicGalleryListInput & {
  anonymousClientId?: string
}

const loadPublicGalleryBaseArtifacts = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
): Promise<PublicGalleryArtifacts> => {
  const [homeModule, siteSpec] = await Promise.all([
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
  const hasSourceWithoutPreview =
    (homeModule?.source && isLikelyOpenUISource(homeModule.source)) ||
    readOpenUISourceFromSiteSpec(siteSpec) !== undefined
  const preview = hasSourceWithoutPreview
    ? null
    : await ctx.db
        .query('previews')
        .withIndex('by_sessionId_version', (index) =>
          index.eq('sessionId', sessionId),
        )
        .order('desc')
        .first()
  const edits = await ctx.db
    .query('edits')
    .withIndex('by_sessionId_createdAt', (index) =>
      index.eq('sessionId', sessionId),
    )
    .collect()
    .catch(() => [])

  const baseArtifacts =
    edits.length > 0
      ? { preview, homeModule, siteSpec, edits }
      : { preview, homeModule, siteSpec }

  return baseArtifacts
}

export const loadPublicGalleryArtifacts = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  preferredLanguage?: string,
): Promise<PublicGalleryArtifacts> => {
  const baseArtifacts = await loadPublicGalleryBaseArtifacts(ctx, sessionId)
  const translations = await loadCachedTranslationsForSource(
    ctx,
    preferredLanguage,
    applyGalleryEditsToSource(
      resolveGalleryOpenUISource(baseArtifacts),
      baseArtifacts.edits,
    ),
  )

  return translations.length > 0
    ? { ...baseArtifacts, translations }
    : baseArtifacts
}

const isLikelyOpenUISource = (source: string | undefined): boolean => {
  if (source === undefined) return false
  const trimmed = source.trim()
  if (!trimmed) return false
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return true
  }
  return /(?:^|\n)\s*(?:root|\$page)\s*=/.test(trimmed)
}

const readOpenUISourceFromSiteSpec = (
  siteSpec: Doc<'siteSpecs'> | null,
): string | undefined => {
  const candidates = [siteSpec?.specJson, siteSpec?.spec]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue

    try {
      const parsed = JSON.parse(candidate) as unknown
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'pages' in parsed &&
        parsed.pages !== null &&
        typeof parsed.pages === 'object'
      ) {
        const home = (parsed.pages as Record<string, unknown>).home
        if (typeof home === 'string' && isLikelyOpenUISource(home)) return home
      }
    } catch {
      if (isLikelyOpenUISource(candidate)) return candidate
    }
  }

  return undefined
}

const resolveGalleryOpenUISource = (
  artifacts: PublicGalleryArtifacts,
): string => {
  const { preview, homeModule, siteSpec } = artifacts
  return preview?.openUiSource && isLikelyOpenUISource(preview.openUiSource)
    ? preview.openUiSource
    : (readOpenUISourceFromSiteSpec(siteSpec) ??
        (homeModule?.source && isLikelyOpenUISource(homeModule.source)
          ? homeModule.source
          : undefined) ??
        '')
}

const applyGalleryEditsToSource = (
  source: string,
  edits: Doc<'edits'>[] | null | undefined,
): string => {
  if (!edits || edits.length === 0) return source

  let result = source
  for (const edit of [...edits].reverse()) {
    if (edit.editType === 'text' && edit.beforeText && edit.afterText) {
      const textResult = applyPreviewTextEdit(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (textResult.replaced) result = textResult.html
    } else if (edit.editType === 'image' && edit.beforeText && edit.afterText) {
      const imageResult = applyImageSwap(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (imageResult.replaced) result = imageResult.html
    } else if (edit.editType === 'style' && edit.beforeText && edit.afterText) {
      const styleResult = applyStyleEdit(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (styleResult.replaced) result = styleResult.html
    }
  }

  return result
}

const isRenderableGalleryArtifacts = (
  artifacts: PublicGalleryArtifacts,
): boolean => {
  if (artifacts.preview === null) {
    return resolveGalleryOpenUISource(artifacts).trim().length > 0
  }
  if (!isUnsafePublicPreviewHtml(artifacts.preview.html)) return true
  return resolveGalleryOpenUISource(artifacts).trim().length > 0
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
  const moduleSource = applyCachedTranslationsToSource(
    applyGalleryEditsToSource(
      resolveGalleryOpenUISource(artifacts),
      artifacts.edits,
    ),
    artifacts.translations,
  )
  const previewHtml = isUnsafePublicPreviewHtml(artifacts.preview?.html)
    ? null
    : (artifacts.preview?.html ?? null)

  return {
    id: session._id,
    sessionId: session._id,
    prompt: session.prompt,
    preferredLanguage: session.preferredLanguage,
    themeOverride: session.themeOverride ?? null,
    themeMode: session.themeMode ?? null,
    genuiTheme: session.genuiTheme ?? null,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
    status: session.status ?? null,
    previewVersion: artifacts.preview?.version ?? session.previewVersion ?? 0,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt ?? session.createdAt,
    html: previewHtml,
    moduleSource: moduleSource.trim().length > 0 ? moduleSource : null,
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
  const scanLimit = Math.min(Math.max(requestedPage * limit * 2, limit), 96)
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
  const pageSessions = filteredSessions.slice((page - 1) * limit, page * limit)
  const translatedPageSessions = await Promise.all(
    pageSessions.map(async (session) => ({
      session,
      artifacts: await loadPublicGalleryArtifacts(
        ctx,
        session._id,
        session.preferredLanguage,
      ),
    })),
  )
  const validPageSessions = translatedPageSessions.filter(({ artifacts }) =>
    isRenderableGalleryArtifacts(artifacts),
  )
  const suppressedCount =
    translatedPageSessions.length - validPageSessions.length
  const visibleTotal =
    suppressedCount > 0 ? Math.max(0, total - suppressedCount) : total
  const visibleTotalPages = Math.max(1, Math.ceil(visibleTotal / limit))
  const items = validPageSessions.map(({ session, artifacts }) =>
    serializePublicGallerySession(session, artifacts, {
      legacySiteSpecFallback: true,
      previewReadyFromStoredPreview: true,
    }),
  )

  return {
    items,
    page,
    limit,
    total: visibleTotal,
    totalPages: visibleTotalPages,
    hasNext: page < visibleTotalPages,
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

  const artifacts = await loadPublicGalleryArtifacts(
    ctx,
    session._id,
    session.preferredLanguage,
  )
  if (
    artifacts.preview !== null &&
    isUnsafePublicPreviewHtml(artifacts.preview.html) &&
    resolveGalleryOpenUISource(artifacts).trim().length === 0
  ) {
    return null
  }
  return serializePublicGallerySession(session, artifacts)
}

// "My generations" — returns sessions owned by the caller (signed-in userId via
// Convex auth, or anonymousClientId hashed to anonymousClientIdHash), including
// PRIVATE sessions the caller owns. Excludes sessions owned by anyone else.
export const listOwnedGallerySessions = async (
  ctx: QueryCtx,
  args: OwnedGalleryListInput,
) => {
  const userId = await getUserId(ctx)
  const anonymousClientIdHash =
    userId === undefined && args.anonymousClientId !== undefined
      ? await hashOwnerSecret(args.anonymousClientId)
      : undefined

  if (userId === undefined && anonymousClientIdHash === undefined) {
    return {
      items: [],
      page: 1,
      limit: Math.min(Math.max(args.limit ?? 12, 1), 48),
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      availableCategories: [],
    }
  }

  const ownedSessions =
    userId !== undefined
      ? await ctx.db
          .query('sessions')
          .withIndex('by_userId', (index) => index.eq('userId', userId))
          .collect()
      : await ctx.db
          .query('sessions')
          .withIndex('by_anonymousClientIdHash', (index) =>
            index.eq('anonymousClientIdHash', anonymousClientIdHash),
          )
          .collect()

  // by_userId / by_anonymousClientIdHash are NOT createdAt-ordered, so sort
  // newest-first to match the public gallery's by_public_createdAt desc order.
  ownedSessions.sort(
    (left, right) =>
      Number(right.createdAt ?? right._creationTime ?? 0) -
      Number(left.createdAt ?? left._creationTime ?? 0),
  )

  // Owned sessions are visible to their owner regardless of gallery-ready
  // signals (a private in-progress generation is still "mine"), but we keep
  // the gallery-visible filter so the grid shows previews once they exist.
  const visibleSessions = ownedSessions.filter(isGalleryVisibleSession)
  const searchFilteredSessions = visibleSessions.filter((session) =>
    matchesGalleryFilters(session, args.search, undefined),
  )
  const availableCategories = getGalleryCategoryOptions(searchFilteredSessions)
  const filteredSessions = searchFilteredSessions.filter((session) =>
    matchesGalleryFilters(session, undefined, args.category),
  )

  const limit = Math.min(Math.max(args.limit ?? 12, 1), 48)
  const requestedPage = Math.max(args.page ?? 1, 1)

  const total = filteredSessions.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(requestedPage, totalPages)
  const pageSessions = filteredSessions.slice((page - 1) * limit, page * limit)
  const translatedPageSessions = await Promise.all(
    pageSessions.map(async (session) => ({
      session,
      artifacts: await loadPublicGalleryArtifacts(
        ctx,
        session._id,
        session.preferredLanguage,
      ),
    })),
  )
  const validPageSessions = translatedPageSessions.filter(({ artifacts }) =>
    isRenderableGalleryArtifacts(artifacts),
  )
  const suppressedCount =
    translatedPageSessions.length - validPageSessions.length
  const visibleTotal =
    suppressedCount > 0 ? Math.max(0, total - suppressedCount) : total
  const visibleTotalPages = Math.max(1, Math.ceil(visibleTotal / limit))
  const items = validPageSessions.map(({ session, artifacts }) =>
    serializePublicGallerySession(session, artifacts, {
      legacySiteSpecFallback: true,
      previewReadyFromStoredPreview: true,
    }),
  )

  return {
    items,
    page,
    limit,
    total: visibleTotal,
    totalPages: visibleTotalPages,
    hasNext: page < visibleTotalPages,
    hasPrev: page > 1,
    availableCategories,
  }
}
