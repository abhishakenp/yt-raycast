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
  it('renders only the landing page and omits runtime-only document work', async () => {
    const thumbnail = await buildOpenUIHtmlThumbnail(input)
    const html = String(thumbnail.body)

    expect(renderOpenUIToHTMLWithThemeMock).toHaveBeenCalledTimes(1)
    expect(html.match(/data-sf-export-page=/g)).toHaveLength(1)
    expect(html).toContain('data-sf-export-page="Home"')
    expect(html).toContain('data-rendered-page="true"')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<title>')
    expect(html).not.toContain('fonts.googleapis.com')
    expect(html).not.toContain('data-ship-fast-export-badge')
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
