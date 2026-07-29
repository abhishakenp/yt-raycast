import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '../../../shared/convex/http-client'
import { generateGalleryPreviewImage } from './gallery-preview-image-generation'

const versionedPreviewImageCacheControl = 'public, max-age=31536000, immutable'
const previewPngMemoryCacheMaxEntries = 64
type PreviewPngCacheEntry = {
  bytes: Uint8Array
  cacheVersion: string
}
const previewPngMemoryCache = new Map<string, PreviewPngCacheEntry>()

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

export type GalleryPreviewImageResponseDeps = {
  cacheVersion?: string | null
  /**
   * Generates a preview image on cache miss. The GET handler triggers this
   * so the request resolves with the ready PNG instead of returning 425.
   * Defaults to `generateGalleryPreviewImage` in public mode.
   */
  generateImage?: (
    sessionId: string,
    cacheVersion: string,
  ) => Promise<{
    status: 'stored' | 'stale' | 'not_found' | 'forbidden' | 'failed'
  }>
  readCachedPng?: (
    cacheKey: string,
    cacheVersion: string,
  ) => Promise<Uint8Array | null>
}

const normalizeCacheVersion = (value: string | null | undefined) => {
  const normalized = value?.trim()
  if (!normalized) return null
  return /^[A-Za-z0-9._~-]{1,80}$/.test(normalized) ? normalized : null
}

const getCacheKey = (sessionId: string, cacheVersion?: string | null) => {
  const normalizedVersion = normalizeCacheVersion(cacheVersion)
  return normalizedVersion === null ? null : sessionId
}

const rememberPreviewPng = (
  cacheKey: string,
  cacheVersion: string,
  bytes: Uint8Array,
) => {
  previewPngMemoryCache.delete(cacheKey)
  previewPngMemoryCache.set(cacheKey, { bytes, cacheVersion })

  while (previewPngMemoryCache.size > previewPngMemoryCacheMaxEntries) {
    const oldestKey = previewPngMemoryCache.keys().next().value
    if (oldestKey === undefined) break
    previewPngMemoryCache.delete(oldestKey)
  }
}

const readCachedPreviewPng = async (
  cacheKey: string,
  cacheVersion: string,
): Promise<Uint8Array | null> => {
  try {
    const client = createRuntimeConvexHttpClient(10_000)
    const cached = await client.query(api.gallery_preview_images.get, {
      cacheVersion,
      sessionId: cacheKey as Id<'sessions'>,
    })
    if (cached === null) return null

    const response = await fetch(cached.url)
    if (!response.ok) return null

    return new Uint8Array(await response.arrayBuffer())
  } catch {
    return null
  }
}

const createPngResponse = (png: Uint8Array): Response =>
  new Response(toArrayBuffer(png), {
    status: 200,
    headers: {
      'Cache-Control': versionedPreviewImageCacheControl,
      'Content-Type': 'image/png',
      'X-Robots-Tag': 'noindex',
    },
  })

const readCachedPng = async (
  cacheKey: string,
  cacheVersion: string,
  deps: GalleryPreviewImageResponseDeps,
) => {
  const memoryCached = previewPngMemoryCache.get(cacheKey)
  if (
    memoryCached !== undefined &&
    memoryCached.cacheVersion === cacheVersion
  ) {
    rememberPreviewPng(cacheKey, cacheVersion, memoryCached.bytes)
    return memoryCached.bytes
  }
  const cached = await (deps.readCachedPng ?? readCachedPreviewPng)(
    cacheKey,
    cacheVersion,
  )
  if (cached !== null) rememberPreviewPng(cacheKey, cacheVersion, cached)
  return cached
}

const defaultGenerateImage = (
  sessionId: string,
  cacheVersion: string,
): Promise<{
  status: 'stored' | 'stale' | 'not_found' | 'forbidden' | 'failed'
}> =>
  generateGalleryPreviewImage({
    cacheVersion,
    sessionId,
  })

const notReadyResponse = (): Response =>
  new Response('Preview image is not ready', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'Retry-After': '5',
      'X-Robots-Tag': 'noindex',
    },
  })

export async function createGalleryPreviewImageResponse(
  sessionId: string,
  deps: GalleryPreviewImageResponseDeps = {},
): Promise<Response> {
  const normalizedCacheVersion = normalizeCacheVersion(deps.cacheVersion)
  const cacheKey = getCacheKey(sessionId, normalizedCacheVersion)

  if (cacheKey === null || normalizedCacheVersion === null) {
    return new Response('Preview image version is required', {
      status: 400,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  const cachedPng = await readCachedPng(cacheKey, normalizedCacheVersion, deps)
  if (cachedPng !== null) return createPngResponse(cachedPng)

  // Cache miss: trigger generation and wait for it to complete.
  // The generation is deduplicated by pendingGenerations so concurrent
  // requests for the same session+version share one render.
  const generate = deps.generateImage ?? defaultGenerateImage
  const result = await generate(cacheKey, normalizedCacheVersion)
  if (result.status === 'stored') {
    const generatedPng = await readCachedPng(
      cacheKey,
      normalizedCacheVersion,
      deps,
    )
    if (generatedPng !== null) return createPngResponse(generatedPng)
  }

  return notReadyResponse()
}
