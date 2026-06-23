import { ConvexError } from 'convex/values'

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
  html: string
  isHome: boolean
  failed: boolean
  order: number
  byteLength: number
  truncated?: boolean
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
    html: args.html,
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
  const html = homePage.html

  await upsertHomeGeneratedModule(ctx, args.sessionId, html, now)

  const previewVersion = (session.previewVersion ?? 0) + 1

  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: previewVersion,
    html,
    openUiSource: html,
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
      isHome: page.isHome,
      failed: page.failed,
    }))
}
