import { describe, expect, it, vi } from 'vitest'

const renderOpenUIToHTMLWithThemeMock = vi.hoisted(() =>
  vi.fn(async () => ({
    html: '<article data-rendered-page="true">Rendered page</article>',
    cssVars: '',
  })),
)

vi.mock('@ship-fast/engine/openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: renderOpenUIToHTMLWithThemeMock,
}))

import {
  buildOpenUIHtmlExport,
  buildOpenUIHtmlThumbnail,
} from './openui-html-export-builder'
import type { OpenUIExportInput } from './openui-export-types'

const multiPageSource = `root = PageSwitch(["Home", "Pricing", "Contact"], [home, pricing, contact])
home = Stack([Text("Home page")])
pricing = Stack([Text("Pricing page")])
contact = Stack([Text("Contact page")])`

const input: OpenUIExportInput = {
  source: multiPageSource,
  sessionId: 'thumbnail-builder-test',
  siteSpecJson: JSON.stringify({ projectName: 'Thumbnail benchmark' }),
  target: 'html',
}

describe('buildOpenUIHtmlThumbnail', () => {
  it('renders only the landing page with JS runtime for visual parity', async () => {
    const thumbnail = await buildOpenUIHtmlThumbnail(input)
    const html = String(thumbnail.body)

    expect(renderOpenUIToHTMLWithThemeMock).toHaveBeenCalledTimes(1)
    // The thumbnail renders the full preprocessed source directly (like the
    // dashboard) instead of extracting/re-serializing the first page. This
    // preserves component variants that the re-serialization would lose.
    expect(html).toContain('data-rendered-page="true"')
    // JS runtime is included for visual parity (nav scroll effects, etc.)
    expect(html).toContain('<script')
    expect(html).toContain('__STATIC_SITE__')
    // No title (thumbnails are never indexed)
    expect(html).not.toContain('<title>')
    // Font parity: the thumbnail includes Google Fonts links so gallery
    // thumbnails match the dashboard preview's fonts.
    expect(html).toContain('fonts.googleapis.com')
    expect(html).not.toContain('data-ship-fast-export-badge')
  })

  it('includes global CSS custom properties from styles/index.css for parity', async () => {
    const thumbnail = await buildOpenUIHtmlThumbnail(input)
    const html = String(thumbnail.body)

    // The compiled Tailwind CSS has its own defaults for --ease-out and
    // --radius-lg. The global styles/index.css :root block must be appended
    // AFTER the compiled CSS so custom values override Tailwind defaults.
    // This ensures nav scroll easing, radii, glass effects, etc. match the
    // dashboard preview.
    const easeOutMatches = html.match(/--ease-out:\s*([^;]+);/g) ?? []
    expect(easeOutMatches.length).toBeGreaterThanOrEqual(2)
    expect(html).toContain('--ease-out: cubic-bezier(0.22, 1, 0.36, 1)')
    expect(html).toContain('--radius-lg: 16px')
    expect(html).toContain('--glass-bg:')
    expect(html).toContain('--glow:')
    expect(html).toContain('--text-muted:')
  })

  it('does one render instead of full export’s page-count-plus-one renders', async () => {
    const pageCount = 3

    await buildOpenUIHtmlExport({ ...input, includeBadge: false })
    const fullExportRenderCalls =
      renderOpenUIToHTMLWithThemeMock.mock.calls.length

    renderOpenUIToHTMLWithThemeMock.mockClear()
    await buildOpenUIHtmlThumbnail(input)
    const thumbnailRenderCalls =
      renderOpenUIToHTMLWithThemeMock.mock.calls.length

    expect(fullExportRenderCalls).toBe(pageCount + 1)
    expect(thumbnailRenderCalls).toBe(1)
    expect(fullExportRenderCalls - thumbnailRenderCalls).toBe(pageCount)
  })
})
