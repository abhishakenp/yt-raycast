// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react'

import type { GalleryPayload, GallerySession } from './components/PublicGallery'

/* -------------------------------------------------------------------------- */
/* Hoisted mocks                                                              */
/* -------------------------------------------------------------------------- */

const galleryMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    onPointerEnter,
    onPointerLeave,
    preload: _preload,
    to,
    params,
    ...props
  }: {
    children?: ReactNode
    onPointerEnter?: (e: ReactPointerEvent) => void
    onPointerLeave?: (e: ReactPointerEvent) => void
    preload?: boolean
    to?: string
    params?: Record<string, string>
    [key: string]: unknown
  }) => {
    let href = typeof to === 'string' ? to : '#'
    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        href = href.replace(`$${key}`, String(value))
      }
    }
    href = href.replace(/\/\$$/, '')
    return (
      <a
        href={href}
        {...props}
        onPointerOver={onPointerEnter}
        onPointerOut={onPointerLeave}
      >
        {children}
      </a>
    )
  },
}))

vi.mock('convex/react', () => ({
  useMutation: () => galleryMocks.deleteMine,
  ConvexReactClient: class {
    watchQuery() {
      return {
        localQueryResult: () => undefined,
        onUpdate: () => () => {},
        journal: () => undefined,
      }
    }
    connectionState() {
      return {
        hasInflightRequests: false,
        isWebSocketConnected: false,
        timeOfOldestInflightRequest: null,
      }
    }
  },
  ConvexProvider: ({ children }: { children?: ReactNode }) => children,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      deleteMine: 'sessions.deleteMine',
      listPublicSessions: 'sessions.listPublicSessions',
      getPublicGallerySession: 'sessions.getPublicGallerySession',
    },
  },
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source?: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

/* -------------------------------------------------------------------------- */
/* GalleryPage controller mock (flexible, controllable from tests)           */
/* -------------------------------------------------------------------------- */

const controllerState = {
  loading: false,
  sessions: [] as GallerySession[],
  categoriesOverride: undefined as
    | undefined
    | { value: string; label: string; count: number }[],
}

vi.mock('./hooks/useGalleryController', () => ({
  useGalleryController: ({
    category = '',
    limit = 12,
    page = 1,
    search = '',
  }) => {
    if (controllerState.loading) {
      return { gallery: undefined, sessions: undefined }
    }

    let items = controllerState.sessions
    if (search.trim().length > 0) {
      const needle = search.trim().toLowerCase()
      items = items.filter(
        (session) =>
          session.prompt?.toLowerCase().includes(needle) ||
          session.categories?.some((c) => c.toLowerCase().includes(needle)),
      )
    }
    if (category.trim().length > 0) {
      items = items.filter(
        (session) => session.categories?.includes(category) ?? false,
      )
    }

    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const paged = items.slice(start, start + limit)

    const availableCategories =
      controllerState.categoriesOverride ??
      Array.from(
        controllerState.sessions
          .reduce<Map<string, number>>((counts, session) => {
            for (const c of session.categories ?? []) {
              counts.set(c, (counts.get(c) ?? 0) + 1)
            }
            return counts
          }, new Map())
          .entries(),
      ).map(([value, count]) => ({ value, label: value, count }))

    const gallery: GalleryPayload = {
      items: paged,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      availableCategories,
    }

    return { gallery, sessions: paged }
  },
}))

/* -------------------------------------------------------------------------- */
/* Real module imports (after mocks are hoisted)                              */
/* -------------------------------------------------------------------------- */

import { GalleryPage } from './components/GalleryPage'
import { GalleryGrid } from './components/PublicGallery'

/* -------------------------------------------------------------------------- */
/* Shared helpers / fixtures                                                  */
/* -------------------------------------------------------------------------- */

const baseSessions: GallerySession[] = [
  {
    sessionId: 'session_ai_studio',
    prompt: 'AI image studio',
    categories: ['ai', 'design'],
    elapsed: 4200,
  },
  {
    sessionId: 'session_crypto_dashboard',
    prompt: 'Crypto dashboard',
    categories: ['finance', 'dashboard'],
    elapsed: 8800,
  },
  {
    sessionId: 'session_blog_dogs',
    prompt: 'Blog about dogs',
    categories: ['blog'],
    elapsed: 65000,
  },
]

const emptyGallery: GalleryPayload = {
  availableCategories: [],
  hasNext: false,
  hasPrev: false,
  items: [],
  limit: 12,
  page: 1,
  total: 0,
  totalPages: 1,
}

function resetController(sessions: GallerySession[] = baseSessions) {
  controllerState.loading = false
  controllerState.sessions = sessions
  controllerState.categoriesOverride = undefined
}

/* -------------------------------------------------------------------------- */
/* 1-7. GalleryPage edge cases                                                */
/* -------------------------------------------------------------------------- */

describe('GalleryPage edge cases', () => {
  beforeEach(() => {
    galleryMocks.deleteMine.mockReset()
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
    resetController()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('1. ⌘K shortcut focuses the search input', () => {
    const { getByPlaceholderText } = render(<GalleryPage />)
    const input = getByPlaceholderText(
      'Search prompts, categories, sessions...',
    ) as HTMLInputElement

    expect(document.activeElement).not.toBe(input)

    fireEvent.keyDown(window, { metaKey: true, key: 'k' })

    expect(document.activeElement).toBe(input)
  })

  it('2. clearing the search shows all items again', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <GalleryPage />,
    )

    expect(getByText('AI image studio')).not.toBeNull()
    expect(getByText('Blog about dogs')).not.toBeNull()

    const input = getByPlaceholderText(
      'Search prompts, categories, sessions...',
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'crypto' } })
    expect(queryByText('AI image studio')).toBeNull()
    expect(getByText('Crypto dashboard')).not.toBeNull()

    fireEvent.change(input, { target: { value: '' } })
    expect(getByText('AI image studio')).not.toBeNull()
    expect(getByText('Blog about dogs')).not.toBeNull()
  })

  it('3. selecting a category with 0 items shows the empty state', () => {
    controllerState.categoriesOverride = [
      { value: 'ghost', label: 'ghost', count: 0 },
    ]

    const { container, getByText } = render(<GalleryPage />)

    const tabsContainer = container.querySelector(
      '[aria-label="Gallery categories"]',
    ) as HTMLElement
    const ghostTab = Array.from(tabsContainer.querySelectorAll('button')).find(
      (b) => b.textContent === 'ghost',
    ) as HTMLButtonElement

    fireEvent.click(ghostTab)

    const grid = container.querySelector('.sf-gallery-grid') as HTMLElement
    expect(grid).not.toBeNull()
    expect(grid.querySelector('[data-gallery-session-id]')).toBeNull()
    expect(getByText('0 previews')).not.toBeNull()
  })

  it('4. on page 1 of 1 both prev and next are disabled', () => {
    resetController([baseSessions[0]])
    const { container } = render(<GalleryPage />)

    const nav = container.querySelector(
      'nav[aria-label="Gallery pages"]',
    ) as HTMLElement
    const buttons = nav.querySelectorAll('button')
    const prevButton = buttons[0] as HTMLButtonElement
    const nextButton = buttons[1] as HTMLButtonElement

    expect(prevButton.disabled).toBe(true)
    expect(nextButton.disabled).toBe(true)
    expect(nav.querySelector('p')?.textContent).toContain('Page 1 of 1')
  })

  it('5. large dataset: 24 items, limit 12 → 2 pages; page 2 shows items 13-24', () => {
    const many: GallerySession[] = Array.from({ length: 24 }, (_, i) => ({
      sessionId: `session_${i}`,
      prompt: `Project ${i + 1}`,
      categories: ['demo'],
      elapsed: 1000,
    }))
    resetController(many)

    const { container, getByText, queryByText } = render(<GalleryPage />)

    const nav = container.querySelector(
      'nav[aria-label="Gallery pages"]',
    ) as HTMLElement
    const nextButton = nav.querySelectorAll('button')[1] as HTMLButtonElement

    expect(getByText('Project 1')).not.toBeNull()
    expect(getByText('Project 12')).not.toBeNull()
    expect(queryByText('Project 13')).toBeNull()

    fireEvent.click(nextButton)

    expect(queryByText('Project 12')).toBeNull()
    expect(getByText('Project 13')).not.toBeNull()
    expect(getByText('Project 24')).not.toBeNull()
    expect(nav.querySelector('p')?.textContent).toContain('Page 2 of 2')
  })

  it('6. preview count text reflects the total number of previews', () => {
    const twelve: GallerySession[] = Array.from({ length: 12 }, (_, i) => ({
      sessionId: `session_${i}`,
      prompt: `Project ${i + 1}`,
      categories: ['demo'],
    }))
    resetController(twelve)

    const { getByText } = render(<GalleryPage />)
    expect(getByText('12 previews')).not.toBeNull()
  })

  it('7. back navigation button is present and links to "/"', () => {
    const { container } = render(<GalleryPage />)

    const backLink = container.querySelector(
      'a[aria-label="Back to home"]',
    ) as HTMLAnchorElement
    expect(backLink).not.toBeNull()
    expect(backLink.getAttribute('href')).toBe('/')
  })
})

