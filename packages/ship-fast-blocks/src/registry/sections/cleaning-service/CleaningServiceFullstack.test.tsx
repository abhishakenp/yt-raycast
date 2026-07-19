// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { guestAuthContext } from '@ship-fast/lakebed/server'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LocalServiceLakebed } from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

type TestService = {
  createdAt: string
  id: string
  name: string
  price: string
  summary: string
  updatedAt: string
}

type TestBooking = {
  createdAt: string
  id: string
  label: string
  service: string
  source: string
  type: string
  updatedAt: string
}

type TestServiceInput = {
  name: string
  price?: string
  summary?: string
}

type TestBookingInput = {
  label: string
  service?: string
  source?: string
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
const lakebedRef: { current: LocalServiceLakebed | null } = { current: null }

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
        throw new Error('Missing cleaning-service Lakebed client')
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

const { cleanup, fireEvent, render, screen, waitFor } = await import(
  '@testing-library/react'
)
const { CleaningServiceNavbar } = await import('./CleaningServiceNavbar.tsx')
const { CleaningServiceServices } = await import(
  './CleaningServiceServices.tsx'
)
const { CleaningServicePricing } = await import('./CleaningServicePricing.tsx')
const { CleaningServiceHero } = await import('./CleaningServiceHero.tsx')
const { CleaningServiceContactCta } = await import(
  './CleaningServiceContactCta.tsx'
)

function testService(service: TestServiceInput, index: number): TestService {
  return {
    createdAt: timestamp,
    id: `service-${index + 1}`,
    name: service.name,
    price: service.price ?? '',
    summary: service.summary ?? '',
    updatedAt: timestamp,
  }
}

function publicService({
  name,
  price,
  summary,
}: TestService): TestServiceInput {
  return {
    name,
    price,
    summary,
  }
}

function publicBooking({
  label,
  service,
  source,
  type,
}: TestBooking): TestBookingInput & { type: string } {
  return {
    label,
    service,
    source,
    type,
  }
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

function createDeferred() {
  let resolve = () => {}
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

function createCleaningServiceLakebedStub({
  mutationDelay,
}: {
  mutationDelay?: Partial<
    Record<keyof typeof localServiceLakebed.mutations, () => Promise<unknown>>
  >
} = {}) {
  let version = 0
  const initialBookings: TestBooking[] = []
  const initialServices: TestService[] = []
  let state = {
    bookings: initialBookings,
    services: initialServices,
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
  const summary = () => {
    const current = state.bookings.at(-1) ?? null
    return {
      bookings: state.bookings,
      current,
      currentLabel: current?.label ?? '',
      currentService: current?.service ?? '',
      total: state.bookings.length,
    }
  }
  const recordBooking = (input: Record<string, unknown>) => {
    state = {
      ...state,
      bookings: [
        ...state.bookings,
        {
          createdAt: timestamp,
          id: `booking-${state.bookings.length + 1}`,
          label: String(input.label ?? ''),
          service: String(input.service ?? input.label ?? ''),
          source: String(input.source ?? ''),
          type: 'booking',
          updatedAt: timestamp,
        },
      ],
    }
  }
  const syncServices = (services: readonly Record<string, unknown>[]) => {
    const nextServices = [...state.services]

    services.forEach((service) => {
      const existingIndex = nextServices.findIndex(
        (item) => item.name === service.name,
      )
      const nextService = testService(
        service as TestServiceInput,
        existingIndex >= 0 ? existingIndex : nextServices.length,
      )

      if (existingIndex >= 0) {
        nextServices[existingIndex] = nextService
      } else {
        nextServices.push(nextService)
      }
    })

    state = {
      ...state,
      services: nextServices,
    }
  }

  const useQuery = createLakebedQueryStub<typeof localServiceLakebed>({
    serviceCatalog: () => {
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
      return state.services
    },
    bookingSummary: () => {
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
      return summary()
    },
  })

  const useMutation = createLakebedMutationStub<typeof localServiceLakebed>({
    syncServices: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof localServiceLakebed.mutations.syncServices>(
        {
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(
            async (input) => {
              setPendingCount((count) => count + 1)
              setLastError(null)
              try {
                await mutationDelay?.syncServices?.()
                syncServices(input.services)
                notify()
                return state.services
              } catch (error) {
                setLastError(error)
                throw error
              } finally {
                setPendingCount((count) => Math.max(0, count - 1))
              }
            },
            [mutationDelay],
          ),
        },
      )
    },
    requestBooking: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof localServiceLakebed.mutations.requestBooking
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.requestBooking?.()
              recordBooking(input)
              notify()
              return state.bookings
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          },
          [mutationDelay],
        ),
      })
    },
  })

  const lakebed: LocalServiceLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => guestAuthContext,
    useData: () => state,
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signInWithGoogle,
    state: () => ({
      bookings: state.bookings.map(publicBooking),
      services: state.services.map(publicService),
    }),
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
  document.body.removeAttribute('style')
})

