import {
  generateContextAwareQuery,
  type ImageContext,
} from '../../../lib/image-context'
import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
} from '../../../lib/image-query'

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

type PreviewImageEnv = Record<string, string | undefined>

type PreviewImageDeps = {
  env?: PreviewImageEnv
  fetch?: typeof fetch
}

const providerTimeoutMs = 8_000

function readRuntimeEnv(): PreviewImageEnv {
  return typeof process === 'undefined' ? {} : process.env
}

function readEnv(deps: PreviewImageDeps, ...keys: string[]): string {
  const env = deps.env ?? readRuntimeEnv()
  for (const key of keys) {
    const value = env[key]?.trim()
    if (value) return value
  }
  return ''
}

function readImageDimension(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

function choosePexelsPhotoUrl(
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
) {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200) {
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  }
  if (w > 800 || h > 800) {
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  }
  if (w > 400 || h > 400) {
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  }
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
    value: AbortSignal.timeout(providerTimeoutMs),
  })
  return init
}

export function resolvePexelsSearchQuery(
  query: string,
  seed: string | null,
): string {
  const trimmed = query.trim() || 'nature'
  if (seed?.trim()) return trimmed.slice(0, 96)
  return searchQueryFromAlt(trimmed)
}

function progressiveQueries(query: string): string[] {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [query.trim()]
  const variants: string[] = []
  for (let index = words.length; index >= 1; index -= 1) {
    variants.push(words.slice(0, index).join(' '))
  }
  return [...new Set(variants)]
}

async function searchPexels(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
  deps: PreviewImageDeps,
): Promise<string | null> {
  const pexelsApiKey = readEnv(deps, 'PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const orientation = orientationFromSize(w, h)
  const runtimeFetch = deps.fetch ?? fetch

  const trySearch = async (query: string) => {
    const pexelsUrl = new URL('https://api.pexels.com/v1/search')
    pexelsUrl.searchParams.set('query', query.slice(0, 96))
    pexelsUrl.searchParams.set('per_page', '15')
    pexelsUrl.searchParams.set('orientation', orientation)
    try {
      const response = await runtimeFetch(
        pexelsUrl,
        providerRequestInit(pexelsApiKey),
      )
      if (!response.ok) return null
      const data = (await response.json()) as PexelsResponse
      return data.photos ?? []
    } catch {
      return null
    }
  }

  for (const variant of progressiveQueries(searchQuery)) {
    const photos = await trySearch(variant)
    if (photos === null) break
    if (photos.length === 0) continue
    const usableUrls = photos
      .map((photo) => choosePexelsPhotoUrl(photo, w, h))
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
    if (usableUrls.length > 0) {
      return usableUrls[seedFromAlt(seed) % usableUrls.length]
    }
  }
  return null
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

async function searchUnsplash(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
  deps: PreviewImageDeps,
): Promise<string | null> {
  const unsplashAccessKey = readEnv(deps, 'UNSPLASH_ACCESS_KEY')
  if (!unsplashAccessKey) return null
  const orientation = orientationFromSize(w, h)
  const runtimeFetch = deps.fetch ?? fetch

  const trySearch = async (query: string) => {
    const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
    unsplashUrl.searchParams.set('query', query.slice(0, 96))
    unsplashUrl.searchParams.set('per_page', '15')
    unsplashUrl.searchParams.set('orientation', orientation)
    try {
      const response = await runtimeFetch(
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
    if (results.length === 0) continue
    const usableUrls = results
      .map(
        (photo) =>
          photo.urls?.regular ??
          photo.urls?.small ??
          photo.urls?.full ??
          photo.urls?.raw,
      )
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
    if (usableUrls.length === 0) continue
    const base = usableUrls[seedFromAlt(seed) % usableUrls.length]
    const targetW = Math.min(Math.max(w, 400), 2400)
    const targetH = Math.min(Math.max(h, 300), 1600)
    return resizeUnsplashUrl(base, targetW, targetH)
  }
  return null
}

export async function resolvePexelsPreviewImageUrl(
  parsed: URL,
  deps: PreviewImageDeps = {},
): Promise<string> {
  const query =
    (
      parsed.searchParams.get('query') ??
      parsed.searchParams.get('q') ??
      ''
    ).trim() || 'nature'
  const seed = parsed.searchParams.get('seed')
  const width = readImageDimension(parsed.searchParams.get('w'), 800, 100, 2400)
  const height = readImageDimension(
    parsed.searchParams.get('h'),
    600,
    100,
    2400,
  )
  const context: ImageContext = {
    section: parsed.searchParams.get('section') || undefined,
    siteType:
      (parsed.searchParams.get('siteType') as ImageContext['siteType']) ||
      undefined,
    prompt: parsed.searchParams.get('prompt') || undefined,
    brandContext: parsed.searchParams.get('brandContext') || undefined,
  }
  const asciiQuery =
    query
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'nature'
  const searchQuery =
    context.section ||
    context.siteType ||
    context.prompt ||
    context.brandContext
      ? generateContextAwareQuery(asciiQuery, context)
      : resolvePexelsSearchQuery(asciiQuery, seed)
  const fallback = picsumUrl(seed || searchQuery, width, height)
  const seedKey = seed ?? searchQuery

  const resolved =
    (await searchPexels(searchQuery, width, height, seedKey, deps)) ??
    (await searchUnsplash(searchQuery, width, height, seedKey, deps)) ??
    fallback
  return resolved
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

export async function createPexelsPreviewImageResponse(
  request: Request,
  deps: PreviewImageDeps = {},
): Promise<Response> {
  const url = await resolvePexelsPreviewImageUrl(new URL(request.url), deps)
  return redirect(url)
}
