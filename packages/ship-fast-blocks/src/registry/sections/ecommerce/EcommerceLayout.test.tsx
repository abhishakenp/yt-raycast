// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const guestAuth = {
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  user: null,
}

const inertLakebedMutation = Object.assign(vi.fn().mockResolvedValue(null), {
  lastError: null,
  reset: vi.fn(),
})

const inertLakebed = {
  useAuth: () => guestAuth,
  useMutation: () => inertLakebedMutation,
  useQuery: () => undefined,
}

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => inertLakebed,
  useAuth: () => guestAuth,
  useKeyedLakebedMutation: () => ({
    hasPending: false,
    isPending: () => false,
    lastError: null,
    pendingKey: null,
    pendingKeys: [],
    reset: vi.fn(),
    run: vi.fn().mockResolvedValue(null),
  }),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

const { cleanup, render } = await import('@testing-library/react')
const { EcommerceHero } = await import('./EcommerceHero.tsx')
const { EcommerceFeatures } = await import('./EcommerceFeatures.tsx')
const { EcommerceTestimonials } = await import('./EcommerceTestimonials.tsx')

afterEach(() => {
  cleanup()
})

describe('EcommerceHero layout', () => {
  it('does not stack redundant top padding on the section (navbar is sticky, not fixed)', () => {
    const { container } = render(
      <EcommerceHero.client.component props={{}} statementId="hero_layout" />,
    )
    const section = container.querySelector('section[aria-label="Hero"]')
    expect(section).not.toBeNull()
    // The section must not carry its own pt-* — the inner grid handles padding.
    expect(section?.className).not.toMatch(/\bpt-/)
  })

  it('keeps the inner grid vertical padding bounded so the hero is not excessively tall', () => {
    const { container } = render(
      <EcommerceHero.client.component props={{}} statementId="hero_padding" />,
    )
    const grid = container.querySelector('.mx-auto.grid.max-w-7xl')
    expect(grid).not.toBeNull()
    // Standalone py-16 (and lg:py-24) were the old excessive values; new bound
    // is py-12 lg:py-16. lg:py-16 is expected and allowed.
    expect(grid?.className).not.toMatch(/(?<!lg:)py-16\b/)
    expect(grid?.className).not.toMatch(/\blg:py-24\b/)
    expect(grid?.className).toMatch(/\bpy-12\b/)
    expect(grid?.className).toMatch(/\blg:py-16\b/)
  })
})

describe('EcommerceFeatures layout', () => {
  it('wraps the feature grid in a Container so content is centered with a max width', () => {
    const { container } = render(
      <EcommerceFeatures.client.component
        props={{}}
        statementId="features_layout"
      />,
    )
    // The section wrapper must exist with vertical rhythm matching siblings.
    const section = container.querySelector(
      'section[aria-label="Store benefits"]',
    )
    expect(section).not.toBeNull()
    expect(section?.className).toMatch(/\bpy-20\b/)
    expect(section?.className).toMatch(/\blg:py-28\b/)

    // A Container (data-slot="container") must be present providing max-width + gutters.
    const containerEl = section?.querySelector('[data-slot="container"]')
    expect(containerEl).not.toBeNull()
    expect(containerEl?.className).toMatch(/\bmax-w-7xl\b/)
    expect(containerEl?.className).toMatch(/\bpx-4\b/)
  })

  it('renders the FeatureGrid cards inside the Container, not flush to the viewport edge', () => {
    const { container } = render(
      <EcommerceFeatures.client.component
        props={{
          features: [
            { title: 'Free Shipping', description: 'On all orders over $50.' },
            { title: 'Easy Returns', description: '30-day returns.' },
          ],
        }}
        statementId="features_grid"
      />,
    )
    const containerEl = container.querySelector('[data-slot="container"]')
    const cards = containerEl?.querySelectorAll(
      '.rounded-xl.border.border-border',
    )
    expect(cards?.length).toBe(2)
  })
})

describe('EcommerceTestimonials layout', () => {
  it('wraps the testimonial grid in a Container so content is centered with a max width', () => {
    const { container } = render(
      <EcommerceTestimonials.client.component
        props={{}}
        statementId="testimonials_layout"
      />,
    )
    const section = container.querySelector(
      'section[aria-label="Customer reviews"]',
    )
    expect(section).not.toBeNull()
    expect(section?.className).toMatch(/\bpy-20\b/)
    expect(section?.className).toMatch(/\blg:py-28\b/)

    const containerEl = section?.querySelector('[data-slot="container"]')
    expect(containerEl).not.toBeNull()
    expect(containerEl?.className).toMatch(/\bmax-w-7xl\b/)
    expect(containerEl?.className).toMatch(/\bpx-4\b/)
  })
})
