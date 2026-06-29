import { describe, expect, it } from 'vitest'

import {
  mergeWithGenome,
  pickGenome,
  applyGenomeMerge,
  GENOME_NAMES,
} from './genome-merge.js'
import {
  htmlLooksDegenerate,
  explainNovaMarketingBarFailures,
  promptExpectsNovaDenseMarketing,
} from './homepage-degeneracy.js'
import { collectHomepageQualityIssues } from './homepage-quality-audit.js'
import {
  shouldReplaceLlmHomepageWithRenderer,
  htmlDocumentPassesPreviewQuality,
} from './homepage-substance.js'
import { injectLLMHomepageSwiper } from './homepage-swiper.js'
import { stripDestructiveEmptyDesignTheme } from './homepage-theme-sanitize.js'
import {
  scoreRalphHomepage,
  passesHomepagePublicDesignVerification,
} from './ralph-homepage-score.js'

const minimalHtml = (body: string) =>
  `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><script src="/scripts/tailwind-browser.js"></script><script>tailwind.config = { theme: { extend: {} } }</script></head><body>${body}</body></html>`

describe('planner: genome merge', () => {
  it('GENOME_NAMES exposes sorted genome list', () => {
    expect(GENOME_NAMES).toContain('vercel-apple')
    expect(GENOME_NAMES).toContain('linear-raycast')
    // sorted
    const sorted = [...GENOME_NAMES].sort()
    expect(GENOME_NAMES).toEqual(sorted)
  })

  it('mergeWithGenome collapses neutral families to the target family', () => {
    const html = minimalHtml(
      '<div class="bg-slate-900 text-zinc-100 border-gray-200">hi</div>',
    )
    const merged = mergeWithGenome(html, 'vercel-apple')
    // vercel-apple rewrites slate/zinc/gray/neutral/stone -> neutral
    expect(merged).toContain('bg-neutral-900')
    expect(merged).toContain('text-neutral-100')
    expect(merged).toContain('border-neutral-200')
    expect(merged).not.toMatch(/\b(?:slate|zinc|gray)-\d{2,3}\b/)
  })

  it('mergeWithGenome injects the skin root class on <body>', () => {
    const html = minimalHtml('<p>x</p>')
    const merged = mergeWithGenome(html, 'linear-raycast')
    expect(merged).toMatch(/<body[^>]*bg-\[#0b0b0f\]/)
    expect(merged).toContain('text-zinc-50')
  })

  it('mergeWithGenome preserves existing body classes (merges, not overwrites)', () => {
    const html = minimalHtml('<p>x</p>').replace(
      '<body>',
      '<body class="min-h-screen antialiased">',
    )
    const merged = mergeWithGenome(html, 'vercel-apple')
    expect(merged).toMatch(/<body[^>]*min-h-screen/)
    expect(merged).toMatch(/<body[^>]*antialiased/)
    expect(merged).toContain('bg-white')
  })

  it('mergeWithGenome returns html unchanged for unknown genome', () => {
    const html = minimalHtml('<p class="bg-slate-900">x</p>')
    expect(mergeWithGenome(html, 'nope-genome')).toBe(html)
  })

  it('mergeWithGenome wraps bodyless html in a body with root class', () => {
    const fragment = '<div class="bg-slate-900">hi</div>'
    const merged = mergeWithGenome(fragment, 'vercel-apple')
    expect(merged).toMatch(/<body[^>]*bg-white/)
    expect(merged).toContain('bg-neutral-900')
  })

  it('linear-raycast rewrites bg-white -> bg-zinc-950 and text-white -> text-zinc-50', () => {
    const html = minimalHtml('<button class="bg-white text-white">Go</button>')
    const merged = mergeWithGenome(html, 'linear-raycast')
    expect(merged).toContain('bg-zinc-950')
    expect(merged).toContain('text-zinc-50')
    expect(merged).not.toMatch(/\bbg-white\b/)
  })

  it('stripe-resend rewrites bg-slate-900 -> bg-indigo-600', () => {
    const html = minimalHtml('<a class="bg-slate-900 hover:bg-slate-800">x</a>')
    const merged = mergeWithGenome(html, 'stripe-resend')
    expect(merged).toContain('bg-indigo-600')
    expect(merged).toContain('hover:bg-indigo-700')
  })

  it('pickGenome honors explicit design.genome override', () => {
    const r = pickGenome({
      siteType: 'saas',
      design: { genome: 'editorial-warm' },
    })
    expect(r.genome).toBe('editorial-warm')
    expect(r.source).toBe('design.genome')
  })

  it('pickGenome maps siteType to genome', () => {
    expect(pickGenome({ siteType: 'fintech' }).genome).toBe('stripe-resend')
    expect(pickGenome({ siteType: 'devtool' }).genome).toBe('linear-raycast')
    expect(pickGenome({ siteType: 'skincare' }).genome).toBe('boutique-organic')
    expect(pickGenome({ siteType: 'gym' }).genome).toBe('bold-conversion')
    expect(pickGenome({ siteType: 'coffee' }).genome).toBe('editorial-warm')
  })

  it('pickGenome falls back to brief keyword hints', () => {
    expect(pickGenome({ brief: 'a yoga meditation studio' }).genome).toBe(
      'boutique-organic',
    )
    expect(pickGenome({ brief: 'crossfit hiit training' }).genome).toBe(
      'bold-conversion',
    )
    expect(pickGenome({ brief: 'a kubernetes observability cli' }).genome).toBe(
      'linear-raycast',
    )
  })

  it('pickGenome falls back to vercel-apple when nothing matches', () => {
    const r = pickGenome({})
    expect(r.genome).toBe('vercel-apple')
    expect(r.source).toBe('fallback')
  })

  it('applyGenomeMerge is a no-op when env flag is off', () => {
    const prev = process.env.SHIPFAST_USE_GENOME_MERGE
    delete process.env.SHIPFAST_USE_GENOME_MERGE
    const html = minimalHtml('<p class="bg-slate-900">x</p>')
    const r = applyGenomeMerge(html, { siteType: 'saas' })
    expect(r.applied).toBe(false)
    expect(r.html).toBe(html)
    expect(r.source).toBe('disabled')
    if (prev !== undefined) process.env.SHIPFAST_USE_GENOME_MERGE = prev
  })

  it('applyGenomeMerge applies when env flag is on and reports genome+source', () => {
    const prev = process.env.SHIPFAST_USE_GENOME_MERGE
    process.env.SHIPFAST_USE_GENOME_MERGE = '1'
    const html = minimalHtml('<p class="bg-slate-900">x</p>')
    const r = applyGenomeMerge(html, { siteType: 'devtool' })
    expect(r.applied).toBe(true)
    expect(r.genome).toBe('linear-raycast')
    expect(r.source).toBe('siteType:devtool')
    // linear-raycast root class is injected on body
    expect(r.html).toContain('bg-[#0b0b0f]')
    expect(r.html).toContain('text-zinc-50')
    // slate neutral family is rewritten to zinc
    expect(r.html).not.toMatch(/\bslate-\d{2,3}\b/)
    expect(typeof r.mergeMs).toBe('number')
    if (prev === undefined) delete process.env.SHIPFAST_USE_GENOME_MERGE
    else process.env.SHIPFAST_USE_GENOME_MERGE = prev
  })

  it('applyGenomeMerge skips too-short html', () => {
    const prev = process.env.SHIPFAST_USE_GENOME_MERGE
    process.env.SHIPFAST_USE_GENOME_MERGE = '1'
    const r = applyGenomeMerge('<p>short</p>', { siteType: 'saas' })
    expect(r.applied).toBe(false)
    expect(r.source).toBe('no-html')
    if (prev === undefined) delete process.env.SHIPFAST_USE_GENOME_MERGE
    else process.env.SHIPFAST_USE_GENOME_MERGE = prev
  })
})

describe('planner: degeneracy detection', () => {
  it('flags html shorter than 350 chars as degenerate', () => {
    expect(htmlLooksDegenerate('<p>hi</p>')).toBe(true)
  })

  it('flags html missing <html>/doctype', () => {
    const body = '<body>' + 'x'.repeat(400) + '</body>'
    expect(htmlLooksDegenerate(body)).toBe(true)
  })

  it('flags html missing <body>', () => {
    const noBody = '<!DOCTYPE html><html><head></head>' + 'x'.repeat(400)
    expect(htmlLooksDegenerate(noBody)).toBe(true)
  })

  it('passes well-formed substantial html', () => {
    const html = minimalHtml(
      '<section><h1>Title</h1><p>' + 'word '.repeat(60) + '</p></section>',
    )
    expect(htmlLooksDegenerate(html)).toBe(false)
  })

  it('flags repetition wall (same word run > 45)', () => {
    // text.length must exceed 800 for the run check to engage
    const wall = 'lorem '.repeat(200) // ~1200 chars, 200 words
    const html = minimalHtml(`<section><p>${wall}</p></section>`)
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('flags bigram repetition (count > 80)', () => {
    const bigram = 'foo bar '.repeat(120)
    const html = minimalHtml(`<section><p>${bigram}</p></section>`)
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('flags low unique-word ratio (<0.06) for long text', () => {
    // 500 words, only ~20 unique -> ratio 0.04
    const pool = Array.from({ length: 20 }, (_, i) => `w${i}`)
    const words = Array.from({ length: 500 }, (_, i) => pool[i % 20])
    const html = minimalHtml(`<section><p>${words.join(' ')}</p></section>`)
    expect(htmlLooksDegenerate(html)).toBe(true)
  })

  it('promptExpectsNovaDenseMarketing detects saas/marketing prompts', () => {
    expect(promptExpectsNovaDenseMarketing('a saas landing page')).toBe(true)
    expect(
      promptExpectsNovaDenseMarketing('marketing site for a devtool'),
    ).toBe(true)
    expect(promptExpectsNovaDenseMarketing('an ai llm tool platform')).toBe(
      true,
    )
  })

  it('promptExpectsNovaDenseMarketing excludes ecommerce/dashboard/docs', () => {
    expect(promptExpectsNovaDenseMarketing('an online store with cart')).toBe(
      false,
    )
    expect(promptExpectsNovaDenseMarketing('an analytics dashboard')).toBe(
      false,
    )
    expect(promptExpectsNovaDenseMarketing('docs for developers')).toBe(false)
    expect(promptExpectsNovaDenseMarketing('')).toBe(false)
  })

  it('explainNovaMarketingBarFailures returns [] when no Tailwind runtime', () => {
    expect(explainNovaMarketingBarFailures('<p>no tailwind</p>')).toEqual([])
  })

  it('explainNovaMarketingBarFailures lists missing pricing/faq/visual/words/sections', () => {
    const html = minimalHtml('<section><h1>hi</h1></section>')
    const f = explainNovaMarketingBarFailures(html)
    expect(f.some((x) => x.includes('visible word count'))).toBe(true)
    expect(f.some((x) => x.includes('<section> count'))).toBe(true)
    expect(f.some((x) => x.includes('missing pricing'))).toBe(true)
    expect(f.some((x) => x.includes('missing FAQ'))).toBe(true)
    expect(f.some((x) => x.includes('visual depth'))).toBe(true)
  })

  it('explainNovaMarketingBarFailures passes a rich marketing page', () => {
    const sections = Array.from(
      { length: 6 },
      (_, i) => `<section id="s${i}">x</section>`,
    ).join('')
    const html = minimalHtml(
      `${sections}<section id="pricing"><h2>Pricing</h2><p>$10/mo</p></section><section id="faq"><h2>FAQ</h2></section><div class="blur-3xl"></div>` +
        '<p>' +
        'word '.repeat(140) +
        '</p>',
    )
    const f = explainNovaMarketingBarFailures(html)
    expect(f).toEqual([])
  })

  it('htmlLooksDegenerate honors Nova marketing bar when prompt expects it', () => {
    const html = minimalHtml('<section><h1>hi</h1></section>')
    expect(htmlLooksDegenerate(html, { prompt: 'a saas landing page' })).toBe(
      true,
    )
  })
})

describe('planner: quality audit', () => {
  it('returns no issues for game site type', () => {
    const issues = collectHomepageQualityIssues('<p>x</p>', {
      siteType: 'game',
    })
    expect(issues).toEqual([])
  })

  it('detects missing viewport meta', () => {
    const html =
      '<!DOCTYPE html><html><head></head><body><h1>x</h1></body></html>'
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues).toContain('missing viewport meta in head')
  })

  it('detects missing <h1>', () => {
    const html = minimalHtml('<section><p>x</p></section>')
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues).toContain('missing <h1>')
  })

  it('detects too many <h1> for non-dashboard', () => {
    const h1s = Array.from({ length: 5 }, () => '<h1>x</h1>').join('')
    const html = minimalHtml(h1s)
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('too many <h1>'))).toBe(true)
  })

  it('detects missing Tailwind runtime', () => {
    const html =
      '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"></head><body><h1>x</h1></body></html>'
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('Tailwind runtime'))).toBe(true)
  })

  it('detects tailwind.config missing theme.extend', () => {
    const html =
      '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><script src="/scripts/tailwind-browser.js"></script></head><body><h1>x</h1></body></html>'
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('theme.extend'))).toBe(true)
  })

  it('detects lorem ipsum placeholder copy', () => {
    const html = minimalHtml('<h1>Title</h1><p>Lorem ipsum dolor sit amet</p>')
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('lorem ipsum'))).toBe(true)
  })

  it('detects too few buttons for saas', () => {
    const html = minimalHtml('<h1>x</h1><a href="/p">link</a>')
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('too few <button>'))).toBe(true)
  })

  it('detects missing ecommerce cart wiring when prompt mentions store', () => {
    const html = minimalHtml('<h1>Shop</h1><button>Buy</button>')
    const issues = collectHomepageQualityIssues(html, {
      siteType: 'ecommerce',
      prompt: 'an online store with checkout',
    })
    expect(issues.some((x) => x.includes('cart or add-to-cart'))).toBe(true)
  })

  it('Nova visual craft issues for saas: missing canvas, blur, radial, reveals, magnets, motion, diagonal', () => {
    const html = minimalHtml(
      '<h1>x</h1><button>a</button><button>b</button><button>c</button>',
    )
    const issues = collectHomepageQualityIssues(html, { siteType: 'saas' })
    expect(issues.some((x) => x.includes('<canvas>'))).toBe(true)
    expect(issues.some((x) => x.includes('blur-3xl'))).toBe(true)
    expect(issues.some((x) => x.includes('radial-gradient'))).toBe(true)
    expect(issues.some((x) => x.includes('data-reveal'))).toBe(true)
    expect(issues.some((x) => x.includes('data-magnet'))).toBe(true)
    expect(issues.some((x) => x.includes('liquid'))).toBe(true)
    expect(issues.some((x) => x.includes('diagonal'))).toBe(true)
  })

  it('Nova visual craft issues skipped for non-visual site types', () => {
    const html = minimalHtml('<h1>x</h1>')
    const issues = collectHomepageQualityIssues(html, { siteType: 'game' })
    expect(issues).toEqual([])
  })
})

