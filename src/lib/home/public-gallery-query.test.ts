import { describe, expect, it } from 'vitest'

import { normalizeGalleryMeta } from './public-gallery-query'

describe('normalizeGalleryMeta', () => {
  it('derives next and previous availability from page counts', () => {
    expect(
      normalizeGalleryMeta({
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      }),
    ).toMatchObject({
      page: 1,
      totalPages: 3,
      hasPrev: false,
      hasNext: true,
    })
  })

  it('clamps out-of-range page values to the last available page', () => {
    expect(
      normalizeGalleryMeta({
        page: 99,
        limit: 12,
        total: 25,
        totalPages: 3,
      }),
    ).toMatchObject({
      page: 3,
      totalPages: 3,
      hasPrev: true,
      hasNext: false,
    })
  })
})
