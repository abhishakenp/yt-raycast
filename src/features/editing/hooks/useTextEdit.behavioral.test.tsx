// @vitest-environment jsdom
import { act, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef, useState } from 'react'

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

describe('useTextEdit: React-managed contentEditable warnings', () => {
  function EditableHarness({ revision }: { revision: number }) {
    const ref = useRef<HTMLDivElement>(null)
    useTextEdit(ref, true, vi.fn())
    return (
      <div ref={ref} data-revision={revision}>
        <h1>Hero headline</h1>
      </div>
    )
  }

  it('keeps parent rerenders quiet while a React-rendered text node is being edited', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { container, rerender } = render(<EditableHarness revision={0} />)
      const heading = container.querySelector('h1') as HTMLHeadingElement

      act(() => {
        heading.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          }),
        )
      })
      expect(heading.contentEditable).toBe('true')

      rerender(<EditableHarness revision={1} />)

      const contentEditableWarnings = errorSpy.mock.calls.filter((call) =>
        call.some((value) =>
          String(value).includes('A component is `contentEditable`'),
        ),
      )
      expect(contentEditableWarnings).toHaveLength(0)
    } finally {
      errorSpy.mockRestore()
    }
  })

  function ActivatingEditableHarness() {
    const ref = useRef<HTMLDivElement>(null)
    const [activationCount, setActivationCount] = useState(0)
    useTextEdit(ref, true, vi.fn(), undefined, () => {
      setActivationCount((count) => count + 1)
    })
    return (
      <div ref={ref} data-activation-count={activationCount}>
        <h1>Hero headline</h1>
      </div>
    )
  }

  it('keeps toolbar activation rerenders quiet while a React-rendered text node becomes editable', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { container } = render(<ActivatingEditableHarness />)
      const heading = container.querySelector('h1') as HTMLHeadingElement

      act(() => {
        heading.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          }),
        )
      })

      expect(heading.contentEditable).toBe('true')
      expect(
        container
          .querySelector('[data-activation-count]')
          ?.getAttribute('data-activation-count'),
      ).toBe('1')

      const contentEditableWarnings = errorSpy.mock.calls.filter((call) =>
        call.some((value) =>
          String(value).includes('A component is `contentEditable`'),
        ),
      )
      expect(contentEditableWarnings).toHaveLength(0)
    } finally {
      errorSpy.mockRestore()
    }
  })
})

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

describe('useTextEdit: link activation in edit mode', () => {
  it('clicking a link starts text editing and prevents navigation without committing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const link = document.createElement('a')
    link.href = '/pricing'
    link.textContent = 'Pricing'
    container.appendChild(link)

    const onTextChange = vi.fn()
    renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    let click!: MouseEvent
    act(() => {
      click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      })
      link.dispatchEvent(click)
    })

    expect(click.defaultPrevented).toBe(true)
    expect(link.contentEditable).toBe('true')
    expect(link.dataset.shipFastInlineEditing).toBe('true')
    expect(onTextChange).not.toHaveBeenCalled()

    container.remove()
  })
})

