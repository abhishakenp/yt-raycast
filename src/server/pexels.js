import { PEXELS_API_KEY } from '../config.js'

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search'
const DEFAULT_QUERY = 'editorial website photography'
const MAX_DIMENSION = 2400
const MIN_DIMENSION = 120

const slugify = (value) =>
  String(value || DEFAULT_QUERY)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'image'

const clampDimension = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ''), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, parsed))
}

const orientationForDimensions = (w, h) => {
  if (w === h) return 'square'
  return w > h ? 'landscape' : 'portrait'
}

export const normalizePexelsQuery = (query) => {
  const normalized = String(query || '')
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
  return normalized || DEFAULT_QUERY
}

const sizedPexelsUrl = (src, w, h) => {
  const url = new URL(src)
  url.searchParams.set('auto', 'compress')
  url.searchParams.set('cs', 'tinysrgb')
  url.searchParams.set('w', String(w))
  url.searchParams.set('h', String(h))
  url.searchParams.set('fit', 'crop')
  return url.toString()
}

const fallbackResult = ({ query, w, h, reason }) => ({
  ok: false,
  provider: 'picsum',
  reason,
  url: `https://picsum.photos/seed/${slugify(query)}/${w}/${h}`,
  alt: normalizePexelsQuery(query),
})

export const createPexelsPhotoResolver = ({ apiKey = PEXELS_API_KEY, fetchImpl = fetch } = {}) => {
  const cache = new Map()

  return async ({ query, w = 800, h = 600 } = {}) => {
    const width = clampDimension(w, 800)
    const height = clampDimension(h, 600)
    const normalizedQuery = normalizePexelsQuery(query)
    const cacheKey = `${normalizedQuery}\0${width}\0${height}`
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    if (!apiKey) {
      const fallback = fallbackResult({
        query: normalizedQuery,
        w: width,
        h: height,
        reason: 'PEXELS_API_KEY is not configured',
      })
      cache.set(cacheKey, fallback)
      return fallback
    }

    try {
      const url = new URL(PEXELS_SEARCH_URL)
      url.searchParams.set('query', normalizedQuery)
      url.searchParams.set('orientation', orientationForDimensions(width, height))
      url.searchParams.set('per_page', '1')

      const response = await fetchImpl(url, {
        headers: { Authorization: apiKey },
      })
      if (!response.ok) {
        throw new Error(`Pexels responded ${response.status}`)
      }

      const payload = await response.json()
      const photo = Array.isArray(payload?.photos) ? payload.photos[0] : null
      const src =
        photo?.src?.landscape ||
        photo?.src?.large2x ||
        photo?.src?.large ||
        photo?.src?.original ||
        ''
      if (!src) throw new Error('Pexels returned no usable photo')

      const result = {
        ok: true,
        provider: 'pexels',
        id: String(photo.id || ''),
        url: sizedPexelsUrl(src, width, height),
        alt: String(photo.alt || normalizedQuery),
        photographer: String(photo.photographer || ''),
        photographerUrl: String(photo.photographer_url || ''),
        photoUrl: String(photo.url || ''),
      }
      cache.set(cacheKey, result)
      return result
    } catch (error) {
      const fallback = fallbackResult({
        query: normalizedQuery,
        w: width,
        h: height,
        reason: error?.message || 'Pexels fetch failed',
      })
      cache.set(cacheKey, fallback)
      return fallback
    }
  }
}

export const pexelsPhotoResolver = createPexelsPhotoResolver()

export const pexelsImageHandler = async (req, res) => {
  const result = await pexelsPhotoResolver({
    query: req.query?.query,
    w: req.query?.w,
    h: req.query?.h,
  })
  res.set('Cache-Control', result.ok ? 'public, max-age=86400' : 'private, max-age=300')
  res.json(result)
}
