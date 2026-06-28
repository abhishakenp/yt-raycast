import { beforeAll, describe, expect, it } from 'vitest'

type SharedModule = {
  buildGlobalCss: (theme?: any, layout?: any) => string
  buildHtmlMotionModule: () => string
  buildHtmlRuntimeScript: (includeSwiper?: boolean) => string
  escapeHtml: (value?: any) => string
  getLanguageFontMarkup: (indiaMode?: any) => string
  pageComponentName: (page?: any) => string
  pageUsesExactClone: (page?: any) => boolean
  renderCloneRuntimeModule: () => string
  renderExactClonePageComponent: (options: {
    mode: 'react' | 'nextjs'
  }) => string
  renderProjectReadme: (siteSpec: any, target: string) => string
  renderSectionHtml: (section: any, siteSpec?: any) => string
  routeToHtmlFile: (route?: string) => string
  routeToNextSegments: (route?: string) => string[]
  serializeModule: (value: any) => string
  slimSiteSpecForBundle: (siteSpec: any) => any
}

let buildGlobalCss: SharedModule['buildGlobalCss']
let buildHtmlMotionModule: SharedModule['buildHtmlMotionModule']
let buildHtmlRuntimeScript: SharedModule['buildHtmlRuntimeScript']
let escapeHtml: SharedModule['escapeHtml']
let getLanguageFontMarkup: SharedModule['getLanguageFontMarkup']
let pageComponentName: SharedModule['pageComponentName']
let pageUsesExactClone: SharedModule['pageUsesExactClone']
let renderCloneRuntimeModule: SharedModule['renderCloneRuntimeModule']
let renderExactClonePageComponent: SharedModule['renderExactClonePageComponent']
let renderProjectReadme: SharedModule['renderProjectReadme']
let renderSectionHtml: SharedModule['renderSectionHtml']
let routeToHtmlFile: SharedModule['routeToHtmlFile']
let routeToNextSegments: SharedModule['routeToNextSegments']
let serializeModule: SharedModule['serializeModule']
let slimSiteSpecForBundle: SharedModule['slimSiteSpecForBundle']

beforeAll(async () => {
  ;({
    buildGlobalCss,
    buildHtmlMotionModule,
    buildHtmlRuntimeScript,
    escapeHtml,
    getLanguageFontMarkup,
    pageComponentName,
    pageUsesExactClone,
    renderCloneRuntimeModule,
    renderExactClonePageComponent,
    renderProjectReadme,
    renderSectionHtml,
    routeToHtmlFile,
    routeToNextSegments,
    serializeModule,
    slimSiteSpecForBundle,
  } = (await import('./shared.js')) as unknown as SharedModule)
})

describe('renderer shared utilities', () => {
  it('escapes HTML and normalizes generated routes', () => {
    expect(escapeHtml(`Tom & "Sue" <script>'`)).toBe(
      'Tom &amp; &quot;Sue&quot; &lt;script&gt;&#39;',
    )
    expect(routeToHtmlFile('/products/new/')).toBe('products-new.html')
    expect(routeToHtmlFile('/')).toBe('index.html')
    expect(routeToNextSegments('/products/new/')).toEqual(['products', 'new'])
    expect(routeToNextSegments('/')).toEqual([])
    expect(pageComponentName({ name: 'pricing plans' })).toBe(
      'PricingPlansPage',
    )
    expect(serializeModule({ route: '/', enabled: true })).toBe(
      JSON.stringify({ route: '/', enabled: true }, null, 2),
    )
  })

  it('removes heavyweight clone documents from bundled site specs', () => {
    const siteSpec = {
      pages: [
        {
          route: '/',
          renderBlueprint: {
            exactClone: true,
            bodyHtml: '<main>Home</main>',
            originalHtmlDocument: '<html><body>Home</body></html>',
          },
        },
      ],
    }

    const slimmed = slimSiteSpecForBundle(siteSpec)

    expect(pageUsesExactClone(siteSpec.pages[0])).toBe(true)
    expect(slimmed.pages[0].renderBlueprint).toEqual({
      exactClone: true,
      bodyHtml: '<main>Home</main>',
    })
    expect(siteSpec.pages[0].renderBlueprint.originalHtmlDocument).toContain(
      '<html>',
    )
  })

  it('emits language font markup for pure, mixed, and RTL language modes', () => {
    expect(getLanguageFontMarkup(null)).toBe('')
    expect(getLanguageFontMarkup({ code: 'en' })).toBe('')

    const tamilEnglish = getLanguageFontMarkup({
      language: { code: 'ta-en' },
      fontFamily: 'Noto Sans Tamil, Inter, system-ui, sans-serif',
    })
    expect(tamilEnglish).toContain('family=Inter')
    expect(tamilEnglish).toContain('family=Noto+Sans+Tamil')
    expect(tamilEnglish).toContain(
      'font-family: Noto Sans Tamil, Inter, system-ui, sans-serif',
    )

    const urdu = getLanguageFontMarkup({
      code: 'ur',
      isRTL: true,
      fontFamily: 'Noto Nastaliq Urdu, sans-serif',
    })
    expect(urdu).toContain('family=Noto+Nastaliq+Urdu')
    expect(urdu).toContain('html { direction: rtl; }')
  })

  it('documents target-specific run commands and implicit ecommerce routes', () => {
    const readme = renderProjectReadme(
      {
        projectName: 'Retail Journal',
        siteType: 'ecommerce',
        pages: [{ route: '/' }, { route: '/about' }],
      },
      'nextjs',
    )

    expect(readme).toContain('# Retail Journal')
    expect(readme).toContain('bun run build')
    expect(readme).toContain('Medusa:')
    expect(readme).toContain('- `/shop`')
    expect(readme).toContain('- `/checkout`')
  })
})

