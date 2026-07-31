import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { containsExecutablePreviewFragment } from './preview_html_safety'
import { assertCanMutateSession } from './session_access_helpers'
import { applyPreviewTextEdit } from './session_edit_helpers'
import { extractOpenUISourceStrings } from './session_translation_cache_helpers'

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Recursively walk a parsed JSON value and replace the first occurrence of
 * oldText with newText inside a string leaf. Mirrors applyPreviewTextEdit but
 * operates on structured JSON (site specs) instead of raw HTML/source.
 */
function replaceFirstJsonText(
  value: unknown,
  oldText: string,
  newText: string,
): { value: unknown; replaced: boolean } {
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

function uniqueNonEmptyTexts(values: Array<string | undefined>): string[] {
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

/**
 * Replace the first string leaf that EQUALS oldText (trimmed). Unlike
 * replaceFirstJsonText this never does substring/fuzzy matching, so a short
 * beforeText (e.g. a capsule-hardcoded heading like "Board of Directors")
 * cannot silently corrupt an unrelated longer leaf that merely contains it
 * ("Leadership & Board of Directors").
 */
function replaceEqualJsonTextLeaf(
  value: unknown,
  oldText: string,
  newText: string,
): { value: unknown; replaced: boolean } {
  if (typeof value === 'string') {
    if (value.trim() === oldText) return { value: newText, replaced: true }
    return { value, replaced: false }
  }

  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceEqualJsonTextLeaf(item, oldText, newText)
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

    const result = replaceEqualJsonTextLeaf(item, oldText, newText)
    next[key] = result.value
    replaced = result.replaced
  }

  return { value: next, replaced }
}

/**
 * Patch the first JSON string-leaf occurrence of any candidate beforeText in
 * the session's Lakebed data rows. Library capsules (gov-portal boards,
 * tenders, directories, …) render this data live — it is the ONLY store that
 * contains their text: preview.html is an SSR shell rendered with inert
 * Lakebed stubs and homeModule.source only carries the capsule call, so a
 * text edit on that content can never match anywhere else. Returns whether
 * any row was patched so applySessionEdit can treat a sessionData match as a
 * successful edit instead of throwing TEXT_NOT_FOUND.
 *
 * `exactLeafOnly` is used by the TEXT_NOT_FOUND fallback gates: when
 * sessionData is the LAST possible store, only a leaf that equals the
 * selected text may match. A clicked text node's full value equals its leaf
 * (names, designations, bios, headings), whereas capsule-hardcoded strings
 * that merely appear inside a longer leaf must keep failing loudly instead
 * of silently rewriting an unrelated leaf. The post-gate sync call keeps the
 * historical substring semantics so partial-node edits that already matched
 * preview/source still propagate into mirrored sessionData values.
 */
async function patchTextEditIntoSessionData(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeTexts: Array<string | undefined>,
  afterText: string | undefined,
  now: number,
  exactLeafOnly = false,
): Promise<boolean> {
  const replacement = String(afterText ?? '').trim()
  if (!replacement) return false

  const candidates = uniqueNonEmptyTexts(beforeTexts)
  if (candidates.length === 0) return false

  const docs = await ctx.db
    .query('sessionData')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(128)

  let anyReplaced = false
  for (const doc of docs) {
    let nextData: unknown = doc.data
    let replaced = false

    for (const candidate of candidates) {
      const edit = exactLeafOnly
        ? replaceEqualJsonTextLeaf(nextData, candidate, replacement)
        : replaceFirstJsonText(nextData, candidate, replacement)
      if (!edit.replaced) continue
      nextData = edit.value
      replaced = true
      break
    }

    if (replaced && isJsonObject(nextData)) {
      anyReplaced = true
      await ctx.db.patch(doc._id, {
        data: nextData,
        updatedAt: now,
      })
    }
  }
  return anyReplaced
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

async function getCurrentHomeModuleAndSiteSpec(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
) {
  return await Promise.all([
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
}

function normalizeComparableText(value: string | undefined): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

type CanonicalTranslatedTextEdit = {
  locale: string
  sourceText: string
  selectedText: string
}

type CanonicalizedTextEdit = {
  args: SessionEditInput
  translatedEdit?: CanonicalTranslatedTextEdit
  patchCanonicalArtifacts: boolean
}

async function withCanonicalTranslatedBeforeText(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  sessionId: Id<'sessions'>,
  args: SessionEditInput,
): Promise<CanonicalizedTextEdit> {
  const unchanged = {
    args,
    patchCanonicalArtifacts: true,
  }
  if (args.editType !== 'text') return unchanged

  const selectedText = normalizeComparableText(args.beforeText)
  const locale = normalizeComparableText(
    session.preferredLanguage,
  ).toLowerCase()
  if (!selectedText || !locale || locale === 'en') return unchanged

  const [homeModule] = await getCurrentHomeModuleAndSiteSpec(ctx, sessionId)
  const source = homeModule?.source
  if (!source) return unchanged

  const sourceTexts = extractOpenUISourceStrings(source)
  if (sourceTexts.length === 0) return unchanged

  const priorLocalizedEdits = await ctx.db
    .query('edits')
    .withIndex('by_sessionId_locale_canonicalSourceText', (index) =>
      index.eq('sessionId', sessionId).eq('locale', locale),
    )
    .order('desc')
    .take(80)
  const priorLocalizedEdit = priorLocalizedEdits.find(
    (edit) =>
      edit.canonicalSourceText !== undefined &&
      (normalizeComparableText(edit.afterText) === selectedText ||
        (normalizeComparableText(edit.beforeText) === selectedText &&
          normalizeComparableText(edit.afterText) ===
            normalizeComparableText(args.afterText ?? ''))),
  )
  if (priorLocalizedEdit?.canonicalSourceText !== undefined) {
    return {
      args: { ...args, beforeText: priorLocalizedEdit.canonicalSourceText },
      translatedEdit: {
        locale,
        sourceText: priorLocalizedEdit.canonicalSourceText,
        selectedText,
      },
      patchCanonicalArtifacts: false,
    }
  }

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
    if (matchingRow) {
      const quotedSourceText = JSON.stringify(sourceText)
      const quotedOccurrenceCount =
        quotedSourceText.length > 2
          ? source.split(quotedSourceText).length - 1
          : 0
      const extractedOccurrenceCount = sourceTexts.filter(
        (candidate) => normalizeComparableText(candidate) === comparableSource,
      ).length
      const sourceOccurrenceCount = Math.max(
        quotedOccurrenceCount,
        extractedOccurrenceCount,
      )
      return {
        args: { ...args, beforeText: sourceText },
        translatedEdit: {
          locale,
          sourceText,
          selectedText,
        },
        patchCanonicalArtifacts:
          sourceOccurrenceCount > 1 && args.occurrenceIndex !== undefined,
      }
    }
  }

  return unchanged
}

function isSamePersistedEdit(
  edit: Doc<'edits'>,
  args: SessionEditInput,
): boolean {
  return (
    edit.editType === args.editType &&
    edit.targetLabel === args.targetLabel &&
    edit.beforeText === args.beforeText &&
    edit.afterText === args.afterText &&
    edit.afterHtml === args.afterHtml &&
    edit.instruction === args.instruction &&
    edit.occurrenceIndex === args.occurrenceIndex
  )
}

async function upsertSessionTranslationOverride(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  locale: string,
  sourceText: string,
  translation: string,
  now: number,
): Promise<void> {
  const normalizedLocale = locale.trim().toLowerCase()
  const canonicalSourceText = sourceText.trim()
  const trimmedTranslation = translation.trim()
  if (!normalizedLocale || !canonicalSourceText || !trimmedTranslation) return

  const existing = await ctx.db
    .query('sessionTranslationOverrides')
    .withIndex('by_sessionId_locale_sourceText', (index) =>
      index
        .eq('sessionId', sessionId)
        .eq('locale', normalizedLocale)
        .eq('sourceText', canonicalSourceText),
    )
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      translation: trimmedTranslation,
      updatedAt: now,
    })
  } else {
    await ctx.db.insert('sessionTranslationOverrides', {
      sessionId,
      locale: normalizedLocale,
      sourceText: canonicalSourceText,
      translation: trimmedTranslation,
      createdAt: now,
      updatedAt: now,
    })
  }
}

