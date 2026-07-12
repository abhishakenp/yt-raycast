export type OwnerSecretStore = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>
export type RandomBytes = (bytes: Uint8Array) => Uint8Array

const ownerSecretStoragePrefix = 'ship-fast:v2:owner-secret:'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

export function createAnonymousOwnerSecret(
  getRandomValues: RandomBytes = (bytes) => {
    crypto.getRandomValues(bytes as Parameters<Crypto['getRandomValues']>[0])
    return bytes
  },
): string {
  const bytes = new Uint8Array(32)
  getRandomValues(bytes)
  return toHex(bytes)
}

export function getAnonymousOwnerSecretKey(sessionId: string): string {
  return `${ownerSecretStoragePrefix}${sessionId}`
}

export function persistAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
  ownerSecret: string,
): void {
  return store.setItem(getAnonymousOwnerSecretKey(sessionId), ownerSecret)
}

export function readAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
): string | undefined {
  return store.getItem(getAnonymousOwnerSecretKey(sessionId)) ?? undefined
}

export function forgetAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
): void {
  return store.removeItem(getAnonymousOwnerSecretKey(sessionId))
}