describe('renderer shared section HTML', () => {
  it('renders ecommerce navigation chrome with escaped labels and store tools', () => {
    const html = renderSectionHtml(
      {
        id: 'top',
        type: 'navbar',
        headline: 'Shop <Now>',
        links: [
          {
            label: 'Shop & Save',
            children: [
              { label: 'New <Arrivals>', href: '/new?ref="nav"' },
              { label: 'Sale', href: '/sale' },
            ],
          },
        ],
        actions: [{ label: 'Checkout', href: '/checkout', style: 'primary' }],
      },
      { siteType: 'ecommerce' },
    )

    expect(html).toContain('store-promo-bar')
    expect(html).toContain('store-search__input')
    expect(html).toContain('nav-dropdown__panel')
    expect(html).toContain('Shop &amp; Save')
    expect(html).toContain('New &lt;Arrivals&gt;')
    expect(html).toContain('/new?ref=&quot;nav&quot;')
    expect(html).toContain('button--primary')
  })

  it('renders hero, FAQ, CTA, form, and footer sections with escaped content', () => {
    const hero = renderSectionHtml({
      id: 'hero',
      type: 'hero',
      variant: 'split',
      subheadline: 'Trusted & tested',
      headline: 'Launch <fast>',
      body: 'No script <tags>',
      image: '/hero.png',
      imageAlt: 'Hero "mockup"',
      actions: [{ label: 'Start <now>', href: '/start?plan="pro"' }],
      items: [{ title: '24h' }],
    })
    expect(hero).toContain('hero--split')
    expect(hero).toContain('Launch &lt;fast&gt;')
    expect(hero).toContain('alt="Hero &quot;mockup&quot;"')
    expect(hero).toContain('Start &lt;now&gt;')

    const faq = renderSectionHtml({
      id: 'faq',
      type: 'faq',
      headline: 'Questions',
      interactions: [{ behavior: 'multi' }],
      items: [{ title: 'Safe?', body: 'Yes & audited' }],
    })
    expect(faq).toContain('data-accordion')
    expect(faq).toContain('data-behavior="multi"')
    expect(faq).toContain('Yes &amp; audited')

    const cta = renderSectionHtml({
      id: 'cta',
      type: 'cta',
      headline: 'Ready?',
      actions: [{ label: 'Book demo', href: '/demo' }],
    })
    expect(cta).toContain('class="section cta"')
    expect(cta).toContain('Book demo')

    const form = renderSectionHtml({
      id: 'contact',
      type: 'contact-form',
      headline: 'Contact',
      fields: [
        { name: 'message', label: 'Message', type: 'textarea', required: true },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        },
      ],
    })
    expect(form).toContain('data-demo-form')
    expect(form).toContain('<textarea name="message"')
    expect(form).toContain('<input type="email"')

    const footer = renderSectionHtml({
      id: 'footer',
      type: 'footer',
      headline: 'Acme',
      body: 'Built for teams',
      links: [{ label: 'Privacy', href: '/privacy' }],
    })
    expect(footer).toContain('footer-ship-fast-attribution')
    expect(footer).toContain('Built with')
    expect(footer).toContain('/privacy')
  })

  it('renders product sections as static grids or carousel markup based on site spec', () => {
    const section = {
      id: 'products',
      type: 'product-grid',
      headline: 'Featured products',
      items: [
        {
          title: 'Desk Lamp',
          category: 'Lighting',
          rating: 4.6,
          price: '$48',
          compareAt: '$64',
          image: '/lamp.jpg',
          body: 'Warm task lighting for compact desks.',
          ctaLabel: 'Add lamp',
        },
      ],
    }

    const grid = renderSectionHtml(section, { siteType: 'saas' })
    expect(grid).toContain('section--store-products')
    expect(grid).toContain('product-grid')
    expect(grid).toContain('Desk Lamp')
    expect(grid).toContain('$48')
    expect(grid).toContain('product-price--compare')
    expect(grid).toContain('Add lamp')

    const carousel = renderSectionHtml(section, {
      siteType: 'saas',
      userPrompt: 'Build a carousel product gallery',
    })
    expect(carousel).toContain('data-sf-swiper')
    expect(carousel).toContain('swiper-slide')
    expect(carousel).toContain('aria-label="Products"')
  })

  it('renders generic list, pricing, testimonials, stats, and default sections', () => {
    const features = renderSectionHtml({
      id: 'features',
      type: 'features',
      headline: 'Features',
      items: [
        { title: 'Fast setup', body: 'Launch in a day', image: '/feature.png' },
      ],
    })
    expect(features).toContain('card-grid')
    expect(features).toContain('feature-list')
    expect(features).toContain('Fast setup')

    const pricing = renderSectionHtml({
      id: 'pricing',
      type: 'pricing',
      headline: 'Pricing',
      items: [
        {
          title: 'Pro',
          price: '$19',
          body: 'For teams',
          features: ['Exports'],
        },
      ],
    })
    expect(pricing).toContain('pricing-grid')
    expect(pricing).toContain('<li>Exports</li>')

    const testimonials = renderSectionHtml({
      id: 'testimonials',
      type: 'testimonials',
      headline: 'Customers',
      items: [
        { quote: 'Works well', author: 'Ada', verified: true, product: 'Pro' },
      ],
    })
    expect(testimonials).toContain('cite="Ada"')
    expect(testimonials).toContain('Ada')

    const stats = renderSectionHtml({
      id: 'stats',
      type: 'stats',
      items: [{ label: 'Generated', value: '10k' }],
    })
    expect(stats).toContain('stat-grid')
    expect(stats).toContain('10k')

    const fallback = renderSectionHtml({
      id: 'plain',
      type: 'unknown',
      headline: 'Plain',
    })
    expect(fallback).toContain('id="plain"')
    expect(fallback).toContain('<h2>Plain</h2>')
  })
})

