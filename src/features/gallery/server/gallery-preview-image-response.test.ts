import { describe, expect, it } from 'vitest'

import { createGalleryPreviewImageResponse } from './gallery-preview-image-response'

describe('createGalleryPreviewImageResponse', () => {
  it('returns a PNG image response for resolved preview HTML', async () => {
    const png = new Uint8Array([137, 80, 78, 71])
    const response = await createGalleryPreviewImageResponse('session-1', {
      capturePng: async (html) => {
        expect(html).toBe('<!doctype html><html><body>Preview</body></html>')
        return png
      },
      resolveHtml: async (sessionId) => {
        expect(sessionId).toBe('session-1')
        return '<!doctype html><html><body>Preview</body></html>'
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toContain('max-age=300')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })

  it('returns 404 when the current gallery preview lookup has no HTML', async () => {
    const response = await createGalleryPreviewImageResponse('missing', {
      capturePng: async () => new Uint8Array([1]),
      resolveHtml: async () => null,
    })

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(await response.text()).toBe('Preview not found or not public')
  })

  it('returns 503 when PNG capture fails', async () => {
    const response = await createGalleryPreviewImageResponse('session-1', {
      capturePng: async () => {
        throw new Error('chromium unavailable')
      },
      resolveHtml: async () =>
        '<!doctype html><html><body>Preview</body></html>',
    })

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Preview image temporarily unavailable')
  })
})
