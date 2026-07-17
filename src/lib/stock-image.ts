import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from './image-query'
import { generateContextAwareQuery, type ImageContext } from './image-context'

type ResolveInput = {
  alt?: string
  query?: string
  w?: number
  h?: number
  context?: ImageContext
}

type ResolveResult = {
  imageUrl: string
  source: 'pexels' | 'unsplash' | 'picsum'
  query: string
}

const cache = new Map<string, ResolveResult>()

function cacheKey(query: string, w: number, h: number) {
  return `${query}|${w}x${h}`
}

function pickBySeed<T>(items: T[], seed: string): T | undefined {
  if (!items.length) return undefined
  return items[seedFromAlt(seed) % items.length]
}

interface PexelsPhoto {
  src: {
    large: string
    large2x: string
    original: string
    medium: string
  }
}

interface PexelsResponse {
  photos: PexelsPhoto[]
}

interface UnsplashPhoto {
  urls: {
    raw: string
    full: string
    regular: string
    small: string
  }
}

interface UnsplashResponse {
  results: UnsplashPhoto[]
}

function pexelsPhotoUrl(photo: PexelsPhoto, w: number, h: number): string {
  if (w > 1200 || h > 1200) return photo.src.original
  if (w > 800 || h > 800) return photo.src.large2x
  if (w > 400 || h > 400) return photo.src.large
  return photo.src.medium
}

async function searchPexels(
  query: string,
  w: number,
  h: number,
  seed: string,
  apiKey: string,
): Promise<string | null> {
  const orientation = orientationFromSize(w, h)
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=${orientation}`,
    { headers: { Authorization: apiKey } },
  )
  if (!response.ok) return null

  const data = (await response.json()) as PexelsResponse
  const photo = pickBySeed(data.photos ?? [], seed)
  if (!photo) return null

  return pexelsPhotoUrl(photo, w, h)
}

function unsplashSizeParam(w: number, h: number): string {
  const targetW = Math.min(Math.max(w, 400), 2400)
  const targetH = Math.min(Math.max(h, 300), 1600)
  return `&w=${targetW}&h=${targetH}&fit=crop`
}

async function searchUnsplash(
  query: string,
  w: number,
  h: number,
  seed: string,
  accessKey: string,
): Promise<string | null> {
  const orientation = orientationFromSize(w, h)
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=${orientation}`,
    { headers: { Authorization: `Client-ID ${accessKey}` } },
  )
  if (!response.ok) return null

  const data = (await response.json()) as UnsplashResponse
  const photo = pickBySeed(data.results ?? [], seed)
  if (!photo) return null

  const base = photo.urls.regular || photo.urls.small || photo.urls.full
  return `${base}${unsplashSizeParam(w, h)}`
}

export type StockImageResult = {
  imageUrl: string
  source: 'pexels' | 'unsplash' | 'picsum'
  query: string
  /**
   * Highest-fidelity source URL for this image, used to derive higher
   * resolution variants when the image is applied (e.g. as a section
   * background) instead of the small grid thumbnail in `imageUrl`.
   * Optional so callers/tests that build results with only a thumbnail
   * still type-check; the URL builder falls back to `imageUrl` when absent.
   */
  baseUrl?: string
}

/** Selectable output quality when applying a stock image as a background. */
export type BackgroundImageResolution = 'standard' | 'high' | 'max'

/** Target pixel dimensions for the capped tiers (3:2 landscape). `max` is
 *  intentionally omitted — it means "the provider's native original, no
 *  downscaling", which has no fixed dimensions. */
export const BACKGROUND_RESOLUTION_DIMENSIONS: Record<
  Exclude<BackgroundImageResolution, 'max'>,
  { w: number; h: number }
> = {
  standard: { w: 1280, h: 853 },
  high: { w: 1920, h: 1280 },
}

function stripQuery(url: string): string {
  return url.split('?')[0]
}