const cleaningServices = [
  {
    description: 'Kitchen, bathroom, floors, and dusting for recurring visits.',
    price: 'From $129',
    title: 'Standard Cleaning',
  },
  {
    description: 'Baseboards, appliances, fixtures, and detailed scrubbing.',
    price: 'From $249',
    title: 'Deep Cleaning',
  },
]

const cleaningPlans = [
  {
    blurb: 'Best for apartments',
    cta: 'Book This Plan',
    features: ['2 hours', '1 bathroom'],
    name: 'Studio / 1 Bedroom',
    period: '/visit',
    price: '$129',
  },
  {
    badge: 'Most Popular',
    blurb: 'Best for families',
    cta: 'Book This Plan',
    featured: true,
    features: ['4 hours', '2 bathrooms'],
    name: '2-3 Bedroom Home',
    period: '/visit',
    price: '$189',
  },
]

describe('CleaningService fullstack behavior', () => {
  it('shares service catalog with command search, Shoo account, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } =
      createCleaningServiceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <CleaningServiceNavbar.component
          props={{ brand: 'PureSpace', nav: ['Services', 'Pricing'] }}
        />
        <CleaningServiceServices.component
          props={{ items: cleaningServices }}
        />
        <CleaningServicePricing.component props={{ plans: cleaningPlans }} />
      </>,
    )

    await waitFor(() => {
      expect(state().services.map((service) => service.name)).toContain(
        'Standard Cleaning',
      )
      expect(state().services.map((service) => service.name)).toContain(
        '2-3 Bedroom Home',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search services' }))
    const standardMatches = await screen.findAllByText('Standard Cleaning')
    const commandMatch = standardMatches[standardMatches.length - 1]
    if (!commandMatch) throw new Error('Missing Standard Cleaning command item')
    fireEvent.click(commandMatch)

    await waitFor(() => {
      expect(state().bookings.at(-1)).toMatchObject({
        service: 'Standard Cleaning',
        source: 'search',
      })
    })
    expect(navigate).toHaveBeenCalledWith('Standard Cleaning')
    expect(screen.getAllByText('Standard Cleaning').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Pricing' }))
    expect(navigate).toHaveBeenCalledWith('Pricing')
  })

  it('keeps cleaning booking loading scoped to the clicked action', async () => {
    const booking = createDeferred()
    const { lakebed } = createCleaningServiceLakebedStub({
      mutationDelay: {
        requestBooking: () => booking.promise,
      },
    })
    lakebedRef.current = lakebed

    render(
      <>
        <CleaningServiceHero.component props={{}} />
        <CleaningServiceServices.component
          props={{ items: cleaningServices }}
        />
        <CleaningServicePricing.component props={{ plans: cleaningPlans }} />
        <CleaningServiceContactCta.component props={{}} />
      </>,
    )

    const standardButton = screen.getByRole('button', {
      name: /Standard Cleaning/,
    })
    const deepButton = screen.getByRole('button', {
      name: /Deep Cleaning/,
    })
    const heroButton = screen.getByRole('button', {
      name: 'Book Your Cleaning',
    })
    const finalButton = screen.getByRole('button', {
      name: 'Book Your Cleaning Now',
    })

    fireEvent.click(standardButton)

    await waitFor(() => {
      expect(standardButton.getAttribute('aria-busy')).toBe('true')
      expect(deepButton.getAttribute('aria-busy')).toBe('false')
      expect(heroButton.getAttribute('aria-busy')).toBe('false')
      expect(finalButton.getAttribute('aria-busy')).toBe('false')
    })

    booking.resolve()

    await waitFor(() => {
      expect(standardButton.getAttribute('aria-busy')).toBe('false')
    })
  })
})
