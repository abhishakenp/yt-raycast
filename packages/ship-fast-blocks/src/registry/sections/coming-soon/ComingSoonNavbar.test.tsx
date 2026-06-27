// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NewsletterLakebed } from '../newsletter/newsletter-interactions.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'

type SubscriberSummary = ReturnType<
  typeof newsletterLakebed.queries.subscriberSummary
>
type Subscriber = SubscriberSummary['subscribers'][number]
type SubscribeInput = Parameters<
  typeof newsletterLakebed.mutations.subscribe
>[1]

const navigate = vi.fn()
const lakebedRef: { current: NewsletterLakebed | null } = { current: null }

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
        throw new Error('Missing coming soon Lakebed client')
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
const { ComingSoonNavbar } = await import('./ComingSoonNavbar.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createNewsletterLakebedStub() {
  let version = 0
  let subscribers: Subscriber[] = []
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const row = (input: SubscribeInput, index: number) => ({
    createdAt: now,
    email: input.email.trim().toLowerCase(),
    id: `subscriber-${index}`,
    source: input.source ?? '',
    updatedAt: now,
  })

  const lakebed: NewsletterLakebed = {
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
      subscribers,
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

      if (name === 'subscriberSummary') {
        return { count: subscribers.length, subscribers }
      }

      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: SubscribeInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'subscribe') {
              const email = input.email.trim().toLowerCase()
              if (email) {
                const existing = subscribers.find(
                  (subscriber) => subscriber.email === email,
                )
                subscribers = existing
                  ? subscribers.map((subscriber) =>
                      subscriber.email === email
                        ? {
                            ...subscriber,
                            source: input.source ?? subscriber.source,
                            updatedAt: now,
                          }
                        : subscriber,
                    )
                  : [...subscribers, row(input, subscribers.length + 1)]
              }
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
        [name],
      )
      const mutation = useMemo(() => {
        const callable = Object.assign(
          (input: SubscribeInput) => runMutation(input),
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
    subscribers: () => subscribers,
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
})

describe('ComingSoonNavbar fullstack interactions', () => {
  it('subscribes from the navbar waitlist drawer through Lakebed', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = ComingSoonNavbar.client.component

    render(<Navbar props={{}} statementId="coming_soon_navbar" />)

    const [waitlistButton] = screen.getAllByRole('button', {
      name: 'Join Waitlist',
    })
    if (!waitlistButton) throw new Error('Expected waitlist button')
    fireEvent.click(waitlistButton)
    const dialog = await screen.findByRole('dialog', {
      name: 'Join the newsletter',
    })
    fireEvent.change(within(dialog).getByLabelText('Email address'), {
      target: { value: ' Founder@Example.COM ' },
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Join Waitlist' }),
    )

    await waitFor(() =>
      expect(subscribers()).toEqual([
        {
          createdAt: now,
          email: 'founder@example.com',
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
    const Navbar = ComingSoonNavbar.client.component

    render(
      <Navbar
        props={{ brand: 'LaunchPad', links: ['Features', 'Join Waitlist'] }}
        statementId="coming_soon_navbar"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Features' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Features' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Features')
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
