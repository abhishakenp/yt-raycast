import axios, { type AxiosInstance } from 'axios'

import type {
  AddCommerceShippingMethodInput,
  AddCommerceItemInput,
  CommerceCartEnvelope,
  CommerceCatalogEnvelope,
  CommerceOrderEnvelope,
  CommercePaymentProvidersEnvelope,
  CommercePaymentSessionsEnvelope,
  CommerceShippingOptionsEnvelope,
  CompleteCommerceCartInput,
  CreateCommercePaymentSessionsInput,
  CreateCommerceCartInput,
  UpdateCommerceItemInput,
} from '../server/commerce-gateway'
import type { CommerceScope } from '../server/commerce-tenant-resolver'
import type { CommerceAdapter } from './commerce-adapter'

const CART_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/

type CommerceCartStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

type HostedCommerceAdapterOptions = {
  anonymousOwnerSecret?: string
  axios?: AxiosInstance
  bearerToken?: string
  scope: CommerceScope
  storage?: CommerceCartStorage
  tenant: string
}

function browserStorage(): CommerceCartStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export class HostedCommerceAdapter implements CommerceAdapter {
  private readonly axios: AxiosInstance
  private readonly basePath: string
  private readonly cartStorageKey: string
  private readonly requestConfig: {
    headers: Record<string, string>
  }
  private readonly storage: CommerceCartStorage | undefined

  constructor(options: HostedCommerceAdapterOptions) {
    this.axios = options.axios ?? axios
    this.basePath = `/api/commerce/${encodeURIComponent(
      options.scope,
    )}/${encodeURIComponent(options.tenant)}`
    this.cartStorageKey = `ship-fast:commerce:${options.scope}:${options.tenant}`
    this.storage = options.storage ?? browserStorage()
    this.requestConfig = {
      headers: {
        ...(options.bearerToken === undefined
          ? {}
          : { Authorization: `Bearer ${options.bearerToken}` }),
        ...(options.anonymousOwnerSecret === undefined
          ? {}
          : {
              'x-ship-fast-owner-secret': options.anonymousOwnerSecret,
            }),
      },
    }
  }

  private readStoredCartId(): string | undefined {
    try {
      const value = this.storage?.getItem(this.cartStorageKey)?.trim()
      return value !== undefined && CART_ID_PATTERN.test(value)
        ? value
        : undefined
    } catch {
      return undefined
    }
  }

  private writeStoredCartId(cartId: string): void {
    if (!CART_ID_PATTERN.test(cartId)) return
    try {
      this.storage?.setItem(this.cartStorageKey, cartId)
    } catch {
      // Storage is optional. The caller can continue with the returned cart ID.
    }
  }

  private clearStoredCartId(): void {
    try {
      this.storage?.removeItem(this.cartStorageKey)
    } catch {
      // Storage is optional. The completed order is still authoritative.
    }
  }

  private cartId(explicitCartId?: string): string {
    const cartId = explicitCartId?.trim() || this.readStoredCartId()
    if (cartId === undefined || !CART_ID_PATTERN.test(cartId)) {
      throw new Error('Commerce cart is unavailable.')
    }
    return cartId
  }

  async catalog(): Promise<CommerceCatalogEnvelope> {
    const response = await this.axios.get<CommerceCatalogEnvelope>(
      `${this.basePath}/catalog`,
      this.requestConfig,
    )
    return response.data
  }

  async createCart(
    input: CreateCommerceCartInput = {},
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.post<CommerceCartEnvelope>(
      `${this.basePath}/carts`,
      input,
      this.requestConfig,
    )
    const cartId = response.data.cart.id
    if (typeof cartId === 'string') this.writeStoredCartId(cartId)
    return response.data
  }

  async getCart(cartId?: string): Promise<CommerceCartEnvelope> {
    const response = await this.axios.get<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(this.cartId(cartId))}`,
      this.requestConfig,
    )
    return response.data
  }

  async updateCart(
    input: Record<string, unknown>,
    cartId?: string,
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.patch<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(this.cartId(cartId))}`,
      input,
      this.requestConfig,
    )
    return response.data
  }

  async addItem(
    input: AddCommerceItemInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.post<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(this.cartId(cartId))}/items`,
      input,
      this.requestConfig,
    )
    return response.data
  }

  async updateItem(
    lineId: string,
    input: UpdateCommerceItemInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.patch<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/items/${encodeURIComponent(lineId)}`,
      input,
      this.requestConfig,
    )
    return response.data
  }

  async removeItem(
    lineId: string,
    cartId?: string,
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.delete<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/items/${encodeURIComponent(lineId)}`,
      this.requestConfig,
    )
    return response.data
  }

  async getShippingOptions(
    cartId?: string,
  ): Promise<CommerceShippingOptionsEnvelope> {
    const response = await this.axios.get<CommerceShippingOptionsEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/shipping-options`,
      this.requestConfig,
    )
    return response.data
  }

  async addShippingMethod(
    input: AddCommerceShippingMethodInput,
    cartId?: string,
  ): Promise<CommerceCartEnvelope> {
    const response = await this.axios.post<CommerceCartEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/shipping-methods`,
      input,
      this.requestConfig,
    )
    return response.data
  }

  async getPaymentProviders(
    cartId?: string,
  ): Promise<CommercePaymentProvidersEnvelope> {
    const response = await this.axios.get<CommercePaymentProvidersEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/payment-providers`,
      this.requestConfig,
    )
    return response.data
  }

  async createPaymentSessions(
    input: CreateCommercePaymentSessionsInput,
    cartId?: string,
  ): Promise<CommercePaymentSessionsEnvelope> {
    const response = await this.axios.post<CommercePaymentSessionsEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/payment-sessions`,
      input,
      this.requestConfig,
    )
    return response.data
  }

  async completeCart(
    input: CompleteCommerceCartInput = {},
    cartId?: string,
  ): Promise<CommerceOrderEnvelope> {
    const response = await this.axios.post<CommerceOrderEnvelope>(
      `${this.basePath}/carts/${encodeURIComponent(
        this.cartId(cartId),
      )}/complete`,
      input,
      this.requestConfig,
    )
    this.clearStoredCartId()
    return response.data
  }
}
