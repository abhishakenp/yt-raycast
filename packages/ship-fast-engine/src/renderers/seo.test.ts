import { describe, it, expect } from 'vitest'
import {
  buildSitemapEntries,
  buildNextMetadata,
  buildStructuredData,
  normalizeSiteUrl,
  renderRobotsTxt,
  renderSitemapXml,
  resolveAssetUrl,
  resolvePageSeo,
  serializeStructuredData,
} from './seo'
import type { SiteSpecLike, SitePageLike } from '@ship-fast/aeo'

function makeSiteSpec(overrides: Partial<SiteSpecLike> = {}): SiteSpecLike {
  return {
    projectName: 'Test Site',
    siteType: 'landing',
    seo: {
      siteUrl: 'https://example.com',
      title: 'Test Site',
      description: 'A test site',
      siteName: 'Test Site',
      ...overrides.seo,
    },
    pages: overrides.pages ?? [
      { route: '/', title: 'Home' },
      { route: '/about', title: 'About' },
    ],
    ...overrides,
  }
}

describe('normalizeSiteUrl (re-exported)', () => {
  it('normalizes a bare domain to https', () => {
    expect(normalizeSiteUrl('example.com')).toBe('https://example.com')
  })

  it('preserves https URLs and strips trailing slashes', () => {
    expect(normalizeSiteUrl('https://example.com/')).toBe('https://example.com')
  })

  it('returns empty string for invalid input', () => {
    expect(normalizeSiteUrl('')).toBe('')
    expect(normalizeSiteUrl('not a url')).toBe('')
  })
})

describe('resolveAssetUrl (re-exported)', () => {
  it('returns absolute URLs unchanged', () => {
    expect(resolveAssetUrl('https://cdn.example.com/img.png')).toBe(
      'https://cdn.example.com/img.png',
    )
  })

  it('resolves relative paths against site URL', () => {
    expect(resolveAssetUrl('/img.png', 'https://example.com')).toBe(
      'https://example.com/img.png',
    )
  })

  it('returns empty for relative path without site URL', () => {
    expect(resolveAssetUrl('img.png', '')).toBe('')
  })

  it('returns root-relative path when no site URL', () => {
    expect(resolveAssetUrl('/img.png', '')).toBe('/img.png')
  })
})

describe('serializeStructuredData (re-exported)', () => {
  it('serializes a single entry as an object', () => {
    const result = serializeStructuredData([{ '@type': 'WebPage' }])
    expect(result).toBe('{"@type":"WebPage"}')
  })

  it('serializes multiple entries as an array', () => {
    const result = serializeStructuredData([
      { '@type': 'WebPage' },
      { '@type': 'FAQPage' },
    ])
    expect(result).toBe('[{"@type":"WebPage"},{"@type":"FAQPage"}]')
  })

  it('escapes < characters', () => {
    const result = serializeStructuredData([{ html: '<script>' }])
    expect(result).not.toContain('<')
    expect(result).toContain('\\u003c')
  })
})

describe('resolvePageSeo', () => {
  it('resolves SEO from site spec and page', () => {
    const siteSpec = makeSiteSpec()
    const page: SitePageLike = { route: '/', title: 'Home Page' }
    const seo = resolvePageSeo(siteSpec, page)
    expect(seo.title).toBe('Home Page')
    expect(seo.siteUrl).toBe('https://example.com')
    expect(seo.htmlLang).toBe('en-US')
  })

  it('falls back to site title when page has none', () => {
    const siteSpec = makeSiteSpec()
    const seo = resolvePageSeo(siteSpec, { route: '/about' })
    expect(seo.title).toBe('Test Site')
  })

  it('returns defaults for null inputs', () => {
    const seo = resolvePageSeo(null, null)
    expect(seo.title).toBe('')
    expect(seo.siteName).toBe('Website')
    expect(seo.locale).toBe('en_US')
  })
})

