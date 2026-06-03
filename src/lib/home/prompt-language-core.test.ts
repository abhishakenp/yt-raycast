import { describe, expect, it } from 'vitest'
import { detectSnippetLanguageBcp47 } from './prompt-language-core'

describe('detectSnippetLanguageBcp47', () => {
  it('detects short French prompts with accents as French', async () => {
    await expect(
      detectSnippetLanguageBcp47('Créer un site moderne pour une boutique française.'),
    ).resolves.toBe('fr')
  })

  it('detects longer French website briefs as French', async () => {
    await expect(
      detectSnippetLanguageBcp47(
        'Je veux créer une page d’accueil élégante pour un restaurant à Paris, avec menu, réservations, galerie, avis clients et formulaire de contact.',
      ),
    ).resolves.toBe('fr')
  })

  it('keeps mixed French and English prompts in French when the brief is mostly French', async () => {
    await expect(
      detectSnippetLanguageBcp47(
        'Créer un SaaS dashboard en français avec pricing, témoignages clients, FAQ et une page contact responsive.',
      ),
    ).resolves.toBe('fr')
  })
})
