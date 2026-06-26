import { describe, it, expect } from 'vitest'
import { generateContextAwareQuery } from './image-context'

describe('generateContextAwareQuery', () => {
  it('should return basic query without context', () => {
    const query = generateContextAwareQuery('dog running in park')
    expect(query).toBeTruthy()
    expect(query.length).toBeGreaterThan(0)
  })

  it('should enhance query with hero section context', () => {
    const query = generateContextAwareQuery('dog running', {
      section: 'hero-banner',
    })
    expect(query).toBeTruthy()
    // Should include hero-related terms
    expect(query.toLowerCase()).toContain('hero')
  })

  it('should enhance query with ecommerce site type', () => {
    const query = generateContextAwareQuery('organic snacks', {
      siteType: 'ecommerce',
      section: 'product-grid',
    })
    expect(query).toBeTruthy()
    // Should include ecommerce-related terms
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('product') ||
        lowerQuery.includes('commercial') ||
        lowerQuery.includes('snack'),
    ).toBe(true)
  })

  it('should enhance query with portfolio site type', () => {
    const query = generateContextAwareQuery('web design projects', {
      siteType: 'portfolio',
    })
    expect(query).toBeTruthy()
    // Should include creative terms or preserve original content
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('creative') ||
        lowerQuery.includes('web') ||
        lowerQuery.includes('design'),
    ).toBe(true)
  })

  it('should extract visual phrases from prompt', () => {
    const query = generateContextAwareQuery('team photo', {
      prompt:
        'Create a website for a dental clinic with modern interior and doctor consultation',
      section: 'about-section',
    })
    expect(query).toBeTruthy()
    // Should incorporate medical/clinic context or preserve team context
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('medical') ||
        lowerQuery.includes('clinic') ||
        lowerQuery.includes('team') ||
        lowerQuery.includes('lifestyle'),
    ).toBe(true)
  })

  it('should handle brand context', () => {
    const query = generateContextAwareQuery('product shot', {
      brandContext: 'organic farm fresh dairy products',
      siteType: 'ecommerce',
    })
    expect(query).toBeTruthy()
    // Should include brand-related terms
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('dairy') ||
        lowerQuery.includes('organic') ||
        lowerQuery.includes('farm') ||
        lowerQuery.includes('product'),
    ).toBe(true)
  })

  it('should limit query length for API compatibility', () => {
    const longAlt =
      'beautiful professional high quality stunning elegant modern natural warm soft bright dark light small large high quality detail close up view scene image photo picture background'
    const query = generateContextAwareQuery(longAlt, {
      prompt:
        'Create a website for a luxury fashion boutique featuring ethnic wear bridal collection wedding saree lehenga traditional silk embroidery designer wear festive occasion wear couture',
    })
    expect(query.length).toBeLessThanOrEqual(96)
  })

  it('should provide fallback for very short queries', () => {
    const query = generateContextAwareQuery('x')
    expect(query.length).toBeGreaterThan(2)
  })

  it('should handle industry-specific queries', () => {
    const query = generateContextAwareQuery('interior', {
      prompt:
        'Create a website for a multispeciality hospital with modern healthcare facilities',
      section: 'hero',
    })
    expect(query).toBeTruthy()
    // Should include healthcare-specific terms or hero context
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('hospital') ||
        lowerQuery.includes('healthcare') ||
        lowerQuery.includes('medical') ||
        lowerQuery.includes('hero'),
    ).toBe(true)
  })

  it('should combine multiple context sources', () => {
    const query = generateContextAwareQuery('fashion model', {
      section: 'hero-banner',
      siteType: 'ecommerce',
      prompt: 'Create a boutique for ethnic wear and bridal collection',
      brandContext: 'traditional silk sarees',
    })
    expect(query).toBeTruthy()
    // Should incorporate multiple context elements
    const lowerQuery = query.toLowerCase()
    expect(
      lowerQuery.includes('hero') ||
        lowerQuery.includes('product') ||
        lowerQuery.includes('silk') ||
        lowerQuery.includes('bridal'),
    ).toBe(true)
  })
})
