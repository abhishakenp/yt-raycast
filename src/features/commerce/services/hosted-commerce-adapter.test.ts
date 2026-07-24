import type { AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { HostedCommerceAdapter } from './hosted-commerce-adapter'

const axiosClient = () => {
  const get = vi.fn()
  const post = vi.fn()
  const patch = vi.fn()
  const deleteRequest = vi.fn()
  return {
    client: {
      delete: deleteRequest,
      get,
      patch,
      post,
    } as unknown as AxiosInstance,
    deleteRequest,
    get,
    patch,
    post,
  }
}

const memoryStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
    values,
  }
}

describe('HostedCommerceAdapter', () => {
  it('loads a signed-in catalog with the bearer token and no owner secret', async () => {
    const axios = axiosClient()
    const catalog = { products: [{ handle: 'linen-shirt' }] }
    axios.get.mockResolvedValueOnce({ data: catalog })
    const adapter = new HostedCommerceAdapter({
      axios: axios.client,
      bearerToken: 'signed-in-token',
      scope: 'sessions',
      tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })

    await expect(adapter.catalog()).resolves.toEqual(catalog)
    expect(axios.get).toHaveBeenCalledWith(
      '/api/commerce/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/catalog',
      {
        headers: { Authorization: 'Bearer signed-in-token' },
      },
    )
  })

  it('implements catalog and every cart operation over the canonical Axios API', async () => {
    const axios = axiosClient()
    const storage = memoryStorage()
    const catalog = { products: [{ handle: 'linen-shirt' }] }
    const created = { cart: { id: 'cart_123', items: [] } }
    const updated = { cart: { id: 'cart_123', items: [{ id: 'line_1' }] } }
    axios.get
      .mockResolvedValueOnce({ data: catalog })
      .mockResolvedValueOnce({ data: created })
    axios.post
      .mockResolvedValueOnce({ data: created })
      .mockResolvedValueOnce({ data: updated })
    axios.patch
      .mockResolvedValueOnce({ data: created })
      .mockResolvedValueOnce({ data: updated })
    axios.deleteRequest.mockResolvedValueOnce({ data: created })
    const adapter = new HostedCommerceAdapter({
      anonymousOwnerSecret: 'owner-secret',
      axios: axios.client,
      scope: 'sessions',
      storage,
      tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })

    await expect(adapter.catalog()).resolves.toEqual(catalog)
    await expect(adapter.createCart()).resolves.toEqual(created)
    await expect(adapter.getCart()).resolves.toEqual(created)
    await expect(
      adapter.updateCart({ email: 'shopper@test.dev' }),
    ).resolves.toEqual(created)
    await expect(
      adapter.addItem({ quantity: 2, variantId: 'variant_1' }),
    ).resolves.toEqual(updated)
    await expect(
      adapter.updateItem('line_1', { quantity: 3 }),
    ).resolves.toEqual(updated)
    await expect(adapter.removeItem('line_1')).resolves.toEqual(created)

    const base = '/api/commerce/sessions/k574ms14ma9f94keq30r7dq24x89n1k2'
    const requestConfig = {
      headers: { 'x-ship-fast-owner-secret': 'owner-secret' },
    }
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      `${base}/catalog`,
      requestConfig,
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      `${base}/carts`,
      {},
      requestConfig,
    )
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      `${base}/carts/cart_123`,
      requestConfig,
    )
    expect(axios.patch).toHaveBeenNthCalledWith(
      1,
      `${base}/carts/cart_123`,
      { email: 'shopper@test.dev' },
      requestConfig,
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      `${base}/carts/cart_123/items`,
      { quantity: 2, variantId: 'variant_1' },
      requestConfig,
    )
    expect(axios.patch).toHaveBeenNthCalledWith(
      2,
      `${base}/carts/cart_123/items/line_1`,
      { quantity: 3 },
      requestConfig,
    )
    expect(axios.deleteRequest).toHaveBeenCalledWith(
      `${base}/carts/cart_123/items/line_1`,
      requestConfig,
    )
  })

  it('namespaces persisted cart IDs by scope and tenant', async () => {
    const storage = memoryStorage()
    const sessionAxios = axiosClient()
    const deploymentAxios = axiosClient()
    sessionAxios.post.mockResolvedValue({
      data: { cart: { id: 'cart_session' } },
    })
    deploymentAxios.post.mockResolvedValue({
      data: { cart: { id: 'cart_deployment' } },
    })
    const sessionAdapter = new HostedCommerceAdapter({
      axios: sessionAxios.client,
      scope: 'sessions',
      storage,
      tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })
    const deploymentAdapter = new HostedCommerceAdapter({
      axios: deploymentAxios.client,
      scope: 'deployments',
      storage,
      tenant: 'tenant-a',
    })

    await sessionAdapter.createCart()
    await deploymentAdapter.createCart()

    expect(storage.values).toEqual(
      new Map([
        [
          'ship-fast:commerce:sessions:k574ms14ma9f94keq30r7dq24x89n1k2',
          'cart_session',
        ],
        ['ship-fast:commerce:deployments:tenant-a', 'cart_deployment'],
      ]),
    )
  })

  it('degrades safely when storage is unavailable', async () => {
    const axios = axiosClient()
    axios.post.mockResolvedValueOnce({
      data: { cart: { id: 'cart_123' } },
    })
    axios.get.mockResolvedValueOnce({
      data: { cart: { id: 'cart_explicit' } },
    })
    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new Error('storage disabled')
      }),
      removeItem: vi.fn(() => {
        throw new Error('storage disabled')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage disabled')
      }),
    }
    const adapter = new HostedCommerceAdapter({
      axios: axios.client,
      scope: 'deployments',
      storage: unavailableStorage,
      tenant: 'tenant-a',
    })

    await expect(adapter.createCart()).resolves.toEqual({
      cart: { id: 'cart_123' },
    })
    await expect(adapter.getCart('cart_explicit')).resolves.toEqual({
      cart: { id: 'cart_explicit' },
    })
    await expect(adapter.getCart()).rejects.toThrow(
      'Commerce cart is unavailable.',
    )
  })

  it('implements checkout operations over explicit shopper choices', async () => {
    const axios = axiosClient()
    const storage = memoryStorage()
    storage.setItem(
      'ship-fast:commerce:sessions:k574ms14ma9f94keq30r7dq24x89n1k2',
      'cart_123',
    )
    axios.get
      .mockResolvedValueOnce({ data: { shippingOptions: [] } })
      .mockResolvedValueOnce({ data: { paymentProviders: [] } })
    axios.post
      .mockResolvedValueOnce({ data: { cart: { id: 'cart_123' } } })
      .mockResolvedValueOnce({
        data: { paymentAction: { type: 'none' }, paymentSessions: [] },
      })
      .mockResolvedValueOnce({ data: { order: { id: 'order_123' } } })
    const adapter = new HostedCommerceAdapter({
      axios: axios.client,
      scope: 'sessions',
      storage,
      tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })
    const base = '/api/commerce/sessions/k574ms14ma9f94keq30r7dq24x89n1k2'
    const requestConfig = { headers: {} }

    await expect(adapter.getShippingOptions()).resolves.toEqual({
      shippingOptions: [],
    })
    await expect(
      adapter.addShippingMethod({ shippingOptionId: 'so_1' }),
    ).resolves.toEqual({ cart: { id: 'cart_123' } })
    await expect(adapter.getPaymentProviders()).resolves.toEqual({
      paymentProviders: [],
    })
    await expect(
      adapter.createPaymentSessions({ providerId: 'pp_system' }),
    ).resolves.toEqual({
      paymentAction: { type: 'none' },
      paymentSessions: [],
    })
    await expect(
      adapter.completeCart({ idempotencyKey: 'idem_1' }),
    ).resolves.toEqual({ order: { id: 'order_123' } })

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      `${base}/carts/cart_123/shipping-options`,
      requestConfig,
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      `${base}/carts/cart_123/shipping-methods`,
      { shippingOptionId: 'so_1' },
      requestConfig,
    )
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      `${base}/carts/cart_123/payment-providers`,
      requestConfig,
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      `${base}/carts/cart_123/payment-sessions`,
      { providerId: 'pp_system' },
      requestConfig,
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      3,
      `${base}/carts/cart_123/complete`,
      { idempotencyKey: 'idem_1' },
      requestConfig,
    )
    expect(
      storage.getItem(
        'ship-fast:commerce:sessions:k574ms14ma9f94keq30r7dq24x89n1k2',
      ),
    ).toBeNull()
  })
})
