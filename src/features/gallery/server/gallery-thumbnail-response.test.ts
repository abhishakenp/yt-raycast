import { describe, expect, it, vi } from 'vitest'

import {
  generateDeterministicThumbnailSvg,
  getGalleryCategories,
  formatGalleryCategory,
  createGalleryThumbnailResponse,
} from './gallery-thumbnail-response'

describe('Gallery Thumbnail Response', () => {
  describe('getGalleryCategories', () => {
    it('should extract SaaS categories from prompt', () => {
      const categories = getGalleryCategories(
        'Build a SaaS dashboard for analytics',
      )
      expect(categories).toContain('saas')
    })

    it('should extract commerce categories from prompt', () => {
      const categories = getGalleryCategories(
        'Create an ecommerce store for products',
      )
      expect(categories).toContain('commerce')
    })

    it('should extract portfolio categories from prompt', () => {
      const categories = getGalleryCategories(
        'Design a portfolio for a creative agency',
      )
      expect(categories).toContain('portfolio')
    })

    it('should extract blog categories from prompt', () => {
      const categories = getGalleryCategories('Build a blog for news stories')
      expect(categories).toContain('blog')
    })

    it('should extract service categories from prompt', () => {
      const categories = getGalleryCategories(
        'Create a booking site for a local gym',
      )
      expect(categories).toContain('service')
    })

    it('should extract app categories from prompt', () => {
      const categories = getGalleryCategories(
        'Build a mobile app for task management',
      )
      expect(categories).toContain('app')
    })

    it('should return empty array for generic prompts', () => {
      const categories = getGalleryCategories('Make a website')
      expect(categories).toEqual([])
    })

    it('should be case-insensitive', () => {
      const categories = getGalleryCategories('Build a SAAS platform')
      expect(categories).toContain('saas')
    })
  })

  describe('formatGalleryCategory', () => {
    it('should capitalize category name', () => {
      expect(formatGalleryCategory('saas')).toBe('Saas')
    })

    it('should handle hyphenated categories', () => {
      expect(formatGalleryCategory('e-commerce')).toBe('E Commerce')
    })

    it('should handle underscore-separated categories', () => {
      expect(formatGalleryCategory('content_management')).toBe(
        'Content Management',
      )
    })

    it('should handle space-separated categories', () => {
      expect(formatGalleryCategory('content management')).toBe(
        'Content Management',
      )
    })

    it('should handle single word categories', () => {
      expect(formatGalleryCategory('blog')).toBe('Blog')
    })
  })

  describe('generateDeterministicThumbnailSvg', () => {
    it('should generate valid SVG', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
      )
      expect(svg).toContain('<?xml version="1.0"')
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
    })

    it('should escape HTML in prompt', () => {
      const svg = generateDeterministicThumbnailSvg(
        '<script>alert("xss")</script>',
        ['saas'],
        'done',
      )
      expect(svg).toContain('&lt;script&gt;')
      expect(svg).not.toContain('<script>')
    })

    it('should include prompt title in SVG', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Build a modern SaaS dashboard',
        ['saas'],
        'done',
      )
      expect(svg).toContain('Build a modern')
    })

    it('should include category in SVG', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
      )
      expect(svg).toContain('Saas')
    })

    it('should include status in SVG', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
      )
      expect(svg).toContain('Ready')
    })

    it('should show "In Progress" for non-done status', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'streaming',
      )
      expect(svg).toContain('In Progress')
    })

    it('should generate deterministic colors based on prompt', () => {
      const svg1 = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
      )
      const svg2 = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
      )
      expect(svg1).toBe(svg2)
    })

    it('should generate different colors for different prompts', () => {
      const svg1 = generateDeterministicThumbnailSvg(
        'First prompt',
        ['saas'],
        'done',
      )
      const svg2 = generateDeterministicThumbnailSvg(
        'Second prompt',
        ['saas'],
        'done',
      )
      expect(svg1).not.toBe(svg2)
    })

    it('should handle empty prompt', () => {
      const svg = generateDeterministicThumbnailSvg('', [], 'done')
      expect(svg).toContain('Generated website')
    })

    it('should handle long prompts by truncating', () => {
      const longPrompt = 'a'.repeat(200)
      const svg = generateDeterministicThumbnailSvg(
        longPrompt,
        ['saas'],
        'done',
      )
      expect(svg).toContain('a'.repeat(80))
    })

    it('should handle null status', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        null,
      )
      expect(svg).toContain('In Progress')
    })

    it('should handle undefined status', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        undefined,
      )
      expect(svg).toContain('In Progress')
    })

    it('should include metadata label', () => {
      const svg = generateDeterministicThumbnailSvg(
        'Test prompt',
        ['saas'],
        'done',
        '15s | $0.05 | 2/4 ready',
      )
      expect(svg).toContain('15s')
      expect(svg).toContain('$0.05')
      expect(svg).toContain('2/4 ready')
    })
  })

  describe('createGalleryThumbnailResponse', () => {
    it('should return 404 for null session', async () => {
      const mockClient = {
        query: async () => null,
      }
      const response = await createGalleryThumbnailResponse(
        'fake-session-id',
        undefined,
        mockClient,
      )

      expect(response.status).toBe(404)
      expect(await response.text()).toBe('Session not found or not public')
    })

    it('should return SVG with proper content-type for valid session', async () => {
      const mockClient = {
        query: async () => ({
          prompt: 'Test prompt',
          status: 'done',
          categories: ['saas'],
          elapsed: 15000,
          cost: 0.05,
          homepageReady: true,
          siteSpecReady: true,
          openuiReady: false,
        }),
      }
      const response = await createGalleryThumbnailResponse(
        'valid-session-id',
        undefined,
        mockClient,
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'image/svg+xml; charset=utf-8',
      )
      expect(response.headers.get('cache-control')).toBe('public, max-age=10')

      const svg = await response.text()
      expect(svg).toContain('<?xml version="1.0"')
      expect(svg).toContain('<svg')
      expect(svg).toContain('Test prompt')
    })

    it('should escape prompt text in SVG', async () => {
      const mockClient = {
        query: async () => ({
          prompt: '<script>alert("xss")</script>',
          status: 'done',
          categories: [],
        }),
      }
      const response = await createGalleryThumbnailResponse(
        'valid-session-id',
        undefined,
        mockClient,
      )
      const svg = await response.text()

      expect(svg).toContain('&lt;script&gt;')
      expect(svg).not.toContain('<script>')
    })

    it('should include metadata in SVG', async () => {
      const mockClient = {
        query: async () => ({
          prompt: 'Test prompt',
          status: 'done',
          categories: ['saas'],
          elapsed: 15000,
          cost: 0.05,
          homepageReady: true,
          siteSpecReady: true,
          openuiReady: false,
        }),
      }
      const response = await createGalleryThumbnailResponse(
        'valid-session-id',
        undefined,
        mockClient,
      )
      const svg = await response.text()

      expect(svg).toContain('15s')
      expect(svg).toContain('$0.05')
    })

    it('should keep the SVG placeholder for explicit fallback thumbnail requests', async () => {
      const mockClient = {
        query: async () => ({
          prompt: 'Fallback prompt',
          status: 'done',
          categories: ['saas'],
          previewVersion: 2,
        }),
      }

      const response = await createGalleryThumbnailResponse(
        'valid-session-id',
        new Request(
          'http://localhost/api/sessions/valid-session-id/gallery-thumb?fallback=1',
        ),
        mockClient,
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'image/svg+xml; charset=utf-8',
      )
      expect(await response.text()).toContain('Fallback prompt')
    })

    it('does not generate a public thumbnail for a session whose preview was suppressed as renderer-error HTML', async () => {
      const mockClient = {
        query: async () => ({
          prompt:
            'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
          status: 'preview_ready',
          categories: ['saas', 'commerce', 'portfolio', 'app'],
          html: null,
          previewVersion: 1,
        }),
      }

      const response = await createGalleryThumbnailResponse(
        'k57fkjjt99avgnxyzq7w3xy46589nmy3',
        new Request(
          'http://localhost/api/sessions/k57fkjjt99avgnxyzq7w3xy46589nmy3/gallery-thumb?fallback=1',
        ),
        mockClient,
      )

      expect(response.status).toBe(404)
      expect(await response.text()).toBe('Session not found or not public')
    })

    it('does not generate a successful public thumbnail from DB-observed OpenUI handoff placeholder HTML', async () => {
      const mockClient = {
        query: async () => ({
          prompt:
            'a boutique coffee roastery with subscription delivery and tasting events',
          status: 'preview_ready',
          categories: ['commerce'],
          elapsed: 5580,
          cost: 0,
          html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
          previewVersion: 1,
        }),
      }

      const response = await createGalleryThumbnailResponse(
        'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
        new Request(
          'http://localhost/api/sessions/k57eyt2na1n9pzn5x7rh4sdbah89mh9e/gallery-thumb?fallback=1',
        ),
        mockClient,
      )

      expect(response.status).toBe(404)
      const body = await response.text()
      expect(body).not.toContain('Generated OpenUI source is ready')
      expect(body).not.toContain('Boutique Coffee Roastery')
      expect(body).not.toContain('ship-fast-openui-source')
    })

    it('returns a stable unavailable thumbnail when the gallery lookup fails', async () => {
      const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'
      const mockClient = {
        query: vi.fn(async () => {
          throw new Error(
            `Convex gallery lookup failed for ${realSessionId}: Craft Beer Brewery Pineapple Saison`,
          )
        }),
      }
      const response = await createGalleryThumbnailResponse(
        realSessionId,
        undefined,
        mockClient,
      )

      expect(response.status).toBe(503)
      expect(response.headers.get('content-type')).toContain('text/plain')
      const body = await response.text()
      expect(body).toBe('Thumbnail temporarily unavailable')
      expect(body).not.toContain(realSessionId)
      expect(body).not.toContain('Pineapple Saison')
    })

    it('should use stable lookup via getPublicGallerySession', async () => {
      const mockClient = {
        query: async (_fn: any, args: any) => {
          // Verify it's calling getPublicGallerySession with sessionId
          expect(args.sessionId).toBe('test-session-id')
          return {
            prompt: 'Test',
            status: 'done',
            categories: [],
          }
        },
      }
      const response = await createGalleryThumbnailResponse(
        'test-session-id',
        undefined,
        mockClient,
      )

      expect(response.status).toBe(200)
    })
  })
})
