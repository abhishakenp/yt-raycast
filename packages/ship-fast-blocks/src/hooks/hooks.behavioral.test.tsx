// @vitest-environment jsdom

import { act, cleanup, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useKeypress } from './use-keypress'
import { useIsMobile } from './use-mobile'

type MatchMediaListener = () => void

function installMatchMedia(matches: boolean, width: number) {
  const listeners = new Set<MatchMediaListener>()
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
    writable: true,
  })
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: (_event: string, listener: () => void) => {
        listeners.add(listener)
      },
      matches,
      media: '(max-width: 767px)',
      removeEventListener: (_event: string, listener: () => void) => {
        listeners.delete(listener)
      },
    })),
  })
  return {
    resizeTo(nextWidth: number) {
      window.innerWidth = nextWidth
      act(() => {
        for (const listener of listeners) listener()
      })
    },
  }
}

describe('ship-fast block hooks', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    delete (window as Omit<Window, 'matchMedia'> & { matchMedia?: unknown })
      .matchMedia
  })

  it('updates mobile state from matchMedia change events and viewport width', () => {
    const screen = installMatchMedia(false, 1024)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    screen.resizeTo(420)
    expect(result.current).toBe(true)

    screen.resizeTo(900)
    expect(result.current).toBe(false)
  })

  it('does not crash generated UI hooks when matchMedia is unavailable', () => {
    delete (window as Omit<Window, 'matchMedia'> & { matchMedia?: unknown })
      .matchMedia

    expect(() => renderHook(() => useIsMobile())).not.toThrow()
  })

  it('fires normalized keyboard shortcut chords outside editable controls', () => {
    const onShortcut = vi.fn()
    renderHook(() =>
      useKeypress({
        combo: ['shift+meta+k', 'ctrl+b'],
        callback: onShortcut,
      }),
    )

    fireEvent.keyDown(window, { key: 'k', metaKey: true, shiftKey: true })
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })

    expect(onShortcut).toHaveBeenCalledTimes(2)
    expect(onShortcut.mock.calls[0]?.[0].defaultPrevented).toBe(true)
  })

  it('ignores shortcuts while focus is inside form fields or contentEditable text', () => {
    const onShortcut = vi.fn()
    renderHook(() =>
      useKeypress({
        combo: 'meta+k',
        callback: onShortcut,
      }),
    )
    const input = document.createElement('input')
    const editor = document.createElement('div')
    editor.contentEditable = 'true'
    Object.defineProperty(editor, 'isContentEditable', {
      configurable: true,
      value: true,
    })
    document.body.append(input, editor)

    fireEvent.keyDown(input, { key: 'k', metaKey: true })
    fireEvent.keyDown(editor, { key: 'k', metaKey: true })
    fireEvent.keyDown(window, { key: 'k', metaKey: true })

    expect(onShortcut).toHaveBeenCalledTimes(1)
  })
})
