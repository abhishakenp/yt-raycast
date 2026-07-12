import { describe, it, expect } from 'vitest'
import { renderHtmlProject } from './index'

interface TestSection {
  id: string
  type: string
  headline?: string
  subheadline?: string
  body?: string
  items?: Array<Record<string, unknown>>
}

interface TestPage {
  id: string
  route: string
  title?: string
  sections: TestSection[]
  renderBlueprint?: {
    exactClone?: boolean
    bodyHtml?: string
    originalHtmlDocument?: string
  }
}

interface TestSiteSpec {
  projectName: string
  siteType: string
  theme: Record<string, unknown>
  seo: Record<string, unknown>
  pages: TestPage[]
  _indiaMode?: unknown
  ecommerce?: Record<string, unknown>
  userPrompt?: string
}

function makeSiteSpec(overrides: Partial<TestSiteSpec> = {}): TestSiteSpec {
  return {
    projectName: 'Test Site',
    siteType: 'landing',
    theme: {
      typography: { heading: 'Inter', body: 'Inter' },
      colors: { background: '#09090b', foreground: '#fafafa' },
    },
    seo: {
      siteUrl: 'https://example.com',
      title: 'Test Site',
      description: 'A test site',
      siteName: 'Test Site',
    },
    pages: [
      {
        id: 'home',
        route: '/',
        title: 'Home',
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            headline: 'Welcome',
            subheadline: 'Hello',
            body: 'This is a test site.',
          },
          {
            id: 'footer-1',
            type: 'footer',
            headline: 'Test Site',
            body: 'Copyright 2024',
          },
        ],
      },
      {
        id: 'about',
        route: '/about',
        title: 'About',
        sections: [
          {
            id: 'text-1',
            type: 'text',
            headline: 'About Us',
            body: 'We are a test company.',
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('renderHtmlProject', () => {
  it('returns a files object with expected static assets', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files).toHaveProperty('site.css')
    expect(files).toHaveProperty('site.js')
    expect(files).toHaveProperty('site-motion.mjs')
    expect(files).toHaveProperty('robots.txt')
    expect(files).toHaveProperty('llms.txt')
    expect(files).toHaveProperty('sitemap.xml')
  })

  it('generates index.html for the homepage route', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files).toHaveProperty('index.html')
    const html = files['index.html']
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
  })

  it('generates HTML files for non-homepage routes', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files).toHaveProperty('about.html')
    expect(files['about.html']).toContain('<!doctype html>')
  })

  it('includes site.css link with fingerprint version', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toMatch(/site\.css\?v=[a-f0-9]+/)
  })

  it('includes site-motion module script tag', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toMatch(/site-motion\.mjs\?v=[a-f0-9]+/)
  })

  it('includes site.js script tag', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toContain('site.js')
  })

  it('renders section content in the HTML body', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toContain('Welcome')
    expect(html).toContain('Test Site')
  })

  it('includes SEO head markup', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toMatch(/<title>|<meta[^>]*description/)
  })

  it('renders robots.txt with sitemap reference', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files['robots.txt']).toContain('User-agent: *')
    expect(files['robots.txt']).toContain(
      'Sitemap: https://example.com/sitemap.xml',
    )
  })

  it('renders sitemap.xml with page URLs', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    const xml = files['sitemap.xml']
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('https://example.com/')
    expect(xml).toContain('https://example.com/about')
  })

  it('applies store shell class for ecommerce sites', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ siteType: 'ecommerce' }))
    const html = files['index.html']
    expect(html).toContain('site-shell--store')
  })

  it('does not apply store shell class for non-ecommerce sites', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ siteType: 'landing' }))
    const html = files['index.html']
    expect(html).not.toContain('site-shell--store')
  })

  it('includes swiper CDN links for ecommerce sites', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ siteType: 'ecommerce' }))
    const html = files['index.html']
    expect(html).toContain('swiper-bundle.min.css')
    expect(html).toContain('swiper-bundle.min.js')
  })

  it('does not include swiper CDN links for non-ecommerce sites', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ siteType: 'landing' }))
    const html = files['index.html']
    expect(html).not.toContain('swiper-bundle')
  })

  it('enriches ecommerce product-grid sections with seed data', () => {
    const siteSpec = makeSiteSpec({
      siteType: 'ecommerce',
      ecommerce: {
        products: [
          {
            id: 'p1',
            title: 'Widget',
            description: 'A great widget',
            price: 29.99,
            image: '/widget.png',
            category: 'Tools',
          },
        ],
      },
      pages: [
        {
          id: 'shop',
          route: '/shop',
          title: 'Shop',
          sections: [
            {
              id: 'grid-1',
              type: 'product-grid',
              items: [],
            },
          ],
        },
      ],
    })
    const { files } = renderHtmlProject(siteSpec)
    const html = files['shop.html']
    expect(html).toContain('Widget')
    expect(html).toContain('$29.99')
  })

  it('enriches featured-products sections with up to 4 products', () => {
    const products = Array.from({ length: 6 }, (_, i) => ({
      id: `p${i}`,
      title: `Product ${i}`,
      description: `Desc ${i}`,
      price: 10 + i,
      image: `/img${i}.png`,
      category: 'Cat',
    }))
    const siteSpec = makeSiteSpec({
      siteType: 'ecommerce',
      ecommerce: { products },
      pages: [
        {
          id: 'home',
          route: '/',
          title: 'Home',
          sections: [
            {
              id: 'featured-1',
              type: 'featured-products',
              items: [],
            },
          ],
        },
      ],
    })
    const { files } = renderHtmlProject(siteSpec)
    const html = files['index.html']
    expect(html).toContain('Product 0')
    expect(html).toContain('Product 3')
    expect(html).not.toContain('Product 4')
  })

  it('uses exact clone document when page has renderBlueprint', () => {
    const originalHtml = `<!doctype html>
<html lang="en">
  <head>
    <title>Original Clone</title>
  </head>
  <body>
    <h1>Cloned Content</h1>
  </body>
</html>`
    const siteSpec = makeSiteSpec({
      pages: [
        {
          id: 'clone-page',
          route: '/clone',
          title: 'Clone',
          sections: [],
          renderBlueprint: {
            exactClone: true,
            bodyHtml: '<h1>Cloned Content</h1>',
            originalHtmlDocument: originalHtml,
          },
        },
      ],
    })
    const { files } = renderHtmlProject(siteSpec)
    const html = files['clone.html']
    expect(html).toContain('Cloned Content')
    expect(html).toContain('site.css')
  })

  it('handles site with no pages gracefully', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ pages: [] }))
    expect(files).toHaveProperty('site.css')
    expect(files).toHaveProperty('robots.txt')
  })

  it('produces non-empty CSS content', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files['site.css'].length).toBeGreaterThan(0)
  })

  it('produces non-empty JS runtime', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files['site.js'].length).toBeGreaterThan(0)
  })

  it('produces non-empty motion module', () => {
    const { files } = renderHtmlProject(makeSiteSpec())
    expect(files['site-motion.mjs'].length).toBeGreaterThan(0)
  })

  it('omits sitemap.xml when no siteUrl is set', () => {
    const { files } = renderHtmlProject(makeSiteSpec({ seo: { siteUrl: '' } }))
    expect(files).not.toHaveProperty('sitemap.xml')
  })
})
