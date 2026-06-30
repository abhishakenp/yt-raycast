import { describe, it, expect } from 'vitest'
import { fixPlan } from './fixer'
import type { ParsedSitePlan } from './types'
import type { ValidationError as VError } from './validator'
import { validatePlan } from './validator'

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

function err(rule: string, section?: string): VError {
  return { rule, message: rule, section }
}

describe('fixPlan', () => {
  it('drops unknown roles', () => {
    const p = plan({
      sections: [
        { role: 'bogusRole', content: ['x'] },
        { role: 'hero', content: ['a', 'b', 'c', 'd'] },
        { role: 'footer', content: [] },
      ],
    })
    const fixed = fixPlan(p, [err('role_invalid', 'bogusRole')], 'restaurant')
    expect(fixed.sections.map((s) => s.role)).not.toContain('bogusRole')
    expect(fixed.sections.map((s) => s.role)).toContain('hero')
  })

  it('pads content to expected field count', () => {
    const p = plan({
      sections: [
        { role: 'hero', content: ['only one'] },
        { role: 'footer', content: [] },
      ],
    })
    const fixed = fixPlan(p, [err('field_count', 'hero')], 'restaurant')
    const hero = fixed.sections.find((s) => s.role === 'hero')
    expect(hero).toBeDefined()
    expect(hero!.content.length).toBeGreaterThanOrEqual(4)
  })

  it('truncates content to expected field count', () => {
    const p = plan({
      sections: [
        { role: 'hero', content: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] },
        { role: 'footer', content: [] },
      ],
    })
    const fixed = fixPlan(p, [err('field_count', 'hero')], 'restaurant')
    const hero = fixed.sections.find((s) => s.role === 'hero')
    expect(hero!.content.length).toBe(4)
  })

  it('infers missing kind from section roles', () => {
    const p = plan({ kind: 'notakind' })
    const fixed = fixPlan(p, [err('kind_unknown')], 'notakind')
    expect(fixed.kind).not.toBe('notakind')
    expect(fixed.kind.length).toBeGreaterThan(0)
  })

  it('drops unbalanced nested groups', () => {
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
    const fixed = fixPlan(p, [err('nested_unbalanced', 'menu')], 'restaurant')
    const menu = fixed.sections.find((s) => s.role === 'menu')
    expect(menu?.nested).toBeUndefined()
  })

  it('drops malformed tables/operations', () => {
    const p = plan({
      tables: [{ name: 'empty', fields: [], seeded: false }],
      operations: [{ name: 'bad', macroType: 'bogus' as never, table: 't' }],
    })
    const fixed = fixPlan(p, [err('plus_malformed')], 'restaurant')
    expect(fixed.tables).toHaveLength(0)
    expect(fixed.operations).toHaveLength(0)
  })

  it('drops invalid pages', () => {
    const p = plan({ pages: ['bogusPage', 'menu'] })
    const fixed = fixPlan(p, [err('page_invalid')], 'restaurant')
    expect(fixed.pages).not.toContain('bogusPage')
  })

  it('returns a new plan object (immutable)', () => {
    const original = plan()
    const fixed = fixPlan(original, [], 'restaurant')
    expect(fixed).not.toBe(original)
    expect(fixed.sections).not.toBe(original.sections)
  })

  it('no_sections is left as-is (cannot fix)', () => {
    const p = plan({ sections: [] })
    const fixed = fixPlan(p, [err('no_sections')], 'restaurant')
    expect(fixed.sections).toEqual([])
  })

  it('end-to-end: fix produces a valid plan from a repairable one', () => {
    const p = plan({
      sections: [
        { role: 'bogusRole', content: ['x'] },
        { role: 'hero', content: ['a', 'b', 'c'] },
        { role: 'footer', content: [] },
      ],
    })
    const result = validatePlan(p, 'restaurant')
    const fixed = fixPlan(p, result.errors, 'restaurant')
    const revalidated = validatePlan(fixed, fixed.kind)
    expect(revalidated.errors.some((e) => e.rule === 'role_invalid')).toBe(
      false,
    )
  })
})
