import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import type { CapturedPage } from "./types.ts"
import { assertPublicUrl } from "./security.ts"

// Download + rehost reference images/logo into session workspace; rewrite URLs to local

// Hard byte cap to prevent OOM / decompression-bomb style abuse.
const MAX_ASSET_SIZE = 10 * 1024 * 1024 // 10MB

// Only rehost real image types. Anything else (html, js, svgz, ...) is rejected.
const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "gif",
  "avif",
])

// Map an image Content-Type to a safe lowercase extension in the allowlist, or
// null. Used to validate the actual bytes served, independent of the requested
// URL pathname (which can lie or redirect to a non-image).
const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "image/avif": "avif",
}

function extFromContentType(contentType: string | null): string | null {
  if (!contentType) return null
  const mime = contentType.split(";")[0].trim().toLowerCase()
  return CONTENT_TYPE_TO_EXT[mime] || null
}

// Derive a safe lowercase extension from a URL pathname, or null if it is not
// in the image allowlist.
function allowedExtension(pathname: string): string | null {
  const last = pathname.split("/").pop() || ""
  const dot = last.lastIndexOf(".")
  if (dot < 0) return null
  const ext = last.slice(dot + 1).toLowerCase()
  return ALLOWED_EXTENSIONS.has(ext) ? ext : null
}

// Follow redirects manually, re-running the DNS-resolving SSRF guard on EVERY
// hop so a public host cannot 30x-redirect us to a private/loopback/metadata
// target (the default redirect:"follow" would silently follow such a hop).
const MAX_REDIRECTS = 5

async function fetchNoRedirectToPrivate(
  url: string,
  signal: AbortSignal,
): Promise<Response | null> {
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current)
    const response = await fetch(current, {
      redirect: "manual",
      signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    })
    // Redirect status: validate the next hop before following it.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location) return null
      // Resolve relative redirects against the current URL.
      current = new URL(location, current).toString()
      // Drain the redirect body so the connection can be reused/closed.
      await response.body?.cancel()
      continue
    }
    return response
  }
  console.warn(`Asset exceeded max redirects, skipping: ${url}`)
  return null
}

export async function downloadAsset(
  url: string,
  workspace: string,
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    // Cheap pre-filter on the requested pathname before any network I/O. The
    // authoritative extension is decided AFTER the fetch from the final URL +
    // Content-Type (below), so a .png that redirects to/serves non-image bytes
    // is still rejected.
    const requestedExt = allowedExtension(new URL(url).pathname)
    if (!requestedExt) {
      console.warn(`Asset extension not in image allowlist, skipping: ${url}`)
      return null
    }

    // SSRF-safe fetch: manual redirects, re-asserting assertPublicUrl on every
    // hop (the original-URL-only check is bypassable via 30x to a private host).
    const response = await fetchNoRedirectToPrivate(
      url,
      signal || AbortSignal.timeout(30000),
    )
    if (!response) return null

    if (!response.ok || !response.body) return null

    // Re-assert the FINAL (post-redirect) URL — defense in depth — and decide
    // the real extension from the final pathname AND the served Content-Type.
    // Both must agree on an image type; otherwise drop.
    await assertPublicUrl(response.url || url)
    const finalUrl = response.url || url
    const finalExt = allowedExtension(new URL(finalUrl).pathname)
    const ctExt = extFromContentType(response.headers.get("content-type"))
    const ext = ctExt || finalExt
    if (!ext) {
      console.warn(
        `Asset final URL/Content-Type not an allowed image, skipping: ${finalUrl}`,
      )
      return null
    }
    // If a Content-Type is present it MUST be an allowed image type.
    if (response.headers.get("content-type") && !ctExt) {
      console.warn(
        `Asset Content-Type not an allowed image, skipping: ${finalUrl}`,
      )
      return null
    }

    // Content-Length precheck: bail before downloading anything oversized.
    const declared = Number(response.headers.get("content-length"))
    if (Number.isFinite(declared) && declared > MAX_ASSET_SIZE) {
      console.warn(`Asset declared too large (${declared} bytes), skipping: ${url}`)
      return null
    }

    // Stream with a running byte cap so servers that lie about (or omit)
    // Content-Length still cannot blow past MAX_ASSET_SIZE.
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      total += value.byteLength
      if (total > MAX_ASSET_SIZE) {
        await reader.cancel()
        console.warn(`Asset exceeded byte cap during stream, aborting: ${url}`)
        return null
      }
      chunks.push(value)
    }

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)))

    const filename = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Ensure assets directory exists
    const assetsDir = join(workspace, "assets")
    await mkdir(assetsDir, { recursive: true })

    // Write file
    const localPath = join(assetsDir, filename)
    await writeFile(localPath, buffer)

    // Return relative path for use in generated code
    return `/assets/${filename}`
  } catch (error) {
    console.error(`Failed to download asset ${url}:`, error)
    return null
  }
}

// Download all assets from a captured page
export async function downloadPageAssets(
  captured: CapturedPage,
  workspace: string,
  concurrency = 4,
  signal?: AbortSignal,
): Promise<Map<string, string>> {
  const assetMap = new Map<string, string>()
  const queue = [...captured.assetUrls]
  const running = new Set<Promise<void>>()

  const processNext = async (): Promise<void> => {
    if (signal?.aborted) return
    const url = queue.shift()
    if (!url) return

    const localPath = await downloadAsset(url, workspace, signal)
    if (localPath) {
      assetMap.set(url, localPath)
    }
  }

  while (queue.length > 0 && !signal?.aborted) {
    while (running.size < concurrency && queue.length > 0 && !signal?.aborted) {
      const p = processNext().finally(() => running.delete(p))
      running.add(p)
    }
    if (running.size > 0) {
      await Promise.race(running)
    }
  }

  await Promise.all(running)
  return assetMap
}

// Rewrite asset URLs in HTML to local paths
export function rewriteAssetUrls(html: string, assetMap: Map<string, string>): string {
  let result = html
  for (const [originalUrl, localPath] of assetMap.entries()) {
    result = result.replace(new RegExp(escapeRegExp(originalUrl), "g"), localPath)
  }
  return result
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
