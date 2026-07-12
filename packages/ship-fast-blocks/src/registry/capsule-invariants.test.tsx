// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

vi.mock('#/lib/use-navigate.tsx', () => ({
  RoutesContext: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => vi.fn(),
}))

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

import * as registry from '#/registry/all.ts'
import {
  createLibrary,
  isCapsule,
  isDefinedComponent,
  type ShipFastCapsule,
  type CapsuleRenderer,
} from '#/capsules/openui.ts'
import { library, componentNames } from '#/library.ts'
import { capsuleCategories } from '#/generated/capsule-categories.ts'
import { Button } from '#/registry/primitives/button.tsx'
import { ChurchNavbar } from '#/registry/sections/church/ChurchNavbar.tsx'
import { ChurchFaq } from '#/registry/sections/church/ChurchFaq.tsx'
import { ChurchStats } from '#/registry/sections/church/ChurchStats.tsx'

const renderCapsule = <P,>(Component: CapsuleRenderer<P>, props: P) =>
  render(<Component props={props} statementId="invariant-test" />)

afterEach(() => {
  cleanup()
})

describe('registry capsule invariants', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    Element.prototype.scrollIntoView = vi.fn()
    // embla-carousel (used by GovPortalHero) calls window.matchMedia and
    // uses IntersectionObserver at activation time; jsdom provides neither.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
    vi.stubGlobal(
      'IntersectionObserver',
      class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
        root = null
        rootMargin = ''
        thresholds = []
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('every registry capsule is a defineCapsule product (runtime marker)', () => {
    const capsules = Object.values(registry).filter(
      (value): value is ShipFastCapsule => isCapsule(value),
    )
    // The registry ships many capsules (primitives + section families).
    expect(capsules.length).toBeGreaterThan(20)
    for (const capsule of capsules) {
      // isCapsule already verified the marker; assert the structural shape too.
      expect(isCapsule(capsule)).toBe(true)
      expect(typeof capsule.client.name).toBe('string')
      expect(capsule.client.name.length).toBeGreaterThan(0)
      expect(typeof capsule.client.component).toBe('function')
      expect(isDefinedComponent(capsule.client)).toBe(true)
      // Every capsule carries the default Lakebed config stamped by defineCapsule.
      expect(capsule.lakebed).toBeDefined()
      expect(capsule.lakebed?.queries).toBeDefined()
      expect(capsule.lakebed?.mutations).toBeDefined()
    }
  })

  it('defineCapsule stamps data-openui-component on rendered output across families', () => {
    // Representative sample: a leaf primitive + several section capsules.
    // Each is rendered and its root element must carry the capsule name as the
    // data-openui-component attribute — the runtime marker stamped by
    // defineCapsule's wrapper.
    const button = renderCapsule(Button.client.component, { label: 'Click me' })
    expect(
      button.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('Button')

    const navbar = renderCapsule(ChurchNavbar.client.component, {})
    expect(
      navbar.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('ChurchNavbar')

    const faq = renderCapsule(ChurchFaq.client.component, {})
    expect(
      faq.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('ChurchFaq')

    const stats = renderCapsule(ChurchStats.client.component, {})
    expect(
      stats.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('ChurchStats')
  })

  it('isCapsule rejects non-capsule values', () => {
    expect(isCapsule(null)).toBe(false)
    expect(isCapsule(undefined)).toBe(false)
    expect(isCapsule({})).toBe(false)
    expect(isCapsule({ name: 'x' })).toBe(false)
    // A plain function (raw defineComponent output without the wrapper) is not a
    // Ship Fast capsule — it lacks the `client` / `lakebed` envelope.
    expect(isCapsule(() => null)).toBe(false)
  })

  it('assembles the library from registry capsules via the Ship Fast createLibrary wrapper', () => {
    // createLibrary and isCapsule are the Ship Fast wrappers (not OpenUI's
    // defineComponent) — they must be callable functions.
    expect(typeof createLibrary).toBe('function')
    expect(typeof isCapsule).toBe('function')
    // The assembled library exposes every registry capsule by name.
    expect(Object.keys(library.components).length).toBeGreaterThan(20)
    expect(componentNames.length).toBeGreaterThan(20)
    // Every library component is a defined component (has name/props/component).
    for (const name of componentNames) {
      const component = library.components[name]
      expect(component).toBeDefined()
      expect(isDefinedComponent(component)).toBe(true)
    }
  })

  it('renders every section capsule with default props without throwing', () => {
    const capsules = Object.values(registry).filter(
      (value): value is ShipFastCapsule =>
        isCapsule(value) &&
        capsuleCategories[value.client.name]?.category !== 'primitives',
    )
    const failures: Array<{ name: string; error: string }> = []

    for (const capsule of capsules) {
      try {
        const view = renderCapsule(capsule.client.component, {})
        expect(view.container.firstElementChild).toBeTruthy()
        view.unmount()
      } catch (error) {
        failures.push({
          name: capsule.client.name,
          error: error instanceof Error ? error.message : String(error),
        })
      } finally {
        cleanup()
      }
    }

    expect(failures).toEqual([])
  })

  it('renders every section capsule when common generated collection props have malformed shapes', () => {
    const capsules = Object.values(registry).filter(
      (value): value is ShipFastCapsule =>
        isCapsule(value) &&
        capsuleCategories[value.client.name]?.category !== 'primitives',
    )
    const malformedGeneratedProps = {
      actions: { label: 'Act now' },
      cards: { title: 'Card' },
      categories: { label: 'Category' },
      columns: { title: 'Column' },
      features: { title: 'Feature' },
      images: { alt: 'Image' },
      items: { title: 'Item' },
      links: { label: 'Link' },
      nav: { label: 'Home' },
      products: { title: 'Product' },
      stats: { label: '42' },
      steps: { title: 'Step' },
      testimonials: { quote: 'Great' },
      tiers: { name: 'Pro' },
    }
    const failures: Array<{ name: string; error: string }> = []

    for (const capsule of capsules) {
      try {
        const view = renderCapsule(
          capsule.client.component,
          malformedGeneratedProps,
        )
        expect(view.container.firstElementChild).toBeTruthy()
        view.unmount()
      } catch (error) {
        failures.push({
          name: capsule.client.name,
          error: error instanceof Error ? error.message : String(error),
        })
      } finally {
        cleanup()
      }
    }

    expect(failures).toEqual([])
  })

  it('renders every section capsule when generated collection rows and nested rows are malformed', () => {
    const capsules = Object.values(registry).filter(
      (value): value is ShipFastCapsule =>
        isCapsule(value) &&
        capsuleCategories[value.client.name]?.category !== 'primitives',
    )
    const malformedGeneratedProps = {
      actions: [null, false, { label: 'Act now', href: 123 }],
      badges: [null, { label: 42 }],
      cards: [null, { title: 42, description: false }],
      categories: [
        null,
        {
          label: 'Category',
          items: [null, { title: 'Nested item', description: 123 }],
        },
      ],
      columns: [
        null,
        {
          title: 'Column',
          links: [null, { label: 'Nested link', href: 123 }],
        },
      ],
      enterpriseItems: [null, { label: 42, value: false }],
      features: [
        null,
        { title: 'Feature', description: 123, features: [null, false] },
      ],
      firmLinks: [null, { label: 'Firm', href: 123 }],
      groups: [
        null,
        { title: 'Group', links: [null, { label: 'Link', href: 123 }] },
      ],
      images: [null, { alt: 42, src: false }],
      infoLinks: [null, { label: 'Info', href: 123 }],
      items: [
        null,
        {
          title: 'Item',
          description: 123,
          links: [null, { label: 'Nested', href: 123 }],
        },
      ],
      legal: [null, 'Privacy', 42],
      legalLinks: [null, { label: 'Legal', href: 123 }],
      links: [null, { label: 'Link', href: 123 }],
      meta: [null, { label: 'Meta', value: 42 }],
      mini: [null, { quote: 'Tiny testimonial', author: 42 }],
      names: [null, 'Northwind', 42],
      nav: [null, 'Home', 42],
      navLinks: [null, { label: 'Nav', href: 123 }],
      perks: [null, { label: 42 }],
      practiceLinks: [null, { label: 'Practice', href: 123 }],
      products: [
        null,
        {
          title: 'Product',
          price: 19,
          images: [null, { src: false, alt: 42 }],
        },
      ],
      social: [null, { label: 'Twitter', href: 123 }],
      socials: [null, { label: 'LinkedIn', href: 123 }],
      stats: [null, { label: 'Active users', value: 42 }],
      steps: [null, { title: 'Step', description: 123 }],
      testimonials: [null, { quote: 'Great', author: 42 }],
      tiers: [
        null,
        { name: 'Pro', price: 29, features: [null, 'Unlimited', 42] },
      ],
      trust: [null, { label: 'Trusted', value: 42 }],
    }
    const failures: Array<{ name: string; error: string }> = []

    for (const capsule of capsules) {
      try {
        const view = renderCapsule(
          capsule.client.component,
          malformedGeneratedProps,
        )
        expect(view.container.firstElementChild).toBeTruthy()
        view.unmount()
      } catch (error) {
        failures.push({
          name: capsule.client.name,
          error: error instanceof Error ? error.message : String(error),
        })
      } finally {
        cleanup()
      }
    }

    expect(failures).toEqual([])
  })
})
