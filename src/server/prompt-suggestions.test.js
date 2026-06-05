import { describe, expect, it } from 'vitest'
import {
  getFallbackPromptSuggestions,
  normalizePromptSuggestionLanguage,
} from './prompt-suggestions.js'

function expectExactPrefix(rows, partial) {
  expect(rows.length).toBeGreaterThan(0)
  for (const row of rows) {
    expect(row.startsWith(partial)).toBe(true)
  }
}

describe('prompt suggestion fallbacks', () => {
  it('normalizes selected language values', () => {
    expect(normalizePromptSuggestionLanguage('hi-IN')).toBe('hi')
    expect(normalizePromptSuggestionLanguage('hinglish')).toBe('hinglish')
    expect(normalizePromptSuggestionLanguage('hi-en')).toBe('hinglish')
    expect(normalizePromptSuggestionLanguage('../bad')).toBe('')
  })

  it('returns exact-prefix English suggestions without a model', () => {
    const partial = 'A gym'
    const rows = getFallbackPromptSuggestions(partial, 'en')
    expectExactPrefix(rows, partial)
    expect(rows[0]).toContain('modern homepage')
  })

  it('returns Hindi suggestions for Devanagari partials', () => {
    const partial = 'मेरे जिम'
    const rows = getFallbackPromptSuggestions(partial, 'hi')
    expectExactPrefix(rows, partial)
    expect(rows[0]).toMatch(/[क-ह]/)
  })

  it('infers Hinglish from Latin Hindi markers when the selected language is English', () => {
    const partial = 'Mere gym'
    const rows = getFallbackPromptSuggestions(partial, 'en')
    expectExactPrefix(rows, partial)
    expect(rows[0]).toContain('ke liye')
  })

  it('keeps Tamil completions in Tamil script', () => {
    const partial = 'என் ஜிம்'
    const rows = getFallbackPromptSuggestions(partial, 'ta')
    expectExactPrefix(rows, partial)
    expect(rows[0]).toMatch(/[\u0b80-\u0bff]/)
  })

  it('does not insert duplicate whitespace after a trailing-space partial', () => {
    const partial = 'Créer '
    const rows = getFallbackPromptSuggestions(partial, 'fr')
    expectExactPrefix(rows, partial.trim())
    expect(rows[0]).not.toContain('  ')
  })
})
