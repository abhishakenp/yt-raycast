import { describe, expect, it } from 'vitest'
import { scoreKimiReadiness, scoreVisualRichness } from '../src/quality/kimi-score.js'
import { sanitizeHtml } from '../src/utils/postprocess.js'

const SAMPLE = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={}</script>
</head><body>
<section class="w-full min-h-[76vh]"><div class="mx-auto max-w-7xl px-6">
<h1 class="text-5xl md:text-7xl">KubeMeter</h1>
<div data-img="cost dashboard" class="relative w-full aspect-[4/3] rounded-xl bg-[#1e293b]"></div>
</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6 grid grid-cols-3 gap-4">a</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-4">b</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-4">c</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-4">d</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-4">e</div></section>
<section class="w-full"><div class="mx-auto max-w-7xl px-6">$12k saved · 99.2% uptime</div></section>
</body></html>`

describe('kimi-score', () => {
  it('scores rich sample above threshold', () => {
    const r = scoreKimiReadiness(SAMPLE, { plan: { pageKind: 'vertical-doc' }, route: { siteHint: 'software' } })
    expect(r.score).toBeGreaterThanOrEqual(70)
    expect(r.signals.hasHeroScale).toBe(true)
  })

  it('computes visual richness', () => {
    const r = scoreVisualRichness(SAMPLE, { plan: { mediaStrategy: { treatment: 'grain-overlay' } } })
    expect(r.score).toBeGreaterThan(20)
  })

  it('compiles non-publication data-img blocks into rich visual surfaces by default', () => {
    const plan = {
      pageKind: 'vertical-doc',
      brief: 'Homepage for KubeMeter, a Kubernetes cost analytics platform.',
      visualWorld: {
        bg: '#08090a',
        surface: '#15161d',
        text: '#f4f4f5',
        muted: '#a1a1aa',
        accent: '#5e6ad2',
        accent2: '#14b8a6',
      },
    }
    const html = sanitizeHtml(`<!DOCTYPE html><html><head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={}</script>
      </head><body>
      <section class="w-full"><div class="mx-auto max-w-7xl px-6"><h1>KubeMeter</h1><div data-img="cost dashboard" class="w-full aspect-[4/3] rounded-xl"></div></div></section>
      </body></html>`, plan, { siteHint: 'software' }, plan.brief)
    expect(html).toMatch(/data-visual="art-surface"/)
    expect(html).toMatch(/data-visual-kind="product-console"/)
    expect(html).toMatch(/data-ship-density="detail-band"/)
    expect(html).toMatch(/<table class="w-full text-sm">/)
    expect(html).not.toMatch(/blur-3xl/)
  })

  it('recovers repetitive numbered non-publication pages into substantive product pages', () => {
    const plan = {
      pageKind: 'vertical-doc',
      archetype: 'cost attribution platform',
      brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform.',
      visualWorld: {
        bg: '#0d1b2a',
        surface: '#112138',
        text: '#e0e6ed',
        muted: '#6b7c93',
        accent: '#ff6b6b',
        accent2: '#4ecdc4',
      },
    }
    const repeated = Array.from({ length: 5 }, (_, i) => `<section class="w-full"><div class="mx-auto max-w-7xl px-6"><h${i ? 2 : 1}>KubeMeter ${i}</h${i ? 2 : 1}><p>Acme Platform and FinOps teams use 42 namespaces, $12k saved, May ${10 + i}, 99.${i}% uptime.</p></div></section>`).join('')
    const html = sanitizeHtml(`<!DOCTYPE html><html><head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={}</script>
      </head><body>${repeated}</body></html>`, plan, { siteHint: 'software' }, plan.brief)
    expect(html).toMatch(/Open-source Kubernetes cost attribution for platform teams/)
    expect(html).toMatch(/Deploy to cluster/)
    expect(html).toMatch(/View on GitHub/)
    expect(html).toMatch(/data-ship-density="detail-band"/)
    expect(html).not.toMatch(/<h[12][^>]*>KubeMeter [0-9]<\/h[12]>/)
  })
})
