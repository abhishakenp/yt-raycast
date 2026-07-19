// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type {
  LakebedClientRuntime,
  LakebedMutationFunction,
} from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsHeader } from './AnalyticsHeader.tsx'
import { AnalyticsSidebar } from './AnalyticsSidebar.tsx'
import { analyticsAdminLakebed } from './analytics-admin-lakebed.ts'

type AnalyticsAdminLakebed = LakebedClientRuntime<typeof analyticsAdminLakebed>

type TestAction = {
  createdAt: string
  id: string
  label: string
  query: string
  source: string
  updatedAt: string
}

type TestNotification = {
  createdAt: string
  id: string
  message: string
  read: string
  type: string
  updatedAt: string
}

type MutationArgs<TMutation> = TMutation extends (
  ctx: infer _TCtx,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: infer _TArgs
) => infer TResult
  ? Awaited<TResult>
  : never

const timestamp = '2026-06-26T00:00:00.000Z'
const navigate = vi.fn()
const lakebedRef: { current: AnalyticsAdminLakebed | null } = {
  current: null,
}

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) {
        throw new Error('Missing analytics admin Lakebed client')
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

function createAnalyticsAdminLakebedStub() {
  let version = 0
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
    url: 'https://shoo.dev/auth',
  }))
  const signOut = vi.fn()
  let state: {
    actions: TestAction[]
    notifications: TestNotification[]
  } = {
    actions: [],
    notifications: [],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const syncNotifications = (notifications: readonly unknown[]) => {
    const nextNotifications = [...state.notifications]

    for (const notification of notifications) {
      const notif = notification as Record<string, unknown>
      const message = (notif.message as string).trim()
      if (!message) continue

      const existingIndex = nextNotifications.findIndex(
        (item) => item.message === message,
      )
      const nextNotification = {
        createdAt: timestamp,
        id:
          existingIndex >= 0
            ? nextNotifications[existingIndex].id
            : `notification-${nextNotifications.length + 1}`,
        message,
        read: (notif.read as string) ?? 'false',
        type: (notif.type as string) ?? 'info',
        updatedAt: timestamp,
      }

      if (existingIndex >= 0) {
        nextNotifications[existingIndex] = nextNotification
      } else {
        nextNotifications.push(nextNotification)
      }
    }

    state = { ...state, notifications: nextNotifications }
  }
  const recordAction = (input: Record<string, unknown>) => {
    state = {
      ...state,
      actions: [
        ...state.actions,
        {
          createdAt: timestamp,
          id: `action-${state.actions.length + 1}`,
          label: input.label as string,
          query: (input.query as string) ?? '',
          source: (input.source as string) ?? '',
          updatedAt: timestamp,
        },
      ],
    }
  }
  const markNotificationRead = (id: string) => {
    state = {
      ...state,
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: 'true', updatedAt: timestamp }
          : notification,
      ),
    }
  }
  const clearAllNotifications = () => {
    state = { ...state, notifications: [] }
  }
  const actionSummary = () => {
    const current = state.actions.at(-1) ?? null

    return {
      actions: state.actions,
      current,
      currentLabel: current?.label ?? '',
      currentQuery: current?.query ?? '',
      total: state.actions.length,
    }
  }
  const unreadNotificationCount = () =>
    state.notifications.filter((notification) => notification.read === 'false')
      .length

  const useQuery = createLakebedQueryStub<typeof analyticsAdminLakebed>({
    actionSummary: () => {
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
      return actionSummary()
    },
    notifications: () => {
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
      return state.notifications
    },
    unreadNotificationCount: () => {
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
      return unreadNotificationCount()
    },
  })

  const useMutation = createLakebedMutationStub<typeof analyticsAdminLakebed>({
    markNotificationRead: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof analyticsAdminLakebed.mutations.markNotificationRead
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            markNotificationRead(input.id as string)
            notify()
            return state.notifications
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    clearAllNotifications: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof analyticsAdminLakebed.mutations.clearAllNotifications
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            clearAllNotifications()
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    syncNotifications: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof analyticsAdminLakebed.mutations.syncNotifications
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            syncNotifications(input.notifications as readonly unknown[])
            notify()
            return state.notifications
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    recordAction: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof analyticsAdminLakebed.mutations.recordAction
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            recordAction(input)
            notify()
            return state.actions
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
  })

  const lakebed: AnalyticsAdminLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => ({
      displayName: 'Morgan Analyst',
      isAuthenticated: true,
      isGuest: false,
      provider: 'google',
      user: {
        displayName: 'Morgan Analyst',
        email: 'morgan@dataflow.dev',
        id: 'google:morgan',
        isGuest: false,
        provider: 'google',
        userId: 'google:morgan',
      },
      userId: 'google:morgan',
    }),
    useData: () => state,
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signOut,
    state: () => state,
  }
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('analytics admin fullstack behavior', () => {
  it('shares Shoo profile, notifications, mobile drawer, and header actions through Lakebed', async () => {
    const { lakebed, signOut, state } = createAnalyticsAdminLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <AnalyticsSidebar.component props={{}} />
        <AnalyticsHeader.component props={{}} />
      </>,
    )

    await waitFor(() => {
      expect(state().notifications).toHaveLength(3)
    })

    expect(screen.getByText('Morgan Analyst')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalledWith('Morgan Analyst')

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    const notificationsDialog = await screen.findByRole('dialog', {
      name: 'Notifications',
    })
    expect(
      within(notificationsDialog).getByText(
        'Weekly revenue report is ready to review',
      ),
    ).toBeTruthy()
    fireEvent.click(
      within(notificationsDialog).getAllByRole('button', {
        name: 'Mark read',
      })[0],
    )

    await waitFor(() => {
      expect(
        state().notifications.filter(
          (notification) => notification.read === 'false',
        ),
      ).toHaveLength(1)
    })

    fireEvent.click(
      within(notificationsDialog).getByRole('button', { name: 'Clear all' }),
    )
    await waitFor(() => {
      expect(state().notifications).toHaveLength(0)
    })
    fireEvent.click(
      within(notificationsDialog).getByRole('button', { name: 'Close' }),
    )

    const searchInput = screen.getByLabelText('Search analytics')
    fireEvent.change(searchInput, { target: { value: 'revenue' } })
    fireEvent.submit(screen.getByRole('search', { name: 'Analytics search' }))
    fireEvent.click(screen.getByRole('button', { name: 'Date filter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(state().actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: 'Search revenue',
            query: 'revenue',
            source: 'header-search',
          }),
          expect.objectContaining({
            label: 'Date filter',
            source: 'header',
          }),
          expect.objectContaining({
            label: 'Export',
            source: 'header',
          }),
        ]),
      )
    })
    expect(navigate).not.toHaveBeenCalledWith('Search analytics...')
    expect(navigate).not.toHaveBeenCalledWith('Date filter')
    expect(navigate).not.toHaveBeenCalledWith('Export')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    const menuDialog = await screen.findByRole('dialog', { name: 'DataFlow' })
    fireEvent.click(within(menuDialog).getByRole('button', { name: 'Reports' }))
    expect(navigate).toHaveBeenCalledWith('Reports')
  })
})
