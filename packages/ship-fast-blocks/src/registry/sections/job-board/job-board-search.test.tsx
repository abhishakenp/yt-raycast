// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import type { JobBoardLakebed } from './job-board-interactions.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'

type JobBoardState = ReturnType<typeof jobBoardLakebed.queries.jobBoardState>
type JobBoardAction = JobBoardState['actions'][number]
type JobBoardApplication = JobBoardState['applications'][number]
type JobCatalogItem = ReturnType<
  typeof jobBoardLakebed.queries.jobCatalog
>[number]
type JobBoardSearch = JobBoardState['searches'][number]
type JobBoardStateRow = {
  createdAt: string
  filter: string
  id: string
  location: string
  query: string
  updatedAt: string
  visibleCount: number
}

const navigate = vi.fn()
const lakebedRef: { current: JobBoardLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('#/lib/img.tsx', () => ({
  Image: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt} className={className} />
  ),
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

const { cleanup, fireEvent, render, screen, waitFor, within } = await import(
  '@testing-library/react'
)
const { JobBoardHero } = await import('./JobBoardHero.tsx')
const { JobBoardJobs } = await import('./JobBoardJobs.tsx')
const { JobBoardNavbar } = await import('./JobBoardNavbar.tsx')
const { JobBoardCta } = await import('./JobBoardCta.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createJobBoardLakebedStub() {
  let version = 0
  let actions: JobBoardAction[] = []
  let applications: JobBoardApplication[] = []
  let items: JobCatalogItem[] = []
  let searches: JobBoardSearch[] = []
  let state: JobBoardStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const summary = () => ({
    actions,
    actionCount: actions.length,
    applications,
    applicationCount: applications.length,
    filter: state?.filter ?? 'All Jobs',
    location: state?.location ?? '',
    query: state?.query ?? '',
    searches,
    visibleCount: state?.visibleCount ?? 3,
  })
  const nextRow = (prefix: string, value: unknown, index: number) => ({
    ...value,
    createdAt: now,
    id: `${prefix}-${index}`,
    updatedAt: now,
  })

  const useQuery = createLakebedQueryStub<typeof jobBoardLakebed>({
    jobCatalog: () => {
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
      return items
    },
    jobBoardState: () => {
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
  })

  const useMutation = createLakebedMutationStub<typeof jobBoardLakebed>({
    applyToJob: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const role = String(input.role).trim()
            if (
              role &&
              !applications.some((application) => application.role === role)
            ) {
              applications = [
                ...applications,
                nextRow(
                  'application',
                  {
                    company: String(input.company)?.trim() ?? '',
                    role,
                  },
                  applications.length + 1,
                ),
              ]
            }
            notify()
            return applications
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
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
    loadMoreJobs: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (increment = 3) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          state = nextRow(
            'state',
            {
              filter: state?.filter ?? 'All Jobs',
              location: state?.location ?? '',
              query: state?.query ?? '',
              visibleCount: (state?.visibleCount ?? 3) + increment,
            },
            1,
          )
          notify()
          return state ? [state] : []
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (increment = 3) => runMutation(increment),
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
    recordJobBoardAction: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            actions = [
              nextRow(
                'action',
                {
                  action: String(input.action).trim(),
                  source: String(input.source)?.trim() ?? '',
                },
                actions.length + 1,
              ),
              ...actions,
            ]
            notify()
            return actions
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
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
    setJobSearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            state = nextRow(
              'state',
              {
                filter: String(input.filter)?.trim() || 'All Jobs',
                location: String(input.location)?.trim() ?? '',
                query: String(input.query)?.trim() ?? '',
                visibleCount: 3,
              },
              1,
            )
            searches = [
              nextRow(
                'search',
                {
                  filter: state.filter,
                  location: state.location,
                  query: state.query,
                },
                searches.length + 1,
              ),
              ...searches,
            ]
            notify()
            return state ? [state] : []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
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
    syncJobs: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const existingByRole = new Map(
              items.map((item) => [item.role.toLowerCase(), item]),
            )

            for (const job of input.items as Record<string, unknown>[]) {
              const role = String(job.role).trim()
              if (!role) continue

              const current = existingByRole.get(role.toLowerCase())
              const next = {
                badge: String(job.badge ?? '').trim() ?? '',
                company: String(job.company ?? '').trim() ?? '',
                description: String(job.description ?? '').trim() ?? '',
                logoAlt: String(job.logoAlt ?? '').trim() ?? '',
                posted: String(job.posted ?? '').trim() ?? '',
                role,
                tags: String(job.tags ?? '').trim() ?? '',
              }

              if (current) {
                items = items.map((candidate) =>
                  candidate.id === current.id
                    ? { ...current, ...next, updatedAt: now }
                    : candidate,
                )
              } else {
                items = [...items, nextRow('job', next, items.length + 1)]
              }
            }
            notify()
            return items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
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

  const lakebed: JobBoardLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
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
      actions,
      applications,
      items,
      searches,
      state: state ? [state] : [],
    }),
    useQuery,
    useMutation,
  }

  return {
    actions: () => actions,
    applications: () => applications,
    catalog: () => items,
    lakebed,
    searches: () => searches,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('job board fullstack search', () => {
  it('lets hero search filter the listings and record applications', async () => {
    const { applications, lakebed, searches, state } =
      createJobBoardLakebedStub()
    lakebedRef.current = lakebed
    const Hero = JobBoardHero.client.component
    const Jobs = JobBoardJobs.client.component

    render(
      <>
        <Hero props={{}} statementId="job_hero" />
        <Jobs props={{}} statementId="job_jobs" />
      </>,
    )

    expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy()
    expect(screen.queryByText('Product Designer')).toBeTruthy()

    fireEvent.change(
      screen.getByLabelText('Search for jobs by title, keywords, or company'),
      {
        target: { value: 'Frontend' },
      },
    )
    fireEvent.change(screen.getByLabelText('Search location'), {
      target: { value: 'Remote' },
    })
    fireEvent.submit(screen.getByRole('search', { name: 'Job search' }))

    await waitFor(() =>
      expect(state()).toMatchObject({
        location: 'Remote',
        query: 'Frontend',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy()
    expect(screen.queryByText('Product Designer')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()

    const frontendCard = screen
      .getByText('Senior Frontend Engineer')
      .closest('[data-slot="card"]')
    if (!frontendCard) throw new Error('Expected frontend job card')
    fireEvent.click(
      within(frontendCard).getByRole('button', { name: 'Apply Now' }),
    )

    await waitFor(() => expect(applications()).toHaveLength(1))
    expect(applications()[0]).toMatchObject({
      company: 'Stripe — San Francisco, CA or Remote',
      role: 'Senior Frontend Engineer',
    })
    expect(
      within(frontendCard).getByRole('button', { name: 'Applied' }),
    ).toBeTruthy()
  })

  it('uses filter chips and load more through shared Lakebed state', async () => {
    const { lakebed, state } = createJobBoardLakebedStub()
    lakebedRef.current = lakebed
    const Hero = JobBoardHero.client.component
    const Jobs = JobBoardJobs.client.component

    render(
      <>
        <Hero props={{}} statementId="job_hero" />
        <Jobs props={{}} statementId="job_jobs" />
      </>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Remote' })[0])
    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'Remote',
        location: 'Remote',
      }),
    )
    expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy()
    expect(screen.queryByText('Product Designer')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /load more jobs/i }))
    await waitFor(() => expect(state()?.visibleCount).toBe(6))
  })

  it('lets navbar command search drive shared job results', async () => {
    const { catalog, lakebed, state } = createJobBoardLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = JobBoardNavbar.client.component
    const Jobs = JobBoardJobs.client.component

    render(
      <>
        <Navbar props={{}} statementId="job_navbar" />
        <Jobs props={{}} statementId="job_jobs" />
      </>,
    )

    await waitFor(() => expect(catalog()).not.toHaveLength(0))

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Search jobs',
    })
    fireEvent.click(within(dialog).getByText('Product Designer'))

    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'All Jobs',
        location: '',
        query: 'Product Designer',
      }),
    )
    expect(screen.getByText('Product Designer')).toBeTruthy()
    expect(screen.queryByText('Senior Frontend Engineer')).toBeNull()
  })

  it('records post-job CTA actions without using navigation state', async () => {
    const { actions, lakebed } = createJobBoardLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = JobBoardNavbar.client.component

    render(<Navbar props={{ cta: 'Post a Job' }} statementId="job_navbar" />)

    fireEvent.click(screen.getByRole('button', { name: 'Post a Job' }))

    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      action: 'Post a Job',
      source: 'navbar',
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('records closing CTA actions without using navigation state', async () => {
    const { actions, lakebed } = createJobBoardLakebedStub()
    lakebedRef.current = lakebed
    const Cta = JobBoardCta.client.component

    render(
      <Cta
        props={{
          primary: 'Browse all jobs',
          secondary: 'Post a job',
        }}
        statementId="job_cta"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Browse all jobs/ }))
    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      action: 'Browse all jobs',
      source: 'cta:primary',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Post a job' }))
    await waitFor(() => expect(actions()).toHaveLength(2))
    expect(actions()[0]).toMatchObject({
      action: 'Post a job',
      source: 'cta:secondary',
    })
    expect(navigate).not.toHaveBeenCalled()
  })
})
