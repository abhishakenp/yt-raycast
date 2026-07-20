import type {
  CommerceCart,
  CommerceCartLine,
  CommerceMoney,
  CommerceOrder,
  CommerceOrderFulfillmentStatus,
  CommerceOrderPaymentStatus,
  CommerceOrderStatus,
  CommercePaymentProvider,
  CommercePaymentSession,
  CommerceProductVariant,
  CommerceShippingOption,
  CommerceStoreRef,
  PaymentAction,
} from '../contracts'

type MedusaCheckoutNormalizationErrorCode =
  | 'INVALID_MEDUSA_CHECKOUT_PAYLOAD'
  | 'MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE'
  | 'MEDUSA_ORDER_CART_MISMATCH'
  | 'MEDUSA_PAYMENT_ACTION_UNAVAILABLE'

const ERROR_MESSAGES: Record<MedusaCheckoutNormalizationErrorCode, string> = {
  INVALID_MEDUSA_CHECKOUT_PAYLOAD: 'Medusa checkout payload is invalid.',
  MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE:
    'Medusa checkout payload exceeds safe limits.',
  MEDUSA_ORDER_CART_MISMATCH: 'Order does not belong to the requested cart.',
  MEDUSA_PAYMENT_ACTION_UNAVAILABLE: 'Payment action is unavailable.',
}

const MAX_CHECKOUT_JSON_LENGTH = 262_144
const MAX_COLLECTION_LENGTH = 100
const MAX_PAYMENT_COLLECTION_LENGTH = 20
const MAX_PROVIDER_DATA_JSON_LENGTH = 4_096
const MAX_PROVIDER_DATA_KEYS = 32
const MAX_PROVIDER_DATA_DEPTH = 3
const MAX_PROVIDER_DATA_ARRAY_LENGTH = 20
const MAX_IDENTIFIER_LENGTH = 128
const MAX_TEXT_LENGTH = 256
const MAX_PROVIDER_VALUE_LENGTH = 1_024
const MAX_REDIRECT_URL_LENGTH = 2_048
const MAX_MONEY_AMOUNT = 1_000_000_000_000
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/
const PROVIDER_DATA_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/
const SENSITIVE_PROVIDER_KEY_PATTERN =
  /(?:address|authorization|cookie|email|error|message|name|password|phone|stack)/i

export class MedusaCheckoutNormalizationError extends Error {
  declare readonly code: MedusaCheckoutNormalizationErrorCode
}

type RecordValue = Record<string, unknown>
type IsRecord = (value: unknown) => value is RecordValue
type Fail = (code: MedusaCheckoutNormalizationErrorCode) => never
type AssertPayloadBudget = (value: unknown) => void
type RequireRecord = (value: unknown) => RecordValue
type RequireIdentifier = (value: unknown) => string
type OptionalIdentifier = (value: unknown) => string | undefined
type RequireText = (value: unknown) => string
type OptionalText = (value: unknown) => string | undefined
type RequireCurrency = (value: unknown) => string
type RequireAmount = (value: unknown) => number
type OptionalAmount = (value: unknown) => number | undefined
type RequireQuantity = (value: unknown) => number
type RequireArray = (value: unknown, maximumLength?: number) => Array<unknown>
type NormalizeMoney = (amount: unknown, currencyCode: string) => CommerceMoney
type NormalizeOptionalMoney = (
  amount: unknown,
  currencyCode: string,
) => CommerceMoney | undefined
type NormalizeStore = (store: CommerceStoreRef) => CommerceStoreRef
type NormalizeCartLine = (
  value: unknown,
  currencyCode: string,
) => CommerceCartLine
type NormalizeCart = (store: CommerceStoreRef, value: unknown) => CommerceCart
type NormalizeOrder = (
  store: CommerceStoreRef,
  expectedCartId: string,
  value: unknown,
) => CommerceOrder
type NormalizeShippingOptions = (
  currencyCode: string,
  value: unknown,
) => Array<CommerceShippingOption>
type NormalizePaymentProviders = (
  value: unknown,
) => Array<CommercePaymentProvider>
type NormalizePaymentSessions = (
  value: unknown,
) => Array<CommercePaymentSession>
type NormalizePaymentAction = (session: CommercePaymentSession) => PaymentAction
type MetadataValue = (value: RecordValue, key: string) => string | undefined
type SafeHttpUrl = (value: unknown) => string | undefined
type NormalizeOptionValues = (value: unknown) => Record<string, string>
type NormalizeLines = (
  value: unknown,
  currencyCode: string,
) => Array<CommerceCartLine>
type NormalizeCartStatus = (
  value: unknown,
  completedAt: unknown,
) => CommerceCart['status']
type CollectionFromEnvelope = (
  value: unknown,
  key: string,
  maximumLength: number,
) => Array<unknown>
type NormalizePaymentSessionStatus = (
  value: unknown,
) => CommercePaymentSession['status']
type RedirectCandidate = (data: Record<string, unknown>) => unknown
type NormalizeOrderStatus = (value: unknown) => CommerceOrderStatus
type NormalizePaymentStatus = (
  value: unknown,
) => CommerceOrderPaymentStatus | undefined
type NormalizeFulfillmentStatus = (
  value: unknown,
) => CommerceOrderFulfillmentStatus | undefined
type NormalizeDisplayId = (value: unknown) => string | undefined

