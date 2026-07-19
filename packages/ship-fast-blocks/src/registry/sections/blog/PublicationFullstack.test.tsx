// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  PublicationActionInput,
  PublicationArticleInput,
  PublicationSearchInput,
  PublicationSubscriberInput,
} from './publication-lakebed.ts'

type TestSubscriber = {
  email: string
  id: string
  source?: string
}

type TestArticle = {
  author?: string
  category?: string
  date?: string
  excerpt?: string
  id: string
  target?: string
  title: string
}

type TestSearch = {
  articleTitle?: string
  query: string
  source?: string
}

type TestAction = {
  action: string
  source?: string
}

type TestMutationInput =
  | PublicationActionInput
  | PublicationSearchInput
  | PublicationSubscriberInput
  | { articles: PublicationArticleInput[] }

type TestMutation = {
  (input: TestMutationInput): Promise<unknown>
  isPending: boolean
  lastError: unknown | null
  pendingCount: number
  reset: () => void
}

type TestLakebed = {
  signInWithGoogle: ReturnType<typeof vi.fn>
  signOut: ReturnType<typeof vi.fn>
  useAuth: () => {
    isAuthenticated: boolean
    user: {
      displayName: string
      email: string
      isGuest: boolean
    }
  }
  useData: () => {
    actions: TestAction[]
    articles: TestArticle[]
    searches: TestSearch[]
    subscribers: TestSubscriber[]
  }
  useMutation: (name: string) => TestMutation
  useQuery: (name: string) => unknown
}

const navigate = vi.fn()
const lakebedRef: { current: TestLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => {
    if (!lakebedRef.current) {
      throw new Error('Missing publication Lakebed client')
    }
    return lakebedRef.current
  }),
}))

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
  class TestResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }

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
  defineGlobal('ResizeObserver', TestResizeObserver)
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {}
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
  dom.window.ResizeObserver = TestResizeObserver
}

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

if (typeof ResizeObserver === 'undefined') {
  class TestResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: TestResizeObserver,
    writable: true,
  })

  if (typeof window !== 'undefined') {
    window.ResizeObserver = TestResizeObserver
  }
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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { BlogNavbar } = await import('./BlogNavbar.tsx')
const { BlogStoryGrid } = await import('./BlogStoryGrid.tsx')
const { NewsroomSubscribe } = await import('../newsroom/NewsroomSubscribe.tsx')

