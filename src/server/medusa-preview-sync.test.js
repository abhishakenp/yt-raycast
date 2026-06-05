import { describe, expect, it } from 'vitest'
import { mergeMedusaProductsIntoSiteSpec } from './medusa-preview-sync.js'

describe('mergeMedusaProductsIntoSiteSpec', () => {
  it('updates ecommerce products, product sections, and exact-clone html from Medusa admin products', () => {
    const siteSpec = {
      projectName: 'Studio Shop',
      siteType: 'ecommerce',
      ecommerce: {
        settings: { currency: 'USD', storeName: 'Studio Shop', provider: 'medusa' },
        products: [
          {
            id: 'placeholder',
            title: 'Premium pick',
            handle: 'premium-pick',
            description: 'Placeholder copy',
            price: 49.99,
            currency: 'USD',
            image: '',
            category: 'featured',
          },
        ],
      },
      pages: [
        {
          id: 'page-home',
          route: '/',
          sections: [
            {
              id: 'product-grid',
              type: 'product-grid',
              items: [
                {
                  id: 'canvas-tote',
                  title: 'Canvas Tote',
                  body: 'Old canvas tote description',
                  price: '$20.00',
                  image: 'https://cdn.example.com/old-tote.jpg',
                },
              ],
            },
          ],
          renderBlueprint: {
            exactClone: true,
            bodyHtml:
              '<section><article class="product-card"><img src="https://cdn.example.com/old-tote.jpg" alt="Canvas Tote"><h3>Canvas Tote</h3><p>Old canvas tote description</p><span>$20.00</span></article></section>',
            originalHtmlDocument:
              '<!doctype html><html><body><section><article class="product-card"><img src="https://cdn.example.com/old-tote.jpg" alt="Canvas Tote"><h3>Canvas Tote</h3><p>Old canvas tote description</p><span>$20.00</span></article></section></body></html>',
          },
        },
      ],
    }
    const visibleProducts = [
      {
        id: 'canvas-tote',
        title: 'Canvas Tote',
        handle: 'canvas-tote',
        description: 'Old canvas tote description',
        price: 20,
        currency: 'USD',
        image: 'https://cdn.example.com/old-tote.jpg',
        category: 'featured',
      },
    ]
    const medusaProducts = [
      {
        id: 'canvas-tote',
        title: 'Canvas Tote Pro',
        handle: 'canvas-tote',
        description: 'Waxed canvas tote with brass hardware',
        price: 29.5,
        currency: 'USD',
        image: 'https://cdn.example.com/new-tote.jpg',
        category: 'featured',
        metadata: { specs: ['Waxed canvas', 'Brass hardware'] },
        specs: ['Waxed canvas', 'Brass hardware'],
        features: ['Waxed canvas', 'Brass hardware'],
      },
    ]

    const result = mergeMedusaProductsIntoSiteSpec(siteSpec, medusaProducts, {
      visibleProducts,
    })

    expect(result.changed).toBe(true)
    expect(result.productCount).toBe(1)
    expect(result.siteSpec.ecommerce.products).toEqual([medusaProducts[0]])
    expect(result.siteSpec.pages[0].sections[0].items).toEqual([
      {
        id: 'canvas-tote',
        title: 'Canvas Tote Pro',
        body: 'Waxed canvas tote with brass hardware',
        description: 'Waxed canvas tote with brass hardware',
        price: '$29.50',
        image: 'https://cdn.example.com/new-tote.jpg',
        category: 'featured',
        handle: 'canvas-tote',
        specs: ['Waxed canvas', 'Brass hardware'],
        features: ['Waxed canvas', 'Brass hardware'],
      },
    ])
    expect(result.siteSpec.pages[0].renderBlueprint.originalHtmlDocument).toContain(
      'Canvas Tote Pro',
    )
    expect(result.siteSpec.pages[0].renderBlueprint.originalHtmlDocument).toContain('$29.50')
    expect(result.siteSpec.pages[0].renderBlueprint.originalHtmlDocument).toContain(
      'https://cdn.example.com/new-tote.jpg',
    )
    expect(result.siteSpec.pages[0].renderBlueprint.originalHtmlDocument).not.toContain(
      'Old canvas tote description',
    )
  })
})
