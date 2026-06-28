import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createSessionCreateResponse,
  getClientIp,
  hashClientIp,
} from './session-create-response'

describe('createSessionCreateResponse', () => {
  afterEach(() => {
    delete process.env.SHIP_FAST_PUBLIC_PREVIEW_MODE
    delete process.env.SHIP_FAST_IP_HASH_SALT
  })

  it('stays disabled unless public preview mode is enabled', async () => {
    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Build a public preview site' }),
      }),
    )

    await expect(response.json()).resolves.toMatchObject({
      error: 'Public preview session creation is disabled.',
    })
    expect(response.status).toBe(404)
  })

  it('uses forwarded IP headers to call Convex with a hashed IP bucket', async () => {
    process.env.SHIP_FAST_PUBLIC_PREVIEW_MODE = 'true'
    process.env.SHIP_FAST_IP_HASH_SALT = 'test-salt'
    const mutation = vi.fn().mockResolvedValue({
      cached: false,
      remaining: 1,
      sessionId: 'session_preview',
    })
    const request = new Request('http://ship-fast.test/api/sessions/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.15, 10.0.0.1',
      },
      body: JSON.stringify({
        prompt: 'Build a public preview site for a design studio',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace_public',
      }),
    })

    const response = await createSessionCreateResponse(request, { mutation })

    await expect(response.json()).resolves.toMatchObject({
      sessionId: 'session_preview',
      cached: false,
    })
    expect(response.status).toBe(200)
    expect(getClientIp(request)).toBe('203.0.113.15')
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        clientIpHash: hashClientIp('203.0.113.15', 'test-salt'),
        prompt: 'Build a public preview site for a design studio',
      }),
    )
  })

  it('maps Convex quota failures to a public preview 429 response', async () => {
    process.env.SHIP_FAST_PUBLIC_PREVIEW_MODE = 'true'
    const mutation = vi
      .fn()
      .mockRejectedValue(new Error('ConvexError: QUOTA_EXCEEDED'))
    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Build a public preview site' }),
      }),
      { mutation },
    )

    await expect(response.json()).resolves.toMatchObject({
      code: 'QUOTA_EXCEEDED',
      error:
        'Free preview quota exhausted for this IP address. Try again tomorrow.',
    })
    expect(response.status).toBe(429)
  })
})
