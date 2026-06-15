import { describe, expect, it, vi } from 'vitest'

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

const { createSessionPreviewRawResponse } =
  await import('./session-preview-raw-response')

describe('createSessionPreviewRawResponse', () => {
  it('serves stored public preview HTML as a standalone document', async () => {
    query.mockResolvedValueOnce({
      html: '<main><h1>Preview</h1></main>',
    })

    const response = await createSessionPreviewRawResponse('session-1')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(await response.text()).toContain('<h1>Preview</h1>')
    expect(query).toHaveBeenCalledWith('getPublicGallerySession', {
      sessionId: 'session-1',
    })
  })

  it('returns 404 when no stored preview HTML exists', async () => {
    query.mockResolvedValueOnce({ html: '' })

    const response = await createSessionPreviewRawResponse('missing-preview')

    expect(response.status).toBe(404)
  })
})
