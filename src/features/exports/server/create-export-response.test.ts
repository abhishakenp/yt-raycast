import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createExportResponse } from './create-export-response'

const queryMock = vi.fn()
const fakeClient = { query: queryMock } as never
const openUiSource = `root = SaasKimiPage("Paid export", ["Home"], {"heading": "Paid export", "highlight": "export"})`
const siteSpecJson = JSON.stringify({ projectName: 'Paid export' })

describe('createExportResponse', () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it('blocks payment-required exports before reading public preview HTML', async () => {
    queryMock.mockResolvedValueOnce({
      status: 'payment_required',
      requiresPayment: true,
      errorMessage: 'Subscribe to download.',
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
    queryMock
      .mockResolvedValueOnce({
        status: 'ready',
        requiresPayment: false,
      })
      .mockResolvedValueOnce({
        homeModule: { source: openUiSource },
        siteSpec: { specJson: siteSpecJson },
        latestPreview: {
          html: '<html><body><h1>Paid export</h1></body></html>',
          version: 1,
        },
      })

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(html).toContain('Paid export')
    expect(html).not.toContain('data-ship-fast-export-badge="1"')
  })
})
