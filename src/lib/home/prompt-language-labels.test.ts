// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import {
  detectBrowserLanguage,
  getBrowserLanguageCandidates,
  getGenerateCtaLabel,
  getLanguageDisplayName,
  getLogoTaglineText,
  normalizeLanguageCode,
} from './prompt-language-labels'

describe('prompt language labels', () => {
  it('normalizes base, regional, and mixed language codes', () => {
    expect(normalizeLanguageCode('es-MX')).toBe('es')
    expect(normalizeLanguageCode('ta-en')).toBe('ta-en')
    expect(normalizeLanguageCode('pt_BR')).toBe('pt')
    expect(normalizeLanguageCode('')).toBe('')
  })

  it('returns localized generate labels and logo taglines with sensible fallbacks', () => {
    expect(getGenerateCtaLabel('hi-IN')).toBe('बनाएं')
    expect(getGenerateCtaLabel('ta-en')).toBe('உருவாக்கு')
    expect(getGenerateCtaLabel('unknown')).toBe('Generate')
    expect(getLogoTaglineText('ja-JP')).toBe('迅速発送')
    expect(getLogoTaglineText('en')).toBe('')
  })

  it('uses Intl display names when available', () => {
    expect(getLanguageDisplayName('fr-FR').toLowerCase()).toContain('french')
  })

  it('dedupes browser language candidates and prefers supported non-English languages', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([
      'en-US',
      'es-MX',
      'es-ES',
    ])

    expect(getBrowserLanguageCandidates()).toEqual(['en', 'es'])
    expect(detectBrowserLanguage(new Set(['en', 'es', 'fr']))).toBe('es')
  })
})
