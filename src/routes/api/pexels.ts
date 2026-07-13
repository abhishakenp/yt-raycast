import { createFileRoute } from '@tanstack/react-router'

import { searchQueryFromAlt } from '@/lib/image-query'
import {
  generateContextAwareQuery,
  type ImageContext,
} from '@/lib/image-context'

type PexelsPhoto = {
  src?: {
    large?: string
    large2x?: string
    original?: string
    medium?: string
  }
}

type PexelsResponse = {
  photos?: PexelsPhoto[]
}

type UnsplashPhoto = {
  urls?: { raw?: string; full?: string; regular?: string; small?: string }
}
type UnsplashResponse = { results?: UnsplashPhoto[] }

const PROVIDER_TIMEOUT_MS = 8_000

function readServerEnv(key: string): string {
  return typeof process !== 'undefined'
    ? (process.env?.[key]?.trim() ?? '')
    : ''
}

function clampInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

function orientationFromSize(
  w: number,
  h: number,
): 'landscape' | 'portrait' | 'square' {
  const ratio = w / h
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

function seedIndex(seed: string, length: number) {
  if (length <= 1) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % length
}

function picsumUrl(query: string, w: number, h: number) {
  const seed =
    query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

function redirect(url: string, status = 302) {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

function choosePhotoUrl(photo: PexelsPhoto | undefined, w: number, h: number) {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200)
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  if (w > 800 || h > 800)
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  if (w > 400 || h > 400)
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  return (
    photo.src.medium ??
    photo.src.large ??
    photo.src.large2x ??
    photo.src.original ??
    null
  )
}

function providerRequestInit(authorization: string): RequestInit {
  const init: RequestInit = {
    headers: { Authorization: authorization },
  }
  Object.defineProperty(init, 'signal', {
    enumerable: false,
    value: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  })
  return init
}

function resizeUnsplashUrl(
  source: string,
  width: number,
  height: number,
): string | null {
  try {
    const url = new URL(source)
    url.searchParams.set('w', String(width))
    url.searchParams.set('h', String(height))
    url.searchParams.set('fit', 'crop')
    return url.toString()
  } catch {
    return null
  }
}

export function resolvePexelsSearchQuery(
  query: string,
  seed: string | null,
): string {
  const trimmed = query.trim() || 'nature'
  if (seed?.trim()) return trimmed.slice(0, 96)
  return searchQueryFromAlt(trimmed)
}

/**
 * Generate progressively shorter queries by dropping words from the end.
 * If the full query returns 0 results (often because it contains a
 * transliterated word the LLM failed to translate), each shorter variant
 * has a better chance of matching. Generic — no hardcoded word lists.
 *
 * "onam sarrik festive shopping" → ["onam sarrik festive shopping",
 * "onam sarrik festive", "onam sarrik", "onam"]
 */
function progressiveQueries(query: string): string[] {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [query.trim()]
  const variants: string[] = []
  for (let i = words.length; i >= 1; i--) {
    variants.push(words.slice(0, i).join(' '))
  }
  return [...new Set(variants)]
}

async function searchPexels(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> {
  const pexelsApiKey = readServerEnv('PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const orientation = orientationFromSize(w, h)

  const trySearch = async (q) => {
    const pexelsUrl = new URL('https://api.pexels.com/v1/search')
    pexelsUrl.searchParams.set('query', q.slice(0, 96))
    pexelsUrl.searchParams.set('per_page', '15')
    pexelsUrl.searchParams.set('orientation', orientation)
    try {
      const response = await fetch(pexelsUrl, providerRequestInit(pexelsApiKey))
      if (!response.ok) return null
      const data = (await response.json()) as PexelsResponse
      return data.photos ?? []
    } catch {
      return null
    }
  }

  // Try the full query first, then progressively shorter variants.
  // This handles transliterated words the LLM failed to translate —
  // dropping them gives Pexels a cleaner English query to match.
  // On provider errors (null) we stop retrying variants and fall through
  // to the next provider; only empty result sets ([]) warrant a shorter
  // query, since the provider is reachable but the full query didn't match.
  for (const variant of progressiveQueries(searchQuery)) {
    const photos = await trySearch(variant)
    if (photos === null) break
    if (photos.length > 0) {
      const usableUrls = photos
        .map((photo) => choosePhotoUrl(photo, w, h))
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        )
      if (usableUrls.length > 0) {
        return usableUrls[seedIndex(seed, usableUrls.length)]
      }
    }
  }
  return null
}

async function searchUnsplash(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> {
  const unsplashAccessKey = readServerEnv('UNSPLASH_ACCESS_KEY')
  if (!unsplashAccessKey) return null
  const orientation = orientationFromSize(w, h)

  const trySearch = async (q) => {
    const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
    unsplashUrl.searchParams.set('query', q.slice(0, 96))
    unsplashUrl.searchParams.set('per_page', '15')
    unsplashUrl.searchParams.set('orientation', orientation)
    try {
      const response = await fetch(
        unsplashUrl,
        providerRequestInit(`Client-ID ${unsplashAccessKey}`),
      )
      if (!response.ok) return null
      const data = (await response.json()) as UnsplashResponse
      return data.results ?? []
    } catch {
      return null
    }
  }

  for (const variant of progressiveQueries(searchQuery)) {
    const results = await trySearch(variant)
    if (results === null) break
    if (results && results.length > 0) {
      const usableUrls = results
        .map(
          (photo) =>
            photo.urls?.regular ??
            photo.urls?.small ??
            photo.urls?.full ??
            photo.urls?.raw,
        )
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        )
      if (usableUrls.length === 0) continue
      const base = usableUrls[seedIndex(seed, usableUrls.length)]
      const targetW = Math.min(Math.max(w, 400), 2400)
      const targetH = Math.min(Math.max(h, 300), 1600)
      return resizeUnsplashUrl(base, targetW, targetH)
    }
  }
  return null
}

export const Route = createFileRoute('/api/pexels')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const query =
          (
            url.searchParams.get('query') ??
            url.searchParams.get('q') ??
            ''
          ).trim() || 'nature'
        const seed = url.searchParams.get('seed')
        const w = clampInt(url.searchParams.get('w'), 800, 100, 2400)
        const h = clampInt(url.searchParams.get('h'), 600, 100, 2400)

        // Extract context parameters
        const context: ImageContext = {
          section: url.searchParams.get('section') || undefined,
          siteType:
            (url.searchParams.get('siteType') as ImageContext['siteType']) ||
            undefined,
          prompt: url.searchParams.get('prompt') || undefined,
          brandContext: url.searchParams.get('brandContext') || undefined,
        }

        // Strip non-ASCII characters (e.g. Malayalam Unicode in alt text that
        // the LLM failed to write in English). Pexels/Unsplash index in English.
        const asciiQuery =
          query
            .replace(/[^\x20-\x7E]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim() || 'nature'

        // Use context-aware query generation if context is provided
        let searchQuery: string
        if (
          context.section ||
          context.siteType ||
          context.prompt ||
          context.brandContext
        ) {
          searchQuery = generateContextAwareQuery(asciiQuery, context)
        } else {
          searchQuery = resolvePexelsSearchQuery(asciiQuery, seed)
        }

        const fallback = picsumUrl(seed || searchQuery, w, h)
        const seedKey = seed ?? searchQuery

        const photoUrl =
          (await searchPexels(searchQuery, w, h, seedKey)) ??
          (await searchUnsplash(searchQuery, w, h, seedKey))

        return redirect(photoUrl ?? fallback)
      },
    },
  },
})
