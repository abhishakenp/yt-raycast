// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    params,
    preload,
    to,
    ...props
  }: {
    children?: React.ReactNode
    params?: { sessionId?: string }
    preload?: boolean
    to?: string
    [key: string]: unknown
  }) => {
    const href =
      to !== undefined && params?.sessionId !== undefined
        ? to.replace('$sessionId', encodeURIComponent(params.sessionId))
        : to

    void preload

    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ deleted: 1 }),
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'
import type { GallerySession } from './PublicGallery'

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

function sessionWith(overrides: Partial<GallerySession>): GallerySession {
  return {
    sessionId: 'preview-session',
    prompt: 'AI image studio',
    categories: ['ai', 'design'],
    elapsed: 4200,
    ...overrides,
  }
}

describe('public gallery preview cards', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders a card link pointing at the session generate route', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'session_link_target',
          prompt: 'Public project link',
        }),
      ],
      total: 1,
    }

    const { getByRole } = render(<GalleryGrid gallery={gallery} />)

    const card = getByRole('link', {
      name: 'Public project link, generated in 4.2s',
    })
    expect(card.getAttribute('href')).toBe('/generate/session_link_target')
    expect(card.getAttribute('data-gallery-session-id')).toBe(
      'session_link_target',
    )
  })

  it('renders the preview as a lazy server image instead of an iframe document', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'session_image_preview',
          prompt: 'Image preview project',
          updatedAt: 12345,
        }),
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image?.getAttribute('alt')).toBe('')
    expect(image?.getAttribute('src')).toBe(
      '/api/images/session_image_preview?v=12345',
    )
    expect(image?.getAttribute('loading')).toBe('lazy')
    expect(image?.getAttribute('decoding')).toBe('async')
    expect(image?.getAttribute('fetchpriority')).toBe('low')
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('updates the preview image url when session updatedAt changes', () => {
    const makeGallery = (updatedAt: number): GalleryPayload => ({
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'session_theme_changed',
          prompt: 'Theme changed project',
          updatedAt,
        }),
      ],
      total: 1,
    })

    const { container, rerender } = render(
      <GalleryGrid gallery={makeGallery(111)} />,
    )

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/api/images/session_theme_changed?v=111',
    )

    rerender(<GalleryGrid gallery={makeGallery(222)} />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/api/images/session_theme_changed?v=222',
    )
  })

  it('uses the prompt as the card accessible name', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'accessible-session',
          prompt: 'AI image studio',
          elapsed: 1200,
        }),
      ],
      total: 1,
    }

    const { getByRole } = render(<GalleryGrid gallery={gallery} />)

    expect(
      getByRole('link', { name: 'AI image studio, generated in 1.2s' }),
    ).toBeTruthy()
  })

  it('displays the prompt text on the card', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'prompt-session',
          prompt: 'Crypto dashboard',
        }),
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)

    expect(getByText('Crypto dashboard')).not.toBeNull()
  })

  it('renders category tags for sessions with categories', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'tagged-session',
          prompt: 'Tagged project',
          categories: ['saas', 'dashboard'],
        }),
      ],
      total: 1,
    }

    const { container, getByText } = render(<GalleryGrid gallery={gallery} />)

    expect(getByText('Tagged project')).not.toBeNull()
    expect(container.textContent).toContain('saas')
    expect(container.textContent).toContain('dashboard')
  })

  it('shows a default title when the prompt is missing', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'no-prompt-session',
          prompt: undefined,
        }),
      ],
      total: 1,
    }

    const { getByText } = render(<GalleryGrid gallery={gallery} />)

    expect(getByText('Generated website')).not.toBeNull()
  })

  it('renders multiple cards for multiple sessions', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'session_one',
          prompt: 'First project',
          categories: ['blog'],
        }),
        sessionWith({
          sessionId: 'session_two',
          prompt: 'Second project',
          categories: ['portfolio'],
        }),
      ],
      total: 2,
    }

    const { getByText, getAllByRole } = render(
      <GalleryGrid gallery={gallery} />,
    )

    expect(getByText('First project')).not.toBeNull()
    expect(getByText('Second project')).not.toBeNull()
    expect(getAllByRole('link').length).toBeGreaterThanOrEqual(2)
  })
})
