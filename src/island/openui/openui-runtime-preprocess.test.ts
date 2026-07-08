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
    expect(result).toContain('{"name":"Maya S."')
    expect(result).not.toContain('{"name:"Maya S."')
  })

  it('repairs object boundaries before trailing null arguments', () => {
    const source =
      'root = ProductDetailHero("StrideFit", ["Home"], ["Home"], {}, {}, {}, {}, {footer:{note:"Done"}, null)'

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).toContain('{"footer":{"note":"Done"}}, null)')
    expect(result).not.toContain('{"footer":{"note":"Done"}, null)')
  })

  // Mirrors the server preprocess: full-bleed section bands own their padding,
  // so the page-root Stack that stacks them renders gapless (default gap-4 shows
  // the page bg as black slivers). Fixes existing persisted programs on render.
  describe('gapless section-band stack', () => {
    it('forces gap="none" on a Stack whose children are all SectionAnchors', () => {
      const source = [
        'nav = CafeNavbar("Acme")',
        'nav_anchor = SectionAnchor("nav", nav)',
        'hero = CafeHero("Welcome")',
        'hero_anchor = SectionAnchor("hero", hero, "scroll-mt-28")',
        'home = Stack([nav_anchor, hero_anchor])',
        'root = PageSwitch(["Home"], [home])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain(
        'home = Stack([nav_anchor, hero_anchor], "col", "none")',
      )
    })

    it('leaves freeform-app / inner content stacks untouched', () => {
      const source = [
        'status = StateText("on", false, "Status: ")',
        'toggle = StateButton("Toggle", "on", "toggle")',
        'root = Stack([status, toggle])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain('root = Stack([status, toggle])')
      expect(result).not.toContain('"col", "none"')
    })
  })
})
