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

    it('renders DB-observed OpenUI source into static gallery HTML instead of dropping or forwarding handoff markup', async () => {
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['service'],
              elapsed: 6424,
              html: '<!DOCTYPE html><html lang="en"><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Craft Beer Brewery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_menu = RestaurantMenu(\\"Our Brew Selection\\")"</script></body></html>',
              moduleSource:
                'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})',
              preferredLanguage: 'lt',
              previewVersion: 1,
              prompt:
                'a craft beer brewery with taproom tours and seasonal releases in portland',
              readiness: {
                homepageReady: null,
                openuiReady: true,
                previewReady: true,
                siteSpecReady: null,
              },
              sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
              siteSpecJson: JSON.stringify({
                brand: 'Craft Beer Brewery',
                projectName: 'Craft Beer Brewery',
                theme: 'darkmatter',
                locale: 'lt',
              }),
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
      expect(data.items).toHaveLength(1)
      expect(data.total).toBe(1)
      expect(data.totalPages).toBe(1)
      expect(data.items[0].sessionId).toBe('k574ms14ma9f94keq30r7dq24x89n1k2')
      expect(data.items[0].html).toContain('data-sf-export-page')
      expect(data.items[0].html).toContain('Our Brew Selection')
      expect(data.items[0].html).toContain('Pineapple Saison')
      expect(data.items[0].html).toContain('color-scheme: dark')
      expect(data.items[0].html).toContain('"themeName":"darkmatter"')
      expect(data.items[0].html).not.toContain(
        'Generated OpenUI source is ready',
      )
      expect(data.items[0].html).not.toContain('ship-fast-openui-source')
      expect('moduleSource' in data.items[0]).toBe(false)
      expect(JSON.stringify(data.items[0])).not.toContain('RestaurantMenu("')
    })

    it('renders edited OpenUI source as static gallery HTML instead of reusing a PNG thumbnail or stale preview HTML', async () => {
      const stalePreviewHtml =
        '<main><h1>Craft Beer Brewery</h1><img alt="gallery screenshot" src="https://cdn.example.test/stale-preview.png"></main>'
      const editedOpenUiSource =
        'home_menu = RestaurantMenu("Edited Taproom Releases", "Lithuanian-ready seasonal beer list.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})'
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['service'],
              elapsed: 6424,
              html: stalePreviewHtml,
              imageUrl: 'https://cdn.example.test/k574-gallery.png',
              moduleSource: editedOpenUiSource,
              preferredLanguage: 'lt',
              previewVersion: 1,
              prompt:
                'a craft beer brewery with taproom tours and seasonal releases in portland',
              readiness: {
                homepageReady: null,
                openuiReady: true,
                previewReady: true,
                siteSpecReady: null,
              },
              sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
              siteSpecJson: JSON.stringify({
                brand: 'Craft Beer Brewery',
                projectName: 'Craft Beer Brewery',
              }),
              themeMode: 'dark',
              themeOverride: 'darkmatter',
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
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(data.items).toHaveLength(1)
      const renderedHtml = data.items[0].html as string
      expect(renderedHtml.includes('data-sf-export-page')).toBe(true)
      expect(renderedHtml.includes('lang="lt"')).toBe(true)
      expect(renderedHtml.includes('color-scheme: dark')).toBe(true)
      expect(renderedHtml.includes('"themeName":"darkmatter"')).toBe(true)
      expect(renderedHtml.includes('Edited Taproom Releases')).toBe(true)
      expect(renderedHtml.includes('Pineapple Saison')).toBe(true)
      expect(renderedHtml.includes('Craft Beer Brewery</h1>')).toBe(false)
      expect(renderedHtml.includes('stale-preview.png')).toBe(false)
      expect(renderedHtml.includes('k574-gallery.png')).toBe(false)
      expect('imageUrl' in data.items[0]).toBe(false)
      expect('moduleSource' in data.items[0]).toBe(false)
      expect(JSON.stringify(data.items[0])).not.toContain('k574-gallery.png')
      expect(JSON.stringify(data.items[0])).not.toContain(
        'Edited Taproom Releases",',
      )
    })

    it('renders DB-observed translated OpenUI source as static gallery HTML instead of a PNG preview', async () => {
      const translatedOpenUiSource =
        'home_navbar = GovernmentPortalNavbar("Gov Hindi", "भारत सरकार", "सभी नागरिकों की सेवा में", "भारत राजधानी, नई दिल्ली", ["Home","Contact","Events","About","Services"], "/")\nhome_services = GovernmentPortalServices("हमारी प्रमुख सेवाएँ", [{"title":"डिजिटल पहचान प्रमाणन","href":"/services/digital-id"}])\nroot = PageSwitch(["Home"], [home_services], "", {"Home":"Home"})'
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['government'],
              elapsed: 8654,
              html: '',
              imageUrl: 'https://cdn.example.test/hindi-gov-preview.png',
              moduleSource: translatedOpenUiSource,
              preferredLanguage: 'hi',
              previewVersion: 1,
              prompt: 'gov site in hindi',
              readiness: {
                homepageReady: null,
                openuiReady: true,
                previewReady: true,
                siteSpecReady: null,
              },
              sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
              siteSpecJson: JSON.stringify({
                brand: 'Gov Hindi',
                projectName: 'Gov Hindi',
              }),
              themeMode: 'light',
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
      expect(data.items).toHaveLength(1)
      const renderedHtml = data.items[0].html as string
      expect(renderedHtml.includes('data-sf-export-page')).toBe(true)
      expect(renderedHtml.includes('lang="hi"')).toBe(true)
      expect(renderedHtml.includes('हमारी प्रमुख सेवाएँ')).toBe(true)
      expect(renderedHtml.includes('डिजिटल पहचान प्रमाणन')).toBe(true)
      expect(renderedHtml.includes('hindi-gov-preview.png')).toBe(false)
      expect('imageUrl' in data.items[0]).toBe(false)
      expect('moduleSource' in data.items[0]).toBe(false)
      expect(JSON.stringify(data.items[0])).not.toContain(
        'hindi-gov-preview.png',
      )
      expect(JSON.stringify(data.items[0])).not.toContain(
        'GovernmentPortalServices("',
      )
    })

    it('drops malformed public session rows before serializing gallery JSON', async () => {
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            null,
            { prompt: 'Missing session id', previewVersion: 1 },
            {
              categories: { primary: 'saas' },
              elapsed: Number.NaN,
              html: '<main><h1>Valid preview</h1></main>',
              previewVersion: 2,
              prompt: 'Valid public project',
              sessionId: 'valid_public_project',
            },
          ],
          limit: 12,
          page: 1,
          total: 3,
          totalPages: 1,
        }),
      }
      const request = new Request('http://localhost/api/gallery')

      const response = await createGalleryApiResponse(request, mockClient)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.items[0]).toMatchObject({
        prompt: 'Valid public project',
        sessionId: 'valid_public_project',
      })
      expect(Array.isArray(data.items[0].categories)).toBe(true)
      expect(JSON.stringify(data)).not.toContain('Missing session id')
      expect(data.total).toBe(1)
      expect(data.totalPages).toBe(1)
      expect(data.hasNext).toBe(false)
      expect(data.hasPrev).toBe(false)
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
