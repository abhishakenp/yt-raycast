import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/ai-code-mode', () => ({
  createCodeMode: vi.fn(() => ({
    systemPrompt: '',
    tool: { name: 'execute_typescript' },
  })),
}))

vi.mock('@tanstack/ai-isolate-node', () => ({
  createNodeIsolateDriver: vi.fn(() => ({})),
}))

import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'
import { ContentModerationError } from '@/features/moderation/server/enforce-user-input-moderation'
import { CONTENT_MODERATION_UNAVAILABLE_MESSAGE } from '@/features/moderation/server/moderation-classifier'
import { createSectionEditResponse } from './section-edit-response'

const SESSION_ID = 'k574ms14ma9f94keq30r7dq24x89n1k2'
const originalClerk = process.env.VITE_DISABLE_CLERK

const createRequest = (
  instruction: string,
  options: { anonymousOwnerSecret?: string; bearer?: string } = {},
) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (options.bearer) headers.authorization = `Bearer ${options.bearer}`
  return new Request(
    `https://ship-fast.test/api/sessions/${SESSION_ID}/section-edit`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        anonymousOwnerSecret: options.anonymousOwnerSecret,
        instruction,
        selection: {
          boundingBox: { height: 80, width: 200, x: 0, y: 0 },
          elementPath: 'main h1',
          outerHTML: '<h1>Hero</h1>',
          tag: 'h1',
          textContent: 'Hero',
        },
      }),
    },
  )
}

const createClient = () => ({
  mutation: vi.fn(async () => ({
    previewVersion: 2,
    saved: true,
    sessionId: SESSION_ID,
  })),
  query: vi.fn(async () => ({
    homeModule: {
      source: '<!doctype html><html><body><h1>Hero</h1></body></html>',
    },
    latestPreview: { version: 1 },
  })),
})

beforeEach(() => {
  delete process.env.VITE_DISABLE_CLERK
})

afterEach(() => {
  process.env.VITE_DISABLE_CLERK = originalClerk
})

describe('createSectionEditResponse moderation boundary', () => {
  it('returns the policy warning without generating or mutating', async () => {
    const client = createClient()
    const generate = vi.fn(async () => {
      throw new Error('generation must not run')
    })
    const generateWithTools = vi.fn(async () => {
      throw new Error('tool generation must not run')
    })
    const moderate = vi.fn(async () => {
      throw new ContentModerationError(
        'CONTENT_POLICY',
        CONTENT_POLICY_CLIENT_MESSAGE,
        422,
      )
    })
    const entitlementClient = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))

    const response = await createSectionEditResponse(
      SESSION_ID,
      createRequest('  turn this into a pornography landing page  ', {
        anonymousOwnerSecret: 'owner-secret',
        bearer: 'token',
      }),
      {
        client,
        entitlementClient,
        generate,
        generateWithTools,
        moderate,
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_POLICY',
      error: CONTENT_POLICY_CLIENT_MESSAGE,
    })
    expect(moderate).toHaveBeenCalledWith({
      anonymousClientId: 'owner-secret',
      bearerToken: 'token',
      fields: {
        sectionEdit: '  turn this into a pornography landing page  ',
      },
      sessionId: SESSION_ID,
      surface: 'section_edit',
    })
    expect(generate).not.toHaveBeenCalled()
    expect(generateWithTools).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('fails closed without generating when moderation is unavailable', async () => {
    const client = createClient()
    const generate = vi.fn(async () => {
      throw new Error('generation must not run')
    })
    const generateWithTools = vi.fn(async () => {
      throw new Error('tool generation must not run')
    })
    const moderate = vi.fn(async () => {
      throw new ContentModerationError(
        'CONTENT_MODERATION_UNAVAILABLE',
        CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
        503,
      )
    })

    const response = await createSectionEditResponse(
      SESSION_ID,
      createRequest('make the hero punchier', { bearer: 'token' }),
      {
        client,
        entitlementClient: vi.fn(async () => ({
          allowed: true,
          code: 'ok' as const,
        })),
        generate,
        generateWithTools,
        moderate,
      },
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      error: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
    })
    expect(generate).not.toHaveBeenCalled()
    expect(generateWithTools).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('checks entitlement before moderation', async () => {
    const moderate = vi.fn(async () => undefined)

    const response = await createSectionEditResponse(
      SESSION_ID,
      createRequest('make the hero punchier', { bearer: 'token' }),
      {
        client: createClient(),
        entitlementClient: vi.fn(async () => ({
          allowed: false,
          code: 'forbidden' as const,
          message: 'You do not own this session',
        })),
        generate: vi.fn(async () => '<html></html>'),
        generateWithTools: vi.fn(async () => ({})),
        moderate,
      },
    )

    expect(response.status).toBe(403)
    expect(moderate).not.toHaveBeenCalled()
  })

  it('preserves the safe edit response', async () => {
    const client = createClient()
    const moderate = vi.fn(async () => undefined)

    const response = await createSectionEditResponse(
      SESSION_ID,
      createRequest('make the hero punchier', { bearer: 'token' }),
      {
        client,
        entitlementClient: vi.fn(async () => ({
          allowed: true,
          code: 'ok' as const,
        })),
        generate: vi.fn(
          async () =>
            '<!doctype html><html><body><h1>Sharper hero</h1></body></html>',
        ),
        generateWithTools: vi.fn(async () => ({})),
        moderate,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      mode: 'html',
      previewVersion: 2,
      saved: true,
      sessionId: SESSION_ID,
    })
    expect(client.mutation).toHaveBeenCalledTimes(1)
  })
})
