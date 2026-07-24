import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  getUserId,
  isUserAdmin,
} from './session_access_helpers'
import { upsertSessionAiCapsule } from './session_ai_capsule_helpers'
import {
  applyOpenUiVarReplace,
  applySectionHtmlReplace,
} from './session_edit_helpers'
import {
  areExportPaywallsDisabled,
  checkExportEntitlementReadOnly,
  isAuthDisabled,
} from './session_export_helpers'

export type ApplySectionEditInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  /** For HTML sessions: the replacement HTML. Full-document replacement when
   *  `beforeHtml` is omitted (the caller is responsible for validating it is
   *  actually a complete document); a section-scoped splice via `beforeHtml`
   *  otherwise. */
  replacementHtml?: string
  /** Anchor for a section-scoped `replacementHtml`: the ORIGINAL selected
   *  element/section's outerHTML, used to splice the replacement into the
   *  existing document instead of overwriting the whole page. The
   *  sectionRewrite AI tool only ever sees the selected section, so its
   *  output must never be trusted as a full-page replacement. */
  beforeHtml?: string
  /** For OpenUI sessions: the patched OpenUI source (with AI capsule reference). */
  replacementOpenUiSource?: string
  /** Anchor for a section-scoped `replacementOpenUiSource`: the OpenUI
   *  source variable name (e.g. "home_hero") whose assignment line should be
   *  replaced. Same rationale as `beforeHtml` — the sectionRewrite AI tool
   *  only sees the selected section, so its output must never be trusted as
   *  the entire document source. Omitted only by the AI-capsule path, which
   *  already computes a full, valid patched source. */
  sectionVarName?: string
  /** For OpenUI sessions: the AI capsule to store. */
  aiCapsule?: {
    capsuleName: string
    parentCapsule: string
    compiledJs: string
    description: string
  }
  /** User's prompt for this edit. */
  instruction: string
}

/**
 * Apply an AI section edit to the session's artifacts: patch preview.html +
 * homeModule.source, bump previewVersion + updatedAt, record the edit, and
 * (for OpenUI) store the AI capsule.
 */
