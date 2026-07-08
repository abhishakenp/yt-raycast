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

    it('renders the live public-gallery OpenUI shape with null html into static HTML before serialization', async () => {
      const selectedBrandLogo = {
        brandId: 'idwTkaYgXe',
        domain: 'thebeerstore.ca',
        icon: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
        logo: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
        name: 'The Beer Store',
      }
      const livePublicSessionSource =
        'home_navbar = RestaurantNavbar("Craft Beer Brewery", ["Home","Menu","Gallery","Story","Testimonials"])\n' +
        'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"categories[Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\n' +
        'home = Stack([home_navbar, home_menu])\n' +
        'root = PageSwitch(["Home"], [home], "", {"Home":"home"})'
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: [],
              elapsed: 6424,
              html: null,
              moduleSource: livePublicSessionSource,
              openuiReady: true,
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
              selectedBrandLogo,
              sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
              siteSpecJson: JSON.stringify({
                brand: 'Craft Beer Brewery',
                locale: 'en',
                projectName: 'Craft Beer Brewery',
                theme: 't3-chat',
              }),
              status: 'preview_ready',
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
      const request = new Request(
        'http://localhost/api/gallery?search=craft%20beer%20brewery',
      )

      const response = await createGalleryApiResponse(request, mockClient)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      const item = data.items[0]
      const renderedHtml = item.html as string
      expect(item.sessionId).toBe('k574ms14ma9f94keq30r7dq24x89n1k2')
      expect(renderedHtml).toContain('data-sf-export-page')
      expect(renderedHtml).toContain('lang="lt"')
      expect(renderedHtml).toContain('color-scheme: dark')
      expect(renderedHtml).toContain('"themeName":"darkmatter"')
      expect(renderedHtml).toContain('Our Brew Selection')
      expect(renderedHtml).toContain('Pineapple Saison')
      expect(renderedHtml).toContain(selectedBrandLogo.icon)
      expect(renderedHtml).toContain('data-brand-logo-selected="true"')
      expect('imageUrl' in item).toBe(false)
      expect('moduleSource' in item).toBe(false)
      expect(JSON.stringify(item)).not.toContain('RestaurantMenu("')
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
        'home_navbar = ChurchNavbar("भारत सरकार", ["Home","Contact","Events","About","Services"], "/")\nhome_services = ChurchServices("सेवाएँ", "हमारी प्रमुख सेवाएँ", "", [{"title":"डिजिटल पहचान प्रमाणन","detail":"","location":""}])\nroot = PageSwitch(["Home"], [home_services], "", {"Home":"Home"})'
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
      expect(JSON.stringify(data.items[0])).not.toContain('ChurchServices("')
    })

    it('renders DB-shaped edited, translated, themed OpenUI as the only public gallery preview artifact', async () => {
      const staleHtml =
        '<!doctype html><html lang="en"><body><main><h1>Our Brew Selection</h1><p>Stale English preview before edits</p><img src="https://cdn.example.test/stale-brewery.png" alt="stale screenshot"></main></body></html>'
      const editedTranslatedOpenUiSource =
        'home_menu = RestaurantMenu("Redaguotas aludario meniu", "Lietuviskai isverstas sezoniniu alaus sarasas.", [{"name":"Sezoniniai leidimai","items":[{"name":"Ananasų sezoninis elis","description":"Tropines natos ir gaivi pabaiga","price":"7 €","tag":"Ribotas"}]}])\nroot = PageSwitch(["Pradzia"], [home_menu], "", {"Pradzia":"home"})'
      const mockClient = {
        query: async () => ({
          availableCategories: ['service'],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['service'],
              elapsed: 6424,
              html: staleHtml,
              imageUrl: 'https://cdn.example.test/k574-gallery.png',
              moduleSource: editedTranslatedOpenUiSource,
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
              selectedBrandLogo: {
                brandId: 'idwTkaYgXe',
                domain: 'thebeerstore.ca',
                icon: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
                logo: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
                name: 'The Beer Store',
              },
              sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
              siteSpecJson: JSON.stringify({
                brand: 'Craft Beer Brewery',
                locale: 'en',
                projectName: 'Craft Beer Brewery',
                theme: 't3-chat',
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
      expect(data.items).toHaveLength(1)
      const item = data.items[0]
      const renderedHtml = item.html as string
      expect(item.sessionId).toBe('k574ms14ma9f94keq30r7dq24x89n1k2')
      expect(renderedHtml).toContain('data-sf-export-page="Pradzia"')
      expect(renderedHtml).toContain('lang="lt"')
      expect(renderedHtml).toContain('color-scheme: dark')
      expect(renderedHtml).toContain('"themeName":"darkmatter"')
      expect(renderedHtml).toContain('Redaguotas aludario meniu')
      expect(renderedHtml).toContain('Ananasų sezoninis elis')
      expect(renderedHtml).toContain('7 €')
      expect(renderedHtml).not.toContain('Our Brew Selection')
      expect(renderedHtml).not.toContain('Stale English preview before edits')
      expect(renderedHtml).not.toContain('stale-brewery.png')
      expect(renderedHtml).not.toContain('k574-gallery.png')
      expect(renderedHtml).not.toContain('RestaurantMenu("')
      expect('imageUrl' in item).toBe(false)
      expect('moduleSource' in item).toBe(false)
      expect(JSON.stringify(item)).not.toContain('k574-gallery.png')
      expect(JSON.stringify(item)).not.toContain(
        'Stale English preview before edits',
      )
      expect(JSON.stringify(item)).not.toContain('RestaurantMenu("')
    })

    it('renders selected brand logos into static OpenUI gallery HTML', async () => {
      const selectedBrandLogo = {
        brandId: 'idwTkaYgXe',
        domain: 'thebeerstore.ca',
        icon: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
        logo: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
        name: 'The Beer Store',
      }
      const mockClient = {
        query: async () => ({
          availableCategories: ['service'],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['service'],
              elapsed: 6424,
              html: '<!doctype html><html lang="en"><body><main><h1>Stale brewery preview</h1><img src="https://cdn.example.test/stale-brewery.png" alt="stale screenshot"></main></body></html>',
              imageUrl: 'https://cdn.example.test/k574-gallery.png',
              moduleSource:
                'home_nav = WineryBreweryNavbar("Craft Beer Brewery", ["Pradzia","Degustacijos"], "(503) 555-0148", "Pradzia", "Planuoti apsilankyma", "Pradzia", "0")\nhome_menu = RestaurantMenu("Redaguotas aludario meniu", "Lietuviskai isverstas sezoniniu alaus sarasas.", [{"name":"Sezoniniai leidimai","items":[{"name":"Ananasų sezoninis elis","description":"Tropines natos ir gaivi pabaiga","price":"7 €","tag":"Ribotas"}]}])\nhome = Stack([home_nav, home_menu])\nroot = PageSwitch(["Pradzia"], [home], "", {"Pradzia":"home"})',
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
              selectedBrandLogo,
              sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
              siteSpecJson: JSON.stringify({
                brand: 'Craft Beer Brewery',
                projectName: 'Craft Beer Brewery',
                theme: 't3-chat',
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
      expect(data.items).toHaveLength(1)
      const item = data.items[0]
      const renderedHtml = item.html as string
      expect(renderedHtml).toContain(selectedBrandLogo.icon)
      expect(renderedHtml).toContain('data-brand-logo-selected="true"')
      expect(renderedHtml).toContain('Craft Beer Brewery')
      expect(renderedHtml).toContain('Redaguotas aludario meniu')
      expect(renderedHtml).not.toContain('Stale brewery preview')
      expect(renderedHtml).not.toContain('stale-brewery.png')
      expect(renderedHtml).not.toContain('k574-gallery.png')
      expect(renderedHtml).not.toContain('WineryBreweryNavbar("')
      expect('imageUrl' in item).toBe(false)
      expect('moduleSource' in item).toBe(false)
      expect(JSON.stringify(item)).not.toContain('k574-gallery.png')
    })

    it('does not serialize stale HTML or PNG fallback when an OpenUI gallery row cannot be rendered to static HTML', async () => {
      const mockClient = {
        query: async () => ({
          availableCategories: [],
          hasNext: false,
          hasPrev: false,
          items: [
            {
              categories: ['service'],
              elapsed: 6424,
              html: '<main><h1>Stale preview before edits</h1><img alt="stale screenshot" src="https://cdn.example.test/stale-openui-preview.png"></main>',
              imageUrl: 'https://cdn.example.test/k574-gallery.png',
              moduleSource:
                'Edited Taproom Releases / Pineapple Saison / not a parseable OpenUI program',
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
      expect(data.items).toEqual([])
      expect(data.total).toBe(0)
      expect(data.totalPages).toBe(1)
      expect(JSON.stringify(data)).not.toContain('stale-openui-preview.png')
      expect(JSON.stringify(data)).not.toContain('k574-gallery.png')
      expect(JSON.stringify(data)).not.toContain('RestaurantMenu("')
      expect(JSON.stringify(data)).not.toContain('Stale preview before edits')
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
