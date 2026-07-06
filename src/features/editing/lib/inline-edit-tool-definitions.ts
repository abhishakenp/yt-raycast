import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const styleInputSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
])
export const numberOrStringInputSchema = z.union([z.number(), z.string()])
export const booleanOrStringInputSchema = z.union([z.boolean(), z.string()])
export const targetScopeInputSchema = z.enum(['element', 'section', 'page'])
export const sectionMoveDirectionSchema = z.enum(['up', 'down'])

export const textRewriteInputSchema = z.object({
  beforeText: z.string().optional().meta({
    description: 'Exact current text to replace. Defaults to selected text.',
  }),
  afterText: z.string().meta({ description: 'Replacement text.' }),
  targetLabel: z.string().optional(),
  occurrenceIndex: numberOrStringInputSchema.optional(),
})

export const styleApplyInputSchema = z.object({
  sourceAnchor: z.string().optional(),
  className: z.string().optional(),
  selector: z.string().optional(),
  targetScope: targetScopeInputSchema.optional(),
  style: styleInputSchema,
  targetLabel: z.string().optional(),
  occurrenceIndex: numberOrStringInputSchema.optional(),
})

export const imageReplaceInputSchema = z
  .object({
    src: z.string().optional(),
    query: z.string().optional(),
    alt: z.string().optional(),
    width: numberOrStringInputSchema.optional(),
    height: numberOrStringInputSchema.optional(),
    sourceAnchor: z.string().optional(),
    targetScope: targetScopeInputSchema.optional(),
    occurrenceIndex: numberOrStringInputSchema.optional(),
  })
  .refine((input) => Boolean(input.src || input.query), {
    message: 'imageReplace requires src or query',
  })

export const imageRemoveInputSchema = z.object({
  sourceAnchor: z.string().optional(),
  targetScope: targetScopeInputSchema.optional(),
  alt: z.string().optional(),
  occurrenceIndex: numberOrStringInputSchema.optional(),
})

export const linkEditInputSchema = z.object({
  oldHref: z.string().optional(),
  href: z.string().optional(),
  label: z.string().optional(),
  target: z.union([z.string(), z.null()]).optional(),
  rel: z.string().optional(),
  openInNewTab: booleanOrStringInputSchema.optional(),
  noindex: booleanOrStringInputSchema.optional(),
  occurrenceIndex: numberOrStringInputSchema.optional(),
})

export const elementDeleteInputSchema = z.object({
  sourceAnchor: z.string().optional(),
  targetScope: targetScopeInputSchema.optional(),
  occurrenceIndex: numberOrStringInputSchema.optional(),
})

export const sectionMoveInputSchema = z.object({
  varName: z.string().optional(),
  direction: sectionMoveDirectionSchema,
})

export const sectionRewriteInputSchema = z
  .object({
    replacementHtml: z.string().optional(),
    replacementOpenUiSource: z.string().optional(),
    instruction: z.string().optional(),
  })
  .refine(
    (input) => Boolean(input.replacementHtml || input.replacementOpenUiSource),
    {
      message:
        'sectionRewrite requires replacementHtml or replacementOpenUiSource',
    },
  )

export const undoLastEditInputSchema = z.object({})

export const persistedInlineEditOutputSchema = z
  .object({
    sessionId: z.string(),
    previewVersion: z.number(),
    saved: z.boolean(),
    translatedEdit: z
      .object({
        locale: z.string(),
        sourceText: z.string(),
        translation: z.string(),
      })
      .optional(),
  })
  .passthrough()

export const textRewriteToolDefinition = toolDefinition({
  name: 'textRewrite',
  description:
    'Rewrite selected text while preserving surrounding structure and icons.',
  inputSchema: textRewriteInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const styleApplyToolDefinition = toolDefinition({
  name: 'styleApply',
  description:
    'Apply CSS style changes to the selected element, enclosing section, or page. Put every declaration under style.',
  inputSchema: styleApplyInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const imageReplaceToolDefinition = toolDefinition({
  name: 'imageReplace',
  description:
    'Replace a selected image or selected background visual with a direct image URL or stock-image query.',
  inputSchema: imageReplaceInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const imageRemoveToolDefinition = toolDefinition({
  name: 'imageRemove',
  description:
    'Clear a selected image or background visual while keeping the element, section, or page in place.',
  inputSchema: imageRemoveInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const linkEditToolDefinition = toolDefinition({
  name: 'linkEdit',
  description:
    'Update a link href, label, target, rel, noindex, or new-tab behavior.',
  inputSchema: linkEditInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const elementDeleteToolDefinition = toolDefinition({
  name: 'elementDelete',
  description:
    'Hide the selected element when explicitly requested. Sets display:none — this does not remove the element from the page structure, only visually hides it.',
  inputSchema: elementDeleteInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const sectionMoveToolDefinition = toolDefinition({
  name: 'sectionMove',
  description: 'Move the selected OpenUI section up or down.',
  inputSchema: sectionMoveInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const sectionRewriteToolDefinition = toolDefinition({
  name: 'sectionRewrite',
  description:
    'Replace the selected section with complete replacement HTML or OpenUI TSX only when smaller tools are insufficient.',
  inputSchema: sectionRewriteInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const undoLastEditToolDefinition = toolDefinition({
  name: 'undoLastEdit',
  description:
    "Revert the most recent edit on this page (yours or the user's manual edit), restoring the preview to the version immediately before it. Call this when the user asks to undo, revert, or go back to how a change looked before.",
  inputSchema: undoLastEditInputSchema,
  outputSchema: persistedInlineEditOutputSchema,
})

export const INLINE_EDIT_TOOL_DEFINITIONS = [
  textRewriteToolDefinition,
  styleApplyToolDefinition,
  imageReplaceToolDefinition,
  imageRemoveToolDefinition,
  linkEditToolDefinition,
  elementDeleteToolDefinition,
  sectionMoveToolDefinition,
  sectionRewriteToolDefinition,
  undoLastEditToolDefinition,
]
