import { describe, expect, it, vi } from 'vitest'

import {
  createSessionScopedProductHandle,
  parsePriceToMedusaAmount,
  syncGeneratedProductsToMedusa,
} from './medusa-product-sync'

describe('medusa product sync', () => {
  it('creates deterministic session-scoped handles for multitenant products', () => {
    expect(
      createSessionScopedProductHandle('session_abc123456789', {
        handle: 'truffle-box',
        title: 'Truffle Box',
      }),
    ).toBe('ship-fast-session-abc123456789-truffle-box')
  })

  it('converts generated product prices into Medusa v2 price amounts', () => {
    expect(parsePriceToMedusaAmount(18.5)).toBe(18.5)
    expect(parsePriceToMedusaAmount('$79')).toBe(79)
  })

  it('upserts generated products into a session tenant sales channel and publishable key', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ shipping_profiles: [{ id: 'sp_default' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sales_channels: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ api_keys: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sales_channel: { id: 'sc_tenant' } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_key: {
              id: 'apk_tenant',
              token: 'pk_tenant_session',
              title: 'Ship Fast session_abc123456789',
              type: 'publishable',
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ api_key: { id: 'apk_tenant' } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ product: { id: 'prod_1' } }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminEmail: 'admin@test.com',
      adminPassword: 'supersecret',
      backendUrl: 'http://localhost:9000',
      currencyCode: 'eur',
      fetch: fetchImpl,
      products: [{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }],
      sessionId: 'session_abc123456789',
    })

    expect(result).toEqual({
      synced: 1,
      tenant: {
        apiKeyId: 'apk_tenant',
        publishableKey: 'pk_tenant_session',
        salesChannelId: 'sc_tenant',
      },
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/auth/user/emailpass',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/sales-channels',
      expect.objectContaining({
        body: expect.stringContaining('Ship Fast session_abc123456789'),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/api-keys',
      expect.objectContaining({
        body: expect.stringContaining('publishable'),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/api-keys/apk_tenant/sales-channels',
      expect.objectContaining({
        body: JSON.stringify({ add: ['sc_tenant'] }),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/products?handle=ship-fast-session-abc123456789-truffle-box&limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer admin-token',
        }),
      }),
    )
    const createCall = fetchImpl.mock.calls.find(
      ([url]) => url === 'http://localhost:9000/admin/products',
    )
    expect(createCall).toBeTruthy()
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      handle: 'ship-fast-session-abc123456789-truffle-box',
      metadata: {
        ship_fast_generated_product: true,
        ship_fast_session_id: 'session_abc123456789',
      },
      sales_channels: [{ id: 'sc_tenant' }],
      shipping_profile_id: 'sp_default',
      title: 'Truffle Box',
      variants: [
        {
          prices: [{ amount: 79, currency_code: 'eur' }],
        },
      ],
    })
  })

  it('uses email/password auth instead of a stale configured admin token when both are available', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'fresh-admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ shipping_profiles: [{ id: 'sp_default' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sales_channels: [
              { id: 'sc_tenant', name: 'Ship Fast session_abc123456789' },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_keys: [
              {
                id: 'apk_tenant',
                sales_channels: [{ id: 'sc_tenant' }],
                title: 'Ship Fast session_abc123456789',
                token: 'pk_tenant_session',
                type: 'publishable',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ product: { id: 'prod_1' } }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: 'stale-admin-token',
      adminEmail: 'admin@test.com',
      adminPassword: 'supersecret',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }],
      sessionId: 'session_abc123456789',
    })

    expect(result.synced).toBe(1)
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/auth/user/emailpass',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/admin/shipping-profiles'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer fresh-admin-token',
        }),
      }),
    )
  })

  it('returns a stable warning when Medusa auth responds with malformed HTML', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response('<!doctype html><title>auth unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )

    const result = await syncGeneratedProductsToMedusa({
      adminEmail: 'admin@test.com',
      adminPassword: 'supersecret',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }],
      sessionId: 'session_abc123456789',
    })

    expect(result).toEqual({
      synced: 0,
      warning: 'Medusa product sync failed.',
    })
    expect(result.warning).not.toMatch(
      /unexpected token|valid json|doctype|auth unavailable/i,
    )
  })

  it('returns a stable warning when Medusa defaults respond with malformed HTML', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('<!doctype html><title>profiles unavailable</title>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sales_channels: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ api_keys: [] }), { status: 200 }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }],
      sessionId: 'session_abc123456789',
    })

    expect(result).toEqual({
      synced: 0,
      warning: 'Medusa product sync failed.',
    })
    expect(result.warning).not.toMatch(
      /unexpected token|valid json|doctype|profiles unavailable/i,
    )
  })

  it('skips existing products so admin edits survive re-provisions', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ shipping_profiles: [{ id: 'sp_default' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sales_channels: [
              { id: 'sc_tenant', name: 'Ship Fast session_abc123456789' },
            ],
          }),
          {
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_keys: [
              {
                id: 'apk_tenant',
                sales_channels: [{ id: 'sc_tenant' }],
                title: 'Ship Fast session_abc123456789',
                token: 'pk_tenant_session',
                type: 'publishable',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [{ id: 'prod_existing' }] }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminEmail: 'admin@test.com',
      adminPassword: 'supersecret',
      backendUrl: 'http://localhost:9000',
      currencyCode: 'usd',
      fetch: fetchImpl,
      products: [{ handle: 'dark-bar', price: 12, title: 'Dark Bar' }],
      sessionId: 'session_abc123456789',
    })

    expect(result).toEqual({
      synced: 1,
      tenant: {
        apiKeyId: 'apk_tenant',
        publishableKey: 'pk_tenant_session',
        salesChannelId: 'sc_tenant',
      },
    })
    // Must NOT delete the existing product — admin edits must survive.
    const deleteCall = fetchImpl.mock.calls.find(
      ([url, init]) =>
        typeof url === 'string' &&
        url.includes('/admin/products/prod_existing') &&
        (init as RequestInit)?.method === 'DELETE',
    )
    expect(deleteCall).toBeUndefined()
    // Must NOT create a new product — the existing one is preserved as-is.
    const createCall = fetchImpl.mock.calls.find(
      ([url, init]) =>
        url === 'http://localhost:9000/admin/products' &&
        (init as RequestInit)?.method === 'POST',
    )
    expect(createCall).toBeUndefined()
  })

  it('creates new products and skips existing ones in the same batch', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ shipping_profiles: [{ id: 'sp_default' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sales_channels: [
              { id: 'sc_tenant', name: 'Ship Fast session_abc123456789' },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_keys: [
              {
                id: 'apk_tenant',
                sales_channels: [{ id: 'sc_tenant' }],
                title: 'Ship Fast session_abc123456789',
                token: 'pk_tenant_session',
                type: 'publishable',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      // First product lookup: exists → skip
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [{ id: 'prod_existing' }] }), {
          status: 200,
        }),
      )
      // Second product lookup: does not exist → create
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ product: { id: 'prod_new' } }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminEmail: 'admin@test.com',
      adminPassword: 'supersecret',
      backendUrl: 'http://localhost:9000',
      currencyCode: 'usd',
      fetch: fetchImpl,
      products: [
        { handle: 'dark-bar', price: 12, title: 'Dark Bar' },
        { handle: 'new-mug', price: 25, title: 'New Mug' },
      ],
      sessionId: 'session_abc123456789',
    })

    expect(result.synced).toBe(2)
    // Only one POST /admin/products call (for the new product).
    const createCalls = fetchImpl.mock.calls.filter(
      ([url, init]) =>
        url === 'http://localhost:9000/admin/products' &&
        (init as RequestInit)?.method === 'POST' &&
        (init as RequestInit)?.body &&
        JSON.parse(String((init as RequestInit).body)).handle !== undefined,
    )
    expect(createCalls).toHaveLength(1)
    expect(
      JSON.parse(String((createCalls[0]?.[1] as RequestInit)?.body)),
    ).toMatchObject({
      handle: 'ship-fast-session-abc123456789-new-mug',
      title: 'New Mug',
    })
    // No DELETE calls at all.
    const deleteCalls = fetchImpl.mock.calls.filter(
      ([, init]) => (init as RequestInit)?.method === 'DELETE',
    )
    expect(deleteCalls).toHaveLength(0)
  })
})
