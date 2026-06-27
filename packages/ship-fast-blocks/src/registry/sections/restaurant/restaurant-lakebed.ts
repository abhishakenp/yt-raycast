import {
  createLakebedDefinition,
  number,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type RestaurantMenuItemInput = {
  category: string
  description?: string
  name: string
  price?: string
  tag?: string
}

export type RestaurantOrderItemTarget = {
  name: string
}

export type RestaurantCatalogInput = {
  items: RestaurantMenuItemInput[]
}

export type RestaurantReservationInput = {
  label?: string
  source: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const restaurant = createLakebedDefinition({
  catalog: {
    ...table({
      category: string().default(''),
      description: string().default(''),
      name: string(),
      price: string().default(''),
      tag: string().default(''),
    }),
    seedFromProps: false,
  },
  orderItems: {
    ...table({
      category: string().default(''),
      description: string().default(''),
      name: string(),
      price: string().default(''),
      quantity: number().default(1),
      tag: string().default(''),
    }),
    seedFromProps: false,
  },
  reservations: {
    ...table({
      label: string().default(''),
      source: string(),
    }),
    seedFromProps: false,
  },
  selections: {
    ...table({
      category: string().default(''),
      name: string(),
      price: string().default(''),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      selectedCategory: string().default(''),
      selectedMenuItem: string().default(''),
      selectedPrice: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const restaurantLakebed = {
  dataKey: 'Restaurant',
  schema: restaurant.schema,
  queries: {
    menuCatalog: restaurant.query((_ctx) =>
      _ctx.db.catalog.orderBy('createdAt').all(),
    ),
    restaurantExperience: restaurant.query((_ctx) => {
      const reservations = _ctx.db.reservations
        .orderBy('createdAt', 'desc')
        .all()
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)

      return {
        reservationCount: reservations.length,
        reservations,
        selectedCategory: state?.selectedCategory ?? '',
        selectedMenuItem: state?.selectedMenuItem ?? '',
        selectedPrice: state?.selectedPrice ?? '',
      }
    }),
    restaurantOrder: restaurant.query((_ctx) => {
      const items = _ctx.db.orderItems.orderBy('createdAt').all()
      const selections = _ctx.db.selections.orderBy('createdAt', 'desc').all()
      const count = items.reduce((total, item) => {
        const quantity =
          typeof item.quantity === 'number' && Number.isFinite(item.quantity)
            ? item.quantity
            : 1

        return total + Math.max(1, Math.floor(quantity))
      }, 0)

      return {
        count,
        items,
        lastSelection: selections.at(0) ?? null,
        selections,
      }
    }),
  },
  mutations: {
    addMenuItem: restaurant.mutation((_ctx, input: RestaurantMenuItemInput) => {
      const name = clean(input.name)
      if (!name) return _ctx.db.orderItems.orderBy('createdAt').all()

      const category = clean(input.category)
      const existing = _ctx.db.orderItems.where('name', name).all().at(0)

      if (existing) {
        _ctx.db.orderItems.update(existing.id, {
          category: existing.category || category,
          description: existing.description || clean(input.description),
          price: existing.price || clean(input.price),
          quantity: Math.max(1, Math.floor(existing.quantity || 1)) + 1,
          tag: existing.tag || clean(input.tag),
        })
      } else {
        _ctx.db.orderItems.insert({
          category,
          description: clean(input.description),
          name,
          price: clean(input.price),
          quantity: 1,
          tag: clean(input.tag),
        })
      }

      _ctx.db.selections.insert({
        category,
        name,
        price: clean(input.price),
        source: 'order',
      })

      return _ctx.db.orderItems.orderBy('createdAt').all()
    }),
    clearRestaurantOrder: restaurant.mutation((_ctx) => {
      for (const item of _ctx.db.orderItems.all()) {
        _ctx.db.orderItems.delete(item.id)
      }

      return []
    }),
    removeMenuItem: restaurant.mutation(
      (_ctx, input: RestaurantOrderItemTarget) => {
        const name = clean(input.name)
        const existing = name
          ? _ctx.db.orderItems.where('name', name).all().at(0)
          : null

        if (existing) _ctx.db.orderItems.delete(existing.id)

        return _ctx.db.orderItems.orderBy('createdAt').all()
      },
    ),
    reserveTable: restaurant.mutation(
      (_ctx, input: RestaurantReservationInput) => {
        const source = clean(input.source)
        if (!source) return _ctx.db.reservations.orderBy('createdAt').all()

        _ctx.db.reservations.insert({
          label: clean(input.label),
          source,
        })

        return _ctx.db.reservations.orderBy('createdAt', 'desc').all()
      },
    ),
    selectMenuItem: restaurant.mutation(
      (_ctx, input: RestaurantMenuItemInput & { source?: string }) => {
        const name = clean(input.name)
        if (!name) return _ctx.db.selections.orderBy('createdAt').all()

        const category = clean(input.category)
        const price = clean(input.price)
        const current = _ctx.db.state.orderBy('createdAt').all().at(0)
        const next = {
          selectedCategory: category,
          selectedMenuItem: name,
          selectedPrice: price,
        }

        if (current) {
          _ctx.db.state.update(current.id, next)
        } else {
          _ctx.db.state.insert(next)
        }

        _ctx.db.selections.insert({
          category,
          name,
          price,
          source: clean(input.source) || 'search',
        })

        return _ctx.db.selections.orderBy('createdAt', 'desc').all()
      },
    ),
    syncMenuCatalog: restaurant.mutation(
      (_ctx, input: RestaurantCatalogInput) => {
        const existing = _ctx.db.catalog.orderBy('createdAt').all()
        const existingByName = new Map(
          existing.map((item) => [item.name.toLowerCase(), item]),
        )

        for (const item of input.items) {
          const name = clean(item.name)
          if (!name) continue

          const next = {
            category: clean(item.category),
            description: clean(item.description),
            name,
            price: clean(item.price),
            tag: clean(item.tag),
          }
          const current = existingByName.get(name.toLowerCase())

          if (current) {
            _ctx.db.catalog.update(current.id, next)
          } else {
            _ctx.db.catalog.insert(next)
          }
        }

        return _ctx.db.catalog.orderBy('createdAt').all()
      },
    ),
  },
} as const
