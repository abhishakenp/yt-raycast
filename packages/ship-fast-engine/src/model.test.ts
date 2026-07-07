import { describe, expect, it, vi } from 'vitest'

const adapterMocks = vi.hoisted(() => ({
  geminiText: vi.fn((model) => ({ model, provider: 'gemini' })),
  groqText: vi.fn((model) => ({ model, provider: 'groq' })),
}))

vi.mock('@tanstack/ai-gemini', () => ({
  geminiText: adapterMocks.geminiText,
}))

vi.mock('@tanstack/ai-groq', () => ({
  groqText: adapterMocks.groqText,
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

  it('falls back to a valid adapter when callers pass an unknown model id', async () => {
    const { getAdapter } = await import('./model.ts')

    expect(() => getAdapter('unknown-model-from-ui')).not.toThrow()
    expect(getAdapter('unknown-model-from-ui')).toMatchObject({
      provider: expect.stringMatching(/^(groq|gemini)$/),
    })
  })
})
