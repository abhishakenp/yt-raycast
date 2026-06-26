import { describe, expect, it, vi } from 'vitest'

import { createLakebedPublishResponse } from './lakebed-publish-response'

const requestFor = (body: unknown = {}) =>
  new Request(
    'https://ship-fast.test/api/sessions/session_123/deploy/lakebed',
    {
      body: JSON.stringify(body),
      headers: {
        authorization: 'Bearer app-token',
        'content-type': 'application/json',
      },
      method: 'POST',
    },
  )

describe('createLakebedPublishResponse', () => {
  it('returns an existing ready Lakebed deployment without redeploying', async () => {
    const client = {
      query: vi.fn(async () => ({
        provider: 'lakebed',
        status: 'ready',
        url: 'https://site.lakebed.app',
      })),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor(),
      'session_123',
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('app-token')
    expect(client.action).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      provider: 'lakebed',
      status: 'ready',
      url: 'https://site.lakebed.app',
    })
  })

  it('returns 202 while the prebuilt Lakebed artifact is still preparing', async () => {
    const client = {
      query: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ status: 'building', filesUrl: null }),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'owner-secret' }),
      'session_123',
      client,
    )

    expect(response.status).toBe(202)
    expect(client.action).not.toHaveBeenCalled()
    expect(client.query).toHaveBeenLastCalledWith(expect.anything(), {
      lookup: 'session_123',
      anonymousOwnerSecret: 'owner-secret',
    })
    await expect(response.json()).resolves.toMatchObject({
      status: 'building',
      error: 'Lakebed app is still being prepared.',
    })
  })

  it('deploys by lookup once the Lakebed artifact file map is ready', async () => {
    const client = {
      query: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        status: 'ready',
        filesUrl: 'https://storage.test/lakebed-files.json',
      }),
      action: vi.fn(async () => ({
        provider: 'lakebed',
        status: 'ready',
        url: 'https://site.lakebed.app',
      })),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'owner-secret' }),
      'session_123',
      client,
    )

    expect(response.status).toBe(200)
    expect(client.action).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      anonymousOwnerSecret: 'owner-secret',
    })
    await expect(response.json()).resolves.toMatchObject({
      provider: 'lakebed',
      status: 'ready',
      url: 'https://site.lakebed.app',
    })
  })
})
