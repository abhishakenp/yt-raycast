// @vitest-environment jsdom

import React from 'react'
import { Renderer } from '@openuidev/react-lang'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mutation = Object.assign(
  vi.fn(async () => []),
  {
    isPending: false,
    lastError: null,
    pendingCount: 0,
    reset: vi.fn(),
  },
)

vi.mock('@ship-fast/lakebed/react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/react')>()
  return {
    ...actual,
    createLakebedClient: vi.fn(() => ({
      signInWithGoogle: vi.fn(async () => ({
        bundle: { challenge: '', state: '', verifier: '' },
        url: '',
      })),
      signOut: vi.fn(),
      useAuth: () => ({
        displayName: 'Guest',
        isAuthenticated: false,
        isGuest: true,
        isLoading: false,
        provider: 'guest',
        user: null,
        userId: 'guest:local',
      }),
      useData: () => ({}),
      useMutation: () => mutation,
      useQuery: () => undefined,
    })),
    useAuth: () => ({
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      provider: 'guest',
      user: null,
      userId: 'guest:local',
    }),
    useKeyedLakebedMutation: () =>
      Object.assign(
        vi.fn(async () => []),
        {
          hasPending: false,
          isPending: vi.fn(() => false),
          lastError: vi.fn(() => null),
          pendingCount: 0,
          pendingKey: null,
          pendingKeys: [],
          reset: vi.fn(),
          run: vi.fn(async () => []),
        },
      ),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }
})

const { EcommerceNavbar } = await import('./EcommerceNavbar.tsx')
const { EcommerceOverview } = await import('./EcommerceOverview.tsx')
const { loadOpenUIRuntimeLibrary } = await import('../../../runtime-library.ts')

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ecommerce generated null route props', () => {
  it('renders capsule components when optional route targets are generated as null', () => {
    const Navbar = EcommerceNavbar.client.component
    const Overview = EcommerceOverview.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Shodidas',
            nav: ['Home', 'Gallery'],
            homeTarget: null,
            shopCta: 'Shop Now',
            shopTarget: '/shop',
            cartCount: '0',
          }}
          statementId="home_navbar"
        />
        <Overview
          props={{
            brand: 'Shodidas',
            eyebrow: 'About Shodidas',
            heading: 'Elevating Footwear to Art',
            subheading:
              'From concept to creation, we blend luxury materials with innovative design to bring you shoes that shine.',
            primaryCta: 'Our Story',
            secondaryCta: null,
            imageAlt: 'artisan polishing a crystal-embellished shoe',
            features: ['Sustainable sourcing'],
            stats: [{ value: '10K+', label: 'Pairs Sold' }],
          }}
          statementId="home_overview"
        />
      </>,
    )

    expect(screen.getAllByText('Shodidas').length).toBeGreaterThan(0)
    expect(screen.getByText('Elevating Footwear to Art')).toBeTruthy()
    expect(screen.getByText('Learn more')).toBeTruthy()
  })

  it('renders the OpenUI renderer path for generated null route arguments', async () => {
    const source = `
      home_navbar = EcommerceNavbar("Shodidas", ["Home","Gallery"], null, "Shop Now", "/shop", "0")
      home_overview = EcommerceOverview("Shodidas", "About Shodidas", "Elevating Footwear to Art", "From concept to creation, we blend luxury materials with innovative design to bring you shoes that shine.", "Our Story", null, "artisan polishing a crystal-embellished shoe in a workshop", ["Sustainable sourcing"], [{"value":"10K+","label":"Pairs Sold"}])
      home = Stack([home_navbar, home_overview])
      gallery = Stack([])
      root = PageSwitch(["Home","Gallery"], [home, gallery], "", {"Home":"Home","home_overview":"Home#home_overview","Broken":null})
    `
    const library = await loadOpenUIRuntimeLibrary(source)

    render(React.createElement(Renderer, { library, response: source }))

    expect(screen.getAllByText('Shodidas').length).toBeGreaterThan(0)
    expect(screen.getByText('Elevating Footwear to Art')).toBeTruthy()
    expect(screen.getByText('Learn more')).toBeTruthy()
  })
})