/**
 * Build a high-resolution URL for a stock image at the requested quality
 * tier. Grid thumbnails stay small (fast) via `imageUrl`; this derives a
 * crisp full-size URL from the provider's original/raw source at apply time.
 *
 * `max` returns the provider's **native original** with no width/height cap —
 * the highest resolution available (light lossless compression only) — for
 * full-bleed heroes and retina displays. Falls back to the thumbnail when no
 * hi-res source URL is available.
 */
export function buildBackgroundImageUrl(
  result: StockImageResult,
  resolution: BackgroundImageResolution,
): string {
  const base = result.baseUrl
  if (!base) return result.imageUrl
  if (resolution === 'max') {
    switch (result.source) {
      case 'unsplash':
        // `raw` is the full-resolution imgix master; format only, no resize.
        return `${stripQuery(base)}?q=90&auto=format`
      case 'pexels':
        // `original` is the native full-resolution file; compress only.
        return `${stripQuery(base)}?auto=compress&cs=tinysrgb`
      case 'picsum':
        // Picsum has no true original; request a very large 4K frame.
        return `${stripQuery(base)}/3840/2160`
    }
  }
  const { w, h } = BACKGROUND_RESOLUTION_DIMENSIONS[resolution]
  const q = resolution === 'high' ? 85 : 80
  switch (result.source) {
    case 'unsplash':
      return `${stripQuery(base)}?w=${w}&h=${h}&fit=crop&q=${q}&auto=format`
    case 'pexels':
      return `${stripQuery(base)}?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`
    case 'picsum':
      return `${stripQuery(base)}/${w}/${h}`
  }
}

/** Search both Pexels and Unsplash for multiple images at once, merged and
 *  shuffled together. Supports pagination via `page`. Returns up to
 *  `perPage` results per call (split across both providers). */
export async function searchStockImages({
  query,
  w = 400,
  h = 300,
  page = 1,
  perPage = 10,
}: {
  query: string
  w?: number
  h?: number
  page?: number
  perPage?: number
}): Promise<StockImageResult[]> {
  if (!query.trim()) return []

  const orientation = orientationFromSize(w, h)
  const pexelsKey =
    process.env.PEXELS_API_KEY ||
    process.env.VITE_PEXELS_API_KEY ||
    import.meta.env.VITE_PEXELS_API_KEY
  const unsplashKey =
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.VITE_UNSPLASH_ACCESS_KEY ||
    import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  // Split perPage across both providers, requesting a bit more to account
  // for failures. Each provider gets at least 1 slot.
  const half = Math.max(1, Math.ceil(perPage / 2))
  const fetchCount = half + 2 // over-fetch slightly for resilience

  const results: StockImageResult[] = []

  const [pexelsResults, unsplashResults] = await Promise.allSettled([
    pexelsKey
      ? (async () => {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${fetchCount}&orientation=${orientation}&page=${page}`,
            { headers: { Authorization: pexelsKey } },
          )
          if (!res.ok) return []
          try {
            const data = (await res.json()) as PexelsResponse
            return (data.photos ?? []).slice(0, half).map((photo) => ({
              imageUrl: pexelsPhotoUrl(photo, w, h),
              source: 'pexels' as const,
              query,
              baseUrl: photo.src.original,
            }))
          } catch {
            return [] as StockImageResult[]
          }
        })()
      : Promise.resolve([] as StockImageResult[]),
    unsplashKey
      ? (async () => {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${fetchCount}&orientation=${orientation}&page=${page}`,
            { headers: { Authorization: `Client-ID ${unsplashKey}` } },
          )
          if (!res.ok) return []
          try {
            const data = (await res.json()) as UnsplashResponse
            return (data.results ?? []).slice(0, half).map((photo) => ({
              imageUrl: `${photo.urls.regular || photo.urls.small || photo.urls.full}${unsplashSizeParam(w, h)}`,
              source: 'unsplash' as const,
              query,
              baseUrl: photo.urls.raw || photo.urls.full || photo.urls.regular,
            }))
          } catch {
            return [] as StockImageResult[]
          }
        })()
      : Promise.resolve([] as StockImageResult[]),
  ])

  if (pexelsResults.status === 'fulfilled') results.push(...pexelsResults.value)
  if (unsplashResults.status === 'fulfilled')
    results.push(...unsplashResults.value)

  // Interleave pexels + unsplash results so the grid isn't segregated
  const interleaved: StockImageResult[] = []
  const maxLen = Math.max(
    pexelsResults.status === 'fulfilled' ? pexelsResults.value.length : 0,
    unsplashResults.status === 'fulfilled' ? unsplashResults.value.length : 0,
  )
  for (let i = 0; i < maxLen; i++) {
    if (pexelsResults.status === 'fulfilled' && pexelsResults.value[i])
      interleaved.push(pexelsResults.value[i])
    if (unsplashResults.status === 'fulfilled' && unsplashResults.value[i])
      interleaved.push(unsplashResults.value[i])
  }

  // If no API keys, or all configured providers returned no usable results
  // (e.g. malformed HTML instead of JSON), fall back to picsum with
  // deterministic seeds per page. The seed uses the full slugified query
  // (no truncation) so each query/page/index combination is unique.
  const fullSlug = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'image'

  const picsumFallback = () =>
    Array.from({ length: perPage }, (_, i) => {
      const seed = `${fullSlug(query)}-${page}-${i}`
      return {
        imageUrl: `https://picsum.photos/seed/${seed}/${w}/${h}`,
        source: 'picsum' as const,
        query,
        baseUrl: `https://picsum.photos/seed/${seed}`,
      }
    })

  if (!pexelsKey && !unsplashKey) {
    return picsumFallback()
  }

  if (interleaved.length === 0) {
    return picsumFallback()
  }

  return interleaved.slice(0, perPage)
}

