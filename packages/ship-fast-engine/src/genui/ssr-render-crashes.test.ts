import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '../openui-ssr'

/**
 * Regression guard: generated pages must never blank out with the
 * `openui-error` panel because of malformed LLM output or missing data
 * providers. These cases all used to crash the entire page during SSR.
 *
 * The fixes that keep them green:
 *  - schema-driven prop sanitizer in `defineCapsule` (drops null/missing nested
 *    arrays and bad scalars so a component falls back to its defaults), and
 *  - SSR-safe stub providers in `openui-ssr.js` (so data-backed capsules render
 *    without a live Convex/Lakebed runtime).
 */
async function expectRenders(source: string, locale = 'en') {
  const html = await renderOpenUIToHTML(source, undefined, locale)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

describe('SSR render crash safety', () => {
  it('renders a section whose required nested array is missing/null', async () => {
    // `features` is a nested array; a model emitting it as null/omitted
    // previously threw `features.map is not a function`. The section must fall
    // back to its baked-in feature defaults instead of crashing the page.
    await expectRenders('root = SaasFeatures("Acme", "Intro", null)')
  })

  it('renders data-backed ecommerce sections with no props (no live Convex/Lakebed runtime)', async () => {
    const html = await expectRenders(
      'root = PageSwitch(["Home"], [home])\nhome = Stack([EcommerceHero(), EcommerceFeatures(), EcommerceTestimonials()])',
    )
    // Sections should render with their built-in defaults rather than the error panel.
    expect(html.length).toBeGreaterThan(1000)
  })

  it('does not render ecommerce demo partner placeholders without supplied partner content', async () => {
    const html = await expectRenders(
      'root = EcommerceOverview("Kerala Health Foods", "ഹോം", "കേരള ആരോഗ്യ ഭക്ഷണങ്ങൾ", "നാടൻ ആരോഗ്യ ഉൽപ്പന്നങ്ങൾ")',
      'ml',
    )

    expect(html).not.toContain('BRAND ONE')
    expect(html).not.toContain('Brand Two')
  })

  it('renders localized ecommerce content from positional section arguments', async () => {
    const html = await expectRenders(
      'root = EcommerceOverview("Kerala Health Foods", "ഹോം", "കേരള ആരോഗ്യ ഭക്ഷണങ്ങൾ", "ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ")',
      'ml',
    )

    expect(html).toContain('കേരള ആരോഗ്യ ഭക്ഷണങ്ങൾ')
    expect(html).toContain('ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ')
    expect(html).not.toContain('Discover\\nSomething New')
  })

  it('renders pages with non-Latin / RTL copy', async () => {
    await expectRenders(
      'root = BlogHero("المتجر", "المتجر", "المتجر", "أحدث القصص")',
      'ar',
    )
    await expectRenders(
      'root = BlogHero("博客", "博客", "博客", "最新故事")',
      'zh',
    )
  })
})
