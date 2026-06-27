import { describe, expect, it } from 'vitest'

import { resolvePexelsSearchQuery } from '../routes/api/pexels'

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
