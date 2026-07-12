// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'

import { composeRefs, useComposedRefs } from './compose-refs'

describe('composeRefs', () => {
  it('sets .current on a RefObject', () => {
    const ref = React.createRef<HTMLDivElement>()
    const node = document.createElement('div')
    composeRefs(ref)(node)

    expect(ref.current).toBe(node)
  })

  it('calls a callback ref with the node', () => {
    const cb = vi.fn()
    const node = document.createElement('div')
    composeRefs(cb)(node)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(node)
  })

  it('handles null refs without throwing', () => {
    const node = document.createElement('div')
    expect(() => composeRefs(null, undefined)(node)).not.toThrow()
  })

  it('applies a mix of RefObject and callback refs', () => {
    const objRef = React.createRef<HTMLDivElement>()
    const cb = vi.fn()
    const node = document.createElement('div')
    composeRefs(objRef, cb, undefined, null)(node)

    expect(objRef.current).toBe(node)
    expect(cb).toHaveBeenCalledWith(node)
  })

  it('returns a cleanup function when a callback ref returns one', () => {
    const cleanupFn = vi.fn()
    const cb = vi.fn(() => cleanupFn)
    const node = document.createElement('div')
    const composed = composeRefs(cb)
    const returned = composed(node)

    expect(typeof returned).toBe('function')
    returned?.()
    expect(cleanupFn).toHaveBeenCalledTimes(1)
  })

  it('cleanup resets RefObject.current to null when that ref has no callback cleanup', () => {
    const objRef = React.createRef<HTMLDivElement>()
    const siblingCleanup = vi.fn()
    const node = document.createElement('div')
    // A sibling callback returning a cleanup forces the composed ref to
    // return a cleanup function; the RefObject has no cleanup so it is reset
    // to null during cleanup.
    const composed = composeRefs(objRef, () => siblingCleanup)
    const returned = composed(node)

    expect(objRef.current).toBe(node)
    returned?.()
    expect(siblingCleanup).toHaveBeenCalledTimes(1)
    expect(objRef.current).toBeNull()
  })

  it('does not return a cleanup when no callback ref returns one', () => {
    const objRef = React.createRef<HTMLDivElement>()
    const cb = vi.fn(() => undefined)
    const node = document.createElement('div')
    const returned = composeRefs(objRef, cb)(node)

    expect(returned).toBeUndefined()
  })

  it('cleanup runs each callback cleanup and resets refs without cleanup', () => {
    const cleanupA = vi.fn()
    const cleanupB = vi.fn()
    const objRef = React.createRef<HTMLDivElement>()
    const node = document.createElement('div')
    const composed = composeRefs(
      vi.fn(() => cleanupA),
      objRef,
      vi.fn(() => cleanupB),
    )
    const returned = composed(node)

    returned?.()
    expect(cleanupA).toHaveBeenCalledTimes(1)
    expect(cleanupB).toHaveBeenCalledTimes(1)
    expect(objRef.current).toBeNull()
  })
})

describe('useComposedRefs', () => {
  afterEach(() => {
    cleanup()
  })

  it('returns a stable callback identity across renders when refs are unchanged', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { result, rerender } = renderHook(() => useComposedRefs(ref))

    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('updates refs when the composed callback is invoked with a node', () => {
    const ref = React.createRef<HTMLDivElement>()
    const cb = vi.fn()
    const { result } = renderHook(() => useComposedRefs(ref, cb))
    const node = document.createElement('div')

    act(() => {
      result.current(node)
    })

    expect(ref.current).toBe(node)
    expect(cb).toHaveBeenCalledWith(node)
  })

  it('produces a new callback when a ref dependency changes', () => {
    const refA = React.createRef<HTMLDivElement>()
    const refB = React.createRef<HTMLDivElement>()
    const { result, rerender } = renderHook(({ r }) => useComposedRefs(r), {
      initialProps: { r: refA },
    })

    const first = result.current
    rerender({ r: refB })
    expect(result.current).not.toBe(first)
  })
})
