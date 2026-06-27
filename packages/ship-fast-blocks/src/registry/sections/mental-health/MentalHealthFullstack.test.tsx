// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { guestAuthContext } from '@ship-fast/lakebed/server'
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
        throw new Error('Missing mental-health Lakebed client')
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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { MentalHealthNavbar } = await import('./MentalHealthNavbar.tsx')
const { MentalHealthHero } = await import('./MentalHealthHero.tsx')
const { MentalHealthServices } = await import('./MentalHealthServices.tsx')
const { MentalHealthPricing } = await import('./MentalHealthPricing.tsx')
const { MentalHealthContactCta } = await import('./MentalHealthContactCta.tsx')

const toService = (service: TestServiceInput, index: number): TestService => ({
  createdAt: timestamp,
  id: `service-${index + 1}`,
  name: service.name,
  price: service.price ?? '',
  summary: service.summary ?? '',
  updatedAt: timestamp,
})

const toPublicService = ({
  name,
  price,
  summary,
}: TestService): TestServiceInput => ({ name, price, summary })

const toPublicBooking = ({
  label,
  service,
  source,
  type,
}: TestBooking): TestBookingInput & { type: string } => ({
  label,
  service,
  source,
  type,
})

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

function createMentalHealthLakebedStub({
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
  const bookingSummary = () => {
    const current = state.bookings.at(-1) ?? null
    return {
      bookings: state.bookings,
      current,
      currentLabel: current?.label ?? '',
      currentService: current?.service ?? '',
      total: state.bookings.length,
    }
  }
  const recordBooking = (input: TestBookingInput) => {
    state = {
      ...state,
      bookings: [
        ...state.bookings,
        {
          createdAt: timestamp,
          id: `booking-${state.bookings.length + 1}`,
          label: input.label,
          service: input.service ?? input.label,
          source: input.source ?? '',
          type: 'booking',
          updatedAt: timestamp,
        },
      ],
    }
  }
  const syncServices = (services: TestServiceInput[]) => {
    const nextServices = [...state.services]

    services.forEach((service) => {
      const existingIndex = nextServices.findIndex(
        (item) => item.name === service.name,
      )
      const nextService = toService(
        service,
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

  const lakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => guestAuthContext,
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

      if (name === 'serviceCatalog') return state.services
      if (name === 'bookingSummary') return bookingSummary()
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])

      if (name === 'syncServices') {
        return useTestMutation<
          typeof localServiceLakebed.mutations.syncServices
        >({
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
        })
      }

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
  } satisfies LocalServiceLakebed

  return {
    lakebed,
    signInWithGoogle,
    state: () => ({
      bookings: state.bookings.map(toPublicBooking),
      services: state.services.map(toPublicService),
    }),
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
  document.body.removeAttribute('style')
})

const therapyServices = [
  {
    description: 'One-on-one CBT, mindfulness, and psychodynamic support.',
    points: ['50-minute sessions', 'Weekly or bi-weekly'],
    title: 'Individual Therapy',
  },
  {
    description: 'Gottman-informed support for communication and trust.',
    points: ['80-minute sessions', 'All relationship types welcome'],
    title: 'Couples Therapy',
  },
]

const therapyTiers = [
  {
    cadence: '50-minute session',
    cta: 'Book Individual',
    features: ['Licensed therapist', 'Insurance billing included'],
    name: 'Individual Therapy',
    price: '$175',
    unit: '/session',
  },
  {
    cadence: '80-minute session',
    cta: 'Book Couples',
    features: ['Gottman-trained therapist', 'Relationship tools'],
    name: 'Couples Therapy',
    popular: true,
    price: '$250',
    unit: '/session',
  },
]

describe('MentalHealth fullstack behavior', () => {
  it('shares therapy services and tiers with command search, Shoo account, and mobile drawer navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createMentalHealthLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <MentalHealthNavbar.component
          props={{ brand: 'Stillpoint', nav: ['Services', 'Pricing'] }}
          lakebed={lakebed}
        />
        <MentalHealthServices.component
          props={{ items: therapyServices }}
          lakebed={lakebed}
        />
        <MentalHealthPricing.component
          props={{ tiers: therapyTiers }}
          lakebed={lakebed}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().services.map((service) => service.name)).toContain(
        'Individual Therapy',
      )
      expect(state().services.map((service) => service.name)).toContain(
        'Couples Therapy',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search services' }))
    const therapyMatches = await screen.findAllByText('Individual Therapy')
    const commandMatch = therapyMatches[therapyMatches.length - 1]
    if (!commandMatch)
      throw new Error('Missing Individual Therapy command item')
    fireEvent.click(commandMatch)

    await waitFor(() => {
      expect(state().bookings.at(-1)).toMatchObject({
        service: 'Individual Therapy',
        source: 'search',
      })
    })
    expect(navigate).toHaveBeenCalledWith('Individual Therapy')

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Pricing' }))
    expect(navigate).toHaveBeenCalledWith('Pricing')
  })

  it('keeps therapy booking loading scoped to the clicked action', async () => {
    const booking = createDeferred()
    const { lakebed } = createMentalHealthLakebedStub({
      mutationDelay: {
        requestBooking: () => booking.promise,
      },
    })
    lakebedRef.current = lakebed

    render(
      <>
        <MentalHealthHero.component props={{}} lakebed={lakebed} />
        <MentalHealthServices.component
          props={{ items: therapyServices }}
          lakebed={lakebed}
        />
        <MentalHealthPricing.component
          props={{ tiers: therapyTiers }}
          lakebed={lakebed}
        />
        <MentalHealthContactCta.component props={{}} lakebed={lakebed} />
      </>,
    )

    const individualCard = screen.getByRole('button', {
      name: /Individual Therapy/,
    })
    const couplesCard = screen.getByRole('button', {
      name: /Couples Therapy/,
    })
    const heroButton = screen.getByRole('button', {
      name: /Schedule a Session/,
    })
    const finalButton = screen.getByRole('button', {
      name: /Book Online Now/,
    })

    fireEvent.click(individualCard)

    await waitFor(() => {
      expect(individualCard.getAttribute('aria-busy')).toBe('true')
      expect(couplesCard.getAttribute('aria-busy')).toBe('false')
      expect(heroButton.getAttribute('aria-busy')).toBe('false')
      expect(finalButton.getAttribute('aria-busy')).toBe('false')
    })

    booking.resolve()

    await waitFor(() => {
      expect(individualCard.getAttribute('aria-busy')).toBe('false')
    })
  })
})
