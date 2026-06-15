// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

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
})
