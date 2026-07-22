// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedQueryStub,
  createLakebedMutationStub,
} from '@ship-fast/lakebed/test-helpers'
import type { NewsletterLakebed } from '../newsletter/newsletter-interactions.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'

type SubscriberSummary = ReturnType<
  typeof newsletterLakebed.queries.subscriberSummary
>
type Subscriber = SubscriberSummary['subscribers'][number]

const navigate = vi.fn()
const lakebedRef: { current: NewsletterLakebed | null } = { current: null }

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) throw new Error('Missing fitness Lakebed client')
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
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) =>
    clearTimeout(id)

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
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
}

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { setSectionKitNavClickFallback } =
  await import('#/section-kit/nav-href.tsx')
const { FitnessNavbar } = await import('./FitnessNavbar.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createNewsletterLakebedStub() {
  let version = 0
  let subscribers: Subscriber[] = []
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const row = (input: Record<string, unknown>, index: number) => ({
    createdAt: now,
    email: String(input.email).trim().toLowerCase(),
    id: `subscriber-${index}`,
    source: String(input.source ?? ''),
    updatedAt: now,
  })

  const useQuery = createLakebedQueryStub<typeof newsletterLakebed>({
    subscriberSummary: () => {
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

      return { count: subscribers.length, subscribers }
    },
  })

  const useMutation = createLakebedMutationStub<typeof newsletterLakebed>({
    subscribe: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            const email = String(input.email).trim().toLowerCase()
            if (email) {
              subscribers = [
                ...subscribers.filter(
                  (subscriber) => subscriber.email !== email,
                ),
                row(input, subscribers.length + 1),
              ]
            }

            notify()
            return subscribers
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const initialLastError: unknown | null = null
      const mutation = useMemo(() => {
        const callable = Object.assign(
          (input: Record<string, unknown>) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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
  })

  const lakebed: NewsletterLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest' as const,
      userId: 'guest:local',
      displayName: 'Guest',
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest' as const,
        userId: 'guest:local',
      },
    }),
    useData: () => ({
      subscribers,
    }),
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    subscribers: () => subscribers,
  }
}

afterEach(() => {
  cleanup()
  setSectionKitNavClickFallback(null)
  lakebedRef.current = null
  navigate.mockReset()
})

describe('FitnessNavbar fullstack interactions', () => {
  it('subscribes from the trial drawer through Lakebed', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)
    const Navbar = FitnessNavbar.client.component

    render(
      <Navbar
        props={{ nav: ['Classes', 'Start Trial'] }}
        statementId="fitness_navbar"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Start Trial' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Join the newsletter',
    })
    fireEvent.change(within(dialog).getByLabelText('Email address'), {
      target: { value: ' Athlete@Example.COM ' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Start Trial' }))

    await waitFor(() =>
      expect(subscribers()).toEqual([
        {
          createdAt: now,
          email: 'athlete@example.com',
          id: 'subscriber-1',
          source: 'navbar',
          updatedAt: now,
        },
      ]),
    )
    expect(navigate).not.toHaveBeenCalled()
  })

  it('opens mobile navigation in a sheet and closes after navigation', async () => {
    const { lakebed } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)
    const Navbar = FitnessNavbar.client.component

    render(
      <Navbar
        props={{ nav: ['Classes', 'Start Trial'] }}
        statementId="fitness_navbar"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Classes' })).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Classes' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