const isRecord: IsRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const fail: Fail = (code) => {
  const error = new MedusaCheckoutNormalizationError(ERROR_MESSAGES[code])
  Object.defineProperties(error, {
    code: { enumerable: true, value: code },
    name: { value: 'MedusaCheckoutNormalizationError' },
  })
  throw error
}

const assertPayloadBudget: AssertPayloadBudget = (value) => {
  let serialized: string | undefined
  try {
    serialized = JSON.stringify(value)
  } catch {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  if (
    serialized === undefined ||
    serialized.length > MAX_CHECKOUT_JSON_LENGTH
  ) {
    return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
}

const requireRecord: RequireRecord = (value) =>
  isRecord(value) ? value : fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')

const requireIdentifier: RequireIdentifier = (value) => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_IDENTIFIER_LENGTH ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  return value
}

const optionalIdentifier: OptionalIdentifier = (value) =>
  value === undefined || value === null ? undefined : requireIdentifier(value)

const requireText: RequireText = (value) => {
  if (typeof value !== 'string') {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  const text = value.trim()
  if (text.length === 0 || text.length > MAX_TEXT_LENGTH) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  return text
}

const optionalText: OptionalText = (value) =>
  value === undefined || value === null ? undefined : requireText(value)

const requireCurrency: RequireCurrency = (value) => {
  if (typeof value !== 'string' || !/^[A-Za-z]{3}$/.test(value)) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  return value.toLowerCase()
}

const requireAmount: RequireAmount = (value) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > MAX_MONEY_AMOUNT
  ) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  return value
}

const optionalAmount: OptionalAmount = (value) =>
  value === undefined || value === null ? undefined : requireAmount(value)

const requireQuantity: RequireQuantity = (value) => {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  return Number(value)
}

const requireArray: RequireArray = (
  value,
  maximumLength = MAX_COLLECTION_LENGTH,
) => {
  if (!Array.isArray(value)) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  if (value.length > maximumLength) {
    return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
  return value
}

const normalizeMoney: NormalizeMoney = (amount, currencyCode) => ({
  amount: requireAmount(amount),
  currencyCode,
})

const normalizeOptionalMoney: NormalizeOptionalMoney = (
  amount,
  currencyCode,
) => {
  const normalizedAmount = optionalAmount(amount)
  return normalizedAmount === undefined
    ? undefined
    : { amount: normalizedAmount, currencyCode }
}

const normalizeStore: NormalizeStore = (store) =>
  store.kind === 'sessions'
    ? {
        kind: 'sessions',
        sessionId: requireIdentifier(store.sessionId),
      }
    : {
        deploymentSlug: requireIdentifier(store.deploymentSlug),
        kind: 'deployments',
      }

const metadataValue: MetadataValue = (value, key) => {
  const metadata = isRecord(value.metadata) ? value.metadata : undefined
  return metadata === undefined ? undefined : optionalIdentifier(metadata[key])
}

const safeHttpUrl: SafeHttpUrl = (value) => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_REDIRECT_URL_LENGTH
  ) {
    return undefined
  }
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.username === '' &&
      url.password === ''
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

const normalizeOptionValues: NormalizeOptionValues = (value) => {
  if (value === undefined || value === null) return {}
  return Object.fromEntries(
    requireArray(value, 50).map((candidate) => {
      const optionValue = requireRecord(candidate)
      const nestedOption = isRecord(optionValue.option)
        ? optionValue.option
        : undefined
      const title = requireText(
        nestedOption?.title ?? optionValue.title ?? optionValue.option_title,
      )
      return [title, requireText(optionValue.value)]
    }),
  )
}

