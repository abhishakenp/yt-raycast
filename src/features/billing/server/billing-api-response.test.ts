import { describe, expect, it, vi } from 'vitest'

import { createBillingApiResponse } from './billing-api-response'

describe('createBillingApiResponse', () => {
  it('returns 401 without a bearer token', async () => {
    const client = {
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createBillingApiResponse(
      new Request('https://ship-fast.test/api/credits'),
      'credits',
      client,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: 'Sign in to view billing details.',
    })
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.query).not.toHaveBeenCalled()
  })

  it('forwards the bearer token to Convex and returns billing JSON', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({ remaining: 3 }),
      setAuth: vi.fn(),
    }

    const response = await createBillingApiResponse(
      new Request('https://ship-fast.test/api/credits', {
        headers: { authorization: 'Bearer token_123' },
      }),
      'credits',
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {})
    expect(await response.json()).toEqual({ remaining: 3 })
  })

  it('returns a stable billing error without leaking Convex details', async () => {
    const client = {
      query: vi
        .fn()
        .mockRejectedValue(
          new Error('ConvexError: internal billing index missing for user_123'),
        ),
      setAuth: vi.fn(),
    }

    const response = await createBillingApiResponse(
      new Request('https://ship-fast.test/api/billing-overview', {
        headers: { authorization: 'Bearer token_123' },
      }),
      'billing-overview',
      client,
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Unable to load billing details.',
    })
  })
})
