import { describe, expect, it } from 'vitest'

import {
  getDefaultFontForScript,
  isMixedEnglishIndicCode,
  isRomanizedIndicCode,
  isTranslatableLocale,
  KNOWN_LANGUAGES,
  lookupKnownLanguage,
  preferIndicBcp47FromRomanizedPrompt,
  preferMixedEnglishBcp47FromPrompt,
  preferMixedEnglishBcp47FromSnippet,
  preferRomanizedBcp47FromSnippet,
} from './config/languages'

describe('engine language catalog behavior', () => {
  it('exposes complete known language entries that generated prompts can render', () => {
    const codes = new Set()

    for (const language of KNOWN_LANGUAGES) {
      expect(typeof language.code).toBe('string')
      expect(language.code.length).toBeGreaterThan(0)
      expect(codes.has(language.code)).toBe(false)
      codes.add(language.code)

      expect(typeof language.name).toBe('string')
      expect(language.name.length).toBeGreaterThan(0)
      expect(typeof language.nativeName).toBe('string')
      expect(language.nativeName.length).toBeGreaterThan(0)
      expect(typeof language.fontFamily).toBe('string')
      expect(language.fontFamily.length).toBeGreaterThan(0)
      expect(Array.isArray(language.keywords)).toBe(true)
      expect(language.keywords.length).toBeGreaterThan(0)
    }

    expect(lookupKnownLanguage('hinglish')).toMatchObject({
      code: 'hinglish',
      skipFullTranslation: true,
    })
    expect(lookupKnownLanguage('ta-en')).toMatchObject({
      code: 'ta-en',
      skipFullTranslation: true,
    })
    expect(lookupKnownLanguage('ta-latn')).toMatchObject({
      code: 'ta-latn',
      fontFamily: 'Inter, system-ui, sans-serif',
    })
  })

  it('detects code-mixed and romanized language requests from user wording', () => {
    expect(
      preferMixedEnglishBcp47FromPrompt(
        'build a Tanglish launch page for students',
        'ta',
      ),
    ).toBe('ta-en')
    expect(preferMixedEnglishBcp47FromSnippet('make this in Manglish')).toBe(
      'ml-en',
    )
    expect(
      preferRomanizedBcp47FromSnippet(
        'write the whole site as Tamil in English letters',
      ),
    ).toBe('ta-latn')
    expect(
      preferIndicBcp47FromRomanizedPrompt(
        'oru course site venum inga students ku fast signup panna',
      ),
    ).toBe('ta')
  })

  it('classifies translation targets and script fonts without collapsing variants', () => {
    expect(isMixedEnglishIndicCode('hinglish')).toBe(true)
    expect(isMixedEnglishIndicCode('ta-en')).toBe(true)
    expect(isMixedEnglishIndicCode('hi-latn')).toBe(false)
    expect(isRomanizedIndicCode('hi-latn')).toBe(true)
    expect(isRomanizedIndicCode('hinglish')).toBe(false)

    expect(isTranslatableLocale('en')).toBe(false)
    expect(isTranslatableLocale('hi')).toBe(true)
    expect(isTranslatableLocale('hi-latn')).toBe(true)
    expect(isTranslatableLocale('ta-en')).toBe(true)
    expect(isTranslatableLocale('hinglish')).toBe(true)

    expect(getDefaultFontForScript('Tamil')).toBe('Noto Sans Tamil, sans-serif')
    expect(getDefaultFontForScript('Unknown Script')).toBe(
      'Inter, system-ui, sans-serif',
    )
  })
})
