// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// jsdom lacks ResizeObserver / IntersectionObserver — provide stubs so Radix
// primitives (Popover/ScrollArea) used by the real ThemePicker mount cleanly.
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}
if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    },
    writable: true,
  })
}
// jsdom does not implement Element.prototype.scrollIntoView; cmdk (ThemePicker
// search command) calls it on mount.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

// Mock @tanstack/react-router Link as a plain anchor that exposes the `to` prop.
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children?: ReactNode
    [key: string]: unknown
  }) => (
    <a href={to} data-to={to} {...(rest as Record<string, unknown>)}>
      {children}
    </a>
  ),
}))

import TopBar from './TopBar'

describe('TopBar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a back button that links to home', () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    const homeLink = screen.getByTitle('Home')
    expect(homeLink.getAttribute('data-to')).toBe('/')
    expect(homeLink.getAttribute('href')).toBe('/')
  })

  it('displays the prompt text (and truncates long prompts via class)', () => {
    const longPrompt =
      'Build a really long landing page for a SaaS product that does a lot of things and keeps going and going'
    render(
      <TopBar
        id="session-1"
        prompt={longPrompt}
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    const promptEl = screen.getByTitle(longPrompt)
    expect(promptEl.textContent).toContain(longPrompt)
    // Truncation is CSS-driven; the element must opt in via the `truncate` class.
    expect(promptEl.className).toContain('truncate')
  })

  it('shows a placeholder when there is no prompt', () => {
    render(
      <TopBar
        id="session-1"
        prompt={null}
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    expect(screen.getByText('—')).toBeTruthy()
  })

  it('shows module count and elapsed time', () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={5}
        elapsed={12345}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    expect(screen.getByText('5 modules · 12.3s')).toBeTruthy()
  })

  it('hides the module/elapsed readout when elapsed is null', () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={5}
        elapsed={null}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    expect(screen.queryByText(/modules ·/)).toBeNull()
  })

  it('toggles edit mode when the text-edit button is clicked', () => {
    const onToggleEditMode = vi.fn()
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
        editMode={false}
        onToggleEditMode={onToggleEditMode}
      />,
    )

    const editBtn = screen.getByTitle('Edit text content')
    fireEvent.click(editBtn)
    expect(onToggleEditMode).toHaveBeenCalledTimes(1)
  })

  it('reflects active edit mode in the toggle button title', () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
        editMode
        onToggleEditMode={vi.fn()}
      />,
    )

    expect(screen.getByTitle('Exit text edit mode')).toBeTruthy()
  })

  it('toggles AI edit mode when the wand button is clicked', () => {
    const onToggleAIEditMode = vi.fn()
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
        aiEditMode={false}
        onToggleAIEditMode={onToggleAIEditMode}
      />,
    )

    const aiBtn = screen.getByTitle('AI rewrite text')
    fireEvent.click(aiBtn)
    expect(onToggleAIEditMode).toHaveBeenCalledTimes(1)
  })

  it('reflects active AI edit mode in the toggle button title', () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
        aiEditMode
        onToggleAIEditMode={vi.fn()}
      />,
    )

    expect(screen.getByTitle('Exit AI edit mode')).toBeTruthy()
  })

  it('opens the theme picker when the theme button is clicked', async () => {
    render(
      <TopBar
        id="session-1"
        prompt="Build a site"
        moduleCount={3}
        elapsed={1000}
        themeName="modern-minimal"
        isDark
        onSelectTheme={vi.fn()}
        onToggleMode={vi.fn()}
      />,
    )

    // The ThemePicker trigger is the button titled "Theme".
    const themeBtn = screen.getByTitle('Theme')
    // Radix Popover opens on pointerdown; fire both pointer + click for jsdom.
    fireEvent.pointerDown(themeBtn)
    fireEvent.pointerUp(themeBtn)
    fireEvent.click(themeBtn)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search themes…')).toBeTruthy()
    })
  })
})
