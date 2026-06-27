import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'

import {
  createHtmlExportFiles,
  createNextExportFiles,
  createReactExportFiles,
} from './html-export-files'

const expectShipFastReadme = (readme = '') => {
  expect(readme).toContain(
    'Generated with [ShipFast](https://ship-fast.io) 🚀.',
  )
  expect(readme).not.toContain('Session:')
  expect(readme).not.toContain('Target:')
}

const parseHtmlDocument = (html: string) => parseHTML(html).document

describe('createHtmlExportFiles', () => {
  it('includes SEO and answer-engine metadata files derived from HTML', () => {
    const files = createHtmlExportFiles(
      'session_123',
      'html',
      '<html><head><title>Atlas Notes</title><meta name="description" content="Shared launch docs for small teams."></head><body><h1>Atlas Notes</h1></body></html>',
      { includeBadge: false, siteUrl: 'https://atlas.example/demo' },
    )

    const document = parseHtmlDocument(files['index.html'])

    // llms.txt discovery link is injected into <head>
    const llmsLink = document.querySelector('link[rel="alternate"][href="/llms.txt"]')
    expect(llmsLink).not.toBeNull()
    expect(llmsLink?.getAttribute('type')).toBe('text/plain')
    expect(llmsLink?.getAttribute('title')).toBe('LLM-readable site summary')

    // canonical link points at the normalized public site URL
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical?.getAttribute('href')).toBe('https://atlas.example/demo/')

    // robots.txt references the sitemap at the public site URL
    expect(files['robots.txt']).toContain(
      'Sitemap: https://atlas.example/demo/sitemap.xml',
    )

    // sitemap.xml is well-formed XML with a <url> entry for the site root
    const sitemapDocument = parseHTML(files['sitemap.xml']).document
    const locs = sitemapDocument.querySelectorAll('urlset > url > loc')
    expect(locs).toHaveLength(1)
    expect(locs[0]?.textContent).toBe('https://atlas.example/demo/')

    // llms.txt is plain text: title heading + description summary line
    expect(files['llms.txt']).toContain('# Atlas Notes')
    expect(files['llms.txt']).toContain('Shared launch docs for small teams.')
    expectShipFastReadme(files['README.md'])
  })

  it('does not inject an example.com canonical URL when no public site URL exists', () => {
    const files = createHtmlExportFiles(
      'session_123',
      'html',
      '<html><head><title>Draft</title></head><body><h1>Draft</h1></body></html>',
      { includeBadge: false },
    )

    const document = parseHtmlDocument(files['index.html'])
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()

    // robots.txt falls back to the example.com default sitemap URL
    expect(files['robots.txt']).toContain('https://example.com/sitemap.xml')
  })

  it('writes branded README files for React and Next exports without session metadata', () => {
    const reactFiles = createReactExportFiles(
      'session_123',
      'react',
      '<html><head><title>React Demo</title></head><body><h1>React Demo</h1></body></html>',
      { includeBadge: false },
    )
    const nextFiles = createNextExportFiles(
      'session_123',
      'next',
      '<html><head><title>Next Demo</title></head><body><h1>Next Demo</h1></body></html>',
      { includeBadge: false },
    )

    expectShipFastReadme(reactFiles['README.md'])
    expectShipFastReadme(nextFiles['README.md'])
  })
})
