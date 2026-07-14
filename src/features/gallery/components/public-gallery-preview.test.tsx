// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }) => {
    const anchorProps = { ...props }
    delete anchorProps.params

    return (
      <a href={to} {...anchorProps}>
        {children}
      </a>
    )
  },
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ deleted: 1 }),
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