/* -------------------------------------------------------------------------- */
/* 8-16. PublicGallery edge cases                                             */
/* -------------------------------------------------------------------------- */

describe('PublicGallery edge cases', () => {
  beforeEach(() => {
    galleryMocks.deleteMine.mockReset()
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('8. card carries hover-styled classes (hover affordance)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'hover-session',
          prompt: 'Hoverable project',
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    const card = getByText('Hoverable project').closest(
      'a',
    ) as HTMLAnchorElement

    expect(card).not.toBeNull()
    expect(card.className).toContain('hover:border-cyan-200/50')
    expect(card.className).toContain('hover:bg-white/[0.075]')
    expect(card.getAttribute('data-gallery-session-id')).toBe('hover-session')
  })

  it('9. clicking a card navigates to the session route', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'nav-target-session',
          prompt: 'Navigable project',
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    const card = getByText('Navigable project').closest(
      'a',
    ) as HTMLAnchorElement

    expect(card.getAttribute('href')).toBe('/generate/nav-target-session')
  })

  it('10. own session: hovering + pressing D removes the card (delete hint works)', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-own')
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })

    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'own_session',
          prompt: 'Own project',
        },
      ],
      total: 1,
    }

    const { getByText, queryByText } = render(<GalleryGrid gallery={gallery} />)
    await act(async () => {
      await Promise.resolve()
    })
    const card = getByText('Own project').closest('a') as HTMLAnchorElement

    card.dispatchEvent(
      new window.Event('pointerover', { bubbles: true, cancelable: true }),
    )
    fireEvent.keyDown(window, { key: 'd' })

    await waitFor(() => {
      expect(galleryMocks.deleteMine).toHaveBeenCalledWith({
        anonymousClientId: 'anon-own',
        sessionId: 'own_session',
      })
    })
    await waitFor(() => {
      expect(queryByText('Own project')).toBeNull()
    })
  })

  it('11. non-own session: deleteMine returns deleted:0 → card stays (no delete hint)', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-other')
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 0 })

    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'other_session',
          prompt: 'Someone else project',
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    await act(async () => {
      await Promise.resolve()
    })
    const card = getByText('Someone else project').closest(
      'a',
    ) as HTMLAnchorElement

    card.dispatchEvent(
      new window.Event('pointerover', { bubbles: true, cancelable: true }),
    )
    fireEvent.keyDown(window, { key: 'd' })

    await waitFor(() => {
      expect(galleryMocks.deleteMine).toHaveBeenCalledWith({
        anonymousClientId: 'anon-other',
        sessionId: 'other_session',
      })
    })
    expect(getByText('Someone else project')).not.toBeNull()
  })

  it('14. multiple categories: ALL categories are shown (not sliced to 2)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'multi-cat',
          prompt: 'Multi category project',
          categories: ['alpha', 'beta', 'gamma', 'delta'],
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)

    expect(getByText('alpha')).not.toBeNull()
    expect(getByText('beta')).not.toBeNull()
    expect(getByText('gamma')).not.toBeNull()
    expect(getByText('delta')).not.toBeNull()
  })

  it('15. long prompt is rendered with line-clamp ellipsis styling', () => {
    const longPrompt =
      'A very long project description that should be truncated with an ellipsis after two lines of text in the gallery card body'
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'long-prompt',
          prompt: longPrompt,
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    const promptEl = getByText(longPrompt)
    expect(promptEl.className).toContain('line-clamp-2')
  })

  it('16. generation time formatting: 4.2s, 1m 5s, 1h 0m (expected with hours unit)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        { sessionId: 't1', prompt: 'Fast', elapsed: 4200 },
        {
          sessionId: 't2',
          prompt: 'Medium',
          elapsed: 65000,
        },
        {
          sessionId: 't3',
          prompt: 'Long',
          elapsed: 3600000,
        },
      ],
      total: 3,
    }

    const { getByLabelText } = render(<GalleryGrid gallery={gallery} />)

    expect(getByLabelText('Generated in 4.2s')).not.toBeNull()
    expect(getByLabelText('Generated in 1m 5s')).not.toBeNull()
    expect(getByLabelText('Generated in 1h 0m')).not.toBeNull()
  })
})
