// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const galleryMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    onPointerEnter,
    onPointerLeave,
    params,
    preload,
    to,
    ...props
  }) => {
    const anchorProps = { ...props }
    const href =
      to === '/generate/$sessionId' && params?.sessionId
        ? `/generate/${params.sessionId}`
        : to

    return (
      <a
        href={href}
        data-preload={String(preload)}
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

vi.mock('@/features/gallery/hooks/useGalleryController', () => ({
  useGalleryController: () => ({ gallery: undefined, sessions: undefined }),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'

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

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key) => entries.delete(key),
    setItem: (key, value) => entries.set(key, value),
  }
}

const ensureLocalStorage = () => {
  if (window.localStorage !== undefined) return

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
}

describe('GalleryGrid', () => {
  beforeEach(() => {
    ensureLocalStorage()
    galleryMocks.deleteMine.mockReset()
    galleryMocks.deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('shows skeleton cards only before gallery data resolves', () => {
    const { container } = render(<GalleryGrid skeletonCount={3} />)

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      3,
    )
  })

  it('renders gallery card links without dashboard preloading or delete side effects', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'session_public_link',
          prompt: 'Public project link',
        },
      ],
      total: 1,
    }

    const view = render(<GalleryGrid gallery={gallery} />)
    const card = view.getByRole('link', { name: 'Open Public project link' })

    expect(card.getAttribute('href')).toBe('/generate/session_public_link')
    expect(card.getAttribute('data-preload')).toBe('false')
    expect(card.getAttribute('data-gallery-session-id')).toBe(
      'session_public_link',
    )
    expect(galleryMocks.deleteMine).not.toHaveBeenCalled()
  })

  it.each([
    [59_999, 'Generated in 1m'],
    [3_599_999, 'Generated in 1h 0m'],
  ])(
    'rolls %i milliseconds into a valid gallery duration label',
    (elapsed, expectedLabel) => {
      const gallery: GalleryPayload = {
        ...emptyGallery,
        items: [
          {
            elapsed,
            prompt: 'Release timing boundary',
            sessionId: `duration-${elapsed}`,
          },
        ],
        total: 1,
      }

      render(<GalleryGrid gallery={gallery} />)

      expect(
        document.querySelector(`[aria-label="${expectedLabel}"]`),
      ).not.toBeNull()
    },
  )

  it('renders a helpful empty state after an empty gallery response', () => {
    const { container, getByText } = render(
      <GalleryGrid gallery={emptyGallery} skeletonCount={3} />,
    )

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      1,
    )
    expect(container.querySelector('.sf-gallery-empty')).not.toBeNull()
    expect(getByText('No previews yet')).toBeTruthy()
    expect(getByText('Generate a site to fill this wall')).toBeTruthy()
    expect(getByText('Start from home')).toBeTruthy()
  })

  it('ignores malformed gallery rows instead of crashing the preview grid', () => {
    const gallery = {
      ...emptyGallery,
      items: [
        null,
        { prompt: 'Missing session id' },
        {
          categories: ['saas'],
          elapsed: 4200,
          prompt: 'Valid public project',
          sessionId: 'valid_public_project',
        },
      ],
      total: 3,
    } as unknown as GalleryPayload

    expect(() => render(<GalleryGrid gallery={gallery} />)).not.toThrow()
    expect(document.querySelectorAll('[data-gallery-session-id]')).toHaveLength(
      1,
    )
    expect(
      document.querySelector(
        '[data-gallery-session-id="valid_public_project"]',
      ),
    ).not.toBeNull()
    expect(document.body.textContent).not.toContain('Missing session id')
  })

  it('uses homepage-specific empty copy without linking back to the current page', () => {
    const { container, getByText, queryByText } = render(
      <GalleryGrid
        emptyStateVariant="home"
        gallery={emptyGallery}
        skeletonCount={3}
      />,
    )

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      1,
    )
    expect(container.querySelector('.sf-gallery-empty')).not.toBeNull()
    expect(getByText('No previews yet')).toBeTruthy()
    expect(getByText('Fresh launches will appear here')).toBeTruthy()
    expect(queryByText('Start from home')).toBeNull()
  })

  it('uses filter-specific empty copy when search or category filters have no results', () => {
    const { container, getByText, queryByText } = render(
      <GalleryGrid
        emptyStateVariant="filtered"
        gallery={emptyGallery}
        skeletonCount={3}
      />,
    )

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      1,
    )
    expect(container.querySelector('.sf-gallery-empty')).not.toBeNull()
    expect(getByText('No previews yet')).toBeTruthy()
    expect(getByText('No matching previews')).toBeTruthy()
    expect(
      getByText(
        'Try a different search or category, or start a fresh generation from the homepage.',
      ),
    ).toBeTruthy()
    expect(queryByText('Generate a site to fill this wall')).toBeNull()
  })

  it('keeps visual preview content out of the gallery card accessible name', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'accessible-session',
          prompt: 'AI image studio',
          elapsed: 1200,
        },
      ],
      total: 1,
    }

    const { getByRole } = render(<GalleryGrid gallery={gallery} />)

    expect(
      getByRole('link', { name: 'AI image studio, generated in 1.2s' }),
    ).toBeTruthy()
  })

  it('deletes the hovered gallery session when the physical D key is pressed', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-gallery')
    const laterKeyListener = vi.fn()
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'session_hovered',
          prompt: 'Hovered project',
        },
        {
          sessionId: 'session_kept',
          prompt: 'Kept project',
        },
      ],
      total: 2,
    }

    const { getByText, queryByText } = render(<GalleryGrid gallery={gallery} />)
    await act(async () => {
      await Promise.resolve()
    })
    const hoveredCard = getByText('Hovered project').closest('a')
    expect(hoveredCard).not.toBeNull()

    hoveredCard?.dispatchEvent(
      new window.Event('pointerover', { bubbles: true, cancelable: true }),
    )
    window.addEventListener('keydown', laterKeyListener)
    try {
      fireEvent.keyDown(window, { key: 'd' })

      await waitFor(() => {
        expect(galleryMocks.deleteMine).toHaveBeenCalledWith({
          anonymousClientId: 'anon-gallery',
          sessionId: 'session_hovered',
        })
      })
      await waitFor(() => {
        expect(queryByText('Hovered project')).toBeNull()
      })
      expect(laterKeyListener).not.toHaveBeenCalled()
      expect(queryByText('Kept project')).not.toBeNull()
    } finally {
      window.removeEventListener('keydown', laterKeyListener)
    }
  })

  it('does not delete a hovered gallery session while typing in an input', async () => {
    window.localStorage.setItem('ship-fast-anon-client-id', 'anon-gallery')
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'session_hovered',
          prompt: 'Hovered project',
        },
      ],
      total: 1,
    }

    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    await act(async () => {
      await Promise.resolve()
    })
    const hoveredCard = getByText('Hovered project').closest('a')
    expect(hoveredCard).not.toBeNull()

    hoveredCard?.dispatchEvent(
      new window.Event('pointerover', { bubbles: true, cancelable: true }),
    )
    fireEvent.keyDown(window, { key: 'd' })

    await Promise.resolve()
    expect(galleryMocks.deleteMine).not.toHaveBeenCalled()
  })
})
