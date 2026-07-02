// Vitest global setup.
//
// jsdom (as bundled here) does not expose Web Storage, so `window.localStorage`
// and `window.sessionStorage` are `undefined` inside the jsdom test environment.
// Any component/hook that touches Storage (e.g. the prompt-home controller's
// ready-session cache and anonymous client id) would crash with
// "Cannot read properties of undefined". Install a minimal in-memory Storage
// implementation only when running in a DOM-like environment that is missing it,
// so pure `node`-environment tests are left untouched.

process.env.VITE_DISABLE_CLERK = 'false'

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
