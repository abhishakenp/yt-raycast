import { describe, expect, it } from 'vitest'

import { buildHomepageSpecSliceJson } from './homepage-spec-slice.js'

describe('buildHomepageSpecSliceJson', () => {
  it('serializes only the fields needed for homepage generation and selects the home page', () => {
    const json = buildHomepageSpecSliceJson({
      projectName: 'Atlas',
      slug: 'atlas',
      siteType: 'saas',
      planMeta: { schemaRevision: '1.0.0' },
      theme: { colors: { primary: '#111111' } },
      navigation: { global: [{ label: 'Home', href: '/' }] },
      pages: [
        { id: 'pricing', name: 'Pricing', route: '/pricing' },
        {
          id: 'home',
          name: 'Homepage',
          route: '/',
          sections: [{ id: 'hero' }],
        },
      ],
      backendFeatureHints: ['not part of prompt slice'],
    })

    const slice = JSON.parse(json)

    expect(slice).toEqual({
      projectName: 'Atlas',
      slug: 'atlas',
      siteType: 'saas',
      planMeta: { schemaRevision: '1.0.0' },
      theme: { colors: { primary: '#111111' } },
      navigation: { global: [{ label: 'Home', href: '/' }] },
      homepage: {
        id: 'home',
        name: 'Homepage',
        route: '/',
        sections: [{ id: 'hero' }],
      },
    })
    expect(json).not.toContain('backendFeatureHints')
  })

  it('falls back to the first page when no route or home name identifies the homepage', () => {
    const slice = JSON.parse(
      buildHomepageSpecSliceJson({
        projectName: 'Atlas',
        slug: 'atlas',
        siteType: 'blog',
        pages: [
          { id: 'archive', name: 'Archive', route: '/archive' },
          { id: 'about', name: 'About', route: '/about' },
        ],
      }),
    )

    expect(slice.homepage).toEqual({
      id: 'archive',
      name: 'Archive',
      route: '/archive',
    })
    expect(slice).not.toHaveProperty('ecommerce')
  })

  it('includes ecommerce data only for ecommerce specs', () => {
    const slice = JSON.parse(
      buildHomepageSpecSliceJson({
        projectName: 'Atlas Store',
        slug: 'atlas-store',
        siteType: 'ecommerce',
        pages: [{ id: 'home', name: 'Home', route: '/' }],
        ecommerce: {
          provider: 'medusa',
          products: [{ id: 'prod-1', title: 'Desk Lamp' }],
        },
      }),
    )

    expect(slice.ecommerce).toEqual({
      provider: 'medusa',
      products: [{ id: 'prod-1', title: 'Desk Lamp' }],
    })
  })

  it('returns an empty string for missing or page-less specs', () => {
    expect(buildHomepageSpecSliceJson(null)).toBe('')
    expect(
      buildHomepageSpecSliceJson({ projectName: 'Atlas', pages: [] }),
    ).toBe('')
    expect(
      buildHomepageSpecSliceJson({ projectName: 'Atlas', pages: 'invalid' }),
    ).toBe('')
  })
})
