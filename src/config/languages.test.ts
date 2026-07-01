import { describe, expect, it } from 'vitest'

import {
  INDIAN_LANGUAGE_CODES,
  KNOWN_LANGUAGES,
  PROMPT_DETECT_LANGUAGES,
  getDefaultFontForScript,
  isTranslatableLocale,
  lookupKnownLanguage,
  preferMixedEnglishBcp47FromPrompt,
  preferMixedEnglishBcp47FromSnippet,
  preferRomanizedBcp47FromSnippet,
} from './languages'

describe('language configuration', () => {
  it('allows native browser locale codes without hardcoding them into the picker list', () => {
    expect(lookupKnownLanguage('lt')).toBeNull()
    expect(isTranslatableLocale('lt')).toBe(true)
    expect(KNOWN_LANGUAGES.some((entry) => entry.code === 'lt')).toBe(false)
  })

  it('keeps browser-native ad-hoc languages out of Indian/prompt detection sets', () => {
    expect(INDIAN_LANGUAGE_CODES.has('lt')).toBe(false)
    expect(PROMPT_DETECT_LANGUAGES.some((entry) => entry.code === 'lt')).toBe(
      false,
    )
  })

  it('accepts regional and script locales for translation without adding them to the static picker', () => {
    expect(isTranslatableLocale('es-MX')).toBe(true)
    expect(isTranslatableLocale('zh-Hant')).toBe(true)
    expect(isTranslatableLocale('pt-BR')).toBe(true)
    expect(isTranslatableLocale('en')).toBe(false)

    expect(lookupKnownLanguage('es-MX')).toBeNull()
    expect(lookupKnownLanguage('zh-Hant')).toBeNull()
  })

  it('resolves code-mixed and romanized language hints from natural prompts', () => {
    expect(
      preferMixedEnglishBcp47FromPrompt(
        'Build a Tamil English mix wedding planner site',
        'ta',
      ),
    ).toBe('ta-en')
    expect(preferMixedEnglishBcp47FromSnippet('Make this in Manglish')).toBe(
      'ml-en',
    )
    expect(
      preferRomanizedBcp47FromSnippet(
        'Write Malayalam in English script for NRI parents',
      ),
    ).toBe('ml-latn')
  })

  it('returns script-aware fonts and falls back to the system Latin stack', () => {
    expect(getDefaultFontForScript('Devanagari')).toContain(
      'Noto Sans Devanagari',
    )
    expect(getDefaultFontForScript('Han')).toContain('Noto Sans SC')
    expect(getDefaultFontForScript('Unknown Script')).toBe(
      'Inter, system-ui, sans-serif',
    )
  })
})
