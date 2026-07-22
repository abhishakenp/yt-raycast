import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  resolvePipelineLanguage,
  withLanguageEnforcementBlock,
} from './prompt-language'

function makeWorkspace(preferredLanguage: string): string {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-language-'))
  writeFileSync(
    join(workspace, '.session.json'),
    JSON.stringify({ preferredLanguage }, null, 2),
  )
  return workspace
}

describe('pipeline prompt language enforcement', () => {
  const romanizedMalayalamBrief =
    'oru marketing compny de website undaakuka, athil services list, client success stories, blog section okke include cheyyuka; target audience small business owners aanu, design sleek, colors brandine reflect cheyyunna professional tone with clear CTA buttons.'

  it('uses workspace preferred language when runAll does not receive one', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a landing page for a school',
      workspace: makeWorkspace('hi-latn'),
    })

    expect(mode.code).toBe('hi-latn')
    expect(mode.script).toBe('Latin')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).toContain('closest natural English equivalents')
    expect(mode.prompt).not.toContain('hi-latn')
  })

  it('preserves code-mixed language variants instead of collapsing them to the base code', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a food truck website',
      preferredLanguage: 'ta-en',
    })

    expect(mode.code).toBe('ta-en')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('ta-en')
  })

  it('detects romanized requests from the prompt when no explicit preference exists', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a roman hindi site for a travel agency',
      workspace: makeWorkspace('en'),
    })

    expect(mode.code).toBe('hi-latn')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('hi-latn')
  })

  it('detects explicit native language requests from the prompt without provider fallback', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a Hindi website for a school admissions team',
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('hi')
    expect(mode.name).toBe('Hindi')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('server language code')
  })

  it('detects Hinglish and code-mixed requests from prompt keywords', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a Hindi English mix food delivery landing page',
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('hinglish')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('hinglish')
  })

  it('detects romanized Malayalam prompts even when the default dropdown submits English', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: romanizedMalayalamBrief,
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('ml')
    expect(mode.name).toBe('Malayalam')
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('server language code')
  })

  it('keeps English prompts explicitly constrained to English', () => {
    const prompt = withLanguageEnforcementBlock('Build a SaaS homepage', {
      code: 'en',
      name: 'English',
    })

    expect(prompt).toContain('English only')
    expect(prompt).not.toContain('server language code')
  })

  it('adds English-only generation constraints for localized sessions', () => {
    const prompt = withLanguageEnforcementBlock('Build a utility homepage', {
      code: 'ml',
      name: 'Malayalam',
    })

    expect(prompt).toContain('native-speaker quality')
    expect(prompt).toContain('closest natural English equivalents')
    expect(prompt).toContain('Do not output native-script')
    expect(prompt).not.toContain('Malayalam')
    expect(prompt).toContain('Do not use placeholder filenames')
    expect(prompt).toContain('logo1.png')
  })

  // ── Malayalam romanized detection regression suite ────────────────
  // Ensures the engine pipeline detects romanized Malayalam prompts
  // (Manglish) across a range of prompt lengths and styles, while the
  // generator prompt remains English-only and localization happens later.

  describe('romanized Malayalam detection (Manglish)', () => {
    const romanizedCases = [
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
      'oru modern website undaakuka with sleek design and clear CTA',
      'oru school website undaakuka with teachers list and classes',
    ]

    for (const prompt of romanizedCases) {
      it(`detects romanized Malayalam: "${prompt.slice(0, 50)}…"`, async () => {
        const mode = await resolvePipelineLanguage({
          prompt,
          preferredLanguage: 'en',
        })
        expect(mode.code).toBe('ml')
        expect(mode.name).toBe('Malayalam')
        expect(mode.prompt).toContain('English only')
        expect(mode.prompt).not.toContain('server language code')
      })
    }
  })

  describe('native-script Malayalam detection', () => {
    const nativeCases = [
      'എന്റെ ബേക്കറിക്കായി ഒരു വെബ്സൈറ്റ് ഉണ്ടാക്കുക',
      'ഒരു റെസ്റ്റോറന്റ് വെബ്സൈറ്റ് ഉണ്ടാക്കുക, മെനു, ബുക്കിംഗ്, ഗാലറി എന്നിവ ഉൾപ്പെടുത്തുക',
    ]

    for (const prompt of nativeCases) {
      it(`detects native-script Malayalam: "${prompt.slice(0, 30)}…"`, async () => {
        const mode = await resolvePipelineLanguage({
          prompt,
          preferredLanguage: 'en',
        })
        expect(mode.code).toBe('ml')
        expect(mode.name).toBe('Malayalam')
      })
    }
  })

  describe('Malayalam misspelling detection', () => {
    // Users frequently misspell "malayalam" in real prompts. The keyword
    // matcher must catch common typos so the pipeline still detects Malayalam.
    const misspellingCases = [
      'coffee shop in malyalam with a premium storefront, product collections, featured bundles, reviews, cart-ready calls to action, and trust badges.',
      'coffee shop in malyalam with a premium storefront',
      'coffee shop in malayalm with a premium storefront',
      'coffee shop in malyalm with a premium storefront',
      'coffee shop in malylam with a premium storefront',
      'coffee shop in mallayalam with a premium storefront',
      'malyalam website for my bakery',
      'malayalm website for my bakery',
      'in malyalam',
      'in malayalm',
    ]

    for (const prompt of misspellingCases) {
      it(`detects misspelled "malayalam": "${prompt.slice(0, 50)}…"`, async () => {
        const mode = await resolvePipelineLanguage({
          prompt,
          preferredLanguage: 'en',
        })
        expect(mode.code).toBe('ml')
        expect(mode.name).toBe('Malayalam')
      })
    }
  })

  describe('Malayalam not confused with other languages', () => {
    it('does not detect Hindi prompts as Malayalam', async () => {
      const mode = await resolvePipelineLanguage({
        prompt: 'mere gym ke liye website banao',
        preferredLanguage: 'en',
      })
      expect(mode.code).not.toBe('ml')
    })

    it('does not detect English prompts as Malayalam', async () => {
      const mode = await resolvePipelineLanguage({
        prompt: 'Build a SaaS dashboard with charts and responsive cards',
        preferredLanguage: 'en',
      })
      expect(mode.code).not.toBe('ml')
    })
  })
})
