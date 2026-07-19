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

type TestLakebed = ReturnType<typeof createFoodTruckLakebedStub>['lakebed']

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
  const requestAnimationFrame = (callback: (time: number) => void) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) =>
    clearTimeout(id)

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
const { FoodTruckHero } = await import('./FoodTruckHero.tsx')
const { FoodTruckMenu } = await import('./FoodTruckMenu.tsx')
const { FoodTruckNavbar } = await import('./FoodTruckNavbar.tsx')

function createFoodTruckLakebedStub() {
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
  const findItem = (input: Record<string, unknown>) =>
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
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
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
        async (input: Record<string, unknown>) => {
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
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: Record<string, unknown>) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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

describe('Food-truck fullstack commerce behavior', () => {
  it('shares menu catalog, Shoo account, add-to-cart, cart drawer, and mobile navigation state', async () => {
    const { lakebed, signInWithGoogle, state } = createFoodTruckLakebedStub()
    lakebedRef.current = lakebed
    const Hero = FoodTruckHero.client.component
    const Navbar = FoodTruckNavbar.client.component
    const Menu = FoodTruckMenu.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Curb Club',
            cartCount: '0',
            nav: ['Menu', 'Locations', 'Catering'],
          }}
          statementId="food_truck_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add special',
            featuredItemName: 'Smash Burger Special',
            featuredItemPrice: '$15',
            featuredItemSubtitle: 'Lunch rush favorite',
            primaryCta: 'Menu',
            secondaryCta: 'Locations',
          }}
          statementId="food_truck_hero"
        />
        <Menu
          props={{
            addLabel: 'Add',
            categories: [
              {
                imageAlt: 'Korean short rib tacos on corn tortillas',
                items: [
                  {
                    description: 'Braised galbi, kimchi slaw, gochujang crema',
                    name: 'Korean Short Rib',
                    price: '$14',
                  },
                ],
                title: 'Signature Tacos',
              },
            ],
          }}
          statementId="food_truck_menu"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'Gourmet tacos being prepared on a food truck griddle with fresh ingredients',
            label: 'Smash Burger Special',
            price: '$15',
            subtitle: 'Lunch rush favorite',
          },
          {
            imageAlt: 'Korean Short Rib',
            label: 'Korean Short Rib',
            price: '$14',
            subtitle: 'Signature Tacos',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Smash Burger Special')).toBeTruthy()
    expect(within(searchDialog).getByText('Korean Short Rib')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Korean Short Rib'))
    expect(navigate).not.toHaveBeenCalledWith('Korean Short Rib')

    const menuButtons = screen.getAllByRole('button', { name: 'Menu' })
    fireEvent.click(menuButtons[0])
    fireEvent.click(menuButtons[1])
    const locationButtons = screen.getAllByRole('button', { name: 'Locations' })
    fireEvent.click(locationButtons[0])
    fireEvent.click(locationButtons[1])

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Menu')
      expect(navigate).toHaveBeenCalledWith('Locations')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add special Smash Burger Special',
      }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Korean Short Rib to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Smash Burger Special',
            price: '$15',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Korean Short Rib',
            price: '$14',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Smash Burger Special')).toBeTruthy()
    expect(within(cartDrawer).getByText('Korean Short Rib')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
    fireEvent.click(
      within(cartDrawer).getByRole('button', { name: 'Close cart' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuDrawer = await screen.findByRole('dialog')
    expect(within(menuDrawer).getByText('Curb Club')).toBeTruthy()
    fireEvent.click(
      within(menuDrawer).getByRole('button', { name: 'Catering' }),
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Catering')
    })
  })
})
