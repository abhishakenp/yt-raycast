// @vitest-environment jsdom
import { cleanup, fireEvent, renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useElementInspector } from './useElementInspector'

/**
 * Regression: switching the gap unit px → rem in the LayoutPanel opened a Radix
 * Select, whose dropdown portals to document.body. `onDocumentMouseDown` treated
 * the portalled option click as an outside-click and cleared the section
 * selection, collapsing the toolbar. Portals must be recognised as "inside".
 */
describe('useElementInspector — Radix portal dismiss guard', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  const setup = () => {
    // A preview container with a selectable section.
    const container = document.createElement('div')
    const section = document.createElement('section')
    section.textContent = 'Sustainability Community Quality'
    container.appendChild(section)
    document.body.appendChild(container)

    const onSectionSelect = vi.fn()
    renderHook(() => {
      const ref = useRef<HTMLElement | null>(container)
      return useElementInspector(ref, true, onSectionSelect)
    })

    // Select the section (commits the cyan selection).
    fireEvent.click(section)
    expect(onSectionSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({ tag: 'section' }),
    )
    onSectionSelect.mockClear()
    return { onSectionSelect }
  }

  it('does NOT clear the selection when a portalled Select option is clicked', () => {
    const { onSectionSelect } = setup()

    // Simulate the Radix Select dropdown for the gap unit portalled to body.
    const selectContent = document.createElement('div')
    selectContent.setAttribute('data-radix-select-content', '')
    const remOption = document.createElement('div')
    remOption.setAttribute('role', 'option')
    remOption.textContent = 'rem'
    selectContent.appendChild(remOption)
    document.body.appendChild(selectContent)

    fireEvent.mouseDown(remOption)

    // Selection preserved → onSectionSelect(null) must NOT have fired.
    expect(onSectionSelect).not.toHaveBeenCalled()
  })

  it('still clears the selection on a genuine outside click', () => {
    const { onSectionSelect } = setup()

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    fireEvent.mouseDown(outside)

    expect(onSectionSelect).toHaveBeenCalledWith(null)
  })
})
