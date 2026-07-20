export type CommerceStoreRef =
  | {
      kind: 'sessions'
      sessionId: string
    }
  | {
      deploymentSlug: string
      kind: 'deployments'
    }

export type CommerceMoney = {
  /** Finite, non-negative amount expressed in major currency units. */
  amount: number
  /** Normalized lowercase ISO 4217 currency code. */
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
  /** Provider-assigned ID, when a provider-backed record exists. */
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
  /** Provider-assigned ID, when a provider-backed record exists. */
  id?: string
  images: Array<CommerceProductImage>
  options: Array<CommerceProductOption>
  sourceId: string
  tags: Array<CommerceProductTag>
  thumbnail?: string
  title: string
  variants: Array<CommerceProductVariant>
}

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

export type CommerceOrder = CommerceTotals & {
  displayId?: string
  email?: string
  fulfillmentStatus?: string
  id: string
  lines: Array<CommerceCartLine>
  paymentStatus?: string
  status: string
  store: CommerceStoreRef
}

export type CommerceError = {
  code: string
  correlationId: string
  fieldErrors?: Record<string, Array<string>>
  message: string
  retryable: boolean
}
