import { describe, expect, it } from 'vitest'
import { createPexelsPhotoResolver, normalizePexelsQuery } from './pexels.js'

describe('normalizePexelsQuery', () => {
  it('keeps descriptive alt text readable for relevant Pexels searches', () => {
    expect(
      normalizePexelsQuery('athletic woman performing barbell back squat in modern gym'),
    ).toBe('athletic woman performing barbell back squat in modern gym')
  })

  it('falls back to a generic editorial query for empty input', () => {
    expect(normalizePexelsQuery('')).toBe('editorial website photography')
  })
})

describe('createPexelsPhotoResolver', () => {
  it('returns a sized Pexels photo URL and attribution metadata', async () => {
    const calls = []
    const fetchImpl = async (url, init) => {
      calls.push({ url: String(url), init })
      return {
        ok: true,
        async json() {
          return {
            photos: [
              {
                id: 42,
                alt: 'Modern gym strength training',
                photographer: 'Jane Doe',
                photographer_url: 'https://www.pexels.com/@jane',
                url: 'https://www.pexels.com/photo/modern-gym-42/',
                src: {
                  landscape: 'https://images.pexels.com/photos/42/pexels-photo-42.jpeg',
                },
              },
            ],
          }
        },
      }
    }
    const resolve = createPexelsPhotoResolver({ apiKey: 'pexels_key', fetchImpl })

    const result = await resolve({ query: 'modern gym strength training', w: 1200, h: 800 })

    expect(result).toEqual({
      ok: true,
      provider: 'pexels',
      id: '42',
      url: 'https://images.pexels.com/photos/42/pexels-photo-42.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      alt: 'Modern gym strength training',
      photographer: 'Jane Doe',
      photographerUrl: 'https://www.pexels.com/@jane',
      photoUrl: 'https://www.pexels.com/photo/modern-gym-42/',
    })
    expect(calls[0].init.headers.Authorization).toBe('pexels_key')
    expect(calls[0].url).toContain('query=modern+gym+strength+training')
    expect(calls[0].url).toContain('orientation=landscape')
    expect(calls[0].url).toContain('per_page=1')
  })

  it('returns a deterministic fallback when the API key is absent', async () => {
    const resolve = createPexelsPhotoResolver({
      apiKey: '',
      fetchImpl: async () => {
        throw new Error('should not call fetch')
      },
    })

    const result = await resolve({ query: 'bakery hero', w: 900, h: 600 })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe('picsum')
    expect(result.url).toBe('https://picsum.photos/seed/bakery-hero/900/600')
  })
})
