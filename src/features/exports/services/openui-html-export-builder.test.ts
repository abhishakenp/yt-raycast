import { parseHTML } from 'linkedom'
import { describe, expect, it, vi } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'
import type { OpenUIExportInput } from './openui-export-types'

function baseInput(overrides: Partial<OpenUIExportInput>): OpenUIExportInput {
  return {
    source: '',
    sessionId: 'export-test-session',
    target: 'html',
    ...overrides,
  }
}

function parseDoc(html: string) {
  return parseHTML(html).document
}

function findBadge(html: string) {
  const doc = parseDoc(html)
  return doc.querySelector('[data-ship-fast-export-badge]')
}

describe('buildOpenUIHtmlExport — HTML document source passthrough', () => {
  it('returns a full HTML document source verbatim (trimmed) with html content type', async () => {
    const source =
      '<!doctype html><html><head><title>Doc</title></head><body><h1>Hi</h1></body></html>'
    const result = await buildOpenUIHtmlExport(baseInput({ source }))

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    expect(result.fileCount).toBe(1)
    // The document-source branch returns the trimmed source directly (no badge
    // injection), because the source is already a complete HTML document.
    expect(result.body).toBe(source)
  })

  it('treats a leading <html> tag (no doctype) as a document source', async () => {
    const source = '<html><body><p>No doctype</p></body></html>'
    const result = await buildOpenUIHtmlExport(baseInput({ source }))

    expect(result.body).toBe(source)
  })

  it('does not double-process a document source even when previewHtml is provided', async () => {
    const source = '<!doctype html><html><body><h1>Real Doc</h1></body></html>'
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, previewHtml: '<div>preview</div>' }),
    )

    expect(result.body).toBe(source)
  })
})

describe('buildOpenUIHtmlExport — HTML-like fragment source', () => {
  it('wraps an HTML-like fragment in the export shell with a badge by default', async () => {
    const source = '<div><h1>Fragment</h1></div>'
    const result = await buildOpenUIHtmlExport(baseInput({ source }))

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    const html = typeof result.body === 'string' ? result.body : ''
    expect(html).toContain('<h1>Fragment</h1>')
    expect(findBadge(html)).not.toBeNull()
  })

  it('uses the previewHtml when it is usable and present', async () => {
    const source = '<div>raw source</div>'
    const previewHtml =
      '<div id="openui-root"><div class="hero-title">Preview Content</div></div>'
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, previewHtml }),
    )

    const html = typeof result.body === 'string' ? result.body : ''
    expect(html).toContain('Preview Content')
  })

  it('falls back to the source when previewHtml is an error placeholder', async () => {
    const source = '<div>real source fragment</div>'
    const previewHtml = '<div class="openui-error">failed to render</div>'
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, previewHtml }),
    )

    const html = typeof result.body === 'string' ? result.body : ''
    expect(html).toContain('real source fragment')
    expect(html).not.toContain('openui-error')
  })

  it('omits the badge when includeBadge is false', async () => {
    const source = '<div><h1>No Badge</h1></div>'
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, includeBadge: false }),
    )

    const html = typeof result.body === 'string' ? result.body : ''
    expect(findBadge(html)).toBeNull()
    expect(html).toContain('No Badge')
  })
})

describe('buildOpenUIHtmlExport — OpenUI source parsing', () => {
  it('rejects an empty non-HTML source with an OpenUI parser error', async () => {
    await expect(
      buildOpenUIHtmlExport(baseInput({ source: '' })),
    ).rejects.toThrow(/OpenUI source/)
  })

  it('rejects a plain-text (non-HTML, non-OpenUI) source with a parser error', async () => {
    await expect(
      buildOpenUIHtmlExport(baseInput({ source: 'just some plain text' })),
    ).rejects.toThrow(/OpenUI source/)
  })

  it('compiles current app Tailwind utilities for section capsule exports', async () => {
    const result = await buildOpenUIHtmlExport(
      baseInput({
        source: 'root = AeoHero()',
        siteSpecJson: JSON.stringify({ projectName: 'AEO export' }),
        includeBadge: false,
      }),
    )
    const html = typeof result.body === 'string' ? result.body : ''
    const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''

    expect(html).toContain('Get cited by AI answers')
    expect(style).toContain('.lg\\:col-span-7')
    expect(style).toContain('grid-column: span 7 / span 7')
    expect(style).toContain('font-size: clamp(2.75rem, 7vw, 6rem)')
    expect(html).not.toContain('openui-preview-tailwind.css')
  })

  it('uses dashboard-equivalent image context and writes detached public image URLs', async () => {
    const originalPexelsKey = process.env.PEXELS_API_KEY
    const originalVitePexelsKey = process.env.VITE_PEXELS_API_KEY
    const originalFetch = globalThis.fetch
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              large: 'https://images.pexels.test/citeable-route-large.jpg',
            },
          },
        ],
      }),
    )

    try {
      process.env.PEXELS_API_KEY = 'pexels-key'
      delete process.env.VITE_PEXELS_API_KEY
      globalThis.fetch = fetchMock as unknown as typeof fetch

      const result = await buildOpenUIHtmlExport(
        baseInput({
          source: 'root = Image("hero image")',
          prompt: 'how do i get cited by chatgpt?',
          siteSpecJson: JSON.stringify({
            brand: 'citeable',
            tagline: 'answers.watch',
          }),
          includeBadge: false,
        }),
      )
      const html = typeof result.body === 'string' ? result.body : ''
      const calls = fetchMock.mock.calls as unknown as Array<
        [RequestInfo | URL, RequestInit | undefined]
      >
      const providerUrls = calls.map((call) => String(call[0]))

      expect(providerUrls.length).toBeGreaterThan(0)
      expect(
        providerUrls.every((url) =>
          url.includes('query=citeable+answers+watch+how+hero'),
        ),
      ).toBe(true)
      expect(html).toContain(
        'https://images.pexels.test/citeable-route-large.jpg',
      )
      expect(html).not.toContain('/api/pexels')
      expect(html).not.toContain('PEXELS_API_KEY')
    } finally {
      globalThis.fetch = originalFetch
      if (originalPexelsKey === undefined) delete process.env.PEXELS_API_KEY
      else process.env.PEXELS_API_KEY = originalPexelsKey
      if (originalVitePexelsKey === undefined) {
        delete process.env.VITE_PEXELS_API_KEY
      } else {
        process.env.VITE_PEXELS_API_KEY = originalVitePexelsKey
      }
    }
  })
})
