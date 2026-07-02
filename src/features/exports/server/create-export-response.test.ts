import { beforeEach, describe, expect, it, vi } from 'vitest'

const artifactFileMocks = vi.hoisted(() => ({
  buildOpenUIArtifactFiles: vi.fn(),
  buildDownloadFromArtifactFiles: vi.fn(),
}))

vi.mock('../services/openui-artifact-files', () => artifactFileMocks)

import { createExportResponse } from './create-export-response'

const queryMock = vi.fn()
const setAuthMock = vi.fn()
const fakeClient = { query: queryMock, setAuth: setAuthMock }

const readyArtifactResult = (target = 'html') => ({
  export: {
    status: 'ready',
    requiresPayment: false,
    previewVersion: 1,
  },
  artifact: {
    status: 'ready',
    filename: `paid-export-${target}.zip`,
    contentType: 'application/zip',
    previewVersion: 1,
  },
  storageUrl: `https://storage.test/${target}.zip`,
  latestPreviewVersion: 1,
})

const realConvexFailedExportArtifact = {
  artifactId: 'q57b2zz2n5w0rkq69hhzk65pc189neqx',
  sessionId: 'k574gc39ktqpnpdbqzrdw2n7qs89nta1',
  target: 'lakebed',
  status: 'failed',
  errorMessage: 'Export build stalled before completion. Click to retry.',
  previewVersion: 1,
} as const

const realConvexReadyHtmlExportArtifact = {
  artifactId: 'q570z3gzc72x7r5marnffgp8ks89np8g',
  sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  target: 'html',
  status: 'ready',
  filename: 'index.html',
  contentType: 'text/html; charset=utf-8',
  previewVersion: 1,
  storageUrl: 'https://storage.test/kg2egxhnf5xnff8689bb3p4ve989mpce',
} as const

const realConvexRendererErrorPreview = {
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  target: 'react',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
} as const

const realConvexOpenUiHandoffPreview = {
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  target: 'html',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  source:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
} as const

