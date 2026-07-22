// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

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

  return { Link, useRouter: () => undefined }
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

const { cleanup, fireEvent, render, screen } =
  await import('@testing-library/react')
const {
  SiteNav,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarActions,
  NavbarRouteLink,
  NavbarCta,
} = await import('./SiteNav.tsx')
const { PageStateContext, RoutesContext } =
  await import('../lib/route-context.tsx')
const { PreviewUrlBridgeContext } =
  await import('../lib/preview-url-bridge.tsx')

afterEach(() => {
  cleanup()
  navigate.mockReset()
  window.history.replaceState(null, '', '/')
})

describe('SiteNav compound', () => {
  it('renders children in compound mode', () => {
    render(
      <SiteNav position="sticky" height="compact" className="bg-background/95">
        <NavbarBrand>Brand</NavbarBrand>
        <NavbarNav>
          <NavbarNavLink>Home</NavbarNavLink>
          <NavbarNavLink>About</NavbarNavLink>
        </NavbarNav>
        <NavbarActions>
          <NavbarCta variant="primary">Get Started</NavbarCta>
        </NavbarActions>
      </SiteNav>,
    )

    expect(screen.getByText('Brand')).toBeTruthy()
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('About')).toBeTruthy()
    expect(screen.getByText('Get Started')).toBeTruthy()
  })

  it('applies position=sticky classes to header', () => {
    render(
      <SiteNav position="sticky" height="default">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const header = document.querySelector('[data-slot="site-nav"]')
    expect(header).toBeTruthy()
    expect(header?.className).toContain('sticky')
    expect(header?.className).toContain('backdrop-blur-sm')
  })

  it('applies position=fixed classes to header', () => {
    render(
      <SiteNav position="fixed" height="default">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const header = document.querySelector('[data-slot="site-nav"]')
    expect(header?.className).toContain('fixed')
    expect(header?.className).toContain('backdrop-blur-md')
  })

  it('applies height=compact class to row', () => {
    render(
      <SiteNav position="sticky" height="compact">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const row = document.querySelector('.flex.items-center.justify-between')
    expect(row?.className).toContain('h-16')
  })

  it('applies height=responsive class to row', () => {
    render(
      <SiteNav position="sticky" height="responsive">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const row = document.querySelector('.flex.items-center.justify-between')
    expect(row?.className).toContain('h-16')
    expect(row?.className).toContain('lg:h-20')
  })

  it('applies height=outlier with no height class', () => {
    render(
      <SiteNav position="sticky" height="outlier">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const row = document.querySelector('.flex.items-center.justify-between')
    expect(row?.className).not.toContain('h-16')
    expect(row?.className).not.toContain('h-20')
  })

  it('merges className on header via twMerge', () => {
    render(
      <SiteNav position="sticky" className="bg-card/95">
        <NavbarBrand>Brand</NavbarBrand>
      </SiteNav>,
    )

    const header = document.querySelector('[data-slot="site-nav"]')
    expect(header?.className).toContain('bg-card/95')
  })
})

describe('NavbarBrand', () => {
  it('renders a div with data-slot', () => {
    render(<NavbarBrand data-testid="brand">Logo</NavbarBrand>)
    const el = screen.getByTestId('brand')
    expect(el.getAttribute('data-slot')).toBe('navbar-brand')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('items-center')
  })

  it('renders as child when asChild', () => {
    render(
      <NavbarBrand asChild>
        <button data-testid="brand-btn">Logo</button>
      </NavbarBrand>,
    )
    const el = screen.getByTestId('brand-btn')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('navbar-brand')
  })
})

describe('NavbarNav', () => {
  it('renders hidden md:flex by default', () => {
    render(
      <NavbarNav data-testid="nav">
        <NavbarNavLink>Home</NavbarNavLink>
      </NavbarNav>,
    )
    const el = screen.getByTestId('nav')
    expect(el.getAttribute('data-slot')).toBe('navbar-nav')
    expect(el.className).toContain('hidden')
    expect(el.className).toContain('md:flex')
  })

  it('renders hidden lg:flex when breakpoint=lg', () => {
    render(
      <NavbarNav breakpoint="lg" data-testid="nav">
        <NavbarNavLink>Home</NavbarNavLink>
      </NavbarNav>,
    )
    const el = screen.getByTestId('nav')
    expect(el.className).toContain('lg:flex')
    expect(el.className).not.toContain('md:flex')
  })
})

describe('NavbarNavLink', () => {
  it('renders an anchor with data-slot and default classes', () => {
    render(<NavbarNavLink data-testid="link">Home</NavbarNavLink>)
    const el = screen.getByTestId('link')
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('data-slot')).toBe('navbar-nav-link')
    expect(el.className).toContain('text-muted-foreground')
  })

  it('styles the active link when href matches the current page', () => {
    window.history.pushState(null, '', '/pricing')

    render(
      <>
        <NavbarNavLink href={window.location.href} data-testid="active-link">
          Pricing
        </NavbarNavLink>
        <NavbarNavLink
          href="https://example.test/about"
          data-testid="idle-link"
        >
          About
        </NavbarNavLink>
      </>,
    )

    const activeLink = screen.getByTestId('active-link')
    const idleLink = screen.getByTestId('idle-link')

    expect(activeLink.getAttribute('aria-current')).toBe('page')
    expect(activeLink.getAttribute('href')).toBe(window.location.href)
    expect(activeLink.className).toContain('bg-muted')
    expect(activeLink.className).toContain('rounded-md')
    expect(activeLink.className).toContain('text-foreground')
    expect(activeLink.className).toContain('underline')
    expect(idleLink.getAttribute('aria-current')).toBeNull()
    expect(idleLink.className).toContain('hover:bg-muted')
    expect(idleLink.className).toContain('text-muted-foreground')
    expect(idleLink.className).not.toContain('underline')
  })

  it('resolves route-label hrefs from RoutesContext', () => {
    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <NavbarNavLink href="Pricing" data-testid="pricing-link">
          Pricing
        </NavbarNavLink>
      </RoutesContext.Provider>,
    )

    expect(screen.getByTestId('pricing-link').getAttribute('href')).toBe(
      '/pricing',
    )
  })

  it('does not throw when generated nav href props are null', () => {
    const generatedNullHref = null as unknown as string

    expect(() =>
      render(
        <>
          <NavbarBrand href={generatedNullHref} data-testid="brand-link">
            Broken brand input
          </NavbarBrand>
          <NavbarNavLink href={generatedNullHref} data-testid="nav-link">
            Broken nav input
          </NavbarNavLink>
          <NavbarRouteLink href={generatedNullHref} data-testid="route-link">
            Broken route input
          </NavbarRouteLink>
          <NavbarCta href={generatedNullHref} data-testid="cta-link">
            Broken CTA input
          </NavbarCta>
        </>,
      ),
    ).not.toThrow()

    expect(screen.getByTestId('brand-link').getAttribute('href')).toBeNull()
    expect(screen.getByTestId('nav-link').getAttribute('href')).toBeNull()
    expect(screen.getByTestId('route-link').getAttribute('href')).toBeNull()
    expect(screen.getByTestId('cta-link').getAttribute('href')).toBeNull()
  })

  it('scopes compound nav hrefs to the SiteNav base path', () => {
    window.history.pushState(null, '', '/lakebed/site/pricing')

    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Pricing',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <SiteNav>
          <NavbarNav>
            <NavbarNavLink href="Home" data-testid="home-link">
              Home
            </NavbarNavLink>
            <NavbarNavLink href="Pricing" data-testid="pricing-link">
              Pricing
            </NavbarNavLink>
          </NavbarNav>
        </SiteNav>
      </RoutesContext.Provider>,
    )

    expect(screen.getByTestId('home-link').getAttribute('href')).toBe(
      '/lakebed/site',
    )
    expect(screen.getByTestId('pricing-link').getAttribute('href')).toBe(
      '/lakebed/site/pricing',
    )
    expect(
      screen.getByTestId('pricing-link').getAttribute('aria-current'),
    ).toBe('page')
  })

  it('scopes nav hrefs from a generated session home URL', () => {
    window.history.pushState(null, '', '/generate/session-123')

    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <SiteNav>
          <NavbarNav>
            <NavbarNavLink href="Pricing" data-testid="pricing-link">
              Pricing
            </NavbarNavLink>
          </NavbarNav>
        </SiteNav>
      </RoutesContext.Provider>,
    )

    expect(screen.getByTestId('pricing-link').getAttribute('href')).toBe(
      '/generate/session-123/pricing',
    )
  })

  it('does not append a page slug twice when route state has not caught up', () => {
    window.history.pushState(null, '', '/pricing')

    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Home',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <SiteNav>
          <NavbarNav>
            <NavbarNavLink href="Home" data-testid="home-link">
              Home
            </NavbarNavLink>
            <NavbarNavLink href="Pricing" data-testid="pricing-link">
              Pricing
            </NavbarNavLink>
          </NavbarNav>
        </SiteNav>
      </RoutesContext.Provider>,
    )

    expect(screen.getByTestId('pricing-link').getAttribute('href')).toBe(
      '/pricing',
    )
    expect(screen.getByTestId('home-link').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      screen.getByTestId('pricing-link').getAttribute('aria-current'),
    ).toBeNull()
    expect(screen.getByTestId('pricing-link').className).not.toContain(
      'bg-muted text-foreground underline',
    )
  })

  it('does not append a page slug twice under an arbitrary nested base', () => {
    window.history.pushState(null, '', '/future/session/path/pricing')

    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Pricing',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <SiteNav>
          <NavbarNav>
            <NavbarNavLink href="Home" data-testid="home-link">
              Home
            </NavbarNavLink>
            <NavbarNavLink href="Pricing" data-testid="pricing-link">
              Pricing
            </NavbarNavLink>
          </NavbarNav>
        </SiteNav>
      </RoutesContext.Provider>,
    )

    expect(screen.getByTestId('home-link').getAttribute('href')).toBe(
      '/future/session/path',
    )
    expect(screen.getByTestId('pricing-link').getAttribute('href')).toBe(
      '/future/session/path/pricing',
    )
    expect(
      screen.getByTestId('pricing-link').getAttribute('aria-current'),
    ).toBe('page')
  })

  it('keeps active styling for query strings and trailing slashes', () => {
    window.history.pushState(null, '', '/future/session/path/pricing/?utm=1')

    render(
      <RoutesContext.Provider
        value={{
          routes: ['Home', 'Pricing'],
          targetMap: {},
          currentPage: 'Pricing',
          setCurrentPage: vi.fn(),
          pendingSectionId: null,
          setPendingSectionId: vi.fn(),
        }}
      >
        <SiteNav>
          <NavbarNav>
            <NavbarNavLink href="Pricing" data-testid="pricing-link">
              Pricing
            </NavbarNavLink>
          </NavbarNav>
        </SiteNav>
      </RoutesContext.Provider>,
    )

    const pricingLink = screen.getByTestId('pricing-link')
    expect(pricingLink.getAttribute('href')).toBe(
      '/future/session/path/pricing',
    )
    expect(pricingLink.getAttribute('aria-current')).toBe('page')
    expect(pricingLink.className).toContain('bg-muted')
    expect(pricingLink.className).toContain('text-foreground')
    expect(pricingLink.className).toContain('underline')
  })

  it('switches preview pages when a generated absolute home href matches the base path', () => {
    window.history.pushState(null, '', '/preview/session-123/gallery')
    const setCurrentPage = vi.fn()
    const setPage = vi.fn()
    const navigateToPage = vi.fn()

    render(
      <PreviewUrlBridgeContext.Provider
        value={{ navigateToPage, pageFromUrl: 'gallery' }}
      >
        <PageStateContext.Provider value={{ setPage }}>
          <RoutesContext.Provider
            value={{
              routes: ['Home', 'Gallery'],
              targetMap: {},
              currentPage: 'Gallery',
              setCurrentPage,
              pendingSectionId: null,
              setPendingSectionId: vi.fn(),
            }}
          >
            <SiteNav>
              <NavbarNav>
                <NavbarNavLink href="/" data-testid="home-link">
                  Home
                </NavbarNavLink>
              </NavbarNav>
            </SiteNav>
          </RoutesContext.Provider>
        </PageStateContext.Provider>
      </PreviewUrlBridgeContext.Provider>,
    )

    fireEvent.click(screen.getByTestId('home-link'))

    expect(setCurrentPage).toHaveBeenCalledWith('Home')
    expect(setPage).toHaveBeenCalledWith('Home')
    expect(navigateToPage).toHaveBeenCalledWith(null)
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<NavbarNavLink onClick={onClick}>Home</NavbarNavLink>)
    fireEvent.click(screen.getByText('Home'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('NavbarActions', () => {
  it('renders a div with data-slot and flex classes', () => {
    render(
      <NavbarActions data-testid="actions">
        <button>CTA</button>
      </NavbarActions>,
    )
    const el = screen.getByTestId('actions')
    expect(el.getAttribute('data-slot')).toBe('navbar-actions')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('gap-4')
  })
})

describe('NavbarCta', () => {
  it('renders primary variant by default', () => {
    render(<NavbarCta data-testid="cta">Get Started</NavbarCta>)
    const el = screen.getByTestId('cta')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('navbar-cta')
    expect(el.className).toContain('bg-primary')
    expect(el.className).toContain('rounded-lg')
  })

  it('renders primary-pill variant', () => {
    render(
      <NavbarCta variant="primary-pill" data-testid="cta">
        Get Started
      </NavbarCta>,
    )
    const el = screen.getByTestId('cta')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('bg-primary')
  })

  it('renders dark variant', () => {
    render(
      <NavbarCta variant="dark" data-testid="cta">
        Order
      </NavbarCta>,
    )
    const el = screen.getByTestId('cta')
    expect(el.className).toContain('bg-foreground')
    expect(el.className).toContain('text-background')
  })

  it('renders outline variant', () => {
    render(
      <NavbarCta variant="outline" data-testid="cta">
        Contact
      </NavbarCta>,
    )
    const el = screen.getByTestId('cta')
    expect(el.className).toContain('border')
    expect(el.className).toContain('border-border')
  })

  it('renders as child when asChild', () => {
    render(
      <NavbarCta asChild variant="primary" data-testid="cta">
        <button onClick={() => navigate('Order')}>Order</button>
      </NavbarCta>,
    )
    const el = screen.getByTestId('cta')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('navbar-cta')
    fireEvent.click(el)
    expect(navigate).toHaveBeenCalledWith('Order')
  })
})

describe('SiteNav bare mode', () => {
  it('renders header with data-slot and children directly (no nav wrapper)', () => {
    render(
      <SiteNav bare position="sticky" data-testid="bare">
        <div data-testid="child">tier 1</div>
      </SiteNav>,
    )
    const el = screen.getByTestId('bare')
    expect(el.tagName).toBe('HEADER')
    expect(el.getAttribute('data-slot')).toBe('site-nav')
    expect(el.className).toContain('sticky')
    // child is rendered directly inside header, not wrapped in nav
    expect(el.querySelector('[data-testid="child"]')).not.toBeNull()
    expect(el.querySelector('nav')).toBeNull()
  })

  it('does not render Container wrapper in bare mode', () => {
    render(
      <SiteNav bare data-testid="bare">
        <div>content</div>
      </SiteNav>,
    )
    const el = screen.getByTestId('bare')
    expect(el.querySelector('[data-slot="container"]')).toBeNull()
  })
})
