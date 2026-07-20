import { describe, expect, it } from 'vitest'

import {
  countGeneratedCommerceProducts,
  extractGeneratedCommerceProducts,
} from './generated-commerce-products'

describe('countGeneratedCommerceProducts', () => {
  it('counts generated OpenUI product objects without counting parent sections', () => {
    const source = `
      root = StorePage({
        hero: {
          title: "Cocoa Luxe",
          featured: { name: "The Grand Truffle Box", price: "$79" }
        },
        products: {
          items: [
            { brand: "Cocoa Luxe", name: "Silk Dark 70% Bar", price: "$12", oldPrice: "$15" },
            { brand: "Cocoa Luxe", name: "Milk & Hazelnut Delight", price: "$14" },
            { quote: "Loved it", name: "Aisha" }
          ]
        }
      })
    `

    expect(countGeneratedCommerceProducts({ source })).toBe(3)
  })

  it('uses ecommerce products from the site spec when available', () => {
    expect(
      countGeneratedCommerceProducts({
        source: 'root = Text("No product source")',
        siteSpecJson: JSON.stringify({
          ecommerce: {
            products: [
              { title: 'Truffle Box', price: 79 },
              { title: 'Dark Bar', price: 12 },
            ],
          },
        }),
      }),
    ).toBe(2)
  })

  it('extracts generated OpenUI products for Medusa sync', () => {
    const products = extractGeneratedCommerceProducts({
      source: `
        root = StorePage({
          products: {
            items: [
              { name: "Truffle Box", price: "$79", description: "Twelve-piece gift box" },
              { title: "Dark Bar", price: 12 },
              { quote: "Loved it", name: "Aisha" }
            ]
          }
        })
      `,
    })

    expect(products).toMatchObject([
      {
        description: 'Twelve-piece gift box',
        handle: 'truffle-box',
        price: 79,
        title: 'Truffle Box',
      },
      {
        handle: 'dark-bar',
        price: 12,
        title: 'Dark Bar',
      },
    ])
  })

  it('prefers exact site spec product details over generated source fallbacks', () => {
    const products = extractGeneratedCommerceProducts({
      source:
        'root = StorePage({ products: { items: [{ name: "Fallback", price: "$1" }] } })',
      siteSpecJson: JSON.stringify({
        ecommerce: {
          products: [
            {
              description: 'Cold brew concentrate',
              handle: 'midnight-cold-brew',
              price: '$18.50',
              title: 'Midnight Cold Brew',
            },
          ],
        },
      }),
    })

    expect(products).toMatchObject([
      {
        description: 'Cold brew concentrate',
        handle: 'midnight-cold-brew',
        price: 18.5,
        title: 'Midnight Cold Brew',
      },
    ])
  })

  it('does not treat marketing pricing plans as commerce products', () => {
    const products = extractGeneratedCommerceProducts({
      source: `
        root = MarketingAgencyPricing(
          "Transparent Pricing",
          "Choose Your Solution",
          "Flexible packages designed for every budget.",
          "All prices include design and installation.",
          [
            {"name":"Standard Glass","audience":"Small businesses","price":"$49","period":"per sq ft","features":[{"label":"Tempered glass","included":true}]},
            {"name":"Premium Glass","audience":"High-end interiors","price":"$79","period":"per sq ft","features":[{"label":"Low-E coating","included":true}]}
          ]
        )
      `,
    })

    expect(products).toEqual([])
  })

  it('normalizes legacy products to deterministic default variants', () => {
    const input = {
      siteSpecJson: JSON.stringify({
        ecommerce: {
          products: [
            {
              description: 'Hand-thrown stoneware',
              handle: 'studio-mug',
              price: 19.99,
              title: 'Studio Mug',
            },
          ],
        },
      }),
    }

    const first = extractGeneratedCommerceProducts(input)
    const second = extractGeneratedCommerceProducts(input)

    expect(first).toEqual(second)
    expect(first).toEqual([
      {
        collections: [],
        description: 'Hand-thrown stoneware',
        handle: 'studio-mug',
        images: [],
        options: [],
        price: 19.99,
        sourceId: 'product:studio-mug',
        tags: [],
        title: 'Studio Mug',
        variants: [
          {
            manageInventory: false,
            optionValues: {},
            prices: [{ amount: 19.99, currencyCode: 'usd' }],
            sourceId: 'variant:studio-mug:default',
            title: 'Default',
          },
        ],
      },
    ])
  })

  it('preserves rich multi-variant catalog data after safe normalization', () => {
    const products = extractGeneratedCommerceProducts({
      siteSpecJson: JSON.stringify({
        catalog: {
          products: [
            {
              collections: [
                {
                  handle: 'summer-edit',
                  id: 'collection_summer',
                  title: 'Summer Edit',
                },
              ],
              description: 'A breathable everyday tee',
              handle: 'linen-tee',
              id: 'product_linen_tee',
              images: [
                {
                  alt: 'Linen tee front',
                  id: 'image_front',
                  url: 'https://cdn.example.com/linen-front.jpg',
                },
                'https://cdn.example.com/linen-back.jpg',
              ],
              options: [
                {
                  id: 'option_size',
                  title: 'Size',
                  values: ['Small', 'Large'],
                },
              ],
              tags: [{ id: 'tag_linen', value: 'Linen' }, 'Breathable'],
              thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
              title: 'Linen Tee',
              variants: [
                {
                  available: true,
                  calculatedPrice: { amount: 28, currencyCode: 'USD' },
                  id: 'variant_small',
                  inventoryQuantity: 7,
                  manageInventory: true,
                  optionValues: { Size: 'Small' },
                  prices: [
                    { amount: 29.5, currencyCode: 'USD' },
                    { amount: 27, currencyCode: 'eur' },
                  ],
                  originalPrice: { amount: 35, currencyCode: 'USD' },
                  sku: 'LINEN-S',
                  title: 'Small',
                },
                {
                  inventory_quantity: 0,
                  manage_inventory: true,
                  options: [{ title: 'Size', value: 'Large' }],
                  prices: [{ amount: 32, currency_code: 'GBP' }],
                  sku: 'LINEN-L',
                  title: 'Large',
                },
              ],
            },
          ],
        },
      }),
    })

    expect(products).toEqual([
      {
        collections: [
          {
            handle: 'summer-edit',
            sourceId: 'collection_summer',
            title: 'Summer Edit',
          },
        ],
        description: 'A breathable everyday tee',
        handle: 'linen-tee',
        images: [
          {
            alt: 'Linen tee front',
            sourceId: 'image_front',
            url: 'https://cdn.example.com/linen-front.jpg',
          },
          { url: 'https://cdn.example.com/linen-back.jpg' },
        ],
        options: [
          {
            sourceId: 'option_size',
            title: 'Size',
            values: ['Small', 'Large'],
          },
        ],
        price: 28,
        sourceId: 'product_linen_tee',
        tags: [
          { sourceId: 'tag_linen', value: 'Linen' },
          { value: 'Breathable' },
        ],
        thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
        title: 'Linen Tee',
        variants: [
          {
            available: true,
            calculatedPrice: { amount: 28, currencyCode: 'usd' },
            inventoryQuantity: 7,
            manageInventory: true,
            optionValues: { Size: 'Small' },
            prices: [
              { amount: 29.5, currencyCode: 'usd' },
              { amount: 27, currencyCode: 'eur' },
            ],
            originalPrice: { amount: 35, currencyCode: 'usd' },
            sku: 'LINEN-S',
            sourceId: 'variant_small',
            title: 'Small',
          },
          {
            inventoryQuantity: 0,
            manageInventory: true,
            optionValues: { Size: 'Large' },
            prices: [{ amount: 32, currencyCode: 'gbp' }],
            sku: 'LINEN-L',
            sourceId: 'variant:linen-tee:large:size-large',
            title: 'Large',
          },
        ],
      },
    ])
  })

  it('keeps explicit IDs and derives stable IDs from handles and option values', () => {
    const siteSpecJson = JSON.stringify({
      ecommerce: {
        products: [
          {
            handle: 'trail-shoe',
            sourceId: 'catalog-trail-shoe',
            title: 'Trail Shoe',
            variants: [
              {
                optionValues: { Color: 'Forest', Size: '42' },
                prices: [{ amount: 120, currencyCode: 'USD' }],
                sourceId: 'catalog-trail-shoe-forest-42',
                title: 'Forest / 42',
              },
              {
                optionValues: { Size: '43', Color: 'Clay' },
                prices: [{ amount: 125, currencyCode: 'USD' }],
                title: 'Clay / 43',
              },
            ],
          },
        ],
      },
    })

    const first = extractGeneratedCommerceProducts({ siteSpecJson })
    const second = extractGeneratedCommerceProducts({ siteSpecJson })

    expect(first).toEqual(second)
    expect(first[0]?.sourceId).toBe('catalog-trail-shoe')
    expect(first[0]?.variants.map((variant) => variant.sourceId)).toEqual([
      'catalog-trail-shoe-forest-42',
      'variant:trail-shoe:clay-43:color-clay:size-43',
    ])
  })

  it('omits invalid prices, inventory, variants, and products safely', () => {
    const products = extractGeneratedCommerceProducts({
      siteSpecJson: JSON.stringify({
        ecommerce: {
          products: [
            { handle: 'negative', price: -1, title: 'Negative' },
            { handle: 'not-finite', price: 'Infinity', title: 'Not finite' },
            {
              handle: 'mixed',
              title: 'Mixed',
              variants: [
                {
                  inventoryQuantity: 1.5,
                  manageInventory: true,
                  prices: [{ amount: 10, currencyCode: 'USD' }],
                  title: 'Fractional inventory',
                },
                {
                  prices: [{ amount: -5, currencyCode: 'USD' }],
                  title: 'Negative price',
                },
                {
                  prices: [{ amount: 15, currencyCode: 'USD' }],
                  title: 'Valid',
                },
              ],
            },
            {
              handle: 'no-valid-variants',
              title: 'No valid variants',
              variants: [
                {
                  prices: [{ amount: 10 }],
                  title: 'Missing rich currency',
                },
              ],
            },
          ],
        },
      }),
    })

    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({
      handle: 'mixed',
      price: 15,
      variants: [
        {
          prices: [{ amount: 15, currencyCode: 'usd' }],
          title: 'Valid',
        },
      ],
    })
  })

  it('rejects negative currency strings in sign and accounting formats', () => {
    const products = extractGeneratedCommerceProducts({
      siteSpecJson: JSON.stringify({
        ecommerce: {
          products: [
            {
              handle: 'leading-sign',
              price: '-$19.99',
              title: 'Leading sign',
            },
            {
              handle: 'spaced-sign',
              price: 'USD - 19.99',
              title: 'Spaced sign',
            },
            {
              handle: 'accounting',
              price: '($19.99)',
              title: 'Accounting',
            },
          ],
        },
      }),
    })

    expect(products).toEqual([])
  })

  it('deduplicates products and variants and caps output at 25 products', () => {
    const generated = Array.from({ length: 28 }, (_, index) => ({
      handle: `product-${index}`,
      id: `product-${index}`,
      title: `Product ${index}`,
      variants: [
        {
          id: `variant-${index}`,
          prices: [{ amount: index + 1, currencyCode: 'USD' }],
          title: 'First',
        },
        {
          id: `variant-${index}`,
          prices: [{ amount: index + 2, currencyCode: 'USD' }],
          title: 'Duplicate',
        },
      ],
    }))
    generated.splice(1, 0, {
      ...generated[0],
      handle: 'duplicate-handle',
      title: 'Duplicate source ID',
    })
    generated.splice(2, 0, {
      ...generated[0],
      id: 'different-source',
      title: 'Duplicate handle',
    })

    const products = extractGeneratedCommerceProducts({
      siteSpecJson: JSON.stringify({ ecommerce: { products: generated } }),
    })

    expect(products).toHaveLength(25)
    expect(products[0]?.variants).toHaveLength(1)
    expect(products.map((product) => product.sourceId)).toEqual(
      Array.from({ length: 25 }, (_, index) => `product-${index}`),
    )
  })
})
