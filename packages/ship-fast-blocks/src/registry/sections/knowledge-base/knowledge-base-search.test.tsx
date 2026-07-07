// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import type { KnowledgeBaseLakebed } from './knowledge-base-interactions.tsx'
import {
  knowledgeBaseLakebed,
  type KnowledgeBaseArticleInput,
  type KnowledgeBaseSearchInput,
} from './knowledge-base-lakebed.ts'

type KbSearchState = ReturnType<typeof knowledgeBaseLakebed.queries.kbSearch>
type KbArticle = KbSearchState['articles'][number]
type KbSearchRow = KbSearchState['searches'][number]
type KbStateRow = {
  createdAt: string
  id: string
  query: string
  updatedAt: string
}

const navigate = vi.fn()
const lakebedRef: { current: KnowledgeBaseLakebed | null } = { current: null }

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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { KnowledgeBaseHero } = await import('./KnowledgeBaseHero.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createKbLakebedStub() {
  let version = 0
  let articles: KbArticle[] = []
  let searches: KbSearchRow[] = []
  let state: KbStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
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
  const summary = (): KbSearchState => {
    const query = state?.query ?? ''
    const results = query
      ? articles.filter((article) => {
          const haystack = [article.title, article.category, article.content]
            .join(' ')
            .toLowerCase()
          return haystack.includes(query.toLowerCase())
        })
      : articles
    return { articles, query, results, searches }
  }

  const useQuery = createLakebedQueryStub<typeof knowledgeBaseLakebed>({
    kbCatalog: () => {
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
      return articles
    },
    kbSearch: () => {
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

  const useMutation = createLakebedMutationStub<typeof knowledgeBaseLakebed>({
    setKbSearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: KnowledgeBaseSearchInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const query = input.query?.trim() ?? ''
            state = nextRow('state', { query }, 1)
            searches = [
              nextRow('search', { query }, searches.length + 1),
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
          (input: KnowledgeBaseSearchInput) => runMutation(input),
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
    syncKbArticles: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: { items: KnowledgeBaseArticleInput[] }) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const existingBySlug = new Map(
              articles.map((article) => [article.slug.toLowerCase(), article]),
            )

            for (const item of input.items) {
              const slug = item.slug.trim()
              if (!slug) continue

              const next = {
                category: item.category?.trim() ?? '',
                content: item.content?.trim() ?? '',
                slug,
                title: item.title?.trim() ?? '',
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
            notify()
            return articles
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
          (input: { items: KnowledgeBaseArticleInput[] }) => runMutation(input),
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

  const lakebed: KnowledgeBaseLakebed = {
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
      articles,
      searches,
      state: state ? [state] : [],
    }),
    useQuery,
    useMutation,
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

describe('knowledge base fullstack search', () => {
  it('seeds articles and filters results when the hero search is submitted', async () => {
    const { lakebed, searches, state } = createKbLakebedStub()
    lakebedRef.current = lakebed
    const Hero = KnowledgeBaseHero.client.component

    render(<Hero props={{}} statementId="kb_hero" />)

    expect(
      screen.getByRole('search', { name: 'Knowledge base search' }),
    ).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Search help articles'), {
      target: { value: 'Billing' },
    })
    fireEvent.submit(
      screen.getByRole('search', { name: 'Knowledge base search' }),
    )

    await waitFor(() => expect(state()).toMatchObject({ query: 'Billing' }))
    expect(searches()).toHaveLength(1)
    expect(searches()[0]).toMatchObject({ query: 'Billing' })

    expect(screen.getByText('Billing and subscription plans')).toBeTruthy()
    expect(screen.queryByText('Getting started with your account')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('uses popular topic chips to drive shared Lakebed search', async () => {
    const { lakebed, state } = createKbLakebedStub()
    lakebedRef.current = lakebed
    const Hero = KnowledgeBaseHero.client.component

    render(<Hero props={{}} statementId="kb_hero" />)

    expect(
      screen.getByRole('search', { name: 'Knowledge base search' }),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'API keys' }))

    await waitFor(() => expect(state()).toMatchObject({ query: 'API keys' }))
    expect(screen.getByText('Generating and rotating API keys')).toBeTruthy()
    expect(screen.queryByText('Billing and subscription plans')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })
})
