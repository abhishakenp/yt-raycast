import { defineEventHandler, getRequestHeader } from 'h3'

/**
 * Nitro production middleware: rewrite deployment subdomain requests to the
 * internal `/deployed/$slug/$` route tree before the TanStack Start handler
 * sees them.
 *
 * The TanStack Router `rewrite.input` option cannot do this because it only
 * receives a URL object — in production behind a reverse proxy, `request.url`
 * has the proxy's origin (e.g. `http://localhost:3000`), not the subdomain
 * from the `Host` / `X-Forwarded-Host` header. This middleware has access to
 * the request headers and can detect the subdomain.
 *
 * The Vite dev server has an equivalent middleware in `vite.config.ts`
 * (`subdomainRewriteDevMiddleware`). The router's `rewrite.output` maps the
 * internal path back to `/<path>` for the browser URL in both environments.
 */

const BASE_DOMAIN = (process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'ship-fast.ai')
  .toLowerCase()
  .replace(/^\.+|\.+$/g, '')

const RESERVED_HOST_LABELS = new Set([
  'admin',
  'agent',
  'api',
  'app',
  'assets',
  'canva',
  'cdn',
  'convex',
  'convex-backend',
  'convex-dashboard',
  'convex-studio',
  'dashboard',
  'free-preview',
  'medusa',
  'partners',
  'www',
])

const RESERVED_EXACT_PATHS = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
])
const RESERVED_PATH_PREFIXES = [
  '/api/',
  '/export/',
  // Vite dev server internal asset paths — must not be rewritten
  '/@',
  '/src/',
  '/node_modules/',
  '/favicon',
  // App source modules served by Vite — must not be rewritten
  '/convex/',
  '/packages/',
  '/lib/',
  '/medusa-backend/',
]
const INTERNAL_PREFIX = '/deployed/'
// File extensions that indicate a static asset, not a route — skip rewrite.
const ASSET_EXTENSION = /\.[a-zA-Z0-9]{1,8}$/

function resolveSubdomainSlug(host: string): string | undefined {
  const hostname = host.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? ''
  if (!hostname || !BASE_DOMAIN) return undefined
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
    return undefined
  }
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return undefined
  const label = hostname.slice(0, -1 * `.${BASE_DOMAIN}`.length)
  if (!label || label.includes('.') || RESERVED_HOST_LABELS.has(label)) {
    return undefined
  }
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  return slug || undefined
}

export default defineEventHandler((event) => {
  const method = event.method
  if (method !== 'GET' && method !== 'HEAD') return

  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')
  const host = forwardedHost || getRequestHeader(event, 'host') || ''
  const slug = resolveSubdomainSlug(host)
  if (slug === undefined) return

  const pathname = event.path
  const queryIndex = pathname.indexOf('?')
  const path = queryIndex === -1 ? pathname : pathname.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : pathname.slice(queryIndex)

  // Idempotency: skip if already rewritten by the Vite dev middleware
  if (path.startsWith(INTERNAL_PREFIX)) return

  if (RESERVED_EXACT_PATHS.has(path)) return
  for (const prefix of RESERVED_PATH_PREFIXES) {
    if (path.startsWith(prefix)) return
  }
  // Skip paths with file extensions — they're static assets, not routes
  if (ASSET_EXTENSION.test(path)) return

  const rest = path === '/' ? '' : path
  // FastURL (srvx) has only getters for pathname/search — can't mutate in
  // place. Replace event.url with a new URL built from the rewritten path so
  // event.path and downstream handlers see the internal route.
  const newPath = `/deployed/${slug}${rest}`
  const newUrl = new URL(newPath + query, event.url.origin)
  ;(event as { url: URL }).url = newUrl
  // Also update req.url so any code reading the raw request URL sees the
  // rewritten path.
  ;(event.req as { url: string }).url = newPath + query
})
