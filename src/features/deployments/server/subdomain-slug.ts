import { BASE_DOMAIN } from '@/lib/site-config'

/**
 * Host labels that never represent a deployment slug (app infrastructure).
 * Kept in sync with the public metadata resolver.
 */
export const RESERVED_HOST_LABELS = new Set([
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

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/**
 * Resolve a Ship Fast deployment slug from a hostname (or any host string).
 * Returns `undefined` for the base domain, `www`, reserved host labels,
 * multi-label subdomains, or non-matching hosts.
 *
 * Pure / client-safe — only depends on `BASE_DOMAIN`. Shared by the public
 * metadata routes, the router-level subdomain rewrite, and tests so every
 * path derives the slug from the exact same logic.
 */
export function getDeploymentSlugFromHostname(
  hostname: string,
): string | undefined {
  const baseDomain = BASE_DOMAIN.toLowerCase().replace(/^\.+|\.+$/g, '')
  if (!hostname || !baseDomain) return undefined
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    return undefined
  }
  if (!hostname.endsWith(`.${baseDomain}`)) return undefined

  const label = hostname.slice(0, -1 * `.${baseDomain}`.length)
  if (!label || label.includes('.') || RESERVED_HOST_LABELS.has(label)) {
    return undefined
  }

  return normalizeSlug(label)
}
