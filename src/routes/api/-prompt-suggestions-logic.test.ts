import { describe, expect, it } from 'vitest'

import { getFallbackPromptSuggestions } from './-prompt-suggestions-logic.js'

describe('getFallbackPromptSuggestions', () => {
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
