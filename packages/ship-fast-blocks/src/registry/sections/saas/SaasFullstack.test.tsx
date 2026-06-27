// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { saasLakebed } from './saas-lakebed.ts'
import type { SaasLakebed } from './saas-interactions.tsx'

type TestPlan = {
  createdAt: string
  id: string
  name: string
  period: string
  price: string
  summary: string
  updatedAt: string
}

type TestIntent = {
  createdAt: string
  id: string
  label: string
  plan: string
  source: string
  type: string
  updatedAt: string
}

type TestAuthSession = {
  createdAt: string
  displayName: string
  email: string
  id: string
  provider: string
  signedInAt: string
  updatedAt: string
}

type TestPlanInput = {
  name: string
  period?: string
  price?: string
  summary?: string
}

type TestIntentInput = {
  label: string
  plan?: string
  source?: string
}

type TestAuthSessionInput = {
  displayName?: string
  email: string
  provider?: string
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
const lakebedRef: { current: SaasLakebed | null } = { current: null }
type TestAuthValue = ReturnType<SaasLakebed['useAuth']>

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => {
  return {
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) throw new Error('Missing SaaS Lakebed client')
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
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
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
const { SaasHero } = await import('./SaasHero.tsx')
const { SaasNavbar } = await import('./SaasNavbar.tsx')
const { SaasPricing } = await import('./SaasPricing.tsx')
const { SaasCta } = await import('./SaasCta.tsx')

const testPlan = (plan: TestPlanInput, index: number): TestPlan => ({
  createdAt: timestamp,
  id: `plan-${index + 1}`,
  name: plan.name,
  period: plan.period ?? '',
  price: plan.price ?? '',
  summary: plan.summary ?? '',
  updatedAt: timestamp,
})

const publicPlan = ({
  name,
  period,
  price,
  summary,
}: TestPlan): TestPlanInput => ({
  name,
  period,
  price,
  summary,
})

const publicIntent = ({
  label,
  plan,
  source,
  type,
}: TestIntent): TestIntentInput & { type: string } => ({
  label,
  plan,
  source,
  type,
})

const publicAuthSession = ({
  displayName,
  email,
  provider,
  signedInAt,
}: TestAuthSession): TestAuthSessionInput & { signedInAt: string } => ({
  displayName,
  email,
  provider,
  signedInAt,
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
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

function createSaasLakebedStub({
  auth,
  mutationDelay,
}: {
  auth?: TestAuthValue
  mutationDelay?: Partial<
    Record<keyof typeof saasLakebed.mutations, () => Promise<unknown>>
  >
} = {}) {
  let version = 0
  const initialAuthSessions: TestAuthSession[] = []
  const initialIntents: TestIntent[] = []
  const initialPlans: TestPlan[] = []
  let state = {
    authSessions: initialAuthSessions,
    intents: initialIntents,
    plans: initialPlans,
  }
  const listeners = new Set<() => void>()
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  }))
  const signOut = vi.fn()
  const authValue =
    auth ??
    ({
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest',
      user: {
        displayName: 'Guest',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
      userId: 'guest:local',
    } satisfies TestAuthValue)
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const summary = () => {
    const current = state.intents.at(-1) ?? null
    return {
      current,
      currentLabel: current?.label ?? '',
      currentPlan: current?.plan ?? '',
      intents: state.intents,
      total: state.intents.length,
    }
  }
  const authSessionSummary = () => {
    const sessions = [...state.authSessions].sort((left, right) =>
      right.signedInAt.localeCompare(left.signedInAt),
    )

    return {
      count: sessions.length,
      lastSession: sessions.at(0) ?? null,
      sessions,
    }
  }
  const recordAuthSession = (input: TestAuthSessionInput) => {
    const email = input.email.trim().toLowerCase()
    if (!email) return

    const provider = input.provider?.trim() || 'Shoo'
    const existingIndex = state.authSessions.findIndex(
      (session) => session.email === email && session.provider === provider,
    )
    const next = {
      createdAt:
        existingIndex >= 0
          ? state.authSessions[existingIndex]!.createdAt
          : timestamp,
      displayName: input.displayName?.trim() ?? '',
      email,
      id:
        existingIndex >= 0
          ? state.authSessions[existingIndex]!.id
          : `auth-session-${state.authSessions.length + 1}`,
      provider,
      signedInAt: timestamp,
      updatedAt: timestamp,
    }

    state = {
      ...state,
      authSessions:
        existingIndex >= 0
          ? state.authSessions.map((session, index) =>
              index === existingIndex ? next : session,
            )
          : [...state.authSessions, next],
    }
  }
  const recordIntent = ({
    input,
    type,
  }: {
    input: TestIntentInput
    type: 'demo' | 'trial'
  }) => {
    state = {
      ...state,
      intents: [
        ...state.intents,
        {
          createdAt: timestamp,
          id: `intent-${state.intents.length + 1}`,
          label: input.label,
          plan: input.plan ?? input.label,
          source: input.source ?? '',
          type,
          updatedAt: timestamp,
        },
      ],
    }
  }

  const lakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => authValue,
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

      if (name === 'planCatalog') return state.plans
      if (name === 'conversionSummary') return summary()
      if (name === 'authSessionSummary') return authSessionSummary()
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])

      if (name === 'syncPlans') {
        return useTestMutation<typeof saasLakebed.mutations.syncPlans>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(
            async (input) => {
              setPendingCount((count) => count + 1)
              setLastError(null)
              try {
                await mutationDelay?.syncPlans?.()
                state = {
                  ...state,
                  plans: input.plans.map(testPlan),
                }
                notify()
                return state.plans
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

      if (name === 'requestDemo') {
        return useTestMutation<typeof saasLakebed.mutations.requestDemo>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(
            async (input) => {
              setPendingCount((count) => count + 1)
              setLastError(null)
              try {
                await mutationDelay?.requestDemo?.()
                recordIntent({ input, type: 'demo' })
                notify()
                return state.intents
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

      if (name === 'recordAuthSession') {
        return useTestMutation<typeof saasLakebed.mutations.recordAuthSession>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(
            async (input) => {
              setPendingCount((count) => count + 1)
              setLastError(null)
              try {
                await mutationDelay?.recordAuthSession?.()
                recordAuthSession(input)
                notify()
                return state.authSessions
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

      if (name === 'clearAuthSessions') {
        return useTestMutation<typeof saasLakebed.mutations.clearAuthSessions>({
          lastError,
          pendingCount,
          reset,
          runMutation: useCallback(async () => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.clearAuthSessions?.()
              state = { ...state, authSessions: [] }
              notify()
              return []
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          }, [mutationDelay]),
        })
      }

      return useTestMutation<typeof saasLakebed.mutations.selectPlan>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.selectPlan?.()
              recordIntent({ input, type: 'trial' })
              notify()
              return state.intents
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
  } satisfies SaasLakebed

  return {
    lakebed,
    signInWithGoogle,
    signOut,
    state: () => ({
      intents: state.intents.map(publicIntent),
      sessions: state.authSessions.map(publicAuthSession),
      plans: state.plans.map(publicPlan),
    }),
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
  document.body.removeAttribute('style')
})

describe('SaaS fullstack generated section behavior', () => {
  it('shares plan catalog, search selection, Shoo auth, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createSaasLakebedStub()
    lakebedRef.current = lakebed

    function SaasProbe() {
      return (
        <>
          {SaasNavbar.client.component({
            props: {
              brand: 'Chronos AI',
              nav: ['Features', 'Pricing'],
              ctaLabel: 'Get Started',
              ctaTarget: 'Start free trial',
            },
            statementId: 'saas_navbar',
          })}
          {SaasPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Get started',
                  features: ['Small team workspace'],
                  name: 'Starter',
                  price: '$0',
                },
                {
                  cta: 'Start free trial',
                  features: ['Advanced automations'],
                  highlighted: true,
                  name: 'Pro',
                  period: '/mo',
                  price: '$29',
                },
              ],
            },
            statementId: 'saas_pricing',
          })}
        </>
      )
    }

    render(<SaasProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Chronos AI' }))
    expect(navigate).toHaveBeenCalledWith('Home')
    navigate.mockReset()

    await waitFor(() => {
      expect(state().plans).toEqual([
        {
          name: 'Starter',
          period: '',
          price: '$0',
          summary: 'Small team workspace',
        },
        {
          name: 'Pro',
          period: '/mo',
          price: '$29',
          summary: 'Advanced automations',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search plans' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Pro')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Pro'))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pro')
      expect(state().intents.at(-1)).toEqual({
        label: 'Selected Pro',
        plan: 'Pro',
        source: 'search',
        type: 'trial',
      })
      expect(screen.getAllByText('Pro').length).toBeGreaterThan(1)
    })

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })

  it('keeps SaaS mobile Home distinct from nav links', async () => {
    const { lakebed } = createSaasLakebedStub()
    lakebedRef.current = lakebed

    function SaasProbe() {
      return SaasNavbar.client.component({
        props: {
          brand: 'Chronos AI',
          nav: ['Home', 'Pricing'],
        },
        statementId: 'saas_navbar',
      })
    }

    render(<SaasProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getAllByRole('button', { name: 'Home' })).toHaveLength(
      1,
    )

    fireEvent.click(within(dialog).getByRole('button', { name: 'Home' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Home')
    })
  })

  it('renders a real Shoo profile dropdown for signed-in users', async () => {
    const signedInAuth = {
      displayName: 'Avery Stone',
      email: 'avery@example.com',
      emailVerified: true,
      isAuthenticated: true,
      isGuest: false,
      picture: 'https://example.com/avatar.png',
      provider: 'google',
      user: {
        displayName: 'Avery Stone',
        email: 'avery@example.com',
        emailVerified: true,
        id: 'google:avery',
        isGuest: false,
        picture: 'https://example.com/avatar.png',
        provider: 'google',
        userId: 'google:avery',
      },
      userId: 'google:avery',
    } satisfies TestAuthValue
    const { lakebed, signInWithGoogle, signOut, state } = createSaasLakebedStub({
      auth: signedInAuth,
    })
    lakebedRef.current = lakebed

    function SaasProbe() {
      return SaasNavbar.client.component({
        props: {
          brand: 'Chronos AI',
          nav: ['Features', 'Pricing'],
        },
        statementId: 'saas_navbar',
      })
    }

    render(<SaasProbe />)

    await waitFor(() => {
      expect(state().sessions).toEqual([
        {
          displayName: 'Avery Stone',
          email: 'avery@example.com',
          provider: 'Google via Shoo',
          signedInAt: timestamp,
        },
      ])
    })

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))

    expect(await screen.findByText('Avery Stone')).toBeTruthy()
    expect(screen.getByText('avery@example.com')).toBeTruthy()
    expect(screen.getByText('Google via Shoo')).toBeTruthy()

    fireEvent.click(screen.getByText('Session history'))

    const historyDialog = await screen.findByRole('dialog', {
      name: 'Session history',
    })
    expect(within(historyDialog).getByText('Avery Stone')).toBeTruthy()
    expect(within(historyDialog).getByText('avery@example.com')).toBeTruthy()
    expect(within(historyDialog).getByText('Google via Shoo')).toBeTruthy()

    fireEvent.click(
      within(historyDialog).getByRole('button', { name: 'Clear history' }),
    )

    await waitFor(() => {
      expect(state().sessions).toEqual([])
      expect(within(historyDialog).getByText('No sessions recorded')).toBeTruthy()
    })

    const closeHistoryButton = within(historyDialog)
      .getAllByRole('button', { name: 'Close' })
      .find((button) => button.textContent === 'Close')
    if (!closeHistoryButton) throw new Error('Missing footer close button')

    fireEvent.click(closeHistoryButton)
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Session history' }),
      ).toBeNull()
    })
    fireEvent.click(screen.getByText('Sign out'))

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signInWithGoogle).not.toHaveBeenCalled()
  })

  it('renders signed-out Shoo account controls when exported auth has a null user', async () => {
    const signedOutAuth = {
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      provider: 'guest',
      user: null,
      userId: 'guest:local',
    } satisfies TestAuthValue
    const { lakebed, signInWithGoogle } = createSaasLakebedStub({
      auth: signedOutAuth,
    })
    lakebedRef.current = lakebed

    function SaasProbe() {
      return SaasNavbar.client.component({
        props: {
          brand: 'Chronos AI',
          nav: ['Features', 'Pricing'],
        },
        statementId: 'saas_navbar',
      })
    }

    render(<SaasProbe />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))

    expect(await screen.findByText('Guest')).toBeTruthy()
    expect(screen.getAllByText('Guest profile').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByText('Sign in with Shoo'))

    expect(signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('retries Shoo session history recording after an initial Lakebed failure', async () => {
    let attempts = 0
    const recordAuthSession = vi.fn(async () => {
      attempts += 1
      if (attempts === 1) throw new Error('UNAUTHENTICATED')
    })
    const signedInAuth = {
      displayName: 'Avery Stone',
      email: 'avery@example.com',
      emailVerified: true,
      isAuthenticated: true,
      isGuest: false,
      picture: 'https://example.com/avatar.png',
      provider: 'google',
      user: {
        displayName: 'Avery Stone',
        email: 'avery@example.com',
        emailVerified: true,
        id: 'google:avery',
        isGuest: false,
        picture: 'https://example.com/avatar.png',
        provider: 'google',
        userId: 'google:avery',
      },
      userId: 'google:avery',
    } satisfies TestAuthValue
    const { lakebed, state } = createSaasLakebedStub({
      auth: signedInAuth,
      mutationDelay: { recordAuthSession },
    })
    lakebedRef.current = lakebed

    function SaasProbe() {
      return SaasNavbar.client.component({
        props: {
          brand: 'Chronos AI',
          nav: ['Features', 'Pricing'],
        },
        statementId: 'saas_navbar',
      })
    }

    render(<SaasProbe />)

    await waitFor(() => {
      expect(recordAuthSession).toHaveBeenCalledTimes(2)
      expect(state().sessions).toEqual([
        {
          displayName: 'Avery Stone',
          email: 'avery@example.com',
          provider: 'Google via Shoo',
          signedInAt: timestamp,
        },
      ])
    })
  })

  it('scopes SaaS pricing and CTA loading to the clicked action', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createSaasLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed

    function SaasProbe() {
      return (
        <>
          {SaasNavbar.client.component({
            props: {
              brand: 'Chronos AI',
              nav: ['Features', 'Pricing'],
            },
            statementId: 'saas_navbar',
          })}
          {SaasPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Get started',
                  features: ['Small team workspace'],
                  name: 'Starter',
                  price: '$0',
                },
                {
                  cta: 'Start free trial',
                  features: ['Advanced automations'],
                  highlighted: true,
                  name: 'Pro',
                  price: '$29',
                },
              ],
            },
            statementId: 'saas_pricing',
          })}
          {SaasCta.client.component({
            props: {
              primaryCta: 'Start free trial',
              secondaryCta: 'Book demo',
            },
            statementId: 'saas_cta',
          })}
        </>
      )
    }

    render(<SaasProbe />)

    const starterButton = screen.getByRole('button', {
      name: 'Get started for Starter',
    })
    const proButton = screen.getByRole('button', {
      name: 'Start free trial for Pro',
    })

    fireEvent.click(proButton)

    await waitFor(() => {
      expect(proButton.getAttribute('aria-busy')).toBe('true')
      expect(proButton.textContent).toContain('Selecting')
      expect(starterButton.getAttribute('aria-busy')).toBe('false')
      expect(starterButton.hasAttribute('disabled')).toBe(false)
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start free trial',
        plan: 'Pro',
        source: 'pricing',
        type: 'trial',
      })
      expect(screen.getAllByText('Pro').length).toBeGreaterThan(1)
    })

    const demoButton = screen.getByRole('button', { name: 'Book demo' })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(demoButton.getAttribute('aria-busy')).toBe('true')
      expect(demoButton.textContent).toContain('Sending')
    })

    demoDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Book demo',
        plan: 'Book demo',
        source: 'cta',
        type: 'demo',
      })
    })
  })

  it('records SaaS hero signup, demo, and assistant-chip actions in Lakebed', async () => {
    const { lakebed, state } = createSaasLakebedStub()
    lakebedRef.current = lakebed

    function SaasProbe() {
      return (
        <>
          {SaasHero.client.component({
            props: {
              chips: ['Accept all', 'Modify schedule'],
              primaryCta: 'Start free trial',
              secondaryCta: 'Book demo',
            },
            statementId: 'saas_hero',
          })}
        </>
      )
    }

    render(<SaasProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Start free trial' }))

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start free trial',
        plan: 'Start free trial',
        source: 'hero',
        type: 'trial',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Book demo' }))

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Book demo',
        plan: 'Book demo',
        source: 'hero',
        type: 'demo',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Modify schedule' }))

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Modify schedule',
        plan: 'Modify schedule',
        source: 'demo',
        type: 'trial',
      })
      expect(navigate).not.toHaveBeenCalled()
    })
  })
})
