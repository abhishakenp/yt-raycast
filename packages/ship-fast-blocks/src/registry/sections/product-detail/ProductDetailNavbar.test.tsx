// @vitest-environment jsdom

import type { ComponentType } from 'react'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TestCartItem = {
  id: string
  label: string
  price?: string
  quantity: number
}

type TestLakebed = {
  useAuth: () => {
    isAuthenticated: boolean
    user: { displayName: string; email: string; isGuest: boolean }
  }
  useMutation: (name: string) => {
    (input?: any): Promise<unknown>
    isPending: boolean
    lastError: unknown | null
    pendingCount: number
    reset: () => void
  }
  useQuery: (name: string) => unknown
}

const navigate = vi.fn()
const lakebedRef = { current: null as TestLakebed | null }

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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { ProductDetailNavbar } = await import('./ProductDetailNavbar.tsx')

function createCommerceLakebedStub() {
  let version = 0
  let state = {
    items: [] as TestCartItem[],
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

  const lakebed: TestLakebed = {
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
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'addItem') {
              const label = (input?.label as string) || 'Item'
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
                        price: input?.price as string | undefined,
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
        const callable = ((input: Record<string, unknown>) => runMutation(input)) as ReturnType<
          TestLakebed['useMutation']
        >
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

  return { lakebed, state: () => state }
}

function CartCountProbe({ lakebed }: { lakebed: TestLakebed }) {
  const summary = lakebed.useQuery('cartSummary') as { count: number } | null
  return <output aria-label="Cart count">{summary?.count ?? 0}</output>
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('ProductDetailNavbar commerce behavior', () => {
  it('adds the navbar product CTA to cart and opens the shared cart drawer', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Component = ProductDetailNavbar.client.component as ComponentType<any>

    render(
      <>
        <Component
          props={{
            nav: ['Overview', 'Features'],
            productPrice: '$299',
            productTitle: 'Aurora Pro Headphones',
          }}
          statementId="product_detail_navbar"
        />
        <CartCountProbe lakebed={lakebed} />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Cart count').textContent).toBe('1')
    })
    expect(state().items).toEqual([
      {
        id: 'item-1',
        label: 'Aurora Pro Headphones',
        price: '$299',
        quantity: 1,
      },
    ])
    expect(navigate).not.toHaveBeenCalledWith('Add to Cart')

    fireEvent.click(screen.getByRole('button', { name: 'Features' }))
    expect(navigate).toHaveBeenCalledWith('Features')

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Your cart')).toBeTruthy()
    expect(screen.getByText('Aurora Pro Headphones')).toBeTruthy()
  })

  it('uses an in-flow sticky header and closes the shared mobile drawer after navigation', async () => {
    const { lakebed } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Component = ProductDetailNavbar.client.component as ComponentType<any>

    render(
      <Component
        props={{ nav: ['Overview', 'Features'] }}
        statementId="product_detail_navbar"
      />,
    )

    const header = screen.getByRole('banner')
    expect(header.classList.contains('sticky')).toBe(true)
    expect(header.classList.contains('fixed')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()

    const featureButtons = screen.getAllByRole('button', { name: 'Features' })
    const mobileFeatureButton = featureButtons.at(-1)
    if (!mobileFeatureButton) throw new Error('Expected mobile feature button')
    fireEvent.click(mobileFeatureButton)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Features')
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