describe('useTextEdit: edit mode lifecycle', () => {
  function ToggleableHarness({
    editMode,
    onTextChange,
  }: {
    editMode: boolean
    onTextChange: Parameters<typeof useTextEdit>[2]
  }) {
    const ref = useRef<HTMLDivElement>(null)
    useTextEdit(ref, editMode, onTextChange)
    return (
      <div ref={ref}>
        <h2>Lifecycle headline</h2>
      </div>
    )
  }

  it('turning edit mode off cancels an active text edit instead of saving it', () => {
    const onTextChange = vi.fn()
    const { container, rerender } = render(
      <ToggleableHarness editMode={true} onTextChange={onTextChange} />,
    )
    const heading = container.querySelector('h2') as HTMLHeadingElement

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    expect(heading.contentEditable).toBe('true')

    heading.firstChild!.nodeValue = 'Unsaved lifecycle edit'

    rerender(<ToggleableHarness editMode={false} onTextChange={onTextChange} />)

    expect(onTextChange).not.toHaveBeenCalled()
    expect(heading.textContent).toBe('Lifecycle headline')
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
    expect(heading.hasAttribute('style')).toBe(false)
  })

  it('Escape cancels an active text edit and restores the original text', () => {
    const onTextChange = vi.fn()
    const { container } = render(
      <ToggleableHarness editMode={true} onTextChange={onTextChange} />,
    )
    const heading = container.querySelector('h2') as HTMLHeadingElement

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    heading.firstChild!.nodeValue = 'Cancelled lifecycle edit'

    act(() => {
      heading.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(onTextChange).not.toHaveBeenCalled()
    expect(heading.textContent).toBe('Lifecycle headline')
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
  })

  it('Enter commits an active text edit and cleans temporary edit attributes', () => {
    const onTextChange = vi.fn()
    const { container } = render(
      <ToggleableHarness editMode={true} onTextChange={onTextChange} />,
    )
    const heading = container.querySelector('h2') as HTMLHeadingElement

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    heading.firstChild!.nodeValue = 'Committed lifecycle edit'

    act(() => {
      heading.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'Lifecycle headline',
        newText: 'Committed lifecycle edit',
        element: heading,
        occurrenceIndex: 0,
      }),
    )
    expect(heading.textContent).toBe('Committed lifecycle edit')
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
  })
})

describe('useTextEdit: translated text replacement', () => {
  function replaceSelectedContents(element: HTMLElement, nextText: string) {
    const range = document.createRange()
    range.selectNodeContents(element)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    range.deleteContents()
    const replacement = document.createTextNode(nextText)
    range.insertNode(replacement)
    range.setStartAfter(replacement)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function replaceCurrentSelection(nextText: string) {
    const sel = window.getSelection()!
    expect(sel.rangeCount).toBeGreaterThan(0)
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const replacement = document.createTextNode(nextText)
    range.insertNode(replacement)
    range.setStartAfter(replacement)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  it('commits a full Hindi replacement as the exact new text', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const heading = document.createElement('h1')
    heading.textContent = 'मूल अंग्रेज़ी शीर्षक'
    container.appendChild(heading)

    const onTextChange = vi.fn()
    const { result } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    expect(heading.contentEditable).toBe('true')

    act(() => {
      replaceSelectedContents(heading, 'हिंदी स्थिर सत्यापन')
    })
    act(() => {
      result.current.commitEdit()
    })

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'मूल अंग्रेज़ी शीर्षक',
        newText: 'हिंदी स्थिर सत्यापन',
        element: heading,
        occurrenceIndex: 0,
      }),
    )
    expect(heading.textContent).toBe('हिंदी स्थिर सत्यापन')
    expect(heading.hasAttribute('contenteditable')).toBe(false)

    container.remove()
  })

  it('Ctrl+A inside an active translated heading selects that heading so typing replaces it cleanly', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const heading = document.createElement('h3')
    heading.textContent = 'मेरा स्थिर रीलोड सत्यापन'
    container.appendChild(heading)

    const onTextChange = vi.fn()
    const { result } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })

    act(() => {
      container.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(window.getSelection()?.toString()).toBe('मेरा स्थिर रीलोड सत्यापन')

    act(() => {
      replaceCurrentSelection('हिंदी एजेंट ब्राउज़र सत्यापन')
    })
    act(() => {
      result.current.commitEdit()
    })

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'मेरा स्थिर रीलोड सत्यापन',
        newText: 'हिंदी एजेंट ब्राउज़र सत्यापन',
        element: heading,
        occurrenceIndex: 0,
      }),
    )
    expect(heading.textContent).toBe('हिंदी एजेंट ब्राउज़र सत्यापन')

    container.remove()
  })

  it('keeps the selected occurrence index when replacing repeated translated text', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const first = document.createElement('h2')
    first.textContent = 'पॉलिश किया हुआ'
    const second = document.createElement('h2')
    second.textContent = 'पॉलिश किया हुआ'
    container.append(first, second)

    const onTextChange = vi.fn()
    const { result } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      second.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    act(() => {
      replaceSelectedContents(second, 'एजेंट सत्यापन शीर्षक')
    })
    act(() => {
      result.current.commitEdit()
    })

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'पॉलिश किया हुआ',
        newText: 'एजेंट सत्यापन शीर्षक',
        element: second,
        occurrenceIndex: 1,
      }),
    )
    expect(first.textContent).toBe('पॉलिश किया हुआ')
    expect(second.textContent).toBe('एजेंट सत्यापन शीर्षक')

    container.remove()
  })

  it('keeps occurrence index for repeated text split by inline markup inside one editable element', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const heading = document.createElement('h1')
    const firstRun = document.createTextNode('Glass')
    const secondRun = document.createTextNode('Glass')
    heading.append(firstRun, document.createElement('br'), secondRun)
    container.appendChild(heading)

    const onTextChange = vi.fn()
    const { result } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    act(() => {
      secondRun.nodeValue = 'Polished Glass'
    })
    act(() => {
      result.current.commitEdit()
    })

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'Glass',
        newText: 'Polished Glass',
        element: heading,
        occurrenceIndex: 1,
      }),
    )
    expect(firstRun.nodeValue).toBe('Glass')
    expect(secondRun.nodeValue).toBe('Polished Glass')

    container.remove()
  })

  it('splits a full replacement across mixed translated text nodes into source-addressable edits', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const heading = document.createElement('h1')
    heading.appendChild(
      document.createTextNode(
        'के साथ अपने स्थान कोहिंदी रीलोड सत्यापन शीर्षक ऊपर उठाएं',
      ),
    )
    heading.appendChild(document.createTextNode(' '))
    const span = document.createElement('span')
    span.textContent = 'एजेंट सत्यापन शीर्षकपॉलिश किया हुआ'
    heading.appendChild(span)
    container.appendChild(heading)

    const onTextChange = vi.fn()
    const { result } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })
    act(() => {
      replaceSelectedContents(heading, 'हिंदी नोड सत्यापन')
    })
    act(() => {
      result.current.commitEdit()
    })

    expect(onTextChange).toHaveBeenCalledTimes(2)
    expect(onTextChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        oldText: 'के साथ अपने स्थान कोहिंदी रीलोड सत्यापन शीर्षक ऊपर उठाएं',
        newText: 'हिंदी नोड सत्यापन',
        element: heading,
        occurrenceIndex: 0,
      }),
    )
    expect(onTextChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        oldText: 'एजेंट सत्यापन शीर्षकपॉलिश किया हुआ',
        newText: '',
        element: heading,
        occurrenceIndex: 0,
      }),
    )
    expect(heading.textContent).toBe('हिंदी नोड सत्यापन')
    expect(heading.hasAttribute('contenteditable')).toBe(false)

    container.remove()
  })

  it('treats a direct browser fill as a full Unicode replacement and persists it after remount', () => {
    const originalText = 'स्वीट क्रम्ब बेकरी'
    const replacementText = 'स्वीट क्रम्ब बेकरी रिलीज़'
    const container = document.createElement('div')
    document.body.appendChild(container)

    const heading = document.createElement('h1')
    heading.textContent = originalText
    container.appendChild(heading)

    const onTextChange = vi.fn()
    const { result, unmount } = renderHook(() => {
      const ref = useRef(container)
      return useTextEdit(ref, true, onTextChange)
    })

    act(() => {
      heading.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      )
    })

    const textNode = heading.firstChild as Text
    const interiorCaretOffset = 'स्वीट क्र'.length
    const range = document.createRange()
    range.setStart(textNode, interiorCaretOffset)
    range.collapse(true)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    act(() => {
      const fillInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: replacementText,
        inputType: 'insertText',
      })
      heading.dispatchEvent(fillInput)
      if (!fillInput.defaultPrevented) {
        document.execCommand('insertText', false, replacementText)
      }
    })
    act(() => {
      result.current.commitEdit()
    })

    const persistedText = onTextChange.mock.calls[0]?.[0]?.newText as
      | string
      | undefined
    unmount()
    container.remove()

    const reloaded = document.createElement('h1')
    reloaded.textContent = persistedText ?? ''

    expect({
      emitted: persistedText,
      live: heading.textContent,
      reloaded: reloaded.textContent,
    }).toEqual({
      emitted: replacementText,
      live: replacementText,
      reloaded: replacementText,
    })
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

      expect(paragraph.dataset.shipFastInlineEditing).toBe('true')

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
      expect(paragraph.dataset.shipFastInlineEditing).toBeUndefined()
    } finally {
      unmount()
      container.remove()
      dialog.remove()
      globalThis.requestAnimationFrame = originalRequestAnimationFrame
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame
    }
  })

  it('preserves pre-existing inline cursor and outline styles after committing text', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const paragraph = document.createElement('p')
    paragraph.textContent = 'Styled headline'
    paragraph.setAttribute(
      'style',
      'cursor: pointer; outline: 1px solid red; outline-offset: 4px; color: rgb(1, 2, 3);',
    )
    container.appendChild(paragraph)

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

      expect(paragraph.style.cursor).toBe('text')
      expect(paragraph.style.outline).toContain('hsl(var(--primary))')

      paragraph.firstChild!.nodeValue = 'Styled headline edited'
      act(() => {
        result.current.commitEdit()
      })

      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'Styled headline',
          newText: 'Styled headline edited',
          element: paragraph,
        }),
      )
      expect(paragraph.style.cursor).toBe('pointer')
      expect(paragraph.style.outline).toBe('1px solid red')
      expect(paragraph.style.outlineOffset).toBe('4px')
      expect(paragraph.style.color).toBe('rgb(1, 2, 3)')
      expect(paragraph.dataset.shipFastInlineEditing).toBeUndefined()
      expect(paragraph.hasAttribute('contenteditable')).toBe(false)
    } finally {
      unmount()
      container.remove()
    }
  })

  it('removes the temporary style attribute when committing an originally unstyled text edit', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const paragraph = document.createElement('p')
    paragraph.textContent = 'Plain headline'
    container.appendChild(paragraph)

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

      expect(paragraph.hasAttribute('style')).toBe(true)

      paragraph.firstChild!.nodeValue = 'Plain headline edited'
      act(() => {
        result.current.commitEdit()
      })

      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'Plain headline',
          newText: 'Plain headline edited',
          element: paragraph,
        }),
      )
      expect(paragraph.hasAttribute('style')).toBe(false)
      expect(paragraph.hasAttribute('contenteditable')).toBe(false)
      expect(paragraph.dataset.shipFastInlineEditing).toBeUndefined()
    } finally {
      unmount()
      container.remove()
    }
  })
})

