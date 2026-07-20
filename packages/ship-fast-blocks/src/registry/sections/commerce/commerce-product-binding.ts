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

const findSlotProduct = (
  slot: CommerceProductSlot,
  liveProducts: Array<CommerceCatalogProduct>,
  consumedProducts?: Set<CommerceCatalogProduct>,
): CommerceCatalogProduct | undefined => {
  const availableProducts =
    consumedProducts === undefined
      ? liveProducts
      : liveProducts.filter((product) => !consumedProducts.has(product))

  return (
    availableProducts.find((product) => product.sourceId === slot.sourceId) ??
    availableProducts.find((product) => product.sourceHandle === slot.handle) ??
    availableProducts.find((product) => product.handle === slot.handle)
  )
}

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

  const product = findSlotProduct(slot, liveProducts)
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
    const product = findSlotProduct(slot, liveProducts, consumedProducts)
    if (product === undefined) return []
    consumedProducts.add(product)
    return [liveBinding(product, slot)]
  })
  const adminProducts = liveProducts
    .filter((product) => !consumedProducts.has(product))
    .map((product) => liveBinding(product))

  return [...boundSlots, ...adminProducts]
}
