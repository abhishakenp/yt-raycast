export type OwnerSecretStore = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>
export type RandomBytes = (bytes: Uint8Array) => Uint8Array

const ownerSecretStoragePrefix = 'ship-fast:v2:owner-secret:'

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export const createAnonymousOwnerSecret = (
  getRandomValues: RandomBytes = (bytes) => {
    crypto.getRandomValues(bytes as Parameters<Crypto['getRandomValues']>[0])
    return bytes
  },
): string => {
  const bytes = new Uint8Array(32)
  getRandomValues(bytes)
  return toHex(bytes)
}

export const getAnonymousOwnerSecretKey = (sessionId: string): string =>
  `${ownerSecretStoragePrefix}${sessionId}`

export const persistAnonymousOwnerSecret = (
  store: OwnerSecretStore,
  sessionId: string,
  ownerSecret: string,
): void => store.setItem(getAnonymousOwnerSecretKey(sessionId), ownerSecret)

export const readAnonymousOwnerSecret = (
  store: OwnerSecretStore,
  sessionId: string,
): string | undefined =>
  store.getItem(getAnonymousOwnerSecretKey(sessionId)) ?? undefined

export const forgetAnonymousOwnerSecret = (
  store: OwnerSecretStore,
  sessionId: string,
): void => store.removeItem(getAnonymousOwnerSecretKey(sessionId))
