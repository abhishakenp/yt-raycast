import { beforeEach, describe, expect, it, vi } from 'vitest'

import { callRouteHandler } from './-route-handler.test-helper'

const mocks = vi.hoisted(() => ({
  addLineItem: vi.fn(),
  createCart: vi.fn(),
  getCart: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/commerce/server/commerce-gateway-compatibility', () => ({
  createLegacyMedusaCartResponse: mocks.createCart,
  createLegacyMedusaLineItemResponse: mocks.addLineItem,
  getLegacyMedusaCartResponse: mocks.getCart,
}))

describe('Medusa Store cart compatibility wrappers', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.addLineItem.mockReset()
    mocks.createCart.mockReset()
    mocks.getCart.mockReset()
    mocks.addLineItem.mockResolvedValue(Response.json({ cart: {} }))
    mocks.createCart.mockResolvedValue(Response.json({ cart: {} }))
    mocks.getCart.mockResolvedValue(Response.json({ cart: {} }))
  })

  it('delegates legacy create, get, and add-line routes to the shared gateway compatibility service', async () => {
    const { Route: createRoute } = await import('./medusa-store.cart')
    const { Route: getRoute } = await import('./medusa-store.cart.$id')
    const { Route: addLineRoute } =
      await import('./medusa-store.cart.line-items')
    const request = new Request(
      'https://ship-fast.test/api/medusa-store/cart/line-items',
      { body: '{}', method: 'POST' },
    )

    await callRouteHandler(createRoute, 'POST')
    await callRouteHandler(getRoute, 'GET', {
      params: { id: 'cart_123' },
    })
    await callRouteHandler(addLineRoute, 'POST', { request })

    expect(mocks.createCart).toHaveBeenCalledOnce()
    expect(mocks.getCart).toHaveBeenCalledWith('cart_123')
    expect(mocks.addLineItem).toHaveBeenCalledWith(request)
  })
})
