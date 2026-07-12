import { describe, expect, it } from 'vitest'

import { stripNonAscii } from './transliteration-detect'

describe('stripNonAscii', () => {
  it('leaves an ASCII-only string unchanged', () => {
    expect(stripNonAscii('Hello World 123!')).toBe('Hello World 123!')
  })

  it('strips Malayalam Unicode characters and replaces them with spaces', () => {
    // "മലയാളം photo" — Malayalam script followed by ASCII
    expect(stripNonAscii('മലയാളം photo')).toBe('photo')
  })

  it('strips Tamil Unicode characters', () => {
    // "தமிழ் greeting card"
    expect(stripNonAscii('தமிழ் greeting card')).toBe('greeting card')
  })

  it('strips Devanagari Unicode characters', () => {
    // "नमस्ते world"
    expect(stripNonAscii('नमस्ते world')).toBe('world')
  })

  it('keeps only ASCII when mixed with non-ASCII', () => {
    expect(stripNonAscii('café résumé naïve')).toBe('caf r sum na ve')
  })

  it('returns empty string for empty input', () => {
    expect(stripNonAscii('')).toBe('')
  })

  it('collapses multiple whitespace into a single space', () => {
    expect(stripNonAscii('hello    world\t\tnice')).toBe('hello world nice')
  })

  it('trims leading and trailing whitespace', () => {
    expect(stripNonAscii('   hello world   ')).toBe('hello world')
  })

  it('replaces a fully non-ASCII string with empty after trim', () => {
    expect(stripNonAscii('മലയാളം')).toBe('')
  })

  it('strips control characters (outside 0x20-0x7E range)', () => {
    // null (0x00) and DEL (0x7F) are outside the printable ASCII range
    expect(stripNonAscii('a\x00b\x7Fc')).toBe('a b c')
  })

  it('preserves printable ASCII punctuation in range 0x20-0x7E', () => {
    expect(stripNonAscii('!@#$%^&*()_+-=[]{}|;:,.<>?/`~')).toBe(
      '!@#$%^&*()_+-=[]{}|;:,.<>?/`~',
    )
  })

  it('handles mixed non-ASCII scripts from multiple languages', () => {
    // Malayalam + Tamil + Devanagari + ASCII
    expect(stripNonAscii('മ coffee தமிழ் shop नमस्ते')).toBe('coffee shop')
  })
})
