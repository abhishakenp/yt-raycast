// @vitest-environment jsdom

import type { ReactElement, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

  return { Link, useRouter: () => undefined }
})

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
const { SiteNav, NavbarBrand } = await import('./SiteNav.tsx')
const { BrandLogoProvider } = await import('./Logo.tsx')
const { RoutesContext } = await import('../lib/route-context.tsx')

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('SiteNav', () => {
  function renderWithRoutes(node: ReactElement) {
    return render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Services', 'Pricing', 'Contact'],
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
          pageIds: [],
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

  it('keeps legacy nav links under the current base path', () => {
    window.history.pushState(null, '', '/preview/release-preview')

    renderWithRoutes(
      <SiteNav
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Northridge' }).getAttribute('href'),
    ).toBe('/preview/release-preview')
    expect(
      screen.getAllByRole('link', { name: 'Pricing' })[0]?.getAttribute('href'),
    ).toContain('/preview/release-preview/pricing')
    expect(
      screen
        .getByRole('link', { name: 'Schedule Consultation' })
        .getAttribute('href'),
    ).toBe('/preview/release-preview/contact')
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

  it('renders a spacer div after the header when sticky to offset fixed positioning', () => {
    renderWithRoutes(<SiteNav brand="Test" nav={['Home']} sticky />)
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    expect(header?.className).toContain('fixed')
    // The spacer div should follow the header
    const spacer = header?.nextElementSibling
    expect(spacer).toBeTruthy()
    expect(spacer?.tagName).toBe('DIV')
    expect(spacer?.className).toContain('h-20')
    expect(spacer?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not render a spacer div when not sticky', () => {
    renderWithRoutes(<SiteNav brand="Test" nav={['Home']} sticky={false} />)
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    expect(header?.className).toContain('relative')
    // No spacer div should follow
    const spacer = header?.nextElementSibling
    expect(spacer?.tagName).not.toBe('DIV')
  })
})

describe('SiteNav variant layouts', () => {
  function renderWithRoutes(node: ReactElement) {
    return render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'About', 'Contact'],
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
          pageIds: [],
        }}
      >
        {node}
      </RoutesContext.Provider>,
    )
  }

  it('default variant: brand, links, and CTA in a single row', () => {
    renderWithRoutes(
      <SiteNav
        brand="Acme"
        nav={['About', 'Contact']}
        cta={{ label: 'Sign Up' }}
        variant="default"
      />,
    )
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    // Single nav row
    const nav = header?.querySelector('nav')
    expect(nav).toBeTruthy()
    // Links visible in the row
    expect(screen.getByText('About')).toBeTruthy()
    expect(screen.getByText('Sign Up')).toBeTruthy()
  })

  it('centered variant: brand centered, links in a second row below', () => {
    renderWithRoutes(
      <SiteNav
        brand="Acme"
        nav={['About', 'Contact']}
        cta={{ label: 'Sign Up' }}
        variant="centered"
      />,
    )
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    // Centered variant has no <nav> — uses divs instead
    const nav = header?.querySelector('nav')
    expect(nav).toBeNull()
    // Brand row has justify-center
    const brandRow = header?.querySelector('div > div')
    expect(brandRow?.className).toContain('justify-center')
    // Links in a second row with border-t
    const linkRow = header?.querySelector('.border-t')
    expect(linkRow).toBeTruthy()
    expect(screen.getByText('About')).toBeTruthy()
  })

  it('minimal variant: brand and CTA only, no visible desktop links', () => {
    renderWithRoutes(
      <SiteNav
        brand="Acme"
        nav={['About', 'Contact']}
        cta={{ label: 'Sign Up' }}
        variant="minimal"
      />,
    )
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    const nav = header?.querySelector('nav')
    expect(nav).toBeTruthy()
    // The nav row should have brand and CTA but no visible links div
    // (links are only in the mobile drawer)
    const linksDiv = nav?.querySelector('.hidden.items-center.gap-8.md\\:flex')
    expect(linksDiv).toBeNull()
    // CTA still visible
    expect(screen.getByText('Sign Up')).toBeTruthy()
  })

  it('split variant: brand left, links right, CTA far right', () => {
    renderWithRoutes(
      <SiteNav
        brand="Acme"
        nav={['About', 'Contact']}
        cta={{ label: 'Sign Up' }}
        variant="split"
      />,
    )
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    const nav = header?.querySelector('nav')
    expect(nav).toBeTruthy()
    // Split variant uses ml-auto for links and CTA
    const mlAutoDivs = nav?.querySelectorAll('.ml-auto')
    expect(mlAutoDivs?.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('About')).toBeTruthy()
  })

  it('defaults to default variant when variant not specified', () => {
    renderWithRoutes(
      <SiteNav brand="Acme" nav={['About']} cta={{ label: 'Sign Up' }} />,
    )
    const header = document.querySelector('header')
    const nav = header?.querySelector('nav')
    expect(nav).toBeTruthy()
    // Default has justify-between on the nav
    expect(nav?.className).toContain('justify-between')
  })

  it('brand link has data-d-role="link" not "nav"', () => {
    renderWithRoutes(<NavbarBrand href="/">Brand</NavbarBrand>)
    const brand = document.querySelector('[data-slot="navbar-brand"]')
    expect(brand).toBeTruthy()
    expect(brand?.getAttribute('data-d-role')).toBe('link')
  })

  it('split variant header has data-d-role="nav"', () => {
    renderWithRoutes(
      <SiteNav
        brand="Acme"
        nav={['About']}
        cta={{ label: 'Sign Up' }}
        variant="split"
      />,
    )
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    expect(header?.getAttribute('data-d-role')).toBe('nav')
  })
})
