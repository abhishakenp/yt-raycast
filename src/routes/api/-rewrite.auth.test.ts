import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.hoisted(() => vi.fn(async () => 'rewritten'))
const convexQueryMock = vi.hoisted(() => vi.fn())

vi.mock('@ship-fast/engine', () => ({ generateText: generateTextMock }))
vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'test-model',
}))
vi.mock('@/features/moderation/server/enforce-user-input-moderation', () => ({
  enforceUserInputModeration: vi.fn(async () => undefined),
  moderationErrorResponse: vi.fn(() => null),
}))
vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    setAuth: vi.fn(),
    query: convexQueryMock,
    mutation: vi.fn(),
  }),
}))

import { Route } from './rewrite'
import { callRouteHandler } from './-route-handler.test-helper'
import { rewriteHits } from '@/lib/rate-limit'

const postRewrite = (headers?: HeadersInit) =>
  callRouteHandler(Route, 'POST', {
    request: new Request('https://ship-fast.ai/api/rewrite', {
      body: JSON.stringify({ text: 'Make this punchier', instruction: 'edit' }),
      headers: { 'Content-Type': 'application/json', ...headers },
      method: 'POST',
    }),
  })

describe('/api/rewrite authentication', () => {
  beforeEach(() => {
    rewriteHits.clear()
    convexQueryMock.mockReset()
    generateTextMock.mockClear()
    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects a request with no Authorization header', async () => {
    const response = await postRewrite()

    expect(response.status).toBe(401)
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects a syntactically valid but unverifiable bearer token', async () => {
    // The old check was `/^Bearer\s+.+$/` — literally `Bearer x` passed and
    // reached the model. Convex must actually accept the token.
    convexQueryMock.mockRejectedValue(new Error('Unauthenticated'))

    const response = await postRewrite({ Authorization: 'Bearer x' })

    expect(response.status).toBe(401)
    expect(convexQueryMock).toHaveBeenCalledTimes(1)
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('accepts a token Convex verifies', async () => {
    convexQueryMock.mockResolvedValue({ active: true })

    const response = await postRewrite({ Authorization: 'Bearer real-token' })

    expect(response.status).toBe(200)
    expect(generateTextMock).toHaveBeenCalledTimes(1)
  })

  it('rate limits before spending a Convex round-trip', async () => {
    convexQueryMock.mockRejectedValue(new Error('Unauthenticated'))

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await postRewrite({ Authorization: 'Bearer x' })
    }
    const limited = await postRewrite({ Authorization: 'Bearer x' })

    expect(limited.status).toBe(429)
    // The 11th request never reached Convex.
    expect(convexQueryMock).toHaveBeenCalledTimes(10)
  })
})
