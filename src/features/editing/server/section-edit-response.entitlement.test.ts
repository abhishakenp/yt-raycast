import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock(
  '@/features/moderation/server/enforce-user-input-moderation',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/moderation/server/enforce-user-input-moderation')
      >()
    return {
      ...actual,
      enforceUserInputModeration: vi.fn(async () => undefined),
    }
  },
)

import { createSectionEditResponse } from './section-edit-response'

const SESSION_ID = 'k574ms14ma9f94keq30r7dq24x89n1k2'

function sectionEditRequest(
  body: Record<string, unknown> = {},
  init: { bearer?: string } = {},
): Request {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (init.bearer) headers.authorization = `Bearer ${init.bearer}`
  return new Request(
    `https://ship-fast.test/api/sessions/${SESSION_ID}/section-edit`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        instruction: 'make the hero punchier',
        selection: {
          elementPath: 'main h1',
          tag: 'h1',
          textContent: 'Hero',
          outerHTML: '<h1>Hero</h1>',
          boundingBox: { x: 0, y: 0, width: 200, height: 80 },
        },
        ...body,
      }),
    },
  )
}

function mockClient() {
  return {
    query: vi.fn(async () => ({
      homeModule: { source: '<html><body><h1>Hero</h1></body></html>' },
      latestPreview: {
        html: '<html><body><h1>Hero</h1></body></html>',
        version: 1,
      },
    })),
    mutation: vi.fn(async () => ({
      saved: true,
      previewVersion: 2,
      sessionId: SESSION_ID,
    })),
  }
}

describe('createSectionEditResponse Pro + same-user entitlement gate', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    // Clerk enabled => entitlement gate is active.
    delete process.env.VITE_DISABLE_CLERK
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it('rejects a section edit with no Bearer token (401)', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run when unauthenticated')
    })
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest(),
      {
        client: mockClient(),
        generate: model,
        generateWithTools: vi.fn(async () => ({})),
        entitlementClient: entitlement,
      },
    )

    expect(response.status).toBe(401)
    expect(entitlement).not.toHaveBeenCalled()
    expect(model).not.toHaveBeenCalled()
  })

  it('returns 403 when the caller is signed in but not the session owner', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run for a non-owner')
    })
    const entitlement = vi.fn(async () => ({
      allowed: false,
      code: 'forbidden' as const,
      message: 'You do not own this session',
    }))
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest({}, { bearer: 'tok' }),
      {
        client: mockClient(),
        generate: model,
        generateWithTools: vi.fn(async () => ({})),
        entitlementClient: entitlement,
      },
    )

    expect(response.status).toBe(403)
    expect(entitlement).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      anonymousOwnerSecret: undefined,
      bearerToken: 'tok',
    })
    expect(model).not.toHaveBeenCalled()
  })

  it('returns 402 when the caller owns the session but is not Pro', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run for a non-Pro owner')
    })
    const entitlement = vi.fn(async () => ({
      allowed: false,
      code: 'payment_required' as const,
      message: 'Subscribe to Pro to use AI inline edits.',
    }))
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest(
        { anonymousOwnerSecret: 'owner-secret' },
        { bearer: 'tok' },
      ),
      {
        client: mockClient(),
        generate: model,
        generateWithTools: vi.fn(async () => ({})),
        entitlementClient: entitlement,
      },
    )

    expect(response.status).toBe(402)
    expect(entitlement).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      anonymousOwnerSecret: 'owner-secret',
      bearerToken: 'tok',
    })
    expect(model).not.toHaveBeenCalled()
  })

  it('proceeds to the LLM when the caller is a Pro owner', async () => {
    const generateWithTools = vi.fn(async () => ({}))
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest({}, { bearer: 'tok' }),
      {
        client: mockClient(),
        generate: vi.fn(async () => '<h1>ok</h1>'),
        generateWithTools,
        entitlementClient: entitlement,
      },
    )

    expect(entitlement).toHaveBeenCalled()
    // The response should not be an entitlement rejection (401/402/403).
    expect(response.status).not.toBe(401)
    expect(response.status).not.toBe(402)
    expect(response.status).not.toBe(403)
  })

  it('fails closed (401) when the entitlement client throws', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run when entitlement is unverifiable')
    })
    const entitlement = vi.fn(async () => {
      throw new Error('convex unreachable')
    })
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest({}, { bearer: 'tok' }),
      {
        client: mockClient(),
        generate: model,
        generateWithTools: vi.fn(async () => ({})),
        entitlementClient: entitlement,
      },
    )

    expect(response.status).toBe(401)
    expect(model).not.toHaveBeenCalled()
  })

  it('bypasses the entitlement gate when Clerk is disabled', async () => {
    process.env.VITE_DISABLE_CLERK = 'true'
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createSectionEditResponse(
      SESSION_ID,
      sectionEditRequest(),
      {
        client: mockClient(),
        generate: vi.fn(async () => '<h1>ok</h1>'),
        generateWithTools: vi.fn(async () => ({})),
        entitlementClient: entitlement,
      },
    )

    expect(entitlement).not.toHaveBeenCalled()
    expect(response.status).not.toBe(401)
    expect(response.status).not.toBe(402)
    expect(response.status).not.toBe(403)
  })
})
