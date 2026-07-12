// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useEffect, useRef } from 'react'

import { useAITextEdit } from './use-ai-text-edit'

type Controls = ReturnType<typeof useAITextEdit>

const rect = new DOMRect(10, 20, 100, 24)

function selectNodeText(node: Node, start: number, end: number) {
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  range.getBoundingClientRect = vi.fn(() => rect)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const dispatchSelectionChange = () => {
  act(() => {
    document.dispatchEvent(new Event('selectionchange'))
  })
}

function Probe({
  aiEditMode,
  onSelect,
  onControls,
}: {
  aiEditMode: boolean
  onSelect: Parameters<typeof useAITextEdit>[2]
  onControls?: (controls: Controls) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const controls = useAITextEdit(ref, aiEditMode, onSelect)

  useEffect(() => {
    onControls?.(controls)
  }, [controls, onControls])

  return (
    <>
      <div ref={ref} data-testid="editable-container">
        <p data-testid="editable-copy"> Editable headline text </p>
        <button type="button" data-testid="ignored-button">
          Button label
        </button>
        <a href="/pricing" data-testid="ignored-link">
          <span>Nested link label</span>
        </a>
      </div>
      <p data-testid="outside-copy">Outside selected text</p>
    </>
  )
}

describe('useAITextEdit', () => {
  afterEach(() => {
    cleanup()
    window.getSelection()?.removeAllRanges()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('emits trimmed text and selection bounds for a valid selection inside the container', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByTestId('editable-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()

    expect(onSelect).toHaveBeenCalledWith({
      text: 'Editable headline text',
      rect,
    })
  })

  it('detects finalized text selection after mouseup in the editable container', () => {
    vi.useFakeTimers()
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByTestId('editable-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)

    act(() => {
      fireEvent.mouseUp(screen.getByTestId('editable-container'))
      vi.advanceTimersByTime(50)
    })

    expect(onSelect).toHaveBeenCalledWith({
      text: 'Editable headline text',
      rect,
    })
  })

  it('ignores valid-looking selections while AI edit mode is off', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode={false} onSelect={onSelect} />)

    const node = screen.getByTestId('editable-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ignores selections outside the editable container', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByTestId('outside-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ignores selections inside interactive controls', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByTestId('ignored-button').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ignores selections nested inside interactive links and controls', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByText('Nested link label').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('clears browser selection and reports null when clearSelection is called', () => {
    const onSelect = vi.fn()
    let controls!: Controls
    render(
      <Probe
        aiEditMode
        onSelect={onSelect}
        onControls={(value) => {
          controls = value
        }}
      />,
    )

    const node = screen.getByTestId('editable-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)

    act(() => {
      controls.clearSelection()
    })

    expect(window.getSelection()?.rangeCount).toBe(0)
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('clears the active selection when the user clicks outside the editable container', () => {
    const onSelect = vi.fn()
    render(<Probe aiEditMode onSelect={onSelect} />)

    const node = screen.getByTestId('editable-copy').firstChild
    expect(node).toBeTruthy()
    selectNodeText(node!, 0, node!.textContent!.length)
    dispatchSelectionChange()
    expect(onSelect).toHaveBeenCalledWith({
      text: 'Editable headline text',
      rect,
    })

    act(() => {
      fireEvent.click(screen.getByTestId('outside-copy'))
    })

    expect(window.getSelection()?.rangeCount).toBe(0)
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })
})
