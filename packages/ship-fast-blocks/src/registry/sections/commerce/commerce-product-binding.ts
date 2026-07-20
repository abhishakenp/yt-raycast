import type {
  CommerceCatalogProduct,
  CommerceProductSlot,
} from './commerce-contracts'

export type CommerceCatalogState = 'degraded' | 'loading' | 'ready'

export type BoundCommerceProduct = {
  availability: 'degraded' | 'live' | 'loading' | 'unavailable'
  product: CommerceCatalogProduct
  purchasable: boolean
  slot?: CommerceProductSlot
}

const availableVariant = (product: CommerceCatalogProduct): boolean =>
  product.variants.some(
    (variant) =>
      variant.id !== undefined &&
      variant.available !== false &&
      (!variant.manageInventory ||
        variant.inventoryQuantity === undefined ||
        variant.inventoryQuantity > 0),
  )

const matchesSlot = (
  slot: CommerceProductSlot,
  product: CommerceCatalogProduct,
): boolean =>
  product.sourceId === slot.sourceId ||
  product.sourceHandle === slot.handle ||
  product.handle === slot.handle

const fallbackBinding = (
  slot: CommerceProductSlot,
  state: Exclude<CommerceCatalogState, 'ready'>,
): BoundCommerceProduct => ({
  availability: state,
  product: slot.fallback,
  purchasable: false,
  slot,
})

const liveBinding = (
  product: CommerceCatalogProduct,
  slot?: CommerceProductSlot,
): BoundCommerceProduct => ({
  availability: 'live',
  product,
  purchasable: availableVariant(product),
  ...(slot === undefined ? {} : { slot }),
})

export const bindCommerceProductSlot = (
  slot: CommerceProductSlot,
  liveProducts: Array<CommerceCatalogProduct>,
  state: CommerceCatalogState,
): BoundCommerceProduct => {
  if (state !== 'ready') return fallbackBinding(slot, state)

  const product = liveProducts.find((candidate) => matchesSlot(slot, candidate))
  return product === undefined
    ? {
        availability: 'unavailable',
        product: slot.fallback,
        purchasable: false,
        slot,
      }
    : liveBinding(product, slot)
}

export const bindCommerceCatalog = (
  slots: Array<CommerceProductSlot>,
  liveProducts: Array<CommerceCatalogProduct>,
  state: CommerceCatalogState,
): Array<BoundCommerceProduct> => {
  if (state !== 'ready')
    return slots.map((slot) => fallbackBinding(slot, state))

  const consumedProducts = new Set<CommerceCatalogProduct>()
  const boundSlots = slots.flatMap((slot) => {
    const product = liveProducts.find(
      (candidate) =>
        !consumedProducts.has(candidate) && matchesSlot(slot, candidate),
    )
    if (product === undefined) return []
    consumedProducts.add(product)
    return [liveBinding(product, slot)]
  })
  const adminProducts = liveProducts
    .filter((product) => !consumedProducts.has(product))
    .map((product) => liveBinding(product))

  return [...boundSlots, ...adminProducts]
}
