import { describe, it, expect } from 'bun:test'
import {
  buildImageSearchQuery,
  extractDomainHint,
} from './image-search-query'

describe('extractDomainHint', () => {
  it('leads with the domain nouns, dropping prompt scaffolding', () => {
    expect(
      extractDomainHint({
        prompt: 'Create a website for a dental clinic in Mumbai with appointment booking',
      }),
    ).toBe('dental clinic mumbai')
  })

  it('ignores generic web words', () => {
    expect(
      extractDomainHint({ prompt: 'a modern landing page for an online platform' }),
    ).toBe('')
  })

  it('includes brand context ahead of the prompt', () => {
    expect(
      extractDomainHint({
        brandContext: 'Amul organic dairy',
        prompt: 'fresh milk and paneer',
      }),
    ).toBe('amul organic dairy')
  })
})

describe('buildImageSearchQuery', () => {
  it('returns the base query unchanged when there is no context', () => {
    expect(buildImageSearchQuery('hero image', 'hero', undefined)).toBe('hero')
    expect(buildImageSearchQuery('hero image', 'hero', {})).toBe('hero')
  })

  it('leads a generic alt with the prompt domain', () => {
    const q = buildImageSearchQuery('hero image', 'hero', {
      prompt: 'Create a website for a dental clinic in Mumbai',
    })
    expect(q).toBe('dental clinic mumbai hero')
  })

  it('corrects a mismatched capsule-default alt with the domain (domain leads)', () => {
    // The old engine kept "artist desk watercolor" and ignored the dairy domain.
    const q = buildImageSearchQuery(
      'Artist desk covered in vibrant watercolor sketches',
      'artist desk vibrant watercolor sketches',
      { prompt: 'organic dairy farm selling fresh milk paneer and butter' },
    )
    // Domain leads, so Pexels biases toward dairy instead of the wrong alt.
    expect(q.startsWith('organic dairy')).toBe(true)
  })

  it('keeps a specific alt subject and adds a short domain anchor', () => {
    const q = buildImageSearchQuery(
      'Doctor consulting a patient on a telehealth video call',
      'doctor consulting patient telehealth video call',
      { prompt: 'telehealth platform for online doctor consultations' },
    )
    expect(q).toContain('doctor')
    expect(q).toContain('telehealth')
  })

  it('does NOT misfire on academy/coaching keywords (no per-vertical regex)', () => {
    // The old engine turned this into "students studying classroom".
    const q = buildImageSearchQuery('gallery image', 'gallery', {
      prompt: 'bharatanatyam classical dance academy',
    })
    expect(q.startsWith('bharatanatyam')).toBe(true)
    expect(q).not.toContain('students')
    expect(q).not.toContain('classroom')
  })

  it('caps length for the API', () => {
    const q = buildImageSearchQuery(
      'a very long descriptive alt text about many things',
      'very long descriptive alt text about many things subject matter extra',
      { prompt: 'luxury bridal saree boutique in jaipur with ethnic wear collection' },
    )
    expect(q.length).toBeLessThanOrEqual(96)
  })
})
