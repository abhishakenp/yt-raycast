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

const readServerEnv = (key: string): string =>
  typeof process !== 'undefined' ? (process.env?.[key]?.trim() ?? '') : ''

const clampInt = (
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

const orientationFromSize = (
  w: number,
  h: number,
): 'landscape' | 'portrait' | 'square' => {
  const ratio = w / h
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

const seedIndex = (seed: string, length: number) => {
  if (length <= 1) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % length
}

const picsumUrl = (query: string, w: number, h: number) => {
  const seed =
    query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

const redirect = (url: string, status = 302) =>
  new Response(null, {
    status,
    headers: {
      Location: url,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })

const choosePhotoUrl = (
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
) => {
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

export const resolvePexelsSearchQuery = (
  query: string,
  seed: string | null,
): string => {
  const trimmed = query.trim() || 'nature'
  if (seed?.trim()) return trimmed.slice(0, 96)
  return searchQueryFromAlt(trimmed)
}

const searchPexels = async (
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> => {
  const pexelsApiKey = readServerEnv('PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const pexelsUrl = new URL('https://api.pexels.com/v1/search')
  pexelsUrl.searchParams.set('query', searchQuery.slice(0, 96))
  pexelsUrl.searchParams.set('per_page', '15')
  pexelsUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(pexelsUrl, {
      headers: { Authorization: pexelsApiKey },
    })
    if (!response.ok) return null
    const data = (await response.json()) as PexelsResponse
    const photos = data.photos ?? []
    if (!photos.length) return null
    return choosePhotoUrl(photos[seedIndex(seed, photos.length)], w, h)
  } catch {
    return null
  }
}

const searchUnsplash = async (
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> => {
  const unsplashAccessKey = readServerEnv('UNSPLASH_ACCESS_KEY')
  if (!unsplashAccessKey) return null
  const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
  unsplashUrl.searchParams.set('query', searchQuery.slice(0, 96))
  unsplashUrl.searchParams.set('per_page', '15')
  unsplashUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(unsplashUrl, {
      headers: { Authorization: `Client-ID ${unsplashAccessKey}` },
    })
    if (!response.ok) return null
    const data = (await response.json()) as UnsplashResponse
    const results = data.results ?? []
    if (!results.length) return null
    const photo = results[seedIndex(seed, results.length)]
    const base =
      photo?.urls?.regular ??
      photo?.urls?.small ??
      photo?.urls?.full ??
      photo?.urls?.raw
    if (!base) return null
    const targetW = Math.min(Math.max(w, 400), 2400)
    const targetH = Math.min(Math.max(h, 300), 1600)
    return `${base}&w=${targetW}&h=${targetH}&fit=crop`
  } catch {
    return null
  }
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

        // Use context-aware query generation if context is provided
        let searchQuery: string
        if (
          context.section ||
          context.siteType ||
          context.prompt ||
          context.brandContext
        ) {
          searchQuery = generateContextAwareQuery(query, context)
        } else {
          searchQuery = resolvePexelsSearchQuery(query, seed)
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
