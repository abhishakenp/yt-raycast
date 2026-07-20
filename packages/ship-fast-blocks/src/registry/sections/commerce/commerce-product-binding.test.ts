import { describe, expect, it } from 'vitest'

import type { CommerceProduct, CommerceProductSlot } from './commerce-contracts'
import {
  bindCommerceCatalog,
  bindCommerceProductSlot,
} from './commerce-product-binding'

const product = (
  sourceId: string,
  handle: string,
  title: string,
  sourceHandle?: string,
): CommerceProduct & { sourceHandle?: string } => ({
  collections: [],
  handle,
  images: [],
  options: [],
  sourceId,
  tags: [],
  title,
  variants: [
    {
      available: true,
      id: `variant_${sourceId}`,
      manageInventory: false,
      optionValues: {},
      prices: [{ amount: 25, currencyCode: 'usd' }],
      sourceId: `variant:${sourceId}`,
      title: 'Default',
    },
  ],
  ...(sourceHandle === undefined ? {} : { sourceHandle }),
})

const slot = (
  sourceId: string,
  handle: string,
  title: string,
): CommerceProductSlot => ({
  fallback: product(sourceId, handle, title),
  handle,
  sourceId,
})

describe('commerce product binding', () => {
  it('binds duplicate visible titles by source ID without corrupting siblings', () => {
    const slots = [
      slot('product:left', 'left-shirt', 'Classic Shirt'),
      slot('product:right', 'right-shirt', 'Classic Shirt'),
    ]
    const liveProducts = [
      product('product:right', 'admin-right', 'Right Admin Title'),
      product('product:left', 'admin-left', 'Left Admin Title'),
    ]

    expect(
      bindCommerceCatalog(slots, liveProducts, 'ready').map(
        ({ product: boundProduct }) => boundProduct.title,
      ),
    ).toEqual(['Left Admin Title', 'Right Admin Title'])
  })

  it('uses sourceHandle as the stable fallback and appends admin products', () => {
    const generatedSlot = slot(
      'product:generated',
      'generated-handle',
      'Generated',
    )
    const seededProduct = product(
      'medusa_product_1',
      'admin-edited-handle',
      'Admin Edited',
      'generated-handle',
    )
    const adminProduct = product(
      'medusa_product_2',
      'admin-created',
      'Admin Created',
    )

    expect(
      bindCommerceCatalog(
        [generatedSlot],
        [seededProduct, adminProduct],
        'ready',
      ).map(({ product: boundProduct }) => boundProduct.sourceId),
    ).toEqual(['medusa_product_1', 'medusa_product_2'])
  })

  it('prefers an exact source ID globally over an earlier handle collision', () => {
    const generatedSlot = slot(
      'product:generated',
      'generated-handle',
      'Generated',
    )
    const adminCollision = product(
      'medusa_product_admin',
      'generated-handle',
      'Admin Collision',
    )
    const exactSeededProduct = product(
      'product:generated',
      'admin-edited-handle',
      'Exact Seeded Product',
    )
    const liveProducts = [adminCollision, exactSeededProduct]

    expect(
      bindCommerceProductSlot(generatedSlot, liveProducts, 'ready').product
        .sourceId,
    ).toBe('product:generated')
    expect(
      bindCommerceCatalog([generatedSlot], liveProducts, 'ready').map(
        ({ product: boundProduct }) => boundProduct.sourceId,
      ),
    ).toEqual(['product:generated', 'medusa_product_admin'])
  })

  it('removes missing grid products while product slots become unavailable', () => {
    const removedSlot = slot('product:removed', 'removed', 'Removed')

    expect(bindCommerceCatalog([removedSlot], [], 'ready')).toEqual([])
    expect(bindCommerceProductSlot(removedSlot, [], 'ready')).toMatchObject({
      availability: 'unavailable',
      product: removedSlot.fallback,
      purchasable: false,
    })
  })

  it('retains fallback visuals without purchasing when live commerce degrades', () => {
    const generatedSlot = slot('product:fallback', 'fallback', 'Fallback')

    expect(bindCommerceCatalog([generatedSlot], [], 'degraded')).toMatchObject([
      {
        availability: 'degraded',
        product: generatedSlot.fallback,
        purchasable: false,
      },
    ])
  })

  it('disables purchasing when every live variant is sold out', () => {
    const generatedSlot = slot('product:stock', 'stock', 'Stock')
    const soldOut = product('product:stock', 'stock', 'Stock')
    soldOut.variants[0] = {
      ...soldOut.variants[0],
      inventoryQuantity: 0,
      manageInventory: true,
    }

    expect(
      bindCommerceProductSlot(generatedSlot, [soldOut], 'ready'),
    ).toMatchObject({
      availability: 'live',
      purchasable: false,
    })
  })
})
