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


type TestLakebed = ReturnType<
  typeof createSubscriptionBoxLakebedStub
>['lakebed']

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
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) => clearTimeout(id)

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
const { SubscriptionBoxHero } = await import('./SubscriptionBoxHero.tsx')
const { SubscriptionBoxNavbar } = await import('./SubscriptionBoxNavbar.tsx')
const { SubscriptionBoxPricing } = await import('./SubscriptionBoxPricing.tsx')

function createSubscriptionBoxLakebedStub() {
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
                    label: (input?.label as string) || 'Item',
                    price: input?.price as string | undefined,
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
              for (const product of (input?.products as TestProduct[] | undefined) ?? []) {
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
                query: (input?.query as string)?.trim() ?? '',
                selectedLabel: (input?.selectedLabel as string)?.trim() ?? '',
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
        const callable = Object.assign((input: Record<string, unknown>) => runMutation(input), {
          isPending: false,
          lastError: initialLastError,
          pendingCount: 0,
          reset,
        })
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

describe('Subscription-box fullstack commerce behavior', () => {
  it('shares plan catalog, Shoo account, add-to-cart, cart drawer, and mobile navigation state', async () => {
    const { lakebed, signInWithGoogle, state } =
      createSubscriptionBoxLakebedStub()
    lakebedRef.current = lakebed
    const Hero = SubscriptionBoxHero.client.component
    const Navbar = SubscriptionBoxNavbar.client.component
    const Pricing = SubscriptionBoxPricing.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'BoxJoy',
            cartCount: '0',
            nav: ['How it works', 'Boxes', 'Pricing'],
          }}
          statementId="subscription_navbar"
        />
        <Hero
          props={{
            addLabel: 'Add starter',
            featuredBoxName: 'Surprise Starter Box',
            featuredBoxPrice: '$29/mo',
            featuredBoxSubtitle: 'Hero curated box',
            primaryCta: 'Pricing',
            secondaryCta: 'How it works',
          }}
          statementId="subscription_hero"
        />
        <Pricing
          props={{
            tiers: [
              {
                cta: 'Start Classic',
                features: ['6 curated items', 'Free shipping'],
                highlighted: true,
                name: 'Classic',
                period: '/mo',
                price: '$39',
              },
              {
                cta: 'Start Deluxe',
                features: ['10 premium items', 'Priority shipping'],
                name: 'Deluxe',
                period: '/mo',
                price: '$69',
              },
            ],
          }}
          statementId="subscription_pricing"
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual(
        expect.arrayContaining([
          {
            imageAlt: 'curated subscription box unboxing products',
            label: 'Surprise Starter Box',
            price: '$29/mo',
            subtitle: 'Hero curated box',
          },
          {
            imageAlt: 'Classic subscription box plan',
            label: 'Classic box',
            price: '$39/mo',
            subtitle: 'Subscription plan',
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Surprise Starter Box')).toBeTruthy()
    expect(within(searchDialog).getByText('Classic box')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Classic box'))
    await waitFor(() => {
      expect(state().searchState).toEqual({
        query: 'Classic box',
        selectedLabel: 'Classic box',
      })
      expect(screen.getByText('Classic')).toBeTruthy()
      expect(screen.queryByText('Deluxe')).toBeNull()
    })
    expect(navigate).not.toHaveBeenCalledWith('Classic box')

    const pricingButtons = screen.getAllByRole('button', { name: 'Pricing' })
    fireEvent.click(pricingButtons[0])
    fireEvent.click(pricingButtons[1])
    const howItWorksButtons = screen.getAllByRole('button', {
      name: 'How it works',
    })
    fireEvent.click(howItWorksButtons[0])
    fireEvent.click(howItWorksButtons[1])
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
      expect(navigate).toHaveBeenCalledWith('How it works')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add starter Surprise Starter Box',
      }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Classic box to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual(
        expect.arrayContaining([
          {
            id: 'item-1',
            label: 'Surprise Starter Box',
            price: '$29/mo',
            quantity: 1,
          },
          {
            id: 'item-2',
            label: 'Classic box',
            price: '$39/mo',
            quantity: 1,
          },
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDrawer = await screen.findByRole('dialog')
    expect(within(cartDrawer).getByText('Your cart')).toBeTruthy()
    expect(within(cartDrawer).getByText('Surprise Starter Box')).toBeTruthy()
    expect(within(cartDrawer).getByText('Classic box')).toBeTruthy()
    expect(
      within(cartDrawer).getByText('You have 2 items in your cart.'),
    ).toBeTruthy()
    fireEvent.click(
      within(cartDrawer).getByRole('button', { name: 'Close cart' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuDrawer = await screen.findByRole('dialog')
    expect(within(menuDrawer).getByText('BoxJoy')).toBeTruthy()
    fireEvent.click(within(menuDrawer).getByRole('button', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })
})
