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
      <h2>First heading</h2>
      <h2>Second heading</h2>
      <img src="/product.jpg" alt="Product" />
    </div>
  )
}

function startDraft(heading: HTMLElement) {
  fireEvent.click(heading)
  heading.textContent = 'Unapplied first draft'
  fireEvent.input(heading, {
    data: 'Unapplied first draft',
    inputType: 'insertText',
  })
}

afterEach(cleanup)

describe('useTextEdit cross-target release regressions', () => {
  it('commits the first editor exactly once before activating a second text element', () => {
    const onTextChange = vi.fn()
    render(<Harness onTextChange={onTextChange} />)
    const headings = screen.getAllByRole('heading')
    const firstHeading = headings[0]
    const secondHeading = headings[1]

    startDraft(firstHeading)
    fireEvent.click(secondHeading)

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        oldText: 'First heading',
        newText: 'Unapplied first draft',
      }),
    )
    expect(firstHeading.textContent).toBe('Unapplied first draft')
    expect(firstHeading.hasAttribute('contenteditable')).toBe(false)
    expect(secondHeading.dataset.shipFastInlineEditing).toBe('true')
    expect(
      document.querySelectorAll('[data-ship-fast-inline-editing="true"]'),
    ).toHaveLength(1)
  })

  it('hands an image target to the outer inspector without implicitly committing text', () => {
    const onTextChange = vi.fn()
    const onImageTarget = vi.fn()
    const view = render(<Harness onTextChange={onTextChange} />)
    const firstHeading = screen.getAllByRole('heading')[0]
    const image = screen.getByRole('img', { name: 'Product' })
    view.container.addEventListener('image-target', onImageTarget)

    startDraft(firstHeading)
    fireEvent.click(image)

    expect(onImageTarget).toHaveBeenCalledTimes(1)
    expect(onTextChange).not.toHaveBeenCalled()
    expect(firstHeading.textContent).toBe('Unapplied first draft')
    expect(firstHeading.dataset.shipFastInlineEditing).toBe('true')
    expect(
      document.querySelectorAll('[data-ship-fast-inline-editing="true"]'),
    ).toHaveLength(1)
  })

  it('keeps the current editor active when its own nested inline text is clicked', () => {
    const onTextChange = vi.fn()

    function InlineHarness() {
      const containerRef = useRef<HTMLDivElement>(null)
      useTextEdit(containerRef, true, onTextChange)
      return (
        <div ref={containerRef}>
          <h2>
            Current <strong>heading</strong>
          </h2>
        </div>
      )
    }

    render(<InlineHarness />)
    const heading = screen.getByRole('heading')
    fireEvent.click(heading)
    const activeEditor = document.querySelector(
      '[data-ship-fast-inline-editing="true"]',
    )
    expect(activeEditor).not.toBeNull()
    fireEvent.click(screen.getByText('heading'))

    expect(onTextChange).not.toHaveBeenCalled()
    expect(
      document.querySelector('[data-ship-fast-inline-editing="true"]'),
    ).toBe(activeEditor)
    expect(
      document.querySelectorAll('[data-ship-fast-inline-editing="true"]'),
    ).toHaveLength(1)
  })
})
