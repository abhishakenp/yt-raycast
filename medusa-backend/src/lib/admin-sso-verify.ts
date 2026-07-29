// Verification half of the Clerk-SSO admin token contract. This is a
// deliberate, minimal mirror of the canonical, tested implementation at
// ../../../src/features/commerce/server/admin-sso-token.ts in the main Ship
// Fast app — that file cannot be imported here directly (medusa-backend is a
// separate deployable package with its own dependency tree, not a bun
// workspace member), so keep any change to the token format, expiry window,
// or claim-check order in both places in sync.

export type VerifiedAdminSsoClaims = {
  customerId: string
  email: string
  commerceInstanceId: string
  audience: string
  expiresAt: number
  nonce: string
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

export interface AdminSsoNonceStore {
  recordIfNew(nonce: string, expiresAt: number): Promise<boolean>
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding =
    padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
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

// The public key is distributed to each customer stack as a standard-base64
// SPKI-encoded env var (e.g. ADMIN_SSO_PUBLIC_KEY), paired with the private
// key Ship Fast exports via `crypto.subtle.exportKey('spki', privateKeyPair)`.
export async function importAdminSsoPublicKey(
  standardBase64Spki: string,
): Promise<CryptoKey> {
  const binary = atob(standardBase64Spki)
  const keyBytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    keyBytes[index] = binary.charCodeAt(index)
  }
  return crypto.subtle.importKey('spki', keyBytes, { name: 'Ed25519' }, true, [
    'verify',
  ])
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