describe('useTextEdit: click activation must not scroll the page', () => {
  function Harness() {
    const ref = useRef<HTMLDivElement>(null)
    useTextEdit(ref, true, vi.fn())
    return (
      <div ref={ref}>
        <h3>Board of Directors</h3>
      </div>
    )
  }

  it('focuses the clicked text element with preventScroll so nested scrollers are not yanked', () => {
    // Regression: focus() without preventScroll scrolls every scrollable
    // ancestor (the nested .genui-preview scroller) to "reveal" the element,
    // which in transformed/nested containers can jump the preview and push
    // the clicked element out of view (reported on a gov-portal Company
    // Leadership page: clicking "Board of Directors" scrolled to the top).
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    try {
      const { container } = render(<Harness />)
      const heading = container.querySelector('h3') as HTMLHeadingElement

      act(() => {
        heading.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          }),
        )
      })

      expect(heading.contentEditable).toBe('true')
      const headingFocusCalls = focusSpy.mock.instances
        .map((instance, index) => ({ instance, index }))
        .filter(({ instance }) => instance === heading)
      expect(headingFocusCalls.length).toBeGreaterThan(0)
      for (const { index } of headingFocusCalls) {
        expect(focusSpy.mock.calls[index]?.[0]).toMatchObject({
          preventScroll: true,
        })
      }
    } finally {
      focusSpy.mockRestore()
    }
  })
})
