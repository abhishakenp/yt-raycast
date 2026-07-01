import { describe, expect, it } from 'vitest'

import { preferMixedEnglishBcp47FromSnippet } from './mixed-english-hints'

describe('preferMixedEnglishBcp47FromSnippet', () => {
  it('recognizes common mixed-English language names from freeform prompts', () => {
    expect(
      preferMixedEnglishBcp47FromSnippet('Make this gym site in Hinglish'),
    ).toBe('hinglish')
    expect(
      preferMixedEnglishBcp47FromSnippet('Create a cafe page in Tanglish'),
    ).toBe('ta-en')
    expect(
      preferMixedEnglishBcp47FromSnippet('Use telugu english mix for this app'),
    ).toBe('te-en')
  })

  it('returns null when no mixed-English preference is present', () => {
    expect(
      preferMixedEnglishBcp47FromSnippet('Build a clean SaaS homepage'),
    ).toBe(null)
  })
})
