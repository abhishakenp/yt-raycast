import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'
import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from './session_edit_helpers'
import { extractOpenUISourceStrings } from './session_translation_cache_helpers'

type JsonObject = Record<string, unknown>

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Recursively walk a parsed JSON value and replace the first occurrence of
 * oldText with newText inside a string leaf. Mirrors applyPreviewTextEdit but
 * operates on structured JSON (site specs) instead of raw HTML/source.
 */
const replaceFirstJsonText = (
  value: unknown,
  oldText: string,
  newText: string,
): { value: unknown; replaced: boolean } => {
  if (typeof value === 'string') {
    const result = applyPreviewTextEdit(value, oldText, newText)
    return { value: result.html, replaced: result.replaced }
  }

  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceFirstJsonText(item, oldText, newText)
      replaced = result.replaced
      return result.value
    })
    return { value: next, replaced }
  }

  if (!isJsonObject(value)) return { value, replaced: false }

  let replaced = false
  const next: JsonObject = {}
  for (const [key, item] of Object.entries(value)) {
    if (replaced) {
      next[key] = item
      continue
    }

    const result = replaceFirstJsonText(item, oldText, newText)
    next[key] = result.value
    replaced = result.replaced
  }

  return { value: next, replaced }
}

const uniqueNonEmptyTexts = (values: Array<string | undefined>): string[] => {
  const seen = new Set<string>()
  const texts: string[] = []

  for (const value of values) {
    const text = String(value ?? '').trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    texts.push(text)
  }

  return texts
}

const patchTextEditIntoSessionData = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeTexts: Array<string | undefined>,
  afterText: string | undefined,
  now: number,
): Promise<void> => {
  const replacement = String(afterText ?? '').trim()
  if (!replacement) return

  const candidates = uniqueNonEmptyTexts(beforeTexts)
  if (candidates.length === 0) return

  const docs = await ctx.db
    .query('sessionData')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(128)

  for (const doc of docs) {
    let nextData: unknown = doc.data
    let replaced = false

    for (const candidate of candidates) {
      const edit = replaceFirstJsonText(nextData, candidate, replacement)
      if (!edit.replaced) continue
      nextData = edit.value
      replaced = true
      break
    }

    if (replaced && isJsonObject(nextData)) {
      await ctx.db.patch(doc._id, {
        data: nextData,
        updatedAt: now,
      })
    }
  }
}

export type SessionEditInput = {
  editType: 'text' | 'ai_rewrite' | 'style' | 'image' | 'delete'
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

const normalizeComparableText = (value: string | undefined): string =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()

const translationCacheKey = (locale: string, text: string): string =>
  `${locale.trim().toLowerCase()}\n${text.trim()}`

const rememberIdentityTranslation = async (
  ctx: MutationCtx,
  locale: string | undefined,
  text: string | undefined,
  now: number,
): Promise<void> => {
  const normalizedLocale = normalizeComparableText(locale).toLowerCase()
  const normalizedText = String(text ?? '').trim()
  if (!normalizedLocale || normalizedLocale === 'en' || !normalizedText) return

  const cacheKey = translationCacheKey(normalizedLocale, normalizedText)
  const existing = await ctx.db
    .query('translationCache')
    .withIndex('by_cacheKey', (index) => index.eq('cacheKey', cacheKey))
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      translation: normalizedText,
      updatedAt: now,
    })
    return
  }

  await ctx.db.insert('translationCache', {
    cacheKey,
    locale: normalizedLocale,
    sourceText: normalizedText,
    translation: normalizedText,
    createdAt: now,
    updatedAt: now,
  })
}

const withCanonicalTranslatedBeforeText = async (
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  sessionId: Id<'sessions'>,
  args: SessionEditInput,
): Promise<SessionEditInput> => {
  if (args.editType !== 'text') return args

  const selectedText = normalizeComparableText(args.beforeText)
  const locale = normalizeComparableText(
    session.preferredLanguage,
  ).toLowerCase()
  if (!selectedText || !locale || locale === 'en') return args

  const [homeModule] = await getCurrentHomeModuleAndSiteSpec(ctx, sessionId)
  const source = homeModule?.source
  if (!source) return args

  const sourceTexts = extractOpenUISourceStrings(source)
  if (sourceTexts.length === 0) return args

  const rows = await ctx.db
    .query('translationCache')
    .withIndex('by_locale', (index) => index.eq('locale', locale))
    .take(1000)

  for (const sourceText of sourceTexts) {
    const comparableSource = normalizeComparableText(sourceText)
    const matchingRow = rows.find(
      (row) =>
        normalizeComparableText(row.sourceText) === comparableSource &&
        normalizeComparableText(row.translation) === selectedText,
    )
    if (matchingRow) return { ...args, beforeText: sourceText }
  }

  return args
}

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

/**
 * Patch homeModule.source + siteSpec for an ai_rewrite edit that carries
 * beforeText/afterText. Unlike a targeted text edit, an AI rewrite replaces
 * the rewritten text everywhere it appears (the AI regenerates the full
 * HTML with every occurrence swapped), so we replace ALL occurrences in the
 * source — not just one — otherwise stale copies survive in
 * homeModule.source and re-emerge on reload.
 */
