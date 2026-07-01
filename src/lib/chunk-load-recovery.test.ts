// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  installDynamicImportRecovery,
  isDynamicImportLoadError,
  recoverFromDynamicImportLoadError,
} from './chunk-load-recovery'

describe('chunk load recovery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('installs browser event recovery, prevents duplicate reloads, and can be removed', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://ship-fast.io/generate/k574ms14ma9f94keq30r7dq24x89n1k2',
        reload,
      },
    })
    window.sessionStorage.clear()

    const removeRecovery = installDynamicImportRecovery(window)
    const firstEvent = new PromiseRejectionEvent('unhandledrejection', {
      cancelable: true,
      promise: Promise.resolve(),
      reason: new TypeError(
        'Failed to fetch dynamically imported module: https://ship-fast.io/assets/generate._sessionId-cCxQkyc8.js',
      ),
    })
    const secondEvent = new PromiseRejectionEvent('unhandledrejection', {
      cancelable: true,
      promise: Promise.resolve(),
      reason: new Error('error loading dynamically imported module'),
    })

    window.dispatchEvent(firstEvent)
    window.dispatchEvent(secondEvent)
    removeRecovery()
    const afterRemoveEvent = new PromiseRejectionEvent('unhandledrejection', {
      cancelable: true,
      promise: Promise.resolve(),
      reason: new Error('ChunkLoadError: Loading chunk dashboard failed'),
    })
    window.dispatchEvent(afterRemoveEvent)

    expect(firstEvent.defaultPrevented).toBe(true)
    expect(secondEvent.defaultPrevented).toBe(false)
    expect(afterRemoveEvent.defaultPrevented).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(
      window.sessionStorage.getItem('ship-fast:dynamic-import-recovered'),
    ).toBe('https://ship-fast.io/generate/k574ms14ma9f94keq30r7dq24x89n1k2')
  })
})
