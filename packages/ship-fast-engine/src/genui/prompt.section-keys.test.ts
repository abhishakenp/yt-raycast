import { describe, it, expect } from 'vitest'
import { componentSectionKeys, componentSignature } from './prompt.ts'

describe('componentSectionKeys', () => {
  it('lists every top-level section of a block (the omitted ones included)', () => {
    const keys = componentSectionKeys('EcommerceOverview')
    // content sections the model can fill on this block
    expect(keys).toContain('heading')
    expect(keys).toContain('subheading')
    expect(keys).toContain('features')
    expect(keys).toContain('stats')
    expect(keys).toContain('eyebrow')
  })

  it('excludes brand, nav, and non-content props', () => {
    const keys = componentSectionKeys('EcommerceOverview')
    expect(keys).not.toContain('brand')
    expect(keys).not.toContain('nav')
    expect(keys).not.toContain('className')
  })

  it('returns [] for an unknown block (no crash)', () => {
    expect(componentSignature('NotARealBlock_xyz')).toBeUndefined()
    expect(componentSectionKeys('NotARealBlock_xyz')).toEqual([])
  })
})
