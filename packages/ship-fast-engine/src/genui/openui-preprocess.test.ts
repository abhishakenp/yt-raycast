import { describe, expect, it } from 'vitest'

import { preprocessOpenUIResponse } from '../lib/openui-preprocess.ts'

describe('preprocessOpenUIResponse', () => {
  it('strips invalid top-level section labels from saved page block calls', () => {
    const source =
      'home = RestaurantHero("Kerala Tourism", ["Home"], {heading: "Kerala"},hours: {label: "Featured In"},location: {heading: "Why Kerala", items: [{title: "Backwaters", description: "Houseboats"}]})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('RestaurantHero("Kerala Tourism"')
    expect(result).not.toContain(',hours:')
    expect(result).not.toContain(',location:')
    expect(result).toContain('{label: "Featured In"}')
    expect(result).toContain('{heading: "Why Kerala"')
  })

  it('repairs malformed quoted object keys without changing valid JSON keys', () => {
    const source =
      'root = SaasTestimonials("StrideFit", ["Home"], {items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('{"name":"Darius K."')
    expect(result).toContain('{name:"Maya S."')
    expect(result).not.toContain('{"name:"Maya S."')
  })

  it('repairs object boundaries before trailing null arguments', () => {
    const source =
      'root = EcommerceOverview("StrideFit", ["Home"], ["Home"], {}, {}, {}, {}, {footer:{note:"Done"}, null)'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('{footer:{note:"Done"}}, null)')
    expect(result).not.toContain('{footer:{note:"Done"}, null)')
  })

  it('repairs object boundaries accidentally closed by a parenthesis before the next argument', () => {
    const source =
      'root = EcommerceHero("ShopifyLite", ["Home"], {chip:"New", heading:"Launch", imageAlt:"Storefront"), "Trusted by Leading Brands", {heading:"Categories"})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain(
      'imageAlt:"Storefront"}, "Trusted by Leading Brands"',
    )
    expect(result).not.toContain(
      'imageAlt:"Storefront"), "Trusted by Leading Brands"',
    )
  })
})
