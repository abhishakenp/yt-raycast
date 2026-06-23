import { ConvexError } from 'convex/values'

import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { upsertHomeGeneratedModule } from './session_artifact_helpers'
import { assertCanMutateSession } from './session_access_helpers'
import { scheduleOperationalNotification } from './session_operational_notifications'
import { seedCmsBindingsForGeneratedArtifacts } from './session_cms_binding_helpers'

type OperationalNotificationReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

const assertSessionExists = async (
  ctx: Pick<MutationCtx, 'db'> & Pick<MutationCtx, 'auth'>,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  return session
}

export type WriteClonePageInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  pathname: string
  title?: string
  // Small docs carry inline html; large verbatim clones (> ~900KB) carry a
  // storageId pointing at a Convex file (no 1 MiB per-document limit).
  html?: string
  storageId?: Id<'_storage'>
  isHome: boolean
  failed: boolean
  order: number
  byteLength: number
  truncated?: boolean
}

// Owned-session guard + upload-url for the large-doc file-storage path. Mirrors
// writeClonePageDoc's ownership check so anonymous owners can upload too.
export const generateCloneUploadUrl = async (
  ctx: MutationCtx,
  args: { sessionId: Id<'sessions'>; anonymousOwnerSecret?: string },
) => {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
  return await ctx.storage.generateUploadUrl()
}

export const writeSessionClonePage = async (
  ctx: MutationCtx,
  args: WriteClonePageInput,
) => {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const now = Date.now()
  const pageFields = {
    pathname: args.pathname,
    title: args.title,
    html: args.html ?? undefined,
    storageId: args.storageId,
    isHome: args.isHome,
    failed: args.failed,
    order: args.order,
    byteLength: args.byteLength,
    truncated: args.truncated,
    updatedAt: now,
  }

  const existingPage = await ctx.db
    .query('clonePages')
    .withIndex('by_sessionId_pathname', (index) =>
      index.eq('sessionId', args.sessionId).eq('pathname', args.pathname),
    )
    .first()

  existingPage === null
    ? await ctx.db.insert('clonePages', {
        sessionId: args.sessionId,
        ...pageFields,
        createdAt: now,
      })
    : await ctx.db.patch(existingPage._id, pageFields)

  session.cloneMode === true ||
    (await ctx.db.patch(args.sessionId, { cloneMode: true, updatedAt: now }))

  return { sessionId: args.sessionId, pathname: args.pathname }
}

export type ApplyCloneBriefInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  cloneBrief: string
  themeOverride?: unknown
}

export const applyCloneBriefAndGenerate = async (
  ctx: MutationCtx,
  args: ApplyCloneBriefInput,
) => {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  await ctx.db.patch(args.sessionId, {
    cloneBrief: args.cloneBrief,
    cloneMode: false,
    ...(args.themeOverride !== undefined
      ? { themeOverride: args.themeOverride }
      : {}),
  })

  await ctx.scheduler.runAfter(0, internal.generation.startGeneration, {
    sessionId: args.sessionId,
    anonymousOwnerSecret: args.anonymousOwnerSecret,
  })

  return { sessionId: args.sessionId }
}

export type FinalizeClonePreviewInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  sendOperationalNotification: OperationalNotificationReference
}

export const finalizeSessionClonePreview = async (
  ctx: MutationCtx,
  args: FinalizeClonePreviewInput,
) => {
  const session = await assertSessionExists(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const clonePages = await ctx.db
    .query('clonePages')
    .withIndex('by_sessionId', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .collect()

  const homePage =
    clonePages.find((page) => page.isHome) ??
    clonePages.find((page) => page.order === 0) ??
    null

  homePage !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'No clone home page found for session',
      })
    })()

  const now = Date.now()
  // When the home doc lives in file storage, we can't fetch its bytes inside a
  // mutation (no network). Store an empty placeholder for generatedModules/previews
  // and let the client render from the storage url via getCloneHomePreview.
  const html = homePage.html ?? ''

  await upsertHomeGeneratedModule(ctx, args.sessionId, html, now)

  const previewVersion = (session.previewVersion ?? 0) + 1

  // A verbatim clone doc carries the full inlined CSS and can approach the
  // ~1 MiB cap on its own. Storing it in BOTH `html` and `openUiSource` would
  // double the previews document and blow Convex's 1 MiB per-document limit, so
  // the finalize silently fails and the preview never paints. The clone renders
  // from `html` (isHtmlDocumentSource → iframe srcDoc) and from clonePages, so
  // keep `openUiSource` empty for clones.
  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: previewVersion,
    html,
    openUiSource: '',
    source: 'generation',
    createdAt: now,
  })

  await seedCmsBindingsForGeneratedArtifacts(
    ctx,
    args.sessionId,
    { html },
    now,
  )

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_ready',
    message: 'Clone preview ready',
    previewVersion,
    createdAt: now,
  })

  await scheduleOperationalNotification(
    ctx,
    {
      sessionId: args.sessionId,
      eventType: 'run_completed',
      message: 'Clone preview ready',
      provider: 'website-clone',
      cacheHit: false,
    },
    args.sendOperationalNotification,
  )

  await ctx.db.patch(args.sessionId, {
    status: 'preview_ready',
    openuiReady: true,
    previewVersion,
    updatedAt: now,
  })

  return { sessionId: args.sessionId, previewVersion }
}

export const listSessionClonePages = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
) => {
  const pages = await ctx.db
    .query('clonePages')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .collect()

  return [...pages]
    .sort((left, right) => left.order - right.order)
    .map((page) => ({
      pathname: page.pathname,
      title: page.title,
      html: page.html,
      storageId: page.storageId,
      isHome: page.isHome,
      failed: page.failed,
      byteLength: page.byteLength,
      truncated: page.truncated,
    }))
}

// Resolve the home clone page's renderable content. Returns BOTH a possible
// inline `html` (small docs → iframe srcDoc) and a `url` (large docs in file
// storage → iframe src); the client picks `url` when present, else `html`.
export const loadCloneHomePreview = async (
  ctx: Pick<QueryCtx, 'db' | 'storage'>,
  lookup: string,
) => {
  const sessionId = ctx.db.normalizeId('sessions', lookup)
  const session = sessionId === null ? null : await ctx.db.get(sessionId)
  if (session === null) return null

  const pages = await ctx.db
    .query('clonePages')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', session._id))
    .collect()

  const homePage =
    pages.find((page) => page.isHome) ??
    pages.find((page) => page.order === 0) ??
    null

  if (homePage === null) return null

  return {
    html: homePage.html ?? null,
    url: homePage.storageId
      ? await ctx.storage.getUrl(homePage.storageId)
      : null,
    version: session.previewVersion ?? 0,
  }
}
