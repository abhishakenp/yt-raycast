import { describe, expect, it } from 'vitest'

import { supplementSiteSpecPages } from './supplement-pages.js'

describe('supplementSiteSpecPages', () => {
  const singleHomeSpec = () => ({
    projectName: 'Atlas Shop',
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        route: '/',
        title: 'Atlas Shop',
        sections: [{ id: 'hero', type: 'hero' }],
      },
    ],
    navigation: {
      global: [{ label: 'Old', href: '/old' }],
      ctas: [{ label: 'Checkout', href: '/checkout', style: 'primary' }],
    },
  })

  it('expands a collapsed home-only spec from contextual page names and rewires nav', () => {
    const result = supplementSiteSpecPages(singleHomeSpec(), {
      pages: ['Home', 'Shop', 'Cart', 'FAQ'],
    })

    expect(
      result.pages.map((page) => [page.name, page.route, page.title]),
    ).toEqual([
      ['Home', '/', 'Atlas Shop'],
      ['Shop', '/shop', 'Shop | Atlas Shop'],
      ['Cart', '/cart', 'Cart | Atlas Shop'],
      ['FAQ', '/faq', 'FAQ | Atlas Shop'],
    ])
    expect(result.pages[0].sections).toEqual([{ id: 'hero', type: 'hero' }])
    expect(result.pages[1].sections).toEqual([])
    expect(result.navigation.global).toEqual([
      { label: 'Home', href: 'index.html' },
      { label: 'Shop', href: 'shop.html' },
      { label: 'Cart', href: 'cart.html' },
      { label: 'FAQ', href: 'faq.html' },
    ])
    expect(result.navigation.footer).toEqual(result.navigation.global)
    expect(result.navigation.ctas).toEqual([
      { label: 'Checkout', href: '/checkout', style: 'primary' },
    ])
  })

  it('preserves existing secondary pages instead of replacing authored specs', () => {
    const spec = singleHomeSpec()
    spec.pages.push({
      id: 'page-about',
      name: 'About',
      route: '/about',
      title: 'About | Atlas Shop',
      sections: [{ id: 'about-story', type: 'team' }],
    })

    expect(supplementSiteSpecPages(spec, { pages: ['Home', 'Shop'] })).toBe(
      spec,
    )
  })

  it('creates deterministic stubs for contextual pages that are missing from a collapsed spec', () => {
    const result = supplementSiteSpecPages(singleHomeSpec(), {
      pages: ['Home', 'Privacy Policy', 'Contact'],
    })

    expect(result.pages.map((page) => page.id)).toEqual([
      'page-home',
      'page-privacy-policy',
      'page-contact',
    ])
    expect(result.pages[1]).toMatchObject({
      name: 'Privacy Policy',
      route: '/privacy-policy',
      title: 'Privacy Policy | Atlas Shop',
      description: 'Privacy Policy page for Atlas Shop.',
      sections: [],
    })
    expect(result.pages[2]).toMatchObject({
      name: 'Contact',
      route: '/contact',
      seo: {
        canonicalPath: '/contact',
        keywords: ['Contact', 'Atlas Shop'],
      },
    })
  })

  it('returns non-object specs and specs without contextual pages unchanged', () => {
    const spec = singleHomeSpec()

    expect(
      supplementSiteSpecPages(null, { pages: ['Home', 'Shop'] }),
    ).toBeNull()
    expect(supplementSiteSpecPages(spec, {})).toBe(spec)
  })
})
