// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AIPromptBox } from './AIPromptBox'

const baseRect: DOMRect = {
  left: 100,
  top: 100,
  right: 200,
  bottom: 140,
  width: 100,
  height: 40,
  x: 100,
  y: 100,
  toJSON: () => '',
}

describe('AIPromptBox', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows the selected text', () => {
    const { container } = render(
      <AIPromptBox
        text="Hello world"
        rect={baseRect}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(container.textContent).toContain('Selected:')
    expect(container.textContent).toContain('Hello world')
  })

  it('renders an input field for the rewrite instruction', () => {
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText(
      'e.g. "make it punchier", "more formal"',
    )
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input.getAttribute('type')).toBe('text')
  })

  it('triggers onSubmit with the trimmed instruction when submitted', () => {
    const onSubmit = vi.fn()
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText(
      'e.g. "make it punchier", "more formal"',
    )
    fireEvent.change(input, { target: { value: '  make it punchier  ' } })

    const form = input.closest('form')!
    fireEvent.submit(form)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('make it punchier')
  })

  it('does not submit an empty instruction', () => {
    const onSubmit = vi.fn()
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText(
      'e.g. "make it punchier", "more formal"',
    )
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears and closes via the Cancel button', () => {
    const onCancel = vi.fn()
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTitle('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('clears and closes on Escape key', () => {
    const onCancel = vi.fn()
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows a spinner (and disables controls) in the loading state', () => {
    render(
      <AIPromptBox
        text="Some text"
        rect={baseRect}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading
      />,
    )

    const submit = screen.getByTitle('Rewrite with AI') as HTMLButtonElement
    expect(submit.disabled).toBe(true)

    const spinner = submit.querySelector('.animate-spin')
    expect(spinner).toBeInstanceOf(Element)
    expect(spinner?.tagName.toLowerCase()).toBe('svg')

    const input = screen.getByPlaceholderText(
      'e.g. "make it punchier", "more formal"',
    ) as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect((screen.getByTitle('Cancel') as HTMLButtonElement).disabled).toBe(
      true,
    )
  })
})
