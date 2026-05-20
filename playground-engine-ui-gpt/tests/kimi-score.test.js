import { describe, expect, it } from 'vitest'
import { scoreKimiReadiness } from '../src/kimi-score.js'

describe('scoreKimiReadiness', () => {
  it('rewards layered, specific, varied visual surfaces', () => {
    const html = `<!DOCTYPE html><body>
      <section class="w-full min-h-[76vh]"><div class="grid"><h1 class="text-8xl">Stoneholm 24 ocean rooms</h1>
        <div data-img="suite" data-visual="art-surface" data-visual-kind="hotel-room" class="absolute grid"></div>
        <div data-img="restaurant" data-visual="art-surface" data-visual-kind="editorial-spread" class="absolute grid"></div>
      </div></section>
      ${Array.from({ length: 6 }, (_, index) => `<section class="w-full"><div class="mx-auto grid"><p>May ${index + 10}, 42 suites, Oregon Coast, Pacific Table, fire pits, spa ${index}</p><div class="absolute"></div><div class="absolute"></div></div></section>`).join('')}
    </body></html>`
    const result = scoreKimiReadiness(html, { route: { siteHint: 'local-experience' }, plan: { pageKind: 'vertical-doc' } })
    expect(result.ok).toBe(true)
    expect(result.signals.richVisualKinds).toContain('hotel-room')
  })

  it('penalizes unfinished generic media', () => {
    const result = scoreKimiReadiness('<section><div data-img="placeholder" class="bg-gray-200"></div></section>', {
      plan: { pageKind: 'vertical-doc' },
      route: { siteHint: 'software' },
    })
    expect(result.ok).toBe(false)
    expect(result.issues.join(' ')).toMatch(/unfinished|too few/)
  })

  it('allows legitimate portfolio brand-asset wording and repeated case-board visuals', () => {
    const html = `<!DOCTYPE html><body>
      <section class="w-full min-h-[76vh]"><div class="grid"><h1 class="text-8xl">Maya Chen brand systems</h1>
        <div data-img="case board" data-visual="art-surface" data-visual-kind="brand-case-wall" class="absolute grid"></div>
      </div></section>
      ${Array.from({ length: 6 }, (_, index) => `<section class="w-full"><div class="mx-auto grid"><p>Brand assets for Linear, Vercel, Pitch, 202${index}, $${index + 2}M, Brooklyn studio.</p><div data-img="case ${index}" data-visual="art-surface" data-visual-kind="brand-case-wall" class="absolute grid"></div><div class="absolute"></div></div></section>`).join('')}
    </body></html>`
    const result = scoreKimiReadiness(html, { route: { siteHint: 'portfolio' }, plan: { pageKind: 'vertical-doc' } })
    expect(result.ok).toBe(true)
  })
})
