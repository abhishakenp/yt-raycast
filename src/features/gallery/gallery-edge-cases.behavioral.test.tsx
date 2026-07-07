// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import type { PointerEventHandler, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload, GallerySession } from './components/PublicGallery'

/* -------------------------------------------------------------------------- */
/* Hoisted mocks                                                              */
/* -------------------------------------------------------------------------- */

const galleryMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

/**
 * Link mock: render a real <a> with href derived from `to` + `params` so that
 * navigation targets (back button, card click) are observable in jsdom.
 */
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
    onPointerEnter?: PointerEventHandler<HTMLAnchorElement>
    onPointerLeave?: PointerEventHandler<HTMLAnchorElement>
    preload?: false | 'intent'
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
  ConvexProvider: ({ children }: { children: ReactNode }) => children,
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
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

/* -------------------------------------------------------------------------- */
/* GalleryPage controller mock (flexible, controllable from tests)           */
/* -------------------------------------------------------------------------- */

const controllerState = {
  loading: false,
  sessions: [] as GallerySession[],
  /** When set, replaces the derived availableCategories list. */
  categoriesOverride: undefined as
    | undefined
    | { value: string; label: string; count: number }[],
}

vi.mock('./hooks/useGalleryController', () => ({
  getGalleryThumbnailUrl: (session: GallerySession) =>
    `/api/sessions/${encodeURIComponent(session.sessionId)}/gallery-thumb?v=${encodeURIComponent(String(session.previewVersion ?? 0))}`,
  resolveGalleryThumbnail: async (thumbnailUrl: string) => {
    try {
      const response = await fetch(thumbnailUrl, {
        signal: new AbortController().signal,
      })
      if (!response.ok) return undefined
      return URL.createObjectURL(await response.blob())
    } catch {
      return undefined
    }
  },
  useGalleryController: ({
    category = '',
    limit = 12,
    page = 1,
    search = '',
  }: {
    category?: string
    limit?: number
    page?: number
    search?: string
  }) => {
    if (controllerState.loading) {
      return { gallery: undefined, sessions: undefined }
    }

    let items = controllerState.sessions
    if (search.trim().length > 0) {
      const needle = search.trim().toLowerCase()
      items = items.filter(
        (session: GallerySession) =>
          session.prompt?.toLowerCase().includes(needle) ||
          session.categories?.some((c) => c.toLowerCase().includes(needle)),
      )
    }
    if (category.trim().length > 0) {
      items = items.filter(
        (session: GallerySession) =>
          session.categories?.includes(category) ?? false,
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
import {
  createGalleryThumbnailResponse,
  formatGalleryCategory,
  generateDeterministicThumbnailSvg,
  getGalleryCategories,
} from './server/gallery-thumbnail-response'
import {
  createGalleryApiResponse,
  parseGalleryPagination,
} from './server/gallery-api-response'

/* -------------------------------------------------------------------------- */
/* Shared helpers / fixtures                                                  */
/* -------------------------------------------------------------------------- */

const baseSessions: GallerySession[] = [
  {
    sessionId: 'session_ai_studio',
    prompt: 'AI image studio',
    categories: ['ai', 'design'],
    elapsed: 4200,
    previewVersion: 1,
  },
  {
    sessionId: 'session_crypto_dashboard',
    prompt: 'Crypto dashboard',
    categories: ['finance', 'dashboard'],
    elapsed: 8800,
    previewVersion: 1,
  },
  {
    sessionId: 'session_blog_dogs',
    prompt: 'Blog about dogs',
    categories: ['blog'],
    elapsed: 65000,
    previewVersion: 1,
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

const resetController = (sessions: GallerySession[] = baseSessions) => {
  controllerState.loading = false
  controllerState.sessions = sessions
  controllerState.categoriesOverride = undefined
}

let originalFetch: typeof globalThis.fetch

/* -------------------------------------------------------------------------- */
/* 1-7. GalleryPage edge cases                                                */
/* -------------------------------------------------------------------------- */

describe('GalleryPage edge cases', () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error('thumbnail unavailable'))
    galleryMocks.deleteMine.mockReset()
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
    resetController()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    globalThis.fetch = originalFetch
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
    // Inject a tab whose category no session belongs to.
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
      previewVersion: 1,
    }))
    resetController(many)

    const { container, getByText, queryByText } = render(<GalleryPage />)

    const nav = container.querySelector(
      'nav[aria-label="Gallery pages"]',
    ) as HTMLElement
    const nextButton = nav.querySelectorAll('button')[1] as HTMLButtonElement

    // Page 1 shows items 1-12.
    expect(getByText('Project 1')).not.toBeNull()
    expect(getByText('Project 12')).not.toBeNull()
    expect(queryByText('Project 13')).toBeNull()

    fireEvent.click(nextButton)

    // Page 2 shows items 13-24.
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
      previewVersion: 1,
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
    originalFetch = globalThis.fetch
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error('thumbnail unavailable'))
    galleryMocks.deleteMine.mockReset()
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    globalThis.fetch = originalFetch
  })

  it('8. card carries hover-styled classes (hover affordance)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'hover-session',
          prompt: 'Hoverable project',
          previewVersion: 1,
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
          previewVersion: 1,
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
          previewVersion: 1,
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
          previewVersion: 1,
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
    // Card is not removed because the server reported no ownership/deletion.
    expect(getByText('Someone else project')).not.toBeNull()
  })

  it('12. preview priority: static html > generated fallback > gradient, never PNG imageUrl', () => {
    // EXPECTED: server-rendered static HTML is the preview source of truth.
    // If an image thumbnail or live generated source wins when final HTML exists,
    // the gallery can show stale screenshots or expensive live OpenUI previews.
    const allSources: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'all-sources',
          prompt: 'All sources project',
          html: '<main><h1>HTML preview</h1></main>',
          moduleSource: '$page = "Home"\nroot = Hero("Module")',
          imageUrl: 'https://cdn.example.test/img.png',
          previewVersion: 1,
        },
      ],
      total: 1,
    }
    const { queryByTestId, queryByText, rerender } = render(
      <GalleryGrid gallery={allSources} />,
    )
    // html must take priority -> static markup rendered, not image/module.
    expect(queryByText('HTML preview')).not.toBeNull()
    expect(document.querySelector('img')).toBeNull()
    expect(queryByTestId('generated-module-preview')).toBeNull()

    // html wins over moduleSource (no imageUrl).
    const moduleAndHtml: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'module-html',
          prompt: 'HTML over module',
          html: '<main><h1>HTML wins</h1></main>',
          moduleSource: '$page = "Home"\nroot = Hero("Module")',
          previewVersion: 1,
        },
      ],
      total: 1,
    }
    rerender(<GalleryGrid gallery={moduleAndHtml} />)
    expect(queryByText('HTML wins')).not.toBeNull()
    expect(queryByTestId('generated-module-preview')).toBeNull()

    // html wins when no imageUrl and no moduleSource.
    const htmlOnly: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'html-only',
          prompt: 'HTML only project',
          html: '<main><h1>HTML wins</h1></main>',
          previewVersion: 1,
        },
      ],
      total: 1,
    }
    rerender(<GalleryGrid gallery={htmlOnly} />)
    expect(queryByText('HTML wins')).not.toBeNull()
    expect(queryByTestId('generated-module-preview')).toBeNull()

    // imageUrl is not a valid gallery preview source; OpenUI previews must be
    // server-rendered to static HTML, otherwise the card falls through.
    const imageOnly: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'image-only',
          prompt: 'Image fallback project',
          imageUrl: 'https://cdn.example.test/img.png',
          previewVersion: 1,
        },
      ],
      total: 1,
    }
    rerender(<GalleryGrid gallery={imageOnly} />)
    expect(document.querySelector('img')).toBeNull()

    // nothing → gradient fallback placeholder.
    const none: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'none-session',
          prompt: 'Gradient fallback project',
          previewVersion: 1,
        },
      ],
      total: 1,
    }
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('no thumb'))
    rerender(<GalleryGrid gallery={none} />)
    const placeholder = document.querySelector(
      '[aria-hidden="true"] [aria-label="Gradient fallback project"]',
    )
    expect(placeholder).not.toBeNull()
    expect(placeholder?.className).toContain('radial-gradient')
  })

  it('13. missing server-rendered HTML uses the local fallback and never fetches a PNG thumbnail', async () => {
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:resolved-thumbnail')

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), {
        headers: { 'content-type': 'image/png' },
      }),
    )

    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'blob-session',
          prompt: 'Blob resolve project',
          previewVersion: 3,
        },
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    await Promise.resolve()

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(container.querySelector('img')).toBeNull()
    expect(
      container.querySelector(
        '[aria-hidden="true"] [aria-label="Blob resolve project"]',
      ),
    ).not.toBeNull()
    expect(
      container.querySelector(
        '[aria-hidden="true"] [aria-label="Blob resolve project"]',
      )?.className,
    ).toContain('radial-gradient')

    createObjectURLSpy.mockRestore()
  })

  it('14. multiple categories: ALL categories are shown (not sliced to 2)', () => {
    // EXPECTED: every category on a session is rendered.
    // If the component slices to 2, that is a BUG — this test must fail.
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'multi-cat',
          prompt: 'Multi category project',
          categories: ['alpha', 'beta', 'gamma', 'delta'],
          previewVersion: 1,
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
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    const promptEl = getByText(longPrompt)
    // line-clamp-2 is the CSS mechanism that produces the ellipsis.
    expect(promptEl.className).toContain('line-clamp-2')
  })

  it('16. generation time formatting: 4.2s, 1m 5s, 1h 0m (expected with hours unit)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        { sessionId: 't1', prompt: 'Fast', elapsed: 4200, previewVersion: 1 },
        {
          sessionId: 't2',
          prompt: 'Medium',
          elapsed: 65000,
          previewVersion: 1,
        },
        {
          sessionId: 't3',
          prompt: 'Long',
          elapsed: 3600000,
          previewVersion: 1,
        },
      ],
      total: 3,
    }

    const { getByLabelText } = render(<GalleryGrid gallery={gallery} />)

    // 4200ms → "4.2s"
    expect(getByLabelText('Generated in 4.2s')).not.toBeNull()
    // 65000ms → "1m 5s"
    expect(getByLabelText('Generated in 1m 5s')).not.toBeNull()
    // 3600000ms (1 hour) → EXPECTED "1h 0m". If code shows "60m", that is a BUG.
    expect(getByLabelText('Generated in 1h 0m')).not.toBeNull()
  })
})

