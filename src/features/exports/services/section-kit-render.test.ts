import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const siteSpecJson = JSON.stringify({ projectName: 'Kit Render' })

async function renderSource(source: string) {
  const result = await buildOpenUIHtmlExport({
    source,
    siteSpecJson,
    sessionId: 'test-session',
    target: 'html',
  })
  return typeof result.body === 'string'
    ? result.body
    : new TextDecoder().decode(result.body)
}

// The shared section-kit (SiteNav → components/ui/sheet → radix Dialog, SiteFooter,
// StarRating, etc.) must render through the actual OpenUI runtime — not just
// import. This guards the page-block → composable-section migration: every
// vertical Navbar/Footer now composes these generics instead of inlining, so a
// runtime break here breaks ~60 families at once.
describe('section-kit renders through the OpenUI runtime', () => {
  it('RestaurantNavbar (SiteNav + real Sheet drawer) renders to HTML', async () => {
    const html = await renderSource(
      `root = RestaurantNavbar("Saffron & Sage", ["Menu", "About", "Gallery"])`,
    )
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Saffron &amp; Sage')
    // nav links rendered by the shared SiteNav composite
    expect(html).toContain('Menu')
    expect(html).toContain('About')
  })

  it('standalone HTML export opens a static drawer from a shadcn Sheet trigger', async () => {
    const html = await renderSource(
      `root = SaasNavbar("Acme", ["Features", "Pricing"], "", "Get Started")`,
    )
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
    const dom = new JSDOM(html.replace(/<style>[\s\S]*?<\/style>/g, ''), {
      pretendToBeVisual: true,
      url: 'http://localhost/',
    })
    if (!script) throw new Error('Expected exported HTML to include runtime')
    dom.window.requestAnimationFrame = (callback) => {
      dom.window.setTimeout(() => callback(Date.now()), 0)
      return 1
    }
    const executeScript = new Function('window', `with (window) { ${script} }`)
    executeScript(dom.window)

    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    const trigger = dom.window.document.querySelector(
      '[data-slot="sheet-trigger"]',
    )
    if (!(trigger instanceof dom.window.HTMLButtonElement)) {
      throw new Error('Expected exported navbar to include a Sheet trigger')
    }

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))

    const dialog = dom.window.document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.textContent).toContain('Features')
    expect(dialog?.textContent).toContain('Pricing')
    expect(dialog?.textContent).toContain('Get Started')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('standalone HTML drawer routes semantic generated labels like runtime navigation', async () => {
    const html = await renderSource(`
root = PageSwitch(["Home", "Lookbook"], [home, lookbook])
home = Stack([nav, homeText])
nav = SaasNavbar("Atelier", ["Explore Full Lookbook"])
homeText = Text("Home page")
lookbook = Stack([lookbookText])
lookbookText = Text("Lookbook page")
`)
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
    const dom = new JSDOM(html.replace(/<style>[\s\S]*?<\/style>/g, ''), {
      pretendToBeVisual: true,
      url: 'http://localhost/',
    })
    if (!script) throw new Error('Expected exported HTML to include runtime')
    dom.window.requestAnimationFrame = (callback) => {
      dom.window.setTimeout(() => callback(Date.now()), 0)
      return 1
    }
    const executeScript = new Function('window', `with (window) { ${script} }`)
    executeScript(dom.window)

    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    const pages = Array.from<unknown>(
      dom.window.document.querySelectorAll('[data-sf-export-page]'),
    ).filter((node): node is Element => node instanceof dom.window.Element)
    const homePage = pages.find(
      (page) => page.getAttribute('data-sf-export-page') === 'Home',
    )
    const lookbookPage = pages.find(
      (page) => page.getAttribute('data-sf-export-page') === 'Lookbook',
    )
    const trigger = dom.window.document.querySelector(
      '[data-slot="sheet-trigger"]',
    )
    if (!(trigger instanceof dom.window.HTMLButtonElement)) {
      throw new Error('Expected exported navbar to include a Sheet trigger')
    }

    expect(homePage?.hasAttribute('hidden')).toBe(false)
    expect(lookbookPage?.hasAttribute('hidden')).toBe(true)

    trigger.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))

    const drawerButton = Array.from<unknown>(
      dom.window.document.querySelectorAll('[role="dialog"] button'),
    )
      .filter(
        (node): node is HTMLButtonElement =>
          node instanceof dom.window.HTMLButtonElement,
      )
      .find((button) => button.textContent === 'Explore Full Lookbook')
    if (!drawerButton) {
      throw new Error('Expected static drawer to include semantic nav item')
    }

    drawerButton.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))

    expect(homePage?.hasAttribute('hidden')).toBe(true)
    expect(lookbookPage?.hasAttribute('hidden')).toBe(false)
  })

  it('SiteNav tolerates a non-string phone prop (defensive kit)', async () => {
    // The 3rd positional maps to `phone`; passing a non-string must not crash
    // the section — shared kit composites are used by ~60 families.
    const html = await renderSource(
      `root = RestaurantNavbar("Saffron & Sage", ["Menu", "About"], {})`,
    )
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Saffron &amp; Sage')
  })

  // Every kit-composed restaurant section renders through the runtime with its
  // baked defaults (no props) — guards SiteFooter / GalleryGrid /
  // TestimonialGrid / CtaBand / StarRating all at once.
  for (const section of [
    'RestaurantFooter',
    'RestaurantGallery',
    'RestaurantTestimonials',
    'RestaurantCta',
  ]) {
    it(`${section} (kit composite) renders with no props`, async () => {
      const html = await renderSource(`root = ${section}()`)
      expect(html).not.toContain('Failed to render')
      // non-trivial DOM rendered inside the export page wrapper
      expect(html).toMatch(/data-sf-export-page="Home"><[^>]*\s/)
    })
  }
})

// Cross-family sweep: every kit-refactored section of all 7 migrated families must
// render through the runtime with baked defaults. A break in any shared kit composite
// surfaces here across families at once.
describe('kit-refactored families render through the runtime', () => {
  const sections = [
    // SiteNav (real Sheet drawer) + SiteFooter across all 7 families
    'SaasNavbar',
    'SaasFooter',
    'EcommerceNavbar',
    'EcommerceFooter',
    'SpaWellnessNavbar',
    'SpaWellnessFooter',
    'YogaStudioNavbar',
    'YogaStudioFooter',
    'RealEstateNavbar',
    'RealEstateFooter',
    'PropertyListingNavbar',
    'PropertyListingFooter',
    // each remaining kit composite, exercised via a real family section
    'SaasFeatures',
    'SaasPricing',
    'SaasTestimonials',
    'SaasCta',
    'EcommerceFeatures',
    'EcommerceTestimonials',
    'EcommerceCta',
    'SpaWellnessPricing',
    'SpaWellnessGallery',
    'RealEstateStats',
    'RealEstateServices',
  ]
  for (const section of sections) {
    it(`${section} renders with no props`, async () => {
      const html = await renderSource(`root = ${section}()`)
      expect(html).not.toContain('Failed to render')
      expect(html).toMatch(/data-sf-export-page="Home"><[^>]*\s/)
    })
  }
})
