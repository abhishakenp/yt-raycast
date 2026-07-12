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
  query?: string
  selectedLabel?: string
}

type TestLakebed = ReturnType<typeof createCommerceLakebedStub>['lakebed']

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
  const defineGlobal = (name, value) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }
  const requestAnimationFrame = (callback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id) => clearTimeout(id)

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
  defineGlobal('PointerEvent', dom.window.PointerEvent ?? dom.window.MouseEvent)
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
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
const { EcommerceHero } = await import('./EcommerceHero.tsx')
const { EcommerceNavbar } = await import('./EcommerceNavbar.tsx')
const { EcommerceGallery } = await import('./EcommerceGallery.tsx')

function createCommerceLakebedStub() {
  let version = 0
  let state: {
    items: TestCartItem[]
    products: TestProduct[]
    searchState: {
      query: string
      selectedLabel: string
    }
  } = {
    items: [],
    products: [],
    searchState: {
      query: '',
      selectedLabel: '',
    },
  }
  const listeners = new Set<() => void>()
  const signInWithGoogle = vi.fn(async () => undefined)
  const signOut = vi.fn()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const findItem = (input) =>
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
    useQuery: (name) => {
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
        return {
          query: state.searchState.query,
          searches: [],
          selectedLabel: state.searchState.selectedLabel,
        }
      }
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      const runMutation = useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'syncCatalog') {
              for (const product of input?.products ?? []) {
                const existingIndex = state.products.findIndex(
                  (item) => item.label === product.label,
                )
                if (existingIndex >= 0) {
                  state = {
                    ...state,
                    products: state.products.map((item, index) =>
                      index === existingIndex ? product : item,
                    ),
                  }
                } else {
                  state = {
                    ...state,
                    products: [product, ...state.products],
                  }
                }
              }
            }

            if (name === 'addItem') {
              const label = input?.label ?? 'Item'
              const existing = findItem({ label })
              state = {
                ...state,
                items: existing
                  ? state.items.map((item) =>
                      item.label === label
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                    )
                  : [
                      ...state.items,
                      {
                        id: `item-${state.items.length + 1}`,
                        label,
                        price: input?.price,
                        quantity: 1,
                      },
                    ],
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
              state = {
                ...state,
                items: state.items.filter((item) => item.id !== input?.id),
              }
            }

            if (name === 'clearCart') {
              state = { ...state, items: [] }
            }

            if (name === 'setCommerceSearch') {
              state = {
                ...state,
                searchState: {
                  query: String(input?.query ?? '').trim(),
                  selectedLabel: String(input?.selectedLabel ?? '').trim(),
                },
              }
            }

            notify()
            return state
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
      const mutation = useMemo(() => {
        const callable = Object.assign((input) => runMutation(input), {
          isPending: false,
          lastError: initialLastError,
          pendingCount: 0,
          reset,
        })
        callable.isPending = false
        callable.lastError = null
        callable.pendingCount = 0
        callable.reset = reset
        return callable
      }, [reset, runMutation])

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

describe('EcommerceNavbar fullstack commerce behavior', () => {
  it('uses gallery catalog and cart data through search, account, and cart controls', async () => {
    const { lakebed, signInWithGoogle, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Hero = EcommerceHero.client.component
    const Navbar = EcommerceNavbar.client.component
    const Gallery = EcommerceGallery.client.component

    render(
      <>
        <Navbar
          props={{ brand: 'Market', nav: ['Shop', 'Deals'], cartCount: '0' }}
          statementId="ecommerce_navbar"
        />
        <Gallery
          props={{
            addToCartLabel: 'Add to cart',
            products: [
              {
                imageAlt: 'Matte black headphones',
                name: 'Wireless Headphones',
                price: '$129',
              },
            ],
          }}
          statementId="ecommerce_gallery"
        />
        <Hero
          props={{
            addLabel: 'Add deal',
            featuredProductName: 'Portable Speaker',
            featuredProductPrice: '$79',
            featuredProductSubtitle: 'Hero deal',
            primaryCta: 'Shop',
            secondaryCta: 'Deals',
          }}
          statementId="ecommerce_hero"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt: 'Matte black headphones',
            label: 'Wireless Headphones',
            price: '$129',
            subtitle: '',
          },
          {
            imageAlt:
              'Modern retail product flat-lay featuring a stylish gadget, accessories, and packaging on a clean neutral background',
            label: 'Portable Speaker',
            price: '$79',
            subtitle: 'Hero deal',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Portable Speaker')).toBeTruthy()
    expect(within(searchDialog).getByText('Wireless Headphones')).toBeTruthy()

    fireEvent.click(within(searchDialog).getByText('Wireless Headphones'))
    await waitFor(() => {
      expect(state().searchState).toEqual({
        query: 'Wireless Headphones',
        selectedLabel: 'Wireless Headphones',
      })
    })
    expect(navigate).not.toHaveBeenCalledWith('Wireless Headphones')

    const shopButtons = screen.getAllByRole('button', { name: 'Shop' })
    fireEvent.click(shopButtons[0])
    fireEvent.click(shopButtons[1])
    const dealButtons = screen.getAllByRole('button', { name: 'Deals' })
    fireEvent.click(dealButtons[0])
    fireEvent.click(dealButtons[1])
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Shop')
      expect(navigate).toHaveBeenCalledWith('Deals')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add deal Portable Speaker' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Portable Speaker',
            price: '$79',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Wireless Headphones',
            price: '$129',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDialog = screen.getByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Portable Speaker')).toBeTruthy()
    expect(within(cartDialog).getByText('Wireless Headphones')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalledWith('Cart')
  })
})
