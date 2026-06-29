import { describe, expect, it } from 'vitest'

import {
  buildLocalPromptSuggestions,
  getPromptSuggestionCacheKey,
  sanitizePromptSuggestions,
} from './prompt-suggestions'

describe('prompt suggestions', () => {
  it('immediately completes blog prompts without a network dependency', () => {
    const suggestions = buildLocalPromptSuggestions('a blog about dogs')

    expect(suggestions).toHaveLength(4)
    expect(suggestions[0]).toContain('a blog about dogs with featured articles')
    expect(
      suggestions.every((suggestion) =>
        suggestion.startsWith('a blog about dogs'),
      ),
    ).toBe(true)
  })

  it('keeps only safe prefix-preserving cached suggestions', () => {
    const suggestions = sanitizePromptSuggestions(
      [
        'a blog about dogs with breed guides and adoption resources',
        'wrong prefix with breed guides',
        'a blog about dogs with breed guides and adoption resources',
      ],
      'a blog about dogs',
    )

    expect(suggestions).toEqual([
      'a blog about dogs with breed guides and adoption resources',
    ])
  })

  it('keys cached suggestions by language and normalized partial', () => {
    expect(getPromptSuggestionCacheKey('  A   blog about dogs ', 'EN')).toBe(
      'ship-fast:prompt-suggestions:en:a blog about dogs',
    )
  })
})

describe('prompt suggestions — behavioral regression guards', () => {
  it('empty partial returns empty array (length < MIN)', () => {
    // normalizePartial("") => "" => length 0 < 2 => []
    expect(buildLocalPromptSuggestions('')).toEqual([])
  })

  it('whitespace-only partial returns empty array (normalizes to empty)', () => {
    // normalizePartial("   ") => "" => length 0 < 2 => []
    expect(buildLocalPromptSuggestions('   ')).toEqual([])
  })

  it('very long partial (>480 chars) returns empty array', () => {
    const long = 'a'.repeat(500)
    expect(buildLocalPromptSuggestions(long)).toEqual([])
  })

  it('commerce keyword inference: "shop" yields commerce tails', () => {
    const suggestions = buildLocalPromptSuggestions('shop')
    expect(suggestions).toHaveLength(4)
    expect(suggestions.some((s) => /storefront|product|checkout/.test(s))).toBe(
      true,
    )
  })

  it('app keyword inference: "saas" yields app tails', () => {
    const suggestions = buildLocalPromptSuggestions('saas')
    expect(suggestions).toHaveLength(4)
    expect(suggestions.some((s) => /SaaS|dashboard|pricing/.test(s))).toBe(true)
  })

  it('portfolio keyword inference: "portfolio" yields portfolio tails', () => {
    const suggestions = buildLocalPromptSuggestions('portfolio')
    expect(suggestions).toHaveLength(4)
    expect(suggestions.some((s) => /portfolio|project|case/.test(s))).toBe(true)
  })

  it('generic fallback when no keyword matches: "xyz random" yields generic tails', () => {
    const suggestions = buildLocalPromptSuggestions('xyz random')
    expect(suggestions).toHaveLength(4)
    expect(suggestions.some((s) => /hero|navigation/.test(s))).toBe(true)
  })

  it('sanitizePromptSuggestions rejects non-string values', () => {
    // "valid" is the only string but length 5 < p.length(5) + MIN_TAIL(6) = 11,
    // so it is filtered out by the minimum-tail guard => []
    const result = sanitizePromptSuggestions(
      [null, 123, {}, 'valid'] as unknown[],
      'valid',
    )
    expect(result).toEqual([])
  })

  it('sanitizePromptSuggestions dedupes case-insensitively', () => {
    // "Build a site" starts with "Build" (case-sensitive startsWith) and passes
    // the min-tail guard (length 12 >= 5+6=11). "build a site" does NOT start
    // with "Build" so it is filtered before dedup even applies => 1 result.
    const result = sanitizePromptSuggestions(
      ['Build a site', 'build a site'],
      'Build',
    )
    expect(result).toHaveLength(1)
    expect(result).toEqual(['Build a site'])
  })
})
