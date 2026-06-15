import { describe, expect, it } from 'vitest'

// @ts-expect-error - JS module without type declarations
import { renderOpenUIToHTML } from '../openui-ssr.js'

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
const expectRenders = (source: string, locale = 'en') => {
  const html = renderOpenUIToHTML(source, null, locale)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

describe('SSR render crash safety', () => {
  it('renders a blog post page whose section is missing its required blocks array', () => {
    // `blocks` is a required nested array; a model emitting it as null/omitted
    // previously threw `section.blocks.map is not a function`.
    expectRenders(
      'root = BlogPostKimiPage("Acme", ["Home"], {title: "A"}, {imageAlt: "x"}, ["intro"], [{heading: "One", blocks: null}, {heading: "Two"}])',
    )
  })

  it('renders the data-backed ecommerce page with no props (no live Convex/Lakebed runtime)', () => {
    const html = expectRenders('root = EcommerceKimiPage()')
    // It should fall back to its built-in catalogue rather than the error panel.
    expect(html.length).toBeGreaterThan(1000)
  })

  it('renders pages with non-Latin / RTL copy', () => {
    expectRenders(
      'root = BlogKimiPage("المتجر", ["الرئيسية"], {title: "أحدث القصص"})',
      'ar',
    )
    expectRenders(
      'root = BlogKimiPage("博客", ["首页"], {title: "最新故事"})',
      'zh',
    )
  })
})
