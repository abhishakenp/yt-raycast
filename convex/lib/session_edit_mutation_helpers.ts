import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { replaceFirstJsonText } from './chat_refinement_helpers'
import { assertCanMutateSession } from './session_access_helpers'
import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from './session_edit_helpers'

export type SessionEditInput = {
  editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image'
  targetLabel?: string
  beforeText?: string
  afterText?: string
  afterHtml?: string
  instruction?: string
  /** 0-based document-order index disambiguating repeated text. */
  occurrenceIndex?: number
}

const getCurrentHomeModuleAndSiteSpec = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
) =>
  await Promise.all([
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

export const applyTextEditToCurrentArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string | undefined,
  afterText: string | undefined,
  now: number,
  occurrenceIndex?: number,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
  openUiReplaced: boolean
  siteSpecReplaced: boolean
}> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )
  let openUiSource = homeModule?.source
  let siteSpecJson = siteSpec?.specJson ?? siteSpec?.spec
  let openUiReplaced = false
  let siteSpecReplaced = false

  if (homeModule !== null) {
    const sourceEdit = applyPreviewTextEdit(
      homeModule.source,
      beforeText,
      afterText,
      occurrenceIndex,
    )
    if (!sourceEdit.replaced) {
      return { openUiSource, siteSpecJson, openUiReplaced, siteSpecReplaced }
    }

    openUiReplaced = true
    openUiSource = sourceEdit.html
    await ctx.db.patch(homeModule._id, {
      source: sourceEdit.html,
      status: 'succeeded',
      errorMessage: undefined,
      updatedAt: now,
    })
  }

  if (siteSpec !== null && siteSpecJson !== undefined) {
    try {
      const parsed: unknown = JSON.parse(siteSpecJson)
      const specEdit = replaceFirstJsonText(
        parsed,
        String(beforeText ?? ''),
        String(afterText ?? ''),
      )
      if (specEdit.replaced) {
        siteSpecReplaced = true
        siteSpecJson = JSON.stringify(specEdit.value)
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    } catch {
      const specEdit = applyPreviewTextEdit(siteSpecJson, beforeText, afterText)
      if (specEdit.replaced) {
        siteSpecReplaced = true
        siteSpecJson = specEdit.html
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    }
  }

  return { openUiSource, siteSpecJson, openUiReplaced, siteSpecReplaced }
}

const snapshotCurrentArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
}> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )

  return {
    openUiSource: homeModule?.source,
    siteSpecJson: siteSpec?.specJson ?? siteSpec?.spec,
  }
}

export type CreateSessionEditInput = SessionEditInput & {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
}

export const createSessionEdit = async (
  ctx: MutationCtx,
  args: CreateSessionEditInput,
  now = Date.now(),
) => {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  return await applySessionEdit(ctx, session, args, now)
}

export const applySessionEdit = async (
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  args: SessionEditInput,
  now: number,
) => {
  const sessionId = session._id

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', sessionId),
    )
    .order('desc')
    .first()

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready',
      })
    })()

  const editedPreview =
    args.afterHtml !== undefined
      ? { html: args.afterHtml, replaced: true }
      : args.editType === 'image'
        ? applyImageSwap(
            preview.html,
            args.beforeText,
            args.afterText,
            args.occurrenceIndex,
          )
        : args.editType === 'style'
          ? applyStyleEdit(
              preview.html,
              args.beforeText,
              args.afterText,
              args.occurrenceIndex,
            )
          : applyPreviewTextEdit(
              preview.html,
              args.beforeText,
              args.afterText,
              args.occurrenceIndex,
            )

  if (!editedPreview.replaced) {
    throw new ConvexError({
      code: 'TEXT_NOT_FOUND',
      message:
        args.editType === 'image'
          ? 'Image source was not found in the current preview.'
          : 'Selected text was not found in the current preview. Select a smaller text block and try again.',
    })
  }

  const nextPreviewVersion = preview.version + 1

  // Text edits must patch the canonical generated artifacts (homeModule.source
  // + siteSpec) in addition to the preview, because the Dashboard renders from
  // homeModule.source — patching only preview.html makes edits vanish on
  // reload. Image/style/ai_rewrite edits keep the snapshot pattern: their
  // overrides are reapplied client-side from the recorded edit history.
  let openUiSource: string | undefined
  let siteSpecJson: string | undefined
  if (
    args.afterHtml === undefined &&
    args.editType !== 'style' &&
    args.editType !== 'image'
  ) {
    const artifactSnapshot = await applyTextEditToCurrentArtifacts(
      ctx,
      sessionId,
      args.beforeText,
      args.afterText,
      now,
      args.occurrenceIndex,
    )
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else {
    const artifactSnapshot = await snapshotCurrentArtifacts(ctx, sessionId)
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  }

  await ctx.db.insert('previews', {
    sessionId,
    version: nextPreviewVersion,
    html: editedPreview.html,
    openUiSource,
    siteSpecJson,
    source: args.editType === 'ai_rewrite' ? 'rewrite' : 'edit',
    createdAt: now,
  })
  await ctx.db.patch(sessionId, {
    previewVersion: nextPreviewVersion,
    updatedAt: now,
  })
  await ctx.db.insert('generationEvents', {
    sessionId,
    eventType: 'preview_reload',
    message: 'Preview updated',
    previewVersion: nextPreviewVersion,
    createdAt: now,
  })

  // Record edit history for all edit types so client-side override maps can
  // rebuild image and style edits after preview reloads.
  await ctx.db.insert('edits', {
    sessionId,
    previewVersion: nextPreviewVersion,
    editType: args.editType,
    targetLabel: args.targetLabel,
    beforeText: args.beforeText,
    afterText: args.afterText,
    afterHtml: args.afterHtml,
    instruction: args.instruction,
    occurrenceIndex: args.occurrenceIndex,
    createdAt: now,
    userId: session.userId,
  })

  return {
    sessionId,
    previewVersion: nextPreviewVersion,
    saved: editedPreview.replaced,
  }
}
