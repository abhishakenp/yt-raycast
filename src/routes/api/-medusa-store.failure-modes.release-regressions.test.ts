import { afterEach, describe, expect, it, vi } from 'vitest'

import { Route as cartByIdRoute } from './medusa-store.cart.$id'
import { Route as cartLineItemsRoute } from './medusa-store.cart.line-items'
import { Route as cartRoute } from './medusa-store.cart'
import { callRouteHandler } from './route-handler.test-helper'

const medusaEnv = vi.hoisted(() => ({
  backendUrl: 'https://backend.medusa.test',
  publishableKey: '',
}))

vi.mock('@/features/commerce/server/medusa-store-env', () => ({
  getMedusaBackendUrl: () => medusaEnv.backendUrl,
  getMedusaPublishableKey: () => medusaEnv.publishableKey,
}))

async function readBody(response: Response) {
  return response.json()
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  medusaEnv.backendUrl = 'https://backend.medusa.test'
  medusaEnv.publishableKey = ''
})

describe('Medusa storefront route failure modes', () => {
  it('does not call Medusa when cart retrieval is not configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await callRouteHandler(cartByIdRoute, 'GET', {
      params: { id: 'cart_123' },
    })

    expect(response.status).toBe(503)
    await expect(readBody(response)).resolves.toEqual({
      error: 'Medusa Store API not configured',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('preserves the regions upstream failure status without attempting cart creation', async () => {
    medusaEnv.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ error: 'busy' }, { status: 429 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await callRouteHandler(cartRoute, 'POST')

    expect(response.status).toBe(429)
    await expect(readBody(response)).resolves.toEqual({
      error: 'regions fetch failed',
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('returns a stable error when Medusa has no sales region', async () => {
    medusaEnv.publishableKey = 'pk_medusa'
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ regions: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await callRouteHandler(cartRoute, 'POST')

    expect(response.status).toBe(500)
    await expect(readBody(response)).resolves.toEqual({
      error: 'No sales region in Medusa',
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('rejects unsafe cart route identifiers instead of interpolating an upstream path', async () => {
    medusaEnv.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ cart: { id: 'unexpected' } }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await callRouteHandler(cartByIdRoute, 'GET', {
      params: { id: 'cart_123/../../admin' },
    })

    expect(response.status).toBe(400)
    await expect(readBody(response)).resolves.toEqual({
      error: 'Invalid cart id',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects unsafe line-item cart identifiers before contacting Medusa', async () => {
    medusaEnv.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ cart: { id: 'unexpected' } }))
    vi.stubGlobal('fetch', fetchMock)
    const request = new Request(
      'https://ship-fast.io/api/medusa-store/cart/line-items',
      {
        body: JSON.stringify({
          cart_id: 'cart_123/../../admin',
          quantity: 1,
          variant_id: 'variant_123',
        }),
        method: 'POST',
      },
    )

    const response = await callRouteHandler(cartLineItemsRoute, 'POST', {
      request,
    })

    expect(response.status).toBe(400)
    await expect(readBody(response)).resolves.toEqual({
      error: 'Invalid cart id',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bounds Medusa calls with an abort signal so a stalled provider cannot hang cart creation', async () => {
    medusaEnv.publishableKey = 'pk_medusa'
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ regions: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await callRouteHandler(cartRoute, 'POST')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/regions',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
})
