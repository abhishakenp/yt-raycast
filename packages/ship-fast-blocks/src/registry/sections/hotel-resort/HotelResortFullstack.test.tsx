// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotelResortBooking } from './HotelResortBooking.tsx'
import { HotelResortCta } from './HotelResortCta.tsx'
import { HotelResortHero } from './HotelResortHero.tsx'
import { HotelResortNavbar } from './HotelResortNavbar.tsx'
import { HotelResortRooms } from './HotelResortRooms.tsx'
import {
  HotelAccountButton,
  HotelBookingActionButton,
  HotelBookingBadge,
  HotelMobileMenu,
  HotelMutationSpinner,
  HotelSearchButton,
  hotelRoom,
  useHotelAvailabilitySubmission,
  useSyncHotelRooms,
} from './hotel-resort-interactions.tsx'
import type { HotelResortLakebed } from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

type TestRoom = {
  createdAt: string
  description: string
  id: string
  meta: string
  name: string
  price: string
  updatedAt: string
}

type TestIntent = {
  action: string
  createdAt: string
  fieldsJson: string
  id: string
  label: string
  room: string
  source: string
  updatedAt: string
}

type MutationArgs<TMutation> = TMutation extends (
  ctx: unknown,
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
const lakebedRef: { current: HotelResortLakebed | null } = { current: null }

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
        throw new Error('Missing hotel resort Lakebed client')
      }
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
  const cancelAnimationFrame = (id: string) => clearTimeout(id)

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('FormData', dom.window.FormData)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLFormElement', dom.window.HTMLFormElement)
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

if (typeof window !== 'undefined') {
  const defineWindowGlobal = (name: string, value: string) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }

  defineWindowGlobal('CustomEvent', window.CustomEvent)
  defineWindowGlobal('Event', window.Event)
  defineWindowGlobal('FocusEvent', window.FocusEvent)
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
  let complete = () => {}
  const promise = new Promise<void>((resolve) => {
    complete = resolve
  })

  return { complete, promise }
}

