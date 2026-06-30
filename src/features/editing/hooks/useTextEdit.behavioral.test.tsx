// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'

// jsdom does not implement execCommand — mock it to insert text at caret.
if (!document.execCommand) {
  document.execCommand = ((
    command: string,
    _showUI?: boolean,
    value?: string,
  ) => {
    if (command !== 'insertText') return false
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false
    const range = sel.getRangeAt(0)
    const container = range.startContainer
    const offset = range.startOffset
    if (container.nodeType === Node.TEXT_NODE) {
      const current = container.textContent ?? ''
      container.textContent =
        current.slice(0, offset) + (value ?? '') + current.slice(offset)
      range.setStart(container, offset + (value?.length ?? 0))
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      range.insertNode(document.createTextNode(value ?? ''))
    }
    return true
  }) as typeof document.execCommand
}

import { useTextEdit } from './useTextEdit'

/**
 * Behavioral tests for useTextEdit that mount the actual hook with a real
 * DOM, simulate real keyboard events, and verify the outcome. These catch
 * regressions that source-contains assertions cannot.
 */

describe('useTextEdit: icon deletion prevention (end-to-end)', () => {
  function setupButtonWithIcon(text: string): {
    container: HTMLDivElement
    btn: HTMLButtonElement
    svg: HTMLElement
    textNode: Text
  } {
    const container = document.createElement('div')
    container.id = 'edit-container'
    document.body.appendChild(container)

    const btn = document.createElement('button')
    btn.textContent = ''
    const svg = document.createElement('svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    const path = document.createElement('path')
    path.setAttribute('d', 'M18.71 19.5')
    svg.appendChild(path)
    btn.appendChild(svg)
    const textNode = document.createTextNode(text)
    btn.appendChild(textNode)
    container.appendChild(btn)

    return { container, btn, svg, textNode }
  }

  function cleanup(container: HTMLDivElement) {
    container.remove()
  }

  /** Place collapsed caret at the given offset in the text node. */
  function placeCaret(textNode: Text, offset: number) {
    const range = document.createRange()
    range.setStart(textNode, offset)
    range.collapse(true)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
  }

  /** Simulate clicking the button to activate editing. */
  function activateEdit(btn: HTMLButtonElement) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    })
    btn.dispatchEvent(event)
  }

  it('SVG survives backspace at start of text (collapsed caret at offset 0)', () => {
    const { container, btn, svg, textNode } = setupButtonWithIcon('Google Play')

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    // Activate editing by clicking the button
    act(() => {
      activateEdit(btn)
    })

    // Place caret at offset 0 (right after SVG, at start of text)
    placeCaret(textNode, 0)

    // Press Backspace — should be prevented because it would delete the SVG
    act(() => {
      const backspace = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(backspace)
    })

    // SVG must still be in the DOM
    expect(btn.contains(svg)).toBe(true)
    expect(btn.children.length).toBe(1) // SVG still there
    expect(textNode.textContent).toBe('Google Play') // text unchanged

    cleanup(container)
  })

  it('SVG survives Delete at end of text (text before SVG)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const btn = document.createElement('button')
    const textNode = document.createTextNode('Google Play')
    btn.appendChild(textNode)
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    container.appendChild(btn)

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      activateEdit(btn)
    })

    // Place caret at end of text (right before SVG)
    placeCaret(textNode, textNode.textContent!.length)

    // Press Delete — should be prevented because it would delete the SVG
    act(() => {
      const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(deleteEvent)
    })

    // SVG must still be in the DOM
    expect(btn.contains(svg)).toBe(true)
    expect(textNode.textContent).toBe('Google Play')

    cleanup(container)
  })

  it('backspace in the middle of text works normally (no locked child affected)', () => {
    const { container, btn, svg, textNode } = setupButtonWithIcon('Google Play')

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      activateEdit(btn)
    })

    // Place caret at offset 3 (in the middle of "Goo")
    placeCaret(textNode, 3)

    // Press Backspace — should NOT be prevented
    let prevented = false
    act(() => {
      const backspace = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(backspace)
      prevented = backspace.defaultPrevented
    })

    // Should not be prevented — normal text editing
    expect(prevented).toBe(false)
    // SVG still there (wasn't affected)
    expect(btn.contains(svg)).toBe(true)

    cleanup(container)
  })

  it('SVG survives selection spanning SVG and text (non-collapsed)', () => {
    const { container, btn, svg, textNode } = setupButtonWithIcon('Google Play')

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      activateEdit(btn)
    })

    // Create a selection that spans from the SVG to the middle of the text
    const range = document.createRange()
    range.setStart(svg, 0)
    range.setEnd(textNode, 3)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    // Press Backspace — should be prevented because selection includes SVG
    let prevented = false
    act(() => {
      const backspace = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(backspace)
      prevented = backspace.defaultPrevented
    })

    // Should be prevented — selection includes a locked child
    expect(prevented).toBe(true)
    // SVG must still be in the DOM
    expect(btn.contains(svg)).toBe(true)

    cleanup(container)
  })

  it('text edit without SVG (no locked children) allows backspace normally', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const btn = document.createElement('button')
    btn.textContent = 'Click Me'
    container.appendChild(btn)

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      activateEdit(btn)
    })

    const textNode = btn.firstChild as Text
    placeCaret(textNode, 0)

    // Press Backspace — should NOT be prevented (no locked children)
    let prevented = false
    act(() => {
      const backspace = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(backspace)
      prevented = backspace.defaultPrevented
    })

    expect(prevented).toBe(false)

    cleanup(container)
  })
})

