import { describe, expect, it } from 'vitest'
import {
  shouldReplaceLlmHomepageWithRenderer,
  htmlDocumentPassesPreviewQuality,
} from './homepage-substance'

interface SiteSpec {
  siteType?: string
  metadata?: { siteType?: string }
  pages?: Array<{ route?: string }>
  [key: string]: unknown
}

/** Builds a siteSpec with the given pages and optional siteType. */
function makeSiteSpec(
  opts: {
    pages?: Array<{ route?: string }>
    siteType?: string
    metadataSiteType?: string
  } = {},
): SiteSpec {
  const spec: SiteSpec = {
    pages: opts.pages ?? [{ route: '/' }, { route: '/about' }],
  }
  if (opts.siteType) spec.siteType = opts.siteType
  if (opts.metadataSiteType) spec.metadata = { siteType: opts.metadataSiteType }
  return spec
}

/** Generates a long HTML string with many words and structural tags. */
function longHtml(wordCount: number, extraTags = '', minLen = 0): string {
  const words = Array.from({ length: wordCount }, (_, i) => `word${i}`).join(
    ' ',
  )
  let body = `<header><nav>Nav</nav></header><main><section><p>${words}</p></section></main><footer>Footer</footer>${extraTags}`
  if (minLen > 0 && body.length < minLen) {
    body += '<div>' + 'x'.repeat(minLen - body.length - 12) + '</div>'
  }
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"></head><body>${body}</body></html>`
}

describe('shouldReplaceLlmHomepageWithRenderer', () => {
  describe('empty / null / non-string html', () => {
    it('returns true for empty string', () => {
      expect(shouldReplaceLlmHomepageWithRenderer('', makeSiteSpec())).toBe(
        true,
      )
    })

    it('returns true for null', () => {
      expect(
        shouldReplaceLlmHomepageWithRenderer(
          null as unknown as string,
          makeSiteSpec(),
        ),
      ).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(
        shouldReplaceLlmHomepageWithRenderer(
          undefined as unknown as string,
          makeSiteSpec(),
        ),
      ).toBe(true)
    })

    it('returns true for non-string (number)', () => {
      expect(
        shouldReplaceLlmHomepageWithRenderer(
          42 as unknown as string,
          makeSiteSpec(),
        ),
      ).toBe(true)
    })
  })

  describe('no pages in siteSpec', () => {
    it('returns false when siteSpec has no pages', () => {
      expect(
        shouldReplaceLlmHomepageWithRenderer('<html></html>', {
          pages: [],
        }),
      ).toBe(false)
    })

    it('returns false when siteSpec pages is undefined', () => {
      expect(shouldReplaceLlmHomepageWithRenderer('<html></html>', {})).toBe(
        false,
      )
    })
  })

  describe('hybrid LLM homepage', () => {
    it('returns false for tailwind + >12000 chars + sections', () => {
      const html = longHtml(
        300,
        '<section></section><nav></nav><footer></footer>',
        12000,
      )
      const withTailwind = html.replace(
        '<head>',
        '<head><script src="/scripts/tailwind-browser.js"></script>',
      )
      expect(withTailwind.length).toBeGreaterThan(12000)
      expect(
        shouldReplaceLlmHomepageWithRenderer(withTailwind, makeSiteSpec()),
      ).toBe(false)
    })

    it('returns false for tailwind CDN + >12000 chars + nav', () => {
      const html = longHtml(300, '<nav>Nav</nav>', 12000)
      const withTailwind = html.replace(
        '<head>',
        '<head><script src="https://cdn.tailwindcss.com"></script>',
      )
      expect(withTailwind.length).toBeGreaterThan(12000)
      expect(
        shouldReplaceLlmHomepageWithRenderer(withTailwind, makeSiteSpec()),
      ).toBe(false)
    })
  })

  describe('substantial ecommerce homepage', () => {
    it('returns false for substantial ecommerce homepage (>=95 words)', () => {
      const words = Array.from({ length: 100 }, (_, i) => `product${i}`).join(
        ' ',
      )
      const html = `<!DOCTYPE html><html><head></head><body><main><section class="product-grid"><p>${words}</p></section></main></body></html>`
      const spec = makeSiteSpec({ siteType: 'ecommerce' })
      expect(shouldReplaceLlmHomepageWithRenderer(html, spec)).toBe(false)
    })

    it('returns false for ecommerce homepage with signals and structure (>=55 words)', () => {
      const words = Array.from({ length: 60 }, (_, i) => `item${i}`).join(' ')
      const html = `<!DOCTYPE html><html><head></head><body><main><section class="product-card"><p>${words}</p><span>$29.99</span><button>Add to cart</button></section></main></body></html>`
      const spec = makeSiteSpec({ siteType: 'ecommerce' })
      expect(shouldReplaceLlmHomepageWithRenderer(html, spec)).toBe(false)
    })

    it('returns false for ecommerce via metadata.siteType', () => {
      const words = Array.from({ length: 100 }, (_, i) => `product${i}`).join(
        ' ',
      )
      const html = `<!DOCTYPE html><html><head></head><body><main><section><p>${words}</p></section></main></body></html>`
      const spec = makeSiteSpec({ metadataSiteType: 'ecommerce' })
      expect(shouldReplaceLlmHomepageWithRenderer(html, spec)).toBe(false)
    })
  })

  describe('three.js game', () => {
    it('returns false for three.js game homepage', () => {
      const html = `<!DOCTYPE html><html><head></head><body><canvas id="game"></canvas><script src="three.min.js"></script></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for THREE.WebGLRenderer usage', () => {
      const html = `<!DOCTYPE html><html><head></head><body><script>const r = new THREE.WebGLRenderer(); const s = new THREE.Scene();</script></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for canvas element', () => {
      const html = `<!DOCTYPE html><html><head></head><body><canvas id="game-canvas"></canvas></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })
  })

  describe('app UI', () => {
    it('returns false for sidebar + main layout', () => {
      const html = `<!DOCTYPE html><html><head></head><body><aside class="w-64">Sidebar</aside><main class="flex-1">Content</main></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for data-mobile-nav-toggle', () => {
      const html = `<!DOCTYPE html><html><head></head><body><button data-mobile-nav-toggle>Menu</button><main>Content</main></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for data-tab-group + data-tab-panel', () => {
      const html = `<!DOCTYPE html><html><head></head><body><div data-tab-group><div data-tab-panel>Panel</div></div></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for aside + main', () => {
      const html = `<!DOCTYPE html><html><head></head><body><aside>Sidebar</aside><main>Content</main></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })
  })

  describe('long html with enough words and structure', () => {
    it('returns false for >=14000 chars, >=42 words, with structural tags', () => {
      const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ')
      const padding = 'x'.repeat(14000)
      const html = `<!DOCTYPE html><html><head></head><body><header><main><section><p>${words}</p></section></main></header>${padding}</body></html>`
      expect(html.length).toBeGreaterThanOrEqual(14000)
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for >=9000 chars and >=50 words', () => {
      const words = Array.from({ length: 55 }, (_, i) => `word${i}`).join(' ')
      const padding = 'x'.repeat(9000)
      const html = `<!DOCTYPE html><html><head></head><body><main><p>${words}</p></main>${padding}</body></html>`
      expect(html.length).toBeGreaterThanOrEqual(9000)
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })

    it('returns false for >=58 words alone', () => {
      const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ')
      const html = `<!DOCTYPE html><html><head></head><body><main><p>${words}</p></main></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        false,
      )
    })
  })

  describe('short html with few words', () => {
    it('returns true for short html with <32 words', () => {
      const html = `<!DOCTYPE html><html><head></head><body><div>Hello world</div></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        true,
      )
    })

    it('returns true for empty body with pages', () => {
      const html = `<!DOCTYPE html><html><head></head><body></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        true,
      )
    })

    it('returns true for 40 words without marketing structure', () => {
      const words = Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ')
      const html = `<!DOCTYPE html><html><head></head><body><div>${words}</div></body></html>`
      expect(shouldReplaceLlmHomepageWithRenderer(html, makeSiteSpec())).toBe(
        true,
      )
    })
  })
})

