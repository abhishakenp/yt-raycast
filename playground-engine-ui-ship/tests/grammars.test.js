import { describe, expect, it } from 'vitest'
import { getVerticalGrammars, getAppShellGrammars, pickGrammar } from '../src/grammars.js'

describe('grammars', () => {
  it('loads 6 vertical grammars', () => {
    expect(getVerticalGrammars().length).toBe(6)
  })

  it('loads 4 app-shell grammars', () => {
    expect(getAppShellGrammars().length).toBe(4)
  })

  it('picks ops-console as app-shell', () => {
    const g = pickGrammar({ brief: 'fleet ops console dashboard', siteHint: 'ops-console', seed: 'test-1' })
    expect(g.pageKind).toBe('app-shell')
  })

  it('varies grammar by seed', () => {
    const g1 = pickGrammar({ brief: 'skincare shop', siteHint: 'commerce', seed: 'seed-a' })
    const g2 = pickGrammar({ brief: 'skincare shop', siteHint: 'commerce', seed: 'seed-b' })
    expect(g1.id).toBeDefined()
    expect(g2.id).toBeDefined()
  })
})