const normalizeCartLine: NormalizeCartLine = (value, currencyCode) => {
  const line = requireRecord(value)
  const product = isRecord(line.product) ? line.product : {}
  const variant = isRecord(line.variant) ? line.variant : {}
  const lineId = requireIdentifier(line.id)
  const productProviderId = requireIdentifier(product.id ?? line.product_id)
  const productSourceId =
    metadataValue(product, 'ship_fast_generated_source_id') ?? productProviderId
  const productHandle =
    metadataValue(product, 'ship_fast_generated_handle') ??
    requireIdentifier(product.handle ?? line.product_handle)
  const variantProviderId = requireIdentifier(variant.id ?? line.variant_id)
  const variantSourceId =
    metadataValue(variant, 'ship_fast_generated_source_id') ?? variantProviderId
  const unitPrice = normalizeMoney(line.unit_price, currencyCode)
  const thumbnail = safeHttpUrl(line.thumbnail ?? product.thumbnail)
  const sku = optionalIdentifier(variant.sku ?? line.variant_sku)
  const normalizedVariant: CommerceProductVariant = {
    calculatedPrice: unitPrice,
    id: variantProviderId,
    manageInventory: false,
    optionValues: normalizeOptionValues(variant.options),
    prices: [unitPrice],
    ...(sku === undefined ? {} : { sku }),
    sourceId: variantSourceId,
    title: requireText(variant.title ?? line.variant_title ?? 'Default'),
  }

  return {
    id: lineId,
    product: {
      handle: productHandle,
      sourceId: productSourceId,
      ...(thumbnail === undefined ? {} : { thumbnail }),
      title: requireText(product.title ?? line.product_title),
    },
    quantity: requireQuantity(line.quantity),
    total: normalizeMoney(line.total, currencyCode),
    unitPrice,
    variant: normalizedVariant,
  }
}

const normalizeLines: NormalizeLines = (value, currencyCode) =>
  requireArray(value).map((line) => normalizeCartLine(line, currencyCode))

const normalizeCartStatus: NormalizeCartStatus = (value, completedAt) => {
  if (completedAt !== undefined && completedAt !== null) return 'completed'
  if (value === undefined || value === null || value === 'open') return 'active'
  if (value === 'active') return 'active'
  if (value === 'completed') return 'completed'
  return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
}

export const normalizeMedusaCart: NormalizeCart = (store, value) => {
  assertPayloadBudget(value)
  const cart = requireRecord(value)
  const currencyCode = requireCurrency(cart.currency_code)
  const completedAt = optionalText(cart.completed_at)
  const discountTotal = normalizeOptionalMoney(
    cart.discount_total,
    currencyCode,
  )
  const shippingTotal = normalizeOptionalMoney(
    cart.shipping_total,
    currencyCode,
  )
  const taxTotal = normalizeOptionalMoney(cart.tax_total, currencyCode)
  const regionId = optionalIdentifier(cart.region_id)

  return {
    ...(completedAt === undefined ? {} : { completedAt }),
    currencyCode,
    ...(discountTotal === undefined ? {} : { discountTotal }),
    id: requireIdentifier(cart.id),
    lines: normalizeLines(cart.items, currencyCode),
    ...(regionId === undefined ? {} : { regionId }),
    ...(shippingTotal === undefined ? {} : { shippingTotal }),
    status: normalizeCartStatus(cart.status, cart.completed_at),
    store: normalizeStore(store),
    subtotal: normalizeMoney(cart.subtotal, currencyCode),
    ...(taxTotal === undefined ? {} : { taxTotal }),
    total: normalizeMoney(cart.total, currencyCode),
  }
}

const collectionFromEnvelope: CollectionFromEnvelope = (
  value,
  key,
  maximumLength,
) => {
  const collection = Array.isArray(value) ? value : requireRecord(value)[key]
  return requireArray(collection, maximumLength)
}

