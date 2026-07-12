import { describe, expect, it } from 'vitest'

import { createInlineEditClientTools } from './inline-edit-client-tools'
import {
  elementDeleteInputSchema,
  imageRemoveInputSchema,
  imageReplaceInputSchema,
  INLINE_EDIT_TOOL_DEFINITIONS,
  linkEditInputSchema,
  sectionMoveInputSchema,
  sectionRewriteInputSchema,
  styleApplyInputSchema,
  textRewriteInputSchema,
} from './inline-edit-tool-definitions'

async function validateOutput(
  tool: (typeof INLINE_EDIT_TOOL_DEFINITIONS)[number],
  value: unknown,
) {
  return Promise.resolve(tool.outputSchema!['~standard'].validate(value))
}

function validationIssues(
  result: Awaited<ReturnType<typeof validateOutput>>,
): unknown {
  return (result as { issues?: unknown }).issues
}

describe('inline edit tool definitions', () => {
  it('exposes every shared inline edit tool to imperative client execution', () => {
    const mutation = async () => ({ saved: true, previewVersion: 1 })
    const clientTools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_tool_parity',
    })

    expect(clientTools.map((tool) => tool.name).sort()).toEqual(
      INLINE_EDIT_TOOL_DEFINITIONS.map((tool) => tool.name).sort(),
    )
    expect(new Set(clientTools.map((tool) => tool.name)).size).toBe(
      clientTools.length,
    )
    expect(
      clientTools.every((tool) => typeof tool.execute === 'function'),
    ).toBe(true)
  })

  it('accepts the runtime inputs needed for manual and AI inline edit actions', () => {
    expect(
      textRewriteInputSchema.safeParse({
        beforeText: 'Plain',
        afterText: 'Dreamy',
        occurrenceIndex: '1',
      }).success,
    ).toBe(true)
    expect(
      styleApplyInputSchema.safeParse({
        targetScope: 'page',
        style: {
          backgroundImage: 'linear-gradient(135deg, #0f172a, #22d3ee)',
          borderRadius: 4,
        },
      }).success,
    ).toBe(true)
    expect(
      imageReplaceInputSchema.safeParse({
        targetScope: 'section',
        query: 'ceramic studio',
        alt: 'Ceramic studio',
        width: '1200',
        height: '600',
      }).success,
    ).toBe(true)
    expect(
      imageRemoveInputSchema.safeParse({
        targetScope: 'section',
        sourceAnchor: '[data-openui-var="home_hero"]',
      }).success,
    ).toBe(true)
    expect(
      linkEditInputSchema.safeParse({
        oldHref: '/old',
        href: 'https://example.com',
        label: 'Visit',
        target: null,
        openInNewTab: 'false',
        noindex: 'true',
      }).success,
    ).toBe(true)
    expect(
      elementDeleteInputSchema.safeParse({
        targetScope: 'page',
        occurrenceIndex: 0,
      }).success,
    ).toBe(true)
    expect(sectionMoveInputSchema.safeParse({ direction: 'up' }).success).toBe(
      true,
    )
    expect(
      sectionRewriteInputSchema.safeParse({
        replacementHtml: '<section>New</section>',
      }).success,
    ).toBe(true)
  })

  it('rejects impossible image replacement and section rewrite requests', () => {
    expect(imageReplaceInputSchema.safeParse({ alt: 'Only alt' }).success).toBe(
      false,
    )
    expect(sectionRewriteInputSchema.safeParse({}).success).toBe(false)
  })

  it('validates the persisted mutation outputs every inline edit tool returns to TanStack AI', async () => {
    const savedOutput = {
      sessionId: 'session_tool_output',
      previewVersion: 42,
      saved: true,
    }
    const translatedOutput = {
      ...savedOutput,
      translatedEdit: {
        locale: 'hi',
        sourceText: 'Plain headline',
        translation: 'Dreamy Hindi headline',
      },
    }

    for (const tool of INLINE_EDIT_TOOL_DEFINITIONS) {
      expect(tool.outputSchema).toBeDefined()
      const savedResult = await validateOutput(tool, savedOutput)
      const translatedResult = await validateOutput(tool, translatedOutput)
      const invalidResult = await validateOutput(tool, {
        sessionId: 'session_tool_output',
        saved: true,
      })

      expect(validationIssues(savedResult)).toBeUndefined()
      expect(validationIssues(translatedResult)).toBeUndefined()
      expect(validationIssues(invalidResult)).toEqual(expect.any(Array))
    }
  })
})
