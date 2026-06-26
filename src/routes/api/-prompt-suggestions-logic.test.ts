import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { getFallbackPromptSuggestions } from './-prompt-suggestions-logic.js'

describe('getFallbackPromptSuggestions', () => {
  it('keeps engine/Groq code behind dynamic imports for the homepage bundle', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/routes/api/-prompt-suggestions-logic.js'),
      'utf8',
    )

    expect(source).not.toContain('import { GROQ_API_KEY }')
    expect(source).not.toContain('import { groq }')
    expect(source).toContain("import('@ship-fast/engine/llm/groq.js')")
  })

  it('keeps an English dog-blog prefix in English even on localized browsers', () => {
    const suggestions = getFallbackPromptSuggestions('a blog about dogs', 'en')

    expect(suggestions[0]).toBe(
      'a blog about dogs for a modern homepage with a clear hero, benefits, pricing, testimonials, and a fast contact flow.',
    )
  })

  it('still infers French from a French partial when no non-English UI language is selected', () => {
    const suggestions = getFallbackPromptSuggestions(
      'Créer un site moderne pour une boutique française avec réservations',
      'en',
    )

    expect(suggestions[0]).toContain('pour une page d’accueil moderne')
  })
})
