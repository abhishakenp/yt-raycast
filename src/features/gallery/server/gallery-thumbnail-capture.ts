/**
 * Cached gallery thumbnails — capture once, save, reuse (no live previews).
 *
 * Restores the original `src/server/session-gallery-thumbnail.js` mechanism
 * (commit 5a2c5e73), adapted to the Convex/TanStack stack:
 *   Capture: screenshot the session's standalone preview URL
 *     (`/api/sessions/<id>/preview-raw`) via an external screenshot worker
 *     (GALLERY_THUMB_CAPTURE_URL — e.g. self-hosted browserless).
 *   Save: write the PNG to a cache dir, keyed by sessionId + previewVersion
 *     (immutable once written; a new preview version yields a new file).
 *   Use: the gallery-thumb route serves the cached PNG and only falls back to
 *     the deterministic SVG while a capture is still pending.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CAPTURE_WIDTH = 1280
const CAPTURE_HEIGHT = 800
const CAPTURE_TIMEOUT_MS = 45_000
const THUMB_RENDERER_CACHE_VERSION = 2

const CACHE_DIR = join(tmpdir(), 'ship-fast-gallery-thumbs')

/** In-flight captures, deduped by cache key so concurrent requests share one job. */
const inFlight = new Map<string, Promise<Buffer | null>>()

/** Run external thumbnail captures strictly one at a time. */
const MAX_CONCURRENT_CAPTURES = 1
let activeCaptures = 0
const captureWaiters: Array<() => void> = []

const acquireCaptureSlot = async (): Promise<void> => {
  if (activeCaptures < MAX_CONCURRENT_CAPTURES) {
    activeCaptures += 1
    return
  }
  await new Promise<void>((resolve) => captureWaiters.push(resolve))
  activeCaptures += 1
}

const releaseCaptureSlot = (): void => {
  activeCaptures -= 1
  const next = captureWaiters.shift()
  if (next) next()
}

const cacheKey = (sessionId: string, version: number): string =>
  `${sessionId.replace(/[^a-zA-Z0-9_-]/g, '')}-v${version}-r${THUMB_RENDERER_CACHE_VERSION}`

const cacheThumbPath = (sessionId: string, version: number): string =>
  join(CACHE_DIR, `${cacheKey(sessionId, version)}.png`)

export const isGalleryThumbCaptureEnabled = (): boolean =>
  process.env.GALLERY_THUMB_DISABLE !== '1'

export const readCachedGalleryThumb = (sessionId: string, version: number): Buffer | null => {
  const path = cacheThumbPath(sessionId, version)
  if (!existsSync(path)) return null
  try {
    return statSync(path).size > 0 ? readFileSync(path) : null
  } catch {
    return null
  }
}

/**
 * Optional external screenshot worker.
 * POST JSON `{ url, width, height }`; expect raw image bytes or `{ imageBase64 }`.
 */
const captureViaExternalService = async (previewUrl: string): Promise<Buffer | null> => {
  const endpoint = (process.env.GALLERY_THUMB_CAPTURE_URL || '').trim()
  if (!endpoint) return null

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'image/*,application/json',
  }
  const apiKey = (process.env.GALLERY_THUMB_CAPTURE_API_KEY || '').trim()
  if (apiKey) headers.authorization = `Bearer ${apiKey}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: previewUrl, width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT }),
    signal: AbortSignal.timeout(CAPTURE_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`capture service ${res.status}`)

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = (await res.json()) as Record<string, unknown>
    const b64 = data?.imageBase64 ?? data?.base64 ?? data?.data
    if (typeof b64 === 'string' && b64.length > 0) {
      return Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    }
    return null
  }

  const buf = Buffer.from(await res.arrayBuffer())
  return buf.length > 0 ? buf : null
}

/**
 * Capture (or reuse) a static gallery thumbnail for a session preview.
 * Returns the PNG buffer, or null if capture is unavailable/failed.
 */
export const captureGalleryThumb = async (
  sessionId: string,
  version: number,
  previewUrl: string,
): Promise<Buffer | null> => {
  if (!sessionId || !previewUrl || !isGalleryThumbCaptureEnabled()) return null

  const cached = readCachedGalleryThumb(sessionId, version)
  if (cached) return cached

  const key = cacheKey(sessionId, version)
  const existing = inFlight.get(key)
  if (existing) return existing

  const job = (async (): Promise<Buffer | null> => {
    await acquireCaptureSlot()
    try {
      const outPath = cacheThumbPath(sessionId, version)
      mkdirSync(CACHE_DIR, { recursive: true })

      try {
        const external = await captureViaExternalService(previewUrl)
        if (external?.length) {
          writeFileSync(outPath, external)
          return external
        }
      } catch (err) {
        console.warn(`[gallery-thumb] external capture failed for ${sessionId}:`, (err as Error)?.message ?? err)
      }

      return null
    } finally {
      releaseCaptureSlot()
    }
  })().finally(() => {
    inFlight.delete(key)
  })

  inFlight.set(key, job)
  return job
}

/** Fire-and-forget capture; warms the cache without blocking the response. */
export const queueGalleryThumbCapture = (
  sessionId: string,
  version: number,
  previewUrl: string,
): void => {
  if (!isGalleryThumbCaptureEnabled()) return
  if (readCachedGalleryThumb(sessionId, version)) return
  void captureGalleryThumb(sessionId, version, previewUrl).catch(() => undefined)
}
