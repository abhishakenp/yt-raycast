import { describe, expect, it } from 'vitest'

import { examplePrompts, normalizePromptDraft } from '@/features/home/services/home-prompts'

describe('home prompts', () => {
  it('keeps prompt examples available for immediate generation', () => {
    expect(examplePrompts).toHaveLength(4)
    expect(examplePrompts[0].prompt).toContain('image generation studio')
  })

  it('normalizes prompt drafts without rejecting short meaningful prompts', () => {
    expect(normalizePromptDraft('  portfolio  ')).toBe('portfolio')
  })
})