describe('createExportResponse', () => {
  beforeEach(() => {
    queryMock.mockReset()
    setAuthMock.mockReset()
    artifactFileMocks.buildOpenUIArtifactFiles.mockReset()
    artifactFileMocks.buildDownloadFromArtifactFiles.mockReset()
    artifactFileMocks.buildOpenUIArtifactFiles.mockResolvedValue({
      files: { 'index.html': '<main>Generated fallback</main>' },
      download: {
        body: '<!doctype html><html><body>Generated fallback</body></html>',
        contentType: 'text/html; charset=utf-8',
        filename: 'index.html',
      },
    })
    artifactFileMocks.buildDownloadFromArtifactFiles.mockResolvedValue({
      body: '<!doctype html><html><body>Generated fallback</body></html>',
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
    })
    vi.unstubAllGlobals()
  })

  it('blocks payment-required exports before reading public preview HTML', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'payment_required',
        requiresPayment: true,
        errorMessage: 'Subscribe to download.',
      },
    })

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )

    expect(response.status).toBe(402)
    expect(await response.text()).toBe('Subscribe to download.')
    expect(queryMock).toHaveBeenCalledTimes(1)
  })

  it('streams the stored artifact for ready entitled exports', async () => {
    queryMock.mockResolvedValueOnce(readyArtifactResult('html'))
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('stored-html-bytes')),
    )

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/zip')
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="paid-export-html.zip"',
    )
    expect(await response.text()).toBe('stored-html-bytes')
    expect(fetch).toHaveBeenCalledWith('https://storage.test/html.zip')
  })

  it('returns 202 while the artifact is still building', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: 1,
        },
        artifact: {
          status: 'building',
          previewVersion: 1,
        },
        storageUrl: null,
        latestPreviewVersion: 1,
      })
      .mockResolvedValueOnce(null)

    const response = await createExportResponse(
      'session_123',
      'next',
      fakeClient,
    )

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toMatchObject({
      status: 'building',
    })
  })

  it('returns the real failed artifact error instead of treating a failed export as still preparing', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: realConvexFailedExportArtifact.previewVersion,
        },
        artifact: {
          status: realConvexFailedExportArtifact.status,
          errorMessage: realConvexFailedExportArtifact.errorMessage,
          previewVersion: realConvexFailedExportArtifact.previewVersion,
        },
        storageUrl: null,
        latestPreviewVersion: realConvexFailedExportArtifact.previewVersion,
      })
      .mockResolvedValueOnce(null)

    const response = await createExportResponse(
      realConvexFailedExportArtifact.sessionId,
      realConvexFailedExportArtifact.target,
      fakeClient,
    )

    expect(response.status).toBe(409)
    expect(await response.text()).toContain(
      realConvexFailedExportArtifact.errorMessage,
    )
    expect(queryMock).toHaveBeenCalledTimes(1)
  })

  it('builds the download on demand when the stored artifact is not ready', async () => {
    const selectedBrandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear-id',
      icon: 'https://cdn.brandfetch.io/linear/icon.webp',
      logo: 'https://cdn.brandfetch.io/linear/logo.svg',
    }
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: 1,
        },
        artifact: {
          status: 'building',
          previewVersion: 1,
        },
        storageUrl: null,
        latestPreviewVersion: 1,
      })
      .mockResolvedValueOnce({
        sessionId: 'session_123',
        target: 'html',
        source: '<main>Generated fallback</main>',
        html: '<!doctype html><html><head><title>Fallback Site</title></head><body><main>Generated fallback</main></body></html>',
        themeName: 'darkmatter',
        isDark: false,
        locale: 'lt',
        selectedBrandLogo,
      })

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8',
    )
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="index.html"',
    )
    expect(await response.text()).toContain('Generated fallback')
    expect(queryMock).toHaveBeenCalledTimes(2)
    expect(artifactFileMocks.buildOpenUIArtifactFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        source: '<main>Generated fallback</main>',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Site</title></head><body><main>Generated fallback</main></body></html>',
        themeName: 'darkmatter',
        isDark: false,
        locale: 'lt',
        selectedBrandLogo,
      }),
    )
  })

  it('does not build an on-demand download from OpenUI renderer-error HTML', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: 1,
        },
        artifact: {
          status: 'building',
          previewVersion: 1,
        },
        storageUrl: null,
        latestPreviewVersion: 1,
      })
      .mockResolvedValueOnce({
        sessionId: realConvexRendererErrorPreview.sessionId,
        target: realConvexRendererErrorPreview.target,
        source: realConvexRendererErrorPreview.html,
        html: realConvexRendererErrorPreview.html,
      })

    const response = await createExportResponse(
      realConvexRendererErrorPreview.sessionId,
      realConvexRendererErrorPreview.target,
      fakeClient,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.headers.get('content-disposition')).toBeNull()
    expect(body.toLowerCase()).not.toContain('openui-error')
    expect(body.toLowerCase()).not.toContain('failed to render')
  })

  it('does not build an on-demand download from DB-observed OpenUI handoff HTML', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: 1,
        },
        artifact: {
          status: 'building',
          previewVersion: 1,
        },
        storageUrl: null,
        latestPreviewVersion: 1,
      })
      .mockResolvedValueOnce({
        sessionId: realConvexOpenUiHandoffPreview.sessionId,
        target: realConvexOpenUiHandoffPreview.target,
        source: realConvexOpenUiHandoffPreview.source,
        html: realConvexOpenUiHandoffPreview.html,
      })

    const response = await createExportResponse(
      realConvexOpenUiHandoffPreview.sessionId,
      realConvexOpenUiHandoffPreview.target,
      fakeClient,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.headers.get('content-disposition')).toBeNull()
    expect(body).not.toContain('Generated OpenUI source is ready')
    expect(body).not.toContain('ship-fast-openui-source')
    expect(body).not.toContain('Boutique Coffee Roastery')
    expect(artifactFileMocks.buildOpenUIArtifactFiles).not.toHaveBeenCalled()
    expect(
      artifactFileMocks.buildDownloadFromArtifactFiles,
    ).not.toHaveBeenCalled()
  })

  it('streams Lakebed artifacts through the same prebuilt artifact path', async () => {
    queryMock.mockResolvedValueOnce(readyArtifactResult('lakebed'))
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new Uint8Array([4, 5, 6]))),
    )

    const response = await createExportResponse(
      'session_123',
      'lakebed',
      fakeClient,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/zip')
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="paid-export-lakebed.zip"',
    )
    expect(fetch).toHaveBeenCalledWith('https://storage.test/lakebed.zip')
  })

  it('returns a real export failure when the ready artifact storage object is unavailable and cannot be rebuilt', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
        },
        artifact: {
          status: realConvexReadyHtmlExportArtifact.status,
          filename: realConvexReadyHtmlExportArtifact.filename,
          contentType: realConvexReadyHtmlExportArtifact.contentType,
          previewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
        },
        storageUrl: realConvexReadyHtmlExportArtifact.storageUrl,
        latestPreviewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
      })
      .mockResolvedValueOnce(null)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('missing artifact', { status: 404 })),
    )

    const response = await createExportResponse(
      realConvexReadyHtmlExportArtifact.sessionId,
      realConvexReadyHtmlExportArtifact.target,
      fakeClient,
    )

    expect(fetch).toHaveBeenCalledWith(
      realConvexReadyHtmlExportArtifact.storageUrl,
    )
    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(await response.text()).toContain('artifact')
  })

  it('returns a stable export failure when ready artifact storage fetch rejects', async () => {
    queryMock
      .mockResolvedValueOnce({
        export: {
          status: 'ready',
          requiresPayment: false,
          previewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
        },
        artifact: {
          status: realConvexReadyHtmlExportArtifact.status,
          filename: realConvexReadyHtmlExportArtifact.filename,
          contentType: realConvexReadyHtmlExportArtifact.contentType,
          previewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
        },
        storageUrl: realConvexReadyHtmlExportArtifact.storageUrl,
        latestPreviewVersion: realConvexReadyHtmlExportArtifact.previewVersion,
      })
      .mockResolvedValueOnce(null)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error(
          `storage network unavailable for ${realConvexReadyHtmlExportArtifact.sessionId}`,
        )
      }),
    )

    const response = await createExportResponse(
      realConvexReadyHtmlExportArtifact.sessionId,
      realConvexReadyHtmlExportArtifact.target,
      fakeClient,
    )

    const body = await response.text()
    expect(body).toBe(
      'Export artifact is unavailable and could not be rebuilt.',
    )
    expect(body).not.toContain(realConvexReadyHtmlExportArtifact.sessionId)
    expect(body).not.toContain('storage network unavailable')
    expect(response.status).toBe(502)
  })

  it('forwards bearer auth and owner secret to the owned download query', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'ready',
        requiresPayment: false,
        previewVersion: 1,
      },
      artifact: { status: 'building', previewVersion: 1 },
      storageUrl: null,
      latestPreviewVersion: 1,
    })

    await createExportResponse(
      'session_123',
      'html',
      new Request(
        'https://ship-fast.test/api/sessions/session_123/download/html',
        {
          headers: {
            authorization: 'Bearer token_123',
            'x-ship-fast-owner-secret': 'owner-secret',
          },
        },
      ),
      fakeClient,
    )

    expect(setAuthMock).toHaveBeenCalledWith('token_123')
    expect(queryMock).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
    })
  })
})
