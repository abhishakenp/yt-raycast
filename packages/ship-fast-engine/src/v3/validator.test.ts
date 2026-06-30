import { describe, it, expect } from 'vitest'
import { validatePlan } from './validator'
import type { ParsedSitePlan } from './types'
import { parseSitePlan } from './parser'

function plan(overrides: Partial<ParsedSitePlan> = {}): ParsedSitePlan {
  return {
    kind: 'restaurant',
    sections: [
      {
        role: 'hero',
        content: [
          'Farm to Table',
          'Wood-fired cuisine',
          'Seasonal menus',
          'Rustic room',
        ],
      },
      { role: 'footer', content: [] },
    ],
    pages: [],
    tables: [],
    operations: [],
    ...overrides,
  }
}

describe('validatePlan', () => {
  it('passes a valid plan', () => {
    const result = validatePlan(plan(), 'restaurant')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rule 1: kind_unknown for unknown kind', () => {
    const result = validatePlan(plan({ kind: 'notakind' }), 'notakind')
    expect(result.errors.some((e) => e.rule === 'kind_unknown')).toBe(true)
    expect(result.valid).toBe(false)
  })

  it('rule 2: role_invalid for unknown role', () => {
    const p = plan({
      sections: [
        { role: 'bogusRole', content: ['x'] },
        { role: 'footer', content: [] },
      ],
    })
    const result = validatePlan(p, 'restaurant')
    expect(
      result.errors.some(
        (e) => e.rule === 'role_invalid' && e.section === 'bogusRole',
      ),
    ).toBe(true)
  })

  it('rule 3: field_count mismatch', () => {
    // hero expects 4 fields; give 1 (delta > 1).
    const p = plan({
      sections: [
        { role: 'hero', content: ['only one'] },
        { role: 'footer', content: [] },
      ],
    })
    const result = validatePlan(p, 'restaurant')
    expect(
      result.errors.some(
        (e) => e.rule === 'field_count' && e.section === 'hero',
      ),
    ).toBe(true)
  })

  it('rule 4: nested_unbalanced for empty group', () => {
    const p = plan({
      sections: [
        {
          role: 'menu',
          content: ['Heading'],
          nested: [{ name: '', items: [] }],
        },
        { role: 'footer', content: [] },
      ],
    })
    const result = validatePlan(p, 'restaurant')
    expect(result.errors.some((e) => e.rule === 'nested_unbalanced')).toBe(true)
  })

  it('rule 5: plus_malformed for bad macroType', () => {
    const p = plan({
      operations: [{ name: 'badOp', macroType: 'bogus' as never, table: 't' }],
    })
    const result = validatePlan(p, 'restaurant')
    expect(result.errors.some((e) => e.rule === 'plus_malformed')).toBe(true)
  })

  it('rule 5: plus_malformed for table with no fields', () => {
    const p = plan({ tables: [{ name: 'empty', fields: [], seeded: false }] })
    const result = validatePlan(p, 'restaurant')
    expect(result.errors.some((e) => e.rule === 'plus_malformed')).toBe(true)
  })

  it('rule 6: no_sections when empty', () => {
    const p = plan({ sections: [] })
    const result = validatePlan(p, 'restaurant')
    expect(result.errors.some((e) => e.rule === 'no_sections')).toBe(true)
  })

  it('rule 7: page_invalid for unknown page role', () => {
    const p = plan({ pages: ['bogusPage'] })
    const result = validatePlan(p, 'restaurant')
    expect(result.errors.some((e) => e.rule === 'page_invalid')).toBe(true)
  })

  it('validates the full restaurant example from the plan', () => {
    const raw = `restaurant
hero Farm to Table|Wood-fired cuisine in the heart of the valley|Seasonal menus sourced from local farms cooked over open flame|Rustic dining room with candlelit tables
menu Autumn Menu|Three courses from Chef Marco changing weekly with the harvest|Starters>Roasted Beet Tartare~Charred beets~14~Vegan^Charred Octopus~Smoked paprika~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34
cta Book a Table|Parties up to 8 for larger groups call us
footer
@pages menu cta`
    const parsed = parseSitePlan(raw)
    const result = validatePlan(parsed, 'restaurant')
    expect(result.valid).toBe(true)
  })
})
