import { describe, expect, it, vi } from 'vitest'

import {
  createSessionMedusaConfigResponse,
  createSessionMedusaProvisionResponse,
} from './commerce-api-response'

describe('createSessionMedusaProvisionResponse', () => {
  const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'
  const realPrompt =
    'a craft beer brewery with taproom tours and seasonal releases in portland'

  it('returns a stable unavailable config response when Convex lookup fails', async () => {
    const response = await createSessionMedusaConfigResponse(realSessionId, {
      mutation: vi.fn(),
      query: vi.fn(async () => {
        throw new Error(
          `Convex commerce config failed for ${realSessionId}: ${realPrompt}`,
        )
      }),
    })

    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toEqual({
      error: 'Commerce configuration is unavailable.',
    })
    expect(JSON.stringify(body)).not.toContain(realSessionId)
    expect(JSON.stringify(body)).not.toContain('craft beer brewery')
  })

  it('provisions commerce from server Medusa settings without URL input', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
        status: 200,
      }),
    )

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          method: 'POST',
          headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.medusa.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_medusa' },
      },
    )
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        adminUrl: 'https://admin.medusa.test',
        anonymousOwnerSecret: 'owner_secret',
        backendUrl: 'https://backend.medusa.test',
        sessionId: 'session_123',
        storefrontUrl: 'https://store.medusa.test',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(JSON.parse(args.configJson)).toMatchObject({
      provider: 'medusa',
      tenantId: 'session_123',
      tenantMode: 'session',
    })
  })

  it('provisions visual commerce with a warning when Medusa is not configured', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn() },
      {
        env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
        fetch: vi.fn(),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: false,
      status: 'ready',
      warning: 'Medusa Store API not configured.',
    })
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        backendUrl: 'https://backend.medusa.test',
        errorMessage: 'Medusa Store API not configured.',
        sessionId: 'session_123',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(args.adminUrl).toBeUndefined()
    expect(args.storefrontUrl).toBeUndefined()
  })

  it('does not return localhost handoff links when Medusa backend is not configured', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn() },
      {
        env: {},
        fetch: vi.fn(),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.handoff).toBeUndefined()
    expect(payload.warning).toBe('Medusa Store API not configured.')
    const [, args] = mutation.mock.calls[0]
    expect(args.backendUrl).toBeUndefined()
    expect(args.adminUrl).toBeUndefined()
    expect(args.storefrontUrl).toBeUndefined()
  })

  it('provisions visual commerce with a warning when Medusa returns a non-ok response', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: false,
      status: 'ready',
      warning: 'Medusa Store API is unavailable.',
    })
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        errorMessage: 'Medusa Store API is unavailable.',
        sessionId: 'session_123',
      }),
    )
  })

  it('provisions visual commerce with a warning when Medusa is unreachable', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          method: 'POST',
          headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: vi.fn().mockRejectedValue(new Error('fetch failed')),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      status: 'ready',
      liveStoreApiReady: false,
      warning: 'Medusa Store API is unavailable.',
    })
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        anonymousOwnerSecret: 'owner_secret',
        backendUrl: 'https://backend.medusa.test',
        sessionId: 'session_123',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(args.errorMessage).toBe('Medusa Store API is unavailable.')
    expect(JSON.parse(args.configJson)).toMatchObject({
      provider: 'medusa',
      tenantId: 'session_123',
      tenantMode: 'session',
      liveStoreApiReady: false,
      publishableKeyConfigured: true,
    })
  })

  it('returns an owner-scoped Medusa handoff without storing credentials in Convex', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          method: 'POST',
          headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@store.test',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
          MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
        },
        fetch: vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
            status: 200,
          }),
        ),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      handoff: {
        adminEmail: 'admin@store.test',
        adminPassword: 'secret-password',
        adminUrl: 'https://admin.medusa.test',
        backendUrl: 'https://backend.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
        tenantId: 'session_123',
      },
    })
    const [, args] = mutation.mock.calls[0]
    expect(args.configJson).not.toContain('secret-password')
    expect(args.configJson).not.toContain('admin@store.test')
  })

  it('syncs generated visual products to Medusa Admin and stores the synced count', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ regions: [{ currency_code: 'eur', id: 'reg_1' }] }),
          { status: 200 },
        ),
      )
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
              { id: 'sc_tenant', name: 'Ship Fast session_123' },
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
                title: 'Ship Fast session_123',
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

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            anonymousOwnerSecret: 'owner_secret',
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'supersecret',
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: true,
      syncedProducts: 1,
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/admin/products',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        productCount: 1,
        sessionId: 'session_123',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(JSON.parse(args.configJson)).toMatchObject({
      productSync: {
        requested: 1,
        synced: 1,
      },
      medusaTenant: {
        apiKeyId: 'apk_tenant',
        publishableKey: 'pk_tenant_session',
        salesChannelId: 'sc_tenant',
      },
    })
  })

  it('returns Medusa handoff when products sync but ownerless Convex persistence is forbidden', async () => {
    const mutation = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ regions: [{ currency_code: 'eur', id: 'reg_1' }] }),
          { status: 200 },
        ),
      )
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
              { id: 'sc_tenant', name: 'Ship Fast session_123' },
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
                title: 'Ship Fast session_123',
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

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'supersecret',
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      handoff: {
        adminUrl: 'http://localhost:9000/app',
        backendUrl: 'http://localhost:9000',
        storefrontUrl: 'http://localhost:8001',
        tenantId: 'session_123',
      },
      liveStoreApiReady: true,
      persisted: false,
      syncedProducts: 1,
    })
  })

  it('creates a tenant key before Store API is globally configured', async () => {
    const mutation = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))
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
        new Response(JSON.stringify({ api_keys: [] }), { status: 200 }),
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
              title: 'Ship Fast session_123',
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ regions: [{ currency_code: 'eur', id: 'reg_1' }] }),
          { status: 200 },
        ),
      )

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'supersecret',
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:9000/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_tenant_session' },
      },
    )
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: true,
      persisted: false,
      syncedProducts: 1,
    })
  })

  it('retries the Convex config upsert without productCount for older validators', async () => {
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('Object contains extra field `productCount`'),
      )
      .mockResolvedValueOnce({ sessionId: 'session_123' })

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ regions: [{ currency_code: 'eur' }] }),
              { status: 200 },
            ),
          ),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(mutation).toHaveBeenCalledTimes(2)
    expect(mutation.mock.calls[0]?.[1]).toMatchObject({ productCount: 1 })
    expect(mutation.mock.calls[1]?.[1]).not.toHaveProperty('productCount')
  })

  it('returns a stable unavailable provision response when Convex persistence fails', async () => {
    const mutation = vi.fn(async () => {
      throw new Error(
        `Convex commerce upsert failed for ${realSessionId} owner_secret Pineapple Saison`,
      )
    })
    const response = await createSessionMedusaProvisionResponse(
      realSessionId,
      new Request(
        `http://ship-fast.test/api/sessions/${realSessionId}/provision/medusa`,
        {
          body: JSON.stringify({
            anonymousOwnerSecret: 'owner_secret',
            products: [
              {
                handle: 'pineapple-saison',
                price: 7,
                title: 'Pineapple Saison',
              },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ regions: [{ currency_code: 'usd' }] }),
              { status: 200 },
            ),
          ),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toEqual({ error: 'Commerce provisioning failed.' })
    expect(JSON.stringify(body)).not.toContain(realSessionId)
    expect(JSON.stringify(body)).not.toContain('owner_secret')
    expect(JSON.stringify(body)).not.toContain('Pineapple Saison')
  })
})
