import { describe, expect, it } from 'vitest'

import { createHtmlExportFiles } from './html-export-files'

describe('createHtmlExportFiles', () => {
  it('includes SEO and answer-engine metadata files derived from HTML', () => {
    const files = createHtmlExportFiles(
      'session_123',
      'html',
      '<html><head><title>Atlas Notes</title><meta name="description" content="Shared launch docs for small teams."></head><body><h1>Atlas Notes</h1></body></html>',
      { includeBadge: false, siteUrl: 'https://atlas.example/demo' },
    )

    expect(files['index.html']).toContain('href="/llms.txt"')
    expect(files['index.html']).toContain(
      '<link rel="canonical" href="https://atlas.example/demo/" />',
    )
    expect(files['robots.txt']).toContain(
      'Sitemap: https://atlas.example/demo/sitemap.xml',
    )
    expect(files['sitemap.xml']).toContain(
      '<loc>https://atlas.example/demo/</loc>',
    )
    expect(files['llms.txt']).toContain('# Atlas Notes')
    expect(files['llms.txt']).toContain('Shared launch docs for small teams.')
  })

  it('does not inject an example.com canonical URL when no public site URL exists', () => {
    const files = createHtmlExportFiles(
      'session_123',
      'html',
      '<html><head><title>Draft</title></head><body><h1>Draft</h1></body></html>',
      { includeBadge: false },
    )

    expect(files['index.html']).not.toContain('rel="canonical"')
    expect(files['robots.txt']).toContain('https://example.com/sitemap.xml')
  })
})
