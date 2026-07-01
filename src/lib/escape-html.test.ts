import { describe, expect, it } from 'vitest'

import { escapeHtml } from './escape-html'

describe('escapeHtml', () => {
  it('escapes characters that can break generated HTML text nodes or attributes', () => {
    expect(escapeHtml(`A&B <tag title="x" data='y'>`)).toBe(
      'A&amp;B &lt;tag title=&quot;x&quot; data=&#39;y&#39;>',
    )
  })
})
