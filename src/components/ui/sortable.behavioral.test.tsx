// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from './sortable'

function SortableHarness() {
  const [items, setItems] = useState(['alpha', 'beta', 'gamma'])
  return (
    <Sortable value={items} onValueChange={setItems} orientation="vertical">
      <SortableContent aria-label="Ordered sections">
        {items.map((item) => (
          <SortableItem key={item} value={item} data-testid="sortable-item">
            <span>{item}</span>
            <SortableItemHandle aria-label={`Move ${item}`} />
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => <div data-testid="drag-overlay">Moving {value}</div>}
      </SortableOverlay>
    </Sortable>
  )
}

function DisabledSortableHarness() {
  return (
    <Sortable value={['locked']}>
      <SortableContent>
        <SortableItem value="locked" disabled data-testid="locked-item">
          <SortableItemHandle aria-label="Move locked" />
        </SortableItem>
      </SortableContent>
    </Sortable>
  )
}

function ComposedSortableHarness() {
  return (
    <Sortable value={['alpha']} flatCursor>
      <SortableContent asChild>
        <section data-testid="slotted-content">
          <SortableItem value="alpha" asChild>
            <article data-testid="slotted-item">
              alpha
              <SortableItemHandle aria-label="Move alpha" />
            </article>
          </SortableItem>
        </section>
      </SortableContent>
    </Sortable>
  )
}

afterEach(() => {
  cleanup()
})

describe('Sortable behavioral contract', () => {
  it('supports accessible keyboard pickup and cancellation', async () => {
    render(<SortableHarness />)
    const items = screen.getAllByTestId('sortable-item')
    const handle = screen.getByRole('button', { name: 'Move alpha' })
    handle.focus()

    fireEvent.keyDown(handle, { code: 'Space', key: ' ' })
    await waitFor(() => {
      expect(handle.getAttribute('aria-pressed')).toBe('true')
      expect(items[0]?.getAttribute('data-dragging')).toBe('')
    })
    fireEvent.keyDown(handle, { code: 'Escape', key: 'Escape' })

    await waitFor(() => {
      expect(handle.hasAttribute('aria-pressed')).toBe(false)
      expect(items[0]?.hasAttribute('data-dragging')).toBe(false)
    })
  })

  it('exposes drag handles with controls linkage and disables locked items', () => {
    render(<DisabledSortableHarness />)

    const item = screen.getByTestId('locked-item')
    const handle = screen.getByRole('button', { name: 'Move locked' })
    expect(handle.hasAttribute('disabled')).toBe(true)
    expect(handle.getAttribute('aria-controls')).toBe(item.id)
    expect(item.getAttribute('data-disabled')).toBe('true')
  })

  it('supports slotted semantic content and flat-cursor handles', () => {
    render(<ComposedSortableHarness />)

    const content = screen.getByTestId('slotted-content')
    const item = screen.getByTestId('slotted-item')
    const handle = screen.getByRole('button', { name: 'Move alpha' })
    expect(content.tagName).toBe('SECTION')
    expect(content.getAttribute('data-slot')).toBe('sortable-content')
    expect(item.tagName).toBe('ARTICLE')
    expect(item.getAttribute('data-slot')).toBe('sortable-item')
    expect(item.className).toContain('cursor-default')
    expect(handle.className).toContain('cursor-default')
    expect(handle.className).not.toContain('cursor-grab')
  })

  it('renders content without an added wrapper when requested', () => {
    render(
      <Sortable value={['alpha']}>
        <SortableContent withoutSlot>
          <p data-testid="bare-content">alpha</p>
        </SortableContent>
      </Sortable>,
    )

    expect(screen.getByTestId('bare-content').parentElement?.dataset.slot).toBe(
      undefined,
    )
  })

  it('accepts object values when a stable identifier resolver is provided', () => {
    render(
      <Sortable value={[{ id: 'alpha' }]} getItemValue={(item) => item.id}>
        <span>alpha</span>
      </Sortable>,
    )

    expect(screen.getByText('alpha')).toBeTruthy()
  })

  it('rejects object values without a stable identifier resolver', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <Sortable value={['alpha', { id: 'missing-resolver' }]}>
          <span>invalid</span>
        </Sortable>,
      ),
    ).toThrow('`getItemValue` is required when using array of objects')
    consoleError.mockRestore()
  })

  it('rejects SortableContent outside its root context', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<SortableContent>orphan</SortableContent>)).toThrow(
      '`SortableContent` must be used within `Sortable`',
    )
    consoleError.mockRestore()
  })

  it('rejects SortableItem outside content or overlay', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <Sortable value={['alpha']}>
          <SortableItem value="alpha">alpha</SortableItem>
        </Sortable>,
      ),
    ).toThrow(
      '`SortableItem` must be used within `SortableContent` or `SortableOverlay`',
    )
    consoleError.mockRestore()
  })

  it('rejects empty item identifiers before registering a draggable', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <Sortable value={['']}>
          <SortableContent>
            <SortableItem value="">empty</SortableItem>
          </SortableContent>
        </Sortable>,
      ),
    ).toThrow('`SortableItem` value cannot be an empty string')
    consoleError.mockRestore()
  })
})
