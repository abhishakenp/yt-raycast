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

import type { GalleryPayload, GallerySession } from './PublicGallery'

const galleryMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    onPointerEnter,
    onPointerLeave,
    preload: _preload,
    ...props
  }: {
    children: ReactNode
    onPointerEnter?: PointerEventHandler<HTMLAnchorElement>
    onPointerLeave?: PointerEventHandler<HTMLAnchorElement>
    preload?: false | 'intent'
    [key: string]: unknown
  }) => {
    const anchorProps = { ...props }
    delete anchorProps.params
    delete anchorProps.to
    return (
      <a
        href="/generate/test"
        {...anchorProps}
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
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      deleteMine: 'sessions.deleteMine',
      listPublicSessions: 'sessions.listPublicSessions',
    },
  },
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

const controllerState = {
  loading: false,
  sessions: [] as GallerySession[],
}

vi.mock('../hooks/useGalleryController', () => ({
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

    const categoryCounts = new Map<string, number>()
    for (const session of controllerState.sessions) {
      for (const c of session.categories ?? []) {
        categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1)
      }
    }
    const availableCategories = Array.from(categoryCounts.entries()).map(
      ([value, count]) => ({ value, label: value, count }),
    )

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

import { GalleryPage } from './GalleryPage'
import { HomeGallerySection } from './PublicGallery'

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

let originalFetch: typeof globalThis.fetch

const resetController = (sessions: GallerySession[] = baseSessions) => {
  controllerState.loading = false
  controllerState.sessions = sessions
}

describe('GalleryPage behavioral', () => {
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

  it('search input filters gallery items', () => {
    const { getByPlaceholderText, queryByText, getByText } = render(
      <GalleryPage />,
    )

    expect(getByText('AI image studio')).not.toBeNull()
    expect(getByText('Crypto dashboard')).not.toBeNull()
    expect(getByText('Blog about dogs')).not.toBeNull()

    const input = getByPlaceholderText(
      'Search prompts, categories, sessions...',
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'crypto' } })

    expect(queryByText('AI image studio')).toBeNull()
    expect(getByText('Crypto dashboard')).not.toBeNull()
    expect(queryByText('Blog about dogs')).toBeNull()
  })

  it('category tab click switches active category', () => {
    const { container } = render(<GalleryPage />)

    const tabsContainer = container.querySelector(
      '[aria-label="Gallery categories"]',
    ) as HTMLElement
    const tabs = Array.from(tabsContainer.querySelectorAll('button'))
    const allTab = tabs.find(
      (b) => b.textContent === 'All',
    ) as HTMLButtonElement
    const financeTab = tabs.find(
      (b) => b.textContent === 'finance',
    ) as HTMLButtonElement

    expect(allTab.className).toContain('bg-cyan-300/12')
    expect(financeTab.className).not.toContain('bg-cyan-300/12')

    fireEvent.click(financeTab)

    expect(financeTab.className).toContain('bg-cyan-300/12')
    expect(allTab.className).not.toContain('bg-cyan-300/12')
  })

  it('pagination prev button is disabled on page 1 and next disabled on last page', () => {
    resetController([baseSessions[0]])
    const { container } = render(<GalleryPage />)

    const nav = container.querySelector(
      'nav[aria-label="Gallery pages"]',
    ) as HTMLElement
    expect(nav).not.toBeNull()
    const buttons = nav.querySelectorAll('button')
    const prevButton = buttons[0] as HTMLButtonElement
    const nextButton = buttons[1] as HTMLButtonElement
    expect(prevButton.disabled).toBe(true)
    expect(nextButton.disabled).toBe(true)
  })

  it('clicking next advances page and prev returns', () => {
    // 14 sessions -> 2 pages of 12
    const many: GallerySession[] = Array.from({ length: 14 }, (_, i) => ({
      sessionId: `session_${i}`,
      prompt: `Project ${i}`,
      categories: ['demo'],
      elapsed: 1000,
      previewVersion: 1,
    }))
    resetController(many)

    const { container } = render(<GalleryPage />)
    const nav = container.querySelector(
      'nav[aria-label="Gallery pages"]',
    ) as HTMLElement
    const buttons = nav.querySelectorAll('button')
    const prevButton = buttons[0] as HTMLButtonElement
    const nextButton = buttons[1] as HTMLButtonElement

    expect(prevButton.disabled).toBe(true)
    expect(nextButton.disabled).toBe(false)

    fireEvent.click(nextButton)

    expect(prevButton.disabled).toBe(false)
    expect(nextButton.disabled).toBe(true)
    expect(nav.querySelector('p')?.textContent).toContain('Page 2 of 2')

    fireEvent.click(prevButton)

    expect(prevButton.disabled).toBe(true)
    expect(nextButton.disabled).toBe(false)
    expect(nav.querySelector('p')?.textContent).toContain('Page 1 of 2')
  })

  it('gallery cards show session metadata (prompt, categories, generation time)', () => {
    const { getByText, getByLabelText, container } = render(<GalleryPage />)

    const grid = container.querySelector('.sf-gallery-grid') as HTMLElement

    expect(getByText('AI image studio')).not.toBeNull()
    expect(grid.textContent).toContain('ai')
    expect(grid.textContent).toContain('design')
    // 4200ms -> "4.2s"
    expect(getByLabelText('Generated in 4.2s')).not.toBeNull()
    // 8800ms -> "8.8s"
    expect(getByLabelText('Generated in 8.8s')).not.toBeNull()
    // 65000ms -> "1m 5s"
    expect(getByLabelText('Generated in 1m 5s')).not.toBeNull()
  })

  it('skeleton loading state shows before data resolves and disappears after', () => {
    controllerState.loading = true
    const { container, rerender } = render(<GalleryPage />)

    const grid = container.querySelector('.sf-gallery-grid') as HTMLElement
    expect(grid).not.toBeNull()
    // skeleton cards use animate-pulse
    expect(grid.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    controllerState.loading = false
    rerender(<GalleryPage />)

    const gridAfter = container.querySelector('.sf-gallery-grid') as HTMLElement
    expect(gridAfter).not.toBeNull()
    expect(gridAfter.querySelectorAll('.animate-pulse').length).toBe(0)
    expect(gridAfter.querySelectorAll('[data-gallery-session-id]').length).toBe(
      3,
    )
  })

  it('empty state shows when no results', () => {
    resetController([])
    const { container, getByText } = render(<GalleryPage />)

    const grid = container.querySelector('.sf-gallery-grid') as HTMLElement
    expect(grid).not.toBeNull()
    expect(grid.querySelector('[data-gallery-session-id]')).toBeNull()
    expect(grid.querySelectorAll('.animate-pulse').length).toBe(0)
    // observable count text reflects zero previews
    expect(getByText('0 previews')).not.toBeNull()
  })

  it('delete key (D) on own hovered session triggers deleteMine mutation', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-gallery')
    const { getByText, queryByText } = render(<GalleryPage />)
    await act(async () => {
      await Promise.resolve()
    })

    const hoveredCard = getByText('AI image studio').closest('a')
    expect(hoveredCard).not.toBeNull()

    hoveredCard?.dispatchEvent(
      new window.Event('pointerover', { bubbles: true, cancelable: true }),
    )
    fireEvent.keyDown(window, { key: 'd' })

    await waitFor(() => {
      expect(galleryMocks.deleteMine).toHaveBeenCalledWith({
        anonymousClientId: 'anon-gallery',
        sessionId: 'session_ai_studio',
      })
    })
    await waitFor(() => {
      expect(queryByText('AI image studio')).toBeNull()
    })
  })

  it('missing static HTML shows gradient placeholder without fetching a PNG thumbnail', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    resetController([
      {
        sessionId: 'thumb_fail_session',
        prompt: 'Gradient fallback project',
        previewVersion: 1,
      },
    ])

    const { container, getByText } = render(<GalleryPage />)

    expect(getByText('Gradient fallback project')).not.toBeNull()

    await Promise.resolve()

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(container.querySelector('img')).toBeNull()
    const placeholder = container.querySelector(
      '[aria-hidden="true"] [aria-label="Gradient fallback project"]',
    )
    expect(placeholder).not.toBeNull()
    expect(placeholder?.className).toContain('radial-gradient')
  })

  it('"View all" link is present on the home gallery section', () => {
    controllerState.loading = false
    controllerState.sessions = baseSessions
    const { getByText } = render(<HomeGallerySection />)

    const viewAll = getByText('View all')
    expect(viewAll.closest('a')).not.toBeNull()
  })
})