async function invalidateTranslationsForSource(
  ctx: MutationCtx,
  sourceText: string | undefined,
): Promise<void> {
  const canonicalSourceText = String(sourceText ?? '').trim()
  if (!canonicalSourceText) return

  const translations = await ctx.db
    .query('translationCache')
    .withIndex('by_sourceText', (index) =>
      index.eq('sourceText', canonicalSourceText),
    )
    .take(1000)
  const claims = await Promise.all(
    translations.map((translation) =>
      ctx.db
        .query('translationCacheClaims')
        .withIndex('by_cacheKey', (index) =>
          index.eq('cacheKey', translation.cacheKey),
        )
        .unique(),
    ),
  )

  await Promise.all([
    ...translations.map((translation) => ctx.db.delete(translation._id)),
    ...claims.flatMap((claim) =>
      claim === null ? [] : [ctx.db.delete(claim._id)],
    ),
  ])
}

async function findAiCapsuleTextEdits(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string | undefined,
  afterText: string | undefined,
  occurrenceIndex?: number,
): Promise<
  Array<{
    capsule: Doc<'aiCapsules'>
    compiledJs: string
  }>
> {
  const aiCapsules = await ctx.db
    .query('aiCapsules')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(100)

  const edits: Array<{
    capsule: Doc<'aiCapsules'>
    compiledJs: string
  }> = []
  for (const capsule of aiCapsules) {
    const compiledEdit = applyPreviewTextEdit(
      capsule.compiledJs,
      beforeText,
      afterText,
      occurrenceIndex,
    )
    if (compiledEdit.replaced) {
      edits.push({ capsule, compiledJs: compiledEdit.html })
      continue
    }

    const flattenedStringEdit = applyFlattenedStringLiteralEdit(
      capsule.compiledJs,
      beforeText,
      afterText,
    )
    if (flattenedStringEdit.replaced) {
      edits.push({ capsule, compiledJs: flattenedStringEdit.source })
    }
  }

  return edits
}

