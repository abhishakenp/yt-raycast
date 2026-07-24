import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createSessionCreateResponse,
  getClientIp,
  hashClientIp,
} from './session-create-response'

const realConvexCraftBeerSession = {
  isPrivate: false,
  preferredExportTarget: 'html',
  preferredLanguage: 'lt',
  prompt:
    'a craft beer brewery with taproom tours and seasonal releases in portland',
  workspace: 'workspace_1783a35ebbd03fe0460e5f33b489cf88',
} as const

describe('createSessionCreateResponse', () => {
  afterEach(() => {
    delete process.env.SHIP_FAST_IP_HASH_SALT
  })

  it('uses forwarded IP headers to call Convex with a hashed IP bucket', async () => {
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

  it('forwards real DB-shaped session creation fields without dropping language, export target, privacy, or workspace', async () => {
    process.env.SHIP_FAST_IP_HASH_SALT = 'test-salt'
    const mutation = vi.fn().mockResolvedValue({
      cached: true,
      remaining: 0,
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })
    const request = new Request('http://ship-fast.test/api/sessions/create', {
      body: JSON.stringify(realConvexCraftBeerSession),
      headers: {
        'cf-connecting-ip': '198.51.100.44',
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    const response = await createSessionCreateResponse(request, { mutation })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      cached: true,
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    })
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...realConvexCraftBeerSession,
        clientIpHash: hashClientIp('198.51.100.44', 'test-salt'),
      }),
    )
  })

  it.each([
    ['not-json', 'Request body must be valid JSON.'],
    [
      JSON.stringify(['not', 'an', 'object']),
      'Request body must be a JSON object.',
    ],
  ])('rejects invalid public preview request bodies', async (body, message) => {
    const mutation = vi.fn()

    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        body,
        method: 'POST',
      }),
      { mutation },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: message })
    expect(mutation).not.toHaveBeenCalled()
  })

  it('maps Convex quota failures to a public preview 429 response', async () => {
    const mutation = vi.fn().mockRejectedValue({
      data: {
        code: 'ANON_DAILY_LIMIT_REACHED',
        message:
          'Anonymous daily quota exhausted. Share on social media for +1 free generation.',
      },
    })
    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Build a public preview site' }),
      }),
      { mutation },
    )

    await expect(response.json()).resolves.toMatchObject({
      code: 'ANON_DAILY_LIMIT_REACHED',
      error:
        'Anonymous daily quota exhausted. Share on social media for +1 free generation.',
    })
    expect(response.status).toBe(429)
  })

  it('maps anon daily exhausted to a 429 with sign-in message', async () => {
    const mutation = vi.fn().mockRejectedValue({
      data: {
        code: 'ANON_DAILY_EXHAUSTED',
        message:
          'Anonymous daily quota exhausted. Sign in to get 2 more free generations.',
      },
    })
    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Build a public preview site' }),
      }),
      { mutation },
    )

    await expect(response.json()).resolves.toMatchObject({
      code: 'ANON_DAILY_EXHAUSTED',
      error:
        'Anonymous daily quota exhausted. Sign in to get 2 more free generations.',
    })
    expect(response.status).toBe(429)
  })

  it('maps Convex rate-limit failures to a distinct public preview 429 response', async () => {
    const mutation = vi.fn().mockRejectedValue({
      data: { code: 'RATE_LIMITED', message: 'Too many requests' },
    })
    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        body: JSON.stringify(realConvexCraftBeerSession),
      }),
      { mutation },
    )

    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({
      code: 'RATE_LIMITED',
      error:
        'Too many generation requests. Please wait a few minutes and try again.',
    })
  })

  it('returns a stable error when Convex reports success without a session id', async () => {
    const mutation = vi.fn().mockResolvedValue({
      prompt:
        'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
      remaining: 1,
    })

    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        body: JSON.stringify({
          prompt:
            'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
        }),
        method: 'POST',
      }),
      { mutation },
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Generation could not start. Try again.',
    })
  })

  it('forwards the Clerk bearer token to Convex via setAuth so signed-in users are not treated as anonymous', async () => {
    process.env.SHIP_FAST_IP_HASH_SALT = 'test-salt'
    const mutation = vi.fn().mockResolvedValue({
      cached: false,
      remaining: 1,
      sessionId: 'session_authed',
    })
    const setAuth = vi.fn()
    const request = new Request('http://ship-fast.test/api/sessions/create', {
      method: 'POST',
      headers: {
        authorization: 'Bearer clerk.convex.jwt.token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Build a public preview site for a design studio',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace_authed',
      }),
    })

    const response = await createSessionCreateResponse(request, {
      mutation,
      setAuth,
    })

    expect(response.status).toBe(200)
    expect(setAuth).toHaveBeenCalledWith('clerk.convex.jwt.token')
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        clientIpHash: hashClientIp('unknown', 'test-salt'),
        workspace: 'workspace_authed',
      }),
    )
  })

  it('does not call setAuth when no bearer token is present (anonymous flow)', async () => {
    const mutation = vi.fn().mockResolvedValue({
      cached: false,
      remaining: 1,
      sessionId: 'session_anon',
    })
    const setAuth = vi.fn()

    await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'Build a public preview site' }),
      }),
      { mutation, setAuth },
    )

    expect(setAuth).not.toHaveBeenCalled()
  })
})
