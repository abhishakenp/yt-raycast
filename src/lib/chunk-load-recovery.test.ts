import { describe, expect, it } from 'vitest'
import {
  isDynamicImportLoadError,
  recoverFromDynamicImportLoadError,
} from './chunk-load-recovery'

describe('chunk load recovery', () => {
  it('recognizes dynamic import fetch failures from deployed route chunks', () => {
    expect(
      isDynamicImportLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://ship-fast.io/assets/generate._sessionId-cCxQkyc8.js',
        ),
      ),
    ).toBe(true)
    expect(isDynamicImportLoadError(new Error('ArgumentValidationError'))).toBe(
      false,
    )
  })

  it('reloads once per url for dynamic import failures', () => {
    const storage = new Map<string, string>()
    let reloads = 0
    const reason = new Error('error loading dynamically imported module')

    const first = recoverFromDynamicImportLoadError({
      href: 'https://ship-fast.io/generate/demo',
      reason,
      reload: () => {
        reloads += 1
      },
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    })
    const second = recoverFromDynamicImportLoadError({
      href: 'https://ship-fast.io/generate/demo',
      reason,
      reload: () => {
        reloads += 1
      },
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    })

    expect(first).toBe(true)
    expect(second).toBe(false)
    expect(reloads).toBe(1)
  })
})
