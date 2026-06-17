import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  buildChatRefinedOpenUiSource,
  buildChatRefinedPreviewHtml,
  buildChatRefinedSiteSpecJson,
  MAX_CHAT_MESSAGE_LENGTH,
  parseChatRefinementPlanJson,
  truncateText,
} from './chat_refinement_helpers'
import { assertCanMutateSession } from './session_access_helpers'
import { assertContentPolicy } from './session_prompt_helpers'

export type SendSessionChatMessageInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  content: string
  refinementPlanJson?: string
}

export const sendSessionChatMessage = async (
  ctx: MutationCtx,
  args: SendSessionChatMessageInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()
  const content = truncateText(args.content.trim(), MAX_CHAT_MESSAGE_LENGTH)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
  assertContentPolicy(content)

  content.length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'EMPTY_MESSAGE',
        message: 'Chat message is required',
      })
    })()

  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()

  latestPreview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready for chat refinement',
      })
    })()

  const nextPreviewVersion = latestPreview.version + 1
  const refinementPlan = parseChatRefinementPlanJson(args.refinementPlanJson)

  await ctx.db.insert('chatMessages', {
    sessionId: args.sessionId,
    role: 'user',
    content,
    createdAt: now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'chat_refinement_started',
    message: content,
    previewVersion: latestPreview.version,
    createdAt: now,
  })

  const refinement = buildChatRefinedPreviewHtml(
    latestPreview.html,
    content,
    refinementPlan,
  )

  const [homeModule, siteSpec] = await Promise.all([
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first(),
  ])
  const refinedOpenUiSource = buildChatRefinedOpenUiSource(
    homeModule?.source,
    content,
    refinement.summary,
    nextPreviewVersion,
    refinementPlan,
  )
  const refinedSiteSpecJson = buildChatRefinedSiteSpecJson(
    siteSpec?.specJson ?? siteSpec?.spec,
    content,
    refinement.summary,
    nextPreviewVersion,
    now,
    refinementPlan,
  )

  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: nextPreviewVersion,
    html: refinement.html,
    openUiSource: refinedOpenUiSource,
    siteSpecJson: refinedSiteSpecJson,
    source: 'edit',
    createdAt: now,
  })

  if (homeModule !== null && refinedOpenUiSource !== undefined) {
    await ctx.db.patch(homeModule._id, {
      source: refinedOpenUiSource,
      status: 'succeeded',
      errorMessage: undefined,
      updatedAt: now,
    })
  }

  if (siteSpec !== null && refinedSiteSpecJson !== undefined) {
    await ctx.db.patch(siteSpec._id, {
      specJson: refinedSiteSpecJson,
      updatedAt: now,
    })
  }

  await ctx.db.insert('edits', {
    sessionId: args.sessionId,
    previewVersion: nextPreviewVersion,
    editType: 'chat',
    instruction: content,
    afterHtml: refinement.html,
    createdAt: now,
    userId: session.userId,
  })

  await ctx.db.insert('chatMessages', {
    sessionId: args.sessionId,
    role: 'assistant',
    content: refinement.summary,
    createdAt: now,
  })

  await ctx.db.patch(args.sessionId, {
    previewVersion: nextPreviewVersion,
    updatedAt: now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_reload',
    message: 'Preview updated from chat refinement',
    previewVersion: nextPreviewVersion,
    createdAt: now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'chat_refinement_completed',
    message: 'Chat refinement completed',
    previewVersion: nextPreviewVersion,
    createdAt: now,
  })

  return { sessionId: args.sessionId, previewVersion: nextPreviewVersion }
}
