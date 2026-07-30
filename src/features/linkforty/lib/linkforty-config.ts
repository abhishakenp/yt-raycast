type LinkFortyClientEnv = {
  VITE_LINKFORTY_ENABLED?: string
  VITE_LINKFORTY_BASE_URL?: string
}

type LinkFortyServerEnv = {
  LINKFORTY_ENABLED?: string
  LINKFORTY_API_URL?: string
  LINKFORTY_SERVICE_USER_ID?: string
  LINKFORTY_WEBHOOK_SECRET?: string
}

export function isLinkFortyClientEnabled(env?: LinkFortyClientEnv): boolean {
  const enabled =
    env?.VITE_LINKFORTY_ENABLED ?? import.meta.env.VITE_LINKFORTY_ENABLED
  return enabled?.trim().toLowerCase() === 'true'
}

export function isLinkFortyServerEnabled(env?: LinkFortyServerEnv): boolean {
  const source = env ?? process.env
  return (
    source.LINKFORTY_ENABLED?.trim().toLowerCase() === 'true' &&
    Boolean(source.LINKFORTY_API_URL) &&
    Boolean(source.LINKFORTY_SERVICE_USER_ID)
  )
}

export function getLinkFortyBaseUrl(env?: LinkFortyClientEnv): string | null {
  const url =
    env?.VITE_LINKFORTY_BASE_URL ?? import.meta.env.VITE_LINKFORTY_BASE_URL
  return typeof url === 'string' && url.length > 0 ? url : null
}

/**
 * Build the full short URL for a referral code.
 * Returns `https://links.ship-fast.ai/CODE` when LinkForty is enabled,
 * `null` when disabled (caller falls back to `?ref=CODE`).
 */
export function buildLinkFortyShortUrl(
  code: string,
  env?: LinkFortyClientEnv,
): string | null {
  if (!isLinkFortyClientEnabled(env)) return null
  const base = getLinkFortyBaseUrl(env)
  if (!base) return null
  return `${base}/${code}`
}
