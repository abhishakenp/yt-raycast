import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { buildSeedPatchFromProps } from '@ship-fast/lakebed/react'
import { commerceCartLakebed } from './cart-lakebed.ts'

describe('commerceCartLakebed', () => {
  it('adds cart items through the shared Lakebed mutation and increments repeats', async () => {
    const first = createLakebedHandlerContext({
      data: { items: [] },
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.addItem(first.context, {
      label: 'Hydrating Serum',
      price: '$28',
    })

    const firstPatch = first.getPatch()
    expect(firstPatch.items).toMatchObject([
      {
        label: 'Hydrating Serum',
        price: '$28',
        quantity: 1,
      },
    ])

    const second = createLakebedHandlerContext({
      data: firstPatch,
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.addItem(second.context, {
      label: 'Hydrating Serum',
      price: '$28',
    })

    expect(second.getPatch().items).toMatchObject([
      {
        itemKey: 'Hydrating Serum\u0000$28',
        label: 'Hydrating Serum',
        price: '$28',
        quantity: 2,
      },
    ])
  })

  it('keeps products with the same label but different keys as separate cart lines', async () => {
    const context = createLakebedHandlerContext({
      data: { items: [] },
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.addItem(context.context, {
      itemKey: 'variant:serum-small',
      label: 'Hydrating Serum',
      price: '$28',
    })
    await commerceCartLakebed.mutations.addItem(context.context, {
      itemKey: 'variant:serum-large',
      label: 'Hydrating Serum',
      price: '$42',
    })
    await commerceCartLakebed.mutations.addItem(context.context, {
      itemKey: 'variant:serum-small',
      label: 'Hydrating Serum',
      price: '$28',
    })

    expect(context.getPatch().items).toMatchObject([
      {
        itemKey: 'variant:serum-small',
        label: 'Hydrating Serum',
        price: '$28',
        quantity: 2,
      },
      {
        itemKey: 'variant:serum-large',
        label: 'Hydrating Serum',
        price: '$42',
        quantity: 1,
      },
    ])

    await commerceCartLakebed.mutations.incrementItem(context.context, {
      itemKey: 'variant:serum-large',
    })

    expect(context.getPatch().items).toMatchObject([
      {
        itemKey: 'variant:serum-small',
        quantity: 2,
      },
      {
        itemKey: 'variant:serum-large',
        quantity: 2,
      },
    ])

    await commerceCartLakebed.mutations.deleteItem(context.context, {
      itemKey: 'variant:serum-small',
    })

    expect(context.getPatch().items).toMatchObject([
      {
        itemKey: 'variant:serum-large',
        quantity: 2,
      },
    ])
  })

  it('summarizes quantity from the shared Cart document', () => {
    const { context } = createLakebedHandlerContext({
      data: {
        items: [
          {
            createdAt: '2026-06-26T00:00:00.000Z',
            id: 'cart-a',
            itemKey: 'Serum\u0000$28',
            label: 'Serum',
            price: '$28',
            quantity: 2,
            updatedAt: '2026-06-26T00:00:00.000Z',
          },
          {
            createdAt: '2026-06-26T00:00:00.000Z',
            id: 'cart-b',
            itemKey: 'Cream\u0000$34',
            label: 'Cream',
            price: '$34',
            quantity: 1,
            updatedAt: '2026-06-26T00:00:00.000Z',
          },
        ],
      },
      props: {},
      schema: commerceCartLakebed.schema,
    })

    expect(commerceCartLakebed.queries.cartSummary(context)).toMatchObject({
      count: 3,
    })
  })

  it('syncs searchable product catalog rows into the shared commerce document', async () => {
    const first = createLakebedHandlerContext({
      data: { items: [], products: [] },
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.syncCatalog(first.context, {
      products: [
        {
          imageAlt: 'Serum bottle',
          label: 'Hydrating Serum',
          price: '$28',
          subtitle: 'Skincare',
        },
      ],
    })

    expect(first.getPatch().products).toMatchObject([
      {
        imageAlt: 'Serum bottle',
        label: 'Hydrating Serum',
        price: '$28',
        subtitle: 'Skincare',
      },
    ])

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.syncCatalog(second.context, {
      products: [
        {
          label: 'Hydrating Serum',
          price: '$30',
          subtitle: 'Updated skincare',
        },
      ],
    })

    expect(second.getPatch().products).toHaveLength(1)
    expect(second.getPatch().products).toMatchObject([
      {
        label: 'Hydrating Serum',
        price: '$30',
        subtitle: 'Updated skincare',
      },
    ])
  })

  it('stores product search state and history outside navigation', async () => {
    const context = createLakebedHandlerContext({
      data: { searches: [], state: [] },
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.setCommerceSearch(context.context, {
      query: 'Hydrating Serum',
      selectedLabel: 'Hydrating Serum',
    })

    expect(commerceCartLakebed.queries.commerceSearchState(context.context)).toMatchObject({
      query: 'Hydrating Serum',
      selectedLabel: 'Hydrating Serum',
      searches: [
        {
          query: 'Hydrating Serum',
          selectedLabel: 'Hydrating Serum',
        },
      ],
    })

    await commerceCartLakebed.mutations.setCommerceSearch(context.context, {
      query: 'Cream',
      selectedLabel: 'Rich Cream',
    })

    const searchState = commerceCartLakebed.queries.commerceSearchState(
      context.context,
    )

    expect(searchState).toMatchObject({
      query: 'Cream',
      selectedLabel: 'Rich Cream',
    })
    expect(searchState.searches).toHaveLength(2)
  })

  it('increments, decrements, deletes, and clears cart rows through shared Lakebed mutations', async () => {
    const initial = createLakebedHandlerContext({
      data: { items: [] },
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.addItem(initial.context, {
      label: 'Serum',
      price: '$28',
    })
    await commerceCartLakebed.mutations.addItem(initial.context, {
      label: 'Serum',
      price: '$28',
    })

    const mutate = createLakebedHandlerContext({
      data: initial.getPatch(),
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.incrementItem(mutate.context, {
      label: 'Serum',
    })

    expect(mutate.getPatch().items).toMatchObject([
      {
        label: 'Serum',
        quantity: 3,
      },
    ])

    await commerceCartLakebed.mutations.decrementItem(mutate.context, {
      label: 'Serum',
    })

    expect(mutate.getPatch().items).toMatchObject([
      {
        label: 'Serum',
        quantity: 2,
      },
    ])

    await commerceCartLakebed.mutations.decrementItem(mutate.context, {
      label: 'Serum',
    })
    await commerceCartLakebed.mutations.decrementItem(mutate.context, {
      label: 'Serum',
    })

    expect(mutate.getPatch().items).toMatchObject([
      {
        label: 'Serum',
        quantity: 1,
      },
    ])

    await commerceCartLakebed.mutations.deleteItem(mutate.context, {
      label: 'Serum',
    })

    expect(mutate.getPatch().items).toEqual([])

    await commerceCartLakebed.mutations.addItem(mutate.context, {
      label: 'Cream',
      price: '$34',
    })

    const clear = createLakebedHandlerContext({
      data: mutate.getPatch(),
      props: {},
      schema: commerceCartLakebed.schema,
      writable: true,
    })

    await commerceCartLakebed.mutations.clearCart(clear.context)
    expect(clear.getPatch().items).toEqual([])
  })

  it('does not seed cart rows from product-grid items props', () => {
    const patch = buildSeedPatchFromProps({
      data: {
        items: [],
        products: [],
      },
      definition: commerceCartLakebed,
      props: {
        items: [
          {
            brand: 'The Ordinary',
            price: '$8.90',
            title: 'Hyaluronic Acid 2% + B5 Hydrating Serum',
          },
        ],
      },
    })

    expect(patch).toEqual({})
  })
})
