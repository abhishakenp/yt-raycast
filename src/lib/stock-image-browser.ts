import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from "./image-query"

const cache = new Map<string, { imageUrl: string; source: "pexels" | "unsplash" | "picsum"; query: string }>()

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
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=${orientation}&limit=1`,
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
}: {
  alt?: string
  query?: string
  w?: number
  h?: number
}): Promise<{ imageUrl: string; source: "pexels" | "unsplash" | "picsum"; query: string }> => {
  const seed = (alt ?? query ?? "image").trim() || "image"
  const resolvedQuery = (query?.trim() || searchQueryFromAlt(seed)).trim() || "nature"
  const key = cacheKey(resolvedQuery, w, h)

  const cached = cache.get(key)
  if (cached) return cached

  const pexelsKey = (import.meta as any).env?.VITE_PEXELS_API_KEY as string | undefined
  const unsplashKey = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY as string | undefined

  if (pexelsKey) {
    try {
      const imageUrl = await searchPexels(resolvedQuery, w, h, seed, pexelsKey)
      if (imageUrl) {
        const result = { imageUrl, source: "pexels" as const, query: resolvedQuery }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error("[stock-image-browser] Pexels error:", error)
    }
  }

  if (unsplashKey) {
    try {
      const imageUrl = await searchUnsplash(resolvedQuery, w, h, seed, unsplashKey)
      if (imageUrl) {
        const result = { imageUrl, source: "unsplash" as const, query: resolvedQuery }
        cache.set(key, result)
        return result
      }
    } catch (error) {
      console.error("[stock-image-browser] Unsplash error:", error)
    }
  }

  if (!pexelsKey && !unsplashKey) {
    console.warn("[stock-image-browser] No VITE_PEXELS_API_KEY or VITE_UNSPLASH_ACCESS_KEY configured")
  } else {
    console.warn("[stock-image-browser] Both APIs returned no results for query:", resolvedQuery)
  }

  const fallback = {
    imageUrl: picsumUrl(slugifyAlt(seed), w, h),
    source: "picsum" as const,
    query: resolvedQuery,
  }
  cache.set(key, fallback)
  return fallback
}