describe('htmlDocumentPassesPreviewQuality', () => {
  it('returns false for empty html', () => {
    expect(htmlDocumentPassesPreviewQuality('', makeSiteSpec())).toBe(false)
  })

  it('returns false for null html', () => {
    expect(
      htmlDocumentPassesPreviewQuality(
        null as unknown as string,
        makeSiteSpec(),
      ),
    ).toBe(false)
  })

  it('returns true for a good hybrid LLM homepage', () => {
    const html = longHtml(
      300,
      '<section></section><nav></nav><footer></footer>',
      12000,
    )
    const withTailwind = html.replace(
      '<head>',
      '<head><script src="/scripts/tailwind-browser.js"></script>',
    )
    expect(withTailwind.length).toBeGreaterThan(12000)
    expect(htmlDocumentPassesPreviewQuality(withTailwind, makeSiteSpec())).toBe(
      true,
    )
  })

  it('returns false for short degenerate html with pages', () => {
    expect(
      htmlDocumentPassesPreviewQuality('<div>hi</div>', makeSiteSpec()),
    ).toBe(false)
  })

  it('returns true when siteSpec has no pages (no replacement needed)', () => {
    expect(
      htmlDocumentPassesPreviewQuality('<div>hi</div>', { pages: [] }),
    ).toBe(true)
  })

  it('returns a boolean type value', () => {
    const result = htmlDocumentPassesPreviewQuality('', makeSiteSpec())
    expect(typeof result).toBe('boolean')
  })
})
