import { describe, expect, it, vi } from 'vitest'

import { createDeploymentPreviewResponse } from './deployment-preview-response'

const readyArtifactHtml =
  '<!doctype html><html><head><title>Release Preview</title></head><body><main><h1>Release Preview</h1></main></body></html>'

describe('deployment preview release operations', () => {
  it('serves the html export artifact with browser security policy headers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(readyArtifactHtml, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )
    const client = {
      query: async () => ({
        slug: 'release-preview',
        url: 'https://release-preview.ship-fast.ai',
        status: 'ready',
        previewVersion: 4,
        sessionId: 'release-preview-session',
        artifact: {
          status: 'ready',
          generatorRevision: 'html-export-v2',
          contentType: 'text/html; charset=utf-8',
          storageUrl: 'https://cdn.convex.cloud/release-preview.html',
        },
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
    fetchSpy.mockRestore()
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
