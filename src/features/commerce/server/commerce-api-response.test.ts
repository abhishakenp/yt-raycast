import { describe, expect, it, vi } from 'vitest'

import { createSessionMedusaProvisionResponse } from './commerce-api-response'

describe('createSessionMedusaProvisionResponse', () => {
  it('provisions commerce from server Medusa settings without URL input', async () => {
    const mutation = vi.fn().mockResolvedValue({ sessionId: 'session_123' })
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), { status: 200 }))

    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request('http://ship-fast.test/api/sessions/session_123/provision/medusa', {
        method: 'POST',
        headers: { 'x-ship-fast-owner-secret': 'owner_secret' },
      }),
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
    expect(fetchImpl).toHaveBeenCalledWith('https://backend.medusa.test/store/regions', {
      headers: { 'x-publishable-api-key': 'pk_medusa' },
    })
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

  it('does not store ready config when Medusa is not configured', async () => {
    const mutation = vi.fn()
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request('http://ship-fast.test/api/sessions/session_123/provision/medusa', { method: 'POST' }),
      { mutation, query: vi.fn() },
      { env: { MEDUSA_BACKEND_URL: 'https://backend.medusa.test' }, fetch: vi.fn(), metaEnv: {} },
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: 'Medusa Store API not configured.' })
    expect(mutation).not.toHaveBeenCalled()
  })

  it('does not store ready config when Medusa is unreachable', async () => {
    const mutation = vi.fn()
    const response = await createSessionMedusaProvisionResponse(
      'session_123',
      new Request('http://ship-fast.test/api/sessions/session_123/provision/medusa', { method: 'POST' }),
      { mutation, query: vi.fn() },
      {
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.medusa.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_medusa',
        },
        fetch: vi.fn().mockRejectedValue(new Error('connection refused')),
        metaEnv: {},
      },
    )

    expect(response.status).toBe(502)
    expect(await response.json()).toMatchObject({
      error: 'Medusa Store API is unavailable: connection refused',
    })
    expect(mutation).not.toHaveBeenCalled()
  })
})
