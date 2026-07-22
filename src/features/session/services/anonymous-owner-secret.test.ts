import { afterEach, describe, expect, it } from 'vitest'

import {
  createAnonymousOwnerSecret,
  forgetAnonymousOwnerSecret,
  getAnonymousOwnerSecretKey,
  hydrateAnonymousOwnerSecretsFromIndexedDb,
  migrateAnonymousOwnerSecretsFromLocalStorage,
  persistAnonymousOwnerSecret,
  readAnonymousOwnerSecret,
  resetAnonymousOwnerSecretPersistenceForTest,
} from '@/features/session/services/anonymous-owner-secret'

class MemoryOwnerSecretStore {
  private readonly values = new Map<string, string>()

  getItem = (key: string): string | null => this.values.get(key) ?? null

  key = (index: number): string | null =>
    Array.from(this.values.keys())[index] ?? null

  get length(): number {
    return this.values.size
  }

  setItem = (key: string, value: string): void => {
    this.values.set(key, value)
  }

  removeItem = (key: string): void => {
    this.values.delete(key)
  }
}

type FakeIndexedDbRequest<T> = {
  result: T
  error: DOMException | null
  onsuccess: (() => void) | null
  onerror: (() => void) | null
}

type FakeIndexedDbOpenRequest = FakeIndexedDbRequest<FakeIndexedDbDatabase> & {
  onupgradeneeded: (() => void) | null
  onblocked: (() => void) | null
}

class FakeIndexedDbObjectStore {
  constructor(private readonly values: Map<string, string>) {}

  put = (value: string, key: string): IDBRequest<IDBValidKey> =>
    createFakeRequest<IDBValidKey>(() => {
      this.values.set(key, value)
      return key
    })

  get = (key: string): IDBRequest<string | undefined> =>
    createFakeRequest(() => this.values.get(key))

  delete = (key: string): IDBRequest<undefined> =>
    createFakeRequest(() => {
      this.values.delete(key)
      return undefined
    })

  getAllKeys = (): IDBRequest<IDBValidKey[]> =>
    createFakeRequest<IDBValidKey[]>(() => Array.from(this.values.keys()))

  getAll = (): IDBRequest<string[]> =>
    createFakeRequest(() => Array.from(this.values.values()))
}

class FakeIndexedDbDatabase {
  readonly objectStoreNames = {
    contains: () => true,
  }

  constructor(private readonly values: Map<string, string>) {}

  createObjectStore = (): FakeIndexedDbObjectStore =>
    new FakeIndexedDbObjectStore(this.values)

  transaction = (): { objectStore: () => FakeIndexedDbObjectStore } => ({
    objectStore: () => new FakeIndexedDbObjectStore(this.values),
  })
}

class FakeIndexedDbFactory {
  readonly values = new Map<string, string>()

  open = (): IDBOpenDBRequest => {
    const database = new FakeIndexedDbDatabase(this.values)
    const request: FakeIndexedDbOpenRequest = {
      result: database,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
    }

    queueMicrotask(() => {
      request.onupgradeneeded?.()
      request.onsuccess?.()
    })

    return request as unknown as IDBOpenDBRequest
  }
}

const originalIndexedDbDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'indexedDB',
)

function installFakeIndexedDb(fakeIndexedDb: FakeIndexedDbFactory): void {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: fakeIndexedDb,
  })
}

async function settleIndexedDbTasks(): Promise<void> {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve()
  }
}

function createFakeRequest<T>(readResult: () => T): IDBRequest<T> {
  const request: FakeIndexedDbRequest<T> = {
    result: undefined as T,
    error: null,
    onsuccess: null,
    onerror: null,
  }

  queueMicrotask(() => {
    request.result = readResult()
    request.onsuccess?.()
  })

  return request as unknown as IDBRequest<T>
}

describe('anonymous owner secret', () => {
  afterEach(() => {
    if (originalIndexedDbDescriptor === undefined) {
      Reflect.deleteProperty(globalThis, 'indexedDB')
    } else {
      Object.defineProperty(
        globalThis,
        'indexedDB',
        originalIndexedDbDescriptor,
      )
    }
    resetAnonymousOwnerSecretPersistenceForTest()
  })

  it('creates a 32 byte hex secret', () => {
    const secret = createAnonymousOwnerSecret((bytes) => {
      bytes.fill(15)
      return bytes
    })

    expect(secret).toHaveLength(64)
    expect(secret).toBe('0f'.repeat(32))
  })

  it('stores, reads, and forgets session owner secrets', () => {
    const store = new MemoryOwnerSecretStore()

    persistAnonymousOwnerSecret(store, 'session_1', 'secret_1')

    expect(readAnonymousOwnerSecret(store, 'session_1')).toBe('secret_1')

    forgetAnonymousOwnerSecret(store, 'session_1')

    expect(readAnonymousOwnerSecret(store, 'session_1')).toBeUndefined()
  })

  it('migrates legacy localStorage owner secrets into IndexedDB and removes migrated keys', async () => {
    const fakeIndexedDb = new FakeIndexedDbFactory()
    installFakeIndexedDb(fakeIndexedDb)
    const store = new MemoryOwnerSecretStore()
    const key = getAnonymousOwnerSecretKey('session_legacy')
    store.setItem(key, 'secret_legacy')

    migrateAnonymousOwnerSecretsFromLocalStorage(store)
    expect(readAnonymousOwnerSecret(store, 'session_legacy')).toBe(
      'secret_legacy',
    )

    await settleIndexedDbTasks()

    expect(fakeIndexedDb.values.get('session_legacy')).toBe('secret_legacy')
    expect(store.getItem(key)).toBeNull()
  })

  it('persists new owner secrets to IndexedDB without leaving localStorage keys', async () => {
    const fakeIndexedDb = new FakeIndexedDbFactory()
    installFakeIndexedDb(fakeIndexedDb)
    const store = new MemoryOwnerSecretStore()

    persistAnonymousOwnerSecret(store, 'session_new', 'secret_new')

    expect(readAnonymousOwnerSecret(store, 'session_new')).toBe('secret_new')
    await settleIndexedDbTasks()

    expect(fakeIndexedDb.values.get('session_new')).toBe('secret_new')
    expect(store.getItem(getAnonymousOwnerSecretKey('session_new'))).toBeNull()
  })

  it('hydrates owner secrets from IndexedDB into the sync read mirror', async () => {
    const fakeIndexedDb = new FakeIndexedDbFactory()
    fakeIndexedDb.values.set('session_indexed', 'secret_indexed')
    installFakeIndexedDb(fakeIndexedDb)
    const store = new MemoryOwnerSecretStore()

    await hydrateAnonymousOwnerSecretsFromIndexedDb()

    expect(readAnonymousOwnerSecret(store, 'session_indexed')).toBe(
      'secret_indexed',
    )
  })
})
