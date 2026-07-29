import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getPublicGallerySession: 'getPublicGallerySession',
    },
  },
}))

const query = vi.fn()

vi.mock('../../../shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({ query }),
}))

const buildOpenUIHtmlExportMock = vi.hoisted(() =>
  vi.fn(async () => ({
    body: '<!doctype html><html><body><main><h1>Rendered</h1></main></body></html>',
    contentType: 'text/html; charset=utf-8',
    filename: 'index.html',
    fileCount: 1,
  })),
)

vi.mock('../../exports/services/openui-html-export-builder', () => ({
  buildOpenUIHtmlExport: buildOpenUIHtmlExportMock,
}))

const { resolveGalleryPreviewHtml } = await import('./gallery-preview-html')

/**
 * Behavioral regression tests for resolveGalleryPreviewHtml.
 *
 * The single source of truth for the wire shape is serializePublicGallerySession
 * (convex/lib/session_gallery_helpers.ts). These tests feed objects matching
 * that serializer's actual output — notably WITHOUT an `html` field, since the
 * v3-only engine always emits moduleSource (OpenUI source) and never a
 * pre-rendered html blob. If a future change re-introduces a hand-rolled schema
 * that demands `html`, these tests will fail instead of every gallery preview
 * silently 404ing.
 */
describe('resolveGalleryPreviewHtml', () => {
  afterEach(() => {
    query.mockReset()
    buildOpenUIHtmlExportMock.mockReset()
    buildOpenUIHtmlExportMock.mockResolvedValue({
      body: '<!doctype html><html><body><main><h1>Rendered</h1></main></body></html>',
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    })
  })

  it('renders from moduleSource via the OpenUI export builder (no html field present)', async () => {
    // Shape matches serializePublicGallerySession output — no `html` key.
    query.mockResolvedValueOnce({
      id: 'k57test00000000000000000000',
      sessionId: 'k57test00000000000000000000',
      prompt: 'a cozy bookstore',
      preferredLanguage: 'en',
      themeOverride: null,
      themeMode: null,
      genuiTheme: null,
      selectedBrandLogo: null,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: 1700000000000,
      updatedAt: 1700000001000,
      moduleSource: 'root = Stack([Hero("Cozy Bookstore")])',
      siteSpecJson: null,
      categories: ['website'],
      elapsed: 42000,
      cost: null,
      homepageReady: true,
      siteSpecReady: true,
      openuiReady: true,
      readiness: {
        homepageReady: true,
        siteSpecReady: true,
        openuiReady: true,
        previewReady: true,
      },
    })

    const html = await resolveGalleryPreviewHtml('k57test00000000000000000000')

    expect(html).not.toBeNull()
    expect(html).toContain('<h1>Rendered</h1>')
    expect(buildOpenUIHtmlExportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'root = Stack([Hero("Cozy Bookstore")])',
        target: 'html',
        sessionId: 'k57test00000000000000000000',
      }),
    )
  })

  it('returns null when moduleSource is null (session has no OpenUI source)', async () => {
    query.mockResolvedValueOnce({
      id: 'k57empty00000000000000000000',
      sessionId: 'k57empty00000000000000000000',
      prompt: 'incomplete generation',
      preferredLanguage: 'en',
      themeOverride: null,
      themeMode: null,
      genuiTheme: null,
      selectedBrandLogo: null,
      status: 'running',
      previewVersion: 0,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      moduleSource: null,
      siteSpecJson: null,
      categories: [],
      elapsed: null,
      cost: null,
      homepageReady: null,
      siteSpecReady: null,
      openuiReady: null,
      readiness: {
        homepageReady: null,
        siteSpecReady: null,
        openuiReady: null,
        previewReady: false,
      },
    })

    const html = await resolveGalleryPreviewHtml('k57empty00000000000000000000')

    expect(html).toBeNull()
    expect(buildOpenUIHtmlExportMock).not.toHaveBeenCalled()
  })

  it('returns null when the session is not found or not public', async () => {
    query.mockResolvedValueOnce(null)

    const html = await resolveGalleryPreviewHtml('k57missing000000000000000000')

    expect(html).toBeNull()
    expect(buildOpenUIHtmlExportMock).not.toHaveBeenCalled()
  })

  it('returns null when the OpenUI export builder throws', async () => {
    query.mockResolvedValueOnce({
      id: 'k57throw00000000000000000000',
      sessionId: 'k57throw00000000000000000000',
      prompt: 'crash test',
      preferredLanguage: 'en',
      themeOverride: null,
      themeMode: null,
      genuiTheme: null,
      selectedBrandLogo: null,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: 1700000000000,
      updatedAt: 1700000001000,
      moduleSource: 'root = Broken(',
      siteSpecJson: null,
      categories: ['website'],
      elapsed: 1000,
      cost: null,
      homepageReady: true,
      siteSpecReady: true,
      openuiReady: true,
      readiness: {
        homepageReady: true,
        siteSpecReady: true,
        openuiReady: true,
        previewReady: true,
      },
    })
    buildOpenUIHtmlExportMock.mockRejectedValueOnce(new Error('compile failed'))

    const html = await resolveGalleryPreviewHtml('k57throw00000000000000000000')

    expect(html).toBeNull()
  })

  it('returns null when rendered HTML is an unsafe error page', async () => {
    query.mockResolvedValueOnce({
      id: 'k57unsaf00000000000000000000',
      sessionId: 'k57unsaf00000000000000000000',
      prompt: 'unsafe test',
      preferredLanguage: 'en',
      themeOverride: null,
      themeMode: null,
      genuiTheme: null,
      selectedBrandLogo: null,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: 1700000000000,
      updatedAt: 1700000001000,
      moduleSource: 'root = Stack([Hero("test")])',
      siteSpecJson: null,
      categories: ['website'],
      elapsed: 1000,
      cost: null,
      homepageReady: true,
      siteSpecReady: true,
      openuiReady: true,
      readiness: {
        homepageReady: true,
        siteSpecReady: true,
        openuiReady: true,
        previewReady: true,
      },
    })
    buildOpenUIHtmlExportMock.mockResolvedValueOnce({
      body: '<!doctype html><html><body><div class="openui-error">Failed to render</div></body></html>',
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    })

    const html = await resolveGalleryPreviewHtml('k57unsaf00000000000000000000')

    expect(html).toBeNull()
  })
})
