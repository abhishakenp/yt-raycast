import type { Browser } from 'playwright'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '../../../shared/convex/http-client'
import { resolveGalleryPreviewHtml } from './gallery-preview-html'

const versionedPreviewImageCacheControl = 'public, max-age=31536000, immutable'
const fallbackPreviewImageCacheControl =
  'public, max-age=300, stale-while-revalidate=3600'
const previewPngMemoryCacheMaxEntries = 64

const previewViewport = {
  height: 800,
  width: 1280,
} as const

type PlaywrightModule = typeof import('playwright')
type PreviewPngCacheEntry = {
  bytes: Uint8Array
  cacheVersion: string
}
type PreviewBrowserState = {
  browserPromise?: Promise<Browser>
}

declare global {
  var __shipFastGalleryPreviewBrowser: PreviewBrowserState | undefined
}

const playwrightModuleId = 'playwright'

const previewBrowserState =
  globalThis.__shipFastGalleryPreviewBrowser ??
  (globalThis.__shipFastGalleryPreviewBrowser = {})
const previewPngMemoryCache = new Map<string, PreviewPngCacheEntry>()
const previewPngCaptureRequests = new Map<string, Promise<Uint8Array>>()

const getBrowser = async (): Promise<Browser> => {
  if (previewBrowserState.browserPromise === undefined) {
    previewBrowserState.browserPromise = import(
      /* @vite-ignore */ playwrightModuleId
    )
      .then((mod: PlaywrightModule) =>
        mod.chromium.launch({
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
        }),
      )
      .catch((error: unknown) => {
        previewBrowserState.browserPromise = undefined
        throw error
      })
  }

  return await previewBrowserState.browserPromise
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

export type GalleryPreviewImageResponseDeps = {
  cacheVersion?: string | null
  capturePng?: (html: string) => Promise<Uint8Array>
  readCachedPng?: (
    cacheKey: string,
    cacheVersion: string,
  ) => Promise<Uint8Array | null>
  resolveHtml?: (sessionId: string) => Promise<string | null>
  writeCachedPng?: (
    cacheKey: string,
    cacheVersion: string,
    bytes: Uint8Array,
  ) => Promise<void>
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readStorageId = (value: unknown): Id<'_storage'> | null => {
  if (!isRecord(value)) return null
  return typeof value.storageId === 'string'
    ? (value.storageId as Id<'_storage'>)
    : null
}

const writeCachedPreviewPng = async (
  cacheKey: string,
  cacheVersion: string,
  bytes: Uint8Array,
): Promise<void> => {
  try {
    const client = createRuntimeConvexHttpClient(10_000)
    const sessionId = cacheKey as Id<'sessions'>
    const uploadUrl = await client.mutation(
      api.gallery_preview_images.generateUploadUrl,
      { cacheVersion, sessionId },
    )
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: new Blob([toArrayBuffer(bytes)], { type: 'image/png' }),
    })
    if (!uploadResponse.ok) return

    const storageId = readStorageId(await uploadResponse.json())
    if (storageId === null) return

    await client.mutation(api.gallery_preview_images.commit, {
      cacheVersion,
      contentType: 'image/png',
      sessionId,
      size: bytes.byteLength,
      storageId,
    })
  } catch {
    // Cache writes are an optimization. The image response remains valid.
  }
}

const createPngResponse = (
  png: Uint8Array,
  cacheKey: string | null,
): Response =>
  new Response(toArrayBuffer(png), {
    status: 200,
    headers: {
      'Cache-Control':
        cacheKey === null
          ? fallbackPreviewImageCacheControl
          : versionedPreviewImageCacheControl,
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

const captureAndCachePng = async (
  cacheKey: string,
  cacheVersion: string,
  html: string,
  deps: GalleryPreviewImageResponseDeps,
): Promise<Uint8Array> => {
  const requestKey = `${cacheKey}:${cacheVersion}`
  const pending = previewPngCaptureRequests.get(requestKey)
  if (pending !== undefined) return await pending

  const capturePng = deps.capturePng ?? captureGalleryPreviewPng
  const writeCachedPng = deps.writeCachedPng ?? writeCachedPreviewPng
  const request = (async () => {
    const png = await capturePng(html)
    rememberPreviewPng(cacheKey, cacheVersion, png)
    await writeCachedPng(cacheKey, cacheVersion, png)
    return png
  })().finally(() => {
    previewPngCaptureRequests.delete(requestKey)
  })

  previewPngCaptureRequests.set(requestKey, request)
  return await request
}

export async function captureGalleryPreviewPng(
  html: string,
): Promise<Uint8Array> {
  const browser = await getBrowser()
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: previewViewport,
  })

  try {
    await page.setContent(html, {
      timeout: 8_000,
      waitUntil: 'domcontentloaded',
    })
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {
      // Gallery thumbnails should not fail because a remote font/image keeps
      // a request open. Capture the settled DOM after the short grace period.
    })
    const png = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      scale: 'css',
      timeout: 8_000,
      type: 'png',
    })
    return new Uint8Array(png)
  } finally {
    await page.close()
  }
}

export async function createGalleryPreviewImageResponse(
  sessionId: string,
  deps: GalleryPreviewImageResponseDeps = {},
): Promise<Response> {
  const resolveHtml = deps.resolveHtml ?? resolveGalleryPreviewHtml
  const normalizedCacheVersion = normalizeCacheVersion(deps.cacheVersion)
  const cacheKey = getCacheKey(sessionId, normalizedCacheVersion)

  if (cacheKey !== null && normalizedCacheVersion !== null) {
    const cachedPng = await readCachedPng(
      cacheKey,
      normalizedCacheVersion,
      deps,
    )
    if (cachedPng !== null) return createPngResponse(cachedPng, cacheKey)
  }

  const html = await resolveHtml(sessionId)

  if (html === null) {
    return new Response('Preview not found or not public', {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=20',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  try {
    const png =
      cacheKey === null || normalizedCacheVersion === null
        ? await (deps.capturePng ?? captureGalleryPreviewPng)(html)
        : await captureAndCachePng(cacheKey, normalizedCacheVersion, html, deps)
    return createPngResponse(png, cacheKey)
  } catch {
    return new Response('Preview image temporarily unavailable', {
      status: 503,
      headers: {
        'Cache-Control': 'public, max-age=10',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }
}
