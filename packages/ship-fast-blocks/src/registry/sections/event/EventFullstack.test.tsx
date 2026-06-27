// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EventCta } from './EventCta.tsx'
import { EventHero } from './EventHero.tsx'
import { EventNavbar } from './EventNavbar.tsx'
import { EventTickets } from './EventTickets.tsx'
import type { EventLakebed } from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'
import type { EventActionInput, EventTicketInput } from './event-lakebed.ts'

type TestAction = {
  action: string
  createdAt: string
  id: string
  label: string
  source: string
  tier: string
  updatedAt: string
}

type TestTicket = {
  availability: string
  createdAt: string
  cta: string
  id: string
  name: string
  price: string
  unit: string
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
const lakebedRef: { current: EventLakebed | null } = { current: null }

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
        throw new Error('Missing event Lakebed client')
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

function createEventLakebedStub() {
  let version = 0
  let state: {
    actions: TestAction[]
    tickets: TestTicket[]
  } = {
    actions: [],
    tickets: [],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const syncTickets = (tickets: EventTicketInput[]) => {
    const nextTickets = [...state.tickets]

    for (const ticket of tickets) {
      const name = ticket.name.trim()
      if (!name) continue

      const existingIndex = nextTickets.findIndex((item) => item.name === name)
      const nextTicket = {
        availability: ticket.availability ?? '',
        createdAt: timestamp,
        cta: ticket.cta ?? '',
        id:
          existingIndex >= 0
            ? nextTickets[existingIndex].id
            : `ticket-${nextTickets.length + 1}`,
        name,
        price: ticket.price ?? '',
        unit: ticket.unit ?? '',
        updatedAt: timestamp,
      }

      if (existingIndex >= 0) {
        nextTickets[existingIndex] = nextTicket
      } else {
        nextTickets.push(nextTicket)
      }
    }

    state = { ...state, tickets: nextTickets }
  }
  const recordEventAction = (input: EventActionInput) => {
    state = {
      ...state,
      actions: [
        ...state.actions,
        {
          action: input.action ?? 'register',
          createdAt: timestamp,
          id: `action-${state.actions.length + 1}`,
          label: input.label,
          source: input.source ?? '',
          tier: input.tier ?? '',
          updatedAt: timestamp,
        },
      ],
    }
  }
  const registrationSummary = () => {
    const current = state.actions.at(-1) ?? null

    return {
      actions: state.actions,
      current,
      currentLabel: current?.label ?? '',
      currentTier: current?.tier ?? '',
      total: state.actions.length,
    }
  }

  const lakebed = {
    signInWithGoogle: async () => ({
      bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
      url: 'https://shoo.dev/auth',
    }),
    signOut: () => {},
    useAuth: () => ({
      isAuthenticated: false,
      user: { displayName: 'Guest', email: '', isGuest: true },
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

      if (name === 'registrationSummary') return registrationSummary()
      if (name === 'ticketCatalog') return state.tickets
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])

      if (name === 'syncTickets') {
        return useTestMutation<typeof eventLakebed.mutations.syncTickets>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              syncTickets(input.tickets)
              notify()
              return state.tickets
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          }, []),
        })
      }

      return useTestMutation<typeof eventLakebed.mutations.recordEventAction>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            recordEventAction(input)
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
  } satisfies EventLakebed

  return {
    lakebed,
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

describe('event fullstack behavior', () => {
  it('shares tickets, registration actions, mail links, and mobile drawer navigation through Lakebed', async () => {
    const { lakebed, state } = createEventLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <EventNavbar.component
          lakebed={lakebed}
          props={{
            brand: 'FrontConf',
            ctaLabel: 'Get Tickets',
            nav: ['Agenda', 'Speakers', 'Venue', 'Tickets'],
          }}
        />
        <EventHero.component
          lakebed={lakebed}
          props={{
            primaryCta: 'Register Now',
            secondaryCta: 'View Full Agenda',
          }}
        />
        <EventTickets.component
          lakebed={lakebed}
          props={{
            tiers: [
              {
                availability: 'Open now',
                cta: 'Get Ticket',
                features: ['All sessions'],
                name: 'Regular',
                price: '$649',
                unit: '/person',
              },
              {
                availability: 'Limited',
                cta: 'Get VIP Pass',
                features: ['Workshop seat'],
                name: 'VIP',
                price: '$899',
                unit: '/person',
              },
            ],
          }}
        />
        <EventCta.component
          lakebed={lakebed}
          props={{
            email: 'team@frontconf.dev',
            primaryCta: 'Get Your Ticket',
            secondaryCta: 'Download Brochure',
          }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().tickets.map((ticket) => ticket.name)).toEqual([
        'Regular',
        'VIP',
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get Tickets' }))
    fireEvent.click(screen.getByRole('button', { name: 'Register Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Get Ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Get VIP Pass' }))
    fireEvent.click(screen.getByRole('button', { name: 'Get Your Ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Download Brochure' }))
    fireEvent.click(screen.getByRole('button', { name: 'Contact us' }))

    await waitFor(() => {
      expect(state().actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'ticket',
            label: 'Get Tickets',
            source: 'navbar',
            tier: 'Tickets',
          }),
          expect.objectContaining({
            action: 'register',
            label: 'Register Now',
            source: 'hero',
          }),
          expect.objectContaining({
            action: 'ticket',
            label: 'Get Ticket',
            source: 'tickets',
            tier: 'Regular',
          }),
          expect.objectContaining({
            action: 'ticket',
            label: 'Get VIP Pass',
            source: 'tickets',
            tier: 'VIP',
          }),
          expect.objectContaining({
            action: 'ticket',
            label: 'Get Your Ticket',
            source: 'cta',
          }),
          expect.objectContaining({
            action: 'download',
            label: 'Download Brochure',
            source: 'cta',
          }),
          expect.objectContaining({
            action: 'contact',
            label: 'Contact us',
            source: 'tickets-note',
          }),
        ]),
      )
    })
    expect(navigate).not.toHaveBeenCalledWith('Get Ticket')
    expect(navigate).not.toHaveBeenCalledWith('Download Brochure')

    fireEvent.click(screen.getByRole('button', { name: 'View Full Agenda' }))
    expect(navigate).toHaveBeenCalledWith('View Full Agenda')

    const emailLink = screen.getByRole('link', { name: 'team@frontconf.dev' })
    expect(emailLink.getAttribute('href')).toBe('mailto:team@frontconf.dev')

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = await screen.findByRole('dialog', { name: 'FrontConf' })
    fireEvent.click(within(menu).getByRole('button', { name: 'Speakers' }))
    expect(navigate).toHaveBeenCalledWith('Speakers')
  })
})
