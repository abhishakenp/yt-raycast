import { describe, expect, it, vi } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

// esbuild/runtime-heavy render; avoid load-induced 5s flakes
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 })

const siteSpecJson = JSON.stringify({ projectName: 'Kit Render' })

const renderSource = async (source: string) => {
  const result = await buildOpenUIHtmlExport({ source, siteSpecJson })
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
    'SaasNavbar', 'SaasFooter', 'EcommerceNavbar', 'EcommerceFooter',
    'SpaWellnessNavbar', 'SpaWellnessFooter', 'YogaStudioNavbar', 'YogaStudioFooter',
    'RealEstateNavbar', 'RealEstateFooter', 'PropertyListingNavbar', 'PropertyListingFooter',
    // each remaining kit composite, exercised via a real family section
    'SaasFeatures', 'SaasPricing', 'SaasTestimonials', 'SaasCta',
    'EcommerceFeatures', 'EcommerceTestimonials', 'EcommerceCta',
    'SpaWellnessPricing', 'SpaWellnessGallery', 'RealEstateStats', 'RealEstateServices',
  ]
  for (const section of sections) {
    it(`${section} renders with no props`, async () => {
      const html = await renderSource(`root = ${section}()`)
      expect(html).not.toContain('Failed to render')
      expect(html).toMatch(/data-sf-export-page="Home"><[^>]*\s/)
    })
  }
})