describe('useTextEdit: space typing in buttons (end-to-end)', () => {
  it('space keydown is prevented and does not commit the edit', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const btn = document.createElement('button')
    btn.textContent = 'Get Started'
    container.appendChild(btn)

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    // Activate editing
    act(() => {
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      })
      btn.dispatchEvent(click)
    })

    // Press Space
    let prevented = false
    act(() => {
      const space = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(space)
      prevented = space.defaultPrevented
    })

    // Space should be prevented (stops button activation)
    expect(prevented).toBe(true)
    // onTextChange should NOT have been called (edit not committed)
    expect(onTextChange).not.toHaveBeenCalled()

    container.remove()
  })
})

describe('useTextEdit: alert dialog focus during active edits', () => {
  it('keeps the edit active when blur focus moves to an alertdialog portal', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const paragraph = document.createElement('p')
    const textNode = document.createTextNode('Delete me')
    paragraph.appendChild(textNode)
    container.appendChild(paragraph)

    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'alertdialog')
    dialog.tabIndex = -1
    document.body.appendChild(dialog)

    const rafCallbacks: FrameRequestCallback[] = []
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback)
      return rafCallbacks.length
    }) as typeof requestAnimationFrame
    globalThis.cancelAnimationFrame = vi.fn()

    const onTextChange = vi.fn()
    const { result, unmount } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    try {
      act(() => {
        paragraph.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          }),
        )
      })

      textNode.nodeValue = 'Delete me now'
      act(() => {
        dialog.focus()
        paragraph.dispatchEvent(
          new FocusEvent('blur', {
            bubbles: false,
            relatedTarget: dialog,
          }),
        )
      })
      act(() => {
        for (const callback of rafCallbacks.splice(0)) {
          callback(0)
        }
      })

      expect(onTextChange).not.toHaveBeenCalled()

      act(() => {
        result.current.commitEdit()
      })

      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'Delete me',
          newText: 'Delete me now',
          element: paragraph,
          occurrenceIndex: 0,
        }),
      )
      expect(paragraph.hasAttribute('contenteditable')).toBe(false)
    } finally {
      unmount()
      container.remove()
      dialog.remove()
      globalThis.requestAnimationFrame = originalRequestAnimationFrame
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame
    }
  })
})