function createHotelLakebedStub({
  requestBookingDelay,
}: {
  requestBookingDelay?: () => Promise<unknown>
} = {}) {
  let version = 0
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  }))
  const signOut = vi.fn()
  const initialIntents: TestIntent[] = []
  const initialRooms: TestRoom[] = []
  let state = {
    intents: initialIntents,
    rooms: initialRooms,
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const bookingSummary = () => {
    const current = state.intents.at(-1) ?? null

    return {
      count: state.intents.length,
      current,
      currentLabel: current?.label ?? '',
      currentRoom: current?.room ?? '',
      intents: state.intents,
    }
  }
  const syncRooms = (input: Record<string, unknown>) => {
    state = {
      ...state,
      rooms: (input.rooms as Record<string, unknown>[]).map(
        (room: Record<string, unknown>, index: number) => ({
          createdAt: timestamp,
          description: room.description ?? '',
          id: `room-${index + 1}`,
          meta: room.meta ?? '',
          name: room.name,
          price: room.price ?? '',
          updatedAt: timestamp,
        }),
      ),
    }
  }
  const recordBooking = (input: Record<string, unknown>) => {
    state = {
      ...state,
      intents: [
        ...state.intents,
        {
          action: String(input.action ?? 'booking'),
          createdAt: timestamp,
          fieldsJson: JSON.stringify(input.fields ?? {}),
          id: `intent-${state.intents.length + 1}`,
          label: String(input.label ?? ''),
          room: String(input.room ?? ''),
          source: String(input.source ?? ''),
          updatedAt: timestamp,
        },
      ],
    }
  }

  const useQuery = createLakebedQueryStub<typeof hotelResortLakebed>({
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
      return bookingSummary()
    },
    roomCatalog: () => {
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
      return state.rooms
    },
  })

  const useMutation = createLakebedMutationStub<typeof hotelResortLakebed>({
    syncRooms: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof hotelResortLakebed.mutations.syncRooms>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            syncRooms(input)
            notify()
            return state.rooms
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    requestBooking: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof hotelResortLakebed.mutations.requestBooking
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await requestBookingDelay?.()
              recordBooking(input)
              notify()
              return state.intents
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          },
          [requestBookingDelay],
        ),
      })
    },
  })

  const lakebed: HotelResortLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest',
      userId: 'guest:local',
      displayName: 'Guest',
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
      bookingIntents: state.intents,
      rooms: state.rooms,
    }),
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signInWithGoogle,
    state: () => ({
      intents: state.intents,
      rooms: state.rooms,
    }),
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('hotel resort fullstack interactions', () => {
  it('shares room search, account auth, mobile nav, availability, and scoped booking actions', async () => {
    const deferred = createDeferred()
    const { lakebed, signInWithGoogle, state } = createHotelLakebedStub({
      requestBookingDelay: () => deferred.promise,
    })

    function HotelProbe() {
      useSyncHotelRooms(lakebed, [
        hotelRoom({
          description: 'Ocean view suite',
          meta: '650 sq ft',
          name: 'Coastal Suite',
          price: '$685',
        }),
        hotelRoom({
          description: 'Private pool villa',
          meta: '2 bedrooms',
          name: 'Coastal Villa',
          price: '$2,400',
        }),
      ])
      const availability = useHotelAvailabilitySubmission({
        lakebed,
        source: 'test-form',
      })

      return (
        <div>
          <HotelBookingBadge lakebed={lakebed} />
          <HotelSearchButton
            lakebed={lakebed}
            buttonClassName="search-button"
          />
          <HotelAccountButton lakebed={lakebed} />
          <HotelMobileMenu
            brand="Azure Coast"
            ctaLabel="Book Now"
            ctaTarget="Check Availability"
            lakebed={lakebed}
            nav={['Rooms', 'Dining']}
          />
          <HotelBookingActionButton
            lakebed={lakebed}
            intentLabel="Book Suite"
            intentKey="first-action"
            source="test"
            pendingChildren={
              <>
                <HotelMutationSpinner />
                Sending first
              </>
            }
          >
            Book Suite
          </HotelBookingActionButton>
          <HotelBookingActionButton
            lakebed={lakebed}
            intentLabel="Ask Concierge"
            intentKey="second-action"
            source="test"
          >
            Ask Concierge
          </HotelBookingActionButton>
          <form aria-label="availability" onSubmit={availability.submitForm}>
            <input aria-label="Check-in" name="checkIn" />
            <input aria-label="Check-out" name="checkOut" />
            <select aria-label="Room Type" name="roomType">
              <option>Coastal Suite</option>
              <option>Coastal Villa</option>
            </select>
            <button type="submit">Submit dates</button>
          </form>
        </div>
      )
    }

    render(<HotelProbe />)

    await waitFor(() => {
      expect(state().rooms.map((room) => room.name)).toEqual([
        'Coastal Suite',
        'Coastal Villa',
      ])
    })

    expect(screen.getByLabelText('Search rooms')).toBeTruthy()

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
    expect(signInWithGoogle).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Open menu')).toBeTruthy()

    const secondDeferred = createDeferred()
    const delayed = createHotelLakebedStub({
      requestBookingDelay: () => secondDeferred.promise,
    })

    function ScopedProbe() {
      return (
        <div>
          <HotelBookingActionButton
            lakebed={delayed.lakebed}
            intentLabel="Book Suite"
            intentKey="first-action"
            source="test"
            pendingChildren="Sending first"
          >
            Book Suite
          </HotelBookingActionButton>
          <HotelBookingActionButton
            lakebed={delayed.lakebed}
            intentLabel="Ask Concierge"
            intentKey="second-action"
            source="test"
          >
            Ask Concierge
          </HotelBookingActionButton>
        </div>
      )
    }

    cleanup()
    render(<ScopedProbe />)
    fireEvent.click(screen.getByText('Book Suite'))
    expect(await screen.findByText('Sending first')).toBeTruthy()
    expect(screen.getByText('Ask Concierge')).toBeTruthy()
    secondDeferred.complete()
    await waitFor(() => {
      expect(delayed.state().intents).toHaveLength(1)
    })

    cleanup()
    const availabilityLakebed = createHotelLakebedStub()

    function AvailabilityProbe() {
      const availability = useHotelAvailabilitySubmission({
        lakebed: availabilityLakebed.lakebed,
        source: 'availability-test',
      })

      return (
        <form aria-label="availability" onSubmit={availability.submitForm}>
          <input aria-label="Check-in" name="checkIn" />
          <input aria-label="Check-out" name="checkOut" />
          <select aria-label="Room Type" name="roomType">
            <option>Coastal Suite</option>
          </select>
          <button type="submit">Submit dates</button>
        </form>
      )
    }

    render(<AvailabilityProbe />)
    fireEvent.change(screen.getByLabelText('Check-in'), {
      target: { value: '2026-07-10' },
    })
    fireEvent.change(screen.getByLabelText('Check-out'), {
      target: { value: '2026-07-12' },
    })
    fireEvent.submit(screen.getByLabelText('availability'))
    await waitFor(() => {
      const intent = availabilityLakebed.state().intents.at(-1)
      expect(intent).toMatchObject({
        action: 'availability',
        room: 'Coastal Suite',
        source: 'availability-test',
      })
      expect(JSON.parse(intent?.fieldsJson ?? '{}')).toMatchObject({
        checkIn: '2026-07-10',
        checkOut: '2026-07-12',
        roomType: 'Coastal Suite',
      })
    })
  })
})

