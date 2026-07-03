import { describe, expect, it } from 'vitest'

import {
  buildExportSeoBundle,
  renderJsonLdScript,
  renderNextMetadataExport,
  renderNextRobotsRoute,
  renderNextSitemapRoute,
} from './export-seo'

const siteSpecWithSeo = JSON.stringify({
  projectName: 'Acme Store',
  siteType: 'ecommerce',
  seo: {
    siteUrl: 'https://acme.example.com',
    siteName: 'Acme Store',
    description: 'Buy the best widgets online.',
    locale: 'en_US',
    keywords: ['widgets', 'online store'],
    ogImage: 'https://acme.example.com/og.png',
    ogImageAlt: 'Acme Store preview',
    twitterCard: 'summary_large_image',
  },
  generatedTimestamp: '2024-06-01T00:00:00.000Z',
  pages: [
    {
      route: '/',
      title: 'Home',
      description: 'Acme Store homepage',
      seo: { title: 'Acme Store - Home', description: 'Acme Store homepage' },
      aeo: {
        objective: 'Sell widgets online',
        targetIntent: 'purchase',
        suggestedQueries: ['buy widgets', 'widget store'],
      },
    },
    {
      route: '/shop',
      title: 'Shop',
      description: 'Browse our widget catalog',
      seo: {
        title: 'Shop - Acme Store',
        description: 'Browse our widget catalog',
      },
    },
  ],
})

