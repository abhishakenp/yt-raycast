import { describe, expect, it } from 'vitest'
import { normalizeGenome, parseJsonObject, planPageGenome } from '../src/planner.js'
import { buildRunVariety, selectAnchorPair } from '../src/router.js'

describe('planner helpers', () => {
  it('recovers JSON from fenced or prefixed model output', () => {
    expect(parseJsonObject('```json\n{"pageKind":"vertical-doc"}\n```')).toEqual({ pageKind: 'vertical-doc' })
    expect(parseJsonObject('Here:\n{"pageKind":"app-shell","x":1}\nthanks')).toEqual({ pageKind: 'app-shell', x: 1 })
  })

  it('normalizes a partial planner response into a complete genome', () => {
    const brief = 'Homepage for a Berlin electronic music label and warehouse event series.'
    const route = selectAnchorPair(brief, { seed: 'plan' })
    const variety = buildRunVariety(brief, 'plan')
    const plan = normalizeGenome({
      visualWorld: { bg: '#101010', accent: '#ff5500', fontDisplay: 'Bricolage Grotesque' },
      sections: [{ role: 'hero', contains: 'poster opening' }],
    }, { brief, route, variety })
    expect(plan.pageKind).toBe('vertical-doc')
    expect(plan.visualWorld.bg).toBe('#101010')
    expect(plan.visualWorld.accent).toBe('#ff5500')
    expect(plan.visualWorld.fontDisplay).toBe('Bricolage Grotesque')
    expect(plan.sections.length).toBeGreaterThanOrEqual(3)
    expect(plan.contentInventory.length).toBeGreaterThan(3)
  })

  it('forces true operational briefs onto the app-shell path', () => {
    const brief = 'Fleet operations console for autonomous delivery robots with live incidents and teleoperation.'
    const route = selectAnchorPair(brief, { seed: 'ops' })
    const variety = buildRunVariety(brief, 'ops')
    const plan = normalizeGenome({ pageKind: 'vertical-doc' }, { brief, route, variety })
    expect(route.siteHint).toBe('ops-console')
    expect(plan.pageKind).toBe('app-shell')
  })

  it('tones hotel palettes toward hospitality instead of hot app accents', () => {
    const brief = 'Homepage for a boutique hotel with ocean-view rooms, spa, and cedar architecture.'
    const route = selectAnchorPair(brief, { seed: 'hotel-palette' })
    const variety = buildRunVariety(brief, 'hotel-palette')
    const plan = normalizeGenome({
      visualWorld: { bg: '#ff2d55', surface: '#ffd6e1', text: '#111111', accent: '#ff2d55', accent2: '#ff375f' },
    }, { brief, route, variety })
    expect(route.siteHint).toBe('local-experience')
    expect(plan.visualWorld.accent).toBe('#0f766e')
    expect(plan.visualWorld.accent2).toBe('#b45309')
  })

  it('tones Figma portfolio palettes away from fluorescent brand swatches', () => {
    const brief = 'Portfolio for a brand designer working with startups.'
    const route = { siteHint: 'portfolio', primary: { app: 'Figma' } }
    const variety = buildRunVariety(brief, 'figma-palette')
    const plan = normalizeGenome({
      visualWorld: { bg: '#0acf83', surface: '#1abcfe', text: '#a259ff', accent: '#f24e1e', accent2: '#1abcfe' },
    }, { brief, route, variety })
    expect(plan.visualWorld.bg).toBe('#f6f1e9')
    expect(plan.visualWorld.accent).toBe('#6d28d9')
  })

  it('recovers when provider JSON mode rejects a planner response', async () => {
    const brief = 'Homepage for a developer analytics product.'
    const route = selectAnchorPair(brief, { seed: 'json-mode-retry' })
    const variety = buildRunVariety(brief, 'json-mode-retry')
    let calls = 0
    const result = await planPageGenome({
      brief,
      route,
      variety,
      llm: async ({ responseFormat }) => {
        calls += 1
        if (responseFormat) throw new Error('json_validate_failed')
        return { content: '{"pageKind":"vertical-doc","archetype":"retry recovered"}', model: 'mock-no-json-mode' }
      },
    })
    expect(calls).toBe(2)
    expect(result.plan.archetype).toBe('retry recovered')
  })
})
