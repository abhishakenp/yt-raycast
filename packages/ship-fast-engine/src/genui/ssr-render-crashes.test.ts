import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '../openui-ssr'

/**
 * Regression guard: motif-based pages must never blank out with the
 * `openui-error` panel because of malformed LLM output or missing data.
 */
async function expectRenders(source: string, locale = 'en') {
  const html = await renderOpenUIToHTML(source, undefined, locale)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

describe('SSR render crash safety', () => {
  it('renders a motif with no props (falls back to defaults)', async () => {
    await expectRenders('root = SplitHero()')
  })

  it('renders a motif with null nested array without crashing', async () => {
    await expectRenders('root = CardGrid(heading="Features", cards=null)')
  })

  it('renders a full page with multiple motifs', async () => {
    const html = await expectRenders(
      'root = PageSwitch(["Home"], [home])\nhome = Stack([SplitHero(), CardGrid(), Footer()])',
    )
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders pages with non-Latin / RTL copy', async () => {
    await expectRenders('root = SplitHero("المتجر", "أحدث القصص")', 'ar')
    await expectRenders('root = SplitHero("博客", "最新故事")', 'zh')
  })

  it('renders localized content from positional props', async () => {
    const html = await expectRenders(
      'root = SplitHero("കേരള ആരോഗ്യ ഭക്ഷണങ്ങൾ", "ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ")',
      'ml',
    )
    expect(html).toContain('കേരള ആരോഗ്യ ഭക്ഷണങ്ങൾ')
  })
})
