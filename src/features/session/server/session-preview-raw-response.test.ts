import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getPublicGallerySession: 'getPublicGallerySession',
    },
  },
}))

const query = vi.fn()

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({ query }),
}))

const buildOpenUIHtmlThumbnailMock = vi.hoisted(() =>
  vi.fn(async () => ({
    body: '<!doctype html><html><body><main><h1>Preview</h1></main></body></html>',
    contentType: 'text/html; charset=utf-8',
    filename: 'index.html',
    fileCount: 1,
  })),
)

vi.mock('../../exports/services/openui-html-export-builder', () => ({
  buildOpenUIHtmlThumbnail: buildOpenUIHtmlThumbnailMock,
}))

const { createSessionPreviewRawResponse } =
  await import('./session-preview-raw-response')

const realConvexRendererErrorPreviewRaw = {
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
} as const

const realConvexOpenUiHandoffPreviewRaw = {
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
} as const

describe('createSessionPreviewRawResponse', () => {
  afterEach(() => {
    query.mockReset()
  })

  it('serves stored public preview HTML as a standalone document', async () => {
    buildOpenUIHtmlThumbnailMock.mockResolvedValueOnce({
      body: '<!doctype html><html><body><main><h1>Preview</h1></main></body></html>',
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    })
    query.mockResolvedValueOnce({
      moduleSource: 'home = Stack([Hero("Preview")])',
      prompt: 'a test prompt',
    })

    const response = await createSessionPreviewRawResponse('session-1')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN')
    const contentSecurityPolicy = response.headers.get(
      'content-security-policy',
    )
    expect(contentSecurityPolicy).toContain("default-src 'none'")
    expect(contentSecurityPolicy).toContain('sandbox allow-scripts')
    expect(contentSecurityPolicy).not.toContain('allow-same-origin')
    expect(contentSecurityPolicy).not.toContain("'unsafe-eval'")
    expect(await response.text()).toContain('<h1>Preview</h1>')
    expect(query).toHaveBeenCalledWith('getPublicGallerySession', {
      sessionId: 'session-1',
    })
    expect(buildOpenUIHtmlThumbnailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'home = Stack([Hero("Preview")])',
        sessionId: 'session-1',
        target: 'html',
      }),
    )
  })

  it('returns 404 when no stored preview HTML exists', async () => {
    query.mockResolvedValueOnce({ moduleSource: '' })

    const response = await createSessionPreviewRawResponse('missing-preview')

    expect(response.status).toBe(404)
    expect(response.headers.get('content-security-policy')).toContain(
      "default-src 'none'",
    )
    expect(response.headers.get('content-security-policy')).toContain(
      'sandbox allow-scripts',
    )
  })

  it('does not serve real OpenUI renderer error HTML as a successful preview document', async () => {
    query.mockResolvedValueOnce({
      sessionId: realConvexRendererErrorPreviewRaw.sessionId,
      html: realConvexRendererErrorPreviewRaw.html,
    })

    const response = await createSessionPreviewRawResponse(
      realConvexRendererErrorPreviewRaw.sessionId,
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
    const body = await response.text()
    expect(body.toLowerCase()).not.toContain('openui-error')
    expect(body.toLowerCase()).not.toContain('failed to render')
  })

  it('does not serve DB-observed OpenUI handoff placeholder HTML as the public raw preview', async () => {
    query.mockResolvedValueOnce({
      sessionId: realConvexOpenUiHandoffPreviewRaw.sessionId,
      prompt: realConvexOpenUiHandoffPreviewRaw.prompt,
      html: realConvexOpenUiHandoffPreviewRaw.html,
    })

    const response = await createSessionPreviewRawResponse(
      realConvexOpenUiHandoffPreviewRaw.sessionId,
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
    const body = await response.text()
    expect(body).not.toContain('Generated OpenUI source is ready')
    expect(body).not.toContain('ship-fast-openui-source')
    expect(body).not.toContain('Boutique Coffee Roastery')
  })

  it('returns a stable public error when the preview lookup fails', async () => {
    query.mockRejectedValueOnce(
      new Error('ConvexError: private session owner secret mismatch'),
    )

    const response = await createSessionPreviewRawResponse(
      'k571fbfbggczv4pfz2evtrxdzx89qqbb',
    )

    expect(response.status).toBe(503)
    const body = await response.text()
    expect(body).toBe('Preview temporarily unavailable')
    expect(body).not.toContain('owner secret')
    expect(body).not.toContain('ConvexError')
  })
})
