import { describe, expect, it } from 'vitest'

import { transliterateLatinFallback } from './transliterate-latin-fallback'

describe('transliterateLatinFallback', () => {
  it('leaves non-Hindi locales byte-for-byte unchanged', () => {
    expect(transliterateLatinFallback('Chocolate Cake 24/7', 'fr-FR')).toBe(
      'Chocolate Cake 24/7',
    )
  })

  it('normalizes Hindi locale casing and separators', () => {
    expect(transliterateLatinFallback('Ship Fast', ' HI_in ')).toBe('शिप फ़स्ट')
  })

  it.each([
    ['Chocolate Cake', 'चॉकलेट केक'],
    ['Quick Phone', 'क्विक फ़ोन'],
  ])('preserves familiar pronunciation for %s', (source, expected) => {
    expect(transliterateLatinFallback(source, 'hi')).toBe(expected)
  })

  it('preserves punctuation and numbers around transliterated words', () => {
    expect(transliterateLatinFallback('Cake 24/7!', 'hi')).toBe('केक 24/7!')
  })

  it('does not leave Latin-script letters in accented names', () => {
    const result = transliterateLatinFallback('Café', 'hi')
    expect(result).not.toMatch(/\p{Script=Latin}/u)
  })
})
