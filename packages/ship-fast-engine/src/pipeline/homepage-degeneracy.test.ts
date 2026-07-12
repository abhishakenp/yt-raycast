import { describe, expect, it } from 'vitest'
import {
  promptExpectsNovaDenseMarketing,
  explainNovaMarketingBarFailures,
  htmlFailsNovaMarketingBar,
  htmlLooksDegenerate,
} from './homepage-degeneracy'

/** Builds a valid Nova marketing page that passes the bar (no failures). */
function validNovaPage(): string {
  const words = Array.from({ length: 130 }, (_, i) => `word${i}`).join(' ')
  const sections = Array.from(
    { length: 6 },
    (_, i) => `<section id="sec${i}"><p>Section ${i}</p></section>`,
  ).join('\n')
  return `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head><body>
    <section id="pricing"><h2>Pricing</h2><p>$10/mo</p></section>
    <section id="faq"><h2>FAQ</h2><p>Frequently asked questions</p></section>
    <div class="blur-3xl"></div>
    ${sections}
    <main><p>${words}</p></main>
  </body></html>`
}

describe('promptExpectsNovaDenseMarketing', () => {
  it('returns true for saas', () => {
    expect(promptExpectsNovaDenseMarketing('a saas landing page')).toBe(true)
  })

  it('returns true for landing page', () => {
    expect(
      promptExpectsNovaDenseMarketing('a landing page for my product'),
    ).toBe(true)
  })

  it('returns true for marketing page', () => {
    expect(
      promptExpectsNovaDenseMarketing('a marketing site for B2B software'),
    ).toBe(true)
  })

  it('returns false for ecommerce', () => {
    expect(promptExpectsNovaDenseMarketing('an ecommerce store')).toBe(false)
  })

  it('returns false for online store', () => {
    expect(
      promptExpectsNovaDenseMarketing('an online store with checkout'),
    ).toBe(false)
  })

  it('returns false for dashboard', () => {
    expect(promptExpectsNovaDenseMarketing('a dashboard admin panel')).toBe(
      false,
    )
  })

  it('returns false for arcade', () => {
    expect(promptExpectsNovaDenseMarketing('an arcade fps game')).toBe(false)
  })

  it('returns false for docs', () => {
    expect(
      promptExpectsNovaDenseMarketing('a documentation site for developers'),
    ).toBe(false)
  })

  it('returns false for government portal', () => {
    expect(
      promptExpectsNovaDenseMarketing('a government portal for citizens'),
    ).toBe(false)
  })

  it('returns false for portfolio', () => {
    expect(
      promptExpectsNovaDenseMarketing('a portfolio for a photographer'),
    ).toBe(false)
  })

  it('returns true for AI + tool', () => {
    expect(promptExpectsNovaDenseMarketing('an AI tool for developers')).toBe(
      true,
    )
  })

  it('returns true for LLM + platform', () => {
    expect(promptExpectsNovaDenseMarketing('an LLM platform for teams')).toBe(
      true,
    )
  })

  it('returns false for empty prompt', () => {
    expect(promptExpectsNovaDenseMarketing('')).toBe(false)
  })

  it('returns false for whitespace-only prompt', () => {
    expect(promptExpectsNovaDenseMarketing('   ')).toBe(false)
  })

  it('returns true for devtools', () => {
    expect(promptExpectsNovaDenseMarketing('devtools for developers')).toBe(
      true,
    )
  })
})

describe('explainNovaMarketingBarFailures', () => {
  it('returns [] when no tailwind runtime present', () => {
    const html = '<html><body><p>hello</p></body></html>'
    expect(explainNovaMarketingBarFailures(html)).toEqual([])
  })

  it('returns [] for a valid page that passes the bar', () => {
    expect(explainNovaMarketingBarFailures(validNovaPage())).toEqual([])
  })

  it('reports missing pricing', () => {
    const html = validNovaPage()
      .replace(
        /<section id="pricing">[\s\S]*?<\/section>/,
        '<section><p>no pricing</p></section>',
      )
      .replace(/\$10\/mo/, 'free')
    const failures = explainNovaMarketingBarFailures(html)
    expect(failures.some((f) => f.includes('missing pricing'))).toBe(true)
  })

  it('reports missing FAQ', () => {
    const html = validNovaPage()
      .replace(
        /<section id="faq">[\s\S]*?<\/section>/,
        '<section><p>no questions here</p></section>',
      )
      .replace(/Frequently asked questions/, 'common questions')
    const failures = explainNovaMarketingBarFailures(html)
    expect(failures.some((f) => f.includes('missing FAQ'))).toBe(true)
  })

  it('reports missing visual hook', () => {
    const html = validNovaPage().replace(
      /<div class="blur-3xl"><\/div>/,
      '<div></div>',
    )
    const failures = explainNovaMarketingBarFailures(html)
    expect(failures.some((f) => f.includes('missing visual depth'))).toBe(true)
  })

  it('reports insufficient word count', () => {
    const words = Array.from({ length: 50 }, (_, i) => `w${i}`).join(' ')
    const sections = Array.from(
      { length: 6 },
      (_, i) => `<section id="sec${i}"><p>Section ${i}</p></section>`,
    ).join('\n')
    const html = `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head><body>
      <section id="pricing"><h2>Pricing</h2><p>$10/mo</p></section>
      <section id="faq"><h2>FAQ</h2><p>Frequently asked questions</p></section>
      <div class="blur-3xl"></div>
      ${sections}
      <main><p>${words}</p></main>
    </body></html>`
    const failures = explainNovaMarketingBarFailures(html)
    expect(failures.some((f) => f.includes('visible word count'))).toBe(true)
  })

  it('reports insufficient sections', () => {
    const words = Array.from({ length: 130 }, (_, i) => `word${i}`).join(' ')
    const html = `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head><body>
      <section id="pricing"><h2>Pricing</h2><p>$10/mo</p></section>
      <section id="faq"><h2>FAQ</h2><p>Frequently asked questions</p></section>
      <div class="blur-3xl"></div>
      <main><p>${words}</p></main>
    </body></html>`
    const failures = explainNovaMarketingBarFailures(html)
    expect(failures.some((f) => f.includes('<section> count'))).toBe(true)
  })
})

