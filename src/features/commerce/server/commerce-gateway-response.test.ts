import { describe, expect, it, vi } from 'vitest'

import { CommerceFailure } from './commerce-error'
import {
  handleCommerceGatewayRequest,
  type CommerceGatewayOperations,
} from './commerce-gateway-response'

const tenant = {
  backendUrl: 'https://tenant-a.medusa.test',
  publishableKey: 'pk_tenant_a',
  scope: 'deployments' as const,
  tenant: 'tenant-a',
}

const gatewayOperations = (): CommerceGatewayOperations => ({
  addItem: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
  catalog: vi.fn().mockResolvedValue({ products: [{ id: 'prod_1' }] }),
  createCart: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
  getCart: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
  removeItem: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
  updateCart: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
  updateItem: vi.fn().mockResolvedValue({ cart: { id: 'cart_1' } }),
})

const requestFor = (body?: unknown) =>
  new Request('https://ship-fast.test/api/commerce/deployments/tenant-a', {
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: {
      'x-correlation-id': 'route-correlation',
    },
    method: body === undefined ? 'GET' : 'POST',
  })

describe('commerce gateway HTTP response', () => {
  it('routes catalog and every cart operation through one resolved tenant gateway', async () => {
    const gateway = gatewayOperations()
    const resolveTenant = vi.fn().mockResolvedValue(tenant)
    const createGateway = vi.fn(() => gateway)
    const operations = [
      {
        operation: { type: 'catalog' as const },
        request: requestFor(),
      },
      {
        operation: { type: 'create-cart' as const },
        request: requestFor({}),
      },
      {
        operation: { cartId: 'cart_1', type: 'get-cart' as const },
        request: requestFor(),
      },
      {
        operation: { cartId: 'cart_1', type: 'update-cart' as const },
        request: requestFor({ email: 'shopper@test.dev' }),
      },
      {
        operation: { cartId: 'cart_1', type: 'add-item' as const },
        request: requestFor({ quantity: 2, variantId: 'variant_1' }),
      },
      {
        operation: {
          cartId: 'cart_1',
          lineId: 'line_1',
          type: 'update-item' as const,
        },
        request: requestFor({ quantity: 3 }),
      },
      {
        operation: {
          cartId: 'cart_1',
          lineId: 'line_1',
          type: 'remove-item' as const,
        },
        request: requestFor(),
      },
    ]

    for (const input of operations) {
      const response = await handleCommerceGatewayRequest(
        {
          operation: input.operation,
          request: input.request,
          scope: 'deployments',
          tenant: 'tenant-a',
        },
        { createGateway, resolveTenant },
      )
      expect(response.status).toBe(200)
      expect(response.headers.get('x-correlation-id')).toBe('route-correlation')
    }

    expect(resolveTenant).toHaveBeenCalledTimes(operations.length)
    expect(gateway.catalog).toHaveBeenCalledOnce()
    expect(gateway.createCart).toHaveBeenCalledWith({})
    expect(gateway.getCart).toHaveBeenCalledWith('cart_1')
    expect(gateway.updateCart).toHaveBeenCalledWith('cart_1', {
      email: 'shopper@test.dev',
    })
    expect(gateway.addItem).toHaveBeenCalledWith('cart_1', {
      quantity: 2,
      variantId: 'variant_1',
    })
    expect(gateway.updateItem).toHaveBeenCalledWith('cart_1', 'line_1', {
      quantity: 3,
    })
    expect(gateway.removeItem).toHaveBeenCalledWith('cart_1', 'line_1')
  })

  it('rejects malformed and oversized bodies without calling a cart operation', async () => {
    const gateway = gatewayOperations()
    const options = {
      createGateway: () => gateway,
      resolveTenant: vi.fn().mockResolvedValue(tenant),
    }
    const malformedRequest = new Request('https://ship-fast.test', {
      body: '{not-json',
      headers: { 'x-correlation-id': 'body-correlation' },
      method: 'POST',
    })

    const malformed = await handleCommerceGatewayRequest(
      {
        operation: { cartId: 'cart_1', type: 'add-item' },
        request: malformedRequest,
        scope: 'deployments',
        tenant: 'tenant-a',
      },
      options,
    )
    expect(malformed.status).toBe(400)
    await expect(malformed.json()).resolves.toMatchObject({
      error: { code: 'INVALID_COMMERCE_REQUEST' },
    })
    expect(gateway.addItem).not.toHaveBeenCalled()

    const oversized = await handleCommerceGatewayRequest(
      {
        operation: { cartId: 'cart_1', type: 'update-cart' },
        request: requestFor({ notes: 'x'.repeat(70_000) }),
        scope: 'deployments',
        tenant: 'tenant-a',
      },
      options,
    )
    expect(oversized.status).toBe(413)
    expect(gateway.updateCart).not.toHaveBeenCalled()
  })

  it('returns resolver failures and redacts unexpected internal errors', async () => {
    const gateway = gatewayOperations()
    const accessFailure = new CommerceFailure({
      code: 'COMMERCE_ACCESS_DENIED',
      correlationId: 'route-correlation',
      message: 'Commerce tenant access denied.',
      retryable: false,
      status: 403,
    })
    const denied = await handleCommerceGatewayRequest(
      {
        operation: { type: 'catalog' },
        request: requestFor(),
        scope: 'sessions',
        tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      },
      {
        createGateway: () => gateway,
        resolveTenant: vi.fn().mockRejectedValue(accessFailure),
      },
    )
    expect(denied.status).toBe(403)

    vi.mocked(gateway.catalog).mockRejectedValueOnce(
      new Error('admin-token-secret'),
    )
    const failed = await handleCommerceGatewayRequest(
      {
        operation: { type: 'catalog' },
        request: requestFor(),
        scope: 'deployments',
        tenant: 'tenant-a',
      },
      {
        createGateway: () => gateway,
        resolveTenant: vi.fn().mockResolvedValue(tenant),
      },
    )
    expect(failed.status).toBe(500)
    const serialized = JSON.stringify(await failed.json())
    expect(serialized).not.toContain('admin-token-secret')
    expect(serialized).toContain('route-correlation')
  })
})
