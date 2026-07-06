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

    expect(products).toEqual([
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

    expect(products).toEqual([
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
})
