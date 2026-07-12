import {
  createLakebedDefinition,
  number,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type CommerceCartItemInput = {
  itemKey?: string
  label: string
  price?: string
}

export type CommerceCatalogProductInput = {
  imageAlt?: string
  itemKey?: string
  label: string
  price?: string
  subtitle?: string
}

export type CommerceSearchInput = {
  query?: string
  selectedLabel?: string
}

type CartItemTarget = { id?: string; itemKey?: string; label?: string }

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

export function commerceCartItemKey({
  itemKey,
  label,
  price,
}: CommerceCartItemInput): string {
  const explicit = itemKey?.trim()
  if (explicit) return explicit

  const normalizedLabel = label.trim() || 'Item'
  return `${normalizedLabel}\u0000${price?.trim() ?? ''}`
}

const commerce = createLakebedDefinition({
  items: {
    ...table({
      itemKey: string().default(''),
      label: string(),
      price: string().default(''),
      quantity: number().default(1),
    }),
    seedFromProps: false,
  },
  products: table({
    imageAlt: string().default(''),
    itemKey: string().default(''),
    label: string(),
    price: string().default(''),
    subtitle: string().default(''),
  }),
  searches: {
    ...table({
      query: string().default(''),
      selectedLabel: string().default(''),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      query: string().default(''),
      selectedLabel: string().default(''),
    }),
    seedFromProps: false,
  },
})

function findCartItem(
  _ctx: Parameters<Parameters<typeof commerce.mutation>[0]>[0],
  input: CartItemTarget,
) {
  return (
    (input.id ? _ctx.db.items.get(input.id) : null) ??
    (input.itemKey
      ? _ctx.db.items.where('itemKey', input.itemKey).all().at(0)
      : null) ??
    (input.label ? _ctx.db.items.where('label', input.label).all().at(0) : null)
  )
}

function findExistingAddItem(
  _ctx: Parameters<Parameters<typeof commerce.mutation>[0]>[0],
  input: CommerceCartItemInput,
) {
  const label = input.label.trim() || 'Item'
  const price = input.price ?? ''
  const itemKey = commerceCartItemKey({ ...input, label })

  return (
    _ctx.db.items.where('itemKey', itemKey).all().at(0) ??
    _ctx.db.items
      .all()
      .find((item) => item.label === label && (item.price ?? '') === price) ??
    null
  )
}

export const commerceCartLakebed = {
  dataKey: 'Cart',
  schema: commerce.schema,
  queries: {
    cartSummary: commerce.query((_ctx) => {
      const items = _ctx.db.items.orderBy('createdAt').all()
      const count = items.reduce((total, item) => {
        const quantity =
          typeof item.quantity === 'number' && Number.isFinite(item.quantity)
            ? item.quantity
            : 1

        return total + Math.max(1, Math.floor(quantity))
      }, 0)

      return { count, items }
    }),
    productCatalog: commerce.query((_ctx) =>
      _ctx.db.products.orderBy('updatedAt', 'desc').all(),
    ),
    commerceSearchState: commerce.query((_ctx) => {
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()

      return {
        query: state?.query ?? '',
        searches,
        selectedLabel: state?.selectedLabel ?? '',
      }
    }),
  },
  mutations: {
    addItem: commerce.mutation((_ctx, input) => {
      const label = input.label.trim() || 'Item'
      const itemKey = commerceCartItemKey({ ...input, label })
      const existing = findExistingAddItem(_ctx, input)

      if (existing) {
        _ctx.db.items.update(existing.id, {
          itemKey: existing.itemKey || itemKey,
          price: existing.price || input.price || '',
          quantity: Math.max(1, Math.floor(existing.quantity || 1)) + 1,
        })
      } else {
        _ctx.db.items.insert({
          itemKey,
          label,
          price: input.price ?? '',
          quantity: 1,
        })
      }

      return _ctx.db.items.orderBy('createdAt').all()
    }),
    incrementItem: commerce.mutation((_ctx, input) => {
      const existing = findCartItem(_ctx, input)

      if (!existing) return _ctx.db.items.orderBy('createdAt').all()

      _ctx.db.items.update(existing.id, {
        quantity: Math.max(1, Math.floor(existing.quantity || 1)) + 1,
      })

      return _ctx.db.items.orderBy('createdAt').all()
    }),
    decrementItem: commerce.mutation((_ctx, input) => {
      const existing = findCartItem(_ctx, input)

      if (!existing) return _ctx.db.items.orderBy('createdAt').all()

      const quantity = Math.max(1, Math.floor(existing.quantity || 1))
      if (quantity > 1) {
        _ctx.db.items.update(existing.id, { quantity: quantity - 1 })
      }

      return _ctx.db.items.orderBy('createdAt').all()
    }),
    deleteItem: commerce.mutation((_ctx, input) => {
      const existing = findCartItem(_ctx, input)

      if (existing) {
        _ctx.db.items.delete(existing.id)
      }

      return _ctx.db.items.orderBy('createdAt').all()
    }),
    removeItem: commerce.mutation((_ctx, input) => {
      const existing = findCartItem(_ctx, input)

      if (!existing) return _ctx.db.items.orderBy('createdAt').all()

      const quantity = Math.max(1, Math.floor(existing.quantity || 1))
      if (quantity > 1) {
        _ctx.db.items.update(existing.id, { quantity: quantity - 1 })
      }

      return _ctx.db.items.orderBy('createdAt').all()
    }),
    clearCart: commerce.mutation((_ctx) => {
      for (const item of _ctx.db.items.all()) {
        _ctx.db.items.delete(item.id)
      }

      return []
    }),
    setCommerceSearch: commerce.mutation((_ctx, input) => {
      const query = clean(input.query)
      const selectedLabel = clean(input.selectedLabel)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const next = { query, selectedLabel }

      if (current) {
        _ctx.db.state.update(current.id, next)
      } else {
        _ctx.db.state.insert(next)
      }

      _ctx.db.searches.insert(next)

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncCatalog: commerce.mutation((_ctx, input) => {
      for (const product of input.products) {
        const label = product.label.trim()
        if (!label) continue

        const itemKey = product.itemKey
          ? commerceCartItemKey({
              itemKey: product.itemKey,
              label,
              price: product.price,
            })
          : ''
        const existing =
          (itemKey
            ? _ctx.db.products.where('itemKey', itemKey).all().at(0)
            : null) ??
          _ctx.db.products.where('label', label).all().at(0) ??
          null
        const next = {
          imageAlt: product.imageAlt ?? '',
          itemKey,
          label,
          price: product.price ?? '',
          subtitle: product.subtitle ?? '',
        }

        if (existing) {
          _ctx.db.products.update(existing.id, next)
        } else {
          _ctx.db.products.insert(next)
        }
      }

      return _ctx.db.products.orderBy('updatedAt', 'desc').all()
    }),
  },
} as const