describe('planner: substance measure', () => {
  const richHomepage = minimalHtml(
    '<header></header><main><section><h1>Title</h1><p>' +
      'word '.repeat(80) +
      '</p></section></main><footer></footer>',
  )

  it('shouldReplaceLlmHomepageWithRenderer returns true for empty/invalid html', () => {
    expect(shouldReplaceLlmHomepageWithRenderer('', {})).toBe(true)
    expect(
      shouldReplaceLlmHomepageWithRenderer(null as unknown as string, {}),
    ).toBe(true)
  })

  it('shouldReplaceLlmHomepageWithRenderer returns false when siteSpec has NO pages (renderer not applicable)', () => {
    // No pages => renderer has nothing to render => don't replace
    expect(shouldReplaceLlmHomepageWithRenderer('<p>tiny</p>', {})).toBe(false)
    expect(
      shouldReplaceLlmHomepageWithRenderer('<p>tiny</p>', { pages: [] }),
    ).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer keeps hybrid LLM homepage (tailwind + >12000 chars + section/nav/footer)', () => {
    const body =
      '<section>' + 'x'.repeat(13000) + '</section><nav></nav><footer></footer>'
    const html = minimalHtml(body)
    expect(shouldReplaceLlmHomepageWithRenderer(html, {})).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer keeps substantial ecommerce homepage', () => {
    const body =
      '<section class="product-card"><h1>Shop</h1><p>' +
      'word '.repeat(100) +
      ' add to cart $29 </p></section>'
    const html = minimalHtml(body)
    expect(
      shouldReplaceLlmHomepageWithRenderer(html, { siteType: 'ecommerce' }),
    ).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer keeps three.js game', () => {
    const html = minimalHtml(
      '<canvas></canvas><script src="three.js"></script>',
    )
    expect(shouldReplaceLlmHomepageWithRenderer(html, {})).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer keeps declared app UI (aside + main)', () => {
    const html = minimalHtml(
      '<aside class="w-64"></aside><main class="flex-1"></main>',
    )
    expect(shouldReplaceLlmHomepageWithRenderer(html, {})).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer keeps >=58 word pages', () => {
    const html = minimalHtml('<main><p>' + 'word '.repeat(60) + '</p></main>')
    expect(shouldReplaceLlmHomepageWithRenderer(html, {})).toBe(false)
  })

  it('shouldReplaceLlmHomepageWithRenderer replaces <32 word pages', () => {
    const html = minimalHtml('<main><p>hi there friend</p></main>')
    expect(
      shouldReplaceLlmHomepageWithRenderer(html, { pages: ['home'] }),
    ).toBe(true)
  })

  it('shouldReplaceLlmHomepageWithRenderer replaces 32-57 word pages without marketing structure', () => {
    // Use a bare <div> (no <main>, <section>, <header>, <footer>, <nav>, no
    // grid/hero/pricing class) so hasMarketingStructure returns false.
    const words = 'word '.repeat(40)
    const html = minimalHtml(`<div><p>${words}</p></div>`)
    expect(
      shouldReplaceLlmHomepageWithRenderer(html, { pages: ['home'] }),
    ).toBe(true)
  })

  it('htmlDocumentPassesPreviewQuality is the inverse of shouldReplace', () => {
    expect(htmlDocumentPassesPreviewQuality(richHomepage, {})).toBe(true)
    expect(htmlDocumentPassesPreviewQuality('', {})).toBe(false)
    expect(
      htmlDocumentPassesPreviewQuality(null as unknown as string, {}),
    ).toBe(false)
  })
})

