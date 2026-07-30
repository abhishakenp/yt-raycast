import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cloneMocks = vi.hoisted(() => ({
  client: {
    mutation: vi.fn(),
    setAuth: vi.fn(),
  },
  moderate: vi.fn(),
  runCloneJob: vi.fn(),
}))

vi.mock('@/features/clone/server/clone-orchestrator-response', () => ({
  runCloneJob: cloneMocks.runCloneJob,
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => cloneMocks.client,
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
      enforceUserInputModeration: cloneMocks.moderate,
    }
  },
)

import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import { ContentModerationError } from '@/features/moderation/server/enforce-user-input-moderation'
import { CONTENT_MODERATION_UNAVAILABLE_MESSAGE } from '@/features/moderation/server/moderation-classifier'
import { Route } from './clone'
import { callRouteHandler } from './-route-handler.test-helper'

const sessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

function postClone(body: unknown, headers?: HeadersInit) {
  const request = new Request('https://ship-fast.ai/api/clone', {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
    method: 'POST',
  })
  return callRouteHandler(Route, 'POST', { request })
}

beforeEach(() => {
  vi.clearAllMocks()
  cloneMocks.moderate.mockResolvedValue(undefined)
  cloneMocks.runCloneJob.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('/api/clone security boundaries', () => {
  const privateTargets = [
    'http://127.0.0.1:3000/admin',
    'http://localhost:3000/internal',
    'http://[::1]/private',
    'http://10.0.0.8/database',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials',
  ]

  for (const seedUrl of privateTargets) {
    it(`rejects non-public clone target ${seedUrl}`, async () => {
      const response = await postClone({
        anonymousOwnerSecret: 'owner-secret',
        brief: 'clone a public product page',
        seedUrl,
        sessionId,
      })

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'seedUrl must resolve to a public http(s) address.',
      })
      expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
    })
  }

  it('rejects clone jobs without authenticated or anonymous ownership', async () => {
    const response = await postClone({
      brief: 'clone a public product page',
      seedUrl: 'https://example.com/product',
      sessionId,
    })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Session ownership is required.',
    })
    expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
  })

  it('rejects malformed Convex session ids before starting background work', async () => {
    const response = await postClone({
      anonymousOwnerSecret: 'owner-secret',
      brief: 'clone a public product page',
      seedUrl: 'https://example.com/product',
      sessionId: 'not-a-convex-session-id',
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'sessionId must be a valid session id.',
    })
    expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
  })

  it('rejects oversized clone briefs before scheduling browser work', async () => {
    const response = await postClone({
      anonymousOwnerSecret: 'owner-secret',
      brief: 'x'.repeat(1_000_000),
      seedUrl: 'https://example.com/product',
      sessionId,
    })

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      error: 'Clone request is too large.',
    })
    expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
  })

  it('accepts a public clone target owned by an anonymous session secret', async () => {
    cloneMocks.runCloneJob.mockResolvedValue(undefined)
    const response = await postClone({
      anonymousOwnerSecret: 'owner-secret',
      brief: 'clone a public product page',
      seedUrl: 'https://example.com/product',
      sessionId,
    })

    expect(response.status).toBe(202)
    expect(cloneMocks.moderate).toHaveBeenCalledWith({
      anonymousClientId: 'owner-secret',
      bearerToken: undefined,
      fields: { cloneBrief: 'clone a public product page' },
      sessionId,
      surface: 'clone_brief',
    })
    expect(cloneMocks.runCloneJob).toHaveBeenCalledWith({
      anonymousOwnerSecret: 'owner-secret',
      bearer: undefined,
      brief: 'clone a public product page',
      seedUrl: 'https://example.com/product',
      sessionId,
    })
  })

  it('blocks harmful clone briefs before starting background work', async () => {
    cloneMocks.moderate.mockRejectedValueOnce(
      new ContentModerationError(
        'CONTENT_POLICY',
        CONTENT_POLICY_CLIENT_MESSAGE,
        422,
      ),
    )

    const response = await postClone({
      anonymousOwnerSecret: 'owner-secret',
      brief: 'clone a pornography storefront',
      seedUrl: 'https://example.com/product',
      sessionId,
    })

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_POLICY',
      error: CONTENT_POLICY_CLIENT_MESSAGE,
    })
    expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
  })

  it('fails closed when clone brief moderation is unavailable', async () => {
    cloneMocks.moderate.mockRejectedValueOnce(
      new ContentModerationError(
        'CONTENT_MODERATION_UNAVAILABLE',
        CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
        503,
      ),
    )

    const response = await postClone({
      anonymousOwnerSecret: 'owner-secret',
      brief: 'clone a public product page',
      seedUrl: 'https://example.com/product',
      sessionId,
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      error: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
    })
    expect(cloneMocks.runCloneJob).not.toHaveBeenCalled()
  })
})
