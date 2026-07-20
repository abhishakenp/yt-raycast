export type CommerceStoreRef =
  | {
      kind: 'sessions'
      sessionId: string
    }
  | {
      deploymentSlug: string
      kind: 'deployments'
    }

export type CommerceScope = CommerceStoreRef['kind']

export type CommerceMoney = {
  amount: number
  currencyCode: string
}

export type CommerceProductImage = {
  alt?: string
  sourceId?: string
  url: string
}

export type CommerceProductCollection = {
  handle: string
  sourceId?: string
  title: string
}

export type CommerceProductTag = {
  sourceId?: string
  value: string
}

export type CommerceProductOption = {
  sourceId?: string
  title: string
  values: Array<string>
}

export type CommerceInventory = {
  inventoryQuantity?: number
  manageInventory: boolean
}

export type CommerceProductVariant = CommerceInventory & {
  available?: boolean
  calculatedPrice?: CommerceMoney
  id?: string
  optionValues: Record<string, string>
  originalPrice?: CommerceMoney
  prices: Array<CommerceMoney>
  sku?: string
  sourceId: string
  title: string
}

export type CommerceProduct = {
  collections: Array<CommerceProductCollection>
  description?: string
  handle: string
  id?: string
  images: Array<CommerceProductImage>
  options: Array<CommerceProductOption>
  sourceId: string
  tags: Array<CommerceProductTag>
  thumbnail?: string
  title: string
  variants: Array<CommerceProductVariant>
}

export type CommerceCatalogProduct = CommerceProduct & {
  sourceHandle?: string
}

export type CommerceProductSlot = {
  fallback: CommerceProduct
  handle: string
  sourceId: string
}

export type CommerceCatalogEnvelope = {
  products: Array<CommerceCatalogProduct>
}

export type CommerceCatalogAdapter = {
  catalog: () => Promise<CommerceCatalogEnvelope>
}

export type CommerceRuntimeMode = 'demo' | 'disabled' | 'hosted' | 'sdk'

export type CommerceTotals = {
  discountTotal?: CommerceMoney
  shippingTotal?: CommerceMoney
  subtotal: CommerceMoney
  taxTotal?: CommerceMoney
  total: CommerceMoney
}

export type CommerceCartLine = {
  id: string
  product: Pick<CommerceProduct, 'handle' | 'sourceId' | 'thumbnail' | 'title'>
  quantity: number
  total: CommerceMoney
  unitPrice: CommerceMoney
  variant: CommerceProductVariant
}

export type CommerceCart = CommerceTotals & {
  completedAt?: string
  currencyCode: string
  id: string
  lines: Array<CommerceCartLine>
  regionId?: string
  status: 'active' | 'completed'
  store: CommerceStoreRef
}

export type CommerceShippingOption = {
  amount: CommerceMoney
  description?: string
  id: string
  name: string
}

export type CommercePaymentSession = {
  data?: Record<string, unknown>
  id: string
  provider: string
  status: 'authorized' | 'canceled' | 'error' | 'pending' | 'requires_action'
}

export type CommercePaymentProvider = {
  id: string
  name: string
}

export type PaymentAction =
  | {
      type: 'none'
    }
  | {
      type: 'redirect'
      url: string
    }
  | {
      data: Record<string, unknown>
      provider: string
      type: 'client-session'
    }

export type CommerceOrderStatus = 'canceled' | 'completed' | 'pending'

export type CommerceOrderPaymentStatus =
  | 'authorized'
  | 'canceled'
  | 'captured'
  | 'failed'
  | 'pending'
  | 'refunded'

export type CommerceOrderFulfillmentStatus =
  | 'canceled'
  | 'delivered'
  | 'fulfilled'
  | 'partially_fulfilled'
  | 'pending'
  | 'returned'
  | 'shipped'

export type CommerceOrder = CommerceTotals & {
  displayId?: string
  email?: string
  fulfillmentStatus?: CommerceOrderFulfillmentStatus
  id: string
  lines: Array<CommerceCartLine>
  paymentStatus?: CommerceOrderPaymentStatus
  status: CommerceOrderStatus
  store: CommerceStoreRef
}

export type CommerceError = {
  code: string
  correlationId: string
  fieldErrors?: Record<string, Array<string>>
  message: string
  retryable: boolean
}
