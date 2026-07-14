import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTextEdit } from './useTextEdit'

interface HarnessProps {
  onTextChange: Parameters<typeof useTextEdit>[2]
}

interface TransferPayload {
  html: string
  text: string
}

function Harness({ onTextChange }: HarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useTextEdit(containerRef, true, onTextChange)

  return (
    <div ref={containerRef}>
      <h2>Original heading</h2>
      <button type="button">
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="M1 1h14v14H1z" />
        </svg>
        Buy now
      </button>
    </div>
  )
}

function transferData(payload: TransferPayload) {
  return {
    getData(format: string) {
      if (format === 'text/html') return payload.html
      if (format === 'text/plain' || format === 'text') return payload.text
      return ''
    },
    files: [],
    types: ['text/plain', 'text/html'],
  }
}

function dispatchRichInsertion(
  element: HTMLElement,
  eventType: 'drop' | 'paste',
  payload: TransferPayload,
) {
  const transfer = transferData(payload)
  const transferEvent = new Event(eventType, {
    bubbles: true,
    cancelable: true,
  })
  Object.defineProperty(transferEvent, 'clipboardData', { value: transfer })
  Object.defineProperty(transferEvent, 'dataTransfer', { value: transfer })
  element.dispatchEvent(transferEvent)

  const inputType = eventType === 'paste' ? 'insertFromPaste' : 'insertFromDrop'
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: payload.text,
    inputType,
  })
  element.dispatchEvent(beforeInput)

  if (!transferEvent.defaultPrevented && !beforeInput.defaultPrevented) {
    element.innerHTML = payload.html
  }
}

function selectContents(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  if (!selection) throw new Error('Browser selection unavailable')
  selection.removeAllRanges()
  selection.addRange(range)
}

afterEach(cleanup)

describe('useTextEdit clipboard and drop release regressions', () => {
  it.each(['paste', 'drop'])(
    'inserts %s content as plain text only',
    (kind) => {
      const onTextChange = vi.fn()
      render(<Harness onTextChange={onTextChange} />)
      const heading = screen.getByRole('heading')
      fireEvent.click(heading)
      selectContents(heading)

      dispatchRichInsertion(heading, kind, {
        text: 'Safe pasted heading',
        html: '<strong>Safe pasted</strong> <span>heading</span>',
      })

      expect(heading.textContent).toBe('Safe pasted heading')
      expect(heading.querySelector('strong')).toBeNull()
      expect(heading.querySelector('span')).toBeNull()

      fireEvent.keyDown(heading, { key: 'Enter' })
      expect(onTextChange).toHaveBeenCalledTimes(1)
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'Original heading',
          newText: 'Safe pasted heading',
        }),
      )
    },
  )

  it('preserves locked icon structure when rich text replaces button copy', () => {
    const onTextChange = vi.fn()
    render(<Harness onTextChange={onTextChange} />)
    const button = screen.getByRole('button', { name: 'Buy now' })
    fireEvent.click(button)
    selectContents(button)

    dispatchRichInsertion(button, 'paste', {
      text: 'Purchase securely',
      html: '<em>Purchase securely</em>',
    })

    expect(button.querySelector('svg')).not.toBeNull()
    expect(button.querySelector('em')).toBeNull()
    expect(button.textContent?.trim()).toBe('Purchase securely')

    fireEvent.keyDown(button, { key: 'Enter' })
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'Buy now',
        newText: 'Purchase securely',
      }),
    )
  })

  it('cuts editable button copy without deleting its locked icon', () => {
    const onTextChange = vi.fn()
    render(<Harness onTextChange={onTextChange} />)
    const button = screen.getByRole('button', { name: 'Buy now' })
    fireEvent.click(button)
    selectContents(button)

    const cutEvent = new Event('cut', { bubbles: true, cancelable: true })
    Object.defineProperty(cutEvent, 'clipboardData', {
      value: transferData({ text: 'Buy now', html: 'Buy now' }),
    })
    button.dispatchEvent(cutEvent)
    if (!cutEvent.defaultPrevented) button.replaceChildren()

    expect(button.querySelector('svg')).not.toBeNull()
    expect(button.textContent).toBe('')
    expect(button.dataset.shipFastInlineEditing).toBe('true')
  })
})
