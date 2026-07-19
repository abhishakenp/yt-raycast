// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  autoDealershipLakebed,
  type AutoVehicleInput,
} from './auto-dealership-lakebed.ts'
import type { AutoDealershipLakebed } from './auto-dealership-interactions.tsx'

type TestVehicle = {
  badge: string
  createdAt: string
  id: string
  imageAlt: string
  name: string
  price: string
  specs: string
  updatedAt: string
}

type TestLead = {
  action: string
  createdAt: string
  id: string
  label: string
  source: string
  updatedAt: string
  vehicle: string
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
const lakebedRef: { current: AutoDealershipLakebed | null } = { current: null }

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) {
        throw new Error('Missing auto dealership Lakebed client')
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
const { AutoDealershipFinancing } =
  await import('./AutoDealershipFinancing.tsx')
const { AutoDealershipHero } = await import('./AutoDealershipHero.tsx')
const { AutoDealershipInventory } =
  await import('./AutoDealershipInventory.tsx')
const { AutoDealershipNavbar } = await import('./AutoDealershipNavbar.tsx')

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

function createAutoDealershipLakebedStub() {
  let version = 0
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  }))
  const signOut = vi.fn()
  let state: {
    leads: TestLead[]
    vehicles: TestVehicle[]
  } = {
    leads: [],
    vehicles: [],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const leadSummary = () => {
    const current = state.leads.at(-1) ?? null

    return {
      count: state.leads.length,
      current,
      currentLabel: current?.label ?? '',
      currentVehicle: current?.vehicle ?? '',
      leads: state.leads,
    }
  }
  const syncVehicles = (vehicles: readonly AutoVehicleInput[]) => {
    const nextVehicles = [...state.vehicles]

    for (const vehicle of vehicles) {
      const name = vehicle.name.trim()
      if (!name) continue

      const existingIndex = nextVehicles.findIndex((item) => item.name === name)
      const nextVehicle = {
        badge: vehicle.badge ?? '',
        createdAt: timestamp,
        id:
          existingIndex >= 0
            ? nextVehicles[existingIndex].id
            : `vehicle-${nextVehicles.length + 1}`,
        imageAlt: vehicle.imageAlt ?? '',
        name,
        price: vehicle.price ?? '',
        specs: vehicle.specs ?? '',
        updatedAt: timestamp,
      }

      if (existingIndex >= 0) {
        nextVehicles[existingIndex] = nextVehicle
      } else {
        nextVehicles.push(nextVehicle)
      }
    }

    state = { ...state, vehicles: nextVehicles }
  }
  const recordLead = (input: Record<string, unknown>) => {
    state = {
      ...state,
      leads: [
        ...state.leads,
        {
          action: String(input.action ?? 'lead'),
          createdAt: timestamp,
          id: `lead-${state.leads.length + 1}`,
          label: String(input.label ?? ''),
          source: String(input.source ?? ''),
          updatedAt: timestamp,
          vehicle: String(input.vehicle ?? ''),
        },
      ],
    }
  }

  const useQuery = createLakebedQueryStub<typeof autoDealershipLakebed>({
    leadSummary: () => {
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
      return leadSummary()
    },
    vehicleCatalog: () => {
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
      return state.vehicles
    },
  })

  const useMutation = createLakebedMutationStub<typeof autoDealershipLakebed>({
    syncVehicles: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof autoDealershipLakebed.mutations.syncVehicles
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            syncVehicles(input.vehicles)
            notify()
            return state.vehicles
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    recordLead: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof autoDealershipLakebed.mutations.recordLead>(
        {
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              recordLead(input)
              notify()
              return state.leads
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          }, []),
        },
      )
    },
  })

  const lakebed: AutoDealershipLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => ({
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest',
      userId: 'guest:local',
      user: {
        displayName: 'Guest',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
    }),
    useData: () => state,
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signInWithGoogle,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('auto dealership fullstack behavior', () => {
  it('shares inventory search, Shoo profile, mobile nav, and lead actions through Lakebed', async () => {
    const { lakebed, signInWithGoogle, state } =
      createAutoDealershipLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <AutoDealershipNavbar.component
          props={{
            brand: 'Meridian Test',
            cta: 'Book Drive',
            nav: ['Inventory', 'Financing'],
            phone: '(555) 010-0101',
          }}
        />
        <AutoDealershipHero.component
          props={{
            primaryCta: 'Browse Cars',
            secondaryCta: 'Schedule Test Drive',
          }}
        />
        <AutoDealershipInventory.component
          props={{
            items: [
              {
                badge: 'Electric',
                electric: true,
                features: ['DreamDrive', '520 mi Range'],
                imageAlt: 'Lucid Air Touring electric sedan',
                name: '2026 Lucid Air Touring',
                price: '$79,995',
                specs: '2,000 miles · AWD · Electric',
              },
            ],
            viewAll: 'See All Cars',
          }}
        />
        <AutoDealershipFinancing.component
          props={{ cta: 'Apply for Financing' }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().vehicles.map((vehicle) => vehicle.name)).toEqual([
        '2026 Lucid Air Touring',
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search vehicles' }))
    const searchDialog = await screen.findByRole('dialog', {
      name: 'Search vehicles',
    })
    fireEvent.click(within(searchDialog).getByText('2026 Lucid Air Touring'))

    await waitFor(() => {
      expect(state().leads.at(-1)).toMatchObject({
        action: 'search',
        label: 'Selected 2026 Lucid Air Touring',
        source: 'search',
        vehicle: '2026 Lucid Air Touring',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Browse Cars' }))
    expect(navigate).toHaveBeenCalledWith('Browse Cars')

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Test Drive' }))
    fireEvent.click(screen.getByRole('button', { name: 'View Details →' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply for Financing' }))
    fireEvent.click(screen.getByRole('button', { name: '(555) 010-0101' }))

    await waitFor(() => {
      expect(state().leads).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'test_drive',
            label: 'Schedule Test Drive',
            source: 'hero',
          }),
          expect.objectContaining({
            action: 'vehicle_interest',
            label: 'View Details',
            source: 'inventory',
            vehicle: '2026 Lucid Air Touring',
          }),
          expect.objectContaining({
            action: 'financing',
            label: 'Apply for Financing',
            source: 'financing',
          }),
          expect.objectContaining({
            action: 'call',
            label: '(555) 010-0101',
            source: 'navbar',
          }),
        ]),
      )
    })

    expect(navigate).not.toHaveBeenCalledWith('Schedule Test Drive')
    expect(navigate).not.toHaveBeenCalledWith('View Details')
    expect(navigate).not.toHaveBeenCalledWith('Apply for Financing')
    expect(navigate).not.toHaveBeenCalledWith('(555) 010-0101')

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = await screen.findByRole('dialog', { name: 'Meridian Test' })
    fireEvent.click(within(menu).getByRole('button', { name: 'Financing' }))
    expect(navigate).toHaveBeenCalledWith('Financing')
  })
})
