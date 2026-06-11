import { describe, expect, it } from 'vitest'

import { parseGalleryPagination } from './gallery-api-response'

describe('Gallery Pagination', () => {
  describe('parseGalleryPagination', () => {
    it('should use default values when no query provided', () => {
      const result = parseGalleryPagination({})
      expect(result.limit).toBe(12)
      expect(result.page).toBe(1)
    })

    it('should clamp limit to minimum of 1', () => {
      const result = parseGalleryPagination({ limit: '0' })
      expect(result.limit).toBe(1)
    })

    it('should clamp limit to maximum of 24', () => {
      const result = parseGalleryPagination({ limit: '100' })
      expect(result.limit).toBe(24)
    })

    it('should clamp page to minimum of 1', () => {
      const result = parseGalleryPagination({ page: '0' })
      expect(result.page).toBe(1)
    })

    it('should handle invalid limit values', () => {
      const result = parseGalleryPagination({ limit: 'invalid' })
      expect(result.limit).toBe(12)
    })

    it('should handle invalid page values', () => {
      const result = parseGalleryPagination({ page: 'invalid' })
      expect(result.page).toBe(1)
    })

    it('should accept valid limit and page values', () => {
      const result = parseGalleryPagination({ limit: '18', page: '3' })
      expect(result.limit).toBe(18)
      expect(result.page).toBe(3)
    })
  })
})
