import { describe, expect, it } from 'vitest'

import { createDeploymentPreviewResponse } from './deployment-preview-response'

const readyDeployment = {
  previewVersion: 4,
  sessionId: 'release-preview-session',
  slug: 'release-preview',
  status: 'ready',
  url: 'https://release-preview.ship-fast.io',
}

const readyPreview = {
  html: '<!doctype html><html><head><title>Release Preview</title></head><body><main><h1>Release Preview</h1></main></body></html>',
  previewVersion: 4,
  sessionId: 'release-preview-session',
  slug: 'release-preview',
  status: 'preview_ready',
}

describe('deployment preview release operations', () => {
  it('serves public HTML with browser security policy headers', async () => {
    let queryCount = 0
    const response = await createDeploymentPreviewResponse(
      'release-preview',
      new Request('https://ship-fast.io/preview/release-preview'),
      {
        query: async () => {
          queryCount += 1
          return queryCount === 1 ? readyDeployment : readyPreview
        },
      },
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
  })

  it('returns retryable, non-cacheable responses when dependencies fail', async () => {
    const response = await createDeploymentPreviewResponse(
      'release-preview',
      new Request('https://ship-fast.io/preview/release-preview'),
      {
        query: async () => {
          throw new Error(
            'Convex unavailable at https://db.internal?token=release-secret',
          )
        },
      },
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
