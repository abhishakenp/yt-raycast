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

vi.mock('@ship-fast/lakebed/react', () => {
  return {
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) {
        throw new Error('Missing analytics Lakebed client')
      }
      return lakebedRef.current
    }),
    useAuth: () => ({
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
const { setSectionKitNavClickFallback } =
  await import('#/section-kit/nav-href.tsx')
const { AnalyticsHero } = await import('./AnalyticsHero.tsx')
const { AnalyticsNavbar } = await import('./AnalyticsNavbar.tsx')
const { AnalyticsPricing } = await import('./AnalyticsPricing.tsx')
const { AnalyticsCta } = await import('./AnalyticsCta.tsx')

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

function createAnalyticsLakebedStub({
  mutationDelay,
}: {
  mutationDelay?: Partial<
    Record<keyof typeof saasLakebed.mutations, () => Promise<unknown>>
  >
} = {}) {
  let version = 0
  const initialIntents: TestIntent[] = []
  const initialPlans: TestPlan[] = []
  let state = {
    intents: initialIntents,
    plans: initialPlans,
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
    const current = state.intents.at(-1) ?? null
    return {
      current,
      currentLabel: current?.label ?? '',
      currentPlan: current?.plan ?? '',
      intents: state.intents,
      total: state.intents.length,
    }
  }
  const recordIntent = ({
    input,
    type,
  }: {
    input: Record<string, unknown>
    type: string
  }) => {
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
      return { count: 0, lastSession: null, sessions: [] }
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
                plans: (
                  (input as Record<string, unknown>)
                    .plans as Array<TestPlanInput>
                ).map(testPlan),
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
              recordIntent({
                input: input as Record<string, unknown>,
                type: 'demo',
              })
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
        runMutation: useCallback(async () => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            return []
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
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
            return []
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
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
              recordIntent({
                input: input as Record<string, unknown>,
                type: 'trial',
              })
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
    useAuth: () => ({
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
    }),
    useData: () => state,
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signInWithGoogle,
    state: () => ({
      intents: state.intents.map(publicIntent),
      plans: state.plans.map(publicPlan),
    }),
  }
}

afterEach(() => {
  cleanup()
  setSectionKitNavClickFallback(null)
  lakebedRef.current = null
  navigate.mockReset()
  document.body.removeAttribute('style')
})

describe('analytics fullstack generated section behavior', () => {
  it('shares plan catalog, search selection, Shoo auth, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createAnalyticsLakebedStub()
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)

    function AnalyticsProbe() {
      return (
        <>
          {AnalyticsNavbar.client.component({
            props: {
              brand: 'Pulse Analytics',
              nav: ['Product', 'Pricing'],
            },
            statementId: 'analytics_navbar',
          })}
          {AnalyticsPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Get started',
                  ctaTarget: 'Start Free',
                  features: ['3 dashboards'],
                  name: 'Free',
                  price: '$0',
                },
                {
                  cta: 'Start free trial',
                  ctaTarget: 'Start Free Trial',
                  features: ['Smart alerts'],
                  highlighted: true,
                  name: 'Pro',
                  period: '/mo',
                  price: '$49',
                },
              ],
            },
            statementId: 'analytics_pricing',
          })}
        </>
      )
    }

    render(<AnalyticsProbe />)

    await waitFor(() => {
      expect(state().plans).toEqual([
        { name: 'Free', period: '', price: '$0', summary: '3 dashboards' },
        { name: 'Pro', period: '/mo', price: '$49', summary: 'Smart alerts' },
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

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })

  it('scopes pricing and CTA loading to the clicked analytics action', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createAnalyticsLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)

    function AnalyticsProbe() {
      return (
        <>
          {AnalyticsNavbar.client.component({
            props: {
              brand: 'Pulse Analytics',
              nav: ['Product', 'Pricing'],
            },
            statementId: 'analytics_navbar',
          })}
          {AnalyticsPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Get started',
                  ctaTarget: 'Start Free',
                  features: ['3 dashboards'],
                  name: 'Free',
                  price: '$0',
                },
                {
                  cta: 'Start free trial',
                  ctaTarget: 'Start Free Trial',
                  features: ['Smart alerts'],
                  highlighted: true,
                  name: 'Pro',
                  price: '$49',
                },
              ],
            },
            statementId: 'analytics_pricing',
          })}
          {AnalyticsCta.client.component({
            props: {
              primaryCta: 'Start Free Trial',
              primaryTarget: 'Start Free Trial',
              secondaryCta: 'Book a demo',
              secondaryTarget: 'Book a demo',
            },
            statementId: 'analytics_cta',
          })}
        </>
      )
    }

    render(<AnalyticsProbe />)

    const freeButton = screen.getByRole('button', {
      name: 'Get started for Free',
    })
    const proButton = screen.getByRole('button', {
      name: 'Start free trial for Pro',
    })

    fireEvent.click(proButton)

    await waitFor(() => {
      expect(proButton.getAttribute('aria-busy')).toBe('true')
      expect(proButton.textContent).toContain('Selecting')
      expect(freeButton.getAttribute('aria-busy')).toBe('false')
      expect(freeButton.hasAttribute('disabled')).toBe(false)
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start Free Trial',
        plan: 'Pro',
        source: 'pricing',
        type: 'trial',
      })
      expect(screen.getAllByText('Pro').length).toBeGreaterThan(1)
    })

    const demoButton = screen.getByRole('button', { name: 'Book a demo' })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(demoButton.getAttribute('aria-busy')).toBe('true')
      expect(demoButton.textContent).toContain('Sending')
    })

    demoDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Book a demo',
        plan: 'Book a demo',
        source: 'cta',
        type: 'demo',
      })
    })
  })

  it('records analytics hero trial and demo actions in Lakebed', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createAnalyticsLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)

    function AnalyticsProbe() {
      return (
        <>
          {AnalyticsHero.client.component({
            props: {
              primaryCta: 'Start Free Trial',
              secondaryCta: 'Book a demo',
            },
            statementId: 'analytics_hero',
          })}
        </>
      )
    }

    render(<AnalyticsProbe />)

    const trialButton = screen.getByRole('button', {
      name: 'Start Free Trial',
    })
    const demoButton = screen.getByRole('button', { name: 'Book a demo' })

    fireEvent.click(trialButton)

    await waitFor(() => {
      expect(trialButton.getAttribute('aria-busy')).toBe('true')
      expect(trialButton.textContent).toContain('Starting')
      expect(demoButton.getAttribute('aria-busy')).toBe('false')
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start Free Trial',
        plan: 'Start Free Trial',
        source: 'hero',
        type: 'trial',
      })
    })

    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(demoButton.getAttribute('aria-busy')).toBe('true')
      expect(demoButton.textContent).toContain('Opening')
    })

    demoDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Book a demo',
        plan: 'Book a demo',
        source: 'hero',
        type: 'demo',
      })
      expect(navigate).not.toHaveBeenCalledWith('Book a demo')
    })
  })
})
