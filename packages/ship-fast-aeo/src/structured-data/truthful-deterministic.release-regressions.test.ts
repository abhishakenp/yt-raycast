import { describe, expect, it } from 'vitest'

import { buildStructuredData } from './build.ts'

function findEntry(entries: Record<string, unknown>[], schemaType: string) {
  return entries.find((entry) => entry['@type'] === schemaType)
}

function makeSite() {
  return {
    projectName: 'Acme',
    siteType: 'commerce',
    seo: {
      siteName: 'Acme',
      siteUrl: 'https://acme.example',
      description: 'Acme makes practical tools.',
    },
    pages: [],
  }
}

describe('structured data release truthfulness and determinism', () => {
  it('does not describe a productivity page as a Product', () => {
    const site = makeSite()
    const page = {
      route: '/productivity',
      title: 'Productivity guide',
      description: 'Ways to organize focused work.',
    }

    const entries = buildStructuredData(site, page)

    expect(findEntry(entries, 'Product')).toBeUndefined()
  })

  it('does not describe a product listing as a single Product', () => {
    const site = makeSite()
    const page = {
      route: '/products',
      title: 'All products',
      description: 'Browse the complete catalog.',
      sections: [{ type: 'product-grid' }],
    }

    const entries = buildStructuredData(site, page)

    expect(findEntry(entries, 'Product')).toBeUndefined()
  })

  it('still describes a real product-detail page as a Product', () => {
    const site = makeSite()
    const page = {
      route: '/catalog/widget',
      title: 'Widget',
      description: 'A useful widget.',
      sections: [
        {
          type: 'product-detail',
          items: [
            {
              title: 'Widget',
              body: 'A useful widget.',
              price: '29.99',
            },
          ],
        },
      ],
    }

    const entries = buildStructuredData(site, page)

    expect(findEntry(entries, 'Product')).toMatchObject({
      name: 'Widget',
      offers: {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'USD',
      },
    })
  })

  it('uses the precomputed generation timestamp when an article has no publication date', () => {
    const site = {
      ...makeSite(),
      siteType: 'blog',
      generatedTimestamp: '2026-06-01T12:34:56.000Z',
    }
    const page = {
      route: '/posts/release',
      title: 'Release notes',
      description: 'What changed in this release.',
      sections: [{ type: 'article', body: 'Release details.' }],
    }

    const entries = buildStructuredData(site, page)

    expect(findEntry(entries, 'Article')).toMatchObject({
      datePublished: '2026-06-01T12:34:56.000Z',
    })
  })

  it('preserves an explicit article publication date over generation metadata', () => {
    const site = {
      ...makeSite(),
      siteType: 'blog',
      generatedTimestamp: '2026-06-01T12:34:56.000Z',
    }
    const page = {
      route: '/posts/archive',
      title: 'From the archive',
      description: 'A previously published article.',
      seo: { datePublished: '2024-03-02T08:00:00.000Z' },
      sections: [{ type: 'article', body: 'Archived details.' }],
    }

    const entries = buildStructuredData(site, page)

    expect(findEntry(entries, 'Article')).toMatchObject({
      datePublished: '2024-03-02T08:00:00.000Z',
    })
  })
})
