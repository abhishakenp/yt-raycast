import { describe, expect, it } from 'vitest'

import {
  buildLakebedThemeCss,
  buildOpenUILakebedProjectFiles,
  collectRouteImageAlts,
} from './openui-lakebed-export-builder'

const buildProject = (source: string, sessionId: string) =>
  buildOpenUILakebedProjectFiles({
    source,
    siteSpecJson: JSON.stringify({
      projectName: 'Neutral Export',
      seo: {
        description: 'Portable generic website export.',
        siteUrl: 'https://neutral.example.test',
      },
    }),
    sessionId,
    target: 'lakebed',
  })

// V3 intentionally retired vertical capsule families. These contracts exercise
// the live generic registry and the exported artifact boundary rather than
// asserting implementation details of removed Ecommerce/Restaurant components.
describe('openui Lakebed exports', () => {
  it('exports a composed generic page with only portable runtime files', async () => {
    const built = await buildProject(
      `root = Stack([Navbar("Neutral Export", ["Home", "Pricing"]), CenteredHero("Build faster", "Generic output"), FeatureList()])`,
      'lakebed-generic-page',
    )

    expect(built.files['client/components/HomePage.tsx']).toBeDefined()
    expect(built.files['client/components/Navbar.tsx']).toBeDefined()
    expect(built.files['client/components/CenteredHero.tsx']).toBeDefined()
    expect(built.files['client/components/FeatureList.tsx']).toBeDefined()
    expect(Object.values(built.files).join('\n')).not.toContain('@openuidev')
  })

  it('preserves route isolation for generic V3 components', async () => {
    const built = await buildProject(
      `home = Stack([SectionAnchor("home_nav", Navbar("Neutral", ["Gallery", "Pricing"]))])
gallery = Stack([SectionAnchor("gallery_images", ImageGallery())])
pricing = Stack([SectionAnchor("pricing_table", PricingTable())])
root = PageSwitch(["Home", "Gallery", "Pricing"], [home, gallery, pricing], "", {"Gallery":"gallery","Pricing":"pricing"})`,
      'lakebed-routes',
    )

    expect(built.files['client/components/HomePage.tsx']).toContain('home_nav')
    expect(built.files['client/components/GalleryPage.tsx']).toContain(
      'gallery_images',
    )
    expect(built.files['client/components/PricingPage.tsx']).toContain(
      'pricing_table',
    )
    const routes = built.files['client/routes.ts'] ?? ''
    expect(routes).toContain("path: '/gallery'")
    expect(routes).toContain("path: '/pricing'")
  })

  it('emits SEO files from the current generic export boundary', async () => {
    const built = await buildProject(
      'root = CenteredHero("Neutral", "Export")',
      'lakebed-seo',
    )

    expect(built.files['public/robots.txt']).toContain('User-agent: *')
    expect(built.files['public/llms.txt']).toContain('# Neutral Export')
  })

  it('keeps rendered HTML fragments portable without parsing them as OpenUI', async () => {
    const built = await buildProject(
      '<main><h1>Neutral Export</h1><p>Ready to deploy.</p></main>',
      'lakebed-html-fragment',
    )

    expect(built.files['README.md']).not.toMatch(
      /ShipFast|ship-fast\.io|OpenUI/i,
    )
    expect(built.files['client/index.tsx']).toContain('Neutral Export')
  })

  it('collects image metadata from generic route props', () => {
    const imageAlts = collectRouteImageAlts([
      {
        label: 'Home',
        path: '/',
        componentName: 'Image',
        props: { imageAlt: 'Workspace at dusk' },
      },
    ])

    expect(imageAlts).toEqual(['Workspace at dusk'])
  })

  it('compiles selected theme variables for generic block exports', () => {
    const css = buildLakebedThemeCss({ isDark: true, theme: 'default' })

    expect(css).toContain('--background:')
    expect(css).toContain('--foreground:')
    expect(css).toContain('color-scheme: dark')
  })
})
