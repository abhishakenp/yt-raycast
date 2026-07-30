import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.hoisted(() => vi.fn())
const enforceUserInputModerationMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

vi.mock('@ship-fast/engine', () => ({
  generateText: generateTextMock,
}))

vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'test-model',
}))

vi.mock(
  '@/features/moderation/server/enforce-user-input-moderation',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('@/features/moderation/server/enforce-user-input-moderation')
    >()),
    enforceUserInputModeration: enforceUserInputModerationMock,
  }),
)

import { ContentModerationError } from '@/features/moderation/server/enforce-user-input-moderation'

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<
        string,
        (args: { request: Request }) => Promise<Response>
      >
    }
  }
}

async function importRoute(): Promise<RouteWithHandlers> {
  const { Route } = await import('./rewrite')
  return Route as unknown as RouteWithHandlers
}

describe('rewrite API route', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  // These tests exercise route behavior (JSON parsing, validation, engine
  // loading, error handling) — not auth. Bypass Clerk so requests succeed
  // without Authorization headers. The security-resilience test file covers
  // the authenticated path with VITE_DISABLE_CLERK='false'.
  beforeEach(() => {
    process.env.VITE_DISABLE_CLERK = 'true'
    enforceUserInputModerationMock.mockReset()
    enforceUserInputModerationMock.mockResolvedValue(undefined)
  })

  const realConvexText = 'Pineapple Saison'
  const realConvexInstruction =
    'make this fit a craft beer brewery with taproom tours'

  it('registers a POST handler at /api/rewrite', async () => {
    const Route = await importRoute()
    expect(Route.path).toBe('/api/rewrite')
    expect(typeof Route.options.server.handlers.POST).toBe('function')
  })

  it('does not eagerly load the engine at module import time', async () => {
    generateTextMock.mockClear()
    await importRoute()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON with a 400', async () => {
    const Route = await importRoute()
    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: 'not-json',
      }),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON' })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects missing text/instruction with a 422 without loading the engine', async () => {
    const Route = await importRoute()
    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: 'hi' }),
      }),
    })
    expect(res.status).toBe(422)
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('lazily imports the engine only on a valid request and returns rewritten text', async () => {
    generateTextMock.mockResolvedValue('  "rewritten"  ')
    const Route = await importRoute()

    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: 'original', instruction: 'shorten' }),
      }),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ rewritten: 'rewritten' })
    expect(generateTextMock).toHaveBeenCalledWith(
      'test-model',
      expect.any(String),
      expect.any(String),
      expect.any(AbortSignal),
      2,
    )
    expect(enforceUserInputModerationMock).toHaveBeenCalledWith({
      bearerToken: null,
      fields: {
        rewriteInstruction: 'shorten',
        rewriteText: 'original',
      },
      surface: 'rewrite_instruction',
    })
  })

  it.each(['deterministic', 'semantic'])(
    'blocks %s moderation decisions before loading the rewrite engine',
    async () => {
      enforceUserInputModerationMock.mockRejectedValue(
        new ContentModerationError(
          'CONTENT_POLICY',
          '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.',
          422,
        ),
      )
      const Route = await importRoute()

      const response = await Route.options.server.handlers.POST({
        request: new Request('https://ship-fast.test/api/rewrite', {
          method: 'POST',
          body: JSON.stringify({
            text: 'Harmful source text',
            instruction: 'Make this hateful',
          }),
        }),
      })

      expect(response.status).toBe(422)
      await expect(response.json()).resolves.toEqual({
        code: 'CONTENT_POLICY',
        error:
          '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.',
      })
      expect(generateTextMock).not.toHaveBeenCalled()
    },
  )

  it('returns moderation unavailable before loading the rewrite engine', async () => {
    enforceUserInputModerationMock.mockRejectedValue(
      new ContentModerationError(
        'CONTENT_MODERATION_UNAVAILABLE',
        'Ship Fast’s safety check is temporarily unavailable. Try again shortly.',
        503,
      ),
    )
    const Route = await importRoute()

    const response = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: 'original', instruction: 'shorten' }),
      }),
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      error:
        'Ship Fast’s safety check is temporarily unavailable. Try again shortly.',
    })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('returns a stable public JSON error when the rewrite model fails', async () => {
    generateTextMock.mockRejectedValue(
      new Error(
        'model transport failed for k574ms14ma9f94keq30r7dq24x89n1k2 while rewriting Pineapple Saison',
      ),
    )
    const Route = await importRoute()

    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          text: realConvexText,
          instruction: realConvexInstruction,
        }),
      }),
    })
    const body = await res.json()

    expect(body).toEqual({ error: 'Rewrite failed.' })
    expect(JSON.stringify(body)).not.toContain(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
    expect(JSON.stringify(body)).not.toContain(realConvexText)
    expect(res.status).toBe(502)
    expect(generateTextMock).toHaveBeenCalledTimes(1)
  })
})
