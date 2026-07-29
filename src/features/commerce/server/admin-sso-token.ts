// Clerk-SSO admin token: Ship Fast signs a single-use, 60-second token
// (customer id, email, commerce instance id, audience, expiry, nonce) that a
// customer's Medusa stack verifies before creating/loading the matching
// admin user. See specs/architecture/customer-isolated-medusa-dokploy-swarm.md
// and https://docs.medusajs.com/resources/app/how-to-tutorials/how-to/admin/auth
//
// Asymmetric (Ed25519) by design: Ship Fast holds the private signing key;
// every customer stack holds only the public verification key, so a leaked
// customer stack can never forge tokens for itself or any other customer.
//
// Medusa's custom Admin auth provider must verify tokens with logic
// equivalent to `verifyAdminSsoToken` below (Medusa runs in a separate
// package/deployment that cannot import this module directly — keep any
// Medusa-side reimplementation in sync with this one).

const TOKEN_TTL_MS = 60_000

export type AdminSsoClaimsInput = {
  customerId: string
  email: string
  commerceInstanceId: string
  audience: string
}

export type VerifiedAdminSsoClaims = AdminSsoClaimsInput & {
  nonce: string
  expiresAt: number
}

export type AdminSsoVerificationError =
  | 'MALFORMED'
  | 'BAD_SIGNATURE'
  | 'EXPIRED'
  | 'WRONG_AUDIENCE'
  | 'WRONG_INSTANCE'
  | 'NONCE_REUSED'

export type AdminSsoVerificationResult =
  | { ok: true; claims: VerifiedAdminSsoClaims }
  | { ok: false; error: AdminSsoVerificationError }

// Single-use enforcement: a nonce may be recorded only once. A real customer
// stack backs this with its own dedicated Redis (already provisioned per
// instance); tests use an in-memory implementation.
export interface AdminSsoNonceStore {
  recordIfNew(nonce: string, expiresAt: number): Promise<boolean>
}

export function createInMemoryAdminSsoNonceStore(): AdminSsoNonceStore {
  const seen = new Set<string>()
  return {
    async recordIfNew(nonce, _expiresAt) {
      if (seen.has(nonce)) return false
      seen.add(nonce)
      return true
    },
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + padding)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

export async function generateAdminSsoKeyPair(): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ])
  if (!('privateKey' in keyPair)) {
    throw new Error('Ed25519 key generation did not return a key pair.')
  }
  return keyPair
}

// The signing key must be generated once and persisted (e.g. in Doppler as
// ADMIN_SSO_PRIVATE_KEY) — regenerating it per request/deploy would silently
// invalidate every customer stack's already-distributed public key.
export async function importAdminSsoPrivateKey(
  standardBase64Pkcs8: string,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    base64Decode(standardBase64Pkcs8),
    { name: 'Ed25519' },
    false,
    ['sign'],
  )
}

export async function exportAdminSsoPrivateKeyBase64(
  privateKey: CryptoKey,
): Promise<string> {
  const bytes = await crypto.subtle.exportKey('pkcs8', privateKey)
  return base64Encode(new Uint8Array(bytes))
}

export async function exportAdminSsoPublicKeyBase64(
  publicKey: CryptoKey,
): Promise<string> {
  const bytes = await crypto.subtle.exportKey('spki', publicKey)
  return base64Encode(new Uint8Array(bytes))
}

function base64Encode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64Decode(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export async function signAdminSsoToken(
  privateKey: CryptoKey,
  claims: AdminSsoClaimsInput,
  now = Date.now(),
): Promise<string> {
  const payload = {
    sub: claims.customerId,
    email: claims.email,
    instance: claims.commerceInstanceId,
    aud: claims.audience,
    exp: now + TOKEN_TTL_MS,
    nonce: crypto.randomUUID(),
  }
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const signature = await crypto.subtle.sign(
    'Ed25519',
    privateKey,
    payloadBytes,
  )
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyAdminSsoToken(
  publicKey: CryptoKey,
  token: string,
  expected: { audience: string; commerceInstanceId: string },
  nonceStore: AdminSsoNonceStore,
  now = Date.now(),
): Promise<AdminSsoVerificationResult> {
  const parts = token.split('.')
  if (parts.length !== 2) return { ok: false, error: 'MALFORMED' }

  let payloadBytes: ReturnType<typeof base64UrlDecode>
  let signatureBytes: ReturnType<typeof base64UrlDecode>
  try {
    payloadBytes = base64UrlDecode(parts[0])
    signatureBytes = base64UrlDecode(parts[1])
  } catch {
    return { ok: false, error: 'MALFORMED' }
  }

  const validSignature = await crypto.subtle.verify(
    'Ed25519',
    publicKey,
    signatureBytes,
    payloadBytes,
  )
  if (!validSignature) return { ok: false, error: 'BAD_SIGNATURE' }

  let payload: unknown
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes))
  } catch {
    return { ok: false, error: 'MALFORMED' }
  }
  const record = asRecord(payload)
  if (
    typeof record.sub !== 'string' ||
    typeof record.email !== 'string' ||
    typeof record.instance !== 'string' ||
    typeof record.aud !== 'string' ||
    typeof record.exp !== 'number' ||
    typeof record.nonce !== 'string'
  ) {
    return { ok: false, error: 'MALFORMED' }
  }

  if (now >= record.exp) return { ok: false, error: 'EXPIRED' }
  if (record.aud !== expected.audience) {
    return { ok: false, error: 'WRONG_AUDIENCE' }
  }
  if (record.instance !== expected.commerceInstanceId) {
    return { ok: false, error: 'WRONG_INSTANCE' }
  }

  // Nonce is recorded last so a token that fails any other check never
  // consumes a replay slot it was never entitled to use.
  const isNew = await nonceStore.recordIfNew(record.nonce, record.exp)
  if (!isNew) return { ok: false, error: 'NONCE_REUSED' }

  return {
    ok: true,
    claims: {
      customerId: record.sub,
      email: record.email,
      commerceInstanceId: record.instance,
      audience: record.aud,
      expiresAt: record.exp,
      nonce: record.nonce,
    },
  }
}
