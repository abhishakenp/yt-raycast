// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import type { SaasLakebed } from '../saas/saas-interactions.tsx'

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
const lakebedRef: { current: SaasLakebed | null } = { current: null }
type TestAuthValue = ReturnType<SaasLakebed['useAuth']>

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
        throw new Error('Missing auth Lakebed client')
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
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) => clearTimeout(id)

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
const { AuthNavbar } = await import('./AuthNavbar.tsx')
const { AuthPricing } = await import('./AuthPricing.tsx')
const { AuthHero } = await import('./AuthHero.tsx')
const { AuthCta } = await import('./AuthCta.tsx')

function testPlan(plan: TestPlanInput, index: number): TestPlan {
  return {
    createdAt: timestamp,
    id: `plan-${index + 1}`,
    name: plan.name,
    period: plan.period ?? '',
    price: plan.price ?? '',
    summary: plan.summary ?? '',
    updatedAt: timestamp,
  }
}

function publicPlan({ name, period, price, summary }: TestPlan): TestPlanInput {
  return {
    name,
    period,
    price,
    summary,
  }
}

function publicIntent({
  label,
  plan,
  source,
  type,
}: TestIntent): TestIntentInput & { type: string } {
  return {
    label,
    plan,
    source,
    type,
  }
}

function publicAuthSession({
  displayName,
  email,
  provider,
  signedInAt,
}: TestAuthSession): TestAuthSessionInput & { signedInAt: string } {
  return {
    displayName,
    email,
    provider,
    signedInAt,
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
      Object.assign((...args: MutationArgs<TMutation>) => runMutation(...args), {
        isPending: false,
        lastError: emptyLastError,
        pendingCount: 0,
        reset,
      }),
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

function createAuthLakebedStub({
  auth,
  mutationDelay,
}: {
  auth?: TestAuthValue
  mutationDelay?: Partial<
    Record<keyof typeof saasLakebed.mutations, () => Promise<unknown>>
  >
} = {}) {
  let version = 0
  const initialIntents: TestIntent[] = []
  const initialPlans: TestPlan[] = []
  const initialAuthSessions: TestAuthSession[] = []
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
  const recordAuthSession = (input: Record<string, unknown>) => {
    const email = (input.email as string).trim().toLowerCase()
    if (!email) return

    const provider = (input.provider as string | undefined)?.trim() || 'Shoo'
    const existingIndex = state.authSessions.findIndex(
      (session) => session.email === email && session.provider === provider,
    )
    const next = {
      createdAt:
        existingIndex >= 0
          ? state.authSessions[existingIndex]!.createdAt
          : timestamp,
      displayName: (input.displayName as string | undefined)?.trim() ?? '',
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
  const recordIntent = ({ input, type }: { input: Record<string, unknown>; type: string }) => {
    state = {
      ...state,
      intents: [
        ...state.intents,
        {
          createdAt: timestamp,
          id: `intent-${state.intents.length + 1}`,
          label: input.label as string,
          plan: (input.plan as string | undefined) ?? (input.label as string),
          source: (input.source as string | undefined) ?? '',
          type,
          updatedAt: timestamp,
        },
      ],
    }
  }

  const useQuery = createLakebedQueryStub<typeof saasLakebed>({
    planCatalog: () => {
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
      return state.plans
    },
    conversionSummary: () => {
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
    authSessionSummary: () => {
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
      return authSessionSummary()
    },
  })

  const useMutation = createLakebedMutationStub<typeof saasLakebed>({
    syncPlans: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
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
                plans: ((input as Record<string, unknown>).plans as Array<TestPlanInput>).map(testPlan),
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
    },
    requestDemo: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
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
              recordIntent({ input: input as Record<string, unknown>, type: 'demo' })
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
    recordAuthSession: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
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
              recordAuthSession(input as Record<string, unknown>)
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
    },
    clearAuthSessions: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
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
    },
    selectPlan: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
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
              recordIntent({ input: input as Record<string, unknown>, type: 'trial' })
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
  })

  const lakebed: SaasLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => authValue,
    useData: () => state,
    useQuery,
    useMutation,
  }

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

describe('auth fullstack generated section behavior', () => {
  it('shares auth plan catalog with search, Shoo account, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createAuthLakebedStub()
    lakebedRef.current = lakebed

    function AuthProbe() {
      return (
        <>
          {AuthNavbar.client.component({
            props: {
              brand: 'Authly',
              nav: ['Product', 'Pricing'],
            },
            statementId: 'auth_navbar',
          })}
          {AuthPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Start Free',
                  ctaTarget: 'Sign Up',
                  features: ['10,000 monthly active users'],
                  name: 'Free',
                  price: '$0',
                },
                {
                  cta: 'Start Pro',
                  ctaTarget: 'Sign Up',
                  features: ['MFA enforcement'],
                  highlighted: true,
                  name: 'Pro',
                  period: '/ mo',
                  price: '$99',
                },
              ],
            },
            statementId: 'auth_pricing',
          })}
        </>
      )
    }

    render(<AuthProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Authly' }))
    expect(navigate).toHaveBeenCalledWith('Home')
    navigate.mockReset()

    await waitFor(() => {
      expect(state().plans).toEqual([
        {
          name: 'Free',
          period: '',
          price: '$0',
          summary: '10,000 monthly active users',
        },
        {
          name: 'Pro',
          period: '/ mo',
          price: '$99',
          summary: 'MFA enforcement',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search plans' }))
    const searchDialog = await screen.findByRole('dialog')
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

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })

  it('renders a signed-in Shoo profile dropdown in the auth navbar', async () => {
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
    const { lakebed, signInWithGoogle, signOut, state } = createAuthLakebedStub(
      {
        auth: signedInAuth,
      },
    )
    lakebedRef.current = lakebed

    function AuthProbe() {
      return AuthNavbar.client.component({
        props: {
          brand: 'Authly',
          nav: ['Product', 'Pricing'],
        },
        statementId: 'auth_navbar',
      })
    }

    render(<AuthProbe />)

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
      expect(
        within(historyDialog).getByText('No sessions recorded'),
      ).toBeTruthy()
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
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signInWithGoogle).not.toHaveBeenCalled()
  })

  it('scopes auth sign-up loading to the clicked action across hero, pricing, and CTA', async () => {
    const selectDeferred = createDeferred()
    const { lakebed, state } = createAuthLakebedStub({
      mutationDelay: {
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed

    function AuthProbe() {
      return (
        <>
          {AuthHero.client.component({
            props: {
              primaryCta: 'Start Building',
              primaryTarget: 'Sign Up',
              secondaryCta: 'Docs',
              secondaryTarget: 'Docs',
            },
            statementId: 'auth_hero',
          })}
          {AuthPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Start Free',
                  ctaTarget: 'Sign Up',
                  features: ['10,000 monthly active users'],
                  name: 'Free',
                  price: '$0',
                },
                {
                  cta: 'Start Pro',
                  ctaTarget: 'Sign Up',
                  features: ['MFA enforcement'],
                  highlighted: true,
                  name: 'Pro',
                  price: '$99',
                },
              ],
            },
            statementId: 'auth_pricing',
          })}
          {AuthCta.client.component({
            props: {
              primaryCta: 'Start Free',
              primaryTarget: 'Sign Up',
              secondaryCta: 'Read the Docs',
              secondaryTarget: 'Docs',
            },
            statementId: 'auth_cta',
          })}
        </>
      )
    }

    render(<AuthProbe />)

    const freeButton = screen.getByRole('button', {
      name: 'Start Free for Free',
    })
    const proButton = screen.getByRole('button', {
      name: 'Start Pro for Pro',
    })
    const heroButton = screen.getByRole('button', { name: 'Start Building' })
    const ctaButton = screen.getByRole('button', { name: 'Start Free' })

    fireEvent.click(proButton)

    await waitFor(() => {
      expect(proButton.getAttribute('aria-busy')).toBe('true')
      expect(proButton.textContent).toContain('Selecting')
      expect(freeButton.getAttribute('aria-busy')).toBe('false')
      expect(heroButton.getAttribute('aria-busy')).toBe('false')
      expect(ctaButton.getAttribute('aria-busy')).toBe('false')
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Sign Up',
        plan: 'Pro',
        source: 'pricing',
        type: 'trial',
      })
      expect(proButton.getAttribute('aria-busy')).toBe('false')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Docs' }))
    expect(navigate).toHaveBeenCalledWith('Docs')
  })
})
