import { BASE_DOMAIN } from '@/lib/site-config'

/**
 * Client-safe base domain for subdomain slug resolution.
 *
 * `BASE_DOMAIN` from `site-config` reads `process.env.NEXT_PUBLIC_BASE_DOMAIN`,
 * which Vite does NOT replace in client bundles (only `import.meta.env.*` is
 * replaced). On the client, `BASE_DOMAIN` falls back to `'ship-fast.ai'`
 * regardless of the actual env, so subdomain detection fails on `.ship-fast.test`
 * or other non-default base domains.
 *
 * This reads `import.meta.env.NEXT_PUBLIC_BASE_DOMAIN` first (which Vite DOES
 * replace via `envPrefix`), then falls back to `BASE_DOMAIN` for SSR.
 */
const CLIENT_BASE_DOMAIN: string =
  (import.meta.env.NEXT_PUBLIC_BASE_DOMAIN as string | undefined)?.trim() ||
  BASE_DOMAIN

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
  const baseDomain = CLIENT_BASE_DOMAIN.toLowerCase().replace(/^\.+|\.+$/g, '')
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
