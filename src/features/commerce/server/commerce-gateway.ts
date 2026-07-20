import type { MedusaCommerceProduct } from './medusa-store-product'
import { assertPublicUrl } from '@ship-fast/engine/clone/security.ts'
import {
  medusaStoreProductFields,
  normalizeMedusaStoreProduct,
} from './medusa-store-product'
import {
  normalizeMedusaOrder,
  normalizeMedusaPaymentAction,
  normalizeMedusaPaymentProviders,
  normalizeMedusaPaymentSessions,
  normalizeMedusaShippingOptions,
} from './medusa-store-checkout'
import { isValidMedusaResourceId } from './medusa-store-request'
import { CommerceFailure } from './commerce-error'
import type { ResolvedCommerceTenant } from './commerce-tenant-resolver'
import type {
  CommerceOrder,
  CommercePaymentProvider,
  CommercePaymentSession,
  CommerceShippingOption,
  PaymentAction,
} from '../contracts'

const DEFAULT_PROVIDER_TIMEOUT_MS = 8_000
const MAX_PROVIDER_RESPONSE_BYTES = 2_000_000
const MAX_PROVIDER_REQUEST_BYTES = 64_000
const MAX_LINE_QUANTITY = 1000

type FetchLike = typeof fetch
type JsonRecord = Record<string, unknown>

export type CommerceCartEnvelope = {
  cart: JsonRecord
}

export type CommerceCatalogEnvelope = {
  products: Array<MedusaCommerceProduct>
}

export type CreateCommerceCartInput = {
  regionId?: string
}

export type AddCommerceItemInput = {
  quantity: number
  variantId: string
}

export type UpdateCommerceItemInput = {
  quantity: number
}

export type AddCommerceShippingMethodInput = {
  shippingOptionId: string
}

export type CommerceShippingOptionsEnvelope = {
  shippingOptions: Array<CommerceShippingOption>
}

export type CommercePaymentProvidersEnvelope = {
  paymentProviders: Array<CommercePaymentProvider>
}

export type CreateCommercePaymentSessionsInput = {
  data?: Record<string, unknown>
  providerId: string
}

export type CommercePaymentSessionsEnvelope = {
  paymentAction: PaymentAction
  paymentSessions: Array<CommercePaymentSession>
}

export type CompleteCommerceCartInput = {
  idempotencyKey?: string
}

export type CommerceOrderEnvelope = {
  order: CommerceOrder
}

type MedusaCommerceGatewayOptions = {
  allowPrivateBackendFromTrustedConfiguration?: boolean
  allowPrivateBackendInDevelopment?: boolean
  bindCarts?: boolean
  correlationId: string
  fetch?: FetchLike
  timeoutMs?: number
  validateCartBeforeMutation?: boolean
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function positiveQuantity(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value <= MAX_LINE_QUANTITY
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  )
}

export class MedusaCommerceGateway {
  private readonly bindCarts: boolean
  private readonly fetchImpl: FetchLike
  private readonly timeoutMs: number
  private readonly validateCartBeforeMutation: boolean

  constructor(
    private readonly tenant: ResolvedCommerceTenant,
    private readonly options: MedusaCommerceGatewayOptions,
  ) {
    this.bindCarts = options.bindCarts ?? true
    this.fetchImpl = options.fetch ?? fetch
    this.timeoutMs = options.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS
    this.validateCartBeforeMutation = options.validateCartBeforeMutation ?? true
  }

  private failure(
    input: {
      code: string
      message: string
      retryable?: boolean
      status: number
    },
    cause?: unknown,
  ): CommerceFailure {
    return new CommerceFailure(
      {
        code: input.code,
        correlationId: this.options.correlationId,
        message: input.message,
        retryable: input.retryable ?? false,
        status: input.status,
      },
      cause,
    )
  }

