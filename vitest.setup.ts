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

type CrossRealmHTMLElement = {
  readonly nodeType: number
  readonly tagName: string
}

function isCrossRealmHTMLElement(
  value: unknown,
): value is CrossRealmHTMLElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    'nodeType' in value &&
    value.nodeType === 1 &&
    'tagName' in value &&
    typeof value.tagName === 'string'
  )
}

function isCrossRealmHTMLButtonElement(value: unknown): boolean {
  return isCrossRealmHTMLElement(value) && value.tagName === 'BUTTON'
}

class NodeEnvironmentHTMLElement {
  static [Symbol.hasInstance] = isCrossRealmHTMLElement
}

class NodeEnvironmentHTMLButtonElement extends NodeEnvironmentHTMLElement {
  static [Symbol.hasInstance] = isCrossRealmHTMLButtonElement
}

if (typeof globalThis.HTMLElement === 'undefined') {
  Object.defineProperty(globalThis, 'HTMLElement', {
    configurable: true,
    value: NodeEnvironmentHTMLElement,
  })
}

if (typeof globalThis.HTMLButtonElement === 'undefined') {
  Object.defineProperty(globalThis, 'HTMLButtonElement', {
    configurable: true,
    value: NodeEnvironmentHTMLButtonElement,
  })
}

type MemoryStorage = Pick<
  Storage,
  'clear' | 'getItem' | 'key' | 'length' | 'removeItem' | 'setItem'
>

function createMemoryStorage(): MemoryStorage {
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

function defineStorage(name: 'localStorage' | 'sessionStorage') {
  const storage = createMemoryStorage()

  for (const host of [globalThis, globalThis.window].filter(Boolean)) {
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
