import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { getUserId, hashOwnerSecret } from './session_access_helpers'
import { cloneCachedGeneratedArtifacts } from './session_artifact_helpers'
import {
  applySessionEdit,
  type SessionEditInput,
} from './session_edit_mutation_helpers'

type OperationalNotificationReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

export type ForkSessionInput = {
  sourceSessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  edit?: SessionEditInput
}

export const forkSessionForOwner = async (
  ctx: MutationCtx,
  args: ForkSessionInput,
  sendOperationalNotification: OperationalNotificationReference,
) => {
  const source = await ctx.db.get(args.sourceSessionId)
  const now = Date.now()

  source !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const userId = await getUserId(ctx)
  const anonOwnerSecretHash =
    userId === undefined && args.anonymousOwnerSecret !== undefined
      ? await hashOwnerSecret(args.anonymousOwnerSecret)
      : undefined

  userId !== undefined ||
    anonOwnerSecretHash !== undefined ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Sign in to save your changes',
      })
    })()

  const targetSessionId = await ctx.db.insert('sessions', {
    userId,
    anonOwnerSecretHash,
    workspace: source.workspace,
    prompt: source.prompt,
    status: 'queued',
    preferredLanguage: source.preferredLanguage,
    preferredExportTarget: source.preferredExportTarget,
    designReferenceUrls: source.designReferenceUrls,
    designReferenceNotes: source.designReferenceNotes,
    cloneUrl: source.cloneUrl,
    engineVersion: source.engineVersion,
    isPrivate: source.isPrivate,
    previewVersion: 0,
    createdAt: now,
    updatedAt: now,
  })

  const cloned = await cloneCachedGeneratedArtifacts(ctx, {
    cachedSession: source,
    targetSessionId,
    userId,
    anonymousClientIdHash: undefined,
    now,
    sendOperationalNotification,
  })

  if (!cloned) {
    const latestPreview = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', source._id),
      )
      .order('desc')
      .first()

    latestPreview !== null ||
      (() => {
        throw new ConvexError({
          code: 'PREVIEW_NOT_READY',
          message: 'Preview is not ready',
        })
      })()

    await ctx.db.insert('previews', {
      sessionId: targetSessionId,
      version: 1,
      html: latestPreview.html,
      openUiSource: latestPreview.openUiSource,
      siteSpecJson: latestPreview.siteSpecJson,
      source: 'generation',
      createdAt: now,
    })
    await ctx.db.patch(targetSessionId, {
      status: 'preview_ready',
      homepageReady: true,
      openuiReady: true,
      previewVersion: 1,
      updatedAt: now,
    })
  }

  let editApplied = false
  let editPreviewVersion: number | undefined
  if (args.edit !== undefined) {
    const target = await ctx.db.get(targetSessionId)
    if (target !== null) {
      try {
        const editResult = await applySessionEdit(ctx, target, args.edit, now)
        editApplied = true
        editPreviewVersion = editResult.previewVersion
      } catch (error) {
        if (!(error instanceof ConvexError)) throw error
      }
    }
  }

  return { sessionId: targetSessionId, editApplied, editPreviewVersion }
}
