import { describe, expect, it } from 'vitest'
import { buildHeroContract, buildSharedContract } from '../src/contracts.js'
import { mobbinHeroBlock, mobbinSessionBlock } from '../src/utils/mobbin-blocks.js'
import { applyMobbinAnchorToPlan, extractGoogleFont } from '../src/utils/mobbin-anchor-plan.js'
import { resolveAnchor } from '../src/utils/dna.js'
import { selectAnchorPair } from '../src/router.js'

const LINEAR = resolveAnchor({ app: 'Linear' })
const SUBSTACK = resolveAnchor({ app: 'Substack' })

const BASE_PLAN = {
  archetype: 'developer platform',
  reference: '',
  visualWorld: {
    bg: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#2563eb',
    accent2: '#0ea5e9',
    fontDisplay: 'Inter',
    fontBody: 'Inter',
    mood: 'clean SaaS',
    decor: 'minimal',
    layoutGrammar: 'split hero',
  },
  signatureMoves: [],
  mediaStrategy: { treatment: 'clean-glass', contentStrategy: 'story-forward' },
}

describe('mobbinHeroBlock', () => {
  it('includes anchor palette and doctrine for marketing pages', () => {
    const block = mobbinHeroBlock(LINEAR)
    expect(block).toMatch(/MOBBIN ANCHOR — Linear/)
    expect(block).toMatch(/#5e6ad2/)
    expect(block).toMatch(/Must:/)
    expect(block).toMatch(/Reject:/)
  })

  it('includes editorial DNA for publication anchors', () => {
    const block = mobbinHeroBlock(SUBSTACK, { publication: true })
    expect(block).toMatch(/Substack/)
    expect(block).toMatch(/serif/i)
    expect(block).toMatch(/#ff6719/)
  })
})

describe('buildHeroContract', () => {
  it('embeds compact Mobbin DNA in the Gemini hero leg', () => {
    const route = { siteHint: 'software', primary: LINEAR, secondary: null }
    const contract = buildHeroContract('Kubernetes cost platform', BASE_PLAN, route, {}, { id: 'vertical-doc' })
    expect(contract).toMatch(/MOBBIN ANCHOR — Linear/)
    expect(contract).toMatch(/HERO SCALE/)
  })

  it('embeds Mobbin DNA for blog/publication routes', () => {
    const route = { siteHint: 'blog', primary: SUBSTACK, secondary: null }
    const contract = buildHeroContract('A blog about dogs', BASE_PLAN, route, {}, { id: 'editorial-blog-index' })
    expect(contract).toMatch(/MOBBIN ANCHOR — Substack/)
    expect(contract).toMatch(/featured post masthead/)
  })
})

describe('buildSharedContract', () => {
  it('always includes full Mobbin session block including publication', () => {
    const route = { siteHint: 'blog', primary: SUBSTACK, secondary: null }
    const contract = buildSharedContract('A blog about dogs', BASE_PLAN, route, {}, { id: 'editorial-blog-index' })
    expect(contract).toMatch(/MOBBIN OFFLINE DESIGN DNA/)
    expect(contract).toMatch(/PRIMARY ANCHOR: Substack/)
    expect(contract).toMatch(/Design doctrine:/)
  })
})

describe('applyMobbinAnchorToPlan', () => {
  it('nudges dark-anchor palettes onto planner output', () => {
    const route = { siteHint: 'software', primary: LINEAR, secondary: null }
    const out = applyMobbinAnchorToPlan(BASE_PLAN, route, 'B2B SaaS homepage')
    expect(out.reference).toMatch(/Linear/)
    expect(out.visualWorld.accent).toBe('#5e6ad2')
    expect(out.signatureMoves.length).toBeGreaterThan(0)
    expect(out.visualWorld.bg).toMatch(/^#/)
  })

  it('preserves publication serif fonts from Substack DNA', () => {
    const route = { siteHint: 'blog', primary: SUBSTACK, secondary: null }
    const out = applyMobbinAnchorToPlan(BASE_PLAN, route, 'A blog about dogs')
    expect(out.visualWorld.fontBody).toMatch(/Source Serif|Fraunces|Charter/i)
    expect(out.visualWorld.accent).toBe('#ff6719')
  })
})

describe('extractGoogleFont', () => {
  it('pulls font names from DNA typography hints', () => {
    expect(extractGoogleFont('Inter Display 600 or Outfit 600')).toBe('Inter')
    expect(extractGoogleFont('Tiempos or Charter (substitute Source Serif 400)')).toBe('Source Serif 4')
  })
})

describe('selectAnchorPair publication', () => {
  it('routes blogs to editorial Mobbin anchors', () => {
    const route = selectAnchorPair('A blog about dogs and training', { seed: 'mobbin-blog' })
    expect(['Substack', 'NYT', 'Vogue', 'MasterClass', 'Patagonia', 'Apple']).toContain(route.primary.app)
    expect(mobbinSessionBlock(route.primary)).toMatch(/PRIMARY ANCHOR:/)
  })
})