export const normalizeMedusaShippingOptions: NormalizeShippingOptions = (
  currencyCodeValue,
  value,
) => {
  assertPayloadBudget(value)
  const currencyCode = requireCurrency(currencyCodeValue)
  return collectionFromEnvelope(
    value,
    'shipping_options',
    MAX_COLLECTION_LENGTH,
  ).map((candidate) => {
    const option = requireRecord(candidate)
    const description = optionalText(option.description)
    return {
      amount: normalizeMoney(option.amount, currencyCode),
      ...(description === undefined ? {} : { description }),
      id: requireIdentifier(option.id),
      name: requireText(option.name),
    }
  })
}

export const normalizeMedusaPaymentProviders: NormalizePaymentProviders = (
  value,
) => {
  assertPayloadBudget(value)
  return collectionFromEnvelope(
    value,
    'payment_providers',
    MAX_PAYMENT_COLLECTION_LENGTH,
  ).map((candidate) => {
    const provider = requireRecord(candidate)
    return {
      id: requireIdentifier(provider.id),
      name: requireText(provider.name ?? provider.id),
    }
  })
}

type SafeProviderValue = null | boolean | number | string | SafeProviderData
type SafeProviderData =
  | Array<SafeProviderValue>
  | Record<string, SafeProviderValue>
type SanitizeProviderValue = (
  value: unknown,
  depth: number,
) => SafeProviderValue
type SanitizeProviderData = (
  value: unknown,
) => Record<string, unknown> | undefined

const sanitizeProviderValue: SanitizeProviderValue = (value, depth) => {
  if (depth > MAX_PROVIDER_DATA_DEPTH) {
    return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
  if (
    value === null ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value
  }
  if (typeof value === 'string') {
    return value.length <= MAX_PROVIDER_VALUE_LENGTH
      ? value
      : fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_PROVIDER_DATA_ARRAY_LENGTH) {
      return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
    }
    return value.map((entry) => sanitizeProviderValue(entry, depth + 1))
  }
  if (!isRecord(value)) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  const entries = Object.entries(value)
  if (entries.length > MAX_PROVIDER_DATA_KEYS) {
    return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
  return Object.fromEntries(
    entries.flatMap(([key, entry]) => {
      if (
        !PROVIDER_DATA_KEY_PATTERN.test(key) ||
        SENSITIVE_PROVIDER_KEY_PATTERN.test(key)
      ) {
        return []
      }
      return [[key, sanitizeProviderValue(entry, depth + 1)]]
    }),
  )
}

const sanitizeProviderData: SanitizeProviderData = (value) => {
  if (value === undefined || value === null) return undefined
  const sanitized = sanitizeProviderValue(value, 0)
  if (!isRecord(sanitized)) {
    return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
  }
  const serialized = JSON.stringify(sanitized)
  if (serialized.length > MAX_PROVIDER_DATA_JSON_LENGTH) {
    return fail('MEDUSA_CHECKOUT_PAYLOAD_TOO_LARGE')
  }
  return Object.keys(sanitized).length === 0 ? undefined : sanitized
}

const normalizePaymentSessionStatus: NormalizePaymentSessionStatus = (
  value,
) => {
  if (
    value === undefined ||
    value === null ||
    value === 'pending' ||
    value === 'not_started'
  ) {
    return 'pending'
  }
  if (value === 'authorized' || value === 'captured') return 'authorized'
  if (value === 'canceled' || value === 'cancelled') return 'canceled'
  if (value === 'error' || value === 'failed') return 'error'
  if (value === 'requires_action' || value === 'requires_more') {
    return 'requires_action'
  }
  return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
}

export const normalizeMedusaPaymentSessions: NormalizePaymentSessions = (
  value,
) => {
  assertPayloadBudget(value)
  return collectionFromEnvelope(
    value,
    'payment_sessions',
    MAX_PAYMENT_COLLECTION_LENGTH,
  ).map((candidate) => {
    const session = requireRecord(candidate)
    const data = sanitizeProviderData(session.data)
    return {
      ...(data === undefined ? {} : { data }),
      id: requireIdentifier(session.id),
      provider: requireIdentifier(session.provider_id ?? session.provider),
      status: normalizePaymentSessionStatus(session.status),
    }
  })
}

const redirectCandidate: RedirectCandidate = (data) => {
  if ('redirect_url' in data) return data.redirect_url
  if ('redirectUrl' in data) return data.redirectUrl
  const nextAction = isRecord(data.next_action) ? data.next_action : undefined
  const redirectToUrl =
    nextAction !== undefined && isRecord(nextAction.redirect_to_url)
      ? nextAction.redirect_to_url
      : undefined
  return redirectToUrl?.url
}

export const normalizeMedusaPaymentAction: NormalizePaymentAction = (
  session,
) => {
  if (session.status !== 'requires_action') return { type: 'none' }
  const data = sanitizeProviderData(session.data)
  if (data === undefined) {
    return fail('MEDUSA_PAYMENT_ACTION_UNAVAILABLE')
  }
  const candidate = redirectCandidate(data)
  if (candidate !== undefined) {
    const url = safeHttpUrl(candidate)
    return url === undefined
      ? fail('MEDUSA_PAYMENT_ACTION_UNAVAILABLE')
      : { type: 'redirect', url }
  }
  return Object.keys(data).length === 0
    ? fail('MEDUSA_PAYMENT_ACTION_UNAVAILABLE')
    : {
        data,
        provider: requireIdentifier(session.provider),
        type: 'client-session',
      }
}

const normalizeOrderStatus: NormalizeOrderStatus = (value) => {
  if (value === 'completed') return 'completed'
  if (value === 'canceled' || value === 'cancelled') return 'canceled'
  if (
    value === undefined ||
    value === null ||
    value === 'draft' ||
    value === 'pending' ||
    value === 'requires_action'
  ) {
    return 'pending'
  }
  return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
}

const normalizePaymentStatus: NormalizePaymentStatus = (value) => {
  if (value === undefined || value === null) return undefined
  if (
    value === 'authorized' ||
    value === 'canceled' ||
    value === 'captured' ||
    value === 'failed' ||
    value === 'pending' ||
    value === 'refunded'
  ) {
    return value
  }
  if (value === 'not_paid' || value === 'awaiting') return 'pending'
  if (value === 'partially_authorized') return 'authorized'
  if (value === 'partially_captured') return 'captured'
  if (value === 'partially_refunded') return 'refunded'
  return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
}

const normalizeFulfillmentStatus: NormalizeFulfillmentStatus = (value) => {
  if (value === undefined || value === null) return undefined
  if (value === 'not_fulfilled' || value === 'pending') return 'pending'
  if (value === 'partially_fulfilled' || value === 'partially_shipped') {
    return 'partially_fulfilled'
  }
  if (
    value === 'canceled' ||
    value === 'delivered' ||
    value === 'fulfilled' ||
    value === 'returned' ||
    value === 'shipped'
  ) {
    return value
  }
  return fail('INVALID_MEDUSA_CHECKOUT_PAYLOAD')
}

const normalizeDisplayId: NormalizeDisplayId = (value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return String(value)
  }
  return requireIdentifier(value)
}

