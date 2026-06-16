import { describe, it, expect } from 'vitest'
import { componentSectionKeys, componentSignature } from './prompt.ts'

describe('componentSectionKeys', () => {
  it('lists every top-level section of a block (the omitted ones included)', () => {
    const keys = componentSectionKeys('EcommerceKimiPage')
    // These three were the sections the model skipped, leaking sneaker defaults.
    expect(keys).toContain('features')
    expect(keys).toContain('testimonials')
    expect(keys).toContain('faq')
    // hero/products are the obvious ones it did fill.
    expect(keys).toContain('hero')
    expect(keys).toContain('products')
  })

  it('excludes brand, nav, and non-content props', () => {
    const keys = componentSectionKeys('EcommerceKimiPage')
    expect(keys).not.toContain('brand')
    expect(keys).not.toContain('nav')
    expect(keys).not.toContain('className')
  })

  it('returns [] for an unknown block (no crash)', () => {
    expect(componentSignature('NotARealBlock_xyz')).toBeUndefined()
    expect(componentSectionKeys('NotARealBlock_xyz')).toEqual([])
  })
})
