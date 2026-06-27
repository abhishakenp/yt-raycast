// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LogisticsLakebed } from './logistics-interactions.tsx'
import { logisticsLakebed } from './logistics-lakebed.ts'

type TrackShipmentState = ReturnType<
  typeof logisticsLakebed.queries.trackShipment
>
type LogisticsShipment = NonNullable<TrackShipmentState['shipment']>
type LogisticsSearchRow = TrackShipmentState['searches'][number]
type LogisticsStateRow = {
  createdAt: string
  id: string
  trackingId: string
  updatedAt: string
}
type LogisticsMutationInput =
  | Parameters<typeof logisticsLakebed.mutations.setTrackingSearch>[1]
  | Parameters<typeof logisticsLakebed.mutations.syncShipments>[1]

const navigate = vi.fn()
const lakebedRef: { current: LogisticsLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('#/lib/img.tsx', () => ({
  Image: ({
    alt,
    className,
  }: {
    alt: string
    className?: string
    h?: number
    loading?: string
    w?: number
  }) => <img alt={alt} className={className} />,
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
  const requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: number) => clearTimeout(id)

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('FormData', dom.window.FormData)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
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
  typeof Element !== 'undefined' &&
  typeof Element.prototype.scrollIntoView !== 'function'
) {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { LogisticsHero } = await import('./LogisticsHero.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createLogisticsLakebedStub() {
  let version = 0
  let shipments: LogisticsShipment[] = []
  let searches: LogisticsSearchRow[] = []
  let state: LogisticsStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const nextRow = <TRow extends Record<string, unknown>>(
    prefix: string,
    value: TRow,
    index: number,
  ) => ({
    ...value,
    createdAt: now,
    id: `${prefix}-${index}`,
    updatedAt: now,
  })
  const summary = (): TrackShipmentState => {
    const trackingId = state?.trackingId ?? ''
    const shipment = trackingId
      ? shipments.find(
          (item) => item.trackingId.toLowerCase() === trackingId.toLowerCase(),
        )
      : undefined
    return { searches, shipment, trackingId }
  }

  const lakebed: LogisticsLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      user: { displayName: 'Guest', email: '', isGuest: true },
    }),
    useData: () => ({
      searches,
      shipments,
      state: state ? [state] : [],
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

      if (name === 'shipmentCatalog') return shipments
      if (name === 'trackShipment') return summary()
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: LogisticsMutationInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'setTrackingSearch' && typeof input === 'object') {
              const trackingId = input.trackingId?.trim() ?? ''
              state = nextRow('state', { trackingId }, 1)
              searches = [
                nextRow('search', { trackingId }, searches.length + 1),
                ...searches,
              ]
            }

            if (
              name === 'syncShipments' &&
              typeof input === 'object' &&
              'items' in input
            ) {
              const existingByTrackingId = new Map(
                shipments.map((shipment) => [
                  shipment.trackingId.toLowerCase(),
                  shipment,
                ]),
              )

              for (const item of input.items) {
                const trackingId = item.trackingId.trim()
                if (!trackingId) continue

                const next = {
                  destination: item.destination?.trim() ?? '',
                  estimatedDelivery: item.estimatedDelivery?.trim() ?? '',
                  origin: item.origin?.trim() ?? '',
                  status: item.status?.trim() ?? '',
                  trackingId,
                }
                const current = existingByTrackingId.get(
                  trackingId.toLowerCase(),
                )

                if (current) {
                  shipments = shipments.map((candidate) =>
                    candidate.id === current.id
                      ? { ...current, ...next, updatedAt: now }
                      : candidate,
                  )
                } else {
                  shipments = [
                    ...shipments,
                    nextRow('shipment', next, shipments.length + 1),
                  ]
                }
              }
            }

            notify()
            return name === 'trackShipment' ? summary() : []
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
        const callable = Object.assign(
          (input: LogisticsMutationInput) => runMutation(input),
          {
            isPending: false,
            lastError: null,
            pendingCount: 0,
            reset,
          },
        )
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
    searches: () => searches,
    shipments: () => shipments,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('logistics fullstack tracking', () => {
  it('seeds shipments and renders the matched status when a tracking ID is submitted', async () => {
    const { lakebed, searches, state } = createLogisticsLakebedStub()
    lakebedRef.current = lakebed
    const Hero = LogisticsHero.client.component

    render(<Hero props={{}} statementId="logistics_hero" />)

    fireEvent.change(screen.getByLabelText('Tracking number'), {
      target: { value: 'SF-2024-8841' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Track/ }))

    await waitFor(() =>
      expect(state()).toMatchObject({ trackingId: 'SF-2024-8841' }),
    )
    expect(searches()).toHaveLength(1)
    expect(searches()[0]).toMatchObject({ trackingId: 'SF-2024-8841' })

    expect(screen.getByText('SF-2024-8841')).toBeTruthy()
    expect(screen.getByText('In transit')).toBeTruthy()
    expect(screen.getByText(/Shenzhen, CN/)).toBeTruthy()
    expect(screen.getByText(/Chicago, US/)).toBeTruthy()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('renders a not-found message for an unknown tracking ID', async () => {
    const { lakebed, state } = createLogisticsLakebedStub()
    lakebedRef.current = lakebed
    const Hero = LogisticsHero.client.component

    render(<Hero props={{}} statementId="logistics_hero" />)

    fireEvent.change(screen.getByLabelText('Tracking number'), {
      target: { value: 'SF-9999-0000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Track/ }))

    await waitFor(() =>
      expect(state()).toMatchObject({ trackingId: 'SF-9999-0000' }),
    )
    expect(screen.getByText(/No shipment found/)).toBeTruthy()
    expect(navigate).not.toHaveBeenCalled()
  })
})
