// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const galleryMocks = vi.hoisted(() => ({
  deleteMine: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    ...props
  }: {
    children: ReactNode
    [key: string]: unknown
  }) => {
    const anchorProps = { ...props }
    delete anchorProps.params
    delete anchorProps.to

    return (
      <a href="/generate/test" {...anchorProps}>
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
    },
  },
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'

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

describe('GalleryGrid', () => {
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

  it('shows skeleton cards only before gallery data resolves', () => {
    const { container } = render(<GalleryGrid skeletonCount={3} />)

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      3,
    )
  })

  it('renders an empty grid without skeleton cards after an empty gallery response', () => {
    const { container } = render(
      <GalleryGrid gallery={emptyGallery} skeletonCount={3} />,
    )

    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      0,
    )
  })

  it('uses generated gallery thumbnails only when no preview content is available', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'thumbnail-session',
          prompt: 'AI image studio',
          imageUrl: 'https://cdn.example.test/generated-theme.png',
          previewVersion: 1,
        },
      ],
      total: 1,
    }

    const { container, queryByTestId } = render(
      <GalleryGrid gallery={gallery} />,
    )

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example.test/generated-theme.png',
    )
    expect(queryByTestId('generated-module-preview')).toBeNull()
    expect(container.querySelector('h1')).toBeNull()
  })

  it('renders stored generated HTML without waiting for thumbnail failure', () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('svg'))
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
    expect(container.querySelector('h1')?.textContent).toBe(
      'Rendered product preview',
    )
    expect(container.querySelector('img')).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
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

  it('renders generated module source over stored placeholder HTML without thumbnail fallback', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('svg'))
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

    const { container, getByTestId } = render(<GalleryGrid gallery={gallery} />)

    await waitFor(() => {
      expect(getByTestId('generated-module-preview').textContent).toContain(
        'LumenAI Studio',
      )
    })
    expect(container.querySelector('h1')?.textContent).not.toBe(
      'Generated OpenUI source is ready.',
    )
    expect(container.querySelector('img')).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
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
