// @vitest-environment jsdom

import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

const { cleanup, fireEvent, render, screen, waitFor } = await import(
  '@testing-library/react'
)
const { SiteNav } = await import('./SiteNav.tsx')
const { BrandLogoProvider } = await import('./Logo.tsx')
const { RoutesContext } = await import('../lib/use-navigate.tsx')

afterEach(() => {
  cleanup()
})

describe('SiteNav', () => {
  function renderWithRoutes(node: ReactElement) {
    return render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Services', 'Pricing', 'Contact'],
          targetMap: {},
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        {node}
      </RoutesContext.Provider>,
    )
  }

  it('renders the brand action as a home link when no explicit home target is provided', () => {
    renderWithRoutes(
      <SiteNav
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Northridge' }).getAttribute('href'),
    ).toBe('/')
  })

  it('uses the shared mobile drawer and closes it after mobile navigation', async () => {
    renderWithRoutes(
      <SiteNav
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()

    const mobilePricingButton = screen.getByRole('link', { name: 'Pricing' })

    fireEvent.click(mobilePricingButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('replaces the nav brand mark with the selected logo image', () => {
    renderWithRoutes(
      <BrandLogoProvider
        value={{
          name: 'Linear',
          icon: 'https://cdn.test/linear-icon.png',
          logo: null,
        }}
      >
        <SiteNav
          brand="Northridge"
          brandMark={<span data-testid="fallback-mark">N</span>}
          nav={['Services']}
        />
      </BrandLogoProvider>,
    )

    expect(screen.queryByTestId('fallback-mark')).toBeNull()
    const image = document.querySelector<HTMLImageElement>(
      '[data-brand-logo-selected="true"] img',
    )
    if (!image) throw new Error('Missing selected logo image')
    expect(image).toBeInstanceOf(HTMLImageElement)
    expect(image.src).toBe('https://cdn.test/linear-icon.png')
    expect(
      screen.getByRole('link', { name: 'Northridge' }).getAttribute('href'),
    ).toBe('/')
  })
})
