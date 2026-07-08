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

type TestLakebed = ReturnType<typeof createBarNightclubLakebedStub>['lakebed']

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
const { BarNightclubHero } = await import('./BarNightclubHero.tsx')
const { BarNightclubMenu } = await import('./BarNightclubMenu.tsx')
const { BarNightclubNavbar } = await import('./BarNightclubNavbar.tsx')

function createBarNightclubLakebedStub() {
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

describe('Bar/nightclub fullstack commerce behavior', () => {
  it('shares drinks catalog, Shoo account, add-to-cart, cart drawer, and mobile navigation state', async () => {
    const { lakebed, signInWithGoogle, state } = createBarNightclubLakebedStub()
    lakebedRef.current = lakebed
    const Hero = BarNightclubHero.client.component
    const Navbar = BarNightclubNavbar.client.component
    const Menu = BarNightclubMenu.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'NOIR',
            cartCount: '0',
            nav: ['Events', 'Menu', 'Gallery', 'Reservations'],
          }}
          statementId="bar_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add bottle service',
            featuredItemName: 'Noir Champagne Flight',
            featuredItemPrice: '$85',
            featuredItemSubtitle: 'VIP table feature',
            primaryCta: 'Reservations',
            secondaryCta: 'Menu',
          }}
          statementId="bar_hero"
        />
        <Menu
          props={{
            addLabel: 'Add',
            columns: [
              {
                items: [
                  {
                    description: 'Gin, St-Germain, berries, champagne float',
                    name: 'Midnight in Paris',
                    price: '$18',
                  },
                ],
                title: 'House Signatures',
              },
            ],
          }}
          statementId="bar_menu"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'Elegant bar interior with ambient lighting and bottles on shelves',
            label: 'Noir Champagne Flight',
            price: '$85',
            subtitle: 'VIP table feature',
          },
          {
            imageAlt: 'Midnight in Paris',
            label: 'Midnight in Paris',
            price: '$18',
            subtitle: 'House Signatures',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Noir Champagne Flight')).toBeTruthy()
    expect(within(searchDialog).getByText('Midnight in Paris')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Midnight in Paris'))
    expect(navigate).not.toHaveBeenCalledWith('Midnight in Paris')

    const reservationButtons = screen.getAllByRole('button', {
      name: 'Reservations',
    })
    fireEvent.click(reservationButtons[0])
    fireEvent.click(reservationButtons[1])
    const menuButtons = screen.getAllByRole('button', { name: 'Menu' })
    fireEvent.click(menuButtons[0])
    fireEvent.click(menuButtons[1])
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Reservations')
      expect(navigate).toHaveBeenCalledWith('Menu')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add bottle service Noir Champagne Flight',
      }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Midnight in Paris to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Noir Champagne Flight',
            price: '$85',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Midnight in Paris',
            price: '$18',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Noir Champagne Flight')).toBeTruthy()
    expect(within(cartDrawer).getByText('Midnight in Paris')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
    fireEvent.click(
      within(cartDrawer).getByRole('button', { name: 'Close cart' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuDrawer = await screen.findByRole('dialog')
    expect(within(menuDrawer).getByText('NOIR')).toBeTruthy()
    fireEvent.click(
      within(menuDrawer).getByRole('button', { name: 'Reservations' }),
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Reservations')
    })
  })
})
