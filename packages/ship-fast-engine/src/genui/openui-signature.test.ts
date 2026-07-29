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

// Motif capsules present in the generated spec.
const COMPONENTS = [
  'SplitHero',
  'CenteredHero',
  'CardGrid',
  'PricingTable',
  'TestimonialRow',
  'GroupedList',
  'Footer',
  'Navbar',
  'MediaSplit',
  'FaqAccordion',
  'ContactForm',
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
  it('parses ordered top-level arg names', () => {
    const args = topLevelArgNames('SplitHero')
    expect(args).toContain('heading')
    expect(args).toContain('primaryCta')
  })

  it('returns [] for an absent component', () => {
    expect(topLevelArgNames('__NoSuchComponentXYZ__')).toEqual([])
  })
})

describe('getComponentSignature', () => {
  it('returns a signature string for a present component', () => {
    expect(getComponentSignature('SplitHero')).toContain('SplitHero(')
  })

  it('returns null for a component missing from the spec', () => {
    expect(getComponentSignature('__NoSuchComponentXYZ__')).toBeNull()
  })
})