describe('hotel resort rendered section behavior', () => {
  it('wires generated hotel sections through shared Lakebed state instead of fake booking navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createHotelLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <HotelResortNavbar.component
          props={{
            brand: 'Azure Test',
            bookTarget: 'Navbar booking intent',
            cta: 'Navbar Reserve',
            nav: ['Rooms', 'Dining'],
            phone: '1-800-000-0000',
          }}
        />
        <HotelResortHero.component
          props={{
            primaryCta: 'Hero Reserve',
            secondaryCta: 'Explore Suites',
          }}
        />
        <HotelResortCta.component
          props={{
            primaryCta: 'CTA Reserve',
            secondaryCta: 'Ask Concierge',
          }}
        />
        <HotelResortRooms.component
          props={{
            cta: 'Select Suite',
            items: [
              {
                description: 'Ocean view suite with private terrace.',
                imageAlt: 'Coastal suite terrace',
                meta: '650 sq ft | Ocean view',
                name: 'Coastal Suite',
                price: '$685',
                tags: ['Ocean View'],
              },
            ],
          }}
        />
        <HotelResortBooking.component
          props={{
            formHeading: 'Availability Form',
            guestOptions: ['2 Adults'],
            roomOptions: ['Coastal Suite'],
            submit: 'Send Availability',
          }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().rooms.map((room) => room.name)).toEqual(['Coastal Suite'])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Hero Reserve' }))
    fireEvent.click(screen.getByRole('button', { name: 'CTA Reserve' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask Concierge' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select Suite' }))

    await waitFor(() => {
      expect(state().intents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'booking',
            label: 'Hero Reserve',
            source: 'hero',
          }),
          expect.objectContaining({
            action: 'booking',
            label: 'CTA Reserve',
            source: 'cta',
          }),
          expect.objectContaining({
            action: 'inquiry',
            label: 'Ask Concierge',
            source: 'cta',
          }),
          expect.objectContaining({
            action: 'booking',
            label: 'Select Suite',
            room: 'Coastal Suite',
            source: 'rooms',
          }),
        ]),
      )
    })

    expect(navigate).not.toHaveBeenCalledWith('Hero Reserve')
    expect(navigate).not.toHaveBeenCalledWith('CTA Reserve')
    expect(navigate).not.toHaveBeenCalledWith('Ask Concierge')
    expect(navigate).not.toHaveBeenCalledWith('Select Suite')

    fireEvent.change(screen.getByLabelText('Check-in'), {
      target: { value: '2026-07-10' },
    })
    fireEvent.change(screen.getByLabelText('Check-out'), {
      target: { value: '2026-07-12' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Availability' }))

    await waitFor(() => {
      const availability = state().intents.at(-1)
      expect(availability).toMatchObject({
        action: 'availability',
        label: 'Availability request',
        room: 'Coastal Suite',
        source: 'Hotel booking',
      })
      expect(JSON.parse(availability?.fieldsJson ?? '{}')).toMatchObject({
        checkIn: '2026-07-10',
        checkOut: '2026-07-12',
        guests: '2 Adults',
        roomType: 'Coastal Suite',
      })
    })

    fireEvent.click(screen.getByLabelText('Search rooms'))
    const searchDialog = await screen.findByRole('dialog', {
      name: 'Search rooms',
    })
    fireEvent.click(within(searchDialog).getByText('Coastal Suite'))

    await waitFor(() => {
      expect(state().intents.at(-1)).toMatchObject({
        action: 'search',
        label: 'Selected Coastal Suite',
        room: 'Coastal Suite',
        source: 'search',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = await screen.findByRole('dialog', { name: 'Azure Test' })
    fireEvent.click(within(menu).getByRole('button', { name: 'Rooms' }))
    expect(navigate).toHaveBeenCalledWith('Rooms')
  })
})
