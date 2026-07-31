import { parseHTML } from 'linkedom'
import { describe, expect, it, vi } from 'vitest'

import {
  buildOpenUIHtmlExport,
  buildOpenUIHtmlThumbnail,
  isUsablePreviewHtml,
} from './openui-html-export-builder'
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

describe('buildOpenUIHtmlThumbnail', () => {
  it('keeps the rendered landing page while excluding later PageSwitch pages', async () => {
    const source = `root = PageSwitch(["Home", "Pricing"], [home, pricing])
home = Stack([Text("Gallery landing page")])
pricing = Stack([Text("Pricing page must not be captured")])`

    const result = await buildOpenUIHtmlThumbnail(
      baseInput({
        source,
        siteSpecJson: JSON.stringify({ projectName: 'Gallery thumbnail' }),
      }),
    )
    const html = String(result.body)

    expect(html).toContain('Gallery landing page')
    expect(html).not.toContain('Pricing page must not be captured')
    expect(html.match(/data-sf-export-page=/g)).toHaveLength(1)
    // JS runtime is now included for visual parity (nav scroll effects, etc.)
    expect(html).toContain('<script')
    expect(html).not.toContain('data-ship-fast-export-badge')
  })
})

describe('buildOpenUIHtmlExport — OpenUI source parsing', () => {
  it('does not treat OpenUI client bootstrap shells as usable rendered preview HTML', async () => {
    expect(
      isUsablePreviewHtml(
        '<!doctype html><html><body><div id="openui-root"></div><script id="openui-client-source" type="application/json">"root = Image()"</script></body></html>',
      ),
    ).toBe(false)
  })

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
        source:
          'root = SplitHero("AEO", "Get cited by AI answers", "Visibility", "Current section export")',
        siteSpecJson: JSON.stringify({ projectName: 'AEO export' }),
        includeBadge: false,
      }),
    )
    const html = typeof result.body === 'string' ? result.body : ''
    const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''

    expect(html).toContain('Get cited by AI answers')
    expect(style).toContain('grid-column')
    expect(style).toContain('font-size')
    expect(html).not.toContain('preview-tailwind.css')
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

describe('buildOpenUIHtmlExport — @design axis parity with dashboard', () => {
  it('emits DesignSystemProvider wrapper attributes when siteSpecJson contains @design intent', async () => {
    const source = 'root = Stack([Text("design parity")])'
    const siteSpecJson = JSON.stringify({
      projectName: 'Design Parity Test',
      design:
        'radius:rounded-xl shadow:shadow-lg density:compact typography:technical gradient:subtle motion:lively',
    })
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, siteSpecJson }),
    )
    const html = typeof result.body === 'string' ? result.body : ''

    // The SSR render must wrap output in DesignSystemProvider, emitting
    // data-{axis} attributes for named presets and --d-{axis} CSS custom
    // properties for Tailwind axes — matching the dashboard's live preview.
    expect(html).toContain('data-density="compact"')
    expect(html).toContain('data-typography="technical"')
    expect(html).toContain('data-gradient="subtle"')
    expect(html).toContain('data-motion="lively"')
    // Tailwind axes → CSS custom properties
    expect(html).toContain('--d-radius')
    expect(html).toContain('--d-shadow')
  })

  it('emits DEFAULT_DESIGN wrapper attributes when siteSpecJson has no @design intent', async () => {
    const source = 'root = Stack([Text("default design")])'
    const siteSpecJson = JSON.stringify({ projectName: 'No Design Intent' })
    const result = await buildOpenUIHtmlExport(
      baseInput({ source, siteSpecJson }),
    )
    const html = typeof result.body === 'string' ? result.body : ''

    // DEFAULT_DESIGN: density=balanced, typography=editorial, gradient=none, motion=subtle
    expect(html).toContain('data-density="balanced"')
    expect(html).toContain('data-typography="editorial"')
    expect(html).toContain('data-gradient="none"')
    expect(html).toContain('data-motion="subtle"')
  })
})

describe('buildOpenUIHtmlThumbnail — @design axis parity with dashboard', () => {
  it('emits DesignSystemProvider wrapper attributes when siteSpecJson contains @design intent', async () => {
    const source = 'root = Stack([Text("thumbnail design parity")])'
    const siteSpecJson = JSON.stringify({
      projectName: 'Thumbnail Design Parity',
      design:
        'radius:rounded-full shadow:shadow-2xl density:airy typography:display gradient:vibrant motion:none',
    })
    const result = await buildOpenUIHtmlThumbnail(
      baseInput({ source, siteSpecJson }),
    )
    const html = typeof result.body === 'string' ? result.body : ''

    expect(html).toContain('data-density="airy"')
    expect(html).toContain('data-typography="display"')
    expect(html).toContain('data-gradient="vibrant"')
    expect(html).toContain('data-motion="none"')
    expect(html).toContain('--d-radius')
    expect(html).toContain('--d-shadow')
  })
})
