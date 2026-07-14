// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { useState, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const dndHarness = vi.hoisted(() => ({
  callbacks: new Map(),
}))

vi.mock('@dnd-kit/core', async () => {
  const actual =
    await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core')
  const ReactModule = await import('react')

  function DndContext(props: {
    children?: ReactNode
    onDragStart?: (event: unknown) => void
    onDragEnd?: (event: unknown) => void
    onDragCancel?: (event: unknown) => void
    accessibility?: unknown
  }) {
    dndHarness.callbacks.set('start', props.onDragStart)
    dndHarness.callbacks.set('end', props.onDragEnd)
    dndHarness.callbacks.set('cancel', props.onDragCancel)
    dndHarness.callbacks.set('accessibility', props.accessibility)
    return ReactModule.createElement('div', null, props.children)
  }

  function DragOverlay(props: { children?: ReactNode }) {
    return ReactModule.createElement(
      'div',
      { 'data-testid': 'overlay-root' },
      props.children,
    )
  }

  return { ...actual, DndContext, DragOverlay }
})

import { Sortable, SortableOverlay } from './sortable'

function ReorderHarness() {
  const [items, setItems] = useState(['alpha', 'beta', 'gamma'])
  return (
    <Sortable value={items} onValueChange={setItems}>
      <output data-testid="items">{items.join(',')}</output>
    </Sortable>
  )
}

function OverlayHarness() {
  return (
    <Sortable value={['alpha', 'beta']}>
      <SortableOverlay>
        {({ value }) => <span data-testid="active-overlay">{value}</span>}
      </SortableOverlay>
    </Sortable>
  )
}

function dragEvent(activeId: string, overId: string | null) {
  return {
    activatorEvent: new Event('pointerdown', { cancelable: true }),
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  }
}

afterEach(() => {
  cleanup()
  dndHarness.callbacks.clear()
})

describe('Sortable drag-end behavior', () => {
  it('moves the active item to the dropped position', () => {
    render(<ReorderHarness />)
    const onDragEnd = dndHarness.callbacks.get('end')
    if (typeof onDragEnd !== 'function') throw new Error('Missing drag end')

    act(() => {
      onDragEnd(dragEvent('alpha', 'gamma'))
    })

    expect(screen.getByTestId('items').textContent).toBe('beta,gamma,alpha')
  })

  it('reports stable source and destination indexes through onMove', () => {
    const onMove = vi.fn()
    render(
      <Sortable value={['alpha', 'beta', 'gamma']} onMove={onMove}>
        <span>items</span>
      </Sortable>,
    )
    const onDragEnd = dndHarness.callbacks.get('end')
    if (typeof onDragEnd !== 'function') throw new Error('Missing drag end')

    act(() => {
      onDragEnd(dragEvent('gamma', 'alpha'))
    })

    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ activeIndex: 2, overIndex: 0 }),
    )
  })

  it('does not mutate order when the drop is cancelled or has no target', () => {
    render(<ReorderHarness />)
    const onDragEnd = dndHarness.callbacks.get('end')
    const onDragCancel = dndHarness.callbacks.get('cancel')
    if (typeof onDragEnd !== 'function') throw new Error('Missing drag end')
    if (typeof onDragCancel !== 'function')
      throw new Error('Missing drag cancel')

    act(() => {
      onDragEnd(dragEvent('alpha', null))
      onDragCancel(dragEvent('alpha', null))
    })

    expect(screen.getByTestId('items').textContent).toBe('alpha,beta,gamma')
  })

  it('shows the active overlay on drag start and clears it on cancellation', () => {
    render(<OverlayHarness />)
    const onDragStart = dndHarness.callbacks.get('start')
    const onDragCancel = dndHarness.callbacks.get('cancel')
    if (typeof onDragStart !== 'function') throw new Error('Missing drag start')
    if (typeof onDragCancel !== 'function')
      throw new Error('Missing drag cancel')

    act(() => {
      onDragStart(dragEvent('alpha', 'alpha'))
    })
    expect(screen.getByTestId('active-overlay').textContent).toBe('alpha')

    act(() => {
      onDragCancel(dragEvent('alpha', null))
    })
    expect(screen.queryByTestId('active-overlay')).toBeNull()
  })

  it('honors prevented drag events without changing active or ordered state', () => {
    render(<ReorderHarness />)
    const onDragStart = dndHarness.callbacks.get('start')
    const onDragEnd = dndHarness.callbacks.get('end')
    if (typeof onDragStart !== 'function') throw new Error('Missing drag start')
    if (typeof onDragEnd !== 'function') throw new Error('Missing drag end')
    const start = dragEvent('alpha', 'beta')
    start.activatorEvent.preventDefault()
    const end = dragEvent('alpha', 'gamma')
    end.activatorEvent.preventDefault()

    act(() => {
      onDragStart(start)
      onDragEnd(end)
    })

    expect(screen.getByTestId('items').textContent).toBe('alpha,beta,gamma')
  })

  it('announces every drag state with positions and empty-target guidance', () => {
    render(<ReorderHarness />)
    const accessibility = dndHarness.callbacks.get('accessibility')
    if (!accessibility || typeof accessibility !== 'object') {
      throw new Error('Missing sortable accessibility config')
    }
    const announcements = Reflect.get(accessibility, 'announcements')
    if (!announcements || typeof announcements !== 'object') {
      throw new Error('Missing sortable announcements')
    }
    const active = {
      id: 'alpha',
      data: { current: { sortable: { index: 0 } } },
    }
    const over = {
      id: 'beta',
      data: { current: { sortable: { index: 1 } } },
    }

    expect(Reflect.get(announcements, 'onDragStart')({ active })).toContain(
      'position is 1 of 3',
    )
    expect(
      Reflect.get(announcements, 'onDragOver')({ active, over }),
    ).toContain('moved down to position 2 of 3')
    expect(
      Reflect.get(announcements, 'onDragOver')({ active, over: null }),
    ).toContain('no longer over a droppable area')
    expect(Reflect.get(announcements, 'onDragEnd')({ active, over })).toContain(
      'dropped at position 2 of 3',
    )
    expect(
      Reflect.get(announcements, 'onDragEnd')({ active, over: null }),
    ).toContain('No changes were made')
    expect(
      Reflect.get(announcements, 'onDragMove')({ active, over }),
    ).toContain('moving down to position 2 of 3')
    expect(
      Reflect.get(announcements, 'onDragMove')({ active, over: null }),
    ).toContain('no longer over a droppable area')
    expect(Reflect.get(announcements, 'onDragCancel')({ active })).toContain(
      'returned to position 1 of 3',
    )
  })

  it('describes horizontal and mixed keyboard movement correctly', () => {
    const { rerender } = render(
      <Sortable value={['alpha']} orientation="horizontal">
        <span>alpha</span>
      </Sortable>,
    )
    let accessibility = dndHarness.callbacks.get('accessibility')
    if (!accessibility || typeof accessibility !== 'object') {
      throw new Error('Missing sortable accessibility config')
    }
    let instructions = Reflect.get(accessibility, 'screenReaderInstructions')
    expect(Reflect.get(instructions, 'draggable')).toContain('left and right')

    rerender(
      <Sortable value={['alpha']} orientation="mixed">
        <span>alpha</span>
      </Sortable>,
    )
    accessibility = dndHarness.callbacks.get('accessibility')
    if (!accessibility || typeof accessibility !== 'object') {
      throw new Error('Missing sortable accessibility config')
    }
    instructions = Reflect.get(accessibility, 'screenReaderInstructions')
    expect(Reflect.get(instructions, 'draggable')).toContain(
      'use the arrow keys',
    )
  })
})
