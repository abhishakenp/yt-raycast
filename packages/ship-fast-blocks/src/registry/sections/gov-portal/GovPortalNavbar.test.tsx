// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

const mutationStub = Object.assign(
  vi.fn(async () => null),
  {
    isPending: false,
    lastError: null as unknown,
    pendingCount: 0,
    reset: () => {},
  },
)

const lakebedStub = {
  useQuery: () => null,
  useMutation: () => mutationStub,
  useAuth: () => ({ isAuthenticated: false, user: null }),
  signInWithGoogle: vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  })),
  signOut: vi.fn(),
}

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')
  return {
    ...actual,
    createLakebedClient: vi.fn(() => lakebedStub),
  }
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

if (
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.scrollIntoView === 'undefined'
) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

const { cleanup, render, screen } = await import('@testing-library/react')
const { GovPortalNavbar } = await import('./GovPortalNavbar.tsx')

afterEach(() => cleanup())

function classTokens(el: Element) {
  return (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
}

describe('GovPortalNavbar mega-nav hover visibility', () => {
  // The mega-nav sits on bg-primary (dark indigo) with primary-foreground
  // (white) text. Radix NavigationMenu opens its dropdown ON HOVER, so the
  // trigger is `data-state=open` + `:hover` at the same time. The shadcn
  // navigationMenuTriggerStyle base ships `data-[state=open]:hover:bg-accent`
  // / `data-[state=open]:focus:bg-accent` — a LIGHT accent surface under the
  // still-white text, which made the label nearly invisible while hovering.
  it('dropdown trigger keeps primary-foreground styling while hovered open — no accent surface leaks through', () => {
    render(<GovPortalNavbar.component props={{ brand: 'Test PSU' }} />)

    const trigger = screen.getByRole('button', { name: /The Company/ })
    const tokens = classTokens(trigger)

    expect(tokens).toContain('data-[state=open]:hover:bg-primary-foreground/15')
    expect(tokens).toContain('data-[state=open]:hover:text-primary-foreground')
    expect(tokens).toContain('data-[state=open]:focus:bg-primary-foreground/15')
    expect(tokens).toContain('data-[state=open]:focus:text-primary-foreground')

    // The shadcn base accent classes must have been merged away.
    expect(tokens).not.toContain('data-[state=open]:hover:bg-accent')
    expect(tokens).not.toContain('data-[state=open]:focus:bg-accent')
    expect(tokens).not.toContain('data-[state=open]:bg-accent/50')
    expect(tokens).not.toContain('hover:bg-accent')
    expect(tokens).not.toContain('hover:text-accent-foreground')
  })

  // Plain (no-dropdown) items render as NavigationMenuLink asChild → Radix
  // Slot CONCATENATES the Link's own className with the button's (no
  // twMerge across the two), so the Link base `hover:bg-accent
  // hover:text-accent-foreground` used to survive and could win in the
  // stylesheet: dark accent-foreground text on the dark indigo bar.
  it('plain nav items carry no accent hover classes from the NavigationMenuLink base', () => {
    render(<GovPortalNavbar.component props={{ brand: 'Test PSU' }} />)

    const home = screen.getByRole('button', { name: 'Home' })
    const tokens = classTokens(home)

    expect(tokens).toContain('hover:bg-primary-foreground/15')
    expect(tokens).toContain('hover:text-primary-foreground')
    expect(tokens).toContain('focus:bg-primary-foreground/15')
    expect(tokens).toContain('focus:text-primary-foreground')

    expect(tokens).not.toContain('hover:bg-accent')
    expect(tokens).not.toContain('hover:text-accent-foreground')
    expect(tokens).not.toContain('focus:bg-accent')
    expect(tokens).not.toContain('focus:text-accent-foreground')
  })
})