describe('renderer shared runtime modules', () => {
  it('builds exact-clone runtime and framework components with navigation behavior', () => {
    const cloneRuntime = renderCloneRuntimeModule()
    expect(cloneRuntime).toContain('function createManagedNode')
    expect(cloneRuntime).toContain('export function applyDocumentAttributes')
    expect(cloneRuntime).toContain('node.dataset.sfCloneManaged')

    const reactComponent = renderExactClonePageComponent({ mode: 'react' })
    expect(reactComponent).toContain(
      "import { useNavigate } from 'react-router-dom'",
    )
    expect(reactComponent).toContain(
      'navigate(url.pathname + url.search + url.hash)',
    )

    const nextComponent = renderExactClonePageComponent({ mode: 'nextjs' })
    expect(nextComponent).toContain(
      "import { useRouter } from 'next/navigation'",
    )
    expect(nextComponent).toContain(
      'router.push(url.pathname + url.search + url.hash)',
    )
    expect(nextComponent).toContain('suppressHydrationWarning')
  })

  it('builds HTML runtime scripts with optional carousel vendor initialization', () => {
    const baseRuntime = buildHtmlRuntimeScript(false)
    expect(baseRuntime).toContain('[data-mobile-nav-toggle]')
    expect(baseRuntime).toContain('[data-accordion-trigger]')
    expect(baseRuntime).not.toContain('new Swiper')
    expect(baseRuntime).not.toContain('new Splide')

    const carouselRuntime = buildHtmlRuntimeScript(true)
    expect(carouselRuntime).toContain('new Swiper')
    expect(carouselRuntime).toContain('new Splide')
    expect(carouselRuntime).toContain('data-sf-splide-mounted')

    const motion = buildHtmlMotionModule()
    expect(motion).toContain(
      "import { animate } from 'https://esm.sh/framer-motion",
    )
    expect(motion).toContain("track.style.animation = 'none'")
    expect(motion).toContain(
      "document.addEventListener('DOMContentLoaded', run",
    )
  })

  it('builds global CSS with themed tokens, imported fonts, and ecommerce selectors', () => {
    const css = buildGlobalCss(
      {
        colors: {
          primary: '#111111',
          secondary: '#222222',
          accent: '#333333',
          background: '#ffffff',
          surface: '#f8f8f8',
          text: '#101010',
          mutedText: '#666666',
          border: '#dddddd',
        },
        typography: {
          heading: 'Fraunces',
          body: 'Inter',
          scale: { hero: '4rem' },
        },
        radius: { sm: '4px', md: '6px', lg: '8px' },
        spacing: { sectionY: '6rem', container: '70rem', gap: '2rem' },
      },
      { siteType: 'ecommerce' },
    )

    expect(css).toContain(
      "@import url('https://fonts.googleapis.com/css2?family=Fraunces",
    )
    expect(css).toContain('--color-primary: #111111')
    expect(css).toContain('--text-hero: 4rem')
    expect(css).toContain('.store-search__input')
    expect(css).toContain('.product-card__atc')
  })
})
