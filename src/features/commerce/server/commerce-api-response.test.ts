import { describe, expect, it, vi } from 'vitest'

import {
  createSessionMedusaConfigResponse,
  createSessionMedusaProvisionResponse,
} from './commerce-api-response'

describe('createSessionMedusaProvisionResponse', () => {
  const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'
  const realPrompt =
    'a craft beer brewery with taproom tours and seasonal releases in portland'

  // Mock container provider that bypasses Docker and returns env-configured
  // URLs. This lets tests verify the provision flow without spawning real
  // Medusa containers.
  function mockContainerProvider(env: Record<string, string | undefined>) {
    return {
      findRunning: vi.fn().mockResolvedValue(undefined),
      provision: vi.fn().mockResolvedValue({
        adminUrl: env.MEDUSA_ADMIN_URL,
        backendUrl: env.MEDUSA_BACKEND_URL,
        storefrontUrl: env.MEDUSA_STOREFRONT_URL,
      }),
    }
  }

  it('uses user-created admin credentials without persisting them', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = {
      findRunning: vi.fn().mockResolvedValue(undefined),
      provision: vi.fn().mockResolvedValue({
        adminUrl: 'https://admin.medusa.test',
        backendUrl: 'https://backend.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
      }),
    }
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            adminEmail: 'owner@store.test',
            adminPassword: 'user-created-password',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      ),
      {
        mutation,
        query: vi.fn().mockResolvedValue({ sessionId: 'session_123' }),
        setAuth: vi.fn(),
      },
      {
        containerProvider,
        env: {
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          RAZORPAY_KEY_ID: 'rzp_test_ship_fast',
          RAZORPAY_KEY_SECRET: 'test-secret',
          RAZORPAY_WEBHOOK_SECRET: 'test-webhook-secret',
        },
        fetch: vi
          .fn()
          .mockResolvedValue(
            Response.json({ regions: [{ currency_code: 'usd' }] }),
          ),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(containerProvider.provision).toHaveBeenCalledWith('session_123', {
      adminEmail: 'owner@store.test',
      adminPassword: 'user-created-password',
      fetch: expect.any(Function),
      razorpayKeyId: 'rzp_test_ship_fast',
      razorpayKeySecret: 'test-secret',
      razorpayWebhookSecret: 'test-webhook-secret',
    })
    expect(JSON.stringify(mutation.mock.calls)).not.toContain(
      'user-created-password',
    )
    expect(JSON.stringify(await response.clone().json())).not.toContain(
      'user-created-password',
    )
  })

  it('returns a stable unavailable config response when Convex lookup fails', async () => {
    const response = await createSessionMedusaConfigResponse(realSessionId, {
      mutation: vi.fn(),
      query: vi.fn(async () => {
        throw new Error(
          `Convex commerce config failed for ${realSessionId}: ${realPrompt}`,
        )
      }),
      setAuth: vi.fn(),
    })

    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toEqual({
      error: 'Commerce configuration is unavailable.',
    })
    expect(JSON.stringify(body)).not.toContain(realSessionId)
    expect(JSON.stringify(body)).not.toContain('craft beer brewery')
  })

  it('returns 403 before provisioning side effects for an invalid owner', async () => {
    const query = vi.fn().mockRejectedValue(new Error('FORBIDDEN'))
    const mutation = vi.fn()
    const fetchImpl = vi.fn()
    const containerProvider = {
      findRunning: vi.fn(),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          headers: { 'x-ship-fast-owner-secret': 'wrong-secret' },
          method: 'POST',
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(403)
    expect(query).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: 'wrong-secret',
      sessionId: 'session_123',
    })
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('returns 404 before provisioning side effects for a missing session', async () => {
    const query = vi.fn().mockRejectedValue(new Error('NOT_FOUND'))
    const mutation = vi.fn()
    const fetchImpl = vi.fn()
    const containerProvider = {
      findRunning: vi.fn(),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'missing_session',
      new Request(
        'http://ship-fast.test/api/sessions/missing_session/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(404)
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('falls back to mutation ownership checks when older Convex lacks provision authorization query', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const query = vi
      .fn()
      .mockRejectedValue(
        new Error(
          "Could not find public function for 'sessions:authorizeSessionCommerceProvision'.",
        ),
      )
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ regions: [{ currency_code: 'usd' }] }), {
        status: 200,
      }),
    )
    const containerProvider = {
      findRunning: vi.fn().mockResolvedValue({
        adminUrl: 'https://admin.tenant.test',
        backendUrl: 'https://backend.tenant.test',
        storefrontUrl: 'https://store.tenant.test',
      }),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
          method: 'POST',
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        anonymousOwnerSecret: 'owner_secret',
        backendUrl: 'https://backend.medusa.test',
        sessionId: 'session_123',
      }),
    )
  })

  it('applies an incoming bearer token before authorizing a signed-in owner', async () => {
    const setAuth = vi.fn()
    const query = vi.fn(async () => {
      if (setAuth.mock.calls.length === 0) {
        throw new Error('FORBIDDEN')
      }
      return { sessionId: 'session_123' }
    })
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
        status: 200,
      }),
    )
    const containerProvider = mockContainerProvider({
      MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
      MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
      MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
    })

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          headers: { authorization: 'Bearer convex-jwt' },
          method: 'POST',
        },
      ),
      { mutation, query, setAuth },
      {
        containerProvider,
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(setAuth).toHaveBeenCalledWith('convex-jwt')
    expect(setAuth.mock.invocationCallOrder[0]).toBeLessThan(
      query.mock.invocationCallOrder[0],
    )
    expect(query).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: undefined,
      sessionId: 'session_123',
    })
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
  })

  it('provisions commerce from server Medusa settings without URL input', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const query = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
        status: 200,
      }),
    )
    const containerProvider = mockContainerProvider({
      MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
      MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
      MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
    })

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          method: 'POST',
          headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
          MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
        },
        containerProvider,
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(query).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: 'owner_secret',
      sessionId: 'session_123',
    })
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
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
      publishableKey: 'pk_medusa',
      tenantId: 'session_123',
      tenantMode: 'session',
    })
  })

  it('uses configured shared Medusa URLs without local container provisioning', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const query = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ regions: [{ currency_code: 'usd' }] }), {
        status: 200,
      }),
    )
    const containerProvider = {
      findRunning: vi.fn().mockResolvedValue(undefined),
      provision: vi.fn().mockResolvedValue({
        adminUrl: 'https://admin.tenant.test',
        backendUrl: 'https://backend.tenant.test',
        storefrontUrl: 'https://store.tenant.test',
      }),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
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
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
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
        backendUrl: 'https://backend.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
      }),
    )
  })

  it('uses configured backend with a warning when publishable key is missing', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = mockContainerProvider({
      MEDUSA_ADMIN_URL: 'https://admin.container.test',
      MEDUSA_BACKEND_URL: 'https://backend.container.test',
      MEDUSA_STOREFRONT_URL: 'https://store.container.test',
    })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' },
        containerProvider,
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
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        backendUrl: 'https://backend.medusa.test',
        errorMessage: 'Medusa Store API not configured.',
        sessionId: 'session_123',
        storefrontUrl: 'http://ship-fast.test/generate/session_123',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(args).not.toHaveProperty('adminUrl')
  })

  it('does not return localhost handoff links when Medusa backend is not configured', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {},
        containerProvider: mockContainerProvider({}),
        fetch: vi.fn(),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.handoff).toBeUndefined()
    expect(payload.warning).toBe('Medusa Store API not configured.')
    const [, args] = mutation.mock.calls[0]
    expect(args).not.toHaveProperty('backendUrl')
    expect(args).not.toHaveProperty('adminUrl')
    expect(args).not.toHaveProperty('storefrontUrl')
  })

  it('does not mark visual commerce ready when tenant provisioning is unavailable', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = {
      findRunning: vi.fn().mockRejectedValue(new Error('docker unavailable')),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      {
        mutation,
        query: vi.fn().mockResolvedValue({ sessionId: 'session_123' }),
        setAuth: vi.fn(),
      },
      {
        containerProvider,
        env: {},
        fetch: vi.fn(),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      code: 'COMMERCE_PROVISION_FAILED',
      error: 'Commerce provisioning failed.',
    })
    expect(containerProvider.findRunning).toHaveBeenCalledWith('session_123')
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('provisions visual commerce with a warning when Medusa returns a non-ok response', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        }),
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
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        }),
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

  it('automatically creates, links, validates, and persists a tenant publishable key', async () => {
    const resolvedSessionId = 'k577jbx9tbkcc3bhs1fvz7dq24x89n1k2'
    const mutation = vi.fn().mockResolvedValue({ sessionId: resolvedSessionId })
    const query = vi
      .fn()
      .mockResolvedValueOnce({ sessionId: resolvedSessionId })
      .mockResolvedValueOnce({ sessionId: resolvedSessionId })
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
        new Response(JSON.stringify({ sales_channel: { id: 'sc_session' } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_key: {
              id: 'apk_session',
              sales_channels: [],
              token: 'pk_auto_session',
              type: 'publishable',
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            api_key: {
              id: 'apk_session',
              sales_channels: [{ id: 'sc_session' }],
              token: 'pk_auto_session',
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ currency_code: 'usd' }] }), {
          status: 200,
        }),
      )
    const containerProvider = {
      findRunning: vi.fn().mockResolvedValue({
        adminUrl: 'https://admin.tenant.test',
        backendUrl: 'https://backend.tenant.test',
        storefrontUrl: 'https://store.tenant.test',
      }),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_alias',
      new Request(
        'http://ship-fast.test/api/sessions/session_alias/provision/medusa',
        {
          body: JSON.stringify({
            adminEmail: 'owner@store.test',
            adminPassword: 'user-created-password',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: {},
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: true,
      status: 'ready',
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.tenant.test/admin/api-keys',
      expect.objectContaining({
        body: JSON.stringify({
          title: `Ship Fast ${resolvedSessionId}`,
          type: 'publishable',
        }),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.tenant.test/admin/api-keys/apk_session/sales-channels',
      expect.objectContaining({
        body: JSON.stringify({ add: ['sc_session'] }),
        method: 'POST',
      }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.tenant.test/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_auto_session' },
      },
    )
    const [, args] = mutation.mock.calls[0]
    expect(JSON.parse(args.configJson)).toMatchObject({
      liveStoreApiReady: true,
      medusaTenant: {
        apiKeyId: 'apk_session',
        publishableKey: 'pk_auto_session',
        salesChannelId: 'sc_session',
      },
      provider: 'medusa',
      publishableKey: 'pk_auto_session',
      tenantId: resolvedSessionId,
      tenantMode: 'session',
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
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@store.test',
          MEDUSA_ADMIN_PASSWORD: 'secret-password',
          MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_ADMIN_URL: 'https://admin.medusa.test',
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_STOREFRONT_URL: 'https://store.medusa.test',
        }),
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

  it('points API-root Medusa storefront handoff links to the generated session storefront', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const query = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    async function medusaApiRootHandoffFetch(
      input: RequestInfo | URL,
    ): Promise<Response> {
      const url = String(input)
      if (url === 'http://localhost:9116/admin/shipping-profiles') {
        return Response.json({ shipping_profiles: [{ id: 'sp_default' }] })
      }
      if (url === 'http://localhost:9116/admin/sales-channels?limit=100') {
        return Response.json({
          sales_channels: [{ id: 'sc_session', name: 'Ship Fast session_123' }],
        })
      }
      if (url === 'http://localhost:9116/admin/api-keys?limit=100') {
        return Response.json({
          api_keys: [
            {
              id: 'apk_session',
              sales_channels: [{ id: 'sc_session' }],
              title: 'Ship Fast session_123',
              token: 'pk_session',
              type: 'publishable',
            },
          ],
        })
      }
      if (url === 'http://localhost:9116/store/regions') {
        return Response.json({ regions: [{ currency_code: 'usd' }] })
      }
      throw new Error(`Unexpected fetch ${url}`)
    }

    const fetchImpl = vi.fn(medusaApiRootHandoffFetch)
    const containerProvider = {
      findRunning: vi.fn().mockResolvedValue({
        adminUrl: 'http://localhost:9116/app',
        backendUrl: 'http://localhost:9116',
        storefrontUrl: 'http://localhost:9116',
      }),
      provision: vi.fn(),
    }

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        { method: 'POST' },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider,
        env: {
          MEDUSA_ADMIN_API_TOKEN: 'admin-token',
          MEDUSA_ADMIN_URL: 'http://localhost:9116/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9116',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(await response.json()).toMatchObject({
      handoff: {
        adminUrl: 'http://localhost:9116/app',
        backendUrl: 'http://localhost:9116',
        storefrontUrl: 'http://ship-fast.test/generate/session_123',
        tenantId: 'session_123',
      },
      liveStoreApiReady: true,
      status: 'ready',
    })
    const [, args] = mutation.mock.calls[0]
    expect(args).toMatchObject({
      adminUrl: 'http://localhost:9116/app',
      backendUrl: 'http://localhost:9116',
      sessionId: 'session_123',
      storefrontUrl: 'http://ship-fast.test/generate/session_123',
    })
  })

  it('syncs products to configured shared Medusa without provisioning a local container', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = mockContainerProvider({
      MEDUSA_ADMIN_URL: 'https://admin.container.test',
      MEDUSA_BACKEND_URL: 'https://backend.container.test',
      MEDUSA_STOREFRONT_URL: 'https://store.container.test',
    })
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
            anonymousOwnerSecret: 'owner_secret',
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'provided-admin-password',
          MEDUSA_ADMIN_URL: 'https://medusa.devliv.io/app',
          MEDUSA_BACKEND_URL: 'https://medusa.devliv.io',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://ship-fast.io',
        },
        containerProvider,
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: true,
      syncedProducts: 1,
    })
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://medusa.devliv.io/admin/products',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://medusa.devliv.io/store/regions',
      {
        headers: { 'x-publishable-api-key': 'pk_tenant_session' },
      },
    )
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        adminUrl: 'https://medusa.devliv.io/app',
        backendUrl: 'https://medusa.devliv.io',
        productCount: 1,
        sessionId: 'session_123',
        storefrontUrl: 'https://ship-fast.io',
      }),
    )
    const [, args] = mutation.mock.calls[0]
    expect(JSON.parse(args.configJson)).toMatchObject({
      publishableKey: 'pk_tenant_session',
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

  it('prefers configured Medusa admin credentials over stale request credentials', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = mockContainerProvider({
      MEDUSA_ADMIN_URL: 'https://admin.container.test',
      MEDUSA_BACKEND_URL: 'https://backend.container.test',
      MEDUSA_STOREFRONT_URL: 'https://store.container.test',
    })
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
              { id: 'sc_tenant', name: 'Ship Fast session_123' },
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
            adminEmail: 'stale-admin@test.com',
            adminPassword: 'stale-password',
            anonymousOwnerSecret: 'owner_secret',
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'provided-admin-password',
          MEDUSA_ADMIN_URL: 'https://medusa.devliv.io/app',
          MEDUSA_BACKEND_URL: 'https://medusa.devliv.io',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'https://ship-fast.io',
        },
        containerProvider,
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
      'https://medusa.devliv.io/auth/user/emailpass',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'provided-admin-password',
        }),
        method: 'POST',
      }),
    )
  })

  it('recovers generated products from the session view when the provision request sends none', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const query = vi
      .fn()
      .mockResolvedValueOnce({ sessionId: 'session_123' })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        latestPreview: {
          openUiSource: `
            home_gallery = EcommerceGallery(
              "Shop the Look",
              "Browse our latest modern furniture lineup",
              "Add to Cart",
              [
                {"name":"Walnut Lounge Chair","price":"$349","image":"https://cdn.example.com/walnut-chair.jpg"}
              ]
            )
          `,
        },
        siteSpec: null,
      })
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
              { id: 'sc_tenant', name: 'Ship Fast session_123' },
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
        new Response(JSON.stringify({ product: { id: 'prod_chair' } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ regions: [{ currency_code: 'usd', id: 'reg_1' }] }),
          { status: 200 },
        ),
      )

    const response = await createSessionMedusaProvisionResponse(
      'session_alias',
      new Request(
        'http://ship-fast.test/api/sessions/session_alias/provision/medusa',
        {
          body: JSON.stringify({
            adminEmail: 'admin@test.com',
            adminPassword: 'provided-admin-password',
            anonymousOwnerSecret: 'owner_secret',
          }),
          method: 'POST',
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        containerProvider: mockContainerProvider({
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        }),
        env: {
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
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
    const createCall = fetchImpl.mock.calls.find(
      ([url]) => url === 'http://localhost:9000/admin/products',
    )
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      images: [{ url: 'https://cdn.example.com/walnut-chair.jpg' }],
      sales_channels: [{ id: 'sc_tenant' }],
      title: 'Walnut Lounge Chair',
    })
    const [, args] = mutation.mock.calls[0]
    expect(JSON.parse(args.configJson)).toMatchObject({
      publishableKey: 'pk_tenant_session',
      productSync: {
        requested: 1,
        synced: 1,
      },
    })
  })

  it('preserves rich products from the session request through the Admin create body', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
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
              { id: 'sc_tenant', name: 'Ship Fast session_123' },
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ regions: [{ currency_code: 'usd', id: 'reg_1' }] }),
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
              {
                handle: 'linen-tee',
                images: [
                  { url: 'https://cdn.example.com/linen-front.jpg' },
                  { url: 'https://cdn.example.com/linen-back.jpg' },
                ],
                options: [{ title: 'Size', values: ['Small', 'Large'] }],
                sourceId: 'product_linen_tee',
                title: 'Linen Tee',
                variants: [
                  {
                    manageInventory: false,
                    optionValues: { Size: 'Small' },
                    prices: [{ amount: 29, currencyCode: 'USD' }],
                    sku: 'LINEN-S',
                    sourceId: 'variant_small',
                    title: 'Small',
                  },
                  {
                    manageInventory: false,
                    optionValues: { Size: 'Large' },
                    prices: [{ amount: 32, currencyCode: 'EUR' }],
                    sku: 'LINEN-L',
                    sourceId: 'variant_large',
                    title: 'Large',
                  },
                ],
              },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        containerProvider: mockContainerProvider({
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        }),
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'provided-admin-password',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    const createCall = fetchImpl.mock.calls.find(
      ([url]) => url === 'http://localhost:9000/admin/products',
    )
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      images: [
        { url: 'https://cdn.example.com/linen-front.jpg' },
        { url: 'https://cdn.example.com/linen-back.jpg' },
      ],
      metadata: {
        ship_fast_generated_source_id: 'product_linen_tee',
      },
      options: [{ title: 'Size', values: ['Small', 'Large'] }],
      variants: [
        {
          sku: 'SHIP-FAST-SESSION-123-LINEN-TEE-LINEN-S',
          title: 'Small',
        },
        {
          sku: 'SHIP-FAST-SESSION-123-LINEN-TEE-LINEN-L',
          title: 'Large',
        },
      ],
    })
  })

  it('returns 403 when an authorized provision cannot persist due to ownership denial', async () => {
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
      {
        mutation,
        query: vi.fn().mockResolvedValue({ sessionId: 'session_123' }),
        setAuth: vi.fn(),
      },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'provided-admin-password',
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        }),
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      code: 'FORBIDDEN',
      error: 'Commerce provisioning failed.',
    })
  })

  it('creates a tenant key before Store API is globally configured', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
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
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_EMAIL: 'admin@test.com',
          MEDUSA_ADMIN_PASSWORD: 'provided-admin-password',
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_ADMIN_URL: 'http://localhost:9000/app',
          MEDUSA_BACKEND_URL: 'http://localhost:9000',
          MEDUSA_STOREFRONT_URL: 'http://localhost:8001',
        }),
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
    const payload = await response.json()
    expect(payload).toMatchObject({
      liveStoreApiReady: true,
      syncedProducts: 1,
    })
    expect(payload).not.toHaveProperty('persisted')
  })

  it('uses configured admin token instead of user credentials for hosted Medusa product sync', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi
      .fn()
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
        new Response(JSON.stringify({ regions: [{ currency_code: 'usd' }] }), {
          status: 200,
        }),
      )

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request(
        'http://ship-fast.test/api/sessions/session_123/provision/medusa',
        {
          body: JSON.stringify({
            adminEmail: 'not-a-shared-admin@store.test',
            adminPassword: 'user-created-password',
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_ADMIN_API_TOKEN: 'configured-admin-token',
          MEDUSA_BACKEND_URL: 'https://medusa.devliv.io',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_BACKEND_URL: 'https://medusa.devliv.io',
        }),
        fetch: fetchImpl,
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(fetchImpl).not.toHaveBeenCalledWith(
      'https://medusa.devliv.io/auth/user/emailpass',
      expect.anything(),
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://medusa.devliv.io/admin/shipping-profiles',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer configured-admin-token',
        }),
      }),
    )
    expect(await response.json()).toMatchObject({
      liveStoreApiReady: true,
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
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        }),
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

  it('resolves preview lookup ids before provisioning and persisting commerce config', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ sessionId: 'session_123' })
      .mockResolvedValueOnce({ ok: true })
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const containerProvider = mockContainerProvider({
      MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
    })

    const response = await createSessionMedusaProvisionResponse(
      'preview_123',
      new Request(
        'http://ship-fast.test/api/sessions/preview_123/provision/medusa',
        {
          body: JSON.stringify({ anonymousOwnerSecret: 'owner_secret' }),
          method: 'POST',
        },
      ),
      { mutation, query, setAuth: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider,
        fetch: vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({ regions: [{ currency_code: 'usd' }] }),
            {
              status: 200,
            },
          ),
        ),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(200)
    expect(containerProvider.findRunning).not.toHaveBeenCalled()
    expect(containerProvider.provision).not.toHaveBeenCalled()
    expect(mutation.mock.calls[0]?.[1]).toMatchObject({
      anonymousOwnerSecret: 'owner_secret',
      backendUrl: 'https://backend.medusa.test',
      sessionId: 'session_123',
    })
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
      { mutation, query: vi.fn(), setAuth: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        containerProvider: mockContainerProvider({
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
        }),
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
    expect(body).toEqual({
      code: 'COMMERCE_PROVISION_FAILED',
      error: 'Commerce provisioning failed.',
    })
    expect(JSON.stringify(body)).not.toContain(realSessionId)
    expect(JSON.stringify(body)).not.toContain('owner_secret')
    expect(JSON.stringify(body)).not.toContain('Pineapple Saison')
  })
})
