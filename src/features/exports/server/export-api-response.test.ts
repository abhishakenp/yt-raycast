import { describe, expect, it, vi } from 'vitest'

import { createSessionExportResponse } from './export-api-response'

describe('createSessionExportResponse', () => {
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
      sessionId: 'session_123',
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
      sessionId: 'session_123',
      target: 'react',
      anonymousOwnerSecret: 'owner-secret',
    })
  })
})