function createPublicationLakebedStub() {
  let version = 0
  let actions: TestAction[] = []
  let articles: TestArticle[] = []
  let searches: TestSearch[] = []
  let subscribers: TestSubscriber[] = []
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }

  const runMutation = async (name: string, input: Record<string, unknown>) => {
    if (name === 'subscribe' && 'email' in input) {
      const email = String(input.email).trim().toLowerCase()
      const existing = subscribers.find(
        (subscriber) => subscriber.email === email,
      )
      subscribers = existing
        ? subscribers.map((subscriber) =>
            subscriber.email === email
              ? {
                  ...subscriber,
                  source: String(input.source ?? subscriber.source),
                }
              : subscriber,
          )
        : [
            ...subscribers,
            {
              email,
              id: `subscriber-${subscribers.length + 1}`,
              source: String(input.source ?? ''),
            },
          ]
    }

    if (name === 'syncArticles' && 'articles' in input) {
      const articlesInput = input.articles as Record<string, unknown>[]
      for (const article of articlesInput) {
        const existing = articles.find((item) => item.title === article.title)
        articles = existing
          ? articles.map((item) =>
              item.title === article.title
                ? {
                    ...item,
                    author: String(article.author ?? item.author ?? ''),
                    category: String(article.category ?? item.category ?? ''),
                    date: String(article.date ?? item.date ?? ''),
                    excerpt: String(article.excerpt ?? item.excerpt ?? ''),
                    target: String(article.target ?? article.title),
                    title: String(article.title ?? item.title),
                  }
                : item,
            )
          : [
              ...articles,
              {
                author: String(article.author ?? ''),
                category: String(article.category ?? ''),
                date: String(article.date ?? ''),
                excerpt: String(article.excerpt ?? ''),
                id: `article-${articles.length + 1}`,
                target: String(article.target ?? article.title),
                title: String(article.title ?? ''),
              },
            ]
      }
    }

    if (name === 'recordSearch' && 'query' in input) {
      searches = [
        {
          articleTitle: String(input.articleTitle ?? ''),
          query: String(input.query ?? ''),
          source: String(input.source ?? ''),
        },
        ...searches,
      ]
    }

    if (name === 'recordPublicationAction' && 'action' in input) {
      actions = [
        {
          action: String(input.action ?? ''),
          source: String(input.source ?? ''),
        },
        ...actions,
      ]
    }

    notify()
  }

  const lakebed: TestLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
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
      articles,
      searches,
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

      if (name === 'articleCatalog') return articles
      if (name === 'subscriberSummary') {
        return { count: subscribers.length, subscribers }
      }
      if (name === 'publicationSummary') {
        return {
          actions,
          actionCount: actions.length,
          articles,
          articleCount: articles.length,
          searches,
          searchCount: searches.length,
          subscribers,
          subscriberCount: subscribers.length,
        }
      }

      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const run = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            await runMutation(name, input)
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name],
      )
      const initialLastError: unknown | null = null
      const mutation = useMemo(
        () =>
          Object.assign((input: Record<string, unknown>) => run(input), {
            isPending: false,
            lastError: initialLastError,
            pendingCount: 0,
            reset,
          }),
        [reset, run],
      )

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return {
    actions: () => actions,
    articles: () => articles,
    lakebed,
    searches: () => searches,
    subscribers: () => subscribers,
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
})

describe('publication fullstack interactions', () => {
  it('shares article search, subscribe drawer, profile dropdown, and mobile Sheet nav', async () => {
    const { articles, lakebed, searches, subscribers } =
      createPublicationLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = BlogNavbar.client.component
    const Grid = BlogStoryGrid.client.component

    render(
      <>
        <Navbar props={{}} statementId="blog_navbar" />
        <Grid props={{}} statementId="blog_story_grid" />
      </>,
    )

    await waitFor(() => {
      expect(
        articles().some(
          (article) =>
            article.target === 'Blog post' &&
            article.title === 'Typography as Interface',
        ),
      ).toBe(true)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search articles' }))
    const articleMatches = screen.getAllByText('Typography as Interface')
    const commandArticle = articleMatches[articleMatches.length - 1]
    if (!commandArticle) throw new Error('Missing command article')
    fireEvent.click(commandArticle)

    await waitFor(() => {
      expect(searches()).toEqual([
        {
          articleTitle: 'Typography as Interface',
          query: 'Typography as Interface',
          source: 'navbar search',
        },
      ])
    })
    expect(navigate).toHaveBeenCalledWith('Blog post')

    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: ' Reader@Example.COM ' },
    })
    const subscribeButtons = screen.getAllByRole('button', {
      name: 'Subscribe',
    })
    const submitButton = subscribeButtons[subscribeButtons.length - 1]
    if (!submitButton) throw new Error('Missing subscribe submit')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'reader@example.com',
          id: 'subscriber-1',
          source: 'Subscribe',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(lakebed.signInWithGoogle).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Engineering' })).toBeTruthy()
  })

  it('records newsroom plan choices without fake navigation', async () => {
    const { actions, lakebed } = createPublicationLakebedStub()
    lakebedRef.current = lakebed
    const Subscribe = NewsroomSubscribe.client.component

    render(<Subscribe props={{}} statementId="newsroom_subscribe" />)

    fireEvent.click(screen.getByRole('button', { name: 'Choose Premium' }))

    await waitFor(() => {
      expect(actions()).toEqual([
        {
          action: 'Choose Premium',
          source: 'plan:Premium',
        },
      ])
    })
    expect(navigate).not.toHaveBeenCalled()
  })
})
