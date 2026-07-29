import { describe, expect, it } from 'vitest'

import { preprocessOpenUIResponse } from '../lib/openui-preprocess.ts'

describe('preprocessOpenUIResponse', () => {
  it('strips invalid top-level section labels from saved page block calls', () => {
    // The preprocessor repairs malformed syntax where object literals are
    // followed by stray label:key pairs (a common LLM error).
    const source =
      'home = SplitHero("Kerala Tourism", ["Home"], {heading: "Kerala"},extra: {label: "Featured In"},more: {heading: "Why Kerala"})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('SplitHero("Kerala Tourism"')
  })

  it('repairs malformed quoted object keys without changing valid JSON keys', () => {
    const source =
      'root = CardGrid("StrideFit", ["Home"], {cards:[{"title":"Darius K.", tag:"Verified"},{"title":"Maya S.", tag:"Verified"}]})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('{"title":"Darius K."')
  })

  it('repairs object boundaries before trailing null arguments', () => {
    const source =
      'root = CardGrid("StrideFit", ["Home"], ["Home"], {}, {}, {}, {}, {footer:{note:"Done"}, null)'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('{footer:{note:"Done"}}, null)')
    expect(result).not.toContain('{footer:{note:"Done"}, null)')
  })

  it('repairs object boundaries accidentally closed by a parenthesis before the next argument', () => {
    const source =
      'root = CenteredHero("ShopifyLite", ["Home"], {chip:"New", heading:"Launch", imageAlt:"Storefront"), "Trusted by Leading Brands", {heading:"Categories"})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain(
      'imageAlt:"Storefront"}, "Trusted by Leading Brands"',
    )
    expect(result).not.toContain(
      'imageAlt:"Storefront"), "Trusted by Leading Brands"',
    )
  })

  it('does not strip quotes from URL string values inside object values (regression: https:// in targetMap)', () => {
    const source =
      'root = PageSwitch(["Home"], [home], "", {"Contact":"Home#hero","https://facebook.com/blog":"Home#hero"})\nhome = Text("Home")'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('"https://facebook.com/blog"')
    expect(result).not.toContain(',https://facebook.com/blog"')
  })

  // Full-bleed section bands own their padding; the page-root Stack that stacks
  // them must render gapless (default gap-4 shows the page bg as black slivers
  // between bands). Applied at render time so EXISTING persisted programs are
  // fixed on next render without regeneration.
  describe('gapless section-band stack', () => {
    const bandProgram = [
      'nav = Navbar("Acme")',
      'nav_anchor = SectionAnchor("nav", nav)',
      'hero = SplitHero("Welcome")',
      'hero_anchor = SectionAnchor("hero", hero, "scroll-mt-28")',
      'foot = Footer("Acme")',
      'foot_anchor = SectionAnchor("foot", foot, "scroll-mt-28")',
      'home = Stack([nav_anchor, hero_anchor, foot_anchor])',
      'root = PageSwitch(["Home"], [home])',
    ].join('\n')

    it('forces gap="none" on a Stack whose children are all SectionAnchors', () => {
      const result = preprocessOpenUIResponse(bandProgram, {
        resolveRefs: false,
      })
      expect(result).toContain(
        'home = Stack([nav_anchor, hero_anchor, foot_anchor], "col", "none")',
      )
    })

    it('leaves inner content stacks (non-anchor children) at their default gap', () => {
      const source = [
        'h = Heading("Acme", "1")',
        'sub = Text("Insight", "muted")',
        'inner = Stack([h, sub])',
        'root = Stack([inner])',
      ].join('\n')
      const result = preprocessOpenUIResponse(source, { resolveRefs: false })
      // No SectionAnchors anywhere → nothing is rewritten.
      expect(result).toContain('inner = Stack([h, sub])')
      expect(result).not.toContain('"col", "none"')
    })

    it('leaves freeform-app root stacks (no section anchors) untouched', () => {
      const source = [
        'status = StateText("on", false, "Status: ")',
        'toggle = StateButton("Toggle", "on", "toggle")',
        'root = Stack([status, toggle])',
      ].join('\n')
      const result = preprocessOpenUIResponse(source, { resolveRefs: false })
      expect(result).toContain('root = Stack([status, toggle])')
      expect(result).not.toContain('"col", "none"')
    })

    it('does not touch a band stack that already carries an explicit gap', () => {
      const source = [
        'nav = Navbar("Acme")',
        'nav_anchor = SectionAnchor("nav", nav)',
        'home = Stack([nav_anchor], "col", "sm")',
        'root = PageSwitch(["Home"], [home])',
      ].join('\n')
      const result = preprocessOpenUIResponse(source, { resolveRefs: false })
      expect(result).toContain('home = Stack([nav_anchor], "col", "sm")')
    })
  })
})
