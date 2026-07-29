import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
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
import { createRuntimeConvexHttpClient } from '../../../shared/convex/http-client'

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

type PollinationsCachedImage = {
  bytes: Uint8Array
  contentType: string
}

type PreviewImageDeps = {
  env?: PreviewImageEnv
  fetch?: typeof fetch
  /** Read cached image bytes for a cacheKey (Convex storage). Defaults to the
   *  real Convex-backed implementation. Inject in tests to avoid network. */
  readCachedImage?: (
    cacheKey: string,
  ) => Promise<PollinationsCachedImage | null>
  /** Write image bytes to the Convex-storage cache. Defaults to the real
   *  Convex-backed implementation. Inject in tests to avoid network. */
  writeCachedImage?: (
    cacheKey: string,
    bytes: Uint8Array,
    contentType: string,
  ) => Promise<void>
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

export async function searchPexels(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
  deps: PreviewImageDeps,
): Promise<string | null> {
  const pexelsApiKey = readEnv(deps, 'PEXELS_API_KEY', 'VITE_PEXELS_API_KEY')
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

export async function searchUnsplash(
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
  deps: PreviewImageDeps,
): Promise<string | null> {
  const unsplashAccessKey = readEnv(
    deps,
    'UNSPLASH_ACCESS_KEY',
    'VITE_UNSPLASH_ACCESS_KEY',
  )
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

// ---------------------------------------------------------------------------
// Pollinations.ai integration
//
// Replaces the Pexels/Unsplash fetch path for the /api/pexels preview-image
// route. The query/prompt generation logic above (generateContextAwareQuery,
// resolvePexelsSearchQuery) is reused unchanged; instead of searching a stock
// provider we build a deterministic Pollinations image URL and proxy the
// returned bytes through a two-layer cache (in-memory LRU + Convex file
// storage) to avoid Pollinations' aggressive rate limits.
//
// The original Pexels/Unsplash search functions (searchPexels, searchUnsplash)
// are kept above for reference but are no longer called from the resolution
// path — the fetch calls were commented out per the provider switch.
// ---------------------------------------------------------------------------

const pollinationsMemoryCacheMaxEntries = 128
const pollinationsProviderTimeoutMs = 5_000
const pollinationsMaxDimension = 1024
const pollinationsModel = 'flux'

const pollinationsMemoryCache = new Map<string, PollinationsCachedImage>()
const pollinationsFetchRequests = new Map<
  string,
  Promise<PollinationsCachedImage>
>()

// Sticky fallback cache: once Pollinations fails for a cacheKey and we fall
// back to Pexels/Unsplash/Picsum, we remember the fallback URL so subsequent
// requests for the same key return the SAME image — not a different one from
// a retry. This prevents images from flickering between Pollinations and
// Pexels on every page load.
const fallbackUrlCache = new Map<string, string>()

export function buildPollinationsCacheKey(
  prompt: string,
  w: number,
  h: number,
  seed: number,
  model: string,
): string {
  return `${prompt}|${w}x${h}|${seed}|${model}`
}

export function buildPollinationsUrl(
  prompt: string,
  w: number,
  h: number,
  seed: number,
  model = pollinationsModel,
): string {
  const width = Math.min(w, pollinationsMaxDimension)
  const height = Math.min(h, pollinationsMaxDimension)
  const url = new URL(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
  )
  url.searchParams.set('width', String(width))
  url.searchParams.set('height', String(height))
  url.searchParams.set('seed', String(seed))
  url.searchParams.set('model', model)
  url.searchParams.set('nologo', 'true')
  url.searchParams.set('enhance', 'true')
  url.searchParams.set('referrer', 'ship-fast.ai')
  return url.toString()
}

function rememberPollinationsImage(
  cacheKey: string,
  bytes: Uint8Array,
  contentType: string,
) {
  pollinationsMemoryCache.delete(cacheKey)
  pollinationsMemoryCache.set(cacheKey, { bytes, contentType })
  while (pollinationsMemoryCache.size > pollinationsMemoryCacheMaxEntries) {
    const oldestKey = pollinationsMemoryCache.keys().next().value
    if (oldestKey === undefined) break
    pollinationsMemoryCache.delete(oldestKey)
  }
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readStorageId = (value: unknown): Id<'_storage'> | null => {
  if (!isRecord(value)) return null
  return typeof value.storageId === 'string'
    ? (value.storageId as Id<'_storage'>)
    : null
}

async function readCachedPollinationsImage(
  cacheKey: string,
): Promise<PollinationsCachedImage | null> {
  try {
    const client = createRuntimeConvexHttpClient(10_000)
    const cached = await client.query(api.pollinations_image_cache.get, {
      cacheKey,
    })
    if (cached === null) return null
    const response = await fetch(cached.url)
    if (!response.ok) return null
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      contentType: cached.contentType,
    }
  } catch {
    return null
  }
}

async function writeCachedPollinationsImage(
  cacheKey: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  try {
    const client = createRuntimeConvexHttpClient(10_000)
    const uploadUrl = await client.mutation(
      api.pollinations_image_cache.generateUploadUrl,
      {},
    )
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: new Blob([toArrayBuffer(bytes)], { type: contentType }),
    })
    if (!uploadResponse.ok) return
    const storageId = readStorageId(await uploadResponse.json())
    if (storageId === null) return
    await client.mutation(api.pollinations_image_cache.commit, {
      cacheKey,
      contentType,
      size: bytes.byteLength,
      storageId,
    })
  } catch {
    // Cache writes are an optimization; the image response remains valid.
  }
}

async function fetchPollinationsImage(
  pollinationsUrl: string,
  deps: PreviewImageDeps,
): Promise<PollinationsCachedImage> {
  const runtimeFetch = deps.fetch ?? fetch
  const init: RequestInit = {}
  Object.defineProperty(init, 'signal', {
    enumerable: false,
    value: AbortSignal.timeout(pollinationsProviderTimeoutMs),
  })
  const response = await runtimeFetch(pollinationsUrl, init)
  if (!response.ok) {
    throw new Error(`Pollinations responded ${response.status}`)
  }
  const contentType =
    response.headers.get('Content-Type')?.split(';')[0]?.trim() ||
    'image/jpeg'
  const bytes = new Uint8Array(await response.arrayBuffer())
  return { bytes, contentType }
}

/** Resolve the alt-text-derived prompt + dimensions + numeric seed for a
 *  Pollinations generation. Reuses the existing context-aware query logic. */
export function resolvePollinationsPrompt(
  parsed: URL,
  deps: PreviewImageDeps = {},
): {
  prompt: string
  width: number
  height: number
  seed: number
  cacheKey: string
} {
  const query =
    (
      parsed.searchParams.get('query') ??
      parsed.searchParams.get('q') ??
      ''
    ).trim() || 'nature'
  const seedParam = parsed.searchParams.get('seed')
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
      : resolvePexelsSearchQuery(asciiQuery, seedParam)
  const seedKey = seedParam ?? searchQuery
  const numericSeed = seedFromAlt(seedKey)
  const cacheKey = buildPollinationsCacheKey(
    searchQuery,
    width,
    height,
    numericSeed,
    pollinationsModel,
  )
  void deps
  return { prompt: searchQuery, width, height, seed: numericSeed, cacheKey }
}

/** Build the Pollinations URL for a request (kept for backwards-compatible
 *  export; the response path now proxies bytes rather than redirecting). */
export async function resolvePexelsPreviewImageUrl(
  parsed: URL,
  deps: PreviewImageDeps = {},
): Promise<string> {
  const { prompt, width, height, seed } = resolvePollinationsPrompt(
    parsed,
    deps,
  )
  return buildPollinationsUrl(prompt, width, height, seed)
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

function createImageResponse(
  bytes: Uint8Array,
  contentType: string,
): Response {
  return new Response(toArrayBuffer(bytes), {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
      'X-Image-Source': 'pollinations',
      'X-Robots-Tag': 'noindex',
    },
  })
}

export async function createPexelsPreviewImageResponse(
  request: Request,
  deps: PreviewImageDeps = {},
): Promise<Response> {
  const parsed = new URL(request.url)
  const { prompt, width, height, seed, cacheKey } = resolvePollinationsPrompt(
    parsed,
    deps,
  )
  const readCachedImage = deps.readCachedImage ?? readCachedPollinationsImage
  const writeCachedImage =
    deps.writeCachedImage ?? writeCachedPollinationsImage
  const seedKey = parsed.searchParams.get('seed') ?? prompt

  // 0. Sticky result cache — once we've resolved a provider for this cacheKey
  // (Pexels URL or Pollinations bytes), return the SAME result so the image
  // never flickers between providers on repeated page loads.
  const stickyUrl = fallbackUrlCache.get(cacheKey)
  if (stickyUrl !== undefined) {
    const resp = redirect(stickyUrl)
    resp.headers.set('X-Image-Source', 'sticky-fallback')
    return resp
  }
  const memoryCached = pollinationsMemoryCache.get(cacheKey)
  if (memoryCached !== undefined) {
    return createImageResponse(memoryCached.bytes, memoryCached.contentType)
  }
  const stored = await readCachedImage(cacheKey)
  if (stored !== null) {
    rememberPollinationsImage(cacheKey, stored.bytes, stored.contentType)
    return createImageResponse(stored.bytes, stored.contentType)
  }

  // 1. Pexels first — fast, not rate-limited. If Pexels has a good match,
  // cache the redirect URL and serve it.
  const pexelsUrl = await searchPexels(prompt, width, height, seedKey, deps)
  if (pexelsUrl) {
    fallbackUrlCache.set(cacheKey, pexelsUrl)
    const resp = redirect(pexelsUrl)
    resp.headers.set('X-Image-Source', 'pexels')
    return resp
  }

  // 2. No Pexels match → generate with Pollinations. Dedupe concurrent
  // requests for the same cacheKey.
  const pollinationsUrl = buildPollinationsUrl(prompt, width, height, seed)
  const pending = pollinationsFetchRequests.get(cacheKey)
  if (pending !== undefined) {
    const result = await pending
    return createImageResponse(result.bytes, result.contentType)
  }

  const capture = (async () => {
    const result = await fetchPollinationsImage(pollinationsUrl, deps)
    rememberPollinationsImage(cacheKey, result.bytes, result.contentType)
    await writeCachedImage(cacheKey, result.bytes, result.contentType)
    return result
  })().finally(() => {
    pollinationsFetchRequests.delete(cacheKey)
  })
  pollinationsFetchRequests.set(cacheKey, capture)

  try {
    const result = await capture
    return createImageResponse(result.bytes, result.contentType)
  } catch (error) {
    console.error('[pollinations] fetch failed, falling back to Unsplash/Picsum:', error)
    // 3. Pollinations failed (rate limited / down) → Unsplash, then Picsum.
    // Cached as sticky URL so it doesn't change on retry.
    const unsplashUrl = await searchUnsplash(
      prompt,
      width,
      height,
      seedKey,
      deps,
    )
    if (unsplashUrl) {
      fallbackUrlCache.set(cacheKey, unsplashUrl)
      const resp = redirect(unsplashUrl)
      resp.headers.set('X-Image-Source', 'unsplash-fallback')
      return resp
    }
    const picsum = picsumUrl(prompt, width, height)
    fallbackUrlCache.set(cacheKey, picsum)
    const resp = redirect(picsum)
    resp.headers.set('X-Image-Source', 'picsum-fallback')
    return resp
  }
}