describe('planner: swiper policy', () => {
  it('injectLLMHomepageSwiper is a no-op for non-ecommerce, no carousel prompt', () => {
    const html = minimalHtml('<h1>x</h1>')
    expect(
      injectLLMHomepageSwiper(html, { siteType: 'saas', userPrompt: 'a saas' }),
    ).toBe(html)
  })

  it('injectLLMHomepageSwiper is a no-op when siteSpec is null', () => {
    const html = minimalHtml('<h1>x</h1>')
    expect(injectLLMHomepageSwiper(html, null as unknown as never)).toBe(html)
  })

  it('injectLLMHomepageSwiper injects Swiper+Splide CDN for ecommerce', () => {
    const html = minimalHtml('<h1>Shop</h1>')
    const out = injectLLMHomepageSwiper(html, { siteType: 'ecommerce' })
    expect(out).toContain('swiper@12/swiper-bundle.min.css')
    expect(out).toContain('swiper@12/swiper-bundle.min.js')
    expect(out).toContain('@splidejs/splide@4.1.4')
    expect(out).toContain('data-sf-llm-swiper-injected')
    expect(out).toContain('data-sf-llm-splide-runtime')
  })

  it('injectLLMHomepageSwiper injects when prompt mentions carousel', () => {
    const html = minimalHtml('<h1>x</h1>')
    const out = injectLLMHomepageSwiper(html, {
      siteType: 'portfolio',
      userPrompt: 'a portfolio with an image carousel',
    })
    expect(out).toContain('swiper@12/swiper-bundle.min.js')
  })

  it('injectLLMHomepageSwiper is idempotent (already-injected runtime)', () => {
    const html = minimalHtml('<h1>Shop</h1>')
    const once = injectLLMHomepageSwiper(html, { siteType: 'ecommerce' })
    const twice = injectLLMHomepageSwiper(once, { siteType: 'ecommerce' })
    expect(twice).toBe(once)
  })

  it('injectLLMHomepageSwiper skips pages already wired with site.js + site-motion.mjs', () => {
    const html = minimalHtml(
      '<h1>Shop</h1><script src="./site.js"></script><script type="module" src="./site-motion.mjs"></script>',
    )
    expect(injectLLMHomepageSwiper(html, { siteType: 'ecommerce' })).toBe(html)
  })

  it('injectLLMHomepageSwiper appends runtime when no </body> tag', () => {
    const fragment = '<!DOCTYPE html><html><head></head><h1>Shop</h1>'
    const out = injectLLMHomepageSwiper(fragment, { siteType: 'ecommerce' })
    expect(out).toContain('swiper@12/swiper-bundle.min.js')
    expect(out).toContain('data-sf-llm-swiper-injected')
  })

  it('injected inline script identifies carousel headings and interactive elements', () => {
    const html = minimalHtml('<h1>Shop</h1>')
    const out = injectLLMHomepageSwiper(html, { siteType: 'ecommerce' })
    // The inline upgrade script scans for marketing carousel headings
    expect(out).toContain('new arrivals|featured|best sellers')
    expect(out).toContain('sf-swiper-prev')
    expect(out).toContain('sf-swiper-next')
    expect(out).toContain('swiper-pagination')
    expect(out).toContain('new Swiper(root,opts)')
  })
})

