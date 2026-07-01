import { describe, expect, it } from 'vitest'

import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from './image-query'

describe('image query helpers', () => {
  it('turns descriptive alt text into compact stock search queries', () => {
    expect(
      searchQueryFromAlt('Beautiful office workspace for a fintech team'),
    ).toBe('modern office workspace fintech team')
    expect(searchQueryFromAlt('')).toBe('nature')
  })

  it('creates deterministic fallback image URLs from alt text', () => {
    expect(slugifyAlt('Hero: Coffee & Croissants!')).toBe(
      'hero-coffee-croissants',
    )
    expect(seedFromAlt('same')).toBe(seedFromAlt('same'))
    expect(picsumUrl('Hero: Coffee & Croissants!', 640, 360)).toBe(
      'https://picsum.photos/seed/hero-coffee-croissants/640/360',
    )
  })

  it('classifies image orientation from dimensions', () => {
    expect(orientationFromSize(1200, 600)).toBe('landscape')
    expect(orientationFromSize(600, 1200)).toBe('portrait')
    expect(orientationFromSize(900, 900)).toBe('square')
  })
})
