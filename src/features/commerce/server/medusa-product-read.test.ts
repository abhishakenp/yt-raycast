import { describe, expect, it, vi } from 'vitest'

import { createSessionMedusaProductsResponse } from './medusa-product-read'

describe('createSessionMedusaProductsResponse', () => {
  const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

  it('uses the session tenant publishable key from commerce config when available', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_123' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
    const query = vi.fn().mockResolvedValue({
      configJson: JSON.stringify({
        medusaTenant: {
          publishableKey: 'pk_session_tenant',
        },
      }),
      status: 'ready',
    })

    const response = await createSessionMedusaProductsResponse(
      'session_123',
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_global',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
      { mutation: vi.fn(), query },
    )

    expect(response.status).toBe(200)
    expect(query).toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_session_tenant' },
      },
    )
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://backend.medusa.test/store/products?limit=100&region_id=reg_123&fields=%2Bmetadata%2C*variants.calculated_price',
      {
        headers: { 'x-publishable-api-key': 'pk_session_tenant' },
      },
    )
  })

  it('discovers the session tenant publishable key from Medusa Admin when config is unavailable', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_keys: [
              {
                sales_channels: [{ id: 'sc_tenant' }],
                title: 'Ship Fast session_123',
                token: 'pk_session_tenant',
                type: 'publishable',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_123' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
    const query = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))

    const response = await createSessionMedusaProductsResponse(
      'session_123',
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'supersecret',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_global',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
      { mutation: vi.fn(), query },
    )

    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://backend.medusa.test/auth/user/emailpass',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://backend.medusa.test/admin/api-keys?limit=100',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer admin-token',
        }),
      }),
    )
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_session_tenant' },
      },
    )
  })

  it('returns session-scoped Medusa products with generated handles and prices', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_123' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            products: [
              {
                title: 'Edited Truffle Box',
                handle: 'ship-fast-session-123-truffle-box',
                description: 'Updated in Medusa',
                metadata: {
                  ship_fast_generated_handle: 'truffle-box',
                  ship_fast_generated_product: true,
                  ship_fast_session_id: 'session_123',
                },
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 89,
                      currency_code: 'eur',
                    },
                  },
                ],
              },
              {
                title: 'Other Session Product',
                handle: 'ship-fast-other-product',
                metadata: {
                  ship_fast_generated_handle: 'other-product',
                  ship_fast_generated_product: true,
                  ship_fast_session_id: 'other_session',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )

    const response = await createSessionMedusaProductsResponse('session_123', {
      env: {
        MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
      },
      fetch: fetchImpl,
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      products: [
        {
          currencyCode: 'eur',
          description: 'Updated in Medusa',
          handle: 'ship-fast-session-123-truffle-box',
          price: 89,
          sourceHandle: 'truffle-box',
          title: 'Edited Truffle Box',
        },
      ],
      sessionId: 'session_123',
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_medusa' },
      },
    )
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://backend.medusa.test/store/products?limit=100&region_id=reg_123&fields=%2Bmetadata%2C*variants.calculated_price',
      {
        headers: { 'x-publishable-api-key': 'pk_medusa' },
      },
    )
  })

  it('returns an empty product list when the Store API is not configured', async () => {
    const response = await createSessionMedusaProductsResponse('session_123', {
      env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
      fetch: vi.fn(),
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      products: [],
      sessionId: 'session_123',
      warning: 'Medusa Store API not configured.',
    })
  })

  it('returns an empty product list when the region endpoint returns malformed HTML', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response('<!doctype html><title>regions unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )

    const response = await createSessionMedusaProductsResponse('session_123', {
      env: {
        MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
      },
      fetch: fetchImpl,
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      products: [],
      sessionId: 'session_123',
      warning: 'Medusa Store API product read failed.',
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('returns an empty product list when the products endpoint returns malformed HTML', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_123' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response('<!doctype html><title>products unavailable</title>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
      )

    const response = await createSessionMedusaProductsResponse('session_123', {
      env: {
        MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
      },
      fetch: fetchImpl,
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      products: [],
      sessionId: 'session_123',
      warning: 'Medusa Store API product read failed.',
    })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('returns an empty product list when Medusa admin auth returns malformed HTML during tenant discovery', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response('<!doctype html><title>admin auth unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )
    const query = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))

    const response = await createSessionMedusaProductsResponse(
      realSessionId,
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'owner@brewery.example',
          MEDUSA_ADMIN_PASSWORD: 'super-secret-password',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
      { mutation: vi.fn(), query },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      products: [],
      sessionId: realSessionId,
      warning: 'Medusa Store API product read failed.',
    })
    expect(JSON.stringify(body)).not.toContain('owner@brewery.example')
    expect(JSON.stringify(body)).not.toContain('super-secret-password')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('returns an empty product list when Medusa admin API keys return malformed HTML during tenant discovery', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'admin-token' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response('<!doctype html><title>api keys unavailable</title>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
      )
    const query = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))

    const response = await createSessionMedusaProductsResponse(
      realSessionId,
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'owner@brewery.example',
          MEDUSA_ADMIN_PASSWORD: 'super-secret-password',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
      { mutation: vi.fn(), query },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      products: [],
      sessionId: realSessionId,
      warning: 'Medusa Store API product read failed.',
    })
    expect(JSON.stringify(body)).not.toContain('owner@brewery.example')
    expect(JSON.stringify(body)).not.toContain('super-secret-password')
    expect(JSON.stringify(body)).not.toContain('admin-token')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
