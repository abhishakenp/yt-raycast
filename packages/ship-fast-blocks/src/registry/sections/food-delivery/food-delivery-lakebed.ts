import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type FoodDeliverySearchInput = {
  address?: string
  query?: string
}

export type FoodDeliveryActionInput = {
  action: string
  source?: string
}

export type FoodDeliveryCatalogInput = {
  category?: string
  cuisine?: string
  delivery?: string
  imageAlt?: string
  name: string
  rating?: string
  time?: string
}

export type FoodDeliveryRestaurantInput = {
  cuisine?: string
  name: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

const foodDelivery = createLakebedDefinition({
  actions: {
    ...table({
      action: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  items: {
    ...table({
      category: string().default(''),
      cuisine: string().default(''),
      delivery: string().default(''),
      imageAlt: string().default(''),
      name: string(),
      rating: string().default(''),
      time: string().default(''),
    }),
  },
  searches: {
    ...table({
      address: string().default(''),
      query: string().default(''),
    }),
    seedFromProps: false,
  },
  selections: {
    ...table({
      cuisine: string().default(''),
      name: string(),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      address: string().default(''),
      query: string().default(''),
      selectedCuisine: string().default(''),
      selectedRestaurant: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const foodDeliveryLakebed = {
  dataKey: 'FoodDelivery',
  schema: foodDelivery.schema,
  queries: {
    restaurantCatalog: foodDelivery.query((_ctx) =>
      _ctx.db.items.orderBy('createdAt').all(),
    ),
    foodDeliveryState: foodDelivery.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt', 'desc').all()
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const selections = _ctx.db.selections.orderBy('createdAt', 'desc').all()

      return {
        actionCount: actions.length,
        actions,
        address: state?.address ?? '',
        query: state?.query ?? '',
        searches,
        selectedCuisine: state?.selectedCuisine ?? '',
        selectedRestaurant: state?.selectedRestaurant ?? '',
        selectionCount: selections.length,
        selections,
      }
    }),
  },
  mutations: {
    recordFoodAction: foodDelivery.mutation((_ctx, input: FoodDeliveryActionInput) => {
      const action = clean(input.action)
      if (!action) return _ctx.db.actions.orderBy('createdAt').all()

      _ctx.db.actions.insert({
        action,
        source: clean(input.source),
      })

      return _ctx.db.actions.orderBy('createdAt', 'desc').all()
    }),
    selectRestaurant: foodDelivery.mutation((_ctx, input: FoodDeliveryRestaurantInput) => {
      const name = clean(input.name)
      if (!name) return _ctx.db.selections.orderBy('createdAt').all()

      const cuisine = clean(input.cuisine)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const patch = {
        selectedCuisine: cuisine,
        selectedRestaurant: name,
      }

      if (current) {
        _ctx.db.state.update(current.id, patch)
      } else {
        _ctx.db.state.insert({
          address: '',
          query: '',
          selectedCuisine: cuisine,
          selectedRestaurant: name,
        })
      }

      _ctx.db.selections.insert({ cuisine, name })

      return _ctx.db.selections.orderBy('createdAt', 'desc').all()
    }),
    setFoodSearch: foodDelivery.mutation((_ctx, input: FoodDeliverySearchInput) => {
      const address = clean(input.address)
      const query = clean(input.query) || address
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const next = {
        address,
        query,
        selectedCuisine: '',
        selectedRestaurant: '',
      }

      if (current) {
        _ctx.db.state.update(current.id, next)
      } else {
        _ctx.db.state.insert(next)
      }

      _ctx.db.searches.insert({ address, query })

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncRestaurants: foodDelivery.mutation((_ctx, input: { items: FoodDeliveryCatalogInput[] }) => {
      const existing = _ctx.db.items.orderBy('createdAt').all()
      const existingByName = new Map(
        existing.map((item) => [item.name.toLowerCase(), item]),
      )

      for (const item of input.items) {
        const name = clean(item.name)
        if (!name) continue

        const next = {
          category: clean(item.category),
          cuisine: clean(item.cuisine),
          delivery: clean(item.delivery),
          imageAlt: clean(item.imageAlt),
          name,
          rating: clean(item.rating),
          time: clean(item.time),
        }
        const current = existingByName.get(name.toLowerCase())

        if (current) {
          _ctx.db.items.update(current.id, next)
        } else {
          _ctx.db.items.insert(next)
        }
      }

      return _ctx.db.items.orderBy('createdAt').all()
    }),
  },
} as const
