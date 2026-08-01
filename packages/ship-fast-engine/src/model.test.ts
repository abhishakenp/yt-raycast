import { describe, expect, it, vi } from 'vitest'

const adapterMocks = vi.hoisted(() => ({
  geminiText: vi.fn((model) => ({ model, provider: 'gemini' })),
  groqText: vi.fn((model) => ({ model, provider: 'groq' })),
  cerebrasText: vi.fn((model) => ({ model, provider: 'cerebras' })),
  pollinationsText: vi.fn((model) => ({ model, provider: 'pollinations' })),
}))

vi.mock('@tanstack/ai-gemini', () => ({
  geminiText: adapterMocks.geminiText,
}))

vi.mock('@tanstack/ai-groq', () => ({
  groqText: adapterMocks.groqText,
}))

vi.mock('./llm/cerebras.ts', () => ({
  cerebrasText: adapterMocks.cerebrasText,
}))

vi.mock('./llm/pollinations.ts', () => ({
  pollinationsText: adapterMocks.pollinationsText,
}))

describe('model adapter selection', () => {
  it('creates an adapter for the configured default model', async () => {
    const { DEFAULT_MODEL } = await import('./model-list.ts')
    const { getAdapter } = await import('./model.ts')

    expect(() => getAdapter(DEFAULT_MODEL)).not.toThrow()
  })

  it('creates adapters for selectable Groq and Gemini models', async () => {
    const { getAdapter } = await import('./model.ts')

    expect(getAdapter('openai/gpt-oss-120b')).toEqual({
      model: 'openai/gpt-oss-120b',
      provider: 'groq',
    })
    expect(getAdapter('gemini-2.5-flash')).toEqual({
      model: 'gemini-2.5-flash',
      provider: 'gemini',
    })
  })

  it('creates a Cerebras adapter for cerebras/gpt-oss-120b', async () => {
    const { getAdapter } = await import('./model.ts')

    expect(getAdapter('cerebras/gpt-oss-120b')).toEqual({
      model: 'gpt-oss-120b',
      provider: 'cerebras',
    })
  })

  it('creates a Pollinations adapter for pollinations/openai', async () => {
    const { getAdapter } = await import('./model.ts')

    expect(getAdapter('pollinations/openai')).toEqual({
      model: 'openai',
      provider: 'pollinations',
    })
  })

  it('falls back to a valid adapter when callers pass an unknown model id', async () => {
    const { getAdapter } = await import('./model.ts')

    expect(() => getAdapter('unknown-model-from-ui')).not.toThrow()
    expect(getAdapter('unknown-model-from-ui')).toMatchObject({
      provider: expect.stringMatching(/^(groq|gemini|cerebras)$/),
    })
  })
})

describe('model-list catalog', () => {
  it('includes cerebras/gpt-oss-120b in the model list', async () => {
    const { SHIP_FAST_MODELS } = await import('./model-list.ts')
    const cerebras = SHIP_FAST_MODELS.find(
      (m) => m.id === 'cerebras/gpt-oss-120b',
    )
    expect(cerebras).toBeDefined()
    expect(cerebras?.provider).toBe('cerebras')
  })

  it('reports cerebras as the provider for cerebras/gpt-oss-120b', async () => {
    const { getProvider } = await import('./model-list.ts')
    expect(getProvider('cerebras/gpt-oss-120b')).toBe('cerebras')
  })

  it('supportsReasoningEffort matches cerebras/gpt-oss-120b', async () => {
    const { supportsReasoningEffort } = await import('./model-list.ts')
    expect(supportsReasoningEffort('cerebras/gpt-oss-120b')).toBe(true)
    expect(supportsReasoningEffort('openai/gpt-oss-20b')).toBe(true)
    expect(supportsReasoningEffort('llama-3.3-70b-versatile')).toBe(false)
  })
})
