import { describe, expect, it } from 'vitest'

import { resolvePipelineLanguage } from '@ship-fast/engine/pipeline/prompt-language.js'

describe('engine prompt language detection', () => {
  it('detects explicit native language requests when the default language is English', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a Hindi website for a school admissions team',
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('hi')
    expect(mode.name).toBe('Hindi')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('server language code')
  })

  it('detects Hinglish and code-mixed language requests from prompt keywords', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a Hindi English mix food delivery landing page',
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('hinglish')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('hinglish')
  })
})
