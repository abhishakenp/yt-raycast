// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TestCartItem = {
  id: string
  label: string
  price?: string
  quantity: number
}

type TestProduct = {
  id?: string
  imageAlt?: string
  label: string
  price?: string
  subtitle?: string
}

type TestMutationInput = {
  id?: string
  label?: string
  price?: string
  products?: TestProduct[]
}

type TestLakebed = ReturnType<typeof createWineryBreweryLakebedStub>['lakebed']

const navigate = vi.fn()
const lakebedRef: { current: TestLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
      return lakebedRef.current
    }),
  }
})

if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })
  const defineGlobal = (name: string, value: unknown) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }
  const requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: number) => clearTimeout(id)

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
  defineGlobal('NodeFilter', dom.window.NodeFilter)
  defineGlobal('PointerEvent', dom.window.PointerEvent ?? dom.window.MouseEvent)
  defineGlobal(
    'ResizeObserver',
    dom.window.ResizeObserver ??
      class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
  )
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
  Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

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

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { WineryBreweryHero } = await import('./WineryBreweryHero.tsx')
const { WineryBreweryMenu } = await import('./WineryBreweryMenu.tsx')
const { WineryBreweryNavbar } = await import('./WineryBreweryNavbar.tsx')

function createWineryBreweryLakebedStub() {
  let version = 0
  const state: { items: TestCartItem[]; products: TestProduct[] } = {
    items: [],
    products: [],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const findItem = (input: { id?: string; label?: string }) =>
    state.items.find(
      (item) =>
        (input.id && item.id === input.id) ||
        (input.label && item.label === input.label),
    )
  const summary = () => ({
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    items: state.items,
  })

  const lakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      user: { displayName: 'Guest', email: '', isGuest: true },
    }),
    useData: () => ({
      items: state.items,
      products: state.products,
    }),
    useQuery: (name: string) => {
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        () => version,
        () => version,
      )

      if (name === 'cartSummary') return summary()
      if (name === 'productCatalog') return state.products
      return null
    },
    useMutation: (name: string) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input?: TestMutationInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            if (name === 'addItem') {
              const existing = findItem(input ?? {})
              if (existing) {
                existing.quantity += 1
              } else {
                state.items = [
                  ...state.items,
                  {
                    id: `item-${state.items.length + 1}`,
                    label: input?.label ?? 'Item',
                    price: input?.price,
                    quantity: 1,
                  },
                ]
              }
            }

            if (name === 'incrementItem') {
              const item = findItem(input ?? {})
              if (item) item.quantity += 1
            }

            if (name === 'decrementItem') {
              const item = findItem(input ?? {})
              if (item && item.quantity > 1) item.quantity -= 1
            }

            if (name === 'deleteItem') {
              state.items = state.items.filter((item) => item.id !== input?.id)
            }

            if (name === 'clearCart') {
              state.items = []
            }

            if (name === 'syncCatalog') {
              for (const product of input?.products ?? []) {
                const existingIndex = state.products.findIndex(
                  (item) => item.label === product.label,
                )
                if (existingIndex >= 0) {
                  state.products = state.products.map((item, index) =>
                    index === existingIndex ? product : item,
                  )
                } else {
                  state.products = [product, ...state.products]
                }
              }
            }

            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name],
      )
      const mutation = useMemo(() => {
        const callable = Object.assign(
          (input?: TestMutationInput) => runMutation(input),
          {
            isPending: false,
            lastError: null,
            pendingCount: 0,
            reset,
          },
        )
        return callable
      }, [reset, runMutation])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return {
    lakebed,
    signInWithGoogle: lakebed.signInWithGoogle,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('Winery/brewery fullstack commerce behavior', () => {
  it('shares tasting catalog, Shoo account, add-to-cart, cart drawer, and mobile navigation state', async () => {
    const { lakebed, signInWithGoogle, state } =
      createWineryBreweryLakebedStub()
    lakebedRef.current = lakebed
    const Hero = WineryBreweryHero.client.component
    const Navbar = WineryBreweryNavbar.client.component
    const Menu = WineryBreweryMenu.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Cask Room',
            cartCount: '0',
            nav: ['Wines', 'Visit', 'Events'],
            phone: '(707) 555-0148',
          }}
          statementId="winery_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add flight',
            featuredItemName: 'Reserve Tasting Flight',
            featuredItemPrice: '$32',
            featuredItemSubtitle: 'Hero cellar experience',
            primaryTarget: 'Visit',
            secondaryTarget: 'Wines',
          }}
          statementId="winery_hero"
        />
        <Menu
          props={{
            addLabel: 'Add',
            categories: [
              {
                items: [
                  {
                    name: 'Old-Vine Zinfandel',
                    notes: 'Blackberry and cracked pepper',
                    price: '$14',
                    tag: 'Estate',
                  },
                ],
                name: 'Reds',
              },
            ],
          }}
          statementId="winery_menu"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'rolling hillside vineyard rows glowing at golden hour with an old stone winery and oak barrels in the foreground',
            label: 'Reserve Tasting Flight',
            price: '$32',
            subtitle: 'Hero cellar experience',
          },
          {
            imageAlt: 'Old-Vine Zinfandel',
            label: 'Old-Vine Zinfandel',
            price: '$14',
            subtitle: 'Reds · Estate',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(
      within(searchDialog).getByText('Reserve Tasting Flight'),
    ).toBeTruthy()
    expect(within(searchDialog).getByText('Old-Vine Zinfandel')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Old-Vine Zinfandel'))
    expect(navigate).not.toHaveBeenCalledWith('Old-Vine Zinfandel')

    fireEvent.click(screen.getByRole('button', { name: 'Visit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Visit Us' }))
    fireEvent.click(screen.getByRole('button', { name: 'Our Wines' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Visit')
      expect(navigate).toHaveBeenCalledWith('Wines')
    })

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add flight Reserve Tasting Flight',
      }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Old-Vine Zinfandel to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Reserve Tasting Flight',
            price: '$32',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Old-Vine Zinfandel',
            price: '$14',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Reserve Tasting Flight')).toBeTruthy()
    expect(within(cartDrawer).getByText('Old-Vine Zinfandel')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
    fireEvent.click(
      within(cartDrawer).getByRole('button', { name: 'Close cart' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuDrawer = await screen.findByRole('dialog')
    expect(within(menuDrawer).getByText('Cask Room')).toBeTruthy()
    fireEvent.click(within(menuDrawer).getByRole('button', { name: 'Events' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Events')
    })
  })
})
