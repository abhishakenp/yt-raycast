import { describe, expect, it, vi } from 'vitest'

import { createDeploymentPreviewResponse } from './deployment-preview-response'

const readyArtifactHtml =
  '<!doctype html><html lang="en"><head><title>Atlas</title><link rel="canonical" href="https://atlas-notes.ship-fast.ai/" /></head><body><h1>Atlas</h1></body></html>'

const readyArtifactHtmlWithBadge =
  '<!doctype html><html lang="en"><head><title>Unpaid</title></head><body><h1>Unpaid Site</h1><a data-ship-fast-export-badge="1" href="https://ship-fast.ai" target="_blank" rel="noopener noreferrer">Built with Ship Fast</a></body></html>'

function mockFetch(html: string) {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
  )
  return () => fetchSpy.mockRestore()
}

function artifactQueryResponse(
  overrides: Partial<{
    slug: string
    url: string
    status: string
    previewVersion: number
    sessionId: string
    artifact: Partial<{
      status: string
      generatorRevision: string
      errorMessage: string
      contentType: string
      storageUrl: string | null
    }> | null
  }>,
) {
  return {
    slug: overrides.slug ?? 'atlas-notes',
    url: overrides.url ?? 'https://atlas-notes.ship-fast.ai',
    status: overrides.status ?? 'ready',
    previewVersion: overrides.previewVersion ?? 3,
    sessionId: overrides.sessionId ?? 'session_123',
    artifact:
      overrides.artifact === null
        ? null
        : {
            status: overrides.artifact?.status ?? 'ready',
            generatorRevision:
              overrides.artifact?.generatorRevision ?? 'html-export-v2',
            errorMessage: overrides.artifact?.errorMessage,
            contentType:
              overrides.artifact?.contentType ?? 'text/html; charset=utf-8',
            storageUrl:
              overrides.artifact?.storageUrl ??
              'https://cdn.convex.cloud/atlas-notes.html',
          },
  }
}

describe('createDeploymentPreviewResponse', () => {
  it('serves the html export artifact with deployment headers', async () => {
    const restoreFetch = mockFetch(readyArtifactHtml)
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'atlas-notes',
          url: 'https://atlas-notes.ship-fast.ai',
          previewVersion: 3,
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'Atlas Notes',
      new Request('https://ship-fast.test/preview/atlas-notes?utm=1'),
      client,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(response.headers.get('x-ship-fast-deployment')).toBe('atlas-notes')
    expect(response.headers.get('x-ship-fast-preview-version')).toBe('3')
    expect(html).toContain(
      '<link rel="canonical" href="https://atlas-notes.ship-fast.ai/" />',
    )
    restoreFetch()
  })

  it('serves the html export artifact with badge already baked in', async () => {
    const restoreFetch = mockFetch(readyArtifactHtmlWithBadge)
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'unpaid-site',
          url: 'https://unpaid-site.ship-fast.ai',
          previewVersion: 1,
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'unpaid-site',
      new Request('https://ship-fast.ai/preview/unpaid-site'),
      client,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('data-ship-fast-export-badge="1"')
    expect(html).toContain('Built with Ship Fast')
    restoreFetch()
  })

  it('returns 404 for missing deployments', async () => {
    const client = {
      query: async () => null,
    }

    const response = await createDeploymentPreviewResponse(
      'missing',
      undefined,
      client,
    )

    expect(response.status).toBe(404)
  })

  it('returns a stable unavailable response when deployment lookup fails', async () => {
    const client = {
      query: async () => {
        throw new Error('Convex query failed')
      },
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.ai/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Deployment preview is unavailable')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('returns 202 when artifact is null (not yet built)', async () => {
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'a-craft-beer-brewery',
          previewVersion: 1,
          artifact: null,
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.ai/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('returns 202 when artifact is queued', async () => {
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'a-craft-beer-brewery',
          previewVersion: 1,
          artifact: { status: 'queued', storageUrl: null },
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.ai/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
  })

  it('returns 202 when artifact is building', async () => {
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'a-craft-beer-brewery',
          previewVersion: 1,
          artifact: { status: 'building', storageUrl: null },
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.ai/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
  })

  it('returns 202 when artifact generatorRevision is stale', async () => {
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'a-craft-beer-brewery',
          previewVersion: 1,
          artifact: {
            status: 'stale',
            generatorRevision: 'html-export-v1',
            storageUrl: null,
          },
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.ai/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
  })

  it('returns 422 when artifact is failed', async () => {
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'gov-site-in-hindi',
          previewVersion: 1,
          artifact: {
            status: 'failed',
            errorMessage: 'Build failed',
            storageUrl: null,
          },
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'gov-site-in-hindi',
      new Request('https://ship-fast.ai/preview/gov-site-in-hindi'),
      client,
    )

    expect(response.status).toBe(422)
    expect(await response.text()).toBe('Deployment preview is not available')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('returns 503 when artifact storage fetch fails', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Network error'))

    const client = {
      query: async () => artifactQueryResponse({}),
    }

    const response = await createDeploymentPreviewResponse(
      'atlas-notes',
      new Request('https://ship-fast.ai/preview/atlas-notes'),
      client,
    )

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Deployment preview is unavailable')
    fetchSpy.mockRestore()
  })

  it('returns 202 when artifact storage returns empty HTML', async () => {
    const restoreFetch = mockFetch('')
    const client = {
      query: async () => artifactQueryResponse({}),
    }

    const response = await createDeploymentPreviewResponse(
      'atlas-notes',
      new Request('https://ship-fast.ai/preview/atlas-notes'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
    restoreFetch()
  })

  it('serves a real ready deployment with security headers', async () => {
    const restoreFetch = mockFetch(readyArtifactHtml)
    const client = {
      query: async () =>
        artifactQueryResponse({
          slug: 'release-preview',
          url: 'https://release-preview.ship-fast.ai',
          previewVersion: 4,
        }),
    }

    const response = await createDeploymentPreviewResponse(
      'release-preview',
      new Request('https://ship-fast.ai/preview/release-preview'),
      client,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-security-policy')).toContain(
      'default-src',
    )
    expect(response.headers.get('content-security-policy')).toContain(
      "frame-ancestors 'self'",
    )
    expect(response.headers.get('referrer-policy')).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('set-cookie')).toBeNull()
    restoreFetch()
  })

  it('returns retryable, non-cacheable responses when dependencies fail', async () => {
    const client = {
      query: async () => {
        throw new Error(
          'Convex unavailable at https://db.internal?token=release-secret',
        )
      },
    }

    const response = await createDeploymentPreviewResponse(
      'release-preview',
      new Request('https://ship-fast.ai/preview/release-preview'),
      client,
    )
    const body = await response.text()

    expect(response.status).toBe(503)
    expect(body).toBe('Deployment preview is unavailable')
    expect(body).not.toContain('release-secret')
    expect(body).not.toContain('db.internal')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('5')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
