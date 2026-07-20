import { describe, expect, it, vi } from 'vitest'

import { commerceFailureResponse } from './commerce-error'
import { MedusaCommerceGateway } from './commerce-gateway'
import type { ResolvedCommerceTenant } from './commerce-tenant-resolver'

const tenantA: ResolvedCommerceTenant = {
  backendUrl: 'https://8.8.8.8',
  publishableKey: 'pk_tenant_a',
  scope: 'deployments',
  tenant: 'tenant-a',
}

const tenantB: ResolvedCommerceTenant = {
  backendUrl: 'https://1.1.1.1',
  publishableKey: 'pk_tenant_b',
  scope: 'deployments',
  tenant: 'tenant-b',
}

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  Response.json(body, init)

const boundCart = (
  tenant: ResolvedCommerceTenant,
  overrides: Record<string, unknown> = {},
) => ({
  id: 'cart_123',
  items: [],
  metadata: {
    ship_fast_scope: tenant.scope,
    ship_fast_tenant: tenant.tenant,
  },
  ...overrides,
})

describe('Medusa commerce gateway', () => {
  it('returns the exact shared rich catalog contract and isolates tenant A from B', async () => {
    const richProduct = {
      collection: {
        handle: 'provider-collection',
        id: 'pcol_1',
        metadata: {
          ship_fast_generated_handle: 'summer',
          ship_fast_generated_source_id: 'collection:summer',
        },
        title: 'Summer',
      },
      handle: 'provider-linen-shirt',
      id: 'prod_1',
      images: [{ id: 'img_1', url: 'https://cdn.test/linen.jpg' }],
      metadata: {
        ship_fast_generated_handle: 'linen-shirt',
        ship_fast_generated_product: true,
        ship_fast_generated_source_id: 'product:linen-shirt',
        ship_fast_tenant_id: 'tenant-a',
      },
      options: [
        {
          id: 'opt_1',
          title: 'Size',
          values: [{ value: 'Small' }],
        },
      ],
      tags: [{ id: 'tag_1', value: 'linen' }],
      thumbnail: 'https://cdn.test/linen-thumb.jpg',
      title: 'Linen Shirt',
      variants: [
        {
          calculated_price: {
            calculated_amount: 29,
            currency_code: 'USD',
            original_amount: 35,
          },
          id: 'variant_1',
          inventory_quantity: 4,
          manage_inventory: true,
          metadata: {
            ship_fast_generated_source_id: 'variant:small',
            ship_fast_generated_sku: 'LINEN-S',
          },
          options: [
            {
              option: { title: 'Size' },
              value: 'Small',
            },
          ],
          prices: [{ amount: 29, currency_code: 'USD' }],
          sku: 'tenant-a--LINEN-S',
          title: 'Small',
        },
      ],
    }
    const wrongTenantProduct = {
      ...richProduct,
      id: 'prod_wrong',
      metadata: {
        ...richProduct.metadata,
        ship_fast_tenant_id: 'tenant-b',
      },
    }
    const fetchA = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ regions: [{ id: 'reg_a' }] }))
      .mockResolvedValueOnce(
        jsonResponse({ products: [richProduct, wrongTenantProduct] }),
      )
    const fetchB = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ regions: [{ id: 'reg_b' }] }))
      .mockResolvedValueOnce(jsonResponse({ products: [wrongTenantProduct] }))

    const catalogA = await new MedusaCommerceGateway(tenantA, {
      correlationId: 'catalog-a',
      fetch: fetchA,
    }).catalog()
    const catalogB = await new MedusaCommerceGateway(tenantB, {
      correlationId: 'catalog-b',
      fetch: fetchB,
    }).catalog()

    expect(catalogA).toEqual({
      products: [
        {
          collections: [
            {
              handle: 'summer',
              sourceId: 'collection:summer',
              title: 'Summer',
            },
          ],
          currencyCode: 'usd',
          handle: 'provider-linen-shirt',
          id: 'prod_1',
          images: [
            {
              sourceId: 'img_1',
              url: 'https://cdn.test/linen.jpg',
            },
          ],
          options: [
            {
              sourceId: 'opt_1',
              title: 'Size',
              values: ['Small'],
            },
          ],
          price: 29,
          sourceHandle: 'linen-shirt',
          sourceId: 'product:linen-shirt',
          tags: [{ sourceId: 'tag_1', value: 'linen' }],
          thumbnail: 'https://cdn.test/linen-thumb.jpg',
          title: 'Linen Shirt',
          variants: [
            {
              available: true,
              calculatedPrice: { amount: 29, currencyCode: 'usd' },
              id: 'variant_1',
              inventoryQuantity: 4,
              manageInventory: true,
              optionValues: { Size: 'Small' },
              originalPrice: { amount: 35, currencyCode: 'usd' },
              prices: [{ amount: 29, currencyCode: 'usd' }],
              sku: 'LINEN-S',
              sourceId: 'variant:small',
              title: 'Small',
            },
          ],
        },
      ],
    })
    expect(catalogB.products).toHaveLength(1)
    expect(fetchA.mock.calls[1]?.[0]).toContain(
      'region_id=reg_a&fields=*variants.calculated_price',
    )
    expect(fetchA.mock.calls[1]?.[1]).toMatchObject({
      headers: { 'x-publishable-api-key': 'pk_tenant_a' },
      signal: expect.any(AbortSignal),
    })
    expect(fetchB.mock.calls[1]?.[1]).toMatchObject({
      headers: { 'x-publishable-api-key': 'pk_tenant_b' },
    })
  })

  it('creates, gets, updates, and mutates cart lines through tenant-bound metadata', async () => {
    const cart = boundCart(tenantA)
    const updatedCart = boundCart(tenantA, { email: 'shopper@test.dev' })
    const withLine = boundCart(tenantA, {
      items: [{ id: 'line_1', quantity: 2 }],
    })
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ regions: [{ id: 'reg_a' }] }))
      .mockResolvedValueOnce(jsonResponse({ cart }))
      .mockResolvedValueOnce(jsonResponse({ cart }))
      .mockResolvedValueOnce(jsonResponse({ cart }))
      .mockResolvedValueOnce(jsonResponse({ cart: updatedCart }))
      .mockResolvedValueOnce(jsonResponse({ cart: updatedCart }))
      .mockResolvedValueOnce(jsonResponse({ cart: withLine }))
      .mockResolvedValueOnce(jsonResponse({ cart: withLine }))
      .mockResolvedValueOnce(jsonResponse({ cart: withLine }))
      .mockResolvedValueOnce(jsonResponse({ cart: withLine }))
      .mockResolvedValueOnce(jsonResponse({ parent: cart }))
    const gateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'cart-correlation',
      fetch,
    })

    await expect(gateway.createCart()).resolves.toEqual({ cart })
    await expect(gateway.getCart('cart_123')).resolves.toEqual({ cart })
    await expect(
      gateway.updateCart('cart_123', { email: 'shopper@test.dev' }),
    ).resolves.toEqual({ cart: updatedCart })
    await expect(
      gateway.addItem('cart_123', { quantity: 2, variantId: 'variant_1' }),
    ).resolves.toEqual({ cart: withLine })
    await expect(
      gateway.updateItem('cart_123', 'line_1', { quantity: 3 }),
    ).resolves.toEqual({ cart: withLine })
    await expect(gateway.removeItem('cart_123', 'line_1')).resolves.toEqual({
      cart,
    })

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://8.8.8.8/store/carts',
      expect.objectContaining({
        body: JSON.stringify({
          metadata: {
            ship_fast_scope: 'deployments',
            ship_fast_tenant: 'tenant-a',
          },
          region_id: 'reg_a',
        }),
        method: 'POST',
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      5,
      'https://8.8.8.8/store/carts/cart_123',
      expect.objectContaining({
        body: JSON.stringify({ email: 'shopper@test.dev' }),
        method: 'POST',
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      7,
      'https://8.8.8.8/store/carts/cart_123/line-items',
      expect.objectContaining({
        body: JSON.stringify({ variant_id: 'variant_1', quantity: 2 }),
        method: 'POST',
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      9,
      'https://8.8.8.8/store/carts/cart_123/line-items/line_1',
      expect.objectContaining({
        body: JSON.stringify({ quantity: 3 }),
        method: 'POST',
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      11,
      'https://8.8.8.8/store/carts/cart_123/line-items/line_1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('rejects tenant-B carts and unsafe IDs before a mutation reaches the provider', async () => {
    const mismatchFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ cart: boundCart(tenantB) }))
    const mismatchGateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'mismatch-correlation',
      fetch: mismatchFetch,
    })

    await expect(
      mismatchGateway.addItem('cart_123', {
        quantity: 1,
        variantId: 'variant_1',
      }),
    ).rejects.toMatchObject({
      commerceError: { code: 'CART_TENANT_MISMATCH' },
      status: 404,
    })
    expect(mismatchFetch).toHaveBeenCalledTimes(1)

    const invalidFetch = vi.fn()
    const invalidGateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'invalid-correlation',
      fetch: invalidFetch,
    })
    await expect(invalidGateway.getCart('../cart')).rejects.toMatchObject({
      commerceError: { code: 'INVALID_CART_ID' },
      status: 400,
    })
    await expect(
      invalidGateway.updateItem('cart_123', '../line', { quantity: 1 }),
    ).rejects.toMatchObject({
      commerceError: { code: 'INVALID_LINE_ID' },
      status: 400,
    })
    expect(invalidFetch).not.toHaveBeenCalled()
  })

  it('rejects every cart metadata update before provider access', async () => {
    const fetch = vi.fn()
    const gateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'metadata-correlation',
      fetch,
    })

    for (const metadata of [
      null,
      { gift_message: 'Happy birthday' },
      {
        gift_message: 'Happy birthday',
        ship_fast_scope: 'deployments',
        ship_fast_tenant: 'tenant-b',
      },
    ]) {
      await expect(
        gateway.updateCart('cart_123', { metadata }),
      ).rejects.toMatchObject({
        commerceError: { code: 'RESERVED_CART_METADATA' },
        status: 400,
      })
    }
    expect(fetch).not.toHaveBeenCalled()
  })

  it('preserves upstream status in a stable CommerceError envelope', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: 'secret detail' }, { status: 409 }),
      )
    const gateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'provider-correlation',
      fetch,
    })

    let caught: unknown
    try {
      await gateway.getCart('cart_123')
    } catch (error) {
      caught = error
    }
    expect(caught).toMatchObject({
      commerceError: {
        code: 'COMMERCE_PROVIDER_ERROR',
        correlationId: 'provider-correlation',
      },
      status: 409,
    })
    if (!(caught instanceof Error) || !('commerceError' in caught)) {
      throw new Error('Expected a commerce failure')
    }
    const response = commerceFailureResponse(
      caught as Parameters<typeof commerceFailureResponse>[0],
    )
    expect(response.status).toBe(409)
    expect(JSON.stringify(await response.json())).not.toContain('secret detail')
  })

  it('maps malformed provider data and timeouts to stable gateway failures', async () => {
    const malformed = new MedusaCommerceGateway(tenantA, {
      correlationId: 'malformed-correlation',
      fetch: vi.fn().mockResolvedValue(
        new Response('<html>not json</html>', {
          headers: { 'content-type': 'text/html' },
          status: 200,
        }),
      ),
    })
    await expect(malformed.getCart('cart_123')).rejects.toMatchObject({
      commerceError: { code: 'COMMERCE_PROVIDER_MALFORMED' },
      status: 502,
    })

    const timeoutFetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.signal).toBeInstanceOf(AbortSignal)
        throw new DOMException('timed out', 'TimeoutError')
      },
    )
    const timedOut = new MedusaCommerceGateway(tenantA, {
      correlationId: 'timeout-correlation',
      fetch: timeoutFetch,
      timeoutMs: 5,
    })
    await expect(timedOut.getCart('cart_123')).rejects.toMatchObject({
      commerceError: {
        code: 'COMMERCE_PROVIDER_TIMEOUT',
        retryable: true,
      },
      status: 504,
    })
  })

  it('blocks private provider targets and unsafe backend URL shapes before fetch', async () => {
    const blockedBackendUrls = [
      'http://localhost:9000',
      'http://10.0.0.8',
      'http://169.254.169.254',
      'https://user:password@8.8.8.8',
      'https://8.8.8.8/admin',
      'https://8.8.8.8?tenant=other',
      'https://8.8.8.8#internal',
    ]

    for (const backendUrl of blockedBackendUrls) {
      const fetch = vi.fn()
      const gateway = new MedusaCommerceGateway(
        { ...tenantA, backendUrl },
        { correlationId: 'blocked-provider', fetch },
      )

      await expect(gateway.getCart('cart_123')).rejects.toMatchObject({
        commerceError: { code: 'COMMERCE_PROVIDER_BLOCKED' },
        status: 502,
      })
      expect(fetch).not.toHaveBeenCalled()
    }
  })

  it('disables redirect following for provider requests', async () => {
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.redirect).toBe('error')
        return new Response(null, {
          headers: { location: 'http://169.254.169.254/latest/meta-data' },
          status: 302,
        })
      },
    )
    const gateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'redirect-provider',
      fetch,
    })

    await expect(gateway.getCart('cart_123')).rejects.toMatchObject({
      commerceError: { code: 'COMMERCE_PROVIDER_ERROR' },
      status: 302,
    })
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('maps a provider timeout after headers while reading the body', async () => {
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const signal = init?.signal
        if (!(signal instanceof AbortSignal)) {
          throw new Error('Expected provider abort signal')
        }
        const body = new ReadableStream({
          start(controller) {
            signal.addEventListener(
              'abort',
              () => controller.error(signal.reason),
              { once: true },
            )
          },
        })
        return new Response(body, { status: 200 })
      },
    )
    const gateway = new MedusaCommerceGateway(tenantA, {
      correlationId: 'body-timeout-provider',
      fetch,
      timeoutMs: 5,
    })

    await expect(gateway.getCart('cart_123')).rejects.toMatchObject({
      commerceError: {
        code: 'COMMERCE_PROVIDER_TIMEOUT',
        retryable: true,
      },
      status: 504,
    })
  })

  it('allows private Medusa only through an explicit non-production option', async () => {
    const localTenant = { ...tenantA, backendUrl: 'http://localhost:9000' }
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ cart: boundCart(localTenant) }))

    vi.stubEnv('NODE_ENV', 'development')
    await expect(
      new MedusaCommerceGateway(localTenant, {
        allowPrivateBackendInDevelopment: true,
        correlationId: 'local-development-provider',
        fetch,
      }).getCart('cart_123'),
    ).resolves.toMatchObject({ cart: { id: 'cart_123' } })

    vi.stubEnv('NODE_ENV', 'production')
    await expect(
      new MedusaCommerceGateway(localTenant, {
        allowPrivateBackendInDevelopment: true,
        correlationId: 'local-production-provider',
        fetch,
      }).getCart('cart_123'),
    ).rejects.toMatchObject({
      commerceError: { code: 'COMMERCE_PROVIDER_BLOCKED' },
      status: 502,
    })
    expect(fetch).toHaveBeenCalledOnce()
    vi.unstubAllEnvs()
  })

  it('allows a private provider from explicit trusted server configuration in production', async () => {
    const localTenant = { ...tenantA, backendUrl: 'http://localhost:9000' }
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ cart: boundCart(localTenant) }))

    vi.stubEnv('NODE_ENV', 'production')
    await expect(
      new MedusaCommerceGateway(localTenant, {
        allowPrivateBackendFromTrustedConfiguration: true,
        correlationId: 'trusted-production-provider',
        fetch,
      }).getCart('cart_123'),
    ).resolves.toMatchObject({ cart: { id: 'cart_123' } })
    expect(fetch).toHaveBeenCalledOnce()
    vi.unstubAllEnvs()
  })

  it('supports explicit unbound compatibility calls without mutation preflights', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ regions: [{ id: 'reg_a' }] }))
      .mockResolvedValueOnce(jsonResponse({ cart: { id: 'cart_legacy' } }))
      .mockResolvedValueOnce(
        jsonResponse({
          cart: { id: 'cart_legacy', items: [{ id: 'line_1' }] },
        }),
      )
    const gateway = new MedusaCommerceGateway(tenantA, {
      bindCarts: false,
      correlationId: 'legacy-correlation',
      fetch,
      validateCartBeforeMutation: false,
    })

    await expect(gateway.createCart()).resolves.toEqual({
      cart: { id: 'cart_legacy' },
    })
    await expect(
      gateway.addItem('cart_legacy', {
        quantity: 1,
        variantId: 'variant_1',
      }),
    ).resolves.toEqual({
      cart: { id: 'cart_legacy', items: [{ id: 'line_1' }] },
    })
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch.mock.calls[1]?.[1]).toMatchObject({
      body: JSON.stringify({ region_id: 'reg_a' }),
    })
  })
})
