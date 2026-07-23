import { describe, expect, it } from 'vitest'
import { detectSnippetLanguageBcp47 } from './prompt-language-core'
import { preferIndicBcp47FromRomanizedPrompt } from '@/config/languages'

describe('detectSnippetLanguageBcp47', () => {
  const romanizedMalayalamBrief =
    'oru marketing compny de website undaakuka, athil services list, client success stories, blog section okke include cheyyuka; target audience small business owners aanu, design sleek, colors brandine reflect cheyyunna professional tone with clear CTA buttons.'

  it('detects short explicit language requests', async () => {
    await expect(
      detectSnippetLanguageBcp47('Build a Hindi website'),
    ).resolves.toBe('hi')
  })

  // ── ISO-code collision regression ─────────────────────────────────
  // Two-letter language codes ('as', 'or', 'no', 'it', 'id', 'ne', 'hi',
  // 'pa', 'ta') are common English words. They must NOT be treated as an
  // explicit language request. Regression for: "dog blog post with cats as
  // their friends not enemies" wrongly detected as Assamese.
  describe('English prompts containing words that collide with ISO codes', () => {
    const cases = [
      'dog blog post with cats as their friends not enemies',
      'a landing page, no signup required, clean and modern',
      'a store with products or services and a contact form',
      'a portfolio site, it should feel bold and minimal',
      'do not add tracking or analytics to the site',
    ]

    for (const prompt of cases) {
      it(`stays English: "${prompt.slice(0, 48)}…"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('en')
      })
    }
  })

  it('detects romanized Malayalam website briefs as Malayalam', async () => {
    await expect(
      detectSnippetLanguageBcp47(romanizedMalayalamBrief),
    ).resolves.toBe('ml')
  })

  it('detects short French prompts with accents as French', async () => {
    await expect(
      detectSnippetLanguageBcp47(
        'Créer un site moderne pour une boutique française.',
      ),
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

  it('does not treat browser-native picker labels as prompt language requests', async () => {
    await expect(
      detectSnippetLanguageBcp47(
        'Build a Mexican restaurant website with menu, booking, gallery, and customer reviews.',
      ),
    ).resolves.toBe('en')
  })

  // ── Malayalam detection regression suite ──────────────────────────
  // These cover native script, explicit keyword, romanized (Manglish),
  // and mixed English+Malayalam prompts. All must resolve to 'ml' or
  // 'ml-en' so the homepage dropdown auto-selects Malayalam.

  describe('Malayalam detection — native script', () => {
    const cases = [
      'എന്റെ ബേക്കറിക്കായി ഒരു വെബ്സൈറ്റ് ഉണ്ടാക്കുക',
      'ഒരു റെസ്റ്റോറന്റ് വെബ്സൈറ്റ് ഉണ്ടാക്കുക, മെനു, ബുക്കിംഗ്, ഗാലറി എന്നിവ ഉൾപ്പെടുത്തുക',
      'മലയാളം വെബ്സൈറ്റ്',
      'ഒരു സ്കൂൾ വെബ്സൈറ്റ് ഉണ്ടാക്കുക, അധ്യാപകർ, ക്ലാസുകൾ എന്നിവ ഉൾപ്പെടുത്തുക',
    ]

    for (const prompt of cases) {
      it(`detects native-script Malayalam: "${prompt.slice(0, 40)}…"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('ml')
      })
    }
  })

  describe('Malayalam detection — explicit keyword', () => {
    const cases = [
      'Build a Malayalam website for my bakery',
      'malayalam website for bakery',
      'Make a website in malayalam',
      'Create a malayalam language website for a restaurant',
      'Build a site in malayalam for my school',
    ]

    for (const prompt of cases) {
      it(`detects explicit "malayalam" keyword: "${prompt}"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('ml')
      })
    }
  })

  describe('Malayalam detection — common misspellings of "malayalam"', () => {
    // Users frequently misspell "malayalam" — these are real typos observed
    // in production prompts. The keyword matcher must catch them so the
    // dropdown auto-selects Malayalam instead of defaulting to English.
    const cases = [
      'coffee shop in malyalam with a premium storefront, product collections, featured bundles, reviews, cart-ready calls to action, and trust badges.',
      'coffee shop in malyalam with a premium storefront',
      'coffee shop in malayalm with a premium storefront',
      'coffee shop in malyalm with a premium storefront',
      'coffee shop in malylam with a premium storefront',
      'coffee shop in mallayalam with a premium storefront',
      'coffee shop in malyalam',
      'coffee shop in malayalm',
      'malyalam website for my bakery',
      'malayalm website for my bakery',
      'in malyalam',
      'in malayalm',
      'in malyalm',
      'in malylam',
      'in mallayalam',
    ]

    for (const prompt of cases) {
      it(`detects misspelled "malayalam": "${prompt.slice(0, 60)}"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('ml')
      })
    }
  })

  describe('Malayalam detection — romanized (Manglish) short prompts', () => {
    const cases = [
      'oru restaurant website undaakuka menu booking gallery okke',
      'ente bakery oru website venam',
      'oru blog website undaakuka articles okke',
      'school website undaakuka, teachers, classes okke',
      'oru gym website, membership plans okke',
      'oru marketing company website, services list okke',
      'bakery website undaakuka, oru modern design venam',
      'nalla oru website undaakuka',
      'oru website undaakuka',
      'enthokke include cheyyanam',
      'oru school website undaakuka, teachers list okke',
    ]

    for (const prompt of cases) {
      it(`detects romanized Malayalam: "${prompt}"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('ml')
      })
    }
  })

  describe('Malayalam detection — romanized mixed with English', () => {
    const cases = [
      'oru modern website undaakuka with sleek design and clear CTA',
      'oru school website undaakuka with teachers list and classes',
      'bakery website undaakuka, modern design venam, with online ordering',
      'oru restaurant website undaakuka, menu, booking, gallery okke include cheyyuka',
    ]

    for (const prompt of cases) {
      it(`detects romanized Malayalam mixed with English: "${prompt.slice(0, 50)}…"`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe('ml')
      })
    }
  })

  describe('Malayalam detection — Manglish keyword', () => {
    it('detects "manglish" as Malayalam+English mix', async () => {
      await expect(
        detectSnippetLanguageBcp47('oru manglish website for my bakery'),
      ).resolves.toBe('ml-en')
    })
  })

  describe('Malayalam detection — does not false-positive on other languages', () => {
    const cases: Array<[string, string]> = [
      ['Build a SaaS dashboard with charts and responsive cards', 'en'],
      ['Create a clean landing page for a pet wellness app', 'en'],
      ['mere gym ke liye website banao', 'hi'],
      ['Créer un site moderne pour une boutique française.', 'fr'],
    ]

    for (const [prompt, expected] of cases) {
      it(`does not detect "${prompt.slice(0, 40)}…" as Malayalam (expects ${expected})`, async () => {
        await expect(detectSnippetLanguageBcp47(prompt)).resolves.toBe(expected)
      })
    }
  })

  // ── preferIndicBcp47FromRomanizedPrompt unit tests ────────────────
  // Directly tests the hint-matching function that powers romanized
  // Malayalam detection, independent of franc and other heuristics.

  describe('preferIndicBcp47FromRomanizedPrompt — Malayalam hints', () => {
    const cases = [
      'oru restaurant website undaakuka menu booking gallery okke',
      'ente bakery oru website venam',
      'school website undaakuka, teachers, classes okke',
      'oru gym website, membership plans okke',
      'oru website undaakuka',
      'nalla oru website undaakuka',
      'enthokke include cheyyanam',
    ]

    for (const prompt of cases) {
      it(`matches Malayalam hints for: "${prompt}"`, () => {
        expect(preferIndicBcp47FromRomanizedPrompt(prompt)).toBe('ml')
      })
    }

    it('does not match Malayalam for pure English prompts', () => {
      expect(
        preferIndicBcp47FromRomanizedPrompt(
          'Build a SaaS dashboard with charts and responsive cards',
        ),
      ).toBeNull()
    })

    it('does not match Malayalam for Hindi prompts', () => {
      expect(
        preferIndicBcp47FromRomanizedPrompt('mere gym ke liye website banao'),
      ).toBe('hi')
    })

    it('does not match Malayalam for Tamil-only prompts', () => {
      expect(
        preferIndicBcp47FromRomanizedPrompt(
          'oru website irukku, seyyunga panna',
        ),
      ).toBe('ta')
    })

    it('returns null for prompts with fewer than 3 words', () => {
      expect(
        preferIndicBcp47FromRomanizedPrompt('website undaakuka'),
      ).toBeNull()
      expect(preferIndicBcp47FromRomanizedPrompt('oru website')).toBeNull()
    })

    it('returns null for ambiguous single-hit prompts', () => {
      // "oru" is shared between Tamil and Malayalam — alone it's ambiguous
      expect(preferIndicBcp47FromRomanizedPrompt('oru blog website')).toBeNull()
    })
  })
})
