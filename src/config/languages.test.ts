import { describe, expect, it } from 'vitest'

import {
  INDIAN_LANGUAGE_CODES,
  KNOWN_LANGUAGES,
  PROMPT_DETECT_LANGUAGES,
  isTranslatableLocale,
  lookupKnownLanguage,
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
})