export async function applySectionEditToArtifacts(
  ctx: MutationCtx,
  args: ApplySectionEditInput,
  now = Date.now(),
) {
  const session = await ctx.db.get(args.sessionId)

  if (session === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'Session not found',
    })
  }

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  // AI section edits are Pro-only (like exports + translation). The ownership
  // check above already passed, so here we verify the owner has an active Pro
  // subscription or credits. Admin / paywall-disabled / auth-disabled bypass.
  if (!areExportPaywallsDisabled() && !isAuthDisabled()) {
    const isAdmin = await isUserAdmin(ctx)
    if (!isAdmin) {
      const userId = await getUserId(ctx)
      const entitlement = await checkExportEntitlementReadOnly(
        ctx,
        userId,
        isAdmin,
      )
      if (entitlement.status !== 'ready') {
        throw new ConvexError({
          code: 'PAYMENT_REQUIRED',
          message:
            entitlement.message ?? 'Subscribe to Pro to use AI inline edits.',
        })
      }
    }
  }

  // Fetch current artifacts
  const [homeModule, latestPreview] = await Promise.all([
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first(),
  ])

  if (latestPreview === null) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview is not ready',
    })
  }

  const nextPreviewVersion = latestPreview.version + 1

  // Determine the new preview HTML and OpenUI source
  let newPreviewHtml = latestPreview.html
  let newOpenUiSource = homeModule?.source

  if (args.replacementHtml !== undefined && args.beforeHtml !== undefined) {
    // Section-scoped rewrite (e.g. the sectionRewrite AI tool): the model
    // only ever saw the selected section, so its output must be spliced into
    // the existing document at that anchor — never trusted as the full page.
    const spliced = applySectionHtmlReplace(
      latestPreview.html,
      args.beforeHtml,
      args.replacementHtml,
    )
    if (!spliced.replaced) {
      throw new ConvexError({
        code: 'SECTION_NOT_FOUND',
        message:
          'Selected section was not found in the current preview. Reselect the section and try again.',
      })
    }
    newPreviewHtml = spliced.html
    if (homeModule !== null) {
      const sourceSpliced = applySectionHtmlReplace(
        homeModule.source,
        args.beforeHtml,
        args.replacementHtml,
      )
      newOpenUiSource = sourceSpliced.replaced
        ? sourceSpliced.html
        : homeModule.source
      await ctx.db.patch(homeModule._id, {
        source: newOpenUiSource,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
  } else if (args.replacementHtml !== undefined) {
    // HTML session: replacement is the full page HTML
    newPreviewHtml = args.replacementHtml
    if (homeModule !== null) {
      newOpenUiSource = args.replacementHtml
      await ctx.db.patch(homeModule._id, {
        source: args.replacementHtml,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
  } else if (
    args.replacementOpenUiSource !== undefined &&
    args.sectionVarName !== undefined
  ) {
    // Section-scoped rewrite (e.g. the sectionRewrite AI tool): splice the
    // replacement into the existing source at the named variable's
    // assignment line — never trust it as the entire document source.
    if (homeModule === null) {
      throw new ConvexError({
        code: 'SECTION_NOT_FOUND',
        message: 'No OpenUI source to rewrite for this session.',
      })
    }
    const spliced = applyOpenUiVarReplace(
      homeModule.source,
      args.sectionVarName,
      args.replacementOpenUiSource,
    )
    if (!spliced.replaced) {
      throw new ConvexError({
        code: 'SECTION_NOT_FOUND',
        message:
          'Selected section was not found in the current source. Reselect the section and try again.',
      })
    }
    newOpenUiSource = spliced.source
    await ctx.db.patch(homeModule._id, {
      source: newOpenUiSource,
      status: 'succeeded',
      errorMessage: undefined,
      updatedAt: now,
    })
    newPreviewHtml = latestPreview.html
  } else if (args.replacementOpenUiSource !== undefined) {
    // OpenUI session: patch the source, keep preview.html as-is
    // (the OpenUIViewer will re-render from source on remount)
    newOpenUiSource = args.replacementOpenUiSource
    if (homeModule !== null) {
      await ctx.db.patch(homeModule._id, {
        source: args.replacementOpenUiSource,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
    // For OpenUI, the preview.html is regenerated by the client on remount.
    // We store the patched source as the preview's openUiSource for reference.
    newPreviewHtml = latestPreview.html
  }

  // Store the AI capsule (OpenUI sessions only)
  if (args.aiCapsule) {
    await upsertSessionAiCapsule(ctx, {
      sessionId: args.sessionId,
      capsuleName: args.aiCapsule.capsuleName,
      parentCapsule: args.aiCapsule.parentCapsule,
      compiledJs: args.aiCapsule.compiledJs,
      description: args.aiCapsule.description,
    })
  }

  // Insert new preview version
  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: nextPreviewVersion,
    html: newPreviewHtml,
    openUiSource: newOpenUiSource,
    siteSpecJson: latestPreview.siteSpecJson,
    source: 'edit',
    createdAt: now,
  })

  // Bump session preview version
  await ctx.db.patch(args.sessionId, {
    previewVersion: nextPreviewVersion,
    updatedAt: now,
  })

  // Record edit
  await ctx.db.insert('edits', {
    sessionId: args.sessionId,
    previewVersion: nextPreviewVersion,
    editType: 'ai_rewrite',
    instruction: args.instruction,
    afterHtml: args.replacementHtml,
    createdAt: now,
    userId: session.userId,
  })

  // Emit preview reload event
  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_reload',
    message: 'AI section edit applied',
    previewVersion: nextPreviewVersion,
    createdAt: now,
  })

  return {
    sessionId: args.sessionId,
    previewVersion: nextPreviewVersion,
    saved: true,
  }
}
