// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
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
      if (!lakebedRef.current) throw new Error('Missing CRM Lakebed client')
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
const { CrmNavbar } = await import('./CrmNavbar.tsx')
const { CrmPricing } = await import('./CrmPricing.tsx')
const { CrmHero } = await import('./CrmHero.tsx')
const { CrmCta } = await import('./CrmCta.tsx')

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
  let resolve = () => {}
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

function createCrmLakebedStub({
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

      if (name === 'planCatalog') return state.plans
      if (name === 'conversionSummary') return summary()
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

describe('CRM fullstack generated section behavior', () => {
  it('shares plan catalog, command search, Shoo auth, and mobile navigation', async () => {
    const { lakebed, signInWithGoogle, state } = createCrmLakebedStub()
    lakebedRef.current = lakebed

    function CrmProbe() {
      return (
        <>
          {CrmNavbar.client.component({
            props: {
              brand: 'Pipeline Pro',
              nav: ['Features', 'Pricing'],
              signInLabel: 'Sign In',
            },
            statementId: 'crm_navbar',
          })}
          {CrmPricing.client.component({
            props: {
              plans: [
                {
                  cta: 'Start free trial',
                  description: 'For small sales teams.',
                  features: ['Up to 1,000 contacts'],
                  name: 'Starter',
                  price: '$19',
                  unit: '/user/month',
                },
                {
                  cta: 'Contact sales',
                  description: 'For enterprise revenue teams.',
                  features: ['SSO and custom integrations'],
                  featured: true,
                  name: 'Enterprise',
                  price: 'Custom',
                  unit: '',
                },
              ],
            },
            statementId: 'crm_pricing',
          })}
        </>
      )
    }

    render(<CrmProbe />)

    await waitFor(() => {
      expect(state().plans).toEqual([
        {
          name: 'Starter',
          period: '/user/month',
          price: '$19',
          summary: 'For small sales teams.',
        },
        {
          name: 'Enterprise',
          period: '',
          price: 'Custom',
          summary: 'For enterprise revenue teams.',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search plans' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Enterprise')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Enterprise'))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Enterprise')
      expect(state().intents.at(-1)).toEqual({
        label: 'Selected Enterprise',
        plan: 'Enterprise',
        source: 'search',
        type: 'trial',
      })
      expect(screen.getAllByText('Enterprise').length).toBeGreaterThan(1)
    })

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Sign In' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })

  it('keeps CRM pricing, hero, and CTA loading scoped to clicked actions', async () => {
    const selectDeferred = createDeferred()
    const demoDeferred = createDeferred()
    const { lakebed, state } = createCrmLakebedStub({
      mutationDelay: {
        requestDemo: () => demoDeferred.promise,
        selectPlan: () => selectDeferred.promise,
      },
    })
    lakebedRef.current = lakebed

    function CrmProbe() {
      return (
        <>
          {CrmHero.client.component({
            props: {
              primaryCta: 'Start 14-day free trial',
              secondaryCta: 'Watch demo',
            },
            statementId: 'crm_hero',
          })}
          {CrmPricing.client.component({
            props: {
              plans: [
                {
                  cta: 'Start free trial',
                  description: 'For small sales teams.',
                  features: ['Up to 1,000 contacts'],
                  name: 'Starter',
                  price: '$19',
                  unit: '/user/month',
                },
                {
                  cta: 'Contact sales',
                  description: 'For enterprise revenue teams.',
                  features: ['SSO and custom integrations'],
                  featured: true,
                  name: 'Enterprise',
                  price: 'Custom',
                  unit: '',
                },
              ],
            },
            statementId: 'crm_pricing',
          })}
          {CrmCta.client.component({
            props: {
              primaryCta: 'Start 14-day free trial',
              secondaryCta: 'Schedule a demo',
            },
            statementId: 'crm_cta',
          })}
        </>
      )
    }

    render(<CrmProbe />)

    const starterButton = screen.getByRole('button', {
      name: 'Start free trial for Starter',
    })
    const enterpriseButton = screen.getByRole('button', {
      name: 'Contact sales for Enterprise',
    })

    fireEvent.click(starterButton)

    await waitFor(() => {
      expect(starterButton.getAttribute('aria-busy')).toBe('true')
      expect(starterButton.textContent).toContain('Selecting')
      expect(enterpriseButton.getAttribute('aria-busy')).toBe('false')
      expect(enterpriseButton.hasAttribute('disabled')).toBe(false)
    })

    selectDeferred.resolve()

    await waitFor(() => {
      expect(state().intents.at(-1)).toEqual({
        label: 'Start free trial',
        plan: 'Starter',
        source: 'pricing',
        type: 'trial',
      })
    })

    const heroDemoButton = screen.getByRole('button', { name: 'Watch demo' })
    fireEvent.click(heroDemoButton)

    await waitFor(() => {
      expect(heroDemoButton.getAttribute('aria-busy')).toBe('true')
      expect(heroDemoButton.textContent).toContain('Sending')
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
  })
})
