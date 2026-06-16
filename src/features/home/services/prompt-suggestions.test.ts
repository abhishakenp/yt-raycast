import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildLocalPromptSuggestions,
  getPromptSuggestionCacheKey,
  sanitizePromptSuggestions,
} from './prompt-suggestions'

describe('prompt suggestions', () => {
  it('never gates AI autocomplete behind an env var — always calls the API', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/home/components/HomePage.tsx'),
      'utf8',
    )

    expect(source).not.toContain('VITE_ENABLE_AI_PROMPT_SUGGESTIONS')
    expect(source).toContain("fetch('/api/prompt-suggestions'")
  })

  it('immediately completes blog prompts without a network dependency', () => {
    const suggestions = buildLocalPromptSuggestions('a blog about dogs')

    expect(suggestions).toHaveLength(4)
    expect(suggestions[0]).toContain('a blog about dogs with featured articles')
    expect(suggestions.every((suggestion) => suggestion.startsWith('a blog about dogs'))).toBe(true)
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
