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

  // Regression: a user who types "English" into the custom-language box gets
  // a Convex customLanguages row resolved as {code: "english", name: "English"}
  // — there's no "English" entry in KNOWN_LANGUAGES, so it falls through to
  // AI resolution. isTranslatableLocale's catch-all ad-hoc-locale regex
  // (`/^[a-z][a-z0-9-]{1,31}$/`) matched "english" same as any real locale,
  // so selecting it re-ran the full LLM translateBatch pipeline asking to
  // "translate" already-English text into English — a multi-second delay
  // and wasted API cost/cache pollution for what should be an instant no-op.
  it('treats the "english" custom-language code as untranslatable, same as "en"', () => {
    expect(isTranslatableLocale('english')).toBe(false)
    expect(isTranslatableLocale('English')).toBe(false)
    expect(isTranslatableLocale(' ENGLISH ')).toBe(false)
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
