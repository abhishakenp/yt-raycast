import { describe, expect, it } from 'vitest'
import { scoreKimiReadiness, scoreVisualRichness } from '../src/quality/kimi-score.js'

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
})
