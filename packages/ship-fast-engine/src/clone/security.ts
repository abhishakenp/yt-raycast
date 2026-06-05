import { URL } from "url"
import { lookup } from "dns/promises"
import { isIP } from "net"

// Shared SSRF guard for the clone module. Both crawler.ts (before every fetch)
// and assets.ts (before every download) MUST call assertPublicUrl.

// Only http/https are permitted.
export function isAllowedScheme(url: string): boolean {
  try {
    const protocol = new URL(url).protocol
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

// Reject obviously-disallowed literal hostnames before any DNS work.
function isBlockedHostLiteral(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "")
  if (h === "" || h === "localhost" || h.endsWith(".localhost")) return true
  if (h === "0.0.0.0" || h === "0" || h === "::" || h === "[::]") return true
  if (h === "metadata.google.internal") return true
  return false
}

// Detect non-dotted-quad numeric host encodings (decimal/hex/octal) that bypass
// naive string checks (e.g. 2130706433, 0x7f000001, 0177.0.0.1).
function isSuspiciousNumericHost(host: string): boolean {
  const h = host.toLowerCase()
  // Pure decimal integer host (e.g. "2130706433" -> 127.0.0.1)
  if (/^\d+$/.test(h)) return true
  // Hex host (e.g. "0x7f000001")
  if (/^0x[0-9a-f]+$/.test(h)) return true
  // Any dotted octet using hex or octal encoding
  if (h.includes(".")) {
    const parts = h.split(".")
    for (const p of parts) {
      if (p.startsWith("0x")) return true
      if (/^0\d+$/.test(p)) return true // octal-style leading zero
    }
  }
  return false
}

// Classify a resolved IP literal as private/loopback/link-local/etc.
function isPrivateIp(ip: string): boolean {
  const family = isIP(ip)

  if (family === 4) {
    const octets = ip.split(".").map((o) => parseInt(o, 10))
    if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) {
      return true // malformed -> reject
    }
    const [a, b] = octets
    if (a === 0) return true // 0.0.0.0/8
    if (a === 127) return true // loopback 127.0.0.0/8
    if (a === 10) return true // private 10/8
    if (a === 172 && b >= 16 && b <= 31) return true // private 172.16.0.0/12
    if (a === 192 && b === 168) return true // private 192.168/16
    if (a === 169 && b === 254) return true // link-local 169.254/16 (incl. metadata 169.254.169.254)
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT 100.64.0.0/10
    if (a >= 224) return true // multicast / reserved
    return false
  }

  if (family === 6) {
    const v6 = ip.toLowerCase()
    if (v6 === "::1" || v6 === "::") return true // loopback / unspecified
    // Link-local is fe80::/10, spanning fe80–febf (the high 10 bits are fixed, so
    // the first hextet's leading nibble is `fe` and its second nibble is 8–b).
    // A bare `fe80` prefix would miss fe9x/feax/febx — match the full /10 here.
    if (/^fe[89ab][0-9a-f]/.test(v6)) return true // link-local fe80::/10
    if (v6.startsWith("fc") || v6.startsWith("fd")) return true // unique-local fc00::/7
    if (v6.startsWith("ff")) return true // multicast
    // IPv4-mapped (::ffff:127.0.0.1) — recurse on the embedded v4
    const mapped = v6.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPrivateIp(mapped[1])
    // IPv4-mapped in hex form (::ffff:7f00:0001) treated as suspicious
    if (v6.startsWith("::ffff:")) return true
    return false
  }

  // Not a valid IP literal
  return true
}

// Throws if the URL is not safe to fetch. Allows only http/https; DNS-resolves the
// host and rejects loopback/link-local/private/metadata addresses and numeric
// host-encoding tricks.
export async function assertPublicUrl(url: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`Blocked URL (unparseable): ${url}`)
  }

  if (!isAllowedScheme(url)) {
    throw new Error(`Blocked URL (scheme not allowed): ${url}`)
  }

  const host = parsed.hostname
  if (isBlockedHostLiteral(host)) {
    throw new Error(`Blocked URL (disallowed host): ${url}`)
  }
  if (isSuspiciousNumericHost(host)) {
    throw new Error(`Blocked URL (suspicious host encoding): ${url}`)
  }

  // If the host is already an IP literal, classify directly.
  const literalFamily = isIP(host.replace(/^\[|\]$/g, ""))
  if (literalFamily !== 0) {
    if (isPrivateIp(host.replace(/^\[|\]$/g, ""))) {
      throw new Error(`Blocked URL (private/loopback IP): ${url}`)
    }
    return
  }

  // Otherwise resolve the hostname and reject if ANY resolved address is private.
  let records: Array<{ address: string; family: number }>
  try {
    records = await lookup(host, { all: true })
  } catch {
    throw new Error(`Blocked URL (DNS resolution failed): ${url}`)
  }

  if (records.length === 0) {
    throw new Error(`Blocked URL (no DNS records): ${url}`)
  }

  for (const rec of records) {
    if (isPrivateIp(rec.address)) {
      throw new Error(`Blocked URL (resolves to private/loopback IP ${rec.address}): ${url}`)
    }
  }
}