/* -------------------------------------------------------------------------- */
/* 17-22. Thumbnail generation (real functions)                               */
/* -------------------------------------------------------------------------- */

describe('Thumbnail generation', () => {
  it('17. SVG generation: prompt → SVG with gradient + text', () => {
    const svg = generateDeterministicThumbnailSvg(
      'Build a modern SaaS app',
      ['saas'],
      'done',
    )

    expect(svg).toContain('<?xml version="1.0"')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('linearGradient')
    expect(svg).toContain('Build a modern')
  })

  it('18. gradient hashing: same prompt → same gradient colors (deterministic)', () => {
    const svg1 = generateDeterministicThumbnailSvg(
      'Hashed prompt',
      ['saas'],
      'done',
    )
    const svg2 = generateDeterministicThumbnailSvg(
      'Hashed prompt',
      ['saas'],
      'done',
    )

    expect(svg1).toBe(svg2)

    // Different prompt → different gradient hues.
    const svg3 = generateDeterministicThumbnailSvg(
      'Different prompt',
      ['saas'],
      'done',
    )
    expect(svg3).not.toBe(svg1)
  })

  it('19. category inference: AI dashboard → saas; online store → commerce; portfolio → portfolio', () => {
    expect(getGalleryCategories('AI dashboard for analytics')).toContain('saas')
    expect(getGalleryCategories('online store for products')).toContain(
      'commerce',
    )
    expect(getGalleryCategories('designer portfolio site')).toContain(
      'portfolio',
    )
  })

  it('20. metadata formatting: elapsed + cost are formatted into the SVG', async () => {
    const sid = `meta-session-${process.pid}-${Date.now()}`
    const mockClient = {
      query: async () => ({
        prompt: 'Metadata project',
        status: 'done',
        categories: ['saas'],
        elapsed: 4200, // → "4s" (rounded)
        cost: 0.01, // → "$0.0100" (4 decimals under $1)
        homepageReady: true,
        siteSpecReady: false,
        openuiReady: false,
      }),
    }

    const response = await createGalleryThumbnailResponse(
      sid,
      undefined,
      mockClient,
    )
    const svg = await response.text()

    expect(response.status).toBe(200)
    expect(svg).toContain('4s')
    expect(svg).toContain('$0.0100')
  })

  it('21. fallback SVG: browser chrome mock when no data is provided', () => {
    const svg = generateDeterministicThumbnailSvg('', [], undefined)

    // Browser chrome: traffic-light circles + address bar.
    expect(svg).toContain('<circle cx="30"')
    expect(svg).toContain('rgba(0,0,0,0.3)')
    // No prompt → default title.
    expect(svg).toContain('Generated website')
    // No status → "In Progress".
    expect(svg).toContain('In Progress')
  })

  it('22. XSS escaping: prompt with <script> is escaped in the SVG', () => {
    const svg = generateDeterministicThumbnailSvg(
      '<script>alert("xss")</script>',
      ['saas'],
      'done',
    )

    expect(svg).toContain('&lt;script&gt;')
    expect(svg).not.toContain('<script>')
  })

  it('formatGalleryCategory capitalizes single-word categories', () => {
    expect(formatGalleryCategory('saas')).toBe('Saas')
    expect(formatGalleryCategory('commerce')).toBe('Commerce')
  })
})

