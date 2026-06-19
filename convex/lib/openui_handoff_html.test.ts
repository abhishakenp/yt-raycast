import { describe, expect, it } from 'vitest'

import { buildOpenUiHandoffHtml } from './openui_handoff_html'

describe('buildOpenUiHandoffHtml', () => {
  it('embeds escaped OpenUI source for client-side preview handoff', () => {
    const source = '$page = "Home"\nroot = Hero("A&B", "<copy>")'
    const html = buildOpenUiHandoffHtml({
      source,
      locale: 'en',
      brand: 'Ship & Fast',
      prompt: 'Build <commerce> "site"',
    })

    expect(html).toContain('id="openui-root" data-openui-ready="source"')
    expect(html).toContain('id="ship-fast-openui-source"')
    expect(html).toContain('Ship &amp; Fast')
    expect(html).toContain('Build &lt;commerce&gt; &quot;site&quot;')
    expect(html).toContain(
      '$page = \\&quot;Home\\&quot;\\nroot = Hero(\\&quot;A&amp;B\\&quot;, \\&quot;&lt;copy&gt;\\&quot;)',
    )
    expect(html).not.toContain('<copy>')
  })

  it('uses a stable title fallback when the generator omits a brand', () => {
    const html = buildOpenUiHandoffHtml({
      source: 'root = LandingPage()',
      locale: 'en',
      brand: '',
      prompt: 'A site',
    })

    expect(html).toContain('<title>Generated Site</title>')
    expect(html).toContain('>Generated Site</h1>')
  })
})
