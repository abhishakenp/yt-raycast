import { describe, expect, it } from 'vitest'
import { composeAppShellHtml, parseIslandJson } from '../src/shell.js'
import { buildRunVariety, selectAnchorPair } from '../src/router.js'
import { fallbackGenome } from '../src/planner.js'

describe('app-shell composer', () => {
  const brief = 'Helmsman fleet operations console for autonomous delivery robots.'
  const route = selectAnchorPair(brief, { seed: 'shell' })
  const variety = buildRunVariety(brief, 'shell')
  const plan = { ...fallbackGenome(brief, route, variety), pageKind: 'app-shell' }

  it('parses island JSON fragments', () => {
    const islands = parseIslandJson('```json\n{"primary":"<div>Map</div>","secondary":"<div>Queue</div>"}\n```')
    expect(islands.primary).toBe('<div>Map</div>')
    expect(islands.secondary).toBe('<div>Queue</div>')
  })

  it('owns the 2D frame without fixed or absolute frame classes', () => {
    const html = composeAppShellHtml({
      brief,
      plan,
      route,
      islands: {
        primary: '<div class="grid gap-4"><h2>Robot map</h2></div>',
        secondary: '<div class="grid gap-4"><h2>Incident queue</h2></div>',
        tertiary: '<div class="grid gap-4"><h2>Controls</h2></div>',
      },
    })
    expect(html).toContain('lg:grid-cols-[17rem_1fr]')
    expect(html).toContain('<aside')
    expect(html).toContain('<main')
    expect(html).not.toMatch(/\b(fixed|absolute)\b/)
  })

  it('constrains narrow island grids so model fragments do not collide', () => {
    const html = composeAppShellHtml({
      brief,
      plan,
      route,
      islands: {
        primary: '<div>Map</div>',
        secondary: '<div>Queue</div>',
        tertiary: '<div class="grid grid-cols-3 gap-6"><div class="text-5xl">A</div><div>B</div><div>C</div></div>',
      },
    })
    expect(html).toContain('grid-cols-1')
    expect(html).not.toContain('grid-cols-3 gap-6')
    expect(html).not.toContain('text-5xl')
  })
})
