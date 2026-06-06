// @ts-check
/**
 * Cached gallery thumbnails for the homepage session grid.
 *
 * Display (old, proven): iframe previews scaled via scaleIframes in src/scripts/homepage.ts
 *   — see git history from 0f56475a / ddcad1f7 (HEAD before img migration).
 * Capture (proven in-repo): agent-browser CLI — same flow as scripts/homepage-quality-gate.mjs
 *   and scripts/browser-design-ralph.mjs (viewport → open → networkidle → screenshot).
 *
 * Optional GALLERY_THUMB_CAPTURE_URL posts the preview URL to an external worker
 * (e.g. self-hosted screenshot service); no AnythingLLM screenshot API exists in git history.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DASHBOARD_PORT } from '../config.js'

/** Cached gallery thumbnail stored inside each session workspace (immutable once written). */
export const GALLERY_THUMB_FILENAME = '.gallery-thumb.png'

const CAPTURE_WIDTH = 1280
const CAPTURE_HEIGHT = 800
const CAPTURE_TIMEOUT_MS = 45_000

/** @type {Map<string, Promise<string|null>>} */
const inFlight = new Map()

export function getGalleryThumbPath(workspace) {
  if (!workspace) return ''
  return join(workspace, GALLERY_THUMB_FILENAME)
}

export function hasGalleryThumb(workspace) {
  const path = getGalleryThumbPath(workspace)
  if (!path || !existsSync(path)) return false
  try {
    return statSync(path).size > 0
  } catch {
    return false
  }
}

export function readGalleryThumb(workspace) {
  const path = getGalleryThumbPath(workspace)
  if (!hasGalleryThumb(workspace)) return null
  try {
    return readFileSync(path)
  } catch {
    return null
  }
}

export function isGalleryThumbEnabled() {
  return process.env.GALLERY_THUMB_DISABLE !== '1'
}

function previewUrlForSession(sessionId) {
  return `http://127.0.0.1:${DASHBOARD_PORT}/preview/${sessionId}/?gallery=1`
}

function runAgentBrowser(args) {
  const r = spawnSync('agent-browser', args, {
    stdio: 'ignore',
    shell: false,
    timeout: CAPTURE_TIMEOUT_MS,
  })
  return r.status === 0
}

/**
 * Optional external screenshot worker.
 * POST JSON `{ "url": "<preview url>" }`, expect raw image bytes or `{ "imageBase64": "..." }`.
 */
async function captureViaExternalService(previewUrl) {
  const endpoint = (process.env.GALLERY_THUMB_CAPTURE_URL || '').trim()
  if (!endpoint) return null

  const headers = { 'content-type': 'application/json', accept: 'image/*,application/json' }
  const apiKey = (process.env.GALLERY_THUMB_CAPTURE_API_KEY || '').trim()
  if (apiKey) headers.authorization = `Bearer ${apiKey}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: previewUrl, width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT }),
    signal: AbortSignal.timeout(CAPTURE_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`capture service ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = await res.json()
    const b64 = data?.imageBase64 || data?.base64 || data?.data
    if (typeof b64 === 'string' && b64.length > 0) {
      const normalized = b64.replace(/^data:image\/\w+;base64,/, '')
      return Buffer.from(normalized, 'base64')
    }
    return null
  }

  const buf = Buffer.from(await res.arrayBuffer())
  return buf.length > 0 ? buf : null
}

/** Viewport screenshot via agent-browser (scripts/homepage-quality-gate.mjs pattern). */
function captureViaAgentBrowser(previewUrl, outPath) {
  if (process.env.GALLERY_THUMB_DISABLE_AGENT_BROWSER === '1') return false

  try {
    const ok =
      runAgentBrowser(['set', 'viewport', String(CAPTURE_WIDTH), String(CAPTURE_HEIGHT)]) &&
      runAgentBrowser(['open', previewUrl]) &&
      runAgentBrowser(['wait', '--load', 'networkidle']) &&
      runAgentBrowser(['wait', '2000']) &&
      runAgentBrowser(['screenshot', outPath])

    return ok && existsSync(outPath) && statSync(outPath).size > 0
  } finally {
    runAgentBrowser(['close'])
  }
}

async function writeGalleryThumb(workspace, buffer) {
  const outPath = getGalleryThumbPath(workspace)
  writeFileSync(outPath, buffer)
  return outPath
}

/**
 * Capture (or reuse) a static gallery thumbnail for a session preview.
 * @returns {Promise<string|null>} absolute path to thumbnail file, or null on failure
 */
export async function captureGalleryThumb(sessionId, workspace) {
  if (!sessionId || !workspace) return null
  if (!isGalleryThumbEnabled()) return null
  if (hasGalleryThumb(workspace)) return getGalleryThumbPath(workspace)

  const existing = inFlight.get(sessionId)
  if (existing) return existing

  const job = (async () => {
    const previewUrl = previewUrlForSession(sessionId)
    const outPath = getGalleryThumbPath(workspace)

    try {
      const external = await captureViaExternalService(previewUrl)
      if (external?.length) {
        await writeGalleryThumb(workspace, external)
        return outPath
      }
    } catch (err) {
      console.warn(`[gallery-thumb] external capture failed for ${sessionId}:`, err?.message || err)
    }

    try {
      const ok = captureViaAgentBrowser(previewUrl, outPath)
      if (ok) return outPath
    } catch (err) {
      console.warn(`[gallery-thumb] agent-browser capture failed for ${sessionId}:`, err?.message || err)
    }

    return null
  })().finally(() => {
    inFlight.delete(sessionId)
  })

  inFlight.set(sessionId, job)
  return job
}

/** Fire-and-forget thumbnail generation after homepage is ready. */
export function queueGalleryThumbCapture(sessionId, workspace) {
  if (!isGalleryThumbEnabled()) return
  if (hasGalleryThumb(workspace)) return
  void captureGalleryThumb(sessionId, workspace).catch(() => {})
}

/** Warm thumbnails for visible gallery rows (deduped, non-blocking). */
export function queueGalleryThumbCaptureForSessions(sessions = []) {
  if (!isGalleryThumbEnabled()) return
  for (const session of sessions) {
    if (!session?.id || !session?.workspace || !session?.homepageReady) continue
    queueGalleryThumbCapture(session.id, session.workspace)
  }
}