export const normalizeMedusaOrder: NormalizeOrder = (
  store,
  expectedCartIdValue,
  value,
) => {
  assertPayloadBudget(value)
  const order = requireRecord(value)
  const expectedCartId = requireIdentifier(expectedCartIdValue)
  const cartId = requireIdentifier(order.cart_id)
  if (cartId !== expectedCartId) {
    return fail('MEDUSA_ORDER_CART_MISMATCH')
  }
  const currencyCode = requireCurrency(order.currency_code)
  const displayId = normalizeDisplayId(order.display_id)
  const discountTotal = normalizeOptionalMoney(
    order.discount_total,
    currencyCode,
  )
  const fulfillmentStatus = normalizeFulfillmentStatus(order.fulfillment_status)
  const paymentStatus = normalizePaymentStatus(order.payment_status)
  const shippingTotal = normalizeOptionalMoney(
    order.shipping_total,
    currencyCode,
  )
  const taxTotal = normalizeOptionalMoney(order.tax_total, currencyCode)

  return {
    ...(discountTotal === undefined ? {} : { discountTotal }),
    ...(displayId === undefined ? {} : { displayId }),
    ...(fulfillmentStatus === undefined ? {} : { fulfillmentStatus }),
    id: requireIdentifier(order.id),
    lines: normalizeLines(order.items, currencyCode),
    ...(paymentStatus === undefined ? {} : { paymentStatus }),
    ...(shippingTotal === undefined ? {} : { shippingTotal }),
    status: normalizeOrderStatus(order.status),
    store: normalizeStore(store),
    subtotal: normalizeMoney(order.subtotal, currencyCode),
    ...(taxTotal === undefined ? {} : { taxTotal }),
    total: normalizeMoney(order.total, currencyCode),
  }
}
