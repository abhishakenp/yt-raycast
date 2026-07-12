// @vitest-environment jsdom

import React from 'react'
import { Renderer } from '@openuidev/react-lang'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => {
  const signInWithGoogle = vi.fn(async () => ({
    bundle: {
      challenge: 'challenge',
      state: 'state',
      verifier: 'verifier',
    },
    url: 'https://auth.example.test/start',
  }))
  const runMutation = vi.fn(async () => [])
  const mutation = Object.assign(runMutation, {
    isPending: false,
    lastError: null,
    pendingCount: 0,
    reset: vi.fn(),
    runWithLifecycle: vi.fn(
      async (
        lifecycle: {
          onExecutionEnd?: () => void
          onExecutionStart?: () => void
        },
        ...args: unknown[]
      ) => {
        lifecycle.onExecutionStart?.()
        try {
          return await runMutation(...args)
        } finally {
          lifecycle.onExecutionEnd?.()
        }
      },
    ),
  })
  const lakebed = {
    signInWithGoogle,
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      isLoading: false,
      user: { isGuest: true },
    }),
    useData: () => null,
    useMutation: vi.fn(() => mutation),
    useQuery: vi.fn((name: string) => {
      if (name === 'cartSummary') {
        return {
          count: 1,
          items: [
            {
              id: 'item-1',
              itemKey: 'country-sourdough',
              label: 'Country Sourdough',
              price: '$9',
              quantity: 1,
            },
          ],
        }
      }
      if (name === 'productCatalog') {
        return [
          {
            id: 'product-1',
            itemKey: 'country-sourdough',
            label: 'Country Sourdough',
            price: '$9',
            subtitle: '36-hour ferment',
          },
        ]
      }
      if (name === 'commerceSearchState') {
        return { query: '', searches: [], selectedLabel: '' }
      }
      return null
    }),
  }

  return { lakebed, mutation, runMutation, signInWithGoogle }
})

vi.mock('@ship-fast/lakebed/react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/react')>()

  return {
    ...actual,
    createLakebedClient: vi.fn(() => runtime.lakebed),
  }
})

const { loadOpenUIRuntimeLibrary } = await import('../../../runtime-library.ts')

const SOURCE = `
  home_navbar = BakeryNavbar(
    "Batch House",
    ["Home", "Order"],
    "Order Online",
    "Order",
    "0",
    ""
  )
  home_heading = Heading("Home bakery")
  home = Stack([home_navbar, home_heading])
  order_heading = Heading("Order page")
  order = Stack([home_navbar, order_heading])
  root = PageSwitch(
    ["Home", "Order"],
    [home, order],
    "",
    {"Home":"Home","Order":"Order"}
  )
`

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: '',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  if (typeof globalThis.ResizeObserver === 'undefined') {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    })
  }
  if (typeof globalThis.PointerEvent === 'undefined') {
    Object.defineProperty(globalThis, 'PointerEvent', {
      configurable: true,
      value: MouseEvent,
    })
  }
})

afterEach(() => {
  cleanup()
  runtime.signInWithGoogle.mockClear()
  runtime.runMutation.mockClear()
})

const renderGeneratedNavbar = async () => {
  const library = await loadOpenUIRuntimeLibrary(SOURCE)
  render(React.createElement(Renderer, { library, response: SOURCE }))
  expect(await screen.findByText('Home bakery')).toBeTruthy()
}

describe('BakeryNavbar generated runtime behavior', () => {
  it('opens a product-search dialog through Renderer', async () => {
    await renderGeneratedNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(
      within(searchDialog).getByRole('textbox', { name: 'Search' }),
    ).toBeTruthy()
    expect(within(searchDialog).getByText('Search products')).toBeTruthy()
    expect(within(searchDialog).getByText('Country Sourdough')).toBeTruthy()
  })

  it('opens the live cart drawer through Renderer', async () => {
    await renderGeneratedNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDialog = await screen.findByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Country Sourdough')).toBeTruthy()
    expect(
      within(cartDialog).getByText('You have 1 item in your cart.'),
    ).toBeTruthy()
  })

  it('starts sign-in through Renderer', async () => {
    await renderGeneratedNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() =>
      expect(runtime.signInWithGoogle).toHaveBeenCalledTimes(1),
    )
  })

  it('routes the order CTA through PageSwitch', async () => {
    await renderGeneratedNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Order Online' }))
    expect(await screen.findByText('Order page')).toBeTruthy()
    expect(screen.queryByText('Home bakery')).toBeNull()
  })
})
