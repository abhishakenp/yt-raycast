import { describe, expect, it } from 'vitest'

import {
  applyGeneratedSitePseoGuardrails,
  type PageSpec,
  type NavLink,
} from './pseo-guardrails'

function page(
  route: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: route.replace(/\W/g, '-') || 'home',
    route,
    title: route === '/' ? 'Home' : route.slice(1),
    name: route === '/' ? 'Home' : route.slice(1),
    sections: [],
    ...overrides,
  }
}

describe('generated site PSEO guardrails', () => {
  it('marks query and hash routes noindex so generated duplicate states are not published as canonical pages', () => {
    const siteSpec = {
      pages: [
        page('/'),
        page('/products?sort=popular'),
        page('/pricing#faq'),
        page('/about'),
      ],
      navigation: {
        global: [{ href: '/about', label: 'About' }],
        footer: [],
        ctas: [],
      },
    }

    const result = applyGeneratedSitePseoGuardrails(siteSpec)

    expect(
      result.pages!.find((p) => p.route === '/products?sort=popular')?.seo,
    ).toMatchObject({ noIndex: true })
    expect(
      result.pages!.find((p) => p.route === '/pricing#faq')?.seo,
    ).toMatchObject({ noIndex: true })
    expect(result.pages!.find((p) => p.route === '/about')?.seo).toBeUndefined()
  })

  it('keeps the first twelve pages in a generated thin family indexable and noindexes later thin pages', () => {
    const thinPages = Array.from({ length: 14 }, (_, index) =>
      page(`/locations/city-${String(index + 1).padStart(2, '0')}`, {
        description: 'Short city page.',
      }),
    )
    const siteSpec = {
      pages: [page('/'), ...thinPages],
      navigation: { global: [], footer: [], ctas: [] },
    }

    const result = applyGeneratedSitePseoGuardrails(siteSpec)

    expect(
      result.pages!.find((p) => p.route === '/locations/city-12')?.seo,
    ).toBeUndefined()
    expect(
      result.pages!.find((p) => p.route === '/locations/city-13')?.seo,
    ).toMatchObject({ noIndex: true })
    expect(
      result.pages!.find((p) => p.route === '/locations/city-14')?.seo,
    ).toMatchObject({ noIndex: true })
  })

  it('leaves later generated family pages indexable when they carry substantive unique descriptions', () => {
    const detailedDescription =
      'A locally specific landing page with neighborhood context, service details, unique proof points, and enough original copy to justify indexing.'
    const siteSpec = {
      pages: [
        page('/'),
        ...Array.from({ length: 14 }, (_, index) =>
          page(`/clinics/city-${String(index + 1).padStart(2, '0')}`, {
            description: detailedDescription,
          }),
        ),
      ],
      navigation: { global: [], footer: [], ctas: [] },
    }

    const result = applyGeneratedSitePseoGuardrails(siteSpec)

    expect(
      result.pages!.find((p) => p.route === '/clinics/city-13')?.seo,
    ).toBeUndefined()
    expect(
      result.pages!.find((p) => p.route === '/clinics/city-14')?.seo,
    ).toBeUndefined()
  })

  it('adds missing footer links for indexable generated pages without duplicating already-linked routes', () => {
    const siteSpec = {
      pages: [page('/'), page('/about'), page('/services'), page('/blog')],
      navigation: {
        global: [{ href: '/about?ref=nav', label: 'About' }],
        footer: [{ href: '/services', label: 'Services' }],
        ctas: [],
      },
    }

    const result = applyGeneratedSitePseoGuardrails(siteSpec)
    const footerHrefs = result.navigation!.footer!.map((entry) => entry.href)

    expect(footerHrefs.filter((href) => href === '/about')).toHaveLength(0)
    expect(footerHrefs.filter((href) => href === '/services')).toHaveLength(1)
    expect(footerHrefs).toContain('/blog')
  })
})
