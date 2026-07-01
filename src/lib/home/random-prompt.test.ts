import { afterEach, describe, expect, it, vi } from 'vitest'

import { getRandomPrompt } from './random-prompt'

describe('getRandomPrompt', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns one of the built-in website generation prompts', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(getRandomPrompt()).toContain('cinematic travel landing page')
  })

  it('can select later fallback prompts deterministically', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)

    expect(getRandomPrompt()).toContain('fitness club website')
  })
})
