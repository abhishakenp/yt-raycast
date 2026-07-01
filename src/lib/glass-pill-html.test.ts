import { describe, expect, it } from 'vitest'

import {
  GLASS_LENS_FILTER_ID,
  glassPillAnchorHtml,
  glassPillButtonHtml,
  glassPillSvgDefs,
} from './glass-pill-html'

describe('glass pill HTML helpers', () => {
  it('renders SVG defs and decoration layers that reference the same filter id', () => {
    const defs = glassPillSvgDefs()
    const button = glassPillButtonHtml({ text: 'Generate' })

    expect(defs).toContain(`id="${GLASS_LENS_FILTER_ID}"`)
    expect(button).toContain(`url(#${GLASS_LENS_FILTER_ID})`)
    expect(button).toContain('Generate')
  })

  it('escapes user-provided attributes and text for buttons', () => {
    const html = glassPillButtonHtml({
      id: 'cta"primary',
      name: 'choice<form',
      value: 'A&B',
      text: '<Launch>',
      ariaLabel: 'Run "now"',
    })

    expect(html).toContain('id="cta&quot;primary"')
    expect(html).toContain('name="choice&lt;form"')
    expect(html).toContain('value="A&amp;B"')
    expect(html).toContain('aria-label="Run &quot;now&quot;"')
    expect(html).toContain('&lt;Launch>')
  })

  it('escapes link hrefs and labels while preserving explicit trusted html', () => {
    const escaped = glassPillAnchorHtml({
      href: '/search?q=a&b=<c>',
      text: 'Docs <beta>',
    })
    const trusted = glassPillAnchorHtml({
      href: '/pricing',
      html: '<strong>Pricing</strong>',
    })

    expect(escaped).toContain('href="/search?q=a&amp;b=&lt;c>"')
    expect(escaped).toContain('Docs &lt;beta>')
    expect(trusted).toContain('<strong>Pricing</strong>')
  })
})
