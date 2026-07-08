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
  query?: string
  selectedLabel?: string
}

type TestLakebed = ReturnType<typeof createIllustratorLakebedStub>['lakebed']

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
const { IllustratorHero } = await import('./IllustratorHero.tsx')
const { IllustratorNavbar } = await import('./IllustratorNavbar.tsx')
const { IllustratorShop } = await import('./IllustratorShop.tsx')

function createIllustratorLakebedStub() {
  let version = 0
  const state: {
    items: TestCartItem[]
    products: TestProduct[]
    searchState: { query: string; selectedLabel: string }
  } = {
    items: [],
    products: [],
    searchState: { query: '', selectedLabel: '' },
  }
  const listeners = new Set<() => void>()
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  }))
  const signOut = vi.fn()
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
    signInWithGoogle,
    signOut,
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
      if (name === 'commerceSearchState') {
        return { ...state.searchState, searches: [] }
      }
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

            if (name === 'setCommerceSearch') {
              state.searchState = {
                query: input?.query?.trim() ?? '',
                selectedLabel: input?.selectedLabel?.trim() ?? '',
              }
            }

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
      const initialLastError: unknown | null = null
      const mutation = useMemo(
        () =>
          Object.assign((input?: TestMutationInput) => runMutation(input), {
            isPending: false,
            lastError: initialLastError,
            pendingCount: 0,
            reset,
          }),
        [reset, runMutation],
      )

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return { lakebed, signInWithGoogle, state: () => state }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('Illustrator fullstack commerce behavior', () => {
  it('shares print catalog, Shoo account, add-to-cart, cart drawer, and mobile navigation state', async () => {
    const { lakebed, signInWithGoogle, state } = createIllustratorLakebedStub()
    lakebedRef.current = lakebed
    const Hero = IllustratorHero.client.component
    const Navbar = IllustratorNavbar.client.component
    const Shop = IllustratorShop.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Mira Studio',
            cartCount: '0',
            nav: ['Work', 'Shop', 'About'],
          }}
          statementId="illustrator_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add feature',
            featuredPrintName: 'Moonlit Garden',
            featuredPrintPrice: '$42',
            featuredPrintMeta: 'Hero print',
            primaryCta: 'Work',
            secondaryCta: 'Shop',
          }}
          statementId="illustrator_hero"
        />
        <Shop
          props={{
            addToCart: 'Add print',
            items: [
              {
                meta: 'Giclee print',
                price: '$48',
                title: 'Golden Hour Mountains',
              },
              {
                meta: 'Card set',
                price: '$24',
                title: 'Seasonal Card Set',
              },
            ],
          }}
          statementId="illustrator_shop"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'Artist studio workspace with watercolor paintings, brushes, and colorful illustration drafts spread across a wooden desk near a sunny window',
            label: 'Moonlit Garden',
            price: '$42',
            subtitle: 'Hero print',
          },
          {
            imageAlt: 'Golden Hour Mountains',
            label: 'Golden Hour Mountains',
            price: '$48',
            subtitle: 'Giclee print',
          },
        ]),
      )
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Search' })[0])
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Moonlit Garden')).toBeTruthy()
    expect(within(searchDialog).getByText('Golden Hour Mountains')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Golden Hour Mountains'))
    await waitFor(() => {
      expect(state().searchState).toEqual({
        query: 'Golden Hour Mountains',
        selectedLabel: 'Golden Hour Mountains',
      })
      expect(screen.getByText('Golden Hour Mountains')).toBeTruthy()
      expect(screen.queryByText('Seasonal Card Set')).toBeNull()
    })
    expect(navigate).not.toHaveBeenCalledWith('Golden Hour Mountains')

    const workButtons = screen.getAllByRole('button', { name: 'Work' })
    fireEvent.click(workButtons[0])
    fireEvent.click(workButtons[1])
    const shopButtons = screen.getAllByRole('button', { name: 'Shop' })
    fireEvent.click(shopButtons[0])
    fireEvent.click(shopButtons[1])
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Work')
      expect(navigate).toHaveBeenCalledWith('Shop')
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Sign in' })[0])
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add feature Moonlit Garden' }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add print Golden Hour Mountains',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Moonlit Garden',
            price: '$42',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Golden Hour Mountains',
            price: '$48',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Cart' })[0])
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Moonlit Garden')).toBeTruthy()
    expect(within(cartDrawer).getByText('Golden Hour Mountains')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
    fireEvent.click(
      within(cartDrawer).getByRole('button', { name: 'Close cart' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuDrawer = await screen.findByRole('dialog')
    expect(within(menuDrawer).getByText('Mira Studio')).toBeTruthy()
    fireEvent.click(within(menuDrawer).getByRole('button', { name: 'About' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('About')
    })
  })
})
