export type OwnerSecretStore = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
> &
  Partial<Pick<Storage, 'key' | 'length'>>
export type RandomBytes = (bytes: Uint8Array) => Uint8Array

const ownerSecretStoragePrefix = 'ship-fast:v2:owner-secret:'
const ownerSecretDbName = 'ship-fast-owner-secrets'
const ownerSecretStoreName = 'ownerSecrets'
const ownerSecretDbVersion = 1
const memoryOwnerSecrets = new Map<string, string>()
let ownerSecretDbPromise: Promise<IDBDatabase | null> | null = null
let ownerSecretHydrationPromise: Promise<void> | null = null

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

function getSessionIdFromOwnerSecretKey(key: string): string | null {
  if (!key.startsWith(ownerSecretStoragePrefix)) return null
  const sessionId = key.slice(ownerSecretStoragePrefix.length).trim()
  return sessionId || null
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function openOwnerSecretDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return null
  if (ownerSecretDbPromise !== null) return await ownerSecretDbPromise

  ownerSecretDbPromise = new Promise<IDBDatabase | null>((resolve) => {
    const request = indexedDB.open(ownerSecretDbName, ownerSecretDbVersion)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(ownerSecretStoreName)) {
        db.createObjectStore(ownerSecretStoreName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })

  return await ownerSecretDbPromise
}

async function writeOwnerSecretToIndexedDb(
  sessionId: string,
  ownerSecret: string,
): Promise<boolean> {
  const db = await openOwnerSecretDb()
  if (db === null) return false

  try {
    const tx = db.transaction(ownerSecretStoreName, 'readwrite')
    const store = tx.objectStore(ownerSecretStoreName)
    await requestToPromise(store.put(ownerSecret, sessionId))
    return true
  } catch {
    return false
  }
}

async function deleteOwnerSecretFromIndexedDb(
  sessionId: string,
): Promise<void> {
  const db = await openOwnerSecretDb()
  if (db === null) return

  try {
    const tx = db.transaction(ownerSecretStoreName, 'readwrite')
    await requestToPromise(
      tx.objectStore(ownerSecretStoreName).delete(sessionId),
    )
  } catch {}
}

async function readOwnerSecretFromIndexedDb(
  sessionId: string,
): Promise<string | undefined> {
  const db = await openOwnerSecretDb()
  if (db === null) return undefined

  try {
    const tx = db.transaction(ownerSecretStoreName, 'readonly')
    const value = await requestToPromise(
      tx.objectStore(ownerSecretStoreName).get(sessionId),
    )
    return typeof value === 'string' && value ? value : undefined
  } catch {
    return undefined
  }
}

async function hydrateOwnerSecretsFromIndexedDb(): Promise<void> {
  const db = await openOwnerSecretDb()
  if (db === null) return

  try {
    const tx = db.transaction(ownerSecretStoreName, 'readonly')
    const store = tx.objectStore(ownerSecretStoreName)
    const keys = await requestToPromise(store.getAllKeys())
    const values = await requestToPromise(store.getAll())
    keys.forEach((key, index) => {
      if (typeof key !== 'string') return
      const value = values[index]
      if (typeof value === 'string' && value) {
        memoryOwnerSecrets.set(key, value)
      }
    })
  } catch {}
}

export function hydrateAnonymousOwnerSecretsFromIndexedDb(): Promise<void> {
  ownerSecretHydrationPromise ??= hydrateOwnerSecretsFromIndexedDb()
  return ownerSecretHydrationPromise
}

export function migrateAnonymousOwnerSecretsFromLocalStorage(
  store: OwnerSecretStore,
): void {
  if (!hasIndexedDb()) return
  if (typeof store.key !== 'function' || typeof store.length !== 'number') {
    return
  }

  for (let i = store.length - 1; i >= 0; i -= 1) {
    const key = store.key(i)
    if (key === null) continue
    const sessionId = getSessionIdFromOwnerSecretKey(key)
    if (sessionId === null) continue

    const ownerSecret = store.getItem(key)
    if (!ownerSecret) {
      store.removeItem(key)
      continue
    }

    memoryOwnerSecrets.set(sessionId, ownerSecret)
    void writeOwnerSecretToIndexedDb(sessionId, ownerSecret).then((written) => {
      if (written) store.removeItem(key)
    })
  }
}

function persistOwnerSecretAsync(
  store: OwnerSecretStore,
  sessionId: string,
  ownerSecret: string,
) {
  void writeOwnerSecretToIndexedDb(sessionId, ownerSecret).then((written) => {
    const key = getAnonymousOwnerSecretKey(sessionId)
    if (written) {
      store.removeItem(key)
      return
    }
    store.setItem(key, ownerSecret)
  })
}

export function persistAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
  ownerSecret: string,
): void {
  const normalizedSessionId = sessionId.trim()
  const normalizedOwnerSecret = ownerSecret.trim()
  if (!normalizedSessionId || !normalizedOwnerSecret) return

  memoryOwnerSecrets.set(normalizedSessionId, normalizedOwnerSecret)

  if (!hasIndexedDb()) {
    store.setItem(
      getAnonymousOwnerSecretKey(normalizedSessionId),
      normalizedOwnerSecret,
    )
    return
  }

  persistOwnerSecretAsync(store, normalizedSessionId, normalizedOwnerSecret)
}

export function readAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
): string | undefined {
  const normalizedSessionId = sessionId.trim()
  if (!normalizedSessionId) return undefined

  const cached = memoryOwnerSecrets.get(normalizedSessionId)
  if (cached) return cached

  const key = getAnonymousOwnerSecretKey(normalizedSessionId)
  const legacyValue = store.getItem(key)
  if (legacyValue) {
    memoryOwnerSecrets.set(normalizedSessionId, legacyValue)
    if (hasIndexedDb()) {
      void writeOwnerSecretToIndexedDb(normalizedSessionId, legacyValue).then(
        (written) => {
          if (written) store.removeItem(key)
        },
      )
    }
    return legacyValue
  }

  void readOwnerSecretFromIndexedDb(normalizedSessionId).then((value) => {
    if (value) memoryOwnerSecrets.set(normalizedSessionId, value)
  })
  return undefined
}

export function forgetAnonymousOwnerSecret(
  store: OwnerSecretStore,
  sessionId: string,
): void {
  const normalizedSessionId = sessionId.trim()
  if (!normalizedSessionId) return

  memoryOwnerSecrets.delete(normalizedSessionId)
  store.removeItem(getAnonymousOwnerSecretKey(normalizedSessionId))
  void deleteOwnerSecretFromIndexedDb(normalizedSessionId)
}

export function resetAnonymousOwnerSecretPersistenceForTest(): void {
  memoryOwnerSecrets.clear()
  ownerSecretDbPromise = null
  ownerSecretHydrationPromise = null
}

if (typeof window !== 'undefined') {
  void hydrateAnonymousOwnerSecretsFromIndexedDb()
  migrateAnonymousOwnerSecretsFromLocalStorage(window.localStorage)
}