export async function resolveStockImage({
  alt,
  query,
  w = 800,
  h = 600,
  context,
}: ResolveInput): Promise<ResolveResult> {
  const seed = (alt ?? query ?? 'image').trim() || 'image'

  // Use context-aware query generation if context is provided, otherwise fall back to simple query
  let resolvedQuery: string
  if (
    context &&
    (context.section ||
      context.siteType ||
      context.prompt ||
      context.brandContext)
  ) {
    resolvedQuery = generateContextAwareQuery(alt || query || 'image', context)
  } else {
    resolvedQuery =
      (query?.trim() || searchQueryFromAlt(seed)).trim() || 'nature'
  }

  const key = cacheKey(resolvedQuery, w, h)

  const cached = cache.get(key)
  if (cached) return cached

  const pexelsKey =
    process.env.PEXELS_API_KEY ||
    process.env.VITE_PEXELS_API_KEY ||
    import.meta.env.VITE_PEXELS_API_KEY
  const unsplashKey =
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.VITE_UNSPLASH_ACCESS_KEY ||
    import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  if (pexelsKey) {
    try {
      const imageUrl = await searchPexels(resolvedQuery, w, h, seed, pexelsKey)
      if (imageUrl) {
        const result: ResolveResult = {
          imageUrl,
          source: 'pexels',
          query: resolvedQuery,
        }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error('Pexels API error:', error)
    }
  }

  if (unsplashKey) {
    try {
      const imageUrl = await searchUnsplash(
        resolvedQuery,
        w,
        h,
        seed,
        unsplashKey,
      )
      if (imageUrl) {
        const result: ResolveResult = {
          imageUrl,
          source: 'unsplash',
          query: resolvedQuery,
        }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error('Unsplash API error:', error)
    }
  }

  if (!pexelsKey && !unsplashKey) {
    console.warn(
      'No stock image API keys configured (PEXELS_API_KEY / VITE_PEXELS_API_KEY / UNSPLASH_ACCESS_KEY / VITE_UNSPLASH_ACCESS_KEY); using picsum fallback',
    )
  }

  const fallback: ResolveResult = {
    imageUrl: picsumUrl(slugifyAlt(seed), w, h),
    source: 'picsum',
    query: resolvedQuery,
  }
  cache.set(key, fallback)
  return fallback
}
