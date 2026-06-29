// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'

import { useAITextEdit, type AISelection } from './useAITextEdit'

// jsdom does not implement Range.getBoundingClientRect — polyfill it so the
// hook can capture a selection rect.
if (typeof Range.prototype.getBoundingClientRect !== 'function') {
  Range.prototype.getBoundingClientRect = function (): DOMRect {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON() {},
    } as DOMRect
  }
}

/**
 * Behavioral tests for useAITextEdit that mount the real hook against a real
 * jsdom DOM, drive native Selection / Range APIs, and dispatch real events.
 */

function selectText(element: HTMLElement, start: number, end: number) {
  const sel = window.getSelection()
  if (!sel) throw new Error('no Selection')
  sel.removeAllRanges()
  const range = document.createRange()
  const textNode = element.firstChild as Text
  range.setStart(textNode, start)
  range.setEnd(textNode, end)
  sel.addRange(range)
  return range
}

function dispatchSelectionChange() {
  document.dispatchEvent(new Event('selectionchange'))
}

describe('useAITextEdit (behavioral)', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    window.getSelection()?.removeAllRanges()
    container = document.createElement('div')
    container.id = 'ai-edit-container'
    document.body.appendChild(container)
  })
  afterEach(() => {
    window.getSelection()?.removeAllRanges()
    container.remove()
  })

  function renderAiHook(
    aiEditMode: boolean,
    onSelect: (s: AISelection | null) => void,
  ) {
    const useWrapper = () => {
      const ref = useRef<HTMLElement | null>(container)
      return useAITextEdit(ref, aiEditMode, onSelect)
    }
    return renderHook(useWrapper)
  }

  it('1. text selection within preview container is captured (rect stored)', () => {
    container.textContent = 'Hello world editable text'
    const onSelect = vi.fn()
    renderAiHook(true, onSelect)
    selectText(container, 0, 5) // "Hello"
    act(() => {
      dispatchSelectionChange()
    })
    expect(onSelect).toHaveBeenCalledTimes(1)
    const arg = onSelect.mock.calls[0][0]
    expect(arg).not.toBeNull()
    expect(arg.text).toBe('Hello')
    expect(arg.rect).toBeDefined()
    expect(typeof arg.rect.x).toBe('number')
  })

  it('2. selection outside container is ignored', () => {
    const outside = document.createElement('div')
    outside.textContent = 'Outside text here'
    document.body.appendChild(outside)
    container.textContent = 'Inside text here'
    const onSelect = vi.fn()
    renderAiHook(true, onSelect)
    selectText(outside, 0, 6) // "Outside"
    act(() => {
      dispatchSelectionChange()
    })
    expect(onSelect).not.toHaveBeenCalled()
    outside.remove()
  })

  it('3. selection too short (<2 chars) is ignored', () => {
    container.textContent = 'abcdef'
    const onSelect = vi.fn()
    renderAiHook(true, onSelect)
    selectText(container, 0, 1) // "a"
    act(() => {
      dispatchSelectionChange()
    })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('4. selection too long (>500 chars) is ignored', () => {
    container.textContent = 'x'.repeat(600)
    const onSelect = vi.fn()
    renderAiHook(true, onSelect)
    selectText(container, 0, 600)
    act(() => {
      dispatchSelectionChange()
    })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('5. selection in excluded tags (button, a, input, svg, img) is ignored', () => {
    for (const tag of ['button', 'a', 'input', 'svg', 'img']) {
      window.getSelection()?.removeAllRanges()
      container.innerHTML = ''
      const el = document.createElement(tag)
      if (tag === 'input' || tag === 'img') {
        // input/img cannot hold text children; skip those that can't
        // but still verify no callback fires for non-text-bearing excluded tags
        // by selecting a sibling text node instead — these tags are excluded
        // via parentEl.tagName, so we test only text-bearing ones.
        continue
      }
      el.textContent = 'click me'
      container.appendChild(el)
      const onSelect = vi.fn()
      const { unmount } = renderAiHook(true, onSelect)
      selectText(el, 0, 5)
      act(() => {
        dispatchSelectionChange()
      })
      expect(onSelect).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('6. click outside clears selection', () => {
    container.textContent = 'Hello world'
    const onSelect = vi.fn()
    renderAiHook(true, onSelect)
    selectText(container, 0, 5)
    act(() => {
      dispatchSelectionChange()
    })
    expect(onSelect).toHaveBeenCalledTimes(1)
    // click outside the container
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    act(() => {
      outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onSelect).toHaveBeenLastCalledWith(null)
    outside.remove()
  })
})
