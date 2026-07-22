// @vitest-environment jsdom

import type { ReactElement, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

type MockLinkProps = React.ComponentProps<'a'> & {
  children: ReactNode
  to: string
}

vi.mock('@tanstack/react-router', () => {
  function Link({ children, to, ...props }: MockLinkProps) {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    )
  }

  return { Link, useRouter: () => null }
})

vi.mock('#/lib/route-context.tsx', async (importOriginal) => ({
  ...(await importOriginal()),
}))

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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { MobileNavDrawer } = await import('./MobileNavDrawer.tsx')
const { RoutesContext } = await import('#/lib/route-context.tsx')

afterEach(() => {
  cleanup()
  navigate.mockReset()
  window.history.replaceState(null, '', '/')
})

function renderWithRoutes(
  node: ReactElement,
  routes = ['Home', 'Services', 'Pricing', 'Contact'],
  currentPage = 'Home',
) {
  return render(
    <RoutesContext.Provider
      value={{
        routes,
        targetMap: {},
        currentPage,
        setCurrentPage: vi.fn(),
        pendingSectionId: null,
        setPendingSectionId: vi.fn(),
      }}
    >
      {node}
    </RoutesContext.Provider>,
  )
}

describe('MobileNavDrawer', () => {
  it('opens a real sheet and navigates from drawer links, not the trigger', async () => {
    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Northridge')).toBeTruthy()

    const pricingLink = screen.getByRole('link', { name: 'Pricing' })
    expect(pricingLink.getAttribute('href')).toBe('/pricing')
    fireEvent.click(pricingLink)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('routes the home action to Home instead of the first nav item', async () => {
    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Services', 'Pricing']}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink.getAttribute('href')).toBe('/')
    fireEvent.click(homeLink)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('does not duplicate Home when nav already contains Home', () => {
    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Home', 'Services', 'Pricing']}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Services' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pricing' })).toBeTruthy()
  })

  it('ignores generated null and empty nav entries', () => {
    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        homeLabel={null}
        homeTarget={null}
        nav={['Home', null, '  ', undefined, ' Services ', 'Pricing']}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)
    expect(
      screen.getByRole('link', { name: 'Services' }).getAttribute('href'),
    ).toBe('/services')
    expect(
      screen.getByRole('link', { name: 'Pricing' }).getAttribute('href'),
    ).toBe('/pricing')
  })

  it('keeps the active drawer route visually highlighted', () => {
    window.history.pushState(null, '', '/pricing')

    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Services', 'Pricing']}
        buttonClassName="md:hidden"
      />,
      ['Home', 'Services', 'Pricing', 'Contact'],
      'Pricing',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const pricingLink = screen.getByRole('link', { name: 'Pricing' })
    expect(pricingLink.getAttribute('aria-current')).toBe('page')
    expect(pricingLink.className).toContain('bg-muted')
    expect(pricingLink.className).toContain('text-foreground')
    expect(pricingLink.className).toContain('border-primary')
  })

  it('keeps long drawer navigation scroll-contained and renders footer content', () => {
    const routes = [
      'Home',
      ...Array.from({ length: 30 }, (_, index) => `Section ${index + 1}`),
    ]
    renderWithRoutes(
      <MobileNavDrawer
        brand="Northridge"
        nav={routes.slice(1)}
        buttonClassName="md:hidden"
        footer={<button type="button">Account</button>}
      />,
      routes,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog.classList.contains('overflow-y-auto')).toBe(true)
    expect(dialog.classList.contains('overscroll-contain')).toBe(true)
    expect(screen.getByRole('link', { name: 'Section 30' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Account' })).toBeTruthy()
  })
})
