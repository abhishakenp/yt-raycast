import { describe, expect, it, vi } from 'vitest'

import { createSessionMedusaProvisionResponse } from './commerce-api-response'

describe('createSessionMedusaProvisionResponse', () => {
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
      warning: 'Medusa Store API is unavailable: fetch failed',
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
    expect(args.errorMessage).toBe(
      'Medusa Store API is unavailable: fetch failed',
    )
    expect(JSON.parse(args.configJson)).toMatchObject({
      provider: 'medusa',
      tenantId: 'session_123',
      tenantMode: 'session',
      liveStoreApiReady: false,
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
})
