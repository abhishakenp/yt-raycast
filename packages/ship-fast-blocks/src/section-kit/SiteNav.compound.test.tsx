// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
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
  NavbarCta,
} = await import('./SiteNav.tsx')

afterEach(() => {
  cleanup()
  navigate.mockReset()
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
  it('renders a button with data-slot and default classes', () => {
    render(<NavbarNavLink data-testid="link">Home</NavbarNavLink>)
    const el = screen.getByTestId('link')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('navbar-nav-link')
    expect(el.className).toContain('text-muted-foreground')
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