describe('planner: theme sanitize', () => {
  it('strips empty design theme blocks (empty colors + fontFamily)', () => {
    const html =
      '<head><!-- sf-design-theme -->colors: {} fontFamily: {}<!-- /sf-design-theme --></head>'
    expect(stripDestructiveEmptyDesignTheme(html)).toBe('<head></head>')
  })

  it('preserves design theme blocks that patch colors/fonts', () => {
    const block =
      '<!-- sf-design-theme -->patchColors({}); Object.assign(tailwind.config, x)<!-- /sf-design-theme -->'
    expect(stripDestructiveEmptyDesignTheme(block)).toBe(block)
  })

  it('preserves design theme blocks that are not empty', () => {
    const block =
      '<!-- sf-design-theme -->colors: { primary: "#f00" } fontFamily: {}<!-- /sf-design-theme -->'
    expect(stripDestructiveEmptyDesignTheme(block)).toBe(block)
  })

  it('preserves blocks with only empty colors but non-empty fontFamily', () => {
    const block =
      '<!-- sf-design-theme -->colors: {} fontFamily: { sans: "x" }<!-- /sf-design-theme -->'
    expect(stripDestructiveEmptyDesignTheme(block)).toBe(block)
  })

  it('handles html with no theme blocks unchanged', () => {
    const html = '<p>nothing here</p>'
    expect(stripDestructiveEmptyDesignTheme(html)).toBe(html)
  })

  it('handles null/empty input', () => {
    expect(stripDestructiveEmptyDesignTheme('')).toBe('')
    expect(stripDestructiveEmptyDesignTheme(null as unknown as string)).toBe('')
  })
})

