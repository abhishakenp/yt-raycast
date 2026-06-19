import { beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('createExportResponse', () => {
  beforeEach(() => {
    queryMock.mockReset()
    setAuthMock.mockReset()
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
    queryMock.mockResolvedValueOnce({
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
