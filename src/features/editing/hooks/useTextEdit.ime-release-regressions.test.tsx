import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTextEdit } from './useTextEdit'

interface HarnessProps {
  onTextChange: Parameters<typeof useTextEdit>[2]
}

function Harness({ onTextChange }: HarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useTextEdit(containerRef, true, onTextChange)

  return (
    <div ref={containerRef}>
      <h2>Original heading</h2>
    </div>
  )
}

function beginComposition(heading: HTMLElement, draft: string) {
  fireEvent.click(heading)
  fireEvent.compositionStart(heading)
  heading.textContent = draft
  fireEvent.compositionUpdate(heading, { data: draft })
}

afterEach(cleanup)

describe('useTextEdit IME release regressions', () => {
  it('does not commit when Enter confirms an active IME composition', () => {
    const onTextChange = vi.fn()
    render(<Harness onTextChange={onTextChange} />)
    const heading = screen.getByRole('heading')

    beginComposition(heading, 'オリジナル見出し')
    fireEvent.keyDown(heading, { key: 'Enter', isComposing: true })

    expect(heading.dataset.shipFastInlineEditing).toBe('true')
    expect(heading.textContent).toBe('オリジナル見出し')
    expect(onTextChange).not.toHaveBeenCalled()

    fireEvent.compositionEnd(heading, { data: 'オリジナル見出し' })
    fireEvent.keyDown(heading, { key: 'Enter', isComposing: false })

    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'Original heading',
        newText: 'オリジナル見出し',
      }),
    )
  })

  it('does not cancel when Escape dismisses an active IME candidate', () => {
    const onTextChange = vi.fn()
    render(<Harness onTextChange={onTextChange} />)
    const heading = screen.getByRole('heading')

    beginComposition(heading, 'हिंदी ड्राफ्ट')
    fireEvent.keyDown(heading, { key: 'Escape', isComposing: true })

    expect(heading.dataset.shipFastInlineEditing).toBe('true')
    expect(heading.textContent).toBe('हिंदी ड्राफ्ट')
    expect(onTextChange).not.toHaveBeenCalled()

    fireEvent.compositionEnd(heading, { data: 'हिंदी ड्राफ्ट' })
    fireEvent.keyDown(heading, { key: 'Escape', isComposing: false })

    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.textContent).toBe('Original heading')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it.each(['Enter', 'Escape'])(
    'honors the legacy keyCode 229 IME signal for %s',
    (key) => {
      const onTextChange = vi.fn()
      render(<Harness onTextChange={onTextChange} />)
      const heading = screen.getByRole('heading')

      beginComposition(heading, '한국어 초안')
      fireEvent.keyDown(heading, {
        key,
        isComposing: false,
        keyCode: 229,
        which: 229,
      })

      expect(heading.dataset.shipFastInlineEditing).toBe('true')
      expect(heading.textContent).toBe('한국어 초안')
      expect(onTextChange).not.toHaveBeenCalled()
    },
  )
})
