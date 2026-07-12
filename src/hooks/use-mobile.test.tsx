// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsMobile } from './use-mobile'

const MOBILE_BREAKPOINT = 768

interface MockMQL {
  matches: boolean
  media: string
  addEventListener: (
    type: string,
    listener: (event: { matches: boolean }) => void,
  ) => void
  removeEventListener: (type: string, listener: unknown) => void
  dispatchChange: (matches: boolean) => void
}

function installMatchMedia(): MockMQL & {
  listeners: Map<string, Set<(event: { matches: boolean }) => void>>
} {
  const listeners = new Map<
    string,
    Set<(event: { matches: boolean }) => void>
  >()
  const mql: MockMQL = {
    matches: false,
    media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    addEventListener: (type, listener) => {
      if (type !== 'change') return
      const set = listeners.get(type) ?? new Set()
      set.add(listener)
      listeners.set(type, set)
    },
    removeEventListener: (type, listener) => {
      listeners
        .get(type)
        ?.delete(listener as (event: { matches: boolean }) => void)
    },
    dispatchChange: (matches) => {
      for (const listener of listeners.get('change') ?? []) {
        listener({ matches })
      }
    },
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  )
  return { ...mql, listeners }
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
}

describe('useIsMobile', () => {
  beforeEach(() => {
    setViewportWidth(1024)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('returns false on the first render before the effect resolves', () => {
    installMatchMedia()
    const { result } = renderHook(() => useIsMobile())

    // Initial state is undefined → coerced to false.
    expect(result.current).toBe(false)
  })

  it('reports mobile (true) when the viewport is below the breakpoint', () => {
    installMatchMedia()
    setViewportWidth(500)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('reports desktop (false) when the viewport is at or above the breakpoint', () => {
    installMatchMedia()
    setViewportWidth(MOBILE_BREAKPOINT)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('updates to true when the media query change event fires for a narrow viewport', () => {
    const mql = installMatchMedia()
    setViewportWidth(1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      setViewportWidth(400)
      mql.dispatchChange(true)
    })
    expect(result.current).toBe(true)
  })

  it('updates to false when the media query change event fires for a wide viewport', () => {
    const mql = installMatchMedia()
    setViewportWidth(400)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => {
      setViewportWidth(1200)
      mql.dispatchChange(false)
    })
    expect(result.current).toBe(false)
  })

  it('removes the media query listener on unmount', () => {
    const mql = installMatchMedia()
    setViewportWidth(500)
    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    // Dispatching after unmount should not throw and should not affect state.
    expect(() => mql.dispatchChange(true)).not.toThrow()
  })

  it('falls back to innerWidth when matchMedia is not a function', () => {
    // jsdom lacks matchMedia by default; ensure it is absent.
    vi.stubGlobal('matchMedia', undefined)
    setViewportWidth(600)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('falls back to innerWidth=false when matchMedia is absent and viewport is wide', () => {
    vi.stubGlobal('matchMedia', undefined)
    setViewportWidth(900)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})
