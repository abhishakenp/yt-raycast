import { describe, expect, it } from 'vitest'
import { annotateDataImgSurfaces, compressExcessiveSpacing, ensureHeroScale, ensureMinimumVerticalSections, rewriteAnchorAccentLeaks, sanitizeHtml } from '../src/postprocess.js'
import { detectVerbatimAnchorCopy } from '../src/mobbin-score.js'

const plan = {
  visualWorld: {
    bg: '#111827',
    surface: '#f9fafb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#f97316',
    accent2: '#22d3ee',
    layoutGrammar: 'offset editorial grid',
  },
  contentInventory: ['trainer schedule', 'membership proof', 'booking path'],
  signatureMoves: ['oversized schedule wall'],
}

describe('postprocess cleanup', () => {
  it('removes inline media and style attributes', () => {
    const html = sanitizeHtml('<html><head><style>.x{color:red}</style></head><body><section class="w-full" style="color:red"><svg><path /></svg><img src="x.png"></section></body></html>', plan, { siteHint: 'software' })
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<style')
    expect(html).not.toContain('style=')
    expect(html).toContain('data-lucide')
    expect(html).toContain('data-img')
    expect(html).toContain('data-visual="art-surface"')
    expect(html).toContain('data-visual-kind="product-console"')
    expect(html).toContain('bg-gradient-to-br')
  })

  it('marks non-empty data-img blocks as finished visual surfaces', () => {
    const html = annotateDataImgSurfaces('<div data-img="ocean room"><span>suite</span></div>', {
      ...plan,
      brief: 'Boutique hotel on the Oregon coast',
    }, { siteHint: 'local-experience' })
    expect(html).toContain('data-visual="art-surface"')
    expect(html).toContain('data-visual-kind="hotel-room"')
  })

  it('replaces nested model-authored data-img blocks with deterministic media', () => {
    const html = sanitizeHtml('<section class="w-full"><div data-img="ocean room" class="aspect-[16/9] rounded-xl"><div><span>model made this</span></div></div><p>after</p></section>', {
      ...plan,
      brief: 'Boutique hotel on the Oregon coast',
    }, { siteHint: 'local-experience' })
    expect(html).toContain('data-visual-kind="hotel-room"')
    expect(html).toContain('ocean view')
    expect(html).toContain('<p>after</p>')
    expect(html).not.toContain('model made this')
  })


  it('upgrades timid vertical-doc heroes without touching app shells', () => {
    const html = ensureHeroScale('<section class="w-full py-12"><h1 class="text-4xl">Hello</h1></section>', plan)
    expect(html).toContain('min-h-[76vh]')
    expect(html).toContain('md:text-7xl')
    const shell = ensureHeroScale('<section class="w-full py-12"><h1 class="text-4xl">Hello</h1></section>', { pageKind: 'app-shell' })
    expect(shell).not.toContain('min-h-[76vh]')
  })

  it('rewrites Airbnb hot pink when a hotel brief uses the offline Airbnb anchor', () => {
    const html = rewriteAnchorAccentLeaks('<button class="bg-[#FF385C] text-[#E61E4D]">Reserve</button>', {
      ...plan,
      brief: 'Boutique hotel on the coast',
      visualWorld: { ...plan.visualWorld, accent: '#0f766e', accent2: '#b45309' },
    }, { primary: { app: 'Airbnb' } })
    expect(html).toContain('#0f766e')
    expect(html).not.toMatch(/FF385C|E61E4D/i)
  })

  it('rewrites loud Figma brand backgrounds for portfolio contexts', () => {
    const html = rewriteAnchorAccentLeaks('<section class="bg-[#0ACF83] text-[#A259FF]"><div class="bg-[#F24E1E]"></div></section>', {
      ...plan,
      brief: 'Portfolio for a brand designer',
    }, { primary: { app: 'Figma' } })
    expect(html).toContain('bg-[#f6f1e9]')
    expect(html).toContain('text-[#6d28d9]')
    expect(html).not.toMatch(/0ACF83|F24E1E|A259FF/i)
  })

  it('compresses excessive generated hero whitespace', () => {
    expect(compressExcessiveSpacing('<section class="py-48 mt-40"></section>')).toContain('py-24 mt-20')
  })

  it('rewrites common copied anchor product clusters', () => {
    const html = sanitizeHtml('<html><body><h2>Design</h2><p>FigJam, Slides, and Dev Mode</p></body></html>')
    expect(detectVerbatimAnchorCopy(html).count).toBe(0)
    expect(html).toContain('Workshop Board')
    expect(html).toContain('Handoff Studio')
  })

  it('adds polished fallback sections without engine copy leaks', () => {
    const html = ensureMinimumVerticalSections('<!DOCTYPE html><html><body><section class="w-full"><div class="mx-auto max-w-7xl px-6">One</div></section><footer></footer></body></html>', plan, 3, { siteHint: 'fitness' })
    expect((html.match(/<section\b/g) || []).length).toBe(3)
    expect(html).toContain('Training Rhythm')
    expect(html).not.toContain('Proof point')
    expect(html).not.toContain('placeholder filler')
  })

  it('wraps code blocks so generated snippets do not overflow cards', () => {
    const html = sanitizeHtml('<html><body><section class="w-full"><div class="mx-auto max-w-7xl px-6"><pre class="text-sm">const veryLongIdentifierName = true</pre></div></section></body></html>', plan)
    expect(html).toContain('whitespace-pre-wrap')
    expect(html).toContain('break-words')
  })
})
