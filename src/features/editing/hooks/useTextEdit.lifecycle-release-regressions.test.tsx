import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTextEdit } from './useTextEdit'

interface HarnessProps {
  editMode?: boolean
  onTextChange: Parameters<typeof useTextEdit>[2]
  text?: string
}

function Harness({
  editMode = true,
  onTextChange,
  text = 'Original heading',
}: HarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useTextEdit(containerRef, editMode, onTextChange)

  return (
    <div ref={containerRef}>
      <h2>{text}</h2>
    </div>
  )
}

function startDraft(heading: HTMLElement, draft: string) {
  fireEvent.click(heading)
  heading.textContent = draft
  fireEvent.input(heading, {
    data: draft,
    inputType: 'insertText',
  })
}

afterEach(cleanup)

describe('useTextEdit preview lifecycle release regressions', () => {
  it('discards an unapplied draft when the preview unmounts', () => {
    const onTextChange = vi.fn()
    const view = render(<Harness onTextChange={onTextChange} />)
    const heading = screen.getByRole('heading')

    startDraft(heading, 'Unapplied draft')
    view.unmount()

    expect(onTextChange).not.toHaveBeenCalled()
    expect(heading.textContent).toBe('Original heading')
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
  })

  it('does not persist an old-page draft when a keyed preview is replaced', () => {
    const onTextChange = vi.fn()
    const view = render(
      <Harness key="home" text="Home heading" onTextChange={onTextChange} />,
    )

    startDraft(screen.getByRole('heading'), 'Home draft')
    view.rerender(
      <Harness key="about" text="About heading" onTextChange={onTextChange} />,
    )

    expect(onTextChange).not.toHaveBeenCalled()
    expect(screen.getByRole('heading').textContent).toBe('About heading')
  })

  it('cancels rather than persists when inline edit mode is switched off', () => {
    const onTextChange = vi.fn()
    const view = render(<Harness editMode onTextChange={onTextChange} />)
    const heading = screen.getByRole('heading')

    startDraft(heading, 'Mode-switch draft')
    view.rerender(<Harness editMode={false} onTextChange={onTextChange} />)

    expect(onTextChange).not.toHaveBeenCalled()
    expect(heading.textContent).toBe('Original heading')
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
  })

  it('does not revive a cancelled draft during later unmount cleanup', () => {
    const onTextChange = vi.fn()
    const view = render(<Harness onTextChange={onTextChange} />)
    const heading = screen.getByRole('heading')

    startDraft(heading, 'Cancelled draft')
    fireEvent.keyDown(heading, { key: 'Escape' })
    view.unmount()

    expect(onTextChange).not.toHaveBeenCalled()
    expect(heading.textContent).toBe('Original heading')
  })
})
