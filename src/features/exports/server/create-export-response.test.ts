import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createExportResponse } from './create-export-response'

const queryMock = vi.fn()
const setAuthMock = vi.fn()
const buildOpenUIHtmlExportMock = vi.hoisted(() => vi.fn())
const buildOpenUIExportMock = vi.hoisted(() => vi.fn())
const buildOpenUILakebedExportMock = vi.hoisted(() => vi.fn())
const fakeClient = { query: queryMock, setAuth: setAuthMock } as never
const openUiSource = `root = SaasKimiPage("Paid export", ["Home"], {"heading": "Paid export", "highlight": "export"})`
const siteSpecJson = JSON.stringify({ projectName: 'Paid export' })

vi.mock('../services/openui-html-export-builder', () => ({
  buildOpenUIHtmlExport: buildOpenUIHtmlExportMock,
}))

vi.mock('../services/openui-export-builder', () => ({
  buildOpenUIExport: buildOpenUIExportMock,
}))

vi.mock('../services/openui-lakebed-export-builder', () => ({
  buildOpenUILakebedExport: buildOpenUILakebedExportMock,
}))

describe('createExportResponse', () => {
  beforeEach(() => {
    queryMock.mockReset()
    setAuthMock.mockReset()
    buildOpenUIHtmlExportMock.mockReset()
    buildOpenUIExportMock.mockReset()
    buildOpenUIHtmlExportMock.mockResolvedValue({
      body: '<html><body><h1>Paid export</h1></body></html>',
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
    })
    buildOpenUIExportMock.mockResolvedValue({
      body: new Uint8Array([1, 2, 3]),
      contentType: 'application/zip',
      filename: 'paid-export-next.zip',
    })
    buildOpenUILakebedExportMock.mockReset()
    buildOpenUILakebedExportMock.mockResolvedValue({
      body: new Uint8Array([4, 5, 6]),
      contentType: 'application/zip',
      filename: 'paid-export-lakebed.zip',
    })
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

  it('returns badge-free standalone HTML for ready entitled exports', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'ready',
        requiresPayment: false,
      },
      source: openUiSource,
      siteSpecJson,
      previewHtml: '<html><body><h1>Paid export</h1></body></html>',
      latestPreviewVersion: 1,
    })

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8',
    )
    expect(html).toContain('Paid export')
    expect(html).not.toContain('data-ship-fast-export-badge="1"')
    expect(buildOpenUIHtmlExportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: 'html',
        includeBadge: false,
      }),
    )
    expect(buildOpenUIExportMock).not.toHaveBeenCalled()
  })

  it('uses the full package builder only for app export targets', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'ready',
        requiresPayment: false,
      },
      source: openUiSource,
      siteSpecJson,
      latestPreviewVersion: 1,
    })

    const response = await createExportResponse(
      'session_123',
      'next',
      fakeClient,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/zip')
    expect(buildOpenUIExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ target: 'next' }),
    )
    expect(buildOpenUIHtmlExportMock).not.toHaveBeenCalled()
  })

  it('routes Lakebed downloads through the Lakebed project builder', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'ready',
        requiresPayment: false,
      },
      source: openUiSource,
      siteSpecJson,
      latestPreviewVersion: 1,
    })

    const response = await createExportResponse(
      'session_123',
      'lakebed',
      fakeClient,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/zip')
    expect(buildOpenUILakebedExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ target: 'lakebed' }),
    )
    expect(buildOpenUIExportMock).not.toHaveBeenCalled()
    expect(buildOpenUIHtmlExportMock).not.toHaveBeenCalled()
  })

  it('forwards bearer auth and owner secret to the owned download query', async () => {
    queryMock.mockResolvedValueOnce({
      export: {
        status: 'ready',
        requiresPayment: false,
      },
      source: openUiSource,
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
      sessionId: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
    })
  })
})
