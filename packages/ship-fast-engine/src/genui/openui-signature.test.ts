import { describe, expect, it } from 'vitest'

import {
  getComponentSignature,
  synthesizeComponentCall,
  topLevelArgNames,
  type SynthesisContext,
} from './openui-signature.ts'

const ctx: SynthesisContext = {
  brand: 'Field Notes',
  nav: ['Home', 'Work', 'About', 'Contact'],
  topic: 'a modern publication for curious readers',
  pageLabel: 'Home',
}

// Section-family components present in the generated spec spanning marketing,
// hospitality, community, ops, commerce, and software grammars.
const COMPONENTS = [
  'PortfolioHero',
  'PhotographyHero',
  'RestaurantHero',
  'CafeHero',
  'CommunityForumHero',
  'NonprofitHero',
  'ContactHero',
  'AnalyticsHero',
  'EcommerceHero',
  'SaasHero',
  'BlogHero',
]

describe('synthesizeComponentCall', () => {
  for (const name of COMPONENTS) {
    it(`synthesizes a non-null program for ${name}`, () => {
      const home = synthesizeComponentCall(name, ctx)
      expect(home).not.toBeNull()
    })
  }

  it('returns null for a component absent from the spec', () => {
    expect(synthesizeComponentCall('__NoSuchComponentXYZ__', ctx)).toBeNull()
  })
})

describe('topLevelArgNames', () => {
  it('parses ordered top-level arg names and drops className', () => {
    const args = topLevelArgNames('EcommerceHero')
    expect(args.slice(0, 3)).toEqual(['eyebrow', 'heading', 'subheading'])
    expect(args).not.toContain('className')
  })

  it('returns [] for an absent component', () => {
    expect(topLevelArgNames('__NoSuchComponentXYZ__')).toEqual([])
  })
})

describe('getComponentSignature', () => {
  it('returns a signature string for a present component', () => {
    expect(getComponentSignature('EcommerceHero')).toContain('EcommerceHero(')
  })

  it('returns null for a component missing from the spec', () => {
    expect(getComponentSignature('__NoSuchComponentXYZ__')).toBeNull()
  })
})
