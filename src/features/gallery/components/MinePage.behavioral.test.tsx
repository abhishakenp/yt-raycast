// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload, GallerySession } from './PublicGallery'

const ownedMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }) => {
    const anchorProps = { ...props }
    delete anchorProps.params
    delete anchorProps.to
    const href =
      props.to === '/mine'
        ? '/mine'
        : props.to === '/gallery'
          ? '/gallery'
          : props.to === '/'
            ? '/'
            : '/generate/test'
    return (
      <a href={href} {...anchorProps}>
        {children}
      </a>
    )
  },
}))

vi.mock('convex/react', () => ({
  useMutation: () => ownedMocks.deleteMine,
  useQuery: () => undefined,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      deleteMine: 'sessions.deleteMine',
      listOwnedSessions: 'sessions.listOwnedSessions',
      listPublicSessions: 'sessions.listPublicSessions',
    },
  },
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}))

vi.mock('../server/gallery-preview-server-fn', () => ({
  fetchGalleryPreviewHtml: vi.fn(async () => null),
}))

const controllerState = {
  loading: false,
  sessions: [] as GallerySession[],
}

vi.mock('../hooks/useGalleryController', () => ({
  useOwnedGalleryController: ({
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
  getOwnedAnonymousClientId: () => 'anon-mine-test',
  useGalleryController: () => ({ gallery: undefined, sessions: undefined }),
}))

import { MinePage } from './MinePage'

const baseSessions: GallerySession[] = [
  {
    sessionId: 'session_my_private',
    prompt: 'My private portfolio',
    categories: ['portfolio'],
    elapsed: 4200,
  },
  {
    sessionId: 'session_my_public',
    prompt: 'My public SaaS dashboard',
    categories: ['saas', 'dashboard'],
    elapsed: 8800,
  },
]

const realPrivatePetWellnessSessions: GallerySession[] = [
  {
    sessionId: 'k57cnvbhxynnmhap6dmp05grfx88r8wc',
    prompt:
      'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
    categories: ['app', 'health', 'services'],
    elapsed: 4200,
  },
  {
    sessionId: 'k5771j4djf89f2rh3nk1q3nkq588sdjp',
    prompt:
      'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
    categories: ['app', 'health', 'services'],
    elapsed: 3900,
  },
]

function resetController(sessions: GallerySession[] = baseSessions) {
  controllerState.loading = false
  controllerState.sessions = sessions
}

describe('MinePage behavioral', () => {
  beforeEach(() => {
    ownedMocks.deleteMine.mockReset()
    ownedMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
    resetController()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders the "My generations" header and a link to the public gallery', () => {
    const { getByText } = render(<MinePage />)

    expect(getByText('My generations')).not.toBeNull()
    expect(getByText('Public gallery')).not.toBeNull()
  })

  it('renders owned session cards including private ones', () => {
    const { getByText, container } = render(<MinePage />)

    expect(getByText('My private portfolio')).not.toBeNull()
    expect(getByText('My public SaaS dashboard')).not.toBeNull()
    expect(
      (container.querySelector('.sf-gallery-grid') as HTMLElement).textContent,
    ).toContain('portfolio')
  })

  it('renders real private pet wellness generations from Convex-owned data', () => {
    resetController(realPrivatePetWellnessSessions)

    const { getAllByText, getByText, container } = render(<MinePage />)

    expect(getByText('2 previews')).not.toBeNull()
    expect(
      getAllByText(
        'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
      ),
    ).toHaveLength(2)
    expect(container.textContent).toContain('health')
    expect(container.textContent).toContain('services')
  })

  it('filters real private Convex generations by prompt and category', () => {
    resetController(realPrivatePetWellnessSessions)

    const { getByPlaceholderText, getAllByText, getByText } = render(
      <MinePage />,
    )
    const input = getByPlaceholderText(
      'Search your prompts, categories, sessions...',
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'wellness' } })

    expect(getByText('2 previews')).not.toBeNull()
    expect(
      getAllByText(
        'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
      ),
    ).toHaveLength(2)

    fireEvent.change(input, { target: { value: 'restaurant' } })

    expect(getByText('0 previews')).not.toBeNull()
  })

  it('search input filters owned sessions', () => {
    const { getByPlaceholderText, queryByText, getByText } = render(
      <MinePage />,
    )

    const input = getByPlaceholderText(
      'Search your prompts, categories, sessions...',
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'private' } })

    expect(getByText('My private portfolio')).not.toBeNull()
    expect(queryByText('My public SaaS dashboard')).toBeNull()
  })

  it('shows empty state with a start-generating link when no sessions are owned', () => {
    resetController([])
    const { getByText, container } = render(<MinePage />)

    const grid = container.querySelector('.sf-gallery-grid') as HTMLElement
    expect(grid).not.toBeNull()
    expect(container.querySelector('.sf-gallery-empty')).not.toBeNull()
    expect(getByText('0 previews')).not.toBeNull()
    expect(getByText('Generate a site to fill this wall')).not.toBeNull()
    expect(getByText('Start generating')).not.toBeNull()
  })

  it('delete key (D) on hovered owned session triggers deleteMine mutation', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-mine-test')
    const { getByText, queryByText } = render(<MinePage />)

    const hoveredCard = getByText('My private portfolio').closest('a')
    expect(hoveredCard).not.toBeNull()

    fireEvent.pointerEnter(hoveredCard as HTMLAnchorElement)
    fireEvent.keyDown(window, { key: 'd' })

    await waitFor(() => {
      expect(ownedMocks.deleteMine).toHaveBeenCalledWith({
        anonymousClientId: 'anon-mine-test',
        sessionId: 'session_my_private',
      })
    })
    await waitFor(() => {
      expect(queryByText('My private portfolio')).toBeNull()
    })
  })
})
