// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DocsLakebed } from './docs-interactions.tsx'
import { docsLakebed } from './docs-lakebed.ts'

type DocsState = ReturnType<typeof docsLakebed.queries.docsState>
type DocsSearch = DocsState['searches'][number]
type DocsCatalogItem = ReturnType<
  typeof docsLakebed.queries.docsCatalog
>[number]
type DocsStateRow = {
  createdAt: string
  id: string
  query: string
  updatedAt: string
}
type DocsMutationInput =
  | Parameters<typeof docsLakebed.mutations.setDocsSearch>[1]
  | Parameters<typeof docsLakebed.mutations.syncDocsArticles>[1]

const navigate = vi.fn()
const lakebedRef: { current: DocsLakebed | null } = { current: null }

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

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { DocsHero } = await import('./DocsHero.tsx')
const { DocsSidebar } = await import('./DocsSidebar.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createDocsLakebedStub() {
  let version = 0
  let articles: DocsCatalogItem[] = []
  let searches: DocsSearch[] = []
  let state: DocsStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const summary = () => ({
    query: state?.query ?? '',
    searches,
  })
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

  const lakebed: DocsLakebed = {
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
      articles,
      searches,
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

      if (name === 'docsCatalog') return articles
      if (name === 'docsState') return summary()
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: DocsMutationInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'setDocsSearch' && typeof input === 'object') {
              state = nextRow(
                'state',
                {
                  query: input.query?.trim() ?? '',
                },
                1,
              )
              searches = [
                nextRow(
                  'search',
                  {
                    query: state.query,
                  },
                  searches.length + 1,
                ),
                ...searches,
              ]
            }

            if (
              name === 'syncDocsArticles' &&
              typeof input === 'object' &&
              'articles' in input
            ) {
              const existingBySlug = new Map(
                articles.map((article) => [
                  article.slug.toLowerCase(),
                  article,
                ]),
              )

              for (const article of input.articles) {
                const slug = article.slug.trim()
                if (!slug) continue

                const next = {
                  category: article.category?.trim() ?? '',
                  content: article.content?.trim() ?? '',
                  slug,
                  title: article.title?.trim() ?? '',
                }
                const current = existingBySlug.get(slug.toLowerCase())

                if (current) {
                  articles = articles.map((candidate) =>
                    candidate.id === current.id
                      ? { ...current, ...next, updatedAt: now }
                      : candidate,
                  )
                } else {
                  articles = [
                    ...articles,
                    nextRow('article', next, articles.length + 1),
                  ]
                }
              }
            }

            notify()
            return name === 'docsState' ? summary() : []
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
          (input: DocsMutationInput) => runMutation(input),
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
    articles: () => articles,
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

describe('docs fullstack search', () => {
  it('lets the hero search query the Lakebed catalog and render matching articles inline', async () => {
    const { articles, lakebed, searches, state } = createDocsLakebedStub()
    lakebedRef.current = lakebed
    const Hero = DocsHero.client.component

    render(<Hero props={{}} statementId="docs_hero" />)

    await waitFor(() => expect(articles()).not.toHaveLength(0))

    fireEvent.change(screen.getByLabelText('Search the documentation'), {
      target: { value: 'auth' },
    })
    fireEvent.submit(
      screen.getByRole('search', { name: 'Documentation search' }),
    )

    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'auth',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(searches()[0]).toMatchObject({ query: 'auth' })

    expect(screen.getByText('Authentication')).toBeTruthy()
    expect(screen.queryByText('Introduction')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('shows a no-results message when the hero search matches nothing', async () => {
    const { lakebed, state } = createDocsLakebedStub()
    lakebedRef.current = lakebed
    const Hero = DocsHero.client.component

    render(<Hero props={{}} statementId="docs_hero" />)

    fireEvent.change(screen.getByLabelText('Search the documentation'), {
      target: { value: 'zzz-nope' },
    })
    fireEvent.submit(
      screen.getByRole('search', { name: 'Documentation search' }),
    )

    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'zzz-nope',
      }),
    )
    expect(
      screen.getByText('No articles match the current search.'),
    ).toBeTruthy()
  })

  it('lets the sidebar search query the Lakebed catalog and render matching articles inline', async () => {
    const { articles, lakebed, searches, state } = createDocsLakebedStub()
    lakebedRef.current = lakebed
    const Sidebar = DocsSidebar.client.component

    render(<Sidebar props={{}} statementId="docs_sidebar" />)

    await waitFor(() => expect(articles()).not.toHaveLength(0))

    fireEvent.change(screen.getByLabelText('Search documentation'), {
      target: { value: 'webhook' },
    })
    fireEvent.submit(
      screen.getByRole('search', {
        name: 'Sidebar documentation search',
      }),
    )

    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'webhook',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(searches()[0]).toMatchObject({ query: 'webhook' })

    const resultsRegion = screen.getByText(/articles match/).closest('div')
    if (!resultsRegion)
      throw new Error('Expected sidebar search results region')
    expect(within(resultsRegion).getByText('Webhooks')).toBeTruthy()
    expect(within(resultsRegion).queryByText('Introduction')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('navigates to an article when a hero search result is selected', async () => {
    const { lakebed, state } = createDocsLakebedStub()
    lakebedRef.current = lakebed
    const Hero = DocsHero.client.component

    render(<Hero props={{}} statementId="docs_hero" />)

    fireEvent.change(screen.getByLabelText('Search the documentation'), {
      target: { value: 'rate' },
    })
    fireEvent.submit(
      screen.getByRole('search', { name: 'Documentation search' }),
    )

    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'rate',
      }),
    )

    navigate.mockClear()
    fireEvent.click(screen.getByText('Rate Limits'))
    expect(navigate).toHaveBeenCalledWith('Rate Limits')
  })
})
