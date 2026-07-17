import { describe, expect, it, vi } from 'vitest'

import {
  createPartnerAttributionApiResponse,
  createPartnerEmbedTokenApiResponse,
} from './partner-api-response'

const enabledEnv = {
  DUB_API_KEY: 'dub_test_token',
  DUB_PARTNERS_ENABLED: 'true',
  DUB_PARTNER_GROUP_ID: 'group_123',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json()
  if (!isRecord(value)) throw new Error('Expected a JSON object response')
  return value
}

const createConvexClient = () => ({
  mutation: vi.fn(),
  query: vi.fn(),
  setAuth: vi.fn(),
})

const createDubClient = () => ({
  embedTokens: {
    referrals: vi.fn(),
  },
})

describe('partner API responses', () => {
  it('returns not found while partners are disabled', async () => {
    const convexClient = createConvexClient()
    const response = await createPartnerAttributionApiResponse(
      new Request('https://ship-fast.ai/api/partners/attribution', {
        body: JSON.stringify({ clickId: 'click_123' }),
        headers: { Authorization: 'Bearer convex-token' },
        method: 'POST',
      }),
      {
        convexClient,
        env: { ...enabledEnv, DUB_PARTNERS_ENABLED: 'false' },
      },
    )

    expect(response.status).toBe(404)
    expect(convexClient.setAuth).not.toHaveBeenCalled()
  })

  it('requires bearer authentication for attribution and embed tokens', async () => {
    const convexClient = createConvexClient()
    const attribution = await createPartnerAttributionApiResponse(
      new Request('https://ship-fast.ai/api/partners/attribution', {
        body: JSON.stringify({ clickId: 'click_123' }),
        method: 'POST',
      }),
      { convexClient, env: enabledEnv },
    )
    const embed = await createPartnerEmbedTokenApiResponse(
      new Request('https://ship-fast.ai/api/partners/embed-token'),
      {
        convexClient,
        dubClient: createDubClient(),
        env: enabledEnv,
      },
    )

    expect(attribution.status).toBe(401)
    expect(embed.status).toBe(401)
    expect(convexClient.setAuth).not.toHaveBeenCalled()
  })

  it('claims the submitted click through authenticated Convex', async () => {
    const convexClient = createConvexClient()
    convexClient.mutation.mockResolvedValueOnce({
      claimed: true,
      reason: 'claimed',
    })

    const response = await createPartnerAttributionApiResponse(
      new Request('https://ship-fast.ai/api/partners/attribution', {
        body: JSON.stringify({ clickId: 'click_123' }),
        headers: { Authorization: 'Bearer convex-token' },
        method: 'POST',
      }),
      { convexClient, env: enabledEnv },
    )

    expect(response.status).toBe(200)
    expect(convexClient.setAuth).toHaveBeenCalledWith('convex-token')
    expect(convexClient.mutation).toHaveBeenCalledWith(expect.anything(), {
      clickId: 'click_123',
    })
    await expect(readJson(response)).resolves.toEqual({
      claimed: true,
      reason: 'claimed',
    })
  })

  it('creates an embed token from verified Convex identity only', async () => {
    const convexClient = createConvexClient()
    convexClient.query.mockResolvedValueOnce({
      email: 'alice@example.com',
      emailVerified: true,
      image: 'https://example.com/alice.png',
      name: 'Alice',
      tenantId: 'https://clerk.test|alice',
    })
    const dubClient = createDubClient()
    dubClient.embedTokens.referrals.mockResolvedValueOnce({
      expires: '2026-07-17T18:00:00.000Z',
      publicToken: 'dub_embed_public',
    })

    const response = await createPartnerEmbedTokenApiResponse(
      new Request('https://ship-fast.ai/api/partners/embed-token', {
        headers: { Authorization: 'Bearer convex-token' },
      }),
      { convexClient, dubClient, env: enabledEnv },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(convexClient.setAuth).toHaveBeenCalledWith('convex-token')
    expect(dubClient.embedTokens.referrals).toHaveBeenCalledWith({
      partner: {
        email: 'alice@example.com',
        groupId: 'group_123',
        image: 'https://example.com/alice.png',
        name: 'Alice',
        tenantId: 'https://clerk.test|alice',
      },
      tenantId: 'https://clerk.test|alice',
    })
    await expect(readJson(response)).resolves.toEqual({
      publicToken: 'dub_embed_public',
    })
  })

  it('requires a verified email before creating a partner', async () => {
    const convexClient = createConvexClient()
    convexClient.query.mockResolvedValueOnce({
      email: null,
      image: null,
      name: null,
      tenantId: 'https://clerk.test|alice',
    })
    const dubClient = createDubClient()

    const response = await createPartnerEmbedTokenApiResponse(
      new Request('https://ship-fast.ai/api/partners/embed-token', {
        headers: { Authorization: 'Bearer convex-token' },
      }),
      { convexClient, dubClient, env: enabledEnv },
    )

    expect(response.status).toBe(422)
    expect(dubClient.embedTokens.referrals).not.toHaveBeenCalled()
  })

  it('rejects an unverified email before creating a partner', async () => {
    const convexClient = createConvexClient()
    convexClient.query.mockResolvedValueOnce({
      email: 'alice@example.com',
      emailVerified: false,
      image: null,
      name: 'Alice',
      tenantId: 'https://clerk.test|alice',
    })
    const dubClient = createDubClient()

    const response = await createPartnerEmbedTokenApiResponse(
      new Request('https://ship-fast.ai/api/partners/embed-token', {
        headers: { Authorization: 'Bearer convex-token' },
      }),
      { convexClient, dubClient, env: enabledEnv },
    )

    expect(response.status).toBe(422)
    expect(dubClient.embedTokens.referrals).not.toHaveBeenCalled()
  })

  it('does not expose provider or identity details when embed creation fails', async () => {
    const convexClient = createConvexClient()
    convexClient.query.mockRejectedValueOnce(
      new Error('Dub token failed for https://clerk.test|alice'),
    )

    const response = await createPartnerEmbedTokenApiResponse(
      new Request('https://ship-fast.ai/api/partners/embed-token', {
        headers: { Authorization: 'Bearer convex-token' },
      }),
      {
        convexClient,
        dubClient: createDubClient(),
        env: enabledEnv,
      },
    )

    expect(response.status).toBe(503)
    const body = await readJson(response)
    expect(body).toEqual({ error: 'Unable to load partner portal.' })
    expect(JSON.stringify(body)).not.toContain('clerk.test')
  })
})