function normalizeFlattenedEditText(value: string | undefined): string {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

function unescapeJsStringLiteral(value: string): string {
  return value.replace(
    /\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g,
    (raw, escaped) => {
      if (escaped === 'n') return '\n'
      if (escaped === 'r') return '\r'
      if (escaped === 't') return '\t'
      if (escaped === 'b') return '\b'
      if (escaped === 'f') return '\f'
      if (escaped === 'v') return '\v'
      if (escaped === '0') return '\0'
      if (escaped.startsWith('x')) {
        return String.fromCharCode(parseInt(escaped.slice(1), 16))
      }
      if (escaped.startsWith('u{')) {
        return String.fromCodePoint(parseInt(escaped.slice(2, -1), 16))
      }
      if (escaped.startsWith('u')) {
        return String.fromCharCode(parseInt(escaped.slice(1), 16))
      }
      return raw.slice(1)
    },
  )
}

function escapeJsStringLiteralContent(value: string, quote: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(
      new RegExp(quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `\\${quote}`,
    )
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
}

function isJsxTagNameLiteral(
  source: string,
  literal: { start: number; value: string },
): boolean {
  if (!/^[a-z][\w-]*$/.test(literal.value)) return false
  const prefix = source.slice(Math.max(0, literal.start - 16), literal.start)
  return /\bjsx[s]?\(\s*$/.test(prefix)
}

function applyFlattenedStringLiteralEdit(
  source: string,
  beforeText: string | undefined,
  afterText: string | undefined,
): { source: string; replaced: boolean } {
  const target = normalizeFlattenedEditText(beforeText)
  if (!source.trim() || !target) return { source, replaced: false }

  const literalPattern = /(["'`])((?:\\[\s\S]|(?!\1)[^\\])*)\1/g
  const literals: Array<{
    start: number
    end: number
    valueStart: number
    valueEnd: number
    quote: string
    value: string
  }> = []
  let match: RegExpExecArray | null
  while ((match = literalPattern.exec(source)) !== null) {
    literals.push({
      start: match.index,
      end: match.index + match[0].length,
      valueStart: match.index + 1,
      valueEnd: match.index + match[0].length - 1,
      quote: match[1],
      value: unescapeJsStringLiteral(match[2]),
    })
    if (match[0].length === 0) literalPattern.lastIndex += 1
  }

  for (let startIndex = 0; startIndex < literals.length; startIndex += 1) {
    let accumulated = ''
    const matchedLiteralIndexes: number[] = []
    for (
      let endIndex = startIndex;
      endIndex < Math.min(literals.length, startIndex + 10);
      endIndex += 1
    ) {
      const literal = literals[endIndex]
      if (isJsxTagNameLiteral(source, literal)) continue

      const nextAccumulated =
        accumulated + normalizeFlattenedEditText(literal.value)
      if (!target.startsWith(nextAccumulated)) break

      accumulated = nextAccumulated
      matchedLiteralIndexes.push(endIndex)
      if (accumulated !== target) continue

      let edited = source
      for (
        let index = matchedLiteralIndexes.length - 1;
        index >= 0;
        index -= 1
      ) {
        const matchedLiteral = literals[matchedLiteralIndexes[index]]
        const replacement =
          index === 0
            ? escapeJsStringLiteralContent(
                String(afterText ?? ''),
                matchedLiteral.quote,
              )
            : ''
        edited =
          edited.slice(0, matchedLiteral.valueStart) +
          replacement +
          edited.slice(matchedLiteral.valueEnd)
      }
      return { source: edited, replaced: true }
    }
  }

  return { source, replaced: false }
}

export async function applyTextEditToCurrentArtifacts(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string | undefined,
  afterText: string | undefined,
  now: number,
  occurrenceIndex?: number,
  skipSourcePatch = false,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
  openUiReplaced: boolean
  siteSpecReplaced: boolean
  aiCapsuleReplaced: boolean
}> {
  const [homeModule, siteSpec] = await getCurrentHomeModuleAndSiteSpec(
    ctx,
    sessionId,
  )
  let openUiSource = homeModule?.source
  let siteSpecJson = siteSpec?.specJson ?? siteSpec?.spec
  let openUiReplaced = false
  let siteSpecReplaced = false
  let aiCapsuleReplaced = false

  if (homeModule !== null && !skipSourcePatch) {
    const sourceEdit = applyPreviewTextEdit(
      homeModule.source,
      beforeText,
      afterText,
      occurrenceIndex,
    )
    if (sourceEdit.replaced) {
      openUiReplaced = true
      openUiSource = sourceEdit.html
      await ctx.db.patch(homeModule._id, {
        source: sourceEdit.html,
        status: 'succeeded',
        errorMessage: undefined,
        updatedAt: now,
      })
    }
  }

  const aiCapsuleEdits = await findAiCapsuleTextEdits(
    ctx,
    sessionId,
    beforeText,
    afterText,
    occurrenceIndex,
  )
  if (aiCapsuleEdits.length > 0) {
    aiCapsuleReplaced = true
    await Promise.all(
      aiCapsuleEdits.map((edit) =>
        ctx.db.patch(edit.capsule._id, {
          compiledJs: edit.compiledJs,
          updatedAt: now,
        }),
      ),
    )
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

  return {
    openUiSource,
    siteSpecJson,
    openUiReplaced,
    siteSpecReplaced,
    aiCapsuleReplaced,
  }
}

/**
 * Patch homeModule.source + siteSpec for an ai_rewrite edit that carries
 * beforeText/afterText. Unlike a targeted text edit, an AI rewrite replaces
 * the rewritten text everywhere it appears (the AI regenerates the full
 * HTML with every occurrence swapped), so we replace ALL occurrences in the
 * source — not just one — otherwise stale copies survive in
 * homeModule.source and re-emerge on reload.
 */
async function applyAiRewriteToCurrentArtifacts(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
  beforeText: string,
  afterText: string,
  now: number,
): Promise<{ openUiSource?: string; siteSpecJson?: string }> {
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

async function snapshotCurrentArtifacts(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
): Promise<{
  openUiSource?: string
  siteSpecJson?: string
}> {
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

export async function createSessionEdit(
  ctx: MutationCtx,
  args: CreateSessionEditInput,
  now = Date.now(),
) {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  // Validate here, not only in the HTTP route: `createEdit` is a public
  // mutation, so a browser can post `afterHtml` straight to Convex and skip
  // every route-level check.
  assertPreviewHtmlIsInert(args.afterHtml)

  return await applySessionEdit(ctx, session, args, now)
}

function assertPreviewHtmlIsInert(html: string | undefined): void {
  if (html === undefined) return
  if (!containsExecutablePreviewFragment(html)) return
  throw new ConvexError({
    code: 'UNSAFE_EDIT_HTML',
    message: 'Executable preview fragments are not allowed',
  })
}

export async function applySessionEdit(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  args: SessionEditInput,
  now: number,
) {
  const sessionId = session._id
  const canonicalized = await withCanonicalTranslatedBeforeText(
    ctx,
    session,
    sessionId,
    args,
  )
  const patchArgs = canonicalized.args

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

  const unchangedText =
    args.afterText !== undefined && args.beforeText === args.afterText
  if (unchangedText) {
    return {
      sessionId,
      previewVersion: preview.version,
      saved: false,
      translatedEdit: undefined,
    }
  }

  const translatedEdit = canonicalized.translatedEdit
  if (translatedEdit !== undefined) {
    const existingTranslatedEdit = await ctx.db
      .query('edits')
      .withIndex('by_sessionId_locale_canonicalSourceText', (index) =>
        index
          .eq('sessionId', sessionId)
          .eq('locale', translatedEdit.locale)
          .eq('canonicalSourceText', translatedEdit.sourceText),
      )
      .order('desc')
      .first()

    if (existingTranslatedEdit !== null) {
      if (isSamePersistedEdit(existingTranslatedEdit, args)) {
        return {
          sessionId,
          previewVersion: existingTranslatedEdit.previewVersion,
          saved: true,
          translatedEdit: {
            locale: translatedEdit.locale,
            sourceText: translatedEdit.sourceText,
            translation: String(patchArgs.afterText ?? ''),
          },
        }
      }

      if (
        normalizeComparableText(existingTranslatedEdit.afterText) !==
        normalizeComparableText(args.beforeText)
      ) {
        throw new ConvexError({
          code: 'TEXT_NOT_FOUND',
          message:
            'Selected text was not found in the current preview. Select a smaller text block and try again.',
        })
      }
    }
  }

  let openUiSource: string | undefined
  let siteSpecJson: string | undefined

  const isLocaleScopedTranslatedTextEdit =
    patchArgs.editType === 'text' &&
    canonicalized.translatedEdit !== undefined &&
    !canonicalized.patchCanonicalArtifacts

  let editSucceeded = false
  let sourceAlreadyPatched = false
  // Set when the edited text was found (and patched) in the session's Lakebed
  // sessionData rows — the only store that holds library-capsule content
  // (gov-portal boards, tenders, directories, …). A sessionData match is a
  // fully successful edit: the capsule re-renders live from the patched row,
  // so neither TEXT_NOT_FOUND gate may throw for it.
  let sessionDataPatched = false

  if (isLocaleScopedTranslatedTextEdit) {
    // Locale-scoped translated text edit: don't modify canonical artifacts.
    // The translation override is persisted separately; the preview is
    // re-rendered from the (unchanged) source + override on reload.
    editSucceeded = true
  } else if (patchArgs.editType === 'style' || patchArgs.editType === 'image') {
    // Style/image edits are reapplied client-side from edit history
    // (styleOverrides / imageOverrides in DirectPreview), so we just need
    // to save the edit record and create a new preview version. Don't throw
    // TEXT_NOT_FOUND for these.
    editSucceeded = true
  } else if (
    patchArgs.editType === 'ai_rewrite' &&
    args.afterHtml !== undefined &&
    patchArgs.beforeText !== undefined &&
    patchArgs.afterText !== undefined
  ) {
    // AI rewrite with afterHtml: the AI generated new HTML with the rewritten
    // text. Don't edit the source here — applyAiRewriteToCurrentArtifacts
    // (below) replaces ALL occurrences in the source + siteSpec.
    editSucceeded = true
  } else {
    // Text edits (and ai_rewrite without afterHtml): edit homeModule.source
    // directly with applyPreviewTextEdit. This IS the primary edit path —
    // preview.html is no longer used.
    const [homeModuleForEdit] = await getCurrentHomeModuleAndSiteSpec(
      ctx,
      sessionId,
    )
    if (homeModuleForEdit !== null) {
      const sourceEdit = applyPreviewTextEdit(
        homeModuleForEdit.source,
        patchArgs.beforeText,
        patchArgs.afterText,
        patchArgs.occurrenceIndex,
      )
      if (sourceEdit.replaced) {
        await ctx.db.patch(homeModuleForEdit._id, {
          source: sourceEdit.html,
          status: 'succeeded',
          errorMessage: undefined,
          updatedAt: now,
        })
        sourceAlreadyPatched = true
        openUiSource = sourceEdit.html
        editSucceeded = true
      }
    }
    if (!editSucceeded) {
      // Text not in source — try AI capsule compiled JS.
      const aiCapsuleEdits = await findAiCapsuleTextEdits(
        ctx,
        sessionId,
        patchArgs.beforeText,
        patchArgs.afterText,
        patchArgs.occurrenceIndex,
      )
      if (aiCapsuleEdits.length > 0) {
        editSucceeded = true
      }
    }
    if (!editSucceeded) {
      // Last store: Lakebed sessionData (library-capsule content). This is
      // where gov-portal boards/tenders/directory text actually lives —
      // the source only contains the capsule call, so for this content
      // every earlier matcher is guaranteed to miss.
      sessionDataPatched = await patchTextEditIntoSessionData(
        ctx,
        sessionId,
        [args.beforeText, patchArgs.beforeText],
        patchArgs.afterText,
        now,
        true, // exactLeafOnly — see patchTextEditIntoSessionData
      )
      if (sessionDataPatched) {
        editSucceeded = true
      }
    }
  }

  if (!editSucceeded) {
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
  // homeModule.source — patching only the preview makes edits vanish on
  // reload. ai_rewrite edits that carry beforeText/afterText also patch the
  // source for the same reason; ai_rewrite edits that only provide afterHtml
  // (and image/style edits) keep the snapshot pattern: their overrides are
  // reapplied client-side from the recorded edit history.
  // If sourceAlreadyPatched is true (source was patched in the primary edit
  // step above), skip re-patching the source (would double-apply
  // occurrenceIndex edits) but still patch the siteSpec.
  const isTextPatchEdit =
    args.afterHtml === undefined &&
    patchArgs.editType !== 'style' &&
    patchArgs.editType !== 'image' &&
    !isLocaleScopedTranslatedTextEdit
  const isAiRewriteTextPatchEdit =
    patchArgs.editType === 'ai_rewrite' &&
    args.afterHtml !== undefined &&
    patchArgs.beforeText !== undefined &&
    patchArgs.afterText !== undefined
  if (sourceAlreadyPatched) {
    // Source was already patched in the primary edit step above. Still patch
    // the siteSpec so edits don't vanish from the spec on reload, but skip
    // re-patching the source (would double-apply occurrenceIndex edits).
    if (isTextPatchEdit) {
      const artifactSnapshot = await applyTextEditToCurrentArtifacts(
        ctx,
        sessionId,
        patchArgs.beforeText,
        patchArgs.afterText,
        now,
        patchArgs.occurrenceIndex,
        true, // skipSourcePatch — source already patched in fallback
      )
      siteSpecJson = artifactSnapshot.siteSpecJson
    }
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
    if (
      !artifactSnapshot.openUiReplaced &&
      !artifactSnapshot.aiCapsuleReplaced &&
      !sessionDataPatched
    ) {
      // The text matched an AI capsule but not the source. Before
      // giving up, try the Lakebed sessionData rows — library-capsule
      // content lives only there (see patchTextEditIntoSessionData).
      sessionDataPatched = await patchTextEditIntoSessionData(
        ctx,
        sessionId,
        [args.beforeText, patchArgs.beforeText],
        patchArgs.afterText,
        now,
        true, // exactLeafOnly — see patchTextEditIntoSessionData
      )
      if (!sessionDataPatched) {
        throw new ConvexError({
          code: 'TEXT_NOT_FOUND',
          message:
            'Selected text was not found in the current preview. Select a smaller text block and try again.',
        })
      }
    }
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else if (isLocaleScopedTranslatedTextEdit) {
    const artifactSnapshot = await snapshotCurrentArtifacts(ctx, sessionId)
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  } else {
    const artifactSnapshot = await snapshotCurrentArtifacts(ctx, sessionId)
    openUiSource = artifactSnapshot.openUiSource
    siteSpecJson = artifactSnapshot.siteSpecJson
  }

  if (patchArgs.editType === 'text') {
    if (!isLocaleScopedTranslatedTextEdit) {
      await invalidateTranslationsForSource(ctx, patchArgs.beforeText)
    } else if (canonicalized.translatedEdit !== undefined) {
      await upsertSessionTranslationOverride(
        ctx,
        sessionId,
        canonicalized.translatedEdit.locale,
        canonicalized.translatedEdit.sourceText,
        String(patchArgs.afterText ?? ''),
        now,
      )
    }
    if (!sessionDataPatched) {
      await patchTextEditIntoSessionData(
        ctx,
        sessionId,
        isLocaleScopedTranslatedTextEdit
          ? [args.beforeText]
          : [args.beforeText, patchArgs.beforeText],
        patchArgs.afterText,
        now,
      )
    }
  }

  await ctx.db.insert('previews', {
    sessionId,
    version: nextPreviewVersion,
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
    ...(translatedEdit === undefined
      ? {}
      : {
          locale: translatedEdit.locale,
          canonicalSourceText: translatedEdit.sourceText,
        }),
    createdAt: now,
    userId: session.userId,
  })

  return {
    sessionId,
    previewVersion: nextPreviewVersion,
    saved: editSucceeded,
    translatedEdit:
      isLocaleScopedTranslatedTextEdit && canonicalized.translatedEdit
        ? {
            locale: canonicalized.translatedEdit.locale,
            sourceText: canonicalized.translatedEdit.sourceText,
            translation: String(patchArgs.afterText ?? ''),
          }
        : undefined,
  }
}
