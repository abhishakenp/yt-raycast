import type { CustomerStackSecrets } from './types'

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

// Generated once per customer stack and never returned to Ship Fast — only a
// secretRef pointer is handed back, per the plan's "Ship Fast never...stores
// Medusa database, JWT, cookie, Redis, or admin secrets" boundary.
export function generateCustomerStackSecrets(): CustomerStackSecrets {
  return {
    jwtSecret: randomHex(32),
    cookieSecret: randomHex(32),
    databasePassword: randomHex(24),
  }
}

export async function hashRequest(
  payload: Record<string, unknown>,
): Promise<string> {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}
