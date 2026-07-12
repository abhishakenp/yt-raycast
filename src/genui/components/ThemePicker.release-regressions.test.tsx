// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ThemePicker from './ThemePicker'

describe('ThemePicker release regressions', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('exposes the persisted theme as the only selected option', () => {
    render(
      <ThemePicker
        value="vintage-paper"
        isDark
        onSelect={vi.fn()}
        onToggleMode={vi.fn()}
        open
      />,
    )

    const persistedOption = screen
      .getByText('Vintage Paper')
      .closest('[role="option"]')
    const firstCatalogOption = screen
      .getByText('Modern Minimal')
      .closest('[role="option"]')

    expect(persistedOption?.getAttribute('aria-selected')).toBe('true')
    expect(firstCatalogOption?.getAttribute('aria-selected')).toBe('false')
  })

  it('emits the Corporate catalog key when Corporate is selected', () => {
    const onSelect = vi.fn()
    render(
      <ThemePicker
        value="vintage-paper"
        isDark
        onSelect={onSelect}
        onToggleMode={vi.fn()}
        open
      />,
    )

    fireEvent.click(screen.getByText('Corporate'))

    expect(onSelect).toHaveBeenCalledWith('corporate')
  })
})
