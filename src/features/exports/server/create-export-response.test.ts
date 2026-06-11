import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createExportResponse } from './create-export-response'

const queryMock = vi.fn()
const fakeClient = { query: queryMock } as never

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

  it('returns a badge-free ZIP for ready entitled exports', async () => {
    queryMock
      .mockResolvedValueOnce({
        status: 'ready',
        requiresPayment: false,
      })
      .mockResolvedValueOnce({
        html: '<html><body><h1>Paid export</h1></body></html>',
      })

    const response = await createExportResponse(
      'session_123',
      'html',
      fakeClient,
    )
    const zip = Buffer.from(await response.arrayBuffer()).toString('utf8')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/zip')
    expect(zip).toContain('index.html')
    expect(zip).toContain('llms.txt')
    expect(zip).toContain('robots.txt')
    expect(zip).toContain('sitemap.xml')
    expect(zip).toContain('Paid export')
    expect(zip).not.toContain('data-ship-fast-export-badge="1"')
  })
})
