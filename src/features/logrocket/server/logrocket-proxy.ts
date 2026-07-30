/**
 * First-party proxy handlers for LogRocket CDN and ingestion traffic.
 *
 * Ad blockers maintain filter lists of known analytics domains (lrkt-in.com,
 * r.logrocket.com, cdn.logrocket.com). By proxying all LogRocket requests
 * through our own `/api/logrocket/*` routes, the browser sees only same-origin
 * requests that ad blockers cannot distinguish from normal app traffic.
 *
 * Two upstream targets:
 *  - CDN:      https://cdn.logrocket.com/*  (GET — script assets)
 *  - Ingestion: https://r.lr-ingest.com/*   (POST — session data)
 *
 * The route path segment after `/api/logrocket/{cdn|ingest}` is forwarded
 * verbatim to the upstream, preserving query strings and request bodies.
 */

const CDN_UPSTREAM = 'https://cdn.logrocket.com'
const INGEST_UPSTREAM = 'https://r.lr-ingest.com'

const UPSTREAMS = {
  cdn: CDN_UPSTREAM,
  ingest: INGEST_UPSTREAM,
} as const

type ProxyTarget = keyof typeof UPSTREAMS

function isProxyTarget(value: string): value is ProxyTarget {
  return value === 'cdn' || value === 'ingest'
}

/**
 * Extract the path after `/api/logrocket/{cdn|ingest}` from the request URL.
 * Returns `null` when the target segment is missing or invalid.
 */
export function parseLogRocketProxyPath(url: string): {
  target: ProxyTarget
  upstreamPath: string
} | null {
  const prefix = '/api/logrocket/'
  const prefixIndex = url.indexOf(prefix)
  if (prefixIndex === -1) return null
  const afterPrefix = url.slice(prefixIndex + prefix.length)
  const slashIndex = afterPrefix.indexOf('/')
  if (slashIndex === -1) return null
  const targetSegment = afterPrefix.slice(0, slashIndex)
  if (!isProxyTarget(targetSegment)) return null
  const upstreamPath = afterPrefix.slice(slashIndex + 1)
  return {
    target: targetSegment,
    upstreamPath: '/' + upstreamPath,
  }
}

/**
 * Build the full upstream URL for a proxy request.
 */
export function buildUpstreamUrl(
  target: ProxyTarget,
  upstreamPath: string,
): string {
  const base = UPSTREAMS[target]
  const path = upstreamPath.includes('?') ? upstreamPath : upstreamPath
  return base + path
}

/**
 * Headers to forward from the incoming request to the upstream.
 * We strip hop-by-hop headers and host, and set the upstream origin.
 */
function buildUpstreamHeaders(incomingHeaders: Headers): Headers {
  const headers = new Headers()
  const skipHeaders = new Set([
    'host',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
  ])
  incomingHeaders.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })
  headers.set('accept', incomingHeaders.get('accept') ?? '*/*')
  return headers
}

/**
 * Create a Response that proxies the incoming request to the LogRocket upstream.
 * Used by both the TanStack server route handlers and the Vite dev middleware.
 */
export async function proxyLogRocketRequest(
  request: Request,
): Promise<Response> {
  const parsed = parseLogRocketProxyPath(request.url)
  if (parsed === null) {
    return new Response('Not Found', { status: 404 })
  }
  const upstreamUrl = buildUpstreamUrl(parsed.target, parsed.upstreamPath)
  const upstreamHeaders = buildUpstreamHeaders(request.headers)
  const init: RequestInit = {
    method: request.method,
    headers: upstreamHeaders,
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }
  const upstreamResponse = await fetch(upstreamUrl, init)
  const responseHeaders = new Headers(upstreamResponse.headers)
  responseHeaders.delete('transfer-encoding')
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}
