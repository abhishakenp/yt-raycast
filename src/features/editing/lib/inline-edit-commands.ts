import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type {
  elementDeleteInputSchema,
  imageRemoveInputSchema,
  imageReplaceInputSchema,
  linkEditInputSchema,
  sectionMoveInputSchema,
  sectionRewriteInputSchema,
  styleApplyInputSchema,
  textRewriteInputSchema,
  undoLastEditInputSchema,
} from './inline-edit-tool-definitions'
import type { z } from 'zod'

import { updateLinkInSource } from './link-source'
import { reorderInStack } from './reorder-source'

type TextRewriteInput = z.infer<typeof textRewriteInputSchema>
type StyleApplyInput = z.infer<typeof styleApplyInputSchema>
type ImageReplaceInput = z.infer<typeof imageReplaceInputSchema>
type ImageRemoveInput = z.infer<typeof imageRemoveInputSchema>
type LinkEditInput = z.infer<typeof linkEditInputSchema>
type ElementDeleteInput = z.infer<typeof elementDeleteInputSchema>
type SectionMoveInput = z.infer<typeof sectionMoveInputSchema>
type SectionRewriteInput = z.infer<typeof sectionRewriteInputSchema>
type UndoLastEditInput = z.infer<typeof undoLastEditInputSchema>

export type InlineEditCommandContext = {
  sessionId: string
  anonymousOwnerSecret?: string
  instruction?: string
  selectedText?: string
  /** Primary DOM-based anchor (id, class, or data attribute). Use this for targeting. */
  sourceAnchor?: string
  /** @deprecated Legacy OpenUI variable name. Use sourceAnchor instead. */
  openuiVar?: string
  linkHref?: string
  currentSource?: string
  occurrenceIndex?: number
  /** The currently selected element/section's original outerHTML. Used to
   *  anchor a section-scoped sectionRewrite replacementHtml so it splices
   *  into the document instead of overwriting the whole page. */
  selectionHtml?: string
  /** Lowercase tag name of the selected element (e.g. "div", "img"). Used to
   *  tell a real <img> src swap apart from a background-image style edit —
   *  see isBackgroundImageScope. */
  selectedTag?: string
  /** The session's current preview version, needed by undoLastEdit to
   *  compute the immediately-previous version to restore. */
  currentPreviewVersion?: number
}

export type CreateInlineEditCommand = {
  kind: 'createEdit'
  mutation: typeof api.sessions.createEdit
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    editType: 'text' | 'ai_rewrite' | 'style' | 'image'
    targetLabel?: string
    beforeText?: string
    afterText?: string
    afterHtml?: string
    instruction?: string
    occurrenceIndex?: number
  }
}

export type ApplySectionEditCommand = {
  kind: 'applySectionEdit'
  mutation: typeof api.sessions.applySectionEdit
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    replacementHtml?: string
    /** Anchor for a section-scoped replacementHtml — see ApplySectionEditInput. */
    beforeHtml?: string
    replacementOpenUiSource?: string
    /** Anchor for a section-scoped replacementOpenUiSource — see ApplySectionEditInput. */
    sectionVarName?: string
    instruction: string
  }
}

export type RestorePreviewVersionCommand = {
  kind: 'restorePreviewVersion'
  mutation: typeof api.sessions.restorePreviewVersion
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    version: number
  }
}

export type InlineEditPersistenceCommand =
  | CreateInlineEditCommand
  | ApplySectionEditCommand
  | RestorePreviewVersionCommand

export type InlineCreateEditCommandInput = Omit<
  CreateInlineEditCommand['args'],
  'sessionId' | 'anonymousOwnerSecret'
>

function cssPropertyName(value: string): string {
  return value
    .trim()
    .replace(/_/g, '-')
    .replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}

const CSS_NUMBER_UNITLESS_PROPERTIES = new Set([
  'animation-iteration-count',
  'column-count',
  'flex',
  'flex-grow',
  'flex-shrink',
  'font-weight',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
])

// TypographyControlsPanel.tsx defaults these to 'em' (not 'px' like every
// other size property) — match that default for the AI's numeric shorthand
// so the same numeric input persists the same magnitude either way.
const CSS_EM_DEFAULT_PROPERTIES = new Set(['letter-spacing', 'word-spacing'])

