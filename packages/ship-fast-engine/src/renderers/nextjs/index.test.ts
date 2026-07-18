import { describe, it, expect } from 'vitest'
import { renderNextProject } from './index'
import type { SitePageLike } from '@ship-fast/aeo'

interface TestSection {
  id: string
  type: string
  headline?: string
  subheadline?: string
  body?: string
  items?: Array<Record<string, unknown>>
}

interface TestPage extends SitePageLike {
  id: string
  name?: string
  sections: TestSection[]
  renderBlueprint?: {
    exactClone?: boolean
    bodyHtml?: string
    originalHtmlDocument?: string
  }
  [key: string]: unknown
}

interface TestSiteSpec {
  projectName?: string
  siteType: string
  theme?: Record<string, unknown>
  seo?: Record<string, unknown>
  pages: TestPage[]
  userPrompt?: string
  [key: string]: unknown
}

interface TestSession {
  medusaConfig?: {
    backendUrl?: string
    publishableKey?: string
  }
  [key: string]: unknown
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
        name: 'Home',
        title: 'Home',
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            headline: 'Welcome',
          },
        ],
      },
      {
        id: 'about',
        route: '/about',
        name: 'About',
        title: 'About',
        sections: [
          {
            id: 'text-1',
            type: 'text',
            headline: 'About Us',
          },
        ],
      },
    ],
    ...overrides,
  }
}

function makeSession(overrides: Partial<TestSession> = {}): TestSession {
  return {
    medusaConfig: {
      backendUrl: 'http://localhost:9000',
      publishableKey: '',
    },
    ...overrides,
  }
}

