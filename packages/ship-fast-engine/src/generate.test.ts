import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SHIP_FAST_MODELS, supportsReasoningEffort } from './model-list'

const DB_OBSERVED_PROMPT =
  'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'
const DB_OBSERVED_OUTPUT =
  'Polished pet-food homepage with trust signals and a direct conversion path.'

const llmMocks = vi.hoisted(() => ({
  chat: vi.fn(),
  getAdapter: vi.fn((modelId: string) => ({ modelId, provider: 'sdk' })),
  maxIterations: vi.fn((max: number) => ({ max })),
  talaasChat: vi.fn(),
}))

vi.mock('@tanstack/ai', () => ({
  chat: llmMocks.chat,
  maxIterations: llmMocks.maxIterations,
}))

vi.mock('./model.ts', () => ({
  getAdapter: llmMocks.getAdapter,
}))

vi.mock('./talaas.ts', () => ({
  talaasChat: llmMocks.talaasChat,
}))

async function* textChunks(text: string) {
  yield { type: 'TEXT_MESSAGE_CONTENT' as const, delta: text }
}

async function* runError(message: string) {
  yield { type: 'RUN_ERROR' as const, message }
}

async function* toolCallChunks() {
  yield {
    type: 'TOOL_CALL_START' as const,
    toolCallId: 'call_text_1',
    toolCallName: 'textRewrite',
    toolName: 'textRewrite',
    index: 0,
  }
  yield {
    type: 'TOOL_CALL_ARGS' as const,
    toolCallId: 'call_text_1',
    delta: '{"beforeText":"Hero",',
  }
  yield {
    type: 'TOOL_CALL_ARGS' as const,
    toolCallId: 'call_text_1',
    delta: '"afterText":"Launch-ready hero"}',
  }
  yield {
    type: 'TOOL_CALL_END' as const,
    toolCallId: 'call_text_1',
    toolCallName: 'textRewrite',
  }
  yield {
    type: 'TEXT_MESSAGE_CONTENT' as const,
    delta: 'Applied the requested edit.',
  }
}

async function* toolCallEndInputChunks() {
  yield {
    type: 'TOOL_CALL_START' as const,
    toolCallId: 'call_style_1',
    toolCallName: 'styleApply',
    toolName: 'styleApply',
    index: 0,
  }
  yield {
    type: 'TOOL_CALL_END' as const,
    toolCallId: 'call_style_1',
    toolCallName: 'styleApply',
    input: {
      sourceAnchor: '#hero',
      style: {
        backgroundColor: 'rgb(15, 23, 42)',
        color: 'white',
      },
    },
  }
}

beforeEach(() => {
  llmMocks.chat.mockReset()
  llmMocks.getAdapter.mockReset()
  llmMocks.talaasChat.mockReset()
  llmMocks.getAdapter.mockImplementation((modelId: string) => ({
    modelId,
    provider: 'sdk',
  }))
})

