// Vitest global setup.
//
// jsdom (as bundled here) does not expose Web Storage, so `window.localStorage`
// and `window.sessionStorage` are `undefined` inside the jsdom test environment.
// Any component/hook that touches Storage (e.g. the prompt-home controller's
// ready-session cache and anonymous client id) would crash with
// "Cannot read properties of undefined". Install a minimal in-memory Storage
// implementation only when running in a DOM-like environment that is missing it,
// so pure `node`-environment tests are left untouched.

class MemoryStorage implements Storage {
  #map = new Map<string, string>()

  get length(): number {
    return this.#map.size
  }

  clear(): void {
    this.#map.clear()
  }

  getItem(key: string): string | null {
    return this.#map.has(key) ? (this.#map.get(key) as string) : null
  }

  key(index: number): string | null {
    return Array.from(this.#map.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.#map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.#map.set(key, String(value))
  }
}

const installStorage = (name: 'localStorage' | 'sessionStorage'): void => {
  if (typeof window === 'undefined') return
  if (window[name]) return
  Object.defineProperty(window, name, {
    value: new MemoryStorage(),
    configurable: true,
    writable: false,
  })
}

installStorage('localStorage')
installStorage('sessionStorage')