/* -------------------------------------------------------------------------- */
/* 28-32. Gallery API response (real functions)                               */
/* -------------------------------------------------------------------------- */

const emptyApiPayload = {
  items: [],
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  availableCategories: [],
}

describe('Gallery API response', () => {
  it('28. pagination parsing: limit=50 → 24; limit=0 → default 12; page=0 → 1', () => {
    expect(parseGalleryPagination({ limit: '50' }).limit).toBe(24)
    // EXPECTED: limit=0 (falsy/invalid) should fall back to the default (12),
    // NOT be clamped to the minimum (1). If code returns 1, that is a BUG.
    expect(parseGalleryPagination({ limit: '0' }).limit).toBe(12)
    expect(parseGalleryPagination({ page: '0' }).page).toBe(1)
  })

  it('29. search/query alias: "search=foo" and "query=foo" forward the same value', async () => {
    const captured: Array<{ search?: string; category?: string }> = []
    const mockClient = {
      query: async (
        _fn: unknown,
        args: { search?: string; category?: string },
      ) => {
        captured.push(args)
        return emptyApiPayload
      },
    }

    await createGalleryApiResponse(
      new Request('http://localhost/api/gallery?search=foo'),
      mockClient as unknown as Parameters<typeof createGalleryApiResponse>[1],
    )
    await createGalleryApiResponse(
      new Request('http://localhost/api/gallery?query=foo'),
      mockClient as unknown as Parameters<typeof createGalleryApiResponse>[1],
    )

    expect(captured[0].search).toBe('foo')
    expect(captured[1].search).toBe('foo')
  })

  it('30. category filter: category=saas is forwarded to the query', async () => {
    const mockClient = {
      query: async (_fn: unknown, args: { category?: string }) => {
        expect(args.category).toBe('saas')
        return {
          ...emptyApiPayload,
          items: [{ sessionId: 's1', categories: ['saas'] }],
        }
      },
    }

    const response = await createGalleryApiResponse(
      new Request('http://localhost/api/gallery?category=saas'),
      mockClient as unknown as Parameters<typeof createGalleryApiResponse>[1],
    )
    expect(response.status).toBe(200)
  })

  it('31. cache headers include max-age=20 + stale-while-revalidate', async () => {
    const mockClient = { query: async () => emptyApiPayload }
    const response = await createGalleryApiResponse(
      new Request('http://localhost/api/gallery'),
      mockClient,
    )

    const cacheControl = response.headers.get('cache-control') ?? ''
    expect(cacheControl).toContain('max-age=20')
    expect(cacheControl).toContain('stale-while-revalidate')
  })

  it('32. invalid params → 400; query failure → empty gallery fallback', async () => {
    // EXPECTED: invalid params (non-numeric limit/page) should return 400.
    // If the code silently clamps and returns 200, that is a BUG — this test must fail.
    const okClient = { query: async () => emptyApiPayload }

    const invalidResponse = await createGalleryApiResponse(
      new Request('http://localhost/api/gallery?limit=abc&page=-9'),
      okClient,
    )
    expect(invalidResponse.status).toBe(400)

    // Query failure degrades to an empty gallery payload so the deployed page
    // renders an empty state instead of crashing the route.
    const errorClient = {
      query: async () => {
        throw new Error('Convex unavailable')
      },
    }
    const errorResponse = await createGalleryApiResponse(
      new Request('http://localhost/api/gallery'),
      errorClient,
    )
    expect(errorResponse.status).toBe(200)
    const data = (await errorResponse.json()) as {
      items: unknown[]
      total: number
    }
    expect(data.items).toEqual([])
    expect(data.total).toBe(0)
  })
})
