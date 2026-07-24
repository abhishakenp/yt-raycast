import type { LocationRewrite } from '@tanstack/react-router'

import { getDeploymentSlugFromHostname } from './subdomain-slug'

/**
 * Internal route prefix that the subdomain rewrite rewrites to. Subdomain
 * requests (`<slug>.<base>/<rest>`) are rewritten to
 * `${SUBDOMAIN_ROUTE_PREFIX}/<slug><rest>` so they match the
 * `/deployed/$slug/$` route tree, while the browser URL stays on the subdomain.
 */
export const SUBDOMAIN_ROUTE_PREFIX = '/deployed'

/**
 * Paths that must NOT be rewritten when served from a deployment subdomain.
 * These keep working with their original handlers (which detect the subdomain
 * themselves via `getDeploymentSlugFromRequest`):
 * - `/robots.txt`, `/sitemap.xml`, `/llms.txt` — per-deployment metadata.
 * - `/api/...` — host API routes (commerce, forms, images, etc.).
 * - `/export/...` — export download routes keyed by session id.
 */
const RESERVED_SUBDOMAIN_EXACT_PATHS = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
])
const RESERVED_SUBDOMAIN_PATH_PREFIXES = ['/api/', '/export/']

export function isReservedSubdomainPath(pathname: string): boolean {
  if (RESERVED_SUBDOMAIN_EXACT_PATHS.has(pathname)) return true
  for (const prefix of RESERVED_SUBDOMAIN_PATH_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}

/**
 * Build the internal route path for a subdomain request.
 * `/` → `/deployed/<slug>`; `/about` → `/deployed/<slug>/about`.
 */
export function buildSubdomainRoutePath(
  slug: string,
  pathname: string,
): string {
  const rest = pathname === '/' ? '' : pathname
  return `${SUBDOMAIN_ROUTE_PREFIX}/${slug}${rest}`
}

/**
 * Strip the `/deployed/<slug>` prefix from an internal route path.
 * Returns the remaining path (`/` for home, `/about` for a sub-page) when the
 * path is a subdomain route, otherwise `null` (not a subdomain route).
 */
export function stripSubdomainRoutePrefix(pathname: string): string | null {
  if (!pathname.startsWith(`${SUBDOMAIN_ROUTE_PREFIX}/`)) return null
  const afterPrefix = pathname.slice(SUBDOMAIN_ROUTE_PREFIX.length + 1)
  const slashIndex = afterPrefix.indexOf('/')
  if (slashIndex === -1) return '/'
  return afterPrefix.slice(slashIndex) || '/'
}

/**
 * TanStack Router `rewrite` pair that maps deployment subdomains to the
 * internal `/deployed/$slug/$` route tree without touching the browser URL.
 *
 * `input` runs before route matching (server + client): a subdomain URL is
 * rewritten to `/deployed/<slug><rest>`. Reserved paths (metadata, /api, …)
 * are left untouched so their own handlers keep resolving the slug.
 *
 * `output` runs before the router commits a location to history: an internal
 * `/deployed/<slug><rest>` path is mapped back to `/<rest>` so links and
 * router-driven navigation stay on the clean subdomain URL.
 */
export const subdomainRewrite: LocationRewrite = {
  input: ({ url }) => {
    const slug = getDeploymentSlugFromHostname(url.host)
    if (slug === undefined) return undefined
    if (isReservedSubdomainPath(url.pathname)) return undefined
    const next = new URL(url.toString())
    next.pathname = buildSubdomainRoutePath(slug, url.pathname)
    return next
  },
  output: ({ url }) => {
    const rest = stripSubdomainRoutePrefix(url.pathname)
    if (rest === null) return undefined
    const next = new URL(url.toString())
    next.pathname = rest
    return next
  },
}
