import { describe, expect, it } from 'vitest'

import {
  decodeMultiImageSrc,
  encodeMultiImageSrc,
  firstImageSrc,
} from './multi-image-src'

describe('multi-image src codec', () => {
  it('round-trips a multi-URL selection', () => {
    const urls = [
      'https://images.pexels.com/photos/1.jpeg?w=940&h=650',
      'https://images.pexels.com/photos/2.jpeg',
      '/api/storage/upload-3.png',
    ]
    expect(decodeMultiImageSrc(encodeMultiImageSrc(urls))).toEqual(urls)
  })

  it('round-trips a single-URL payload', () => {
    expect(decodeMultiImageSrc(encodeMultiImageSrc(['/a.jpg']))).toEqual([
      '/a.jpg',
    ])
  })

  it('returns null for a plain URL (legacy single-image edits)', () => {
    expect(decodeMultiImageSrc('https://cdn.example.com/hero.jpg')).toBeNull()
    expect(decodeMultiImageSrc('/api/pexels?query=cats&w=800&h=600')).toBeNull()
  })

  it('returns null for empty / undefined / malformed values', () => {
    expect(decodeMultiImageSrc('')).toBeNull()
    expect(decodeMultiImageSrc('   ')).toBeNull()
    expect(decodeMultiImageSrc(undefined)).toBeNull()
    expect(decodeMultiImageSrc(null)).toBeNull()
    expect(decodeMultiImageSrc('[not-json')).toBeNull()
    expect(decodeMultiImageSrc('[]')).toBeNull()
    expect(decodeMultiImageSrc('[1, 2]')).toBeNull()
    expect(decodeMultiImageSrc('["ok", ""]')).toBeNull()
    expect(decodeMultiImageSrc('{"a": 1}')).toBeNull()
  })

  it('firstImageSrc resolves the first URL of a payload and passes plain URLs through', () => {
    expect(firstImageSrc(encodeMultiImageSrc(['/a.jpg', '/b.jpg']))).toBe(
      '/a.jpg',
    )
    expect(firstImageSrc('/plain.jpg')).toBe('/plain.jpg')
  })
})
