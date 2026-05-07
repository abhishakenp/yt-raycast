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
})
