/**
 * SSRF protection utilities — shared across all server-side fetch paths.
 *
 * Every server-side `fetch()` that uses a URL derived from an external API
 * response (Brandfetch, Convex storage, etc.) MUST pass the URL through
 * `isSafeFetchUrl()` first to block private IPs, localhost, and non-HTTPS
 * schemes.
 */

const isPrivateIpv4Address = (hostname: string): boolean => {
  const parts = hostname.split('.').map(Number)
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false
  }
  const [first = 0, second = 0] = parts
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  )
}

const isPrivateIpv6Address = (hostname: string): boolean => {
  const address = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  return (
    address === '::' ||
    address === '::1' ||
    address.startsWith('fc') ||
    address.startsWith('fd') ||
    /^fe[89ab]/.test(address) ||
    address.startsWith('::ffff:127.') ||
    address.startsWith('::ffff:10.') ||
    address.startsWith('::ffff:192.168.')
  )
}

/**
 * Returns `true` when the URL is safe for a server-side fetch.
 * Blocks:
 *  - non-HTTPS schemes (http:, file:, data:, etc.)
 *  - userinfo in the URL (user:pass@host)
 *  - localhost and .localhost / .local hostnames
 *  - private IPv4 ranges (10.x, 127.x, 169.254.x, 172.16-31.x, 192.168.x, etc.)
 *  - private IPv6 ranges (::1, fc::, fd::, fe80::, etc.)
 *  - IPv4-mapped IPv6 addresses pointing to private ranges
 */
export function isSafeFetchUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      hostname !== 'localhost' &&
      !hostname.endsWith('.localhost') &&
      !hostname.endsWith('.local') &&
      !isPrivateIpv4Address(hostname) &&
      !isPrivateIpv6Address(hostname)
    )
  } catch {
    return false
  }
}
