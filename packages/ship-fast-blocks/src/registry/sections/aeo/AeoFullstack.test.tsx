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

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) {
        throw new Error('Missing AEO Lakebed client')
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
const { AeoNavbar } = await import('./AeoNavbar.tsx')
const { AeoPricing } = await import('./AeoPricing.tsx')
const { AeoHero } = await import('./AeoHero.tsx')
const { AeoCta } = await import('./AeoCta.tsx')

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

function createAeoLakebedStub({
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
  lakebedRef.current = null
  navigate.mockReset()
  document.body.removeAttribute('style')
})

describe('AEO fullstack generated section behavior', () => {
  it('shares AEO plan catalog with search, Shoo account, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createAeoLakebedStub()
    lakebedRef.current = lakebed

    function AeoProbe() {
      return (
        <>
          {AeoNavbar.client.component({
            props: {
              brand: 'Citeable',
              nav: ['Features', 'Pricing'],
            },
            statementId: 'aeo_navbar',
          })}
          {AeoPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Start Free',
                  ctaTarget: 'Start Free',
                  features: ['1 brand, 50 tracked prompts'],
                  name: 'Starter',
                  price: '$49',
                },
                {
                  cta: 'Start Free',
                  ctaTarget: 'Start Free',
                  features: ['All answer engines'],
                  highlighted: true,
                  name: 'Growth',
                  period: '/mo',
                  price: '$199',
                },
              ],
            },
            statementId: 'aeo_pricing',
          })}
        </>
      )
    }

    render(<AeoProbe />)

    await waitFor(() => {
      expect(state().plans).toEqual([
        {
          name: 'Starter',
          period: '',
          price: '$49',
          summary: '1 brand, 50 tracked prompts',
        },
        {
          name: 'Growth',
          period: '/mo',
          price: '$199',
          summary: 'All answer engines',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search plans' }))
    const searchDialog = await screen.findByRole('dialog')
    fireEvent.click(within(searchDialog).getByText('Growth'))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Growth')
      expect(state().intents.at(-1)).toEqual({
        label: 'Selected Growth',
        plan: 'Growth',
        source: 'search',
        type: 'trial',
      })
      expect(screen.getAllByText('Growth').length).toBeGreaterThan(1)
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

  it('scopes AEO loading to clicked hero, pricing, and CTA actions', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createAeoLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed

    function AeoProbe() {
      return (
        <>
          {AeoHero.client.component({
            props: {
              primaryCta: 'Start Free',
              secondaryCta: 'Book demo',
            },
            statementId: 'aeo_hero',
          })}
          {AeoPricing.client.component({
            props: {
              tiers: [
                {
                  cta: 'Start Free',
                  ctaTarget: 'Start Free',
                  features: ['1 brand, 50 tracked prompts'],
                  name: 'Starter',
                  price: '$49',
                },
                {
                  cta: 'Start Free',
                  ctaTarget: 'Start Free',
                  features: ['All answer engines'],
                  highlighted: true,
                  name: 'Growth',
                  price: '$199',
                },
              ],
            },
            statementId: 'aeo_pricing',
          })}
          {AeoCta.client.component({
            props: {
              actions: [
                { label: 'Start Free', target: 'Start Free' },
                { label: 'Book demo', target: 'Book demo', variant: 'outline' },
              ],
            },
            statementId: 'aeo_cta',
          })}
        </>
      )
    }

    render(<AeoProbe />)

    const starterButton = screen.getByRole('button', {
      name: 'Start Free for Starter',
    })
    const growthButton = screen.getByRole('button', {
      name: 'Start Free for Growth',
    })
    const heroStart = screen.getAllByRole('button', { name: 'Start Free' })[0]
    const ctaDemo = screen.getAllByRole('button', { name: 'Book demo' }).at(-1)

    expect(heroStart).toBeDefined()
    expect(ctaDemo).toBeDefined()
    fireEvent.click(growthButton)

    await waitFor(() => {
      expect(growthButton.getAttribute('aria-busy')).toBe('true')
      expect(growthButton.textContent).toContain('Selecting')
      expect(starterButton.getAttribute('aria-busy')).toBe('false')
      expect(heroStart?.getAttribute('aria-busy')).toBe('false')
      expect(ctaDemo?.getAttribute('aria-busy')).toBe('false')
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start Free',
        plan: 'Growth',
        source: 'pricing',
        type: 'trial',
      })
      expect(growthButton.getAttribute('aria-busy')).toBe('false')
    })

    fireEvent.click(ctaDemo!)

    await waitFor(() => {
      expect(ctaDemo?.getAttribute('aria-busy')).toBe('true')
      expect(ctaDemo?.textContent).toContain('Sending')
      expect(starterButton.getAttribute('aria-busy')).toBe('false')
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
})
