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
const { MarketplaceHero } = await import('./MarketplaceHero.tsx')
const { MarketplaceNavbar } = await import('./MarketplaceNavbar.tsx')
const { EcommerceGallery } = await import('../ecommerce/EcommerceGallery.tsx')

function createCommerceLakebedStub() {
  let version = 0
  let state: { items: TestCartItem[]; products: TestProduct[] } = {
    items: [],
    products: [],
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
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        return Object.assign((input) => runMutation(input), {
          isPending: false,
          lastError: initialLastError,
          pendingCount: 0,
          reset,
        })
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

describe('MarketplaceNavbar fullstack commerce behavior', () => {
  it('shares catalog, auth, and cart state with generated product capsules', async () => {
    const { lakebed, signInWithGoogle, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Hero = MarketplaceHero.client.component
    const Navbar = MarketplaceNavbar.client.component
    const Gallery = EcommerceGallery.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Maker Market',
            nav: ['Categories', 'Sellers'],
            cartCount: '0',
            ctaLabel: 'Sell on Maker Market',
          }}
          statementId="marketplace_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add featured',
            featuredProductName: 'Curated Maker Set',
            featuredProductPrice: '$58',
            featuredProductSubtitle: 'Hero seller pick',
            primaryCta: 'Categories',
            secondaryCta: 'Sell on Maker Market',
          }}
          statementId="marketplace_hero"
        />
        <Gallery
          props={{
            addToCartLabel: 'Add to cart',
            products: [
              {
                imageAlt: 'Handmade ceramic planter',
                name: 'Ceramic Planter',
                price: '$42',
              },
            ],
          }}
          statementId="marketplace_gallery"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt:
              'Modern minimalist watch with leather strap on white surface',
            label: 'Curated Maker Set',
            price: '$58',
            subtitle: 'Hero seller pick',
          },
          {
            imageAlt: 'Handmade ceramic planter',
            label: 'Ceramic Planter',
            price: '$42',
            subtitle: '',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Curated Maker Set')).toBeTruthy()
    expect(within(searchDialog).getByText('Ceramic Planter')).toBeTruthy()

    fireEvent.click(within(searchDialog).getByText('Ceramic Planter'))
    expect(navigate).not.toHaveBeenCalledWith('Ceramic Planter')

    const categoryButtons = screen.getAllByRole('button', {
      name: 'Categories',
    })
    fireEvent.click(categoryButtons[0])
    fireEvent.click(categoryButtons[1])
    const sellButtons = screen.getAllByRole('button', {
      name: 'Sell on Maker Market',
    })
    fireEvent.click(sellButtons[0])
    fireEvent.click(sellButtons[1])
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Categories')
      expect(navigate).toHaveBeenCalledWith('Sell')
      expect(navigate).toHaveBeenCalledWith('Sell on Maker Market')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add featured Curated Maker Set' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Curated Maker Set',
            price: '$58',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Ceramic Planter',
            price: '$42',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDialog = screen.getByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Curated Maker Set')).toBeTruthy()
    expect(within(cartDialog).getByText('Ceramic Planter')).toBeTruthy()

    expect(navigate).not.toHaveBeenCalledWith('Cart')
  })
})
