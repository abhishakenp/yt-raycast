import { describe, expect, it } from 'vitest'
import {
  canReusePrefetchedPrompt,
  generationPayloadFingerprint,
  isGibberishPromptClient,
  normalizedPromptForReuse,
} from './generation-prefetch'

describe('generation prefetch reuse', () => {
  it('normalizes punctuation and casing for exact reuse', () => {
    expect(normalizedPromptForReuse('A BLOG, about DOGS!!')).toBe(
      'a blog about dogs',
    )
    expect(
      canReusePrefetchedPrompt('A blog about dogs', 'a blog, about dogs!'),
    ).toBe(true)
  })

  it('reuses complete prompts written in non-Latin scripts', () => {
    const prompt = 'मुंबई के लिए मराठी शादी प्लानर वेबसाइट'

    expect(normalizedPromptForReuse(prompt)).toBe(prompt)
    expect(canReusePrefetchedPrompt(prompt, `${prompt}!!`)).toBe(true)
  })

  it('does not reuse when the prefetched prompt ends on an open phrase', () => {
    expect(canReusePrefetchedPrompt('a blog about', 'a blog about dogs')).toBe(
      false,
    )
  })

  it('reuses small non-disruptive appended qualifiers', () => {
    expect(
      canReusePrefetchedPrompt('a blog about dogs', 'a blog about dogs cute'),
    ).toBe(true)
    expect(
      canReusePrefetchedPrompt(
        'a blog about dogs',
        'a blog about dogs cute playful',
      ),
    ).toBe(true)
  })

  it('does not reuse disruptive prompt changes', () => {
    expect(
      canReusePrefetchedPrompt(
        'a blog about dogs',
        'a booking site for hotels',
      ),
    ).toBe(false)
    expect(
      canReusePrefetchedPrompt(
        'a blog about dogs',
        'a blog about enterprise kubernetes',
      ),
    ).toBe(false)
  })

  it('fingerprints non-prompt payload fields only', () => {
    expect(
      generationPayloadFingerprint({
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        designReferenceUrls: ['https://linear.app'],
      }),
    ).toBe(
      generationPayloadFingerprint({
        prompt: 'a blog about dogs cute',
        preferredLanguage: 'en',
        designReferenceUrls: ['https://linear.app'],
      }),
    )
    expect(
      generationPayloadFingerprint({
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        designReferenceUrls: ['https://linear.app'],
      }),
    ).not.toBe(
      generationPayloadFingerprint({
        prompt: 'a blog about dogs',
        preferredLanguage: 'fr',
        designReferenceUrls: ['https://linear.app'],
      }),
    )
  })

  it('blocks obvious repeated-token or low-variety gibberish before prefetch', () => {
    expect(isGibberishPromptClient('test test test test test')).toBe(true)
    expect(
      isGibberishPromptClient(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      ),
    ).toBe(true)
    expect(
      isGibberishPromptClient('a polished SaaS homepage for analytics'),
    ).toBe(false)
  })

  it('does not flag non-English prompts as gibberish', () => {
    expect(isGibberishPromptClient('मुंबई के लिए मराठी शादी प्लानर वेबसाइट')).toBe(false)
    expect(isGibberishPromptClient('为我的餐厅创建一个网站')).toBe(false)
    expect(isGibberishPromptClient('أنشئ موقعاً لمطعمي')).toBe(false)
  })

  it('flags single-char repeated gibberish', () => {
    expect(isGibberishPromptClient('x x x x x')).toBe(true)
    expect(isGibberishPromptClient('q q q q q q')).toBe(true)
  })

  it('allows short meaningful prompts', () => {
    expect(isGibberishPromptClient('dental clinic')).toBe(false)
    expect(isGibberishPromptClient('coffee shop')).toBe(false)
  })
})
