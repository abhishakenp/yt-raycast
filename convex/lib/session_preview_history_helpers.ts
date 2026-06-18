import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  upsertHomeGeneratedModule,
  upsertSiteSpec,
} from './session_artifact_helpers'
import { assertCanMutateSession } from './session_access_helpers'

export const serializePreviewHistoryItem = (preview: Doc<'previews'>) => ({
  previewId: preview._id,
  version: preview.version,
  source: preview.source,
  createdAt: preview.createdAt,
})

export const listSessionPreviewHistory = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
) => {
  const previews = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', sessionId),
    )
    .order('desc')
    .take(80)

  return previews.map(serializePreviewHistoryItem)
}

export const serializeSessionEdit = (edit: Doc<'edits'>) => ({
  editId: edit._id,
  editType: edit.editType,
  targetLabel: edit.targetLabel,
  beforeText: edit.beforeText,
  afterText: edit.afterText,
  afterHtml: edit.afterHtml,
  instruction: edit.instruction,
  occurrenceIndex: edit.occurrenceIndex,
  previewVersion: edit.previewVersion,
  createdAt: edit.createdAt,
  userId: edit.userId,
})

export const listSessionEdits = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
) => {
  const edits = await ctx.db
    .query('edits')
    .withIndex('by_sessionId_createdAt', (index) =>
      index.eq('sessionId', sessionId),
    )
    .order('desc')
    .take(80)

  return edits.map(serializeSessionEdit)
}

export const restorePreviewHistoryVersion = async (
  ctx: Pick<MutationCtx, 'db'>,
  args: {
    sessionId: Id<'sessions'>
    session: Doc<'sessions'>
    preview: Doc<'previews'>
    restoredVersion: number
    now: number
  },
) => {
  const nextPreviewVersion =
    (args.session.previewVersion ?? args.preview.version) + 1

  if (args.preview.openUiSource !== undefined) {
    await upsertHomeGeneratedModule(
      ctx,
      args.sessionId,
      args.preview.openUiSource,
      args.now,
    )
  }

  if (args.preview.siteSpecJson !== undefined) {
    await upsertSiteSpec(
      ctx,
      args.sessionId,
      args.preview.siteSpecJson,
      args.now,
    )
  }

  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: nextPreviewVersion,
    html: args.preview.html,
    openUiSource: args.preview.openUiSource,
    siteSpecJson: args.preview.siteSpecJson,
    source: 'history_restore',
    createdAt: args.now,
  })

  await ctx.db.patch(args.sessionId, {
    previewVersion: nextPreviewVersion,
    updatedAt: args.now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_reload',
    message: `Restored preview version ${args.restoredVersion}`,
    previewVersion: nextPreviewVersion,
    createdAt: args.now,
  })

  return {
    sessionId: args.sessionId,
    previewVersion: nextPreviewVersion,
  }
}

export const restoreOwnedPreviewVersion = async (
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    version: number
  },
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId).eq('version', args.version),
    )
    .first()

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Preview version not found',
      })
    })()

  return restorePreviewHistoryVersion(ctx, {
    sessionId: args.sessionId,
    session,
    preview,
    restoredVersion: args.version,
    now,
  })
}
