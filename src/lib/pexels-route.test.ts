import { describe, expect, it } from 'vitest'

import { resolvePexelsSearchQuery } from '../features/images/server/pexels-preview-image'
import { stripNonAscii } from './transliteration-detect'

describe('/api/pexels query resolution', () => {
  it('derives semantic stock queries for raw prompt text', () => {
    expect(
      resolvePexelsSearchQuery(
        'Elegant dental clinic waiting room with patients',
        null,
      ),
    ).toBe('medical clinic healthcare dental waiting room patients')
  })

  it('keeps pre-resolved generated image queries stable when a seed is present', () => {
    expect(
      resolvePexelsSearchQuery(
        'medical clinic healthcare dental waiting room patients',
        'Elegant dental clinic waiting room with patients',
      ),
    ).toBe('medical clinic healthcare dental waiting room patients')
  })
})

describe('stripNonAscii', () => {
  it('strips Malayalam Unicode characters, keeps ASCII', () => {
    // Malayalam Unicode for "Ani Chandran" — should strip to empty/ASCII
    const malayalam = 'അനി ചന്ദ്രൻ'
    expect(stripNonAscii(malayalam)).toBe('')
  })

  it('strips non-ASCII from mixed queries, preserves English words', () => {
    const mixed = 'onam സരിക്ക് shopping'
    expect(stripNonAscii(mixed)).toBe('onam shopping')
  })

  it('preserves pure ASCII queries unchanged', () => {
    expect(stripNonAscii('onam festive shopping collage')).toBe(
      'onam festive shopping collage',
    )
  })

  it('collapses multiple spaces left by stripped characters', () => {
    expect(stripNonAscii('festival  ഓണം  celebration')).toBe(
      'festival celebration',
    )
  })
})
