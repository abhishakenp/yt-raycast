import { describe, expect, it } from 'vitest'
import { inferVisualKind, renderArtDirectedImageSurface } from '../src/media-surfaces.js'

const plan = {
  brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast.',
  archetype: 'hotel homepage',
  visualWorld: {
    bg: '#101820',
    surface: '#f5efe6',
    text: '#fff8ec',
    muted: '#b7aa98',
    accent: '#d97706',
    accent2: '#38bdf8',
  },
}

describe('media surfaces', () => {
  it('routes local hospitality imagery to a concrete hotel room surface', () => {
    expect(inferVisualKind('ocean room hero', { plan, route: { siteHint: 'local-experience' } })).toBe('hotel-room')
    expect(inferVisualKind('coast trail map', { plan, route: { siteHint: 'local-experience' } })).toBe('destination-map')
    expect(inferVisualKind('namespace heatmap', {
      plan: {
        ...plan,
        brief: 'Homepage for a Kubernetes cost analytics SaaS',
      },
      route: { siteHint: 'software' },
    })).not.toBe('ops-map')
    expect(inferVisualKind('cost table', {
      plan: {
        ...plan,
        brief: 'Homepage for a Kubernetes cost analytics SaaS',
      },
      route: { siteHint: 'software' },
    })).toBe('product-console')
    const html = renderArtDirectedImageSurface('ocean room hero', 'aspect-[16/9] rounded-xl', plan, 0, { siteHint: 'local-experience' })
    expect(html).toContain('data-visual-kind="hotel-room"')
    expect(html).toContain('ocean view')
    expect(html).not.toMatch(/placeholder|style=/i)
  })

  it('varies hotel visual surfaces across repeated room subjects', () => {
    const html = [0, 1, 2].map((index) => renderArtDirectedImageSurface('Stoneholm room detail', '', plan, index, { siteHint: 'local-experience' })).join('')
    expect(html).toContain('data-visual-kind="hotel-room"')
    expect(html).toContain('data-visual-kind="destination-map"')
    expect(html).toContain('data-visual-kind="editorial-spread"')
  })

  it('renders varied app and product surfaces without duplicate class attributes', () => {
    const consoleHtml = renderArtDirectedImageSurface('Kubernetes spend dashboard', '', {
      ...plan,
      brief: 'Homepage for a Kubernetes cost analytics SaaS',
      archetype: 'software homepage',
    }, 0, { siteHint: 'software' })
    const productHtml = renderArtDirectedImageSurface('Restore face oil bottle', '', {
      ...plan,
      brief: 'Homepage for a skincare shop',
      archetype: 'commerce homepage',
    }, 2, { siteHint: 'commerce' })
    expect(consoleHtml).toContain('data-visual-kind="product-console"')
    expect(productHtml).toContain('data-visual-kind="product-still-life"')
    expect(`${consoleHtml}${productHtml}`).not.toMatch(/\bclass="[^"]*"\s+class=/)
  })

  it('varies software media surfaces after the primary console', () => {
    const softwarePlan = {
      ...plan,
      brief: 'Homepage for a Kubernetes cost analytics SaaS',
      archetype: 'software homepage',
    }
    const html = [0, 1].map((index) => renderArtDirectedImageSurface('Kubernetes spend dashboard', '', softwarePlan, index, { siteHint: 'software' })).join('')
    expect(html).toContain('data-visual-kind="product-console"')
    expect(html).toContain('data-visual-kind="brand-case-wall"')
  })
})
