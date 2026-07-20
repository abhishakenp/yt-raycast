import { describe, expect, it, vi } from 'vitest'

import { createSessionMedusaProductsResponse } from './medusa-product-read'
import { normalizeMedusaStoreProduct } from './medusa-store-product'

describe('createSessionMedusaProductsResponse', () => {
  const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

  it('rejects products when either present tenant metadata key conflicts', () => {
    expect(
      normalizeMedusaStoreProduct('session_123', {
        handle: 'conflicting-product',
        metadata: {
          ship_fast_session_id: 'session_123',
          ship_fast_tenant_id: 'other_tenant',
        },
        title: 'Conflicting Product',
      }),
    ).toBeUndefined()
  })

  it('requests rich Store fields and preserves every provider variant losslessly', async () => {
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
                collection: {
                  handle: 'summer-edit',
                  id: 'pcol_summer',
                  title: 'Summer Edit',
                },
                description: 'A breathable everyday tee',
                handle: 'ship-fast-session-123-linen-tee',
                id: 'prod_linen',
                images: [
                  {
                    id: 'pimg_front',
                    url: 'https://cdn.example.com/linen-front.jpg',
                  },
                  {
                    id: 'pimg_back',
                    url: 'https://cdn.example.com/linen-back.jpg',
                  },
                ],
                metadata: {
                  ship_fast_generated_handle: 'linen-tee',
                  ship_fast_generated_product: true,
                  ship_fast_generated_source_id: 'product_linen_tee',
                  ship_fast_session_id: 'session_123',
                },
                options: [
                  {
                    id: 'popt_size',
                    title: 'Size',
                    values: [{ value: 'Small' }, { value: 'Large' }],
                  },
                ],
                tags: [{ id: 'ptag_linen', value: 'Linen' }],
                thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
                title: 'Linen Tee',
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 29,
                      currency_code: 'USD',
                      original_amount: 35,
                    },
                    id: 'variant_small_provider',
                    inventory_quantity: 7,
                    manage_inventory: true,
                    metadata: {
                      ship_fast_generated_sku: 'LINEN-S',
                      ship_fast_generated_source_id: 'variant_small',
                    },
                    options: [
                      {
                        option_id: 'popt_size',
                        value: 'Small',
                      },
                    ],
                    prices: [
                      { amount: 29, currency_code: 'USD' },
                      { amount: 27, currency_code: 'EUR' },
                    ],
                    sku: 'SHIP-FAST-SESSION-123-LINEN-TEE-LINEN-S',
                    title: 'Small',
                  },
                  {
                    calculated_price: {
                      calculated_amount: 32,
                      currency_code: 'GBP',
                      original_amount: 32,
                    },
                    id: 'variant_large_provider',
                    inventory_quantity: 0,
                    manage_inventory: false,
                    metadata: {
                      ship_fast_generated_source_id: 'variant_large',
                    },
                    options: [
                      {
                        option_id: 'popt_size',
                        value: 'Large',
                      },
                    ],
                    prices: [{ amount: 32, currency_code: 'GBP' }],
                    sku: 'LINEN-L',
                    title: 'Large',
                  },
                ],
              },
              {
                handle: 'other-tenant-product',
                id: 'prod_other',
                metadata: { ship_fast_session_id: 'other_session' },
                title: 'Other Tenant Product',
              },
            ],
          }),
          { status: 200 },
        ),
      )

    const response = await createSessionMedusaProductsResponse('session_123', {
      containerFinder: () => Promise.resolve(undefined),
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
          collections: [
            {
              handle: 'summer-edit',
              sourceId: 'pcol_summer',
              title: 'Summer Edit',
            },
          ],
          currencyCode: 'usd',
          description: 'A breathable everyday tee',
          handle: 'ship-fast-session-123-linen-tee',
          id: 'prod_linen',
          images: [
            {
              sourceId: 'pimg_front',
              url: 'https://cdn.example.com/linen-front.jpg',
            },
            {
              sourceId: 'pimg_back',
              url: 'https://cdn.example.com/linen-back.jpg',
            },
          ],
          options: [
            {
              sourceId: 'popt_size',
              title: 'Size',
              values: ['Small', 'Large'],
            },
          ],
          price: 29,
          sourceHandle: 'linen-tee',
          sourceId: 'product_linen_tee',
          tags: [{ sourceId: 'ptag_linen', value: 'Linen' }],
          thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
          title: 'Linen Tee',
          variants: [
            {
              available: true,
              calculatedPrice: { amount: 29, currencyCode: 'usd' },
              id: 'variant_small_provider',
              inventoryQuantity: 7,
              manageInventory: true,
              optionValues: { Size: 'Small' },
              originalPrice: { amount: 35, currencyCode: 'usd' },
              prices: [
                { amount: 29, currencyCode: 'usd' },
                { amount: 27, currencyCode: 'eur' },
              ],
              sku: 'LINEN-S',
              sourceId: 'variant_small',
              title: 'Small',
            },
            {
              available: true,
              calculatedPrice: { amount: 32, currencyCode: 'gbp' },
              id: 'variant_large_provider',
              inventoryQuantity: 0,
              manageInventory: false,
              optionValues: { Size: 'Large' },
              originalPrice: { amount: 32, currencyCode: 'gbp' },
              prices: [{ amount: 32, currencyCode: 'gbp' }],
              sku: 'LINEN-L',
              sourceId: 'variant_large',
              title: 'Large',
            },
          ],
        },
      ],
      sessionId: 'session_123',
    })
    const productsUrl = String(fetchImpl.mock.calls[1]?.[0])
    const fields = new URL(productsUrl).searchParams.get('fields') ?? ''
    expect(fields).toContain('+metadata')
    expect(fields).toContain('*images')
    expect(fields).toContain('*options')
    expect(fields).toContain('*variants.options')
    expect(fields).toContain('+variants.inventory_quantity')
    expect(fields).toContain('+variants.manage_inventory')
    expect(fields).toContain('+variants.sku')
    expect(fields).toContain('*variants.calculated_price')
    expect(fields).toContain('*variants.prices')
  })

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
        containerFinder: () => Promise.resolve(undefined),
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
      expect.stringContaining(
        'https://backend.medusa.test/store/products?limit=100&region_id=reg_123&fields=',
      ),
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
        containerFinder: () => Promise.resolve(undefined),
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

  it('falls back from DB-observed malformed tenant config JSON without leaking parse details', async () => {
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
                handle:
                  'ship-fast-k574ms14ma9f94keq30r7dq24x89n1k2-pineapple-saison',
                metadata: {
                  ship_fast_generated_handle: 'pineapple-saison',
                  ship_fast_generated_product: true,
                  ship_fast_session_id: realSessionId,
                },
                title: 'Pineapple Saison',
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 7,
                      currency_code: 'usd',
                    },
                  },
                ],
              },
            ],
          }),
          { status: 200 },
        ),
      )
    const query = vi.fn().mockResolvedValue({
      configJson:
        '{"provider":"medusa","tenantMode":"session","tenantId":"k577jbx9tbkcc3bhs1fvqepf9989fm0w","warning":"Medusa Store API is unavailable: fetch failed"',
      status: 'ready',
    })

    const response = await createSessionMedusaProductsResponse(
      realSessionId,
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_global',
        },
        fetch: fetchImpl,
        containerFinder: () => Promise.resolve(undefined),
        metaEnv: {},
      },
      { mutation: vi.fn(), query },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      products: [
        {
          currencyCode: 'usd',
          handle: 'ship-fast-k574ms14ma9f94keq30r7dq24x89n1k2-pineapple-saison',
          price: 7,
          sourceHandle: 'pineapple-saison',
          title: 'Pineapple Saison',
        },
      ],
      sessionId: realSessionId,
    })
    expect(JSON.stringify(body)).not.toContain('Unexpected end')
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_global' },
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
      containerFinder: () => Promise.resolve(undefined),
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
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
      expect.stringContaining(
        'https://backend.medusa.test/store/products?limit=100&region_id=reg_123&fields=',
      ),
      {
        headers: { 'x-publishable-api-key': 'pk_medusa' },
      },
    )
  })

  it('returns an empty product list when the Store API is not configured', async () => {
    const response = await createSessionMedusaProductsResponse('session_123', {
      env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
      fetch: vi.fn(),
      containerFinder: () => Promise.resolve(undefined),
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
      containerFinder: () => Promise.resolve(undefined),
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
      containerFinder: () => Promise.resolve(undefined),
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

  it('treats malformed JSON product payloads as Store API failures instead of a valid empty catalog', async () => {
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
            products: {
              handle:
                'ship-fast-k574ms14ma9f94keq30r7dq24x89n1k2-pineapple-saison',
              metadata: {
                ship_fast_generated_handle: 'pineapple-saison',
                ship_fast_generated_product: true,
                ship_fast_session_id: realSessionId,
              },
              title: 'Pineapple Saison',
            },
          }),
          { status: 200 },
        ),
      )

    const response = await createSessionMedusaProductsResponse(realSessionId, {
      env: {
        MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
      },
      fetch: fetchImpl,
      containerFinder: () => Promise.resolve(undefined),
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      products: [],
      sessionId: realSessionId,
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
        containerFinder: () => Promise.resolve(undefined),
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
        containerFinder: () => Promise.resolve(undefined),
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

  it('includes admin-created products without ship-fast metadata for bidirectional sync', async () => {
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
                title: 'Admin-Created Mug',
                handle: 'admin-created-mug',
                description: 'Added directly in Medusa admin',
                metadata: {},
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 15,
                      currency_code: 'usd',
                    },
                  },
                ],
              },
              {
                title: 'Admin Product No Metadata',
                handle: 'admin-no-metadata-product',
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 30,
                      currency_code: 'usd',
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
      containerFinder: () => Promise.resolve(undefined),
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      products: [
        {
          currencyCode: 'eur',
          description: 'Updated in Medusa',
          handle: 'ship-fast-session-123-truffle-box',
          price: 89,
          sourceHandle: 'truffle-box',
          title: 'Edited Truffle Box',
        },
        {
          currencyCode: 'usd',
          description: 'Added directly in Medusa admin',
          handle: 'admin-created-mug',
          price: 15,
          sourceHandle: 'admin-created-mug',
          title: 'Admin-Created Mug',
        },
        {
          currencyCode: 'usd',
          handle: 'admin-no-metadata-product',
          price: 30,
          sourceHandle: 'admin-no-metadata-product',
          title: 'Admin Product No Metadata',
        },
      ],
      sessionId: 'session_123',
    })
  })

  it('uses the product handle as sourceHandle when ship-fast metadata is missing the generated handle', async () => {
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
                title: 'Partially Tagged Product',
                handle: 'partial-tag-product',
                metadata: {
                  ship_fast_generated_product: true,
                  ship_fast_session_id: 'session_123',
                },
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 42,
                      currency_code: 'usd',
                    },
                  },
                ],
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
      containerFinder: () => Promise.resolve(undefined),
      metaEnv: {},
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      products: [
        {
          currencyCode: 'usd',
          handle: 'partial-tag-product',
          price: 42,
          sourceHandle: 'partial-tag-product',
          title: 'Partially Tagged Product',
        },
      ],
      sessionId: 'session_123',
    })
  })
})
