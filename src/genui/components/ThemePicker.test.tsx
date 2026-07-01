// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ThemePicker from './ThemePicker'

describe('ThemePicker', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the open theme catalog, toggles mode, and selects a theme', () => {
    const onSelect = vi.fn()
    const onToggleMode = vi.fn()

    render(
      <ThemePicker
        value="modern-minimal"
        isDark={false}
        onSelect={onSelect}
        onToggleMode={onToggleMode}
        open
      />,
    )

    expect(screen.getByRole('button', { name: /dark mode/i })).toBeTruthy()
    expect(screen.getByText('Modern Minimal')).toBeTruthy()
    expect(screen.getByText('Violet Bloom')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /dark mode/i }))
    fireEvent.click(screen.getByText('Violet Bloom'))

    expect(onToggleMode).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('violet-bloom')
  })

  it('uses the provided trigger and dark-mode action label', () => {
    const onToggleMode = vi.fn()

    render(
      <ThemePicker
        value="twitter"
        isDark
        onSelect={vi.fn()}
        onToggleMode={onToggleMode}
        open
        trigger={<button type="button">Open theme menu</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Open theme menu' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /light mode/i }))

    expect(onToggleMode).toHaveBeenCalledTimes(1)
  })
})
