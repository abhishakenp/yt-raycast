// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const galleryMocks = {
  deleteMine: vi.fn(),
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    params,
    preload,
    to,
    ...props
  }: {
    children: ReactNode
    params?: { sessionId?: string }
    preload?: false | 'intent'
    to: string
    [key: string]: unknown
  }) => {
    const anchorProps = { ...props }
    const href =
      to === '/generate/$sessionId' && params?.sessionId
        ? `/generate/${params.sessionId}`
        : to

    return (
      <a href={href} data-preload={String(preload)} {...anchorProps}>
        {children}
      </a>
    )
  },
}))

vi.mock('@/features/gallery/services/delete-gallery-session', () => ({
  deleteGallerySession: galleryMocks.deleteMine,
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'
import { useGalleryController } from '@/features/gallery/hooks/useGalleryController'

let originalFetch: typeof globalThis.fetch

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

const createMemoryStorage = (): Storage => {
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

const GalleryControllerProbe = ({ search }: { search: string }) => {
  const { gallery } = useGalleryController({ search })
  return <span data-testid="gallery-total">{gallery?.total ?? 'loading'}</span>
}

describe('GalleryGrid', () => {
  beforeEach(() => {
    ensureLocalStorage()
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
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const view = render(<GalleryGrid gallery={gallery} />)
    const card = view.getByRole('link', { name: 'Public project link' })

    expect(card.getAttribute('href')).toBe('/generate/session_public_link')
    expect(card.getAttribute('data-preload')).toBe('false')
    expect(card.getAttribute('data-gallery-session-id')).toBe(
      'session_public_link',
    )
    expect(galleryMocks.deleteMine).not.toHaveBeenCalled()
  })

  it('coalesces identical public gallery requests across duplicate consumers', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      total: 2,
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => gallery,
    })

    const { getAllByTestId } = render(
      <>
        <GalleryControllerProbe search="coalesced-public-gallery" />
        <GalleryControllerProbe search="coalesced-public-gallery" />
      </>,
    )

    await waitFor(() => {
      expect(
        getAllByTestId('gallery-total').map((node) => node.textContent),
      ).toEqual(['2', '2'])
    })
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/sessions/recent?limit=12&page=1&search=coalesced-public-gallery',
      { headers: { accept: 'application/json' } },
    )
  })

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

  it('prefers stored HTML over generated module source and thumbnail fetches', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'thumbnail-session',
          prompt: 'AI image studio',
          html: '<main><h1>Rendered product preview</h1></main>',
          moduleSource: '$page = "Home"\nroot = Hero("LumenAI Studio")',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe(
        'Rendered product preview',
      )
    })
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(container.querySelector('img')).toBeNull()
    expect(
      container.querySelector('[data-testid="generated-module-preview"]'),
    ).toBeNull()
  })

  it('keeps visual preview content out of the gallery card accessible name', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'accessible-session',
          prompt: 'AI image studio',
          html: '<main><h1>AI image studio</h1></main>',
          elapsed: 1200,
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container, getByRole } = render(<GalleryGrid gallery={gallery} />)

    await waitFor(() => {
      expect(
        getByRole('link', { name: 'AI image studio, generated in 1.2s' }),
      ).toBeTruthy()
    })
    expect(
      container.querySelector('[aria-hidden="true"] h1')?.textContent,
    ).toBe('AI image studio')
  })

  it('falls back to stored generated HTML when the thumbnail is unavailable', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'preview-session',
          prompt: 'AI image studio',
          html: '<main><h1>Rendered product preview</h1></main>',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      1,
    )
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe(
        'Rendered product preview',
      )
    })
    expect(container.querySelector('img')).toBeNull()
  })

  it('does not publish a real renderer-error HTML document as a public gallery preview', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
          prompt:
            'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
          categories: ['saas', 'commerce', 'portfolio', 'app'],
          elapsed: 123,
          html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
          preferredLanguage: 'en',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container, queryByText } = render(<GalleryGrid gallery={gallery} />)

    expect(queryByText(/failed to render/i)).toBeNull()
    expect(container.querySelector('.openui-error')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('prefers a gallery image URL over stored generated HTML', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'preview-with-image-session',
          prompt: 'AI image studio',
          imageUrl: 'https://cdn.example.test/generated-theme.png',
          html: '<main><h1>Rendered stock HTML preview</h1></main>',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example.test/generated-theme.png',
    )
    expect(container.querySelector('h1')).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('falls back to the generated thumbnail instead of rendering placeholder HTML or live modules', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'module-session',
          prompt: 'AI image studio',
          html: '<main><h1>Generated OpenUI source is ready.</h1></main>',
          moduleSource: '$page = "Home"\nroot = Hero("LumenAI Studio")',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/sessions/module-session/gallery-thumb?v=1',
      )
    })
    expect(container.querySelector('h1')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(
      container.querySelector('[data-testid="generated-module-preview"]'),
    ).toBeNull()
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
          previewVersion: 1,
        },
        {
          sessionId: 'session_kept',
          prompt: 'Kept project',
          previewVersion: 1,
        },
      ],
      total: 2,
    }

    const { getByText, queryByText } = render(<GalleryGrid gallery={gallery} />)
    const hoveredCard = getByText('Hovered project').closest('a')
    expect(hoveredCard).not.toBeNull()

    fireEvent.pointerEnter(hoveredCard as HTMLAnchorElement)
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
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    const { getByText } = render(<GalleryGrid gallery={gallery} />)
    const hoveredCard = getByText('Hovered project').closest('a')
    expect(hoveredCard).not.toBeNull()

    fireEvent.pointerEnter(hoveredCard as HTMLAnchorElement)
    fireEvent.keyDown(window, { key: 'd' })

    await Promise.resolve()
    expect(galleryMocks.deleteMine).not.toHaveBeenCalled()
  })
})
