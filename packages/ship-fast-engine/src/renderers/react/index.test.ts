import { describe, it, expect } from 'vitest'
import { renderReactProject } from './index'

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
  name?: string
  sections: TestSection[]
  renderBlueprint?: {
    exactClone?: boolean
    bodyHtml?: string
    originalHtmlDocument?: string
  }
}

interface TestSession {
  medusaConfig?: {
    backendUrl?: string
    publishableKey?: string
  }
}

interface TestSiteSpec {
  projectName: string
  siteType: string
  theme: Record<string, unknown>
  seo: Record<string, unknown>
  pages: TestPage[]
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

describe('renderReactProject', () => {
  it('returns a files object', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toBeDefined()
    expect(typeof files).toBe('object')
  })

  it('generates package.json with React dependencies', () => {
    const { files } = renderReactProject(makeSiteSpec())
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies.react).toBeDefined()
    expect(pkg.dependencies['react-dom']).toBeDefined()
    expect(pkg.dependencies['react-router-dom']).toBeDefined()
    expect(pkg.dependencies['framer-motion']).toBeDefined()
  })

  it('generates package.json with vite dev dependencies', () => {
    const { files } = renderReactProject(makeSiteSpec())
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.devDependencies.vite).toBeDefined()
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined()
  })

  it('generates index.html with root div', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files['index.html']).toContain('<div id="root">')
    expect(files['index.html']).toContain('<!doctype html>')
  })

  it('includes SEO meta tags in index.html', () => {
    const { files } = renderReactProject(makeSiteSpec())
    const html = files['index.html']
    expect(html).toMatch(/<meta name="description"/)
    expect(html).toMatch(/<meta property="og:title"/)
  })

  it('generates App.jsx with routes for all pages', () => {
    const { files } = renderReactProject(makeSiteSpec())
    const app = files['src/App.jsx']
    expect(app).toContain('BrowserRouter')
    expect(app).toContain('Route path="/"')
    expect(app).toContain('Route path="/about"')
    expect(app).toContain('Navigate')
  })

  it('generates page component files for each route', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/pages/HomePage.jsx')
    expect(files).toHaveProperty('src/pages/AboutPage.jsx')
  })

  it('page components import PageTemplate and site-spec', () => {
    const { files } = renderReactProject(makeSiteSpec())
    const page = files['src/pages/HomePage.jsx']
    expect(page).toContain(
      "import PageTemplate from '../components/PageTemplate'",
    )
    expect(page).toContain("import siteSpec from '../site-spec'")
  })

  it('generates SectionRenderer.jsx', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/SectionRenderer.jsx')
    const renderer = files['src/components/SectionRenderer.jsx']
    expect(renderer).toContain('SectionRenderer')
  })

  it('generates SmartLink.jsx with react-router Link', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/SmartLink.jsx')
    expect(files['src/components/SmartLink.jsx']).toContain('react-router-dom')
  })

  it('generates PageTemplate.jsx', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/PageTemplate.jsx')
    expect(files['src/components/PageTemplate.jsx']).toContain('PageTemplate')
  })

  it('generates main.jsx entry point', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/main.jsx')
    expect(files['src/main.jsx']).toContain('ReactDOM')
  })

  it('generates vite.config.js', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('vite.config.js')
    expect(files['vite.config.js']).toContain('defineConfig')
  })

  it('generates styles.css with hash comment', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/styles.css')
    expect(files['src/styles.css']).toMatch(/\/\* hash: [a-f0-9]+ \*\//)
  })

  it('generates site-spec.js', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/site-spec.js')
    expect(files['src/site-spec.js']).toContain('export default')
  })

  it('generates robots.txt', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files['public/robots.txt']).toContain('User-agent: *')
  })

  it('generates llms.txt', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('public/llms.txt')
  })

  it('generates sitemap.xml when siteUrl is set', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('public/sitemap.xml')
    expect(files['public/sitemap.xml']).toContain('https://example.com/')
  })

  it('omits sitemap.xml when no siteUrl', () => {
    const { files } = renderReactProject(makeSiteSpec({ seo: { siteUrl: '' } }))
    expect(files).not.toHaveProperty('public/sitemap.xml')
  })

  it('includes swiper dependency for ecommerce sites', () => {
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
    )
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies.swiper).toBeDefined()
  })

  it('does not include swiper dependency for non-ecommerce sites', () => {
    const { files } = renderReactProject(makeSiteSpec({ siteType: 'landing' }))
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies.swiper).toBeUndefined()
  })

  it('adds medusa SDK dependency for ecommerce sites', () => {
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
    )
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies['@medusajs/js-sdk']).toBeDefined()
  })

  it('generates medusa lib file for ecommerce sites', () => {
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
    )
    expect(files).toHaveProperty('src/lib/medusa.js')
    expect(files['src/lib/medusa.js']).toContain('getMedusaSdk')
  })

  it('generates medusa env files for ecommerce sites', () => {
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
    )
    expect(files).toHaveProperty('.env.example.medusa')
    expect(files).toHaveProperty('.env.local')
  })

  it('prefills medusa env from session config', () => {
    const session: TestSession = {
      medusaConfig: {
        backendUrl: 'https://medusa.test',
        publishableKey: 'pk_test_123',
      },
    }
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
      session,
    )
    expect(files['.env.local']).toContain('https://medusa.test')
    expect(files['.env.local']).toContain('pk_test_123')
  })

  it('does not generate medusa files for non-ecommerce sites', () => {
    const { files } = renderReactProject(makeSiteSpec({ siteType: 'landing' }))
    expect(files).not.toHaveProperty('src/lib/medusa.js')
    expect(files).not.toHaveProperty('.env.local')
  })

  it('includes swiper CSS imports in main.jsx for ecommerce', () => {
    const { files } = renderReactProject(
      makeSiteSpec({ siteType: 'ecommerce' }),
    )
    expect(files['src/main.jsx']).toContain('swiper/css')
  })

  it('does not include swiper CSS imports for non-ecommerce', () => {
    const { files } = renderReactProject(makeSiteSpec({ siteType: 'landing' }))
    expect(files['src/main.jsx']).not.toContain('swiper/css')
  })

  it('generates clone-runtime.js', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/lib/clone-runtime.js')
  })

  it('generates ExactClonePage component', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/ExactClonePage.jsx')
  })

  it('generates MotionPageShell and RevealObserver components', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/MotionPageShell.jsx')
    expect(files).toHaveProperty('src/components/RevealObserver.jsx')
  })

  it('generates SeoHead component', () => {
    const { files } = renderReactProject(makeSiteSpec())
    expect(files).toHaveProperty('src/components/SeoHead.jsx')
    expect(files['src/components/SeoHead.jsx']).toContain('SeoHead')
  })

  it('handles pages with no sections', () => {
    const { files } = renderReactProject(
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
    )
    expect(files).toHaveProperty('src/pages/EmptyPage.jsx')
  })
})
