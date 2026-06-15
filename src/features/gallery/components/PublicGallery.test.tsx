// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => (
    <a href="/generate/test">{children}</a>
  ),
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

describe('GalleryGrid', () => {
  afterEach(() => {
    cleanup()
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

  it('renders stored generated HTML as the gallery card preview', () => {
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
  })
})
