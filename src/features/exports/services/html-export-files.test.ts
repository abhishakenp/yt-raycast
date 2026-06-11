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
    expect(files['robots.txt']).toContain(
      'Sitemap: https://atlas.example/demo/sitemap.xml',
    )
    expect(files['sitemap.xml']).toContain(
      '<loc>https://atlas.example/demo/</loc>',
    )
    expect(files['llms.txt']).toContain('# Atlas Notes')
    expect(files['llms.txt']).toContain('Shared launch docs for small teams.')
  })
})
