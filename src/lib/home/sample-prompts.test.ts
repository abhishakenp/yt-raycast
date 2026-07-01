import { describe, expect, it } from 'vitest'

import { INDIAN_SAMPLE_PROMPTS } from './indian-sample-prompts'
import {
  LOCAL_DEV_PROMPT_QUICK_PICK_COUNT,
  LOCAL_DEV_PROMPT_SHORTCUTS,
  SAMPLE_PROMPTS,
} from './sample-prompts'

describe('sample prompts', () => {
  it('includes broad fallback prompts and the Indian prompt catalog', () => {
    expect(SAMPLE_PROMPTS.length).toBeGreaterThan(INDIAN_SAMPLE_PROMPTS.length)
    expect(SAMPLE_PROMPTS).toEqual(
      expect.arrayContaining([
        INDIAN_SAMPLE_PROMPTS[0],
        expect.stringContaining('AI sales copilot'),
      ]),
    )
  })

  it('keeps the Indian prompt catalog broad enough to seed localized generation', () => {
    const catalog = INDIAN_SAMPLE_PROMPTS.join('\n').toLowerCase()
    const expectedDomains = [
      'dance',
      'fintech',
      'restaurant',
      'hospital',
      'edtech',
      'logistics',
      'solar',
      'ngo',
      'matrimony',
      'temple',
    ]

    expect(INDIAN_SAMPLE_PROMPTS.length).toBeGreaterThanOrEqual(80)
    expect(new Set(INDIAN_SAMPLE_PROMPTS).size).toBe(
      INDIAN_SAMPLE_PROMPTS.length,
    )
    expect(expectedDomains.every((domain) => catalog.includes(domain))).toBe(
      true,
    )
    expect(catalog).toContain('mixed hindi-english')
    expect(catalog).toMatch(/mixed english[-–]tamil/)
  })

  it('keeps local quick-pick shortcuts aligned to the configured quick-pick count', () => {
    expect(LOCAL_DEV_PROMPT_QUICK_PICK_COUNT).toBeGreaterThan(0)
    expect(LOCAL_DEV_PROMPT_SHORTCUTS.length).toBeGreaterThanOrEqual(
      LOCAL_DEV_PROMPT_QUICK_PICK_COUNT,
    )
    expect(
      LOCAL_DEV_PROMPT_SHORTCUTS.slice(0, LOCAL_DEV_PROMPT_QUICK_PICK_COUNT),
    ).toEqual(expect.arrayContaining([expect.stringContaining('website')]))
  })

  it('uses quick-pick shortcuts that are either natural-language starters or real catalog prompts', () => {
    const samplePromptSet = new Set(SAMPLE_PROMPTS)
    const catalogBackedShortcuts = LOCAL_DEV_PROMPT_SHORTCUTS.filter((prompt) =>
      samplePromptSet.has(prompt),
    )

    expect(LOCAL_DEV_PROMPT_SHORTCUTS[0]).toMatch(/website banao/i)
    expect(catalogBackedShortcuts.length).toBeGreaterThanOrEqual(5)
    expect(LOCAL_DEV_PROMPT_SHORTCUTS.join('\n')).toContain(
      'mixed Hindi-English',
    )
    expect(LOCAL_DEV_PROMPT_SHORTCUTS.join('\n')).toContain('regional language')
  })
})