const applyAiRewriteToCurrentArtifacts = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string,
  afterText: string,
  now: number,
): Promise<{ openUiSource?: string; siteSpecJson?: string }> => {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )
  let openUiSource = homeModule?.source
  let siteSpecJson = siteSpec?.specJson ?? siteSpec?.spec

  if (homeModule !== null && openUiSource !== undefined) {
    if (openUiSource.includes(beforeText)) {
      openUiSource = openUiSource.split(beforeText).join(afterText)
      await ctx.db.patch(homeModule._id, {
        source: openUiSource,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
  }

  if (siteSpec !== null && siteSpecJson !== undefined) {
    try {
      const parsed: unknown = JSON.parse(siteSpecJson)
      const stringified = JSON.stringify(parsed)
      if (stringified.includes(beforeText)) {
        const patched = stringified.split(beforeText).join(afterText)
        siteSpecJson = patched
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    } catch {
      if (siteSpecJson.includes(beforeText)) {
        siteSpecJson = siteSpecJson.split(beforeText).join(afterText)
        await ctx.db.patch(siteSpec._id, {
          specJson: siteSpecJson,
          updatedAt: now,
        })
      }
    }
  }

  return { openUiSource, siteSpecJson }
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
  const patchArgs = await withCanonicalTranslatedBeforeText(
    ctx,
    session,
    sessionId,
    args,
  )

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

  let openUiSource: string | undefined
  let siteSpecJson: string | undefined

  let editedPreview =
    args.afterHtml !== undefined
      ? { html: args.afterHtml, replaced: true }
      : patchArgs.editType === 'image'
        ? applyImageSwap(
            preview.html,
            patchArgs.beforeText,
            patchArgs.afterText,
            patchArgs.occurrenceIndex,
          )
        : patchArgs.editType === 'style'
          ? applyStyleEdit(
              preview.html,
              patchArgs.beforeText,
              patchArgs.afterText,
              patchArgs.occurrenceIndex,
            )
          : applyPreviewTextEdit(
              preview.html,
              patchArgs.beforeText,
              patchArgs.afterText,
              patchArgs.occurrenceIndex,
            )

  let sourceAlreadyPatched = false
  if (!editedPreview.replaced) {
    // Style edits: the stored preview.html is OpenUI source code, not rendered
    // HTML — it has no `class="..."` attributes for applyStyleEdit to anchor on.
    // Style edits are reapplied client-side from the edit history (via
    // styleOverrides in DirectPreview), so we just need to save the edit record
    // and create a new preview version. Don't throw TEXT_NOT_FOUND for styles.
    // Image edits: same pattern — applyImageSwap may fail on preview.html if the
    // img tag format doesn't match (e.g., OpenUI source stored as preview.html,
    // or the alt doesn't match). Image swaps are reapplied client-side via
    // imageOverrides (alt → newSrc), so just save the edit record. Do NOT fall
    // back to applyPreviewTextEdit — that would replace the alt TEXT in the
    // OpenUI source with the image URL, corrupting the source.
    if (patchArgs.editType === 'style' || patchArgs.editType === 'image') {
      editedPreview = { html: preview.html, replaced: true }
    } else {
      // Text edits: fall back to searching the OpenUI source directly.
      const [homeModuleForFallback] = await getCurrentHomeModuleAndSiteSpec(
        ctx,
        sessionId,
      )
      if (homeModuleForFallback !== null) {
        const sourceEdit = applyPreviewTextEdit(
          homeModuleForFallback.source,
          patchArgs.beforeText,
          patchArgs.afterText,
          patchArgs.occurrenceIndex,
        )
        if (sourceEdit.replaced) {
          await ctx.db.patch(homeModuleForFallback._id, {
            source: sourceEdit.html,
            status: 'succeeded',
            errorMessage: undefined,
            updatedAt: now,
          })
          editedPreview = { html: sourceEdit.html, replaced: true }
          sourceAlreadyPatched = true
          openUiSource = sourceEdit.html
        }
      }
    }
  }

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
  // reload. ai_rewrite edits that carry beforeText/afterText also patch the
  // source for the same reason; ai_rewrite edits that only provide afterHtml
  // (and image/style edits) keep the snapshot pattern: their overrides are
  // reapplied client-side from the recorded edit history.
  // If sourceAlreadyPatched is true (source fallback matched), skip this step.
  const isTextPatchEdit =
    args.afterHtml === undefined &&
    patchArgs.editType !== 'style' &&
    patchArgs.editType !== 'image'
  const isAiRewriteTextPatchEdit =
    patchArgs.editType === 'ai_rewrite' &&
    args.afterHtml !== undefined &&
    patchArgs.beforeText !== undefined &&
    patchArgs.afterText !== undefined
  if (sourceAlreadyPatched) {
    // Source was already patched in the fallback above — nothing more to do.
  } else if (isAiRewriteTextPatchEdit) {
    const artifactSnapshot = await applyAiRewriteToCurrentArtifacts(
      ctx,
      sessionId,
      patchArgs.beforeText as string,
      patchArgs.afterText as string,
      now,
    )
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else if (isTextPatchEdit) {
    const artifactSnapshot = await applyTextEditToCurrentArtifacts(
      ctx,
      sessionId,
      patchArgs.beforeText,
      patchArgs.afterText,
      now,
      patchArgs.occurrenceIndex,
    )
    if (!artifactSnapshot.openUiReplaced) {
      throw new ConvexError({
        code: 'TEXT_NOT_FOUND',
        message:
          'Selected text was not found in the current preview. Select a smaller text block and try again.',
      })
    }
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else {
    const artifactSnapshot = await snapshotCurrentArtifacts(ctx, sessionId)
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  }

  if (
    patchArgs.editType === 'text' &&
    normalizeComparableText(patchArgs.beforeText) !==
      normalizeComparableText(args.beforeText)
  ) {
    await rememberIdentityTranslation(
      ctx,
      session.preferredLanguage,
      patchArgs.afterText,
      now,
    )
  }

  if (patchArgs.editType === 'text') {
    await patchTextEditIntoSessionData(
      ctx,
      sessionId,
      [args.beforeText, patchArgs.beforeText],
      patchArgs.afterText,
      now,
    )
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
