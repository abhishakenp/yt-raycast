import { describe, expect, it, vi } from 'vitest'

import {
  createSessionScopedCollectionHandle,
  createSessionScopedProductHandle,
  createTenantScopedVariantSku,
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

  it('namespaces a common unmanaged SKU independently for two tenants', () => {
    const variant = {
      manageInventory: false,
      sku: 'COMMON-SKU',
      sourceId: 'variant_common',
      title: 'Common',
    }

    expect(
      createTenantScopedVariantSku('session_tenant_a', 'linen-tee', variant),
    ).toBe('SHIP-FAST-SESSION-TENANT-A-LINEN-TEE-COMMON-SKU')
    expect(
      createTenantScopedVariantSku('session_tenant_b', 'linen-tee', variant),
    ).toBe('SHIP-FAST-SESSION-TENANT-B-LINEN-TEE-COMMON-SKU')
  })

  it('namespaces a common generated collection independently for two tenants', () => {
    expect(
      createSessionScopedCollectionHandle('session_tenant_a', 'summer-edit'),
    ).toBe('ship-fast-session-tenant-a-summer-edit')
    expect(
      createSessionScopedCollectionHandle('session_tenant_b', 'summer-edit'),
    ).toBe('ship-fast-session-tenant-b-summer-edit')
  })

  it('isolates the same unmanaged SKU and collection across two tenant syncs', async () => {
    const createFetch = (sessionId: string, suffix: string) =>
      vi
        .fn()
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
                { id: `sc_${suffix}`, name: `Ship Fast ${sessionId}` },
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
                  id: `apk_${suffix}`,
                  sales_channels: [{ id: `sc_${suffix}` }],
                  title: `Ship Fast ${sessionId}`,
                  token: `pk_${suffix}`,
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
          new Response(JSON.stringify({ collections: [] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ collection: { id: `pcol_${suffix}` } }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ product: { id: `prod_${suffix}` } }), {
            status: 200,
          }),
        )
    const product = {
      collections: [
        {
          handle: 'summer-edit',
          sourceId: 'collection_summer',
          title: 'Summer Edit',
        },
      ],
      handle: 'linen-tee',
      price: 29,
      title: 'Linen Tee',
      variants: [
        {
          manageInventory: false,
          optionValues: {},
          prices: [{ amount: 29, currencyCode: 'usd' }],
          sku: 'COMMON-SKU',
          sourceId: 'variant_common',
          title: 'Common',
        },
      ],
    }
    const tenantAFetch = createFetch('session_tenant_a', 'tenant_a')
    const tenantBFetch = createFetch('session_tenant_b', 'tenant_b')

    await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: tenantAFetch,
      products: [product],
      sessionId: 'session_tenant_a',
    })
    await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: tenantBFetch,
      products: [product],
      sessionId: 'session_tenant_b',
    })

    expect(tenantAFetch).toHaveBeenCalledWith(
      'http://localhost:9000/admin/collections?handle=ship-fast-session-tenant-a-summer-edit&limit=1',
      expect.anything(),
    )
    expect(tenantBFetch).toHaveBeenCalledWith(
      'http://localhost:9000/admin/collections?handle=ship-fast-session-tenant-b-summer-edit&limit=1',
      expect.anything(),
    )
    const providerSku = (fetchImpl: typeof tenantAFetch) => {
      const createProductCall = fetchImpl.mock.calls.find(
        ([url]) => url === 'http://localhost:9000/admin/products',
      )
      return JSON.parse(String(createProductCall?.[1]?.body)).variants[0].sku
    }
    expect(providerSku(tenantAFetch)).toBe(
      'SHIP-FAST-SESSION-TENANT-A-LINEN-TEE-COMMON-SKU',
    )
    expect(providerSku(tenantBFetch)).toBe(
      'SHIP-FAST-SESSION-TENANT-B-LINEN-TEE-COMMON-SKU',
    )
    expect(
      [...tenantAFetch.mock.calls, ...tenantBFetch.mock.calls].some(([url]) =>
        String(url).includes('/admin/inventory-items'),
      ),
    ).toBe(false)
  })

  it('creates an exact rich Admin product payload with every generated variant', async () => {
    const fetchImpl = vi
      .fn()
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
              {
                id: 'sc_tenant',
                name: 'Ship Fast session_abc123456789',
              },
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
        new Response(JSON.stringify({ collections: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            collection: {
              handle: 'summer-edit',
              id: 'pcol_provider_summer',
              title: 'Summer Edit',
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ product: { id: 'prod_1' } }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [
        {
          collections: [
            {
              handle: 'summer-edit',
              sourceId: 'collection_summer',
              title: 'Summer Edit',
            },
          ],
          description: 'A breathable everyday tee',
          handle: 'linen-tee',
          images: [
            {
              alt: 'Linen tee front',
              sourceId: 'image_front',
              url: 'https://cdn.example.com/linen-front.jpg',
            },
            { url: 'https://cdn.example.com/linen-back.jpg' },
          ],
          options: [{ title: 'Size', values: ['Small', 'Large'] }],
          price: 29,
          sourceId: 'product_linen_tee',
          tags: [{ sourceId: 'tag_linen', value: 'Linen' }],
          thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
          title: 'Linen Tee',
          variants: [
            {
              manageInventory: false,
              optionValues: { Size: 'Small' },
              prices: [
                { amount: 29, currencyCode: 'USD' },
                { amount: 27, currencyCode: 'eur' },
              ],
              sku: 'LINEN-S',
              sourceId: 'variant_small',
              title: 'Small',
            },
            {
              manageInventory: false,
              optionValues: { Size: 'Large' },
              prices: [{ amount: 32, currencyCode: 'GBP' }],
              sku: 'LINEN-L',
              sourceId: 'variant_large',
              title: 'Large',
            },
          ],
        },
      ],
      sessionId: 'session_abc123456789',
    })

    expect(result.synced).toBe(1)
    const createCall = fetchImpl.mock.calls.find(
      ([url]) => url === 'http://localhost:9000/admin/products',
    )
    expect(JSON.parse(String(createCall?.[1]?.body))).toEqual({
      collection_id: 'pcol_provider_summer',
      description: 'A breathable everyday tee',
      handle: 'ship-fast-session-abc123456789-linen-tee',
      images: [
        { url: 'https://cdn.example.com/linen-front.jpg' },
        { url: 'https://cdn.example.com/linen-back.jpg' },
      ],
      metadata: {
        ship_fast_generated_handle: 'linen-tee',
        ship_fast_generated_product: true,
        ship_fast_generated_source_id: 'product_linen_tee',
        ship_fast_session_id: 'session_abc123456789',
      },
      options: [{ title: 'Size', values: ['Small', 'Large'] }],
      sales_channels: [{ id: 'sc_tenant' }],
      shipping_profile_id: 'sp_default',
      status: 'published',
      tags: [{ value: 'Linen' }],
      thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
      title: 'Linen Tee',
      variants: [
        {
          manage_inventory: false,
          metadata: {
            ship_fast_generated_sku: 'LINEN-S',
            ship_fast_generated_source_id: 'variant_small',
          },
          options: { Size: 'Small' },
          prices: [
            { amount: 29, currency_code: 'usd' },
            { amount: 27, currency_code: 'eur' },
          ],
          sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-LINEN-S',
          title: 'Small',
        },
        {
          manage_inventory: false,
          metadata: {
            ship_fast_generated_sku: 'LINEN-L',
            ship_fast_generated_source_id: 'variant_large',
          },
          options: { Size: 'Large' },
          prices: [{ amount: 32, currency_code: 'gbp' }],
          sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-LINEN-L',
          title: 'Large',
        },
      ],
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/collections?handle=ship-fast-session-abc123456789-summer-edit&limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer admin-token',
        }),
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/collections',
      expect.objectContaining({
        body: JSON.stringify({
          external_id: 'collection_summer',
          handle: 'ship-fast-session-abc123456789-summer-edit',
          metadata: {
            ship_fast_generated_handle: 'summer-edit',
            ship_fast_generated_source_id: 'collection_summer',
            ship_fast_session_id: 'session_abc123456789',
          },
          title: 'Summer Edit',
        }),
        method: 'POST',
      }),
    )
  })

  it('initializes requested inventory only for managed variants using an explicit idempotent sequence', async () => {
    const fetchImpl = vi
      .fn()
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
              {
                id: 'sc_tenant',
                name: 'Ship Fast session_abc123456789',
              },
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
        new Response(
          JSON.stringify({ stock_locations: [{ id: 'sloc_tenant' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sales_channel_id: 'sc_tenant',
            stock_location_id: 'sloc_tenant',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ inventory_items: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ inventory_item: { id: 'iitem_small' } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ inventory_levels: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ inventory_level: { id: 'ilev_small' } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            product: {
              id: 'prod_1',
              variants: [
                { id: 'variant_small', sku: 'LINEN-S' },
                {
                  id: 'variant_large',
                  sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-VARIANT-LARGE',
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [
        {
          handle: 'linen-tee',
          price: 29,
          title: 'Linen Tee',
          variants: [
            {
              inventoryQuantity: 7,
              manageInventory: true,
              optionValues: { Size: 'Small' },
              prices: [{ amount: 29, currencyCode: 'usd' }],
              sku: 'LINEN-S',
              sourceId: 'variant_small',
              title: 'Small',
            },
            {
              manageInventory: false,
              optionValues: { Size: 'Large' },
              prices: [{ amount: 32, currencyCode: 'usd' }],
              sku: 'COMMON-SKU',
              sourceId: 'variant_large',
              title: 'Large',
            },
          ],
        },
      ],
      sessionId: 'session_abc123456789',
    })

    expect(result.synced).toBe(1)
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/stock-locations?limit=1',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer admin-token',
        }),
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/stock-locations/sloc_tenant/sales-channels',
      expect.objectContaining({
        body: JSON.stringify({ add: ['sc_tenant'] }),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/inventory-items?sku=SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-LINEN-S&limit=1',
      expect.anything(),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/inventory-items',
      expect.objectContaining({
        body: JSON.stringify({
          metadata: {
            ship_fast_generated_sku: 'LINEN-S',
            ship_fast_generated_source_id: 'variant_small',
            ship_fast_session_id: 'session_abc123456789',
          },
          sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-LINEN-S',
          title: 'Linen Tee — Small',
        }),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/inventory-items/iitem_small/location-levels',
      {
        headers: {
          authorization: 'Bearer admin-token',
          'content-type': 'application/json',
        },
      },
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/inventory-items/iitem_small/location-levels',
      expect.objectContaining({
        body: JSON.stringify({
          location_id: 'sloc_tenant',
          stocked_quantity: 7,
        }),
        method: 'POST',
      }),
    )
    expect(
      fetchImpl.mock.calls.some(([url]) => String(url).includes('COMMON-SKU')),
    ).toBe(false)
    const createProductCall = fetchImpl.mock.calls.find(
      ([url]) => url === 'http://localhost:9000/admin/products',
    )
    expect(
      JSON.parse(String(createProductCall?.[1]?.body)).variants,
    ).toMatchObject([
      {
        inventory_items: [
          { inventory_item_id: 'iitem_small', required_quantity: 1 },
        ],
        manage_inventory: true,
        metadata: {
          ship_fast_generated_sku: 'LINEN-S',
          ship_fast_generated_source_id: 'variant_small',
        },
        sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-LINEN-S',
      },
      {
        manage_inventory: false,
        metadata: {
          ship_fast_generated_sku: 'COMMON-SKU',
          ship_fast_generated_source_id: 'variant_large',
        },
        sku: 'SHIP-FAST-SESSION-ABC123456789-LINEN-TEE-COMMON-SKU',
      },
    ])
    expect(JSON.parse(String(createProductCall?.[1]?.body)).options).toEqual([
      { title: 'Size', values: ['Small', 'Large'] },
    ])
  })

  it('reuses existing inventory items and reconciles stale levels after a partial seed retry', async () => {
    const fetchImpl = vi
      .fn()
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
              {
                id: 'sc_tenant',
                name: 'Ship Fast session_abc123456789',
              },
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
        new Response(
          JSON.stringify({ stock_locations: [{ id: 'sloc_tenant' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sales_channel_id: 'sc_tenant',
            stock_location_id: 'sloc_tenant',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ inventory_items: [{ id: 'iitem_small' }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            inventory_levels: [
              {
                id: 'ilev_small',
                location_id: 'sloc_tenant',
                stocked_quantity: 3,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ product: { id: 'prod_1' } }), {
          status: 200,
        }),
      )

    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: 'admin-token',
      backendUrl: 'http://localhost:9000',
      fetch: fetchImpl,
      products: [
        {
          handle: 'linen-tee',
          price: 29,
          title: 'Linen Tee',
          variants: [
            {
              inventoryQuantity: 7,
              manageInventory: true,
              optionValues: {},
              prices: [{ amount: 29, currencyCode: 'usd' }],
              sku: 'LINEN-S',
              sourceId: 'variant_small',
              title: 'Small',
            },
          ],
        },
      ],
      sessionId: 'session_abc123456789',
    })

    expect(result.synced).toBe(1)
    expect(
      fetchImpl.mock.calls.filter(
        ([url, init]) =>
          url === 'http://localhost:9000/admin/inventory-items' &&
          typeof init === 'object' &&
          init !== null &&
          'method' in init &&
          init.method === 'POST',
      ),
    ).toHaveLength(0)
    expect(
      fetchImpl.mock.calls.filter(
        ([url, init]) =>
          String(url) ===
            'http://localhost:9000/admin/inventory-items/iitem_small/location-levels' &&
          typeof init === 'object' &&
          init !== null &&
          'method' in init &&
          init.method === 'POST',
      ),
    ).toHaveLength(0)
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/inventory-items/iitem_small/location-levels/sloc_tenant',
      expect.objectContaining({
        body: JSON.stringify({ stocked_quantity: 7 }),
        method: 'POST',
      }),
    )
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
    const createdProduct = JSON.parse(String(createCall?.[1]?.body))
    expect(createdProduct).toMatchObject({
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
    expect(createdProduct.variants).toEqual([
      {
        manage_inventory: false,
        metadata: {
          ship_fast_generated_sku: 'TRUFFLE-BOX-VARIANT-TRUFFLE-BOX-DEFAULT',
          ship_fast_generated_source_id: 'variant:truffle-box:default',
        },
        options: { Default: 'Default' },
        prices: [{ amount: 79, currency_code: 'eur' }],
        sku: 'SHIP-FAST-SESSION-ABC123456789-TRUFFLE-BOX-TRUFFLE-BOX-VARIANT-TRUFFLE-BOX-DEFAULT',
        title: 'Default',
      },
    ])
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
    expect(
      fetchImpl.mock.calls.some(([url]) =>
        String(url).includes('/admin/collections'),
      ),
    ).toBe(false)
    expect(
      fetchImpl.mock.calls.some(([url]) =>
        String(url).includes('/admin/product-tags'),
      ),
    ).toBe(false)
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
