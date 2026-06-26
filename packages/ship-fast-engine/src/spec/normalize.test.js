import { describe, it, expect } from 'vitest'
import { normalizeSiteSpec } from './normalize.js'

const minimalValid = () => ({
  projectName: 'Test Site',
  slug: 'test-site',
  siteType: 'saas',
  exportableFrameworks: ['html'],
  theme: { primaryColor: '#000' },
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      sections: [],
    },
  ],
})

describe('normalizeSiteSpec', () => {
  it('returns a valid spec from minimal input', () => {
    const result = normalizeSiteSpec(minimalValid())
    expect(result).toBeDefined()
    expect(result.projectName).toBe('Test Site')
    expect(result.slug).toBe('test-site')
  })

  it('has at least one page', () => {
    const result = normalizeSiteSpec(minimalValid())
    expect(Array.isArray(result.pages)).toBe(true)
    expect(result.pages.length).toBeGreaterThan(0)
  })

  it('does not throw on null input', () => {
    expect(() => normalizeSiteSpec(null)).not.toThrow()
  })

  it('does not throw on undefined input', () => {
    expect(() => normalizeSiteSpec(undefined)).not.toThrow()
  })

  it('does not throw on empty object', () => {
    expect(() => normalizeSiteSpec({})).not.toThrow()
  })

  it('returns a valid spec with exportableFrameworks array', () => {
    const result = normalizeSiteSpec(minimalValid())
    expect(Array.isArray(result.exportableFrameworks)).toBe(true)
  })

  it('normalizes page sections to arrays', () => {
    const input = minimalValid()
    input.pages[0].sections = null
    const result = normalizeSiteSpec(input)
    expect(Array.isArray(result.pages[0].sections)).toBe(true)
  })

  it('normalizes section items to arrays', () => {
    const input = minimalValid()
    input.pages[0].sections = [{ id: 's1', type: 'features', items: null }]
    const result = normalizeSiteSpec(input)
    expect(Array.isArray(result.pages[0].sections[0].items)).toBe(true)
  })

  it('keeps projectName from input', () => {
    const input = { ...minimalValid(), projectName: 'My Awesome App' }
    const result = normalizeSiteSpec(input)
    expect(result.projectName).toBe('My Awesome App')
  })

  describe('brand consistency across pages', () => {
    const multiPage = () => ({
      projectName: 'Acme Co',
      slug: 'acme',
      siteType: 'saas',
      exportableFrameworks: ['html'],
      pages: [
        {
          id: 'home',
          name: 'Home',
          route: '/',
          sections: [
            {
              id: 'nav-home',
              type: 'navbar',
              headline: 'Acme',
              styling: {
                brandLogo: {
                  kind: 'remote',
                  src: 'https://cdn/acme.png',
                  alt: 'Acme',
                },
              },
            },
            { id: 'foot-home', type: 'footer', headline: 'Acme', styling: {} },
          ],
        },
        {
          id: 'about',
          name: 'About',
          route: '/about',
          sections: [
            {
              id: 'nav-about',
              type: 'navbar',
              headline: 'Acme Corporation',
              styling: {
                brandLogo: {
                  kind: 'remote',
                  src: 'https://cdn/other.png',
                  alt: 'Other',
                },
              },
            },
            { id: 'foot-about', type: 'footer', headline: '', styling: {} },
          ],
        },
      ],
    })

    it('uses the same brand name in every navbar and footer', () => {
      const result = normalizeSiteSpec(multiPage())
      const headlines = result.pages
        .flatMap((page) => page.sections)
        .filter(
          (section) => section.type === 'navbar' || section.type === 'footer',
        )
        .map((section) => section.headline)
      expect(new Set(headlines)).toEqual(new Set(['Acme']))
    })

    it('uses the same brand logo in every navbar and footer', () => {
      const result = normalizeSiteSpec(multiPage())
      const logos = result.pages
        .flatMap((page) => page.sections)
        .filter(
          (section) => section.type === 'navbar' || section.type === 'footer',
        )
        .map((section) => section.styling?.brandLogo?.src)
      expect(new Set(logos)).toEqual(new Set(['https://cdn/acme.png']))
    })

    it('falls back to projectName when no navbar headline is set', () => {
      const input = multiPage()
      input.pages[0].sections[0].headline = ''
      input.pages[1].sections[0].headline = ''
      const result = normalizeSiteSpec(input)
      const navHeadlines = result.pages
        .flatMap((page) => page.sections)
        .filter((section) => section.type === 'navbar')
        .map((section) => section.headline)
      expect(new Set(navHeadlines)).toEqual(new Set(['Acme Co']))
    })

    it('does not touch headlines of non-brand sections', () => {
      const input = multiPage()
      input.pages[0].sections.push({
        id: 'hero',
        type: 'hero',
        headline: 'Welcome',
      })
      const result = normalizeSiteSpec(input)
      const hero = result.pages[0].sections.find(
        (section) => section.type === 'hero',
      )
      expect(hero.headline).toBe('Welcome')
    })
  })
})
