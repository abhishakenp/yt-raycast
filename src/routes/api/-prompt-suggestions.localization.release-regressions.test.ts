import { describe, expect, it } from 'vitest'

import {
  getFallbackPromptSuggestions,
  normalizePromptSuggestionLanguage,
} from './-prompt-suggestions-logic.js'

describe('prompt suggestion localization release behavior', () => {
  it.each([
    ['ja', '手作り陶器のオンラインショップ'],
    ['zh', '手工陶瓷网上商店'],
    ['ko', '수제 도자기 온라인 상점'],
  ])(
    'keeps %s fallback completions in the requested script',
    function keepsRequestedScript(language, partial) {
      const suggestions = getFallbackPromptSuggestions(partial, language)

      expect(suggestions).toHaveLength(4)
      for (const suggestion of suggestions) {
        expect(suggestion.startsWith(partial)).toBe(true)
        expect(suggestion.slice(partial.length)).not.toMatch(/[A-Za-z]/)
      }
    },
  )

  it('keeps Arabic fallback completions in Arabic script', () => {
    const partial = 'متجر إلكتروني للخزف المصنوع يدويا'
    const suggestions = getFallbackPromptSuggestions(partial, 'ar')

    expect(suggestions).toHaveLength(4)
    for (const suggestion of suggestions) {
      expect(suggestion.startsWith(partial)).toBe(true)
      expect(suggestion.slice(partial.length)).not.toMatch(/[A-Za-z]/)
    }
  })

  it('normalizes regional language tags without changing their base language', () => {
    expect(normalizePromptSuggestionLanguage('JA-jp')).toBe('ja')
    expect(normalizePromptSuggestionLanguage('ZH_CN')).toBe('zh')
    expect(normalizePromptSuggestionLanguage('KO-kr')).toBe('ko')
    expect(normalizePromptSuggestionLanguage('AR-sa')).toBe('ar')
  })
})
