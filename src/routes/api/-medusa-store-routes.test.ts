import { afterEach, describe, expect, it, vi } from 'vitest'

const medusaEnvMock = vi.hoisted(() => ({
  adminUrl: '',
  backendUrl: 'https://backend.medusa.test',
  publishableKey: '',
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/commerce/server/medusa-store-env', () => ({
  getMedusaAdminUrl: () => medusaEnvMock.adminUrl,
  getMedusaBackendUrl: () => medusaEnvMock.backendUrl,
  getMedusaPublishableKey: () => medusaEnvMock.publishableKey,
}))

type RouteWithHandlers = {
  options: {
    server: {
      handlers: Record<string, (args: any) => Promise<Response>>
    }
  }
}

const readJson = async (response: Response) => ({
  body: await response.json(),
  contentType: response.headers.get('content-type'),
  status: response.status,
})

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  medusaEnvMock.adminUrl = ''
  medusaEnvMock.backendUrl = 'https://backend.medusa.test'
  medusaEnvMock.publishableKey = ''
})

describe('Medusa Store API route contracts', () => {
  it('reports disabled Store API config without exposing a publishable key', async () => {
    const { Route } = await import('./medusa-store.config')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.GET({})

    expect(await readJson(response)).toMatchObject({
      body: {
        backendUrl: 'https://backend.medusa.test',
        enabled: false,
      },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
  })

  it('reports enabled Store API config when a publishable key exists but still omits the key value', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const { Route } = await import('./medusa-store.config')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.GET({})
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      backendUrl: 'https://backend.medusa.test',
      enabled: true,
    })
    expect(JSON.stringify(body)).not.toContain('pk_medusa')
  })

  it('reports disabled admin config until an admin URL is configured', async () => {
    const { Route } = await import('./medusa-admin.config')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.GET({})

    expect(await readJson(response)).toMatchObject({
      body: {
        adminUrl: '',
        backendUrl: 'https://backend.medusa.test',
        enabled: false,
      },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
  })

  it('reports enabled admin config with the admin and backend URLs', async () => {
    medusaEnvMock.adminUrl = 'https://admin.medusa.test'
    const { Route } = await import('./medusa-admin.config')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.GET({})

    expect(await readJson(response)).toMatchObject({
      body: {
        adminUrl: 'https://admin.medusa.test',
        backendUrl: 'https://backend.medusa.test',
        enabled: true,
      },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
  })

  it('returns a stable JSON error when cart creation is not configured', async () => {
    const { Route } = await import('./medusa-store.cart')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({})

    expect(await readJson(response)).toMatchObject({
      body: {
        error:
          'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)',
      },
      contentType: expect.stringContaining('application/json'),
      status: 503,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates carts through regions and preserves the cart response envelope', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ regions: [{ id: 'reg_123' }] }))
      .mockResolvedValueOnce(jsonResponse({ cart: { id: 'cart_123' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-store.cart')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({})

    expect(await readJson(response)).toMatchObject({
      body: { cart: { id: 'cart_123' } },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_medusa' },
      },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://backend.medusa.test/store/carts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_medusa',
        },
        body: JSON.stringify({ region_id: 'reg_123' }),
      },
    )
  })

  it('retrieves carts by id and preserves upstream status on failures', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: 'missing' }, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-store.cart.$id')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.GET({
      params: { id: 'cart_missing' },
    })

    expect(await readJson(response)).toMatchObject({
      body: { error: 'cart retrieve failed' },
      contentType: expect.stringContaining('application/json'),
      status: 404,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/carts/cart_missing',
      { headers: { 'x-publishable-api-key': 'pk_medusa' } },
    )
  })

  it('validates line item requests before calling Medusa', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-store.cart.line-items')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request(
        'https://ship-fast.test/api/medusa-store/cart/line-items',
        {
          method: 'POST',
          body: JSON.stringify({ cart_id: 'cart_123' }),
        },
      ),
    })

    expect(await readJson(response)).toMatchObject({
      body: { error: 'cart_id and variant_id required' },
      contentType: expect.stringContaining('application/json'),
      status: 400,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('adds line items with clamped quantity and cart response envelope', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ cart: { id: 'cart_123', items: [{}] } }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-store.cart.line-items')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request(
        'https://ship-fast.test/api/medusa-store/cart/line-items',
        {
          method: 'POST',
          body: JSON.stringify({
            cart_id: ' cart_123 ',
            quantity: '0',
            variant_id: ' variant_123 ',
          }),
        },
      ),
    })

    expect(await readJson(response)).toMatchObject({
      body: { cart: { id: 'cart_123', items: [{}] } },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/carts/cart_123/line-items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_medusa',
        },
        body: JSON.stringify({ variant_id: 'variant_123', quantity: 1 }),
      },
    )
  })

  it('proxies checkout payloads and preserves the upstream success envelope', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        checkout_url: 'https://checkout.medusa.test/cart_123',
        status: 'ready',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-checkout')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/medusa-checkout', {
        method: 'POST',
        body: JSON.stringify({ cart_id: 'cart_123' }),
      }),
    })

    expect(await readJson(response)).toMatchObject({
      body: {
        checkout_url: 'https://checkout.medusa.test/cart_123',
        status: 'ready',
      },
      contentType: expect.stringContaining('application/json'),
      status: 200,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_medusa',
        },
        body: JSON.stringify({ cart_id: 'cart_123' }),
      },
    )
  })

  it('returns a stable checkout error without calling Medusa when Store API auth is missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-checkout')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/medusa-checkout', {
        method: 'POST',
        body: JSON.stringify({ cart_id: 'cart_123' }),
      }),
    })

    expect(await readJson(response)).toMatchObject({
      body: { error: 'Medusa Store API not configured' },
      contentType: expect.stringContaining('application/json'),
      status: 503,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('preserves upstream checkout failure status while hiding upstream internals', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ error: 'cart expired' }, { status: 409 }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-checkout')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/medusa-checkout', {
        method: 'POST',
        body: JSON.stringify({ cart_id: 'cart_expired' }),
      }),
    })

    expect(await readJson(response)).toMatchObject({
      body: { error: 'checkout failed' },
      contentType: expect.stringContaining('application/json'),
      status: 409,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/checkout',
      expect.objectContaining({
        body: JSON.stringify({ cart_id: 'cart_expired' }),
        method: 'POST',
      }),
    )
  })

  it('returns JSON instead of throwing when checkout receives malformed JSON', async () => {
    medusaEnvMock.publishableKey = 'pk_medusa'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { Route } = await import('./medusa-checkout')

    const response = await (
      Route as unknown as RouteWithHandlers
    ).options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/medusa-checkout', {
        method: 'POST',
        body: '{not-json',
      }),
    })

    expect(await readJson(response)).toMatchObject({
      body: { error: 'Invalid checkout request body' },
      contentType: expect.stringContaining('application/json'),
      status: 400,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
