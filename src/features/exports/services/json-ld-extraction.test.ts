import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  parseOpenUIForExport,
  buildRouteJsonLd,
  unwrapSingleObjectArgProps,
  type ExportRoute,
} from './openui-export-builder'
import { buildExportSeoBundle } from './export-seo'

const fixtureDir = join(__dirname, '__fixtures__')
const readFixture = (name: string) =>
  readFileSync(join(fixtureDir, name), 'utf8')

// Real OpenUI source from Convex DB — coffee roastery with products + reviews
const realReviewSource = readFixture('real-review.openui')
const realProductSource = readFixture('real-product.openui')

const siteSpec = JSON.stringify({
  projectName: 'Test Store',
  seo: { siteUrl: 'https://test.example', siteName: 'Test Store' },
})

/** Build routes + JSON-LD map from an OpenUI source, same as the export builder does. */
const buildBundle = (source: string, spec = siteSpec) => {
  const parsed = parseOpenUIForExport(source, spec)
  const routePaths = parsed.routes.map((r, i) => ({
    path: i === 0 ? '/' : `/${r.toLowerCase().replace(/\s+/g, '-')}`,
    label: r,
  }))
  const routes: ExportRoute[] = parsed.pages.map((node, i) => {
    unwrapSingleObjectArgProps(node)
    return {
      label: parsed.routes[i] ?? `Page ${i + 1}`,
      path: routePaths[i].path,
      componentName: 'Test',
      node,
      props: node.props as Record<string, unknown>,
    }
  })
  const orgName = JSON.parse(spec).projectName || ''
  const routeJsonLd = buildRouteJsonLd(routes, orgName)
  return buildExportSeoBundle(spec, routePaths, routeJsonLd)
}

/** Parse structured data JSON, normalizing single-object to array. */
const parseJsonLd = (json: string): Record<string, unknown>[] => {
  const parsed = JSON.parse(json)
  return Array.isArray(parsed) ? parsed : [parsed]
}

describe('JSON-LD extraction from real DB data', () => {
  it('extracts products from real coffee roastery source', () => {
    const seoBundle = buildBundle(realReviewSource)
    expect(seoBundle?.homeSeo).toBeTruthy()
    const json = seoBundle!.homeSeo!.structuredDataJson
    expect(json).toBeTruthy()
    const data = parseJsonLd(json)

    const types = data.map((e: Record<string, unknown>) => e['@type'])
    // Should have ItemList (multiple products) — NOT WebPage/Organization
    expect(types).toContain('ItemList')
    expect(types).not.toContain('WebPage')
    expect(types).not.toContain('Organization')
    expect(types).not.toContain('WebSite')

    // Verify actual product data from the source
    const itemList = data.find(
      (e: Record<string, unknown>) => e['@type'] === 'ItemList',
    )
    expect(itemList).toBeTruthy()
    const items = itemList!.itemListElement as Array<Record<string, unknown>>
    expect(items.length).toBeGreaterThanOrEqual(3)

    const firstProduct = items[0].item as Record<string, unknown>
    expect(firstProduct['@type']).toBe('Product')
    expect(firstProduct.name).toBe('Ethiopian Yirgacheffe')
    expect(firstProduct.offers).toMatchObject({
      '@type': 'Offer',
      price: '18',
      priceCurrency: 'USD',
    })
  })

  it('extracts reviews and attaches them to product with aggregateRating', () => {
    const seoBundle = buildBundle(realReviewSource)
    const data = parseJsonLd(seoBundle!.homeSeo!.structuredDataJson)

    // Reviews should be attached to a product (inside ItemList or on single Product)
    const findProductWithReviews = (
      entries: Record<string, unknown>[],
    ): Record<string, unknown> | undefined => {
      for (const e of entries) {
        if (e['@type'] === 'Product' && e.review) return e
        if (e['@type'] === 'ItemList') {
          const items = e.itemListElement as Array<Record<string, unknown>>
          for (const item of items) {
            const product = item.item as Record<string, unknown>
            if (product?.review) return product
          }
        }
      }
      return undefined
    }

    const productWithReviews = findProductWithReviews(data)
    expect(productWithReviews).toBeTruthy()
    expect(Array.isArray(productWithReviews!.review)).toBe(true)
    expect(productWithReviews!.aggregateRating).toMatchObject({
      '@type': 'AggregateRating',
    })
  })

  it('does NOT emit WebPage/Organization/WebSite (those duplicate head metadata)', () => {
    const seoBundle = buildBundle(realProductSource)
    const data = parseJsonLd(seoBundle!.homeSeo!.structuredDataJson)
    const types = data.map((e: Record<string, unknown>) => e['@type'])
    expect(types).not.toContain('WebPage')
    expect(types).not.toContain('Organization')
    expect(types).not.toContain('WebSite')
  })

  it('handles string ratings (real data has "5" not 5)', () => {
    const seoBundle = buildBundle(realReviewSource)
    const data = parseJsonLd(seoBundle!.homeSeo!.structuredDataJson)

    // Find any Review with a rating
    const findReview = (
      entries: Record<string, unknown>[],
    ): Record<string, unknown> | undefined => {
      for (const e of entries) {
        if (e['@type'] === 'Review') return e
        if (e['@type'] === 'ItemList') {
          const items = e.itemListElement as Array<Record<string, unknown>>
          for (const item of items) {
            const product = item.item as Record<string, unknown>
            if (Array.isArray(product.review)) {
              return product.review[0] as Record<string, unknown>
            }
          }
        }
      }
      return undefined
    }

    const review = findReview(data)
    expect(review).toBeTruthy()
    expect(review!.reviewRating).toMatchObject({
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
    })
  })
})