function cssNumericValue(property: string, value: number): string {
  if (value === 0 || CSS_NUMBER_UNITLESS_PROPERTIES.has(property)) {
    return String(value)
  }
  if (CSS_EM_DEFAULT_PROPERTIES.has(property)) {
    return `${value}em`
  }
  return `${value}px`
}

const CSS_IMAGE_KEYWORDS = new Set([
  'none',
  'inherit',
  'initial',
  'unset',
  'revert',
])

function cssImageValue(value: string): string {
  const trimmed = value.trim()
  if (CSS_IMAGE_KEYWORDS.has(trimmed.toLowerCase())) {
    return trimmed
  }
  if (/^(?:url\(|(?:linear|radial|conic)-gradient\()/i.test(trimmed)) {
    return trimmed
  }
  return `url("${trimmed.replace(/"/g, '\\"')}")`
}

function styleDeclaration(property: string, value: unknown): string[] {
  if (
    typeof value !== 'string' &&
    !(typeof value === 'number' && Number.isFinite(value))
  ) {
    return []
  }
  const cssProperty = cssPropertyName(property)
  const textValue =
    typeof value === 'number'
      ? cssNumericValue(cssProperty, value)
      : value.trim()
  if (!textValue) return []
  if (cssProperty === 'background-image') {
    return [`${cssProperty}: ${cssImageValue(textValue)}`]
  }
  return [`${cssProperty}: ${textValue}`]
}

export function serializeInlineStyle(
  style: string | Record<string, unknown>,
): string {
  return typeof style === 'string'
    ? style.trim()
    : Object.entries(style)
        .flatMap(([property, value]) => styleDeclaration(property, value))
        .join('; ')
}

function commandBase(ctx: InlineEditCommandContext) {
  return {
    sessionId: ctx.sessionId as Id<'sessions'>,
    anonymousOwnerSecret: ctx.anonymousOwnerSecret,
  }
}

export function buildCreateEditCommand(
  input: InlineCreateEditCommandInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  return {
    kind: 'createEdit',
    mutation: api.sessions.createEdit,
    args: {
      ...commandBase(ctx),
      ...input,
      instruction: input.instruction ?? ctx.instruction,
    },
  }
}

function occurrenceIndex(
  input: { occurrenceIndex?: string | number },
  ctx: InlineEditCommandContext,
): number | undefined {
  if (typeof input.occurrenceIndex === 'number') return input.occurrenceIndex
  if (typeof input.occurrenceIndex === 'string') {
    const parsed = Number(input.occurrenceIndex)
    if (Number.isFinite(parsed)) return parsed
  }
  return ctx.occurrenceIndex
}

function booleanish(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return undefined
}

function linkRel({
  openInNewTab,
  noindex,
}: {
  openInNewTab: boolean
  noindex: boolean | undefined
}): string {
  const tokens = new Set<string>()
  if (openInNewTab) {
    tokens.add('noopener')
    tokens.add('noreferrer')
  }
  if (noindex) tokens.add('nofollow')
  return Array.from(tokens).join(' ')
}

export function buildTextRewriteCommand(
  input: TextRewriteInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  const beforeText = input.beforeText ?? ctx.selectedText
  return buildCreateEditCommand(
    {
      editType: 'text',
      targetLabel: input.targetLabel ?? beforeText,
      beforeText,
      afterText: input.afterText,
      occurrenceIndex: occurrenceIndex(input, ctx),
    },
    ctx,
  )
}

export function buildStyleApplyCommand(
  input: StyleApplyInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  const sourceAnchor =
    input.sourceAnchor ?? input.className ?? input.selector ?? ctx.sourceAnchor
  return buildCreateEditCommand(
    {
      editType: 'style',
      targetLabel: input.targetLabel ?? sourceAnchor,
      beforeText: sourceAnchor,
      afterText: serializeInlineStyle(input.style),
      occurrenceIndex: occurrenceIndex(input, ctx),
    },
    ctx,
  )
}

function isBackgroundImageScope(
  input: Pick<
    ImageReplaceInput | ImageRemoveInput,
    'targetScope' | 'sourceAnchor'
  >,
  ctx: Pick<InlineEditCommandContext, 'selectedTag'>,
): boolean {
  if (input.targetScope && input.targetScope !== 'element') return true
  // ctx.selectedTag describes the ONE element the user had selected when
  // opening AI edit. It's only a valid signal for THIS call when the AI
  // didn't name an explicit sourceAnchor — a code-mode session can chain
  // multiple tool calls that each target a different, unrelated element
  // found by its own anchor (e.g. removing "Legacy hero image" elsewhere on
  // the page while a completely different <a> tag is the current
  // selection), so selectedTag would be meaningless there. With no named
  // anchor, the call must mean "the selected element" — matching how the
  // manual background panel is always scoped to activeElement — so a
  // non-<img> selected tag means there is no `src` to swap and this must be
  // a background-image style edit even under the default `targetScope:
  // 'element'`.
  if (!input.sourceAnchor && ctx.selectedTag) {
    return ctx.selectedTag.toLowerCase() !== 'img'
  }
  return false
}

export function buildImageReplaceCommand(
  input: ImageReplaceInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  if (!input.src) {
    throw new Error(
      'imageReplace requires a resolved image URL before persistence',
    )
  }

  if (isBackgroundImageScope(input, ctx)) {
    return buildStyleApplyCommand(
      {
        sourceAnchor: input.sourceAnchor,
        targetScope: input.targetScope,
        style: {
          backgroundImage: input.src,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
        occurrenceIndex: input.occurrenceIndex,
      },
      ctx,
    )
  }

  return buildCreateEditCommand(
    {
      editType: 'image',
      targetLabel: input.alt ?? input.sourceAnchor ?? ctx.sourceAnchor,
      beforeText: input.sourceAnchor ?? ctx.sourceAnchor,
      afterText: input.src ?? input.query,
      occurrenceIndex: occurrenceIndex(input, ctx),
    },
    ctx,
  )
}

export function buildImageRemoveCommand(
  input: ImageRemoveInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  if (isBackgroundImageScope(input, ctx)) {
    return buildStyleApplyCommand(
      {
        sourceAnchor: input.sourceAnchor,
        targetScope: input.targetScope,
        // Also reset size/position — matching manual removeBgImage
        // (BackgroundPanel.tsx), which clears all three declarations, not
        // just background-image. Leaving cover/center behind is invisible
        // until a new background-image is set without re-specifying them.
        style:
          'background-image: none; background-size: auto; background-position: 0% 0%',
        occurrenceIndex: input.occurrenceIndex,
      },
      ctx,
    )
  }

  return buildCreateEditCommand(
    {
      editType: 'image',
      targetLabel: input.alt ?? input.sourceAnchor ?? ctx.sourceAnchor,
      beforeText: input.sourceAnchor ?? ctx.sourceAnchor,
      afterText: '',
      occurrenceIndex: occurrenceIndex(input, ctx),
    },
    ctx,
  )
}

export function buildLinkEditCommand(
  input: LinkEditInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  const oldHref = input.oldHref ?? ctx.linkHref ?? ctx.sourceAnchor
  if (!oldHref) {
    throw new Error('linkEdit requires the current link href')
  }
  if (!ctx.currentSource) {
    throw new Error('linkEdit requires current source')
  }

  const openInNewTab = booleanish(input.openInNewTab)
  const noindex = booleanish(input.noindex)
  const target =
    input.target !== undefined
      ? input.target
      : openInNewTab === undefined
        ? undefined
        : openInNewTab
          ? '_blank'
          : null
  const rel =
    input.rel !== undefined
      ? input.rel
      : openInNewTab === undefined && noindex === undefined
        ? undefined
        : linkRel({ openInNewTab: target === '_blank', noindex })
  const newHref = input.href ?? oldHref
  const patched = updateLinkInSource(ctx.currentSource, {
    oldHref,
    newHref,
    oldText: ctx.selectedText,
    newText: input.label ?? ctx.selectedText,
    target,
    rel,
    occurrenceIndex: occurrenceIndex(input, ctx),
  })
  if (!patched.replaced) {
    throw new Error('Selected link was not found in current source')
  }

  return buildCreateEditCommand(
    {
      editType: 'ai_rewrite',
      targetLabel: `link: ${oldHref} -> ${newHref}`,
      beforeText: ctx.currentSource,
      afterText: patched.source,
      afterHtml: patched.source,
      instruction: `replace link ${oldHref} with ${newHref}`,
      occurrenceIndex: occurrenceIndex(input, ctx),
    },
    ctx,
  )
}

export function buildElementDeleteCommand(
  input: ElementDeleteInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  return buildStyleApplyCommand(
    {
      sourceAnchor: input.sourceAnchor,
      targetScope: input.targetScope,
      style: 'display: none',
      occurrenceIndex: input.occurrenceIndex,
    },
    ctx,
  )
}

function openUiVarFromAnchor(anchor: string | undefined): string | undefined {
  const trimmed = anchor?.trim()
  if (!trimmed) return undefined
  const dataVar = trimmed.match(/^\[data-openui-var=(["'])(.*?)\1\]$/)?.[2]
  if (dataVar) return dataVar
  return /^[A-Za-z_$][\w$]*$/.test(trimmed) ? trimmed : undefined
}

/** Surface usage of a deprecated legacy capsule (OpenUI source) code path so
 *  remaining callers can be found in logs and migrated to DOM-based anchors.
 *  See docs/DOM_BASED_ANCHORS.md#migration-from-openui-capsule-markers. */
function warnLegacyOpenUiPath(path: string) {
  console.warn(
    `[ship-fast] Deprecated: ${path} uses the legacy OpenUI capsule source ` +
      `path. Prefer DOM-based section targeting (replacementHtml + ` +
      `beforeHtml) — see docs/DOM_BASED_ANCHORS.md#migration-from-openui-capsule-markers.`,
  )
}

/** @deprecated Legacy OpenUI-specific section reordering. Use DOM-based reordering instead. */
export function buildSectionMoveCommand(
  input: SectionMoveInput,
  ctx: InlineEditCommandContext,
): CreateInlineEditCommand {
  warnLegacyOpenUiPath('buildSectionMoveCommand')
  const varName =
    input.varName ?? ctx.openuiVar ?? openUiVarFromAnchor(ctx.sourceAnchor)
  if (!varName) {
    throw new Error('sectionMove requires an OpenUI section variable name')
  }
  if (!ctx.currentSource) {
    throw new Error('sectionMove requires current OpenUI source')
  }

  const result = reorderInStack(ctx.currentSource, varName, input.direction)
  if (!result.reordered) {
    throw new Error(
      input.direction === 'up'
        ? 'Element is already at the top'
        : 'Element is already at the bottom',
    )
  }

  return buildCreateEditCommand(
    {
      editType: 'ai_rewrite',
      targetLabel: `reorder ${varName} ${input.direction}`,
      beforeText: ctx.currentSource,
      afterText: result.source,
      afterHtml: result.source,
      instruction: `reorder ${varName} ${input.direction}`,
    },
    ctx,
  )
}

export function buildSectionRewriteCommand(
  input: SectionRewriteInput,
  ctx: InlineEditCommandContext,
): ApplySectionEditCommand {
  // HTML-based path (DOM-based, preferred)
  if (input.replacementHtml !== undefined) {
    return {
      kind: 'applySectionEdit',
      mutation: api.sessions.applySectionEdit,
      args: {
        ...commandBase(ctx),
        replacementHtml: input.replacementHtml,
        beforeHtml: ctx.selectionHtml,
        instruction: input.instruction ?? ctx.instruction ?? 'section rewrite',
      },
    }
  }

  // OpenUI-based path (legacy capsule support, deprecated)
  if (input.replacementOpenUiSource !== undefined && !ctx.openuiVar) {
    throw new Error(
      'sectionRewrite requires a known OpenUI section variable to safely apply replacementOpenUiSource — reselect a section and try again',
    )
  }
  warnLegacyOpenUiPath('buildSectionRewriteCommand(replacementOpenUiSource)')
  return {
    kind: 'applySectionEdit',
    mutation: api.sessions.applySectionEdit,
    args: {
      ...commandBase(ctx),
      replacementOpenUiSource: input.replacementOpenUiSource,
      sectionVarName: ctx.openuiVar,
      instruction: input.instruction ?? ctx.instruction ?? 'section rewrite',
    },
  }
}

export function buildUndoCommand(
  _input: UndoLastEditInput,
  ctx: InlineEditCommandContext,
): RestorePreviewVersionCommand {
  if (ctx.currentPreviewVersion === undefined) {
    throw new Error('undoLastEdit requires the current preview version')
  }
  const targetVersion = ctx.currentPreviewVersion - 1
  if (targetVersion < 1) {
    throw new Error('Nothing to undo — already at the earliest version')
  }
  return {
    kind: 'restorePreviewVersion',
    mutation: api.sessions.restorePreviewVersion,
    args: {
      ...commandBase(ctx),
      version: targetVersion,
    },
  }
}