describe('htmlFailsNovaMarketingBar', () => {
  it('returns true when failures exist', () => {
    const html =
      '<html><body><script src="/scripts/tailwind-browser.js"></script><p>short</p></body></html>'
    expect(htmlFailsNovaMarketingBar(html)).toBe(true)
  })

  it('returns false when no tailwind runtime (no failures)', () => {
    const html = '<html><body><p>short</p></body></html>'
    expect(htmlFailsNovaMarketingBar(html)).toBe(false)
  })

  it('returns false for a valid page', () => {
    expect(htmlFailsNovaMarketingBar(validNovaPage())).toBe(false)
  })
})

describe('htmlLooksDegenerate', () => {
  it('returns true for short html (<350 chars)', () => {
    expect(htmlLooksDegenerate('<html><body>hi</body></html>')).toBe(true)
  })

  it('returns true for no html/doctype tag', () => {
    const long = 'x'.repeat(400)
    expect(htmlLooksDegenerate(`<body>${long}</body>`)).toBe(true)
  })

  it('returns true for no body tag', () => {
    const long = 'x'.repeat(400)
    expect(
      htmlLooksDegenerate(`<!DOCTYPE html><html><head></head>${long}</html>`),
    ).toBe(true)
  })

  it('returns true for low angle ratio (too much text, too few tags)', () => {
    const text = 'word '.repeat(1500)
    const html = `<!DOCTYPE html><html><head></head><body><div>${text}</div></body></html>`
    expect(html.length).toBeGreaterThan(6000)
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('returns true for high repetition (same word repeated >45 times)', () => {
    const text = Array.from({ length: 500 }, () => 'hello').join(' ')
    const html = `<!DOCTYPE html><html><head></head><body><div><p>${text}</p></div></body></html>`
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('returns true for high bigram repetition (>80 occurrences)', () => {
    const text = Array.from({ length: 200 }, () => 'yes no').join(' ')
    const html = `<!DOCTYPE html><html><head></head><body><div><p>${text}</p></div></body></html>`
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('returns true for long text with few structural tags (<3)', () => {
    const text = 'x'.repeat(13000)
    const html = `<!DOCTYPE html><html><head></head><body><div>${text}</div></body></html>`
    expect(html.length).toBeGreaterThan(12000)
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('returns true when nova marketing bar fails for saas prompt', () => {
    const html = `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head><body><p>short page</p></body></html>`
    // Pad to >350 chars to get past the first check
    const padded = html.replace(
      '</body>',
      '<div>' + 'x'.repeat(400) + '</div></body>',
    )
    expect(htmlLooksDegenerate(padded, { prompt: 'a saas landing page' })).toBe(
      true,
    )
  })

  it('returns false for valid html with structure', () => {
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')
    const sections = Array.from(
      { length: 6 },
      (_, i) => `<section><p>Section ${i}</p></section>`,
    ).join('\n')
    const html = `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head><body><header><nav>Nav</nav></header><main>${sections}<p>${words}</p></main><footer>Footer</footer></body></html>`
    expect(html.length).toBeGreaterThan(350)
    expect(htmlLooksDegenerate(html)).toBe(false)
  })

  it('returns false for valid html without nova prompt', () => {
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')
    const html = `<!DOCTYPE html><html><head></head><body><header><main><p>${words}</p></main></header></body></html>`
    expect(htmlLooksDegenerate(html, { prompt: 'a dashboard' })).toBe(false)
  })
})