describe('buildStructuredData', () => {
  it('produces WebSite entry for homepage', () => {
    const siteSpec = makeSiteSpec()
    const data = buildStructuredData(siteSpec, { route: '/' })
    const types = data.map((entry) => entry['@type'])
    expect(types).toContain('WebSite')
  })

  it('returns an array', () => {
    const siteSpec = makeSiteSpec()
    const data = buildStructuredData(siteSpec, { route: '/about' })
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('buildNextMetadata', () => {
  it('builds metadata object from site spec and page', () => {
    const siteSpec = makeSiteSpec()
    const metadata = buildNextMetadata(siteSpec, { route: '/' })
    expect(metadata).toHaveProperty('title')
    expect(metadata).toHaveProperty('description')
  })

  it('handles null inputs gracefully', () => {
    const metadata = buildNextMetadata(null, null)
    expect(metadata).toHaveProperty('robots')
  })
})

describe('buildSitemapEntries', () => {
  it('returns empty array when no siteUrl', () => {
    const siteSpec = makeSiteSpec({
      seo: { siteUrl: '' },
    })
    expect(buildSitemapEntries(siteSpec)).toEqual([])
  })

  it('returns empty array for null siteSpec', () => {
    expect(buildSitemapEntries(null)).toEqual([])
  })

  it('generates entries for all pages', () => {
    const siteSpec = makeSiteSpec()
    const entries = buildSitemapEntries(siteSpec)
    expect(entries).toHaveLength(2)
    expect(entries[0]?.url).toBe('https://example.com/')
    expect(entries[1]?.url).toBe('https://example.com/about')
  })

  it('sets weekly + priority 1 for homepage', () => {
    const siteSpec = makeSiteSpec()
    const entries = buildSitemapEntries(siteSpec)
    const home = entries.find((e) => e?.url?.endsWith('/'))
    expect(home?.changeFrequency).toBe('weekly')
    expect(home?.priority).toBe(1)
  })

  it('sets monthly + priority 0.8 for non-homepage', () => {
    const siteSpec = makeSiteSpec()
    const entries = buildSitemapEntries(siteSpec)
    const about = entries.find((e) => e?.url?.includes('/about'))
    expect(about?.changeFrequency).toBe('monthly')
    expect(about?.priority).toBe(0.8)
  })

  it('excludes noIndex pages', () => {
    const siteSpec = makeSiteSpec({
      pages: [
        { route: '/', title: 'Home' },
        { route: '/secret', title: 'Secret', seo: { noIndex: true } },
      ],
    })
    const entries = buildSitemapEntries(siteSpec)
    expect(entries).toHaveLength(1)
    expect(entries[0]?.url).toBe('https://example.com/')
  })

  it('includes lastModified from generatedTimestamp', () => {
    const siteSpec = makeSiteSpec({
      generatedTimestamp: '2024-01-15T10:00:00Z',
    })
    const entries = buildSitemapEntries(siteSpec)
    expect(entries[0]?.lastModified).toBe('2024-01-15T10:00:00.000Z')
  })

  it('adds ecommerce extras for /shop and /checkout routes', () => {
    const siteSpec = makeSiteSpec({
      siteType: 'ecommerce',
      pages: [
        { route: '/', title: 'Home' },
        { route: '/shop', title: 'Shop' },
        { route: '/checkout', title: 'Checkout' },
      ],
    })
    const entries = buildSitemapEntries(siteSpec)
    const urls = entries.map((e) => e?.url)
    expect(urls).toContain('https://example.com/shop')
    expect(urls).toContain('https://example.com/checkout')
    // The extra /shop entry has priority 0.85 and weekly frequency
    const shopExtras = entries.filter(
      (e) => e?.url?.endsWith('/shop') && e?.priority === 0.85,
    )
    expect(shopExtras).toHaveLength(1)
    expect(shopExtras[0]?.changeFrequency).toBe('weekly')
    // The extra /checkout entry has priority 0.6 and monthly frequency
    const checkoutExtras = entries.filter(
      (e) => e?.url?.endsWith('/checkout') && e?.priority === 0.6,
    )
    expect(checkoutExtras).toHaveLength(1)
    expect(checkoutExtras[0]?.changeFrequency).toBe('monthly')
  })

  it('does not add ecommerce extras when routes are absent', () => {
    const siteSpec = makeSiteSpec({
      siteType: 'ecommerce',
      pages: [{ route: '/', title: 'Home' }],
    })
    const entries = buildSitemapEntries(siteSpec)
    expect(entries).toHaveLength(1)
  })

  it('does not add ecommerce extras for non-ecommerce sites', () => {
    const siteSpec = makeSiteSpec({
      siteType: 'landing',
      pages: [
        { route: '/', title: 'Home' },
        { route: '/shop', title: 'Shop' },
      ],
    })
    const entries = buildSitemapEntries(siteSpec)
    expect(entries).toHaveLength(2)
  })
})

describe('renderRobotsTxt', () => {
  it('renders basic robots.txt with allow all', () => {
    const siteSpec = makeSiteSpec()
    const robots = renderRobotsTxt(siteSpec)
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
  })

  it('includes sitemap URL when siteUrl is set', () => {
    const siteSpec = makeSiteSpec()
    const robots = renderRobotsTxt(siteSpec)
    expect(robots).toContain('Sitemap: https://example.com/sitemap.xml')
  })

  it('omits sitemap line when no siteUrl', () => {
    const siteSpec = makeSiteSpec({ seo: { siteUrl: '' } })
    const robots = renderRobotsTxt(siteSpec)
    expect(robots).not.toContain('Sitemap:')
  })

  it('ends with a newline', () => {
    const robots = renderRobotsTxt(makeSiteSpec())
    expect(robots.endsWith('\n')).toBe(true)
  })

  it('handles null siteSpec', () => {
    const robots = renderRobotsTxt(null)
    expect(robots).toContain('User-agent: *')
    expect(robots).not.toContain('Sitemap:')
  })
})

describe('renderSitemapXml', () => {
  it('renders valid XML sitemap', () => {
    const siteSpec = makeSiteSpec()
    const xml = renderSitemapXml(siteSpec)
    expect(xml).not.toBeNull()
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<urlset')
    expect(xml).toContain('<url>')
    expect(xml).toContain('<loc>https://example.com/</loc>')
    expect(xml).toContain('<loc>https://example.com/about</loc>')
  })

  it('includes lastmod, changefreq, and priority tags', () => {
    const xml = renderSitemapXml(makeSiteSpec())
    expect(xml).toContain('<lastmod>')
    expect(xml).toContain('<changefreq>')
    expect(xml).toContain('<priority>')
  })

  it('returns null when no siteUrl', () => {
    const siteSpec = makeSiteSpec({ seo: { siteUrl: '' } })
    expect(renderSitemapXml(siteSpec)).toBeNull()
  })

  it('returns null when no pages', () => {
    const siteSpec = makeSiteSpec({ pages: [] })
    expect(renderSitemapXml(siteSpec)).toBeNull()
  })

  it('returns null for null siteSpec', () => {
    expect(renderSitemapXml(null)).toBeNull()
  })

  it('includes ecommerce extra routes in XML', () => {
    const siteSpec = makeSiteSpec({
      siteType: 'ecommerce',
      pages: [
        { route: '/', title: 'Home' },
        { route: '/shop', title: 'Shop' },
        { route: '/checkout', title: 'Checkout' },
      ],
    })
    const xml = renderSitemapXml(siteSpec)
    expect(xml).toContain('<loc>https://example.com/shop</loc>')
    expect(xml).toContain('<loc>https://example.com/checkout</loc>')
  })
})