  private providerHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    return {
      ...headers,
      'x-publishable-api-key': this.tenant.publishableKey,
    }
  }

  private async request(
    path: string,
    init: RequestInit = {},
  ): Promise<unknown> {
    if (
      typeof init.body === 'string' &&
      new TextEncoder().encode(init.body).byteLength >
        MAX_PROVIDER_REQUEST_BYTES
    ) {
      throw this.failure({
        code: 'COMMERCE_REQUEST_TOO_LARGE',
        message: 'Commerce request is too large.',
        status: 413,
      })
    }

    const requestUrl = `${this.tenant.backendUrl}${path}`
    await this.assertProviderUrl(requestUrl)

    let response: Response
    let requestSignal: AbortSignal | null | undefined
    try {
      const requestInit: RequestInit = {
        ...init,
        headers: this.providerHeaders(
          isRecord(init.headers)
            ? Object.fromEntries(
                Object.entries(init.headers).filter(
                  (entry): entry is [string, string] =>
                    typeof entry[1] === 'string',
                ),
              )
            : {},
        ),
      }
      if (requestInit.signal === undefined) {
        Object.defineProperty(requestInit, 'signal', {
          enumerable: false,
          value: AbortSignal.timeout(this.timeoutMs),
        })
      }
      requestSignal = requestInit.signal
      if (requestInit.redirect === undefined) {
        Object.defineProperty(requestInit, 'redirect', {
          enumerable: false,
          value: 'error',
        })
      }
      response = await this.fetchImpl(requestUrl, requestInit)
    } catch (error) {
      if (isTimeoutError(error)) {
        throw this.failure(
          {
            code: 'COMMERCE_PROVIDER_TIMEOUT',
            message: 'Commerce provider request timed out.',
            retryable: true,
            status: 504,
          },
          error,
        )
      }
      throw this.failure(
        {
          code: 'COMMERCE_PROVIDER_UNAVAILABLE',
          message: 'Commerce provider is unavailable.',
          retryable: true,
          status: 502,
        },
        error,
      )
    }

    if (!response.ok) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_ERROR',
        message: 'Commerce provider rejected the request.',
        retryable: response.status === 429 || response.status >= 500,
        status: response.status,
      })
    }

    const contentLength = Number(response.headers.get('content-length'))
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_PROVIDER_RESPONSE_BYTES
    ) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned an invalid response.',
        retryable: true,
        status: 502,
      })
    }

    let text: string
    try {
      text = await response.text()
    } catch (error) {
      if (
        isTimeoutError(error) ||
        (requestSignal?.aborted === true &&
          isTimeoutError(requestSignal.reason))
      ) {
        throw this.failure(
          {
            code: 'COMMERCE_PROVIDER_TIMEOUT',
            message: 'Commerce provider request timed out.',
            retryable: true,
            status: 504,
          },
          error,
        )
      }
      throw this.failure(
        {
          code: 'COMMERCE_PROVIDER_UNAVAILABLE',
          message: 'Commerce provider is unavailable.',
          retryable: true,
          status: 502,
        },
        error,
      )
    }
    if (
      new TextEncoder().encode(text).byteLength > MAX_PROVIDER_RESPONSE_BYTES
    ) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned an invalid response.',
        retryable: true,
        status: 502,
      })
    }
    try {
      return JSON.parse(text) as unknown
    } catch (error) {
      throw this.failure(
        {
          code: 'COMMERCE_PROVIDER_MALFORMED',
          message: 'Commerce provider returned an invalid response.',
          retryable: true,
          status: 502,
        },
        error,
      )
    }
  }

  private async assertProviderUrl(requestUrl: string): Promise<void> {
    let backendUrl: URL
    try {
      backendUrl = new URL(this.tenant.backendUrl)
    } catch (error) {
      throw this.failure(
        {
          code: 'COMMERCE_PROVIDER_BLOCKED',
          message: 'Commerce provider URL is not allowed.',
          status: 502,
        },
        error,
      )
    }

    const isOriginOnly =
      (backendUrl.protocol === 'http:' || backendUrl.protocol === 'https:') &&
      backendUrl.username === '' &&
      backendUrl.password === '' &&
      (backendUrl.pathname === '' || backendUrl.pathname === '/') &&
      backendUrl.search === '' &&
      backendUrl.hash === ''
    if (!isOriginOnly) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_BLOCKED',
        message: 'Commerce provider URL is not allowed.',
        status: 502,
      })
    }

    if (
      this.options.allowPrivateBackendFromTrustedConfiguration === true ||
      (this.options.allowPrivateBackendInDevelopment === true &&
        process.env.NODE_ENV !== 'production')
    ) {
      return
    }

    try {
      await assertPublicUrl(requestUrl)
    } catch (error) {
      throw this.failure(
        {
          code: 'COMMERCE_PROVIDER_BLOCKED',
          message: 'Commerce provider URL is not allowed.',
          status: 502,
        },
        error,
      )
    }
  }

  private requireResourceId(
    value: string,
    kind:
      | 'cart'
      | 'line'
      | 'payment collection'
      | 'provider'
      | 'shipping option'
      | 'variant',
  ): string {
    const normalized = value.trim()
    if (isValidMedusaResourceId(normalized)) return normalized
    throw this.failure({
      code: `INVALID_${kind.toUpperCase()}_ID`,
      message: `Commerce ${kind} identifier is invalid.`,
      status: 400,
    })
  }

  private assertMutableCartInput(input: JsonRecord): void {
    if (Object.hasOwn(input, 'metadata')) {
      throw this.failure({
        code: 'RESERVED_CART_METADATA',
        message: 'Commerce tenant metadata cannot be changed.',
        status: 400,
      })
    }
  }

  private requireBoundCart(
    payload: unknown,
    expectedCartId?: string,
    field: 'cart' | 'parent' = 'cart',
  ): CommerceCartEnvelope {
    if (!isRecord(payload) || !isRecord(payload[field])) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned an invalid cart.',
        retryable: true,
        status: 502,
      })
    }
    const cart = payload[field]
    if (
      typeof cart.id !== 'string' ||
      !isValidMedusaResourceId(cart.id) ||
      (expectedCartId !== undefined && cart.id !== expectedCartId)
    ) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned an invalid cart.',
        retryable: true,
        status: 502,
      })
    }
    if (
      (this.bindCarts && !isRecord(cart.metadata)) ||
      (this.bindCarts &&
        isRecord(cart.metadata) &&
        (cart.metadata.ship_fast_scope !== this.tenant.scope ||
          cart.metadata.ship_fast_tenant !== this.tenant.tenant))
    ) {
      throw this.failure({
        code: 'CART_TENANT_MISMATCH',
        message: 'Commerce cart is unavailable for this tenant.',
        status: 404,
      })
    }
    return { cart }
  }

  private async boundCart(cartId: string): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(normalizedCartId)}`,
    )
    return this.requireBoundCart(payload, normalizedCartId)
  }

  private storeRef() {
    return this.tenant.scope === 'sessions'
      ? {
          kind: 'sessions' as const,
          sessionId: this.tenant.tenant,
        }
      : {
          deploymentSlug: this.tenant.tenant,
          kind: 'deployments' as const,
        }
  }

  private cartCurrency(cart: JsonRecord): string {
    if (typeof cart.currency_code === 'string') return cart.currency_code
    throw this.failure({
      code: 'COMMERCE_PROVIDER_MALFORMED',
      message: 'Commerce provider returned an invalid cart.',
      retryable: true,
      status: 502,
    })
  }

  private cartRegionId(cart: JsonRecord): string {
    if (
      typeof cart.region_id === 'string' &&
      isValidMedusaResourceId(cart.region_id)
    ) {
      return cart.region_id
    }
    throw this.failure({
      code: 'COMMERCE_REGION_UNAVAILABLE',
      message: 'Commerce region is unavailable.',
      retryable: true,
      status: 502,
    })
  }

  private paymentCollectionId(cart: JsonRecord): string | undefined {
    const paymentCollection = isRecord(cart.payment_collection)
      ? cart.payment_collection
      : undefined
    const id = paymentCollection?.id
    return typeof id === 'string' && isValidMedusaResourceId(id)
      ? id
      : undefined
  }

  private async defaultRegionId(): Promise<string> {
    let payload: unknown
    try {
      payload = await this.request('/store/regions')
    } catch (error) {
      if (
        error instanceof CommerceFailure &&
        error.commerceError.code === 'COMMERCE_PROVIDER_ERROR'
      ) {
        throw this.failure(
          {
            code: 'COMMERCE_REGION_ERROR',
            message: 'Commerce provider rejected the region request.',
            retryable: error.commerceError.retryable,
            status: error.status,
          },
          error,
        )
      }
      throw error
    }
    if (!isRecord(payload) || !Array.isArray(payload.regions)) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned invalid regions.',
        retryable: true,
        status: 502,
      })
    }
    const regionId = payload.regions.find(
      (region): region is { id: string } =>
        isRecord(region) &&
        typeof region.id === 'string' &&
        isValidMedusaResourceId(region.id),
    )?.id
    if (regionId === undefined) {
      throw this.failure({
        code: 'COMMERCE_REGION_UNAVAILABLE',
        message: 'Commerce region is unavailable.',
        retryable: true,
        status: 502,
      })
    }
    return regionId
  }

  async catalog(): Promise<CommerceCatalogEnvelope> {
    const regionId = await this.defaultRegionId()
    const payload = await this.request(
      `/store/products?limit=100&region_id=${encodeURIComponent(
        regionId,
      )}&fields=${encodeURIComponent(medusaStoreProductFields)}`,
    )
    if (!isRecord(payload) || !Array.isArray(payload.products)) {
      throw this.failure({
        code: 'COMMERCE_PROVIDER_MALFORMED',
        message: 'Commerce provider returned an invalid catalog.',
        retryable: true,
        status: 502,
      })
    }
    return {
      products: payload.products.flatMap((product) => {
        const normalized = normalizeMedusaStoreProduct(
          this.tenant.tenant,
          product,
        )
        return normalized === undefined ? [] : [normalized]
      }),
    }
  }

  async createCart(
    input: CreateCommerceCartInput = {},
  ): Promise<CommerceCartEnvelope> {
    const regionId =
      input.regionId === undefined
        ? await this.defaultRegionId()
        : this.requireResourceId(input.regionId, 'variant')
    const payload = await this.request('/store/carts', {
      body: JSON.stringify({
        ...(this.bindCarts
          ? {
              metadata: {
                ship_fast_scope: this.tenant.scope,
                ship_fast_tenant: this.tenant.tenant,
              },
            }
          : {}),
        region_id: regionId,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    return this.requireBoundCart(payload)
  }

  async getCart(cartId: string): Promise<CommerceCartEnvelope> {
    return await this.boundCart(cartId)
  }

  async updateCart(
    cartId: string,
    input: JsonRecord,
  ): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    this.assertMutableCartInput(input)
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(normalizedCartId)}`,
      {
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    )
    return this.requireBoundCart(payload, normalizedCartId)
  }

  async addItem(
    cartId: string,
    input: AddCommerceItemInput,
  ): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const variantId = this.requireResourceId(input.variantId, 'variant')
    if (!positiveQuantity(input.quantity)) {
      throw this.failure({
        code: 'INVALID_QUANTITY',
        message: 'Commerce quantity must be a positive integer.',
        status: 400,
      })
    }
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(normalizedCartId)}/line-items`,
      {
        body: JSON.stringify({
          variant_id: variantId,
          quantity: input.quantity,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    )
    return this.requireBoundCart(payload, normalizedCartId)
  }

  async updateItem(
    cartId: string,
    lineId: string,
    input: UpdateCommerceItemInput,
  ): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const normalizedLineId = this.requireResourceId(lineId, 'line')
    if (!positiveQuantity(input.quantity)) {
      throw this.failure({
        code: 'INVALID_QUANTITY',
        message: 'Commerce quantity must be a positive integer.',
        status: 400,
      })
    }
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(
        normalizedCartId,
      )}/line-items/${encodeURIComponent(normalizedLineId)}`,
      {
        body: JSON.stringify({ quantity: input.quantity }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    )
    return this.requireBoundCart(payload, normalizedCartId)
  }

  async removeItem(
    cartId: string,
    lineId: string,
  ): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const normalizedLineId = this.requireResourceId(lineId, 'line')
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(
        normalizedCartId,
      )}/line-items/${encodeURIComponent(normalizedLineId)}`,
      { method: 'DELETE' },
    )
    return this.requireBoundCart(payload, normalizedCartId, 'parent')
  }

  async getShippingOptions(
    cartId: string,
  ): Promise<CommerceShippingOptionsEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const { cart } = await this.boundCart(normalizedCartId)
    const payload = await this.request(
      `/store/shipping-options?cart_id=${encodeURIComponent(normalizedCartId)}`,
    )
    return {
      shippingOptions: normalizeMedusaShippingOptions(
        this.cartCurrency(cart),
        payload,
      ),
    }
  }

  async addShippingMethod(
    cartId: string,
    input: AddCommerceShippingMethodInput,
  ): Promise<CommerceCartEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const shippingOptionId = this.requireResourceId(
      input.shippingOptionId,
      'shipping option',
    )
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(normalizedCartId)}/shipping-methods`,
      {
        body: JSON.stringify({ data: {}, option_id: shippingOptionId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    )
    return this.requireBoundCart(payload, normalizedCartId)
  }

  async getPaymentProviders(
    cartId: string,
  ): Promise<CommercePaymentProvidersEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const { cart } = await this.boundCart(normalizedCartId)
    const payload = await this.request(
      `/store/payment-providers?region_id=${encodeURIComponent(
        this.cartRegionId(cart),
      )}`,
    )
    return { paymentProviders: normalizeMedusaPaymentProviders(payload) }
  }

  async createPaymentSessions(
    cartId: string,
    input: CreateCommercePaymentSessionsInput,
  ): Promise<CommercePaymentSessionsEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    const providerId = this.requireResourceId(input.providerId, 'provider')
    const { cart } = await this.boundCart(normalizedCartId)
    const existingPaymentCollectionId = this.paymentCollectionId(cart)
    const paymentCollectionId =
      existingPaymentCollectionId ??
      this.requireCreatedPaymentCollectionId(
        await this.request('/store/payment-collections', {
          body: JSON.stringify({ cart_id: normalizedCartId }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        }),
      )
    const payload = await this.request(
      `/store/payment-collections/${encodeURIComponent(
        paymentCollectionId,
      )}/payment-sessions`,
      {
        body: JSON.stringify({
          ...(input.data === undefined ? {} : { data: input.data }),
          provider_id: providerId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    )
    const paymentCollection = isRecord(payload)
      ? payload.payment_collection
      : undefined
    const paymentSessions = normalizeMedusaPaymentSessions({
      payment_sessions: isRecord(paymentCollection)
        ? paymentCollection.payment_sessions
        : undefined,
    })
    const paymentAction =
      paymentSessions.find((session) => session.status === 'requires_action') ??
      paymentSessions[0]

    return {
      paymentAction:
        paymentAction === undefined
          ? { type: 'none' }
          : normalizeMedusaPaymentAction(paymentAction),
      paymentSessions,
    }
  }

  private requireCreatedPaymentCollectionId(payload: unknown): string {
    const paymentCollection = isRecord(payload)
      ? payload.payment_collection
      : undefined
    const id = isRecord(paymentCollection) ? paymentCollection.id : undefined
    if (typeof id === 'string' && isValidMedusaResourceId(id)) return id
    throw this.failure({
      code: 'COMMERCE_PROVIDER_MALFORMED',
      message: 'Commerce provider returned invalid payment data.',
      retryable: true,
      status: 502,
    })
  }

  async completeCart(
    cartId: string,
    input: CompleteCommerceCartInput = {},
  ): Promise<CommerceOrderEnvelope> {
    const normalizedCartId = this.requireResourceId(cartId, 'cart')
    if (this.validateCartBeforeMutation) {
      await this.boundCart(normalizedCartId)
    }
    const payload = await this.request(
      `/store/carts/${encodeURIComponent(normalizedCartId)}/complete`,
      {
        headers:
          input.idempotencyKey === undefined
            ? {}
            : { 'Idempotency-Key': input.idempotencyKey },
        method: 'POST',
      },
    )
    if (!isRecord(payload) || payload.type !== 'order') {
      throw this.failure({
        code: 'COMMERCE_CHECKOUT_INCOMPLETE',
        message: 'Commerce checkout could not be completed.',
        retryable: true,
        status: 409,
      })
    }
    return {
      order: normalizeMedusaOrder(
        this.storeRef(),
        normalizedCartId,
        payload.order,
      ),
    }
  }
}
