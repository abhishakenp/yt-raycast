import { describe, expect, it } from 'vitest'
import {
  extractCompositionCopy,
  validateCompositionQuality,
} from './composition-quality.ts'

const bespokeSource = `home_splitHero = SplitHero(heading="Roast profiles tuned in Brooklyn", subheading="Small-batch beans, cupped weekly", primaryCta="Order beans", design="radius:rounded shadow:soft")
home_cards = CardGrid(heading="Our craft", cards="Espresso~Double shot intensity^Pour Over~Slow extraction")
home = Stack([home_splitHero, home_cards])
root = PageSwitch(["Home"], [home], "", {})`

describe('composition-quality', () => {
  it('reads copy from OpenUI prop literals, not component identifiers', () => {
    const copy = extractCompositionCopy(bespokeSource)
    expect(copy).toContain('Roast profiles tuned in Brooklyn')
    expect(copy).not.toContain('SplitHero')
    expect(copy).not.toContain('home_cards')
  })

  it('accepts bespoke composition copy', () => {
    expect(validateCompositionQuality(bespokeSource)).toEqual({
      valid: true,
      score: 100,
      violations: [],
    })
  })

  it('rejects banned template phrases in generated copy', () => {
    const result = validateCompositionQuality(
      'home_cards = CardGrid(heading="Why Choose Us", cards="Best in class~We deliver")',
    )
    expect(result.valid).toBe(false)
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: 'banned-phrase',
          excerpt: 'Why Choose Us',
        }),
        expect.objectContaining({
          rule: 'banned-phrase',
          excerpt: 'Best in class',
        }),
      ]),
    )
    expect(result.score).toBeLessThan(100)
  })

  it('rejects placeholder copy', () => {
    const result = validateCompositionQuality(
      'home_cards = CardGrid(cards="Feature One~Lorem ipsum dolor^Item 2~TODO", testimonials="Great~Jane Doe~Regular")',
    )
    expect(result.valid).toBe(false)
    const labels = result.violations
      .filter((violation) => violation.rule === 'placeholder')
      .map((violation) => violation.message)
    expect(labels).toEqual(
      expect.arrayContaining([
        expect.stringContaining('lorem ipsum'),
        expect.stringContaining('Feature N'),
        expect.stringContaining('Item N'),
        expect.stringContaining('TODO marker'),
        expect.stringContaining('John/Jane Doe'),
      ]),
    )
  })

  it('does not flag real copy that merely contains placeholder-like words', () => {
    const result = validateCompositionQuality(
      'home_hero = SplitHero(heading="Featured services for growing teams", subheading="Sizes up to XXXL, shipped daily")',
    )
    expect(result).toEqual({ valid: true, score: 100, violations: [] })
  })
})
