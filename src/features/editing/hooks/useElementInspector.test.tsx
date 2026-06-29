// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'

import { useElementInspector } from './useElementInspector'
import type { InspectorSelection } from '../element-path'

/** Harness that mounts a preview-like DOM and activates the inspector hook. */
function Harness({
  active,
  onSectionSelect,
}: {
  active: boolean
  onSectionSelect?: (s: InspectorSelection | null) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useElementInspector(ref, active, onSectionSelect)
  return (
    <div ref={ref} data-testid="root">
      <section data-testid="hero">
        <h2>Hello world</h2>
        <p>Some paragraph text</p>
      </section>
      <div data-testid="card">
        <p>Second card</p>
      </div>
    </div>
  )
}

const overlayDivs = () =>
  document.body.querySelectorAll<HTMLDivElement>(
    '[data-ship-fast-inspector-overlay]',
  )

const overlayByRole = (role: 'hover' | 'selected') =>
  document.body.querySelector<HTMLDivElement>(
    `[data-ship-fast-inspector-overlay][data-overlay-role="${role}"]`,
  )

const fireMouse = (el: Element, type: 'mousemove' | 'mouseleave') => {
  el.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      clientX: 10,
      clientY: 10,
    }),
  )
}

const fireClick = (el: Element) => {
  el.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 10,
    }),
  )
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('useElementInspector — behavioral', () => {
  it('creates exactly two overlay divs (hover + selected) when active', () => {
    render(<Harness active={true} />)
    expect(overlayDivs().length).toBe(2)
  })

  it('creates no overlays when inactive', () => {
    render(<Harness active={false} />)
    expect(overlayDivs().length).toBe(0)
  })

  it('removes overlays on unmount', () => {
    const { unmount } = render(<Harness active={true} />)
    expect(overlayDivs().length).toBe(2)
    unmount()
    expect(overlayDivs().length).toBe(0)
  })

  it('shows the hover overlay positioned over the hovered element', async () => {
    const { getByTestId } = render(<Harness active={true} />)
    const hero = getByTestId('hero')
    // jsdom returns 0x0 rects; the hook still sets left/top/width/height.
    const spy = vi.spyOn(hero, 'getBoundingClientRect')
    spy.mockReturnValue(new DOMRect(20, 30, 100, 50))
    await act(async () => {
      fireMouse(hero, 'mousemove')
      // flush the rAF the hook schedules
      await new Promise((r) => requestAnimationFrame(r))
    })
    const hover = overlayByRole('hover')
    expect(hover).toBeDefined()
    expect(hover!.style.left).toBe('20px')
    expect(hover!.style.top).toBe('30px')
    expect(hover!.style.width).toBe('100px')
    expect(hover!.style.height).toBe('50px')
    spy.mockRestore()
  })

  it('hides the hover overlay on mouseleave', async () => {
    const { getByTestId } = render(<Harness active={true} />)
    const root = getByTestId('root')
    await act(async () => {
      fireMouse(root, 'mousemove')
      await new Promise((r) => requestAnimationFrame(r))
    })
    const hover = overlayByRole('hover')!
    expect(hover.style.display).not.toBe('none')
    await act(async () => {
      fireMouse(root, 'mouseleave')
    })
    expect(hover.style.display).toBe('none')
  })

  it('commits a section selection and calls onSectionSelect with element info', () => {
    const onSectionSelect =
      vi.fn<(selection: InspectorSelection | null) => void>()
    const { getByTestId } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const hero = getByTestId('hero')
    vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(5, 6, 200, 80),
    )
    act(() => {
      fireClick(hero)
    })
    expect(onSectionSelect).toHaveBeenCalledTimes(1)
    const sel = onSectionSelect.mock.calls[0]?.[0]
    expect(sel).not.toBeNull()
    expect(sel!.tag).toBe('section')
    // JSX collapses inter-element whitespace, so the section's textContent
    // concatenates the h2 and p runs. Assert both runs are present rather
    // than an exact string.
    expect(sel!.textContent).toContain('Hello world')
    expect(sel!.textContent).toContain('Some paragraph text')
    expect(sel!.outerHTML).toContain('<section')
    expect(sel!.boundingBox).toEqual({ x: 5, y: 6, width: 200, height: 80 })
  })

  it('shows a persistent selected overlay after a section click', () => {
    const { getByTestId } = render(<Harness active={true} />)
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    const selected = overlayByRole('selected')
    expect(selected).toBeDefined()
    expect(selected!.style.left).toBe('1px')
  })

  it('does NOT call onSectionSelect when clicking a text leaf (defers to useTextEdit)', () => {
    const onSectionSelect = vi.fn()
    const { getByText } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const heading = getByText('Hello world') // <h2> text leaf
    act(() => {
      fireClick(heading)
    })
    expect(onSectionSelect).not.toHaveBeenCalled()
  })

  it('does NOT mutate the hovered/selected element style (no outline leak)', async () => {
    const { getByTestId } = render(<Harness active={true} />)
    const hero = getByTestId('hero')
    const styleBefore = hero.getAttribute('style')
    vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 10, 10),
    )
    await act(async () => {
      fireMouse(hero, 'mousemove')
      await new Promise((r) => requestAnimationFrame(r))
    })
    act(() => {
      fireClick(hero)
    })
    // The whole point of separate overlay divs: highlight state must never
    // touch the preview DOM, otherwise it leaks into persisted preview.html.
    expect(hero.getAttribute('style')).toBe(styleBefore)
    expect(hero.style.outline).toBe('')
  })

  it('clears the persistent selection on Escape', () => {
    const { getByTestId } = render(<Harness active={true} />)
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    const selected = overlayByRole('selected')!
    expect(selected.style.display).not.toBe('none')
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(selected.style.display).toBe('none')
  })

  it('calls onSectionSelect(null) on Escape (not just hides the overlay)', () => {
    const onSectionSelect =
      vi.fn<(selection: InspectorSelection | null) => void>()
    const { getByTestId } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    expect(onSectionSelect).toHaveBeenCalledWith(
      expect.objectContaining({ tag: 'div' }),
    )
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onSectionSelect).toHaveBeenLastCalledWith(null)
  })

  it('clears selection on mousedown outside the container (click-away)', () => {
    const onSectionSelect =
      vi.fn<(selection: InspectorSelection | null) => void>()
    const { getByTestId } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    expect(onSectionSelect).toHaveBeenCalledTimes(1)
    // Click on document.body (outside the preview container)
    act(() => {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true }),
      )
    })
    expect(onSectionSelect).toHaveBeenLastCalledWith(null)
    expect(overlayByRole('selected')!.style.display).toBe('none')
  })

  it('does NOT clear when mousedown lands on the prompt toolbar', () => {
    const onSectionSelect =
      vi.fn<(selection: InspectorSelection | null) => void>()
    const { getByTestId } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    // Simulate a toolbar element outside the container
    const toolbar = document.createElement('div')
    toolbar.className = 'inline-edit-toolbar'
    document.body.appendChild(toolbar)
    act(() => {
      toolbar.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onSectionSelect).toHaveBeenCalledTimes(1) // not cleared
    toolbar.remove()
  })

  it('does NOT clear when mousedown lands on an alert dialog portal', () => {
    const onSectionSelect =
      vi.fn<(selection: InspectorSelection | null) => void>()
    const { getByTestId } = render(
      <Harness active={true} onSectionSelect={onSectionSelect} />,
    )
    const card = getByTestId('card')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(1, 2, 3, 4),
    )
    act(() => {
      fireClick(card)
    })
    // Simulate an AlertDialog portal element outside the container
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'alertdialog')
    document.body.appendChild(dialog)
    act(() => {
      dialog.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onSectionSelect).toHaveBeenCalledTimes(1) // not cleared
    dialog.remove()
  })
})
