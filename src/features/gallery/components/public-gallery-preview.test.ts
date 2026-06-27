import { describe, expect, it } from 'vitest'

import { getGalleryImageUrl, type GallerySession } from './PublicGallery'
import {
  createGalleryThumbnailResponse,
  generateDeterministicThumbnailSvg,
  getGalleryCategories,
} from '../server/gallery-thumbnail-response'

describe('public gallery preview cards', () => {
  it('builds the gallery thumbnail URL from the session id and preview version', () => {
    const session: GallerySession = {
      sessionId: 'abc-123',
      previewVersion: 4,
    }

    expect(getGalleryImageUrl(session)).toBe(
      '/api/sessions/abc-123/gallery-thumb?v=4',
    )
  })

  it('falls back to version 0 when previewVersion is missing', () => {
    expect(getGalleryImageUrl({ sessionId: 'xyz' })).toBe(
      '/api/sessions/xyz/gallery-thumb?v=0',
    )
  })

  it('prefers a stored imageUrl when present', () => {
    expect(
      getGalleryImageUrl({
        sessionId: 'abc-123',
        previewVersion: 4,
        imageUrl: 'https://cdn.example.com/thumb.png',
      }),
    ).toBe('https://cdn.example.com/thumb.png')
  })

  it('returns a deterministic SVG thumbnail when no cached capture exists and capture is skipped', async () => {
    const clientOverride = {
      query: async () => ({
        prompt: 'A cozy coffee shop landing page',
        status: 'done',
        categories: ['commerce'],
        previewVersion: 0,
      }),
    }

    const request = new Request(
      'https://example.test/api/sessions/sess-1/gallery-thumb?fallback=1',
    )

    const response = await createGalleryThumbnailResponse(
      'sess-1',
      request,
      clientOverride as never,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('image/svg+xml')
    const body = await response.text()
    expect(body).toContain('<svg')
    expect(body).toContain('A cozy coffee shop')
  })

  it('derives gallery categories from the prompt', () => {
    expect(getGalleryCategories('a cozy coffee shop')).toEqual(['commerce'])
    expect(getGalleryCategories('a saas analytics dashboard')).toContain('saas')
    expect(getGalleryCategories('a personal portfolio site')).toContain(
      'portfolio',
    )
  })

  it('generates a deterministic thumbnail SVG with prompt and status', () => {
    const svg = generateDeterministicThumbnailSvg(
      'blog about dogs',
      ['blog'],
      'done',
    )
    expect(svg).toContain('<svg')
    expect(svg).toContain('Ready')
    expect(svg).toContain('Blog')
  })
})
