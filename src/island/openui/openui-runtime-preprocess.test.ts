import { describe, expect, it } from 'vitest'

import { preprocessOpenUIRuntimeResponse } from './openui-runtime-preprocess'

describe('preprocessOpenUIRuntimeResponse', () => {
  it('repairs streaming syntax without resolving spec-aware section labels', () => {
    const source = [
      '```openui',
      'hero = Hero("Ship Fast", [Image("https://images.example.com/',
      'root = Page([hero, Action("click")',
    ].join('\n')

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).not.toContain('```')
    expect(result).not.toContain('Action(')
    expect(result).toContain('hero = Hero(')
    expect(result).toContain('root = Page(')
    expect(result).toContain('Image("https://images.example.com/")')
  })

  it('repairs malformed quoted object keys before runtime parsing', () => {
    const source =
      'root = SaasHero("StrideFit", ["Home"], {items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})'

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).toContain('{"name":"Darius K."')
    expect(result).toContain('{name:"Maya S."')
    expect(result).not.toContain('{"name:"Maya S."')
  })

  it('repairs object boundaries before trailing null arguments', () => {
    const source =
      'root = ProductDetailHero("StrideFit", ["Home"], ["Home"], {}, {}, {}, {}, {footer:{note:"Done"}, null)'

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).toContain('{footer:{note:"Done"}}, null)')
    expect(result).not.toContain('{footer:{note:"Done"}, null)')
  })
})
