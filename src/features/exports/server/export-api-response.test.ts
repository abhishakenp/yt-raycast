import { describe, expect, it, vi } from 'vitest'

import { createSessionExportResponse } from './export-api-response'

describe('createSessionExportResponse', () => {
  const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

  it('forwards bearer auth before creating an export', async () => {
    const client = {
      mutation: vi.fn().mockResolvedValue({
        status: 'ready',
        target: 'html',
      }),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createSessionExportResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/export', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token_123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ target: 'html' }),
      }),
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: undefined,
    })
    expect(await response.json()).toMatchObject({
      status: 'ready',
      downloadUrl: '/api/sessions/session_123/download/html',
    })
  })

  it('forwards anonymous owner secrets for anonymous exports', async () => {
    const client = {
      mutation: vi.fn().mockResolvedValue({
        status: 'payment_required',
        target: 'react',
      }),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    await createSessionExportResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          target: 'react',
          anonymousOwnerSecret: 'owner-secret',
        }),
      }),
      client,
    )

    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'react',
      anonymousOwnerSecret: 'owner-secret',
    })
  })

  it('rejects malformed export JSON without calling Convex', async () => {
    const client = {
      mutation: vi.fn(),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createSessionExportResponse(
      realSessionId,
      new Request(
        `https://ship-fast.test/api/sessions/${realSessionId}/export`,
        {
          body: '{',
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      ),
      client,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid export request.',
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('returns a stable export creation error when Convex rejects the request', async () => {
    const client = {
      mutation: vi.fn(async () => {
        throw new Error(
          `Convex export failed for ${realSessionId} owner_secret Pineapple Saison`,
        )
      }),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createSessionExportResponse(
      realSessionId,
      new Request(
        `https://ship-fast.test/api/sessions/${realSessionId}/export`,
        {
          body: JSON.stringify({
            target: 'lakebed',
            anonymousOwnerSecret: 'owner_secret',
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      ),
      client,
    )

    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toEqual({ error: 'Export request failed.' })
    expect(JSON.stringify(body)).not.toContain(realSessionId)
    expect(JSON.stringify(body)).not.toContain('owner_secret')
    expect(JSON.stringify(body)).not.toContain('Pineapple Saison')
  })
})
