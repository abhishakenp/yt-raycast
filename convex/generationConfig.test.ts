import { afterEach, describe, expect, it } from 'vitest'

import { getModelConfigurationFailure } from './generationConfig'

const savedEnv = { ...process.env }

describe('generation model configuration gate', () => {
  afterEach(() => {
    process.env = { ...savedEnv }
  })

  it('requires GROQ_API_KEY for the default Groq-compatible homepage model', () => {
    delete process.env.OPENUI_HOME_MODEL
    delete process.env.HOMEPAGE_MODEL
    delete process.env.GROQ_MODEL
    delete process.env.GROQ_API_KEY

    expect(getModelConfigurationFailure()).toContain('GROQ_API_KEY is missing')
  })

  it('allows Groq-compatible generation when the Groq key is configured', () => {
    process.env.OPENUI_HOME_MODEL = 'openai/gpt-oss-120b'
    process.env.GROQ_API_KEY = 'groq-key'

    expect(getModelConfigurationFailure()).toBeNull()
  })

  it('requires a Gemini or Google key for Gemini homepage models', () => {
    process.env.OPENUI_HOME_MODEL = 'gemini-2.5-flash'
    delete process.env.GEMINI_API_KEY
    delete process.env.GOOGLE_API_KEY

    expect(getModelConfigurationFailure()).toContain(
      'GEMINI_API_KEY or GOOGLE_API_KEY is missing',
    )
  })

  it('allows Gemini generation when either supported Google key is configured', () => {
    process.env.OPENUI_HOME_MODEL = 'gemini-2.5-flash'
    process.env.GOOGLE_API_KEY = 'google-key'
    delete process.env.GEMINI_API_KEY

    expect(getModelConfigurationFailure()).toBeNull()
  })
})
