import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'

describe('foodDeliveryLakebed', () => {
  it('stores shared delivery search state and history', async () => {
    const first = createLakebedHandlerContext({
      data: { searches: [], selections: [], state: [] },
      props: {},
      schema: foodDeliveryLakebed.schema,
      writable: true,
    })

    await foodDeliveryLakebed.mutations.setFoodSearch(first.context, {
      address: 'Sushi',
      query: 'Sushi',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: foodDeliveryLakebed.schema,
    })
    const summary = foodDeliveryLakebed.queries.foodDeliveryState(
      second.context,
    )

    expect(summary).toMatchObject({
      address: 'Sushi',
      query: 'Sushi',
      selectedRestaurant: '',
    })
    expect(summary.searches).toMatchObject([
      {
        address: 'Sushi',
        query: 'Sushi',
      },
    ])
  })

  it('records selected restaurants without seeding interaction rows from props', async () => {
    const first = createLakebedHandlerContext({
      data: { searches: [], selections: [], state: [] },
      props: {},
      schema: foodDeliveryLakebed.schema,
      writable: true,
    })

    await foodDeliveryLakebed.mutations.selectRestaurant(first.context, {
      cuisine: 'Japanese',
      name: 'Sakura Sushi Bar',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: foodDeliveryLakebed.schema,
    })
    const summary = foodDeliveryLakebed.queries.foodDeliveryState(
      second.context,
    )

    expect(summary.selectedCuisine).toBe('Japanese')
    expect(summary.selectedRestaurant).toBe('Sakura Sushi Bar')
    expect(summary.selectionCount).toBe(1)
    expect(summary.selections).toMatchObject([
      {
        cuisine: 'Japanese',
        name: 'Sakura Sushi Bar',
      },
    ])
    expect(foodDeliveryLakebed.schema.searches.seedFromProps).toBe(false)
    expect(foodDeliveryLakebed.schema.selections.seedFromProps).toBe(false)
    expect(foodDeliveryLakebed.schema.state.seedFromProps).toBe(false)
  })
})
