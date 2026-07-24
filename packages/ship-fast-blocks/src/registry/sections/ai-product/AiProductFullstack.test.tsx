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
        throw new Error('Missing AI product Lakebed client')
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
const { AiProductNavbar } = await import('./AiProductNavbar.tsx')
const { AiProductHero } = await import('./AiProductHero.tsx')
const { AiProductSteps } = await import('./AiProductSteps.tsx')

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

function createAiProductLakebedStub({
  mutationDelay,
  plans = [
    {
      name: 'Writer Pro',
      period: '/mo',
      price: '$19',
      summary: 'AI writing workspace',
    },
  ],
}: {
  mutationDelay?: Partial<
    Record<keyof typeof saasLakebed.mutations, () => Promise<unknown>>
  >
  plans?: TestPlanInput[]
} = {}) {
  let version = 0
  const initialIntents: TestIntent[] = []
  let state = {
    intents: initialIntents,
    plans: plans.map(testPlan),
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

describe('AI product fullstack generated section behavior', () => {
  it('shares search, Shoo auth, selected plan badge, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createAiProductLakebedStub()
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)

    function AiProductProbe() {
      return (
        <>
          {AiProductNavbar.client.component({
            props: {
              brand: 'WriteFlow',
              nav: ['Features', 'Pricing'],
              signInLabel: 'Sign in',
            },
            statementId: 'ai_navbar',
          })}
        </>
      )
    }

    render(<AiProductProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Search plans' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Writer Pro')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Writer Pro'))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Writer Pro')
      expect(state().intents.at(-1)).toEqual({
        label: 'Selected Writer Pro',
        plan: 'Writer Pro',
        source: 'search',
        type: 'trial',
      })
      expect(screen.getByText('Writer Pro')).toBeTruthy()
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

  it('scopes hero, preview-chip, and steps loading to the clicked action', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createAiProductLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed
    setSectionKitNavClickFallback(navigate)

    function AiProductProbe() {
      return (
        <>
          {AiProductHero.client.component({
            props: {
              previewActions: ['Use this', 'Try again'],
              primaryCta: 'Start writing free',
              secondaryCta: 'Watch demo',
            },
            statementId: 'ai_hero',
          })}
          {AiProductSteps.client.component({
            props: {
              cta: 'Get started now',
            },
            statementId: 'ai_steps',
          })}
        </>
      )
    }

    render(<AiProductProbe />)

    const primaryButton = screen.getByRole('button', {
      name: 'Start writing free',
    })
    const secondaryButton = screen.getByRole('button', {
      name: 'Watch demo',
    })

    fireEvent.click(primaryButton)

    await waitFor(() => {
      expect(primaryButton.getAttribute('aria-busy')).toBe('true')
      expect(primaryButton.textContent).toContain('Starting')
      expect(secondaryButton.getAttribute('aria-busy')).toBe('false')
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start writing free',
        plan: 'Start writing free',
        source: 'hero',
        type: 'trial',
      })
    })

    fireEvent.click(secondaryButton)

    await waitFor(() => {
      expect(secondaryButton.getAttribute('aria-busy')).toBe('true')
      expect(secondaryButton.textContent).toContain('Opening')
    })

    demoDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Watch demo',
        plan: 'Watch demo',
        source: 'hero',
        type: 'demo',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Use this' }))

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Use this',
        plan: 'Use this',
        source: 'preview',
        type: 'trial',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get started now' }))

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Get started now',
        plan: 'Get started now',
        source: 'steps',
        type: 'trial',
      })
    })
  })
})