describe('generateText model dispatch', () => {
  it.each(SHIP_FAST_MODELS.map((model) => [model.id, model.provider] as const))(
    'generates text for selectable %s models through the configured %s provider',
    async (modelId, provider) => {
      llmMocks.chat.mockImplementation(() => textChunks(DB_OBSERVED_OUTPUT))
      llmMocks.talaasChat.mockImplementation(() =>
        textChunks(DB_OBSERVED_OUTPUT),
      )

      const { generateText } = await import('./generate')
      await expect(
        generateText(
          modelId,
          'Build the generated homepage.',
          DB_OBSERVED_PROMPT,
          new AbortController().signal,
          0,
        ),
      ).resolves.toBe(DB_OBSERVED_OUTPUT)

      if (provider === 'talaas') {
        expect(llmMocks.talaasChat).toHaveBeenCalledWith(
          modelId,
          'Build the generated homepage.',
          DB_OBSERVED_PROMPT,
          expect.any(AbortSignal),
        )
        expect(llmMocks.chat).not.toHaveBeenCalled()
      } else {
        expect(llmMocks.getAdapter).toHaveBeenCalledWith(modelId)
        expect(llmMocks.chat).toHaveBeenCalledWith(
          expect.objectContaining({
            adapter: { modelId, provider: 'sdk' },
            systemPrompts: ['Build the generated homepage.'],
            messages: [{ role: 'user', content: DB_OBSERVED_PROMPT }],
          }),
        )
        expect(llmMocks.talaasChat).not.toHaveBeenCalled()
      }
    },
  )

  it('sends reasoning options only to GPT-OSS models that support them', async () => {
    llmMocks.chat.mockImplementation(() => textChunks(DB_OBSERVED_OUTPUT))
    const { generateText } = await import('./generate')

    await generateText(
      'openai/gpt-oss-120b',
      'Build the generated homepage.',
      DB_OBSERVED_PROMPT,
      new AbortController().signal,
      0,
    )
    await generateText(
      'llama-3.1-8b-instant',
      'Build the generated homepage.',
      DB_OBSERVED_PROMPT,
      new AbortController().signal,
      0,
    )

    const gptOssOptions = llmMocks.chat.mock.calls[0]![0].modelOptions
    const llamaOptions = llmMocks.chat.mock.calls[1]![0].modelOptions
    expect(supportsReasoningEffort('openai/gpt-oss-120b')).toBe(true)
    expect(gptOssOptions).toMatchObject({
      reasoning_effort: 'low',
      include_reasoning: false,
    })
    expect(supportsReasoningEffort('llama-3.1-8b-instant')).toBe(false)
    expect(llamaOptions).not.toHaveProperty('reasoning_effort')
    expect(llamaOptions).not.toHaveProperty('include_reasoning')
  })

  it('throws provider RUN_ERROR chunks instead of returning empty generated output', async () => {
    llmMocks.talaasChat.mockImplementation(() => runError('503 high demand'))

    const { generateText } = await import('./generate')
    await expect(
      generateText(
        'llama3.1-8B',
        'Build the generated homepage.',
        DB_OBSERVED_PROMPT,
        new AbortController().signal,
        0,
      ),
    ).rejects.toThrow('503 high demand')
  })

  it('throws after an empty provider stream so generation callers can fail the session', async () => {
    llmMocks.talaasChat.mockReturnValue((async function* () {})())

    const { generateText } = await import('./generate')
    await expect(
      generateText(
        'llama3.1-8B',
        'Build the generated homepage.',
        DB_OBSERVED_PROMPT,
        new AbortController().signal,
        0,
      ),
    ).rejects.toThrow('empty model output')
  })

  it('passes declared TanStack tools to chat and collects normalized tool-call inputs', async () => {
    const tools = [
      {
        name: 'textRewrite',
        description: 'Rewrite selected text',
        inputSchema: {
          type: 'object',
          properties: {
            beforeText: { type: 'string' },
            afterText: { type: 'string' },
          },
          required: ['afterText'],
        },
      },
    ]
    llmMocks.chat.mockImplementation(() => toolCallChunks())

    const { generateWithTools } = await import('./generate')
    const result = await generateWithTools(
      'openai/gpt-oss-120b',
      'Edit the selected section.',
      'Rewrite the hero headline.',
      tools,
      new AbortController().signal,
      0,
    )

    expect(llmMocks.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        adapter: { modelId: 'openai/gpt-oss-120b', provider: 'sdk' },
        tools,
      }),
    )
    expect(result).toEqual({
      text: 'Applied the requested edit.',
      toolCalls: [
        {
          id: 'call_text_1',
          tool: 'textRewrite',
          input: {
            beforeText: 'Hero',
            afterText: 'Launch-ready hero',
          },
        },
      ],
    })
  })

  it('uses finalized TanStack TOOL_CALL_END input when arguments are not streamed', async () => {
    const tools = [
      {
        name: 'styleApply',
        description: 'Apply selected element styles',
        inputSchema: {
          type: 'object',
          properties: {
            sourceAnchor: { type: 'string' },
            style: { type: 'object', additionalProperties: true },
          },
          required: ['style'],
        },
      },
    ]
    llmMocks.chat.mockImplementation(() => toolCallEndInputChunks())

    const { generateWithTools } = await import('./generate')
    const result = await generateWithTools(
      'openai/gpt-oss-120b',
      'Edit the selected section.',
      'Make the selected hero dark.',
      tools,
      new AbortController().signal,
      0,
    )

    expect(result).toEqual({
      text: '',
      toolCalls: [
        {
          id: 'call_style_1',
          tool: 'styleApply',
          input: {
            sourceAnchor: '#hero',
            style: {
              backgroundColor: 'rgb(15, 23, 42)',
              color: 'white',
            },
          },
        },
      ],
    })
  })

  it('delegates structured tool generation to TanStack chat outputSchema', async () => {
    const outputSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tool: { type: 'string' },
        },
        required: ['tool'],
        additionalProperties: true,
      },
    }
    const tools = [
      {
        name: 'execute_typescript',
        description: 'Execute Code Mode TypeScript',
        inputSchema: {
          type: 'object',
          properties: { typescriptCode: { type: 'string' } },
          required: ['typescriptCode'],
        },
      },
    ]
    const structuredOperations = [
      {
        tool: 'styleApply',
        input: {
          sourceAnchor: '.cta',
          style: { backgroundColor: 'yellow' },
        },
      },
    ]
    llmMocks.chat.mockResolvedValue(structuredOperations)

    const { generateStructuredWithTools } = await import('./generate')
    const result = await generateStructuredWithTools(
      'openai/gpt-oss-120b',
      'Edit with Code Mode.',
      'Make the button yellow.',
      tools,
      outputSchema,
      new AbortController().signal,
      0,
    )

    expect(llmMocks.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        adapter: { modelId: 'openai/gpt-oss-120b', provider: 'sdk' },
        systemPrompts: ['Edit with Code Mode.'],
        messages: [{ role: 'user', content: 'Make the button yellow.' }],
        tools,
        outputSchema,
      }),
    )
    expect(result).toBe(structuredOperations)
  })
})