describe('renderNextProject', () => {
  it('returns a files object', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toBeDefined()
    expect(typeof files).toBe('object')
  })

  it('generates package.json with Next.js dependencies', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies.next).toBeDefined()
    expect(pkg.dependencies.react).toBeDefined()
    expect(pkg.dependencies['react-dom']).toBeDefined()
    expect(pkg.dependencies['framer-motion']).toBeDefined()
  })

  it('generates next.config.mjs', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files['next.config.mjs']).toContain('NextConfig')
  })

  it('generates app/layout.jsx with html and body', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/layout.jsx')
    const layout = files['app/layout.jsx']
    expect(layout).toContain('<html')
    expect(layout).toContain('<body')
    expect(layout).toContain('RootLayout')
  })

  it('generates app/globals.css with hash comment', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/globals.css')
    expect(files['app/globals.css']).toMatch(/\/\* hash: [a-f0-9]+ \*\//)
  })

  it('generates app/robots.js', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/robots.js')
    expect(files['app/robots.js']).toContain('robots')
  })

  it('generates app/sitemap.js', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/sitemap.js')
    expect(files['app/sitemap.js']).toContain('sitemap')
  })

  it('generates app/llms.txt/route.js', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/llms.txt/route.js')
    expect(files['app/llms.txt/route.js']).toContain('Response')
  })

  it('generates page files in app directory for each route', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('app/page.jsx')
    expect(files).toHaveProperty('app/about/page.jsx')
  })

  it('page files export metadata and default component', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const page = files['app/page.jsx']
    expect(page).toContain('export const metadata')
    expect(page).toContain('export default')
    expect(page).toContain('PageTemplate')
  })

  it('page files include structured data script when available', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const page = files['app/page.jsx']
    expect(page).toContain('structuredData')
  })

  it('generates lib/site-spec.js', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('lib/site-spec.js')
    expect(files['lib/site-spec.js']).toContain('export default')
  })

  it('generates SectionRenderer.jsx', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('components/SectionRenderer.jsx')
    expect(files['components/SectionRenderer.jsx']).toContain('SectionRenderer')
  })

  it('generates SmartLink.jsx with next/link', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('components/SmartLink.jsx')
    expect(files['components/SmartLink.jsx']).toContain('next/link')
  })

  it('generates PageTemplate.jsx', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('components/PageTemplate.jsx')
    expect(files['components/PageTemplate.jsx']).toContain('PageTemplate')
  })

  it('generates MotionPageShell and RevealObserver components', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('components/MotionPageShell.jsx')
    expect(files).toHaveProperty('components/RevealObserver.jsx')
  })

  it('generates ExactClonePage component', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('components/ExactClonePage.jsx')
  })

  it('generates clone-runtime.js', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).toHaveProperty('lib/clone-runtime.js')
  })

  it('includes font preconnect links in layout when theme has fonts', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const layout = files['app/layout.jsx']
    expect(layout).toContain('fonts.googleapis.com')
    expect(layout).toContain('preconnect')
  })

  it('omits font links when theme has no typography', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ theme: {} }),
      makeSession(),
    )
    const layout = files['app/layout.jsx']
    expect(layout).not.toContain('fonts.googleapis.com')
  })

  it('includes llms.txt link in layout head', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files['app/layout.jsx']).toContain('llms.txt')
  })

  it('includes ecommerce root wrapper for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    const layout = files['app/layout.jsx']
    expect(layout).toContain('EcommerceClientRoot')
  })

  it('does not include ecommerce root wrapper for non-ecommerce sites', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files['app/layout.jsx']).not.toContain('EcommerceClientRoot')
  })

  it('adds swiper dependency for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies.swiper).toBeDefined()
  })

  it('adds medusa SDK dependency for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies['@medusajs/js-sdk']).toBeDefined()
  })

  it('generates medusa lib and components for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    expect(files).toHaveProperty('lib/medusa.js')
    expect(files).toHaveProperty('components/ecommerce/CartProvider.jsx')
    expect(files).toHaveProperty('components/ecommerce/ProductCard.jsx')
    expect(files).toHaveProperty('components/ecommerce/CartDrawer.jsx')
    expect(files).toHaveProperty('components/ecommerce/AddToCart.jsx')
    expect(files).toHaveProperty('components/ecommerce/ProductMarquee.jsx')
  })

  it('generates ecommerce app shell files for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    expect(files).toHaveProperty('components/ecommerce/EcommerceClientRoot.jsx')
    expect(files).toHaveProperty('hooks/useCheckout.js')
    expect(files).toHaveProperty('components/ecommerce/CheckoutView.jsx')
  })

  it('generates shop and checkout pages for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    expect(files).toHaveProperty('app/shop/page.jsx')
    expect(files).toHaveProperty('app/checkout/page.jsx')
    expect(files).toHaveProperty('app/product/[handle]/page.jsx')
  })

  it('generates medusa env files for ecommerce sites', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    expect(files).toHaveProperty('.env.example.medusa')
    expect(files).toHaveProperty('.env.local')
  })

  it('prefills medusa env from session config', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession({
        medusaConfig: {
          backendUrl: 'https://medusa.test',
          publishableKey: 'pk_test_123',
        },
      }),
    )
    expect(files['.env.local']).toContain('https://medusa.test')
    expect(files['.env.local']).toContain('pk_test_123')
  })

  it('does not generate medusa files for non-ecommerce sites', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files).not.toHaveProperty('lib/medusa.js')
    expect(files).not.toHaveProperty('.env.local')
    expect(files).not.toHaveProperty('app/shop/page.jsx')
  })

  it('includes swiper CSS imports in layout for ecommerce', () => {
    const { files } = renderNextProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      makeSession(),
    )
    expect(files['app/layout.jsx']).toContain('swiper/css')
  })

  it('does not include swiper CSS imports for non-ecommerce', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    expect(files['app/layout.jsx']).not.toContain('swiper/css')
  })

  it('handles nested route paths correctly', () => {
    const { files } = renderNextProject(
      makeSiteSpec({
        pages: [
          {
            id: 'blog-post',
            route: '/blog/my-first-post',
            name: 'BlogPost',
            title: 'Post',
            sections: [],
          },
        ],
      }),
      makeSession(),
    )
    expect(files).toHaveProperty('app/blog/my-first-post/page.jsx')
  })

  it('handles pages with no sections', () => {
    const { files } = renderNextProject(
      makeSiteSpec({
        pages: [
          {
            id: 'empty',
            route: '/empty',
            name: 'Empty',
            title: 'Empty',
            sections: [],
          },
        ],
      }),
      makeSession(),
    )
    expect(files).toHaveProperty('app/empty/page.jsx')
  })

  it('layout includes viewport export with themeColor', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const layout = files['app/layout.jsx']
    expect(layout).toContain('viewport')
    expect(layout).toContain('themeColor')
  })

  it('layout includes metadata export with title and description', () => {
    const { files } = renderNextProject(makeSiteSpec(), makeSession())
    const layout = files['app/layout.jsx']
    expect(layout).toContain('export const metadata')
    expect(layout).toContain('Test Site')
  })
})
