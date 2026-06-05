const DEFAULT_TRUST_PROXY = false

export function resolveTrustProxySetting(env = process.env) {
  const raw = String(env.TRUST_PROXY ?? '').trim()
  if (!raw) return DEFAULT_TRUST_PROXY
  if (raw.toLowerCase() === 'false' || raw === '0') return false
  return raw
}

export function getClientIp(req) {
  const raw = String(req?.ip || req?.socket?.remoteAddress || '').trim()
  return raw.replace(/^::ffff:/, '')
}
