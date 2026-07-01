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

const realConvexFailedLakebedDeployment = {
  deploymentId: 'js7bs1688tg9art1de6x9jc4ys89m106',
  sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
  slug: 'gov-site-in-hindi',
  url: 'https://gov-site-in-hindi.ship-fast.io',
  status: 'failed',
  errorMessage:
    'Build failed with 3 errors:\nlakebed-source:client/section-kit/SignInButton.tsx:3:9: ERROR: No matching export in "lakebed-source:client/lib/lakebed.ts" for import "useAuth"\nlakebed-source:client/section-kit/SignInButton.tsx:3:18: ERROR: No matching export in "lakebed-source:client/lib/lakebed.ts" for import "signInWithGoogle"\nlakebed-source:client/section-kit/SignInButton.tsx:3:36: ERROR: No matching export in "lakebed-source:client/lib/lakebed.ts" for import "signOut"',
} as const

const dbObservedOpenUiHandoffHtml =
  '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>'

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

  it('returns a stable failed Lakebed deployment response without leaking build logs', async () => {
    const client = {
      query: vi.fn().mockResolvedValueOnce({
        provider: 'lakebed',
        status: realConvexFailedLakebedDeployment.status,
        url: realConvexFailedLakebedDeployment.url,
        errorMessage: realConvexFailedLakebedDeployment.errorMessage,
      }),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'owner-secret' }),
      realConvexFailedLakebedDeployment.sessionId,
      client,
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(client.action).not.toHaveBeenCalled()
    const body = await response.json()
    expect(body).toMatchObject({
      status: realConvexFailedLakebedDeployment.status,
      error: 'Lakebed deployment failed.',
    })
    expect(JSON.stringify(body)).not.toContain('No matching export')
    expect(JSON.stringify(body)).not.toContain('SignInButton.tsx')
    expect(JSON.stringify(body)).not.toContain(
      realConvexFailedLakebedDeployment.sessionId,
    )
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

  it('does not publish a ready Lakebed artifact whose static preview still contains DB-observed OpenUI handoff HTML', async () => {
    const filesUrl = 'https://storage.test/boutique-coffee-lakebed-files.json'
    const fetchMock = vi.fn(async () =>
      Response.json({
        files: {
          'client/preview.ts': `export const previewHtml = ${JSON.stringify(dbObservedOpenUiHandoffHtml)};\n`,
          'client/index.tsx':
            'import { previewHtml } from "./preview";\nexport default function App(){ return <iframe srcDoc={previewHtml} /> }\n',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const client = {
      query: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        status: 'ready',
        filesUrl,
      }),
      action: vi.fn(async () => ({
        provider: 'lakebed',
        status: 'ready',
        url: 'https://silver-river-1fa25d328e.lakebed.app',
      })),
      setAuth: vi.fn(),
    }

    try {
      const response = await createLakebedPublishResponse(
        requestFor({ anonymousOwnerSecret: 'owner-secret' }),
        'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
        client,
      )
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(fetchMock).toHaveBeenCalledWith(filesUrl)
      expect(client.action).not.toHaveBeenCalled()
      expect(JSON.stringify(body)).not.toContain(
        'Generated OpenUI source is ready',
      )
      expect(JSON.stringify(body)).not.toContain('ship-fast-openui-source')
      expect(JSON.stringify(body)).not.toContain('Boutique Coffee Roastery')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('returns a stable Lakebed publish error when deployment crashes after the artifact is ready', async () => {
    const client = {
      query: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        status: 'ready',
        filesUrl: 'https://storage.test/gov-site-in-hindi-files.json',
      }),
      action: vi.fn(async () => {
        throw new Error(realConvexFailedLakebedDeployment.errorMessage)
      }),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'owner-secret' }),
      realConvexFailedLakebedDeployment.sessionId,
      client,
    )

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(client.action).toHaveBeenCalledWith(expect.anything(), {
      lookup: realConvexFailedLakebedDeployment.sessionId,
      anonymousOwnerSecret: 'owner-secret',
    })
    const body = await response.json()
    expect(body).toEqual({ error: 'Lakebed publish failed.' })
    expect(JSON.stringify(body)).not.toContain('No matching export')
    expect(JSON.stringify(body)).not.toContain('SignInButton.tsx')
    expect(JSON.stringify(body)).not.toContain(
      realConvexFailedLakebedDeployment.sessionId,
    )
  })
})
