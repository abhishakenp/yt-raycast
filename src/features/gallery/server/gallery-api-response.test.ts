import { describe, expect, it } from 'vitest'

import {
  createGalleryApiResponse,
  parseGalleryPagination,
} from './gallery-api-response'

describe('Gallery API Response', () => {
  describe('parseGalleryPagination', () => {
    it('should use default values when no query provided', () => {
      const result = parseGalleryPagination({})
      expect(result.limit).toBe(12)
      expect(result.page).toBe(1)
    })

    it('should use default when limit is 0', () => {
      const result = parseGalleryPagination({ limit: '0' })
      expect(result.limit).toBe(12)
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

  describe('createGalleryApiResponse', () => {
    it('should forward pagination and filters to the public sessions query', async () => {
      const mockClient = {
        query: async () => ({
          items: [],
          page: 1,
          limit: 18,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          availableCategories: [],
        }),
      }
      const request = new Request(
        'http://localhost/api/gallery?page=2&limit=18&search=analytics&category=saas',
      )

      const response = await createGalleryApiResponse(request, mockClient)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toContain(
        'stale-while-revalidate',
      )
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('limit')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('totalPages')
      expect(data).toHaveProperty('hasNext')
      expect(data).toHaveProperty('hasPrev')
    })

    it('should accept query as a search alias for recent-session compatibility', async () => {
      const mockClient = {
        query: async () => ({
          items: [],
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          availableCategories: [],
        }),
      }
      const request = new Request(
        'http://localhost/api/sessions/recent?query=portfolio',
      )

      const response = await createGalleryApiResponse(request, mockClient)

      expect(response.status).toBe(200)
    })

    it('should return an empty gallery response when the gallery query fails', async () => {
      const mockClient = {
        query: async () => {
          throw new Error('Convex error')
        },
      }
      const request = new Request('http://localhost/api/gallery')

      const response = await createGalleryApiResponse(request, mockClient)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toContain(
        'stale-while-revalidate',
      )
      expect(data).toEqual({
        items: [],
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        availableCategories: [],
      })
    })

    it('does not expose real renderer-error preview markup in public gallery JSON', async () => {
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['saas', 'commerce', 'portfolio', 'app'],
              elapsed: 123,
              html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
              preferredLanguage: 'en',
              previewVersion: 1,
              prompt:
                'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
              sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
            },
          ],
          limit: 12,
          page: 1,
          total: 1,
          totalPages: 1,
        }),
      }
      const request = new Request('http://localhost/api/gallery')

      const response = await createGalleryApiResponse(request, mockClient)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toEqual([])
      expect(data.total).toBe(0)
      expect(data.totalPages).toBe(1)
      expect(JSON.stringify(data).toLowerCase()).not.toContain('openui-error')
      expect(JSON.stringify(data).toLowerCase()).not.toContain(
        'failed to render',
      )
    })

    it('should handle page parameter', async () => {
      const mockClient = {
        query: async (_fn: any, args: any) => {
          expect(args.page).toBe(2)
          return {
            items: [],
            page: 2,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            availableCategories: [],
          }
        },
      }
      const request = new Request('http://localhost/api/gallery?page=2')

      const response = await createGalleryApiResponse(request, mockClient)
      expect(response.status).toBe(200)
    })

    it('should handle limit parameter', async () => {
      const mockClient = {
        query: async (_fn: any, args: any) => {
          expect(args.limit).toBe(6)
          return {
            items: [],
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            availableCategories: [],
          }
        },
      }
      const request = new Request('http://localhost/api/gallery?limit=6')

      const response = await createGalleryApiResponse(request, mockClient)
      expect(response.status).toBe(200)
    })

    it('should handle search parameter', async () => {
      const mockClient = {
        query: async (_fn: any, args: any) => {
          expect(args.search).toBe('analytics')
          return {
            items: [],
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            availableCategories: [],
          }
        },
      }
      const request = new Request(
        'http://localhost/api/gallery?search=analytics',
      )

      const response = await createGalleryApiResponse(request, mockClient)
      expect(response.status).toBe(200)
    })

    it('should handle category parameter', async () => {
      const mockClient = {
        query: async (_fn: any, args: any) => {
          expect(args.category).toBe('saas')
          return {
            items: [],
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            availableCategories: [],
          }
        },
      }
      const request = new Request('http://localhost/api/gallery?category=saas')

      const response = await createGalleryApiResponse(request, mockClient)
      expect(response.status).toBe(200)
    })
  })
})
