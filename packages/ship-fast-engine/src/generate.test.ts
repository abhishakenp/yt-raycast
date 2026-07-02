import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SHIP_FAST_MODELS, supportsReasoningEffort } from './model-list'

const DB_OBSERVED_PROMPT =
  'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'
const DB_OBSERVED_OUTPUT =
  'Polished pet-food homepage with trust signals and a direct conversion path.'

const llmMocks = vi.hoisted(() => ({
  chat: vi.fn(),
  getAdapter: vi.fn((modelId: string) => ({ modelId, provider: 'sdk' })),
  talaasChat: vi.fn(),
}))

vi.mock('@tanstack/ai', () => ({
  chat: llmMocks.chat,
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
})
