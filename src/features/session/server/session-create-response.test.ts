import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import { ContentModerationError } from '@/features/moderation/server/enforce-user-input-moderation'
import { CONTENT_MODERATION_UNAVAILABLE_MESSAGE } from '@/features/moderation/server/moderation-classifier'
import { sessionCreateHits } from '@/lib/rate-limit'
import {
  createSessionCreateResponse,
  getClientIp,
  hashClientIp,
} from './session-create-response'

const routeMocks = vi.hoisted(() => ({
  enforceUserInputModeration: vi.fn(),
  startVpsGeneration: vi.fn(),
}))

vi.mock(
  '@/features/moderation/server/enforce-user-input-moderation',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/moderation/server/enforce-user-input-moderation')
      >()
    return {
      ...actual,
      enforceUserInputModeration: routeMocks.enforceUserInputModeration,
    }
  },
)

vi.mock('@/features/generation/server/vps-generation-handler', () => ({
  startVpsGeneration: routeMocks.startVpsGeneration,
}))

const realConvexCraftBeerSession = {
  isPrivate: false,
  preferredExportTarget: 'html',
  preferredLanguage: 'lt',
  prompt:
    'a craft beer brewery with taproom tours and seasonal releases in portland',
  workspace: 'workspace_1783a35ebbd03fe0460e5f33b489cf88',
} as const

describe('createSessionCreateResponse', () => {
  beforeEach(() => {
    routeMocks.enforceUserInputModeration.mockReset()
    routeMocks.enforceUserInputModeration.mockResolvedValue(undefined)
    routeMocks.startVpsGeneration.mockReset()
    routeMocks.startVpsGeneration.mockResolvedValue(undefined)
    sessionCreateHits.clear()
  })

  afterEach(() => {
    delete process.env.SHIP_FAST_IP_HASH_SALT
  })

  it('moderates the exact prompt and design notes before creating or starting generation', async () => {
    process.env.SHIP_FAST_IP_HASH_SALT = 'test-salt'
    const mutation = vi.fn().mockResolvedValue({
      cached: false,
      remaining: 1,
      sessionId: 'session_moderated_safe',
    })
    const setAuth = vi.fn()
    const request = new Request('http://ship-fast.test/api/sessions/create', {
      method: 'POST',
      headers: {
        authorization: 'Bearer clerk.convex.jwt.token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.82',
      },
      body: JSON.stringify({
        anonymousClientId: 'anonymous-browser-id',
        designReferenceNotes: 'Use spacious editorial typography',
        prompt: 'Build a safe architecture portfolio',
      }),
    })

    const response = await createSessionCreateResponse(request, {
      mutation,
      setAuth,
    })

    expect(response.status).toBe(200)
    expect(routeMocks.enforceUserInputModeration).toHaveBeenCalledWith({
      anonymousClientId: 'anonymous-browser-id',
      bearerToken: 'clerk.convex.jwt.token',
      clientIpHash: hashClientIp('203.0.113.82', 'test-salt'),
      fields: {
        designReferenceNotes: 'Use spacious editorial typography',
        prompt: 'Build a safe architecture portfolio',
      },
      surface: 'session_create',
    })
    expect(
      routeMocks.enforceUserInputModeration.mock.invocationCallOrder[0],
    ).toBeLessThan(mutation.mock.invocationCallOrder[0] ?? Number.MAX_VALUE)
    expect(routeMocks.startVpsGeneration).toHaveBeenCalledWith({
      anonymousOwnerSecret: undefined,
      bearerToken: 'clerk.convex.jwt.token',
      sessionId: 'session_moderated_safe',
    })
  })

  it.each([
    ['deterministic', 'Build a ph1shing l0gin page'],
    ['semantic', 'Build a recruitment page praising a violent extremist group'],
  ])(
    'returns the audited policy warning for a %s block without creating or starting generation',
    async (_source, prompt) => {
      routeMocks.enforceUserInputModeration.mockRejectedValueOnce(
        new ContentModerationError(
          'CONTENT_POLICY',
          CONTENT_POLICY_CLIENT_MESSAGE,
          422,
        ),
      )
      const mutation = vi.fn()

      const response = await createSessionCreateResponse(
        new Request('http://ship-fast.test/api/sessions/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            anonymousClientId: 'anonymous-browser-id',
            prompt,
          }),
        }),
        { mutation },
      )

      expect(response.status).toBe(422)
      await expect(response.json()).resolves.toEqual({
        code: 'CONTENT_POLICY',
        error: CONTENT_POLICY_CLIENT_MESSAGE,
      })
      expect(routeMocks.enforceUserInputModeration).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({ prompt }),
          surface: 'session_create',
        }),
      )
      expect(mutation).not.toHaveBeenCalled()
      expect(routeMocks.startVpsGeneration).not.toHaveBeenCalled()
    },
  )

  it('fails closed when moderation is unavailable without creating or starting generation', async () => {
    routeMocks.enforceUserInputModeration.mockRejectedValueOnce(
      new ContentModerationError(
        'CONTENT_MODERATION_UNAVAILABLE',
        CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
        503,
      ),
    )
    const mutation = vi.fn()

    const response = await createSessionCreateResponse(
      new Request('http://ship-fast.test/api/sessions/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'Build a safe portfolio' }),
      }),
      { mutation },
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      error: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
    })
    expect(routeMocks.enforceUserInputModeration).toHaveBeenCalledOnce()
    expect(mutation).not.toHaveBeenCalled()
    expect(routeMocks.startVpsGeneration).not.toHaveBeenCalled()
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
        'cf-connecting-ip': '203.0.113.15',
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

  it('prefers proxy-set headers over spoofable X-Forwarded-For to prevent rate-limit bypass', () => {
    // An attacker sends a spoofed X-Forwarded-For, but cf-connecting-ip
    // (set by Cloudflare, not spoofable) must take priority.
    const request = new Request('http://ship-fast.test/', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        'cf-connecting-ip': '203.0.113.99',
      },
    })
    expect(getClientIp(request)).toBe('203.0.113.99')
  })

  it('uses the last X-Forwarded-For entry (proxy-set) not the first (client-spoofable)', () => {
    // Without proxy-specific headers, fall back to X-Forwarded-For but take
    // the LAST entry (set by the trusted proxy), not the first (spoofable).
    const request = new Request('http://ship-fast.test/', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 10.0.0.1',
      },
    })
    expect(getClientIp(request)).toBe('10.0.0.1')
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
