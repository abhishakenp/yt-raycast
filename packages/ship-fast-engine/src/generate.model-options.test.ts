import { describe, expect, it } from 'vitest'
import { buildModelOptions, buildMessages } from './generate.ts'

describe('buildModelOptions', () => {
  it('sends reasoning_effort for gpt-oss models on Groq', () => {
    const opts = buildModelOptions('openai/gpt-oss-120b')
    expect(opts.reasoning_effort).toBe('low')
    expect(opts.include_reasoning).toBe(false)
    expect(opts.citation_options).toBe('disabled')
    expect(opts.top_p).toBe(1)
  })

  it('sends reasoning_effort for gpt-oss models on Cerebras', () => {
    const opts = buildModelOptions('cerebras/gpt-oss-120b')
    expect(opts.reasoning_effort).toBe('low')
    expect(opts.include_reasoning).toBeUndefined()
    expect(opts.citation_options).toBeUndefined()
    expect(opts.top_p).toBe(1)
  })

  it('does not send reasoning_effort for non-reasoning Groq models', () => {
    const opts = buildModelOptions('llama-3.3-70b-versatile')
    expect(opts.reasoning_effort).toBeUndefined()
    expect(opts.include_reasoning).toBeUndefined()
    expect(opts.citation_options).toBe('disabled')
    expect(opts.top_p).toBe(1)
  })

  it('does not send reasoning_effort for non-reasoning models on Cerebras', () => {
    const opts = buildModelOptions('llama-3.1-8b-instant')
    expect(opts.reasoning_effort).toBeUndefined()
    expect(opts.include_reasoning).toBeUndefined()
    expect(opts.citation_options).toBe('disabled')
    expect(opts.top_p).toBe(1)
  })

  it('sends reasoning_effort for gpt-oss-20b on Groq', () => {
    const opts = buildModelOptions('openai/gpt-oss-20b')
    expect(opts.reasoning_effort).toBe('low')
    expect(opts.include_reasoning).toBe(false)
    expect(opts.citation_options).toBe('disabled')
  })
})

describe('buildMessages', () => {
  it('adds harmony no-think prefill for gpt-oss models', () => {
    const msgs = buildMessages('openai/gpt-oss-120b', 'Build a coffee shop')
    expect(msgs).toHaveLength(2)
    expect(msgs[0]).toEqual({ role: 'user', content: 'Build a coffee shop' })
    expect(msgs[1].role).toBe('assistant')
    expect(msgs[1].content).toContain('<|channel|>analysis<|message|>')
    expect(msgs[1].content).toContain('<|channel|>final<|message|>')
  })

  it('adds harmony no-think prefill for cerebras gpt-oss models', () => {
    const msgs = buildMessages('cerebras/gpt-oss-120b', 'Build a coffee shop')
    expect(msgs).toHaveLength(2)
    expect(msgs[1].role).toBe('assistant')
    expect(msgs[1].content).toContain('<|channel|>final<|message|>')
  })

  it('does NOT add prefill for non-reasoning models', () => {
    const msgs = buildMessages('llama-3.3-70b-versatile', 'Build a coffee shop')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toEqual({ role: 'user', content: 'Build a coffee shop' })
  })

  it('does NOT add prefill for gemini models', () => {
    const msgs = buildMessages('gemini-2.5-flash', 'Build a coffee shop')
    expect(msgs).toHaveLength(1)
  })
})
