type MemoryStorage = Pick<
  Storage,
  'clear' | 'getItem' | 'key' | 'length' | 'removeItem' | 'setItem'
>

const createMemoryStorage = (): MemoryStorage => {
  const store = new Map<string, string>()

  return {
    clear: () => store.clear(),
    getItem: (key) => store.get(String(key)) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
    removeItem: (key) => {
      store.delete(String(key))
    },
    setItem: (key, value) => {
      store.set(String(key), String(value))
    },
  }
}

const defineStorage = (name: 'localStorage' | 'sessionStorage') => {
  const storage = createMemoryStorage()

  for (const target of [globalThis, globalThis.window].filter(Boolean)) {
    const host = target as typeof globalThis
    try {
      if (host[name]) continue
    } catch {
      // Some DOM shims expose a throwing storage getter for opaque origins.
    }

    Object.defineProperty(host, name, {
      configurable: true,
      value: storage,
    })
  }
}

defineStorage('localStorage')
defineStorage('sessionStorage')
