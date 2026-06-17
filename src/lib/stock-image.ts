import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from "./image-query"
import { generateContextAwareQuery, type ImageContext } from "./image-context"

type ResolveInput = {
  alt?: string
  query?: string
  w?: number
  h?: number
  context?: ImageContext
}

type ResolveResult = {
  imageUrl: string
  source: "pexels" | "unsplash" | "picsum"
  query: string
}

const cache = new Map<string, ResolveResult>()

const cacheKey = (query: string, w: number, h: number) => `${query}|${w}x${h}`

const pickBySeed = <T>(items: T[], seed: string): T | undefined => {
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

const searchPexels = async (
  query: string,
  w: number,
  h: number,
  seed: string,
  apiKey: string,
): Promise<string | null> => {
  const orientation = orientationFromSize(w, h)
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=${orientation}`,
    { headers: { Authorization: apiKey } },
  )
  if (!response.ok) return null

  const data = (await response.json()) as PexelsResponse
  const photo = pickBySeed(data.photos ?? [], seed)
  if (!photo) return null

  if (w > 1200 || h > 1200) return photo.src.original
  if (w > 800 || h > 800) return photo.src.large2x
  if (w > 400 || h > 400) return photo.src.large
  return photo.src.medium
}

const unsplashSizeParam = (w: number, h: number): string => {
  const targetW = Math.min(Math.max(w, 400), 2400)
  const targetH = Math.min(Math.max(h, 300), 1600)
  return `&w=${targetW}&h=${targetH}&fit=crop`
}

const searchUnsplash = async (
  query: string,
  w: number,
  h: number,
  seed: string,
  accessKey: string,
): Promise<string | null> => {
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

export const resolveStockImage = async ({
  alt,
  query,
  w = 800,
  h = 600,
  context,
}: ResolveInput): Promise<ResolveResult> => {
  const seed = (alt ?? query ?? "image").trim() || "image"

  // Use context-aware query generation if context is provided, otherwise fall back to simple query
  let resolvedQuery: string
  if (context && (context.section || context.siteType || context.prompt || context.brandContext)) {
    resolvedQuery = generateContextAwareQuery(alt || query || "image", context)
  } else {
    resolvedQuery = (query?.trim() || searchQueryFromAlt(seed)).trim() || "nature"
  }

  const key = cacheKey(resolvedQuery, w, h)

  const cached = cache.get(key)
  if (cached) return cached

  const pexelsKey = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API_KEY || import.meta.env.VITE_PEXELS_API_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY || import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  if (pexelsKey) {
    try {
      const imageUrl = await searchPexels(resolvedQuery, w, h, seed, pexelsKey)
      if (imageUrl) {
        const result: ResolveResult = {
          imageUrl,
          source: "pexels",
          query: resolvedQuery,
        }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error("Pexels API error:", error)
    }
  }

  if (unsplashKey) {
    try {
      const imageUrl = await searchUnsplash(resolvedQuery, w, h, seed, unsplashKey)
      if (imageUrl) {
        const result: ResolveResult = {
          imageUrl,
          source: "unsplash",
          query: resolvedQuery,
        }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error("Unsplash API error:", error)
    }
  }

  if (!pexelsKey && !unsplashKey) {
    console.warn(
      "No stock image API keys configured (VITE_PEXELS_API_KEY / VITE_UNSPLASH_ACCESS_KEY); using picsum fallback",
    )
  }

  const fallback: ResolveResult = {
    imageUrl: picsumUrl(slugifyAlt(seed), w, h),
    source: "picsum",
    query: resolvedQuery,
  }
  cache.set(key, fallback)
  return fallback
}
