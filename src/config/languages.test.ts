import { describe, expect, it } from 'vitest'

import {
  BROWSER_NATIVE_LANGUAGES,
  INDIAN_LANGUAGE_CODES,
  PROMPT_DETECT_LANGUAGES,
  isTranslatableLocale,
  lookupKnownLanguage,
} from './languages'

describe('language configuration', () => {
  it('treats Lithuanian as a browser-native translatable locale', () => {
    const lithuanian = lookupKnownLanguage('lt')

    expect(lithuanian).toMatchObject({
      code: 'lt',
      name: 'Lithuanian',
      nativeName: 'Lietuvių',
    })
    expect(isTranslatableLocale('lt')).toBe(true)
    expect(BROWSER_NATIVE_LANGUAGES.some((entry) => entry.code === 'lt')).toBe(
      true,
    )
  })

  it('keeps browser-native picker languages out of Indian/prompt detection sets', () => {
    expect(INDIAN_LANGUAGE_CODES.has('lt')).toBe(false)
    expect(PROMPT_DETECT_LANGUAGES.some((entry) => entry.code === 'lt')).toBe(
      false,
    )
  })
})