describe('export-seo', () => {
  it('always returns a bundle even when no siteSpecJson is provided', () => {
    const bundle = buildExportSeoBundle(undefined, [
      { path: '/', label: 'Home' },
    ])
    expect(bundle).not.toBeNull()
    expect(bundle.routes.size).toBe(1)
    const home = bundle.routes.get('/')
    expect(home).toBeDefined()
    expect(home!.seo.title).toBe('Home')
  })

  // Contract change: generated siteSpecs carry no seo block at all (only
  // brand/theme/locale/modules), so a null bundle meant every real export
  // shipped without description/OG/Twitter/JSON-LD. The bundle now
  // synthesizes baseline metadata whenever a spec exists.
  it('synthesizes baseline SEO when siteSpecJson has no seo block', () => {
    const bundle = buildExportSeoBundle(JSON.stringify({ foo: 'bar' }), [
      { path: '/', label: 'Home' },
    ])
    expect(bundle).not.toBeNull()
    expect(bundle.routes.size).toBe(1)
    const home = bundle!.homeSeo!
    expect(home.seo.robots).toBe('index, follow')
    expect(home.headTags.join('\n')).toContain('og:title')
    expect(home.headTags.join('\n')).toContain('twitter:card')
    expect(home.structuredDataJson).toContain('WebSite')
  })

  it('uses projectName as synthesized title and site name', () => {
    const bundle = buildExportSeoBundle(
      JSON.stringify({ projectName: 'Export Demo' }),
      [{ path: '/', label: 'Home' }],
    )
    expect(bundle).not.toBeNull()
    expect(bundle!.homeSeo!.seo.siteName).toBe('Export Demo')
    expect(bundle!.homeSeo!.seo.title).toBe('Export Demo')
  })

  it('folds generated-spec brand/locale into synthesized SEO', () => {
    const bundle = buildExportSeoBundle(
      JSON.stringify({ brand: 'Portfolio Aiko', locale: 'ja', modules: [] }),
      [{ path: '/', label: 'Home' }],
    )
    expect(bundle).not.toBeNull()
    const home = bundle!.homeSeo!
    expect(home.seo.siteName).toBe('Portfolio Aiko')
    expect(home.seo.htmlLang).toBe('ja')
    expect(home.headTags.join('\n')).toContain('og:site_name')
  })

  it('applies per-route fallback descriptions from rendered markup', () => {
    const bundle = buildExportSeoBundle(
      JSON.stringify({ brand: 'Portfolio Aiko' }),
      [{ path: '/', label: 'Home' }],
      {
        fallbackDescriptions: {
          '/': 'Hand-crafted ceramics by Aiko Tanaka in Tokyo.',
        },
      },
    )
    expect(bundle!.homeSeo!.seo.description).toBe(
      'Hand-crafted ceramics by Aiko Tanaka in Tokyo.',
    )
    expect(bundle!.homeSeo!.headTags.join('\n')).toContain(
      'name="description" content="Hand-crafted ceramics',
    )
  })

  it('uses route label as title for non-home routes when no projectName', () => {
    const bundle = buildExportSeoBundle(undefined, [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
    ])
    expect(bundle).not.toBeNull()
    const home = bundle.routes.get('/')
    expect(home!.seo.title).toBe('Home')
    const about = bundle.routes.get('/about')
    expect(about!.seo.title).toBe('About')
  })

  it('builds per-route SEO with meta tags, structured data, and Next.js metadata', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
      { path: '/shop', label: 'Shop' },
    ])
    expect(bundle).not.toBeNull()
    expect(bundle.routes.size).toBe(2)

    const home = bundle.routes.get('/')
    expect(home).toBeDefined()
    expect(home!.seo.title).toBe('Acme Store - Home')
    expect(home!.seo.siteName).toBe('Acme Store')
    expect(home!.seo.canonicalUrl).toContain('acme.example.com')
    expect(home!.headTags.some((t) => t.includes('og:title'))).toBe(true)
    expect(home!.headTags.some((t) => t.includes('twitter:card'))).toBe(true)
    expect(home!.structuredDataJson).toContain('schema.org')
    expect(home!.nextMetadata).toHaveProperty('title')
    expect(home!.nextMetadata).toHaveProperty('openGraph')

    const shop = bundle.routes.get('/shop')
    expect(shop).toBeDefined()
    expect(shop!.seo.title).toBe('Shop - Acme Store')
  })

  it('falls back to route label when no matching siteSpec page exists', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/about', label: 'About' },
    ])
    expect(bundle).not.toBeNull()
    const about = bundle.routes.get('/about')
    expect(about).toBeDefined()
    expect(about!.seo.title).toBeTruthy()
  })

  it('generates robots.txt, sitemap.xml, and llms.txt', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
      { path: '/shop', label: 'Shop' },
    ])
    expect(bundle).not.toBeNull()
    expect(bundle.robotsTxt).toContain('User-agent: *')
    expect(bundle.robotsTxt).toContain('Sitemap:')
    expect(bundle.sitemapXml).toContain('<urlset')
    expect(bundle.sitemapXml).toContain('acme.example.com')
    expect(bundle.llmsTxt).toContain('# Acme Store')
    expect(bundle.llmsTxt).toContain('## Pages')
  })

  it('exposes homeSeo for the root route', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
      { path: '/shop', label: 'Shop' },
    ])
    expect(bundle).not.toBeNull()
    expect(bundle.homeSeo).toBe(bundle.routes.get('/'))
  })

  it('renderNextMetadataExport produces valid Next.js metadata export', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
    ])
    const meta = renderNextMetadataExport(bundle.homeSeo!)
    expect(meta).toContain('export const metadata = {')
    expect(meta).toContain('title:')
    expect(meta).toContain('openGraph:')
  })

  it('renderJsonLdScript produces a script tag with dangerouslySetInnerHTML', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
    ])
    const script = renderJsonLdScript(bundle.homeSeo!)
    expect(script).toContain('application/ld+json')
    expect(script).toContain('dangerouslySetInnerHTML')
  })

  it('renderNextRobotsRoute produces a valid robots route', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
    ])
    const route = renderNextRobotsRoute(bundle.robotsTxt)
    expect(route).toContain('MetadataRoute.Robots')
    expect(route).toContain('userAgent')
    expect(route).toContain('sitemap')
  })

  it('renderNextSitemapRoute produces a valid sitemap route', () => {
    const bundle = buildExportSeoBundle(siteSpecWithSeo, [
      { path: '/', label: 'Home' },
      { path: '/shop', label: 'Shop' },
    ])
    const route = renderNextSitemapRoute(bundle.sitemapXml)
    expect(route).not.toBeNull()
    expect(route).toContain('MetadataRoute.Sitemap')
    expect(route).toContain('acme.example.com')
  })
})