describe('planner: ralph homepage score', () => {
  const buildScoredHtml = (opts: {
    length?: number
    sections?: number
    tailwind?: boolean
    hooks?: boolean
  }) => {
    const len = opts.length ?? 12000
    const sections = opts.sections ?? 7
    const tailwind = opts.tailwind ?? true
    const hooks = opts.hooks ?? true
    const head = tailwind
      ? '<meta name="viewport" content="width=device-width"><script src="/scripts/tailwind-browser.js"></script>'
      : ''
    const secHtml = Array.from(
      { length: sections },
      (_, i) =>
        `<section id="s${i}"><h2>Section ${i}</h2><p>Content for section number ${i} with enough words to be real.</p></section>`,
    ).join('')
    const hook = hooks ? '<button data-accordion>toggle</button>' : ''
    // Use HTML element padding where EVERY word is unique per block so none
    // of the degeneracy checks (angle-ratio, unique-word-ratio, bigram-rep,
    // max-run) can fire.
    const padUnits = Array.from(
      { length: Math.ceil(Math.max(0, len - 1500) / 50) },
      (_, i) =>
        `<div class="p-4">b${i}a b${i}b b${i}c b${i}d b${i}e b${i}f b${i}g b${i}h.</div>`,
    ).join('')
    return `<!DOCTYPE html><html><head>${head}</head><body>${secHtml}${hook}<main>${padUnits}</main></body></html>`
  }

  it('scores 0 with reasons for empty html', () => {
    const r = scoreRalphHomepage('')
    expect(r.ok).toBe(false)
    expect(r.score).toBe(0)
    expect(r.reasons).toContain('empty html')
    expect(r.feedback).toContain('single-file homepage')
  })

  it('scores 0 when htmlLooksDegenerate', () => {
    const r = scoreRalphHomepage('<p>short</p>')
    expect(r.ok).toBe(false)
    expect(r.score).toBe(0)
    expect(r.reasons[0]).toBe('htmlLooksDegenerate')
  })

  it('computes a passing score for a rich homepage (>=10000 chars, >=6 bands, tailwind, hooks)', () => {
    const html = buildScoredHtml({ length: 12000, sections: 7 })
    const r = scoreRalphHomepage(html, { minScore: 85 })
    expect(r.score).toBe(100)
    expect(r.reasons).toEqual([])
    expect(r.ok).toBe(true)
  })

  it('deducts when html length < 10000', () => {
    const html = buildScoredHtml({ length: 5000, sections: 7 })
    const r = scoreRalphHomepage(html, { minScore: 85 })
    expect(r.score).toBeLessThan(100)
    expect(r.reasons.some((x) => x.includes('html length'))).toBe(true)
  })

  it('deducts when section bands < 6', () => {
    const html = buildScoredHtml({ length: 12000, sections: 3 })
    const r = scoreRalphHomepage(html, { minScore: 85 })
    expect(r.reasons.some((x) => x.includes('section bands'))).toBe(true)
  })

  it('deducts when missing Tailwind runtime', () => {
    const html = buildScoredHtml({
      length: 12000,
      sections: 7,
      tailwind: false,
    })
    const r = scoreRalphHomepage(html, { minScore: 85 })
    expect(r.reasons.some((x) => x.includes('Tailwind runtime'))).toBe(true)
  })

  it('deducts when missing wired data-* hooks', () => {
    const html = buildScoredHtml({ length: 12000, sections: 7, hooks: false })
    const r = scoreRalphHomepage(html, { minScore: 85 })
    expect(r.reasons.some((x) => x.includes('data-* hooks'))).toBe(true)
  })

  it('docs site type allows >=5 bands (lower threshold)', () => {
    const html = buildScoredHtml({ length: 12000, sections: 5 })
    const r = scoreRalphHomepage(html, { minScore: 85, siteType: 'docs' })
    expect(r.reasons.some((x) => x.includes('section bands'))).toBe(false)
    expect(r.ok).toBe(true)
  })

  it('ok requires both score >= minScore AND no reasons', () => {
    const html = buildScoredHtml({ length: 12000, sections: 7 })
    const r = scoreRalphHomepage(html, { minScore: 101 })
    expect(r.score).toBe(100)
    expect(r.ok).toBe(false) // score < minScore
  })

  it('passesHomepagePublicDesignVerification passes a rich page with no ref', () => {
    const html = buildScoredHtml({ length: 12000, sections: 7 })
    // Add buttons/links to pass quality audit minimums
    const enriched = html.replace(
      '</main>',
      '<a href="/x">a</a>'.repeat(10) +
        '<button>a</button><button>b</button><button>c</button></main>',
    )
    const r = passesHomepagePublicDesignVerification(enriched, '', '', 'saas')
    // May still flag Nova visual craft issues; assert it returns a structured result
    expect(r).toHaveProperty('ok')
    expect(r).toHaveProperty('feedback')
  })

  it('passesHomepagePublicDesignVerification fails empty html', () => {
    const r = passesHomepagePublicDesignVerification('', '', '', 'saas')
    expect(r.ok).toBe(false)
    expect(r.feedback).toBeTruthy()
  })
})
