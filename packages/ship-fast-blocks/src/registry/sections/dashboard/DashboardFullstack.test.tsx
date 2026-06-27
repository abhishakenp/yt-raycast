// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from './DashboardHeader.tsx'
import { DashboardKpis } from './DashboardKpis.tsx'
import { DashboardOrdersTable } from './DashboardOrdersTable.tsx'
import { DashboardSidebar } from './DashboardSidebar.tsx'
import { dashboardLakebed } from './dashboard-lakebed.ts'
import type { DashboardOrderInput } from './dashboard-lakebed.ts'

type DashboardLakebed = NonNullable<
  Parameters<typeof DashboardHeader.component>[0]['lakebed']
>

type TestOrder = {
  amount: string
  createdAt: string
  customer: string
  date: string
  id: string
  orderId: string
  product: string
  status: string
  statusTone: string
  updatedAt: string
}

type MutationArgs<TMutation> = TMutation extends (
  ctx: unknown,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: ReadonlyArray<unknown>
) => infer TResult
  ? Awaited<TResult>
  : never

const timestamp = '2026-06-26T00:00:00.000Z'
const navigate = vi.fn()
const lakebedRef: { current: DashboardLakebed | null } = { current: null }

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
      if (!lakebedRef.current) {
        throw new Error('Missing dashboard Lakebed client')
      }
      return lakebedRef.current
    }),
  }
})

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

function useTestMutation<TMutation>({
  lastError,
  pendingCount,
  reset,
  runMutation,
}: {
  lastError: unknown | null
  pendingCount: number
  reset(): void
  runMutation(
    ...args: MutationArgs<TMutation>
  ): Promise<MutationResult<TMutation>>
}): LakebedMutationFunction<TMutation> {
  const emptyLastError: unknown | null = null
  const mutation = useMemo(
    () =>
      Object.assign(
        (...args: MutationArgs<TMutation>) => runMutation(...args),
        {
          isPending: false,
          lastError: emptyLastError,
          pendingCount: 0,
          reset,
        },
      ),
    [reset, runMutation],
  )

  mutation.isPending = pendingCount > 0
  mutation.lastError = lastError
  mutation.pendingCount = pendingCount
  mutation.reset = reset

  return mutation
}

function createDashboardLakebedStub() {
  let version = 0
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
    url: 'https://shoo.dev/auth',
  }))
  const signOut = vi.fn()
  let state: { orders: TestOrder[] } = { orders: [] }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const addOrder = (input: DashboardOrderInput) => {
    state = {
      orders: [
        ...state.orders,
        {
          amount: input.amount ?? '$0.00',
          createdAt: timestamp,
          customer: input.customer ?? 'New Customer',
          date: input.date ?? '',
          id: `order-${state.orders.length + 1}`,
          orderId: input.orderId ?? `#${state.orders.length + 1}`,
          product: input.product ?? 'Manual order',
          status: input.status ?? 'Processing',
          statusTone: input.statusTone ?? 'sky',
          updatedAt: timestamp,
        },
      ],
    }
  }
  const setOrderStatus = (input: {
    id: string
    status: string
    statusTone: string
  }) => {
    state = {
      orders: state.orders.map((order) =>
        order.id === input.id
          ? {
              ...order,
              status: input.status,
              statusTone: input.statusTone,
              updatedAt: timestamp,
            }
          : order,
      ),
    }
  }
  const removeOrder = (input: { id: string }) => {
    state = {
      orders: state.orders.filter((order) => order.id !== input.id),
    }
  }

  const lakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => ({
      isAuthenticated: true,
      user: {
        displayName: 'Taylor Admin',
        email: 'taylor@orbit.dev',
        isGuest: false,
      },
    }),
    useData: () => state,
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

      if (name === 'orders') return state.orders
      if (name === 'orderSummary') {
        const current = state.orders.at(-1) ?? null
        return {
          count: state.orders.length,
          current,
          currentOrderId: current?.orderId ?? '',
        }
      }
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])

      if (name === 'setOrderStatus') {
        return useTestMutation<
          typeof dashboardLakebed.mutations.setOrderStatus
        >({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              setOrderStatus(input)
              notify()
              return state.orders
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          }, []),
        })
      }

      if (name === 'removeOrder') {
        return useTestMutation<typeof dashboardLakebed.mutations.removeOrder>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              removeOrder(input)
              notify()
              return state.orders
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          }, []),
        })
      }

      return useTestMutation<typeof dashboardLakebed.mutations.addOrder>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            addOrder(input)
            notify()
            return state.orders
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
  } satisfies DashboardLakebed

  return {
    lakebed,
    signOut,
    state: () => state,
  }
}

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('dashboard fullstack behavior', () => {
  it('shares Shoo auth and live orders across sidebar, header, and table capsules', async () => {
    const { lakebed, signOut, state } = createDashboardLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <DashboardSidebar.component lakebed={lakebed} props={{}} />
        <DashboardHeader.component lakebed={lakebed} props={{}} />
        <DashboardKpis.component lakebed={lakebed} props={{}} />
        <DashboardOrdersTable.component lakebed={lakebed} props={{}} />
      </>,
    )

    expect(screen.getByText('Taylor Admin')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Orders 0' })).toBeTruthy()
    expect(screen.getByLabelText('Orders: 0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalledWith('Logout')

    fireEvent.click(screen.getByRole('button', { name: '+ New Order' }))

    await waitFor(() => {
      expect(state().orders).toHaveLength(1)
    })
    expect(screen.getByText('New Customer')).toBeTruthy()
    expect(screen.getByText('Manual order')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Orders 1' })).toBeTruthy()
    expect(screen.getByLabelText('Orders: 1')).toBeTruthy()
    expect(screen.getByText('Showing 1 live order')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalledWith('New Order')

    fireEvent.click(
      screen.getByRole('button', {
        name: `Actions for ${state().orders[0].orderId}`,
      }),
    )

    await waitFor(() => {
      expect(state().orders[0].status).toBe('Completed')
    })
    expect(screen.getByText('Completed')).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Export' })[0])
    expect(navigate).toHaveBeenCalledWith('Export')
  })
})
