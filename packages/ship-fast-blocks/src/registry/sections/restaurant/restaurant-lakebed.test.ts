import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { buildSeedPatchFromProps } from '@ship-fast/lakebed/react'

import { restaurantLakebed } from './restaurant-lakebed.ts'

const emptyRestaurantData = () => ({
  catalog: [],
  orderItems: [],
  reservations: [],
  selections: [],
  state: [],
})

describe('restaurantLakebed', () => {
  it('adds menu items and increments repeat dishes in shared order state', async () => {
    const context = createLakebedHandlerContext({
      data: emptyRestaurantData(),
      props: {},
      schema: restaurantLakebed.schema,
      writable: true,
    })

    await restaurantLakebed.mutations.addMenuItem(context.context, {
      category: 'Mains',
      description: 'Whole Mediterranean sea bass',
      name: 'Pan-Seared Branzino',
      price: '$34',
    })
    await restaurantLakebed.mutations.addMenuItem(context.context, {
      category: 'Mains',
      description: 'Whole Mediterranean sea bass',
      name: 'Pan-Seared Branzino',
      price: '$34',
    })

    expect(context.getPatch().orderItems).toMatchObject([
      {
        category: 'Mains',
        name: 'Pan-Seared Branzino',
        price: '$34',
        quantity: 2,
      },
    ])
    expect(context.getPatch().selections).toHaveLength(2)
  })

  it('summarizes and clears restaurant order rows without seeding from menu props', async () => {
    const context = createLakebedHandlerContext({
      data: emptyRestaurantData(),
      props: {},
      schema: restaurantLakebed.schema,
      writable: true,
    })

    await restaurantLakebed.mutations.addMenuItem(context.context, {
      category: 'Starters',
      name: 'Burrata',
      price: '$16',
    })
    await restaurantLakebed.mutations.addMenuItem(context.context, {
      category: 'Starters',
      name: 'Burrata',
      price: '$16',
    })

    const read = createLakebedHandlerContext({
      data: { ...emptyRestaurantData(), ...context.getPatch() },
      props: {},
      schema: restaurantLakebed.schema,
    })

    expect(
      restaurantLakebed.queries.restaurantOrder(read.context),
    ).toMatchObject({
      count: 2,
      lastSelection: {
        category: 'Starters',
        name: 'Burrata',
      },
    })

    const clear = createLakebedHandlerContext({
      data: { ...emptyRestaurantData(), ...context.getPatch() },
      props: {},
      schema: restaurantLakebed.schema,
      writable: true,
    })
    await restaurantLakebed.mutations.clearRestaurantOrder(clear.context)
    expect(clear.getPatch().orderItems).toEqual([])

    const seedPatch = buildSeedPatchFromProps({
      data: {
        catalog: [],
        orderItems: [],
        reservations: [],
        selections: [],
        state: [],
      },
      definition: restaurantLakebed,
      props: {
        categories: [
          {
            items: [
              {
                name: 'Burrata',
                price: '$16',
              },
            ],
            name: 'Starters',
          },
        ],
      },
    })

    expect(seedPatch).toEqual({})
  })

  it('syncs menu catalog and records command selections in shared state', async () => {
    const context = createLakebedHandlerContext({
      data: emptyRestaurantData(),
      props: {},
      schema: restaurantLakebed.schema,
      writable: true,
    })

    await restaurantLakebed.mutations.syncMenuCatalog(context.context, {
      items: [
        {
          category: 'Mains',
          description: 'Whole Mediterranean sea bass',
          name: 'Pan-Seared Branzino',
          price: '$34',
          tag: 'Chef pick',
        },
      ],
    })
    await restaurantLakebed.mutations.selectMenuItem(context.context, {
      category: 'Mains',
      description: 'Whole Mediterranean sea bass',
      name: 'Pan-Seared Branzino',
      price: '$34',
      source: 'search',
      tag: 'Chef pick',
    })

    expect(context.getPatch().catalog).toMatchObject([
      {
        category: 'Mains',
        name: 'Pan-Seared Branzino',
        price: '$34',
        tag: 'Chef pick',
      },
    ])
    expect(
      restaurantLakebed.queries.restaurantExperience(context.context),
    ).toMatchObject({
      selectedCategory: 'Mains',
      selectedMenuItem: 'Pan-Seared Branzino',
      selectedPrice: '$34',
    })
    expect(context.getPatch().selections).toMatchObject([
      {
        category: 'Mains',
        name: 'Pan-Seared Branzino',
        source: 'search',
      },
    ])
  })

  it('records reservation requests as real restaurant state', async () => {
    const context = createLakebedHandlerContext({
      data: emptyRestaurantData(),
      props: {},
      schema: restaurantLakebed.schema,
      writable: true,
    })

    await restaurantLakebed.mutations.reserveTable(context.context, {
      label: 'Book a Table',
      source: 'Reservations',
    })

    expect(
      restaurantLakebed.queries.restaurantExperience(context.context),
    ).toMatchObject({
      reservationCount: 1,
      reservations: [
        {
          label: 'Book a Table',
          source: 'Reservations',
        },
      ],
    })
  })
})
