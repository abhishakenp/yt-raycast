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

type TestLakebed = ReturnType<typeof createBakeryLakebedStub>['lakebed']

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
const { BakeryHero } = await import('./BakeryHero.tsx')
const { BakeryMenu } = await import('./BakeryMenu.tsx')
const { BakeryNavbar } = await import('./BakeryNavbar.tsx')

function createBakeryLakebedStub() {
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
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input?: TestMutationInput) => runMutation(input),
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

describe('Bakery fullstack commerce behavior', () => {
  it('shares menu catalog, account, add-to-cart, and cart drawer state', async () => {
    const { lakebed, signInWithGoogle, state } = createBakeryLakebedStub()
    lakebedRef.current = lakebed
    const Hero = BakeryHero.client.component
    const Navbar = BakeryNavbar.client.component
    const Menu = BakeryMenu.client.component

    render(
      <>
        <Navbar
          props={{ brand: 'Batch House', cartCount: '0' }}
          statementId="bakery_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add bake',
            featuredItemName: 'Apricot Danish',
            featuredItemPrice: '$5',
            featuredItemSubtitle: 'Morning pastry · seasonal fruit',
            primaryTarget: 'Order',
            secondaryTarget: 'Visit',
          }}
          statementId="bakery_hero"
        />
        <Menu
          props={{
            addLabel: 'Add',
            breads: [
              {
                description: 'Organic wheat, 36-hour ferment',
                name: 'Country Sourdough',
                price: '$9',
              },
            ],
            cakes: [],
            pastries: [],
          }}
          statementId="bakery_menu"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'Golden crusty artisan sourdough bread loaves arranged on a wooden cutting board in a sunlit bakery',
            label: 'Apricot Danish',
            price: '$5',
            subtitle: 'Morning pastry · seasonal fruit',
          },
          {
            imageAlt: 'Country Sourdough',
            label: 'Country Sourdough',
            price: '$9',
            subtitle: 'Artisan Breads',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Apricot Danish')).toBeTruthy()
    expect(within(searchDialog).getByText('Country Sourdough')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Country Sourdough'))
    expect(navigate).not.toHaveBeenCalledWith('Country Sourdough')

    fireEvent.click(screen.getByRole('button', { name: 'Order for Pickup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Visit Our Bakery' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Order')
      expect(navigate).toHaveBeenCalledWith('Visit')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add bake Apricot Danish' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Country Sourdough to cart' }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Apricot Danish',
            price: '$5',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Country Sourdough',
            price: '$9',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Apricot Danish')).toBeTruthy()
    expect(within(cartDrawer).getByText('Country Sourdough')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
  })
})
