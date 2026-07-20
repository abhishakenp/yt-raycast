import { beforeEach, describe, expect, it, vi } from 'vitest'

import { callRouteHandler } from './-route-handler.test-helper'

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/commerce/server/commerce-gateway-response', () => ({
  handleCommerceGatewayRequest: mocks.handle,
}))

const request = (method: string) =>
  new Request('https://ship-fast.test/api/commerce/deployments/tenant-a', {
    method,
  })

describe('canonical commerce gateway routes', () => {
  beforeEach(() => {
    mocks.handle.mockReset()
    mocks.handle.mockResolvedValue(Response.json({ ok: true }))
  })

  it('delegates the catalog and cart collection routes', async () => {
    const { Route: catalogRoute } =
      await import('./commerce.$scope.$tenant.catalog')
    const { Route: cartsRoute } =
      await import('./commerce.$scope.$tenant.carts')
    const getRequest = request('GET')
    const postRequest = request('POST')

    await callRouteHandler(catalogRoute, 'GET', {
      params: { scope: 'deployments', tenant: 'tenant-a' },
      request: getRequest,
    })
    await callRouteHandler(cartsRoute, 'POST', {
      params: { scope: 'deployments', tenant: 'tenant-a' },
      request: postRequest,
    })

    expect(catalogRoute).toMatchObject({
      path: '/api/commerce/$scope/$tenant/catalog',
    })
    expect(cartsRoute).toMatchObject({
      path: '/api/commerce/$scope/$tenant/carts',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(1, {
      operation: { type: 'catalog' },
      request: getRequest,
      scope: 'deployments',
      tenant: 'tenant-a',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(2, {
      operation: { type: 'create-cart' },
      request: postRequest,
      scope: 'deployments',
      tenant: 'tenant-a',
    })
  })

  it('delegates GET and PATCH for one cart', async () => {
    const { Route } = await import('./commerce.$scope.$tenant.carts.$cartId')
    const getRequest = request('GET')
    const patchRequest = request('PATCH')
    const params = {
      cartId: 'cart_1',
      scope: 'sessions',
      tenant: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    }

    await callRouteHandler(Route, 'GET', { params, request: getRequest })
    await callRouteHandler(Route, 'PATCH', { params, request: patchRequest })

    expect(Route).toMatchObject({
      path: '/api/commerce/$scope/$tenant/carts/$cartId',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(1, {
      operation: { cartId: 'cart_1', type: 'get-cart' },
      request: getRequest,
      scope: 'sessions',
      tenant: params.tenant,
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(2, {
      operation: { cartId: 'cart_1', type: 'update-cart' },
      request: patchRequest,
      scope: 'sessions',
      tenant: params.tenant,
    })
  })

  it('delegates item creation and item PATCH/DELETE', async () => {
    const { Route: itemsRoute } =
      await import('./commerce.$scope.$tenant.carts.$cartId.items')
    const { Route: itemRoute } =
      await import('./commerce.$scope.$tenant.carts.$cartId.items.$lineId')
    const postRequest = request('POST')
    const patchRequest = request('PATCH')
    const deleteRequest = request('DELETE')
    const params = {
      cartId: 'cart_1',
      lineId: 'line_1',
      scope: 'deployments',
      tenant: 'tenant-a',
    }

    await callRouteHandler(itemsRoute, 'POST', {
      params,
      request: postRequest,
    })
    await callRouteHandler(itemRoute, 'PATCH', {
      params,
      request: patchRequest,
    })
    await callRouteHandler(itemRoute, 'DELETE', {
      params,
      request: deleteRequest,
    })

    expect(itemsRoute).toMatchObject({
      path: '/api/commerce/$scope/$tenant/carts/$cartId/items',
    })
    expect(itemRoute).toMatchObject({
      path: '/api/commerce/$scope/$tenant/carts/$cartId/items/$lineId',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(1, {
      operation: { cartId: 'cart_1', type: 'add-item' },
      request: postRequest,
      scope: 'deployments',
      tenant: 'tenant-a',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(2, {
      operation: {
        cartId: 'cart_1',
        lineId: 'line_1',
        type: 'update-item',
      },
      request: patchRequest,
      scope: 'deployments',
      tenant: 'tenant-a',
    })
    expect(mocks.handle).toHaveBeenNthCalledWith(3, {
      operation: {
        cartId: 'cart_1',
        lineId: 'line_1',
        type: 'remove-item',
      },
      request: deleteRequest,
      scope: 'deployments',
      tenant: 'tenant-a',
    })
  })
})
