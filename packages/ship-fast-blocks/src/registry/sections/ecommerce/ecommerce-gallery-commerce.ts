import type { CommerceController } from '../commerce/commerce-provider'

export type EcommerceGalleryVisualProduct = {
  badge?: string
  handle?: string
  imageAlt?: string
  name: string
  oldPrice?: string
  price: string
  sourceId?: string
}

export type EcommerceGalleryRuntimeProduct = EcommerceGalleryVisualProduct & {
  imageSrc?: string
  productHandle: string
  productSourceId: string
  purchasable: boolean
}

const productHandle = (product: EcommerceGalleryVisualProduct): string => {
  const explicitHandle = product.handle?.trim()
  if (explicitHandle) return explicitHandle
  const generatedHandle = product.name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return generatedHandle || 'generated-product'
}

const productSourceId = (product: EcommerceGalleryVisualProduct): string =>
  product.sourceId?.trim() || `product:${productHandle(product)}`

const generatedRuntimeProduct = (
  product: EcommerceGalleryVisualProduct,
): EcommerceGalleryRuntimeProduct => ({
  ...product,
  productHandle: productHandle(product),
  productSourceId: productSourceId(product),
  purchasable: false,
})

const formatMoney = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      currency: currencyCode.toUpperCase(),
      style: 'currency',
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode.toUpperCase()}`
  }
}

export const resolveEcommerceGalleryProducts = (
  products: Array<EcommerceGalleryVisualProduct>,
  commerce: CommerceController,
): Array<EcommerceGalleryRuntimeProduct> => {
  if (commerce.mode === 'demo') return products.map(generatedRuntimeProduct)
  if (commerce.catalog.length === 0 && commerce.status !== 'ready')
    return products.map(generatedRuntimeProduct)

  const visualsBySourceId = new Map(
    products.map((product) => [productSourceId(product), product]),
  )
  const visualsByHandle = new Map(
    products.map((product) => [productHandle(product), product]),
  )

  return commerce.catalog.map((boundProduct) => {
    const liveProduct = boundProduct.product
    const visual: Partial<EcommerceGalleryVisualProduct> =
      (boundProduct.slot === undefined
        ? undefined
        : (visualsBySourceId.get(boundProduct.slot.sourceId) ??
          visualsByHandle.get(boundProduct.slot.handle))) ?? {}
    const selectedVariant =
      liveProduct.variants.find((variant) => variant.available !== false) ??
      liveProduct.variants[0]
    const selectedPrice =
      selectedVariant?.calculatedPrice ?? selectedVariant?.prices[0]
    const originalPrice = selectedVariant?.originalPrice

    return {
      ...visual,
      imageAlt: liveProduct.title,
      imageSrc: liveProduct.thumbnail ?? liveProduct.images[0]?.url,
      name: liveProduct.title,
      oldPrice:
        originalPrice === undefined
          ? visual.oldPrice
          : formatMoney(originalPrice.amount, originalPrice.currencyCode),
      price:
        selectedPrice === undefined
          ? (visual.price ?? '')
          : formatMoney(selectedPrice.amount, selectedPrice.currencyCode),
      productHandle: liveProduct.handle,
      productSourceId: liveProduct.sourceId,
      purchasable: boundProduct.purchasable,
    }
  })
}
