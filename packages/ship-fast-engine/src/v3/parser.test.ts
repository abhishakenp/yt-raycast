import { describe, it, expect } from 'vitest'
import { parseSitePlan, parseSectionLine } from './parser'

describe('parseSitePlan', () => {
  it('parses a valid restaurant example', () => {
    const raw = `restaurant
hero Farm to Table|Wood-fired cuisine in the heart of the valley|Seasonal menus sourced from local farms cooked over open flame|Rustic dining room with candlelit tables
reservations Book a Table|Parties up to 8 for larger groups call us
footer
@pages menu reservations`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(3)
    expect(plan.sections[0]).toEqual({
      role: 'hero',
      content: [
        'Farm to Table',
        'Wood-fired cuisine in the heart of the valley',
        'Seasonal menus sourced from local farms cooked over open flame',
        'Rustic dining room with candlelit tables',
      ],
    })
    expect(plan.sections[1]).toEqual({
      role: 'reservations',
      content: ['Book a Table', 'Parties up to 8 for larger groups call us'],
    })
    expect(plan.sections[2]).toEqual({ role: 'footer', content: [] })
    expect(plan.pages).toEqual(['menu', 'reservations'])
  })

  it('parses nested menu groups', () => {
    const raw = `restaurant
menu Autumn Menu|Three courses from Chef Marco|Starters>Roasted Beet Tartare~Charred beets~14~Vegan^Charred Octopus~Smoked paprika~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34`
    const plan = parseSitePlan(raw)
    const menu = plan.sections[0]
    expect(menu.role).toBe('menu')
    expect(menu.content).toEqual([
      'Autumn Menu',
      'Three courses from Chef Marco',
    ])
    expect(menu.nested).toHaveLength(2)
    expect(menu.nested?.[0]).toEqual({
      name: 'Starters',
      items: [
        { fields: ['Roasted Beet Tartare', 'Charred beets', '14', 'Vegan'] },
        { fields: ['Charred Octopus', 'Smoked paprika', '18'] },
      ],
    })
    expect(menu.nested?.[1]).toEqual({
      name: 'Mains',
      items: [
        { fields: ['Grilled Ribeye', 'Charred onion confit', '42'] },
        { fields: ['Pan-seared Salmon', 'Lemon butter capers', '34'] },
      ],
    })
  })

  it('parses @pages line', () => {
    const plan = parseSitePlan(
      'restaurant\nfooter\n@pages menu reservations contact',
    )
    expect(plan.pages).toEqual(['menu', 'reservations', 'contact'])
  })

  it('parses + table unseeded', () => {
    const plan = parseSitePlan(
      'healthcare\nfooter\n+ pets name species breed ownerName birthDate',
    )
    expect(plan.tables).toHaveLength(1)
    expect(plan.tables[0]).toEqual({
      name: 'pets',
      fields: ['name', 'species', 'breed', 'ownerName', 'birthDate'],
      seeded: false,
    })
  })

  it('parses + table seeded (trailing +)', () => {
    const plan = parseSitePlan(
      'healthcare\nfooter\n+ vaccinations petName vaccine date nextDue +',
    )
    expect(plan.tables[0]).toEqual({
      name: 'vaccinations',
      fields: ['petName', 'vaccine', 'date', 'nextDue'],
      seeded: true,
    })
  })

  it('parses + operation with key', () => {
    const plan = parseSitePlan(
      'healthcare\nfooter\n+ markVaccinated favorites vaccinations petName',
    )
    expect(plan.operations[0]).toEqual({
      name: 'markVaccinated',
      macroType: 'favorites',
      table: 'vaccinations',
      key: 'petName',
    })
  })

  it('parses + operation without key', () => {
    const plan = parseSitePlan(
      'healthcare\nfooter\n+ scheduleAppointment submission reservations',
    )
    expect(plan.operations[0]).toEqual({
      name: 'scheduleAppointment',
      macroType: 'submission',
      table: 'reservations',
    })
  })

  it('parses footer-only section (no content)', () => {
    const section = parseSectionLine('footer')
    expect(section).toEqual({ role: 'footer', content: [] })
  })

  it('skips malformed/unknown lines silently', () => {
    const raw = `restaurant
hero Eyebrow|Heading|Sub|Alt
!!! garbage line !!!
footer`
    const plan = parseSitePlan(raw)
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections.map((s) => s.role)).toEqual(['hero', 'footer'])
  })

  it('handles empty input', () => {
    const plan = parseSitePlan('')
    expect(plan.kind).toBe('')
    expect(plan.sections).toEqual([])
    expect(plan.pages).toEqual([])
    expect(plan.tables).toEqual([])
    expect(plan.operations).toEqual([])
  })

  it('ignores blank lines and comments', () => {
    const raw = `# a comment
restaurant

# another
footer`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(1)
    expect(plan.sections[0].role).toBe('footer')
  })
})

describe('parseSectionLine', () => {
  it('parses role with single value when no pipe', () => {
    expect(parseSectionLine('cta Click Here')).toEqual({
      role: 'cta',
      content: ['Click Here'],
    })
  })

  it('parses role with no value', () => {
    expect(parseSectionLine('footer')).toEqual({ role: 'footer', content: [] })
  })

  it('does not split | inside [...] brackets', () => {
    // LLM may generate products[Espresso~2.50|Rich shot] — the | inside brackets
    // must NOT be treated as a field separator.
    const section = parseSectionLine(
      'gallery Our Menu|Description|products[Espresso~2.50|Rich shot^Cappuccino~3.50|Smooth]',
    )
    expect(section.role).toBe('gallery')
    // Only 3 content values — the | inside [...] must not create a 4th
    expect(section.content).toHaveLength(3)
    expect(section.content[0]).toBe('Our Menu')
    expect(section.content[1]).toBe('Description')
    // The entire products[...] must be a single content value, brackets intact
    expect(section.content[2]).toBe(
      'products[Espresso~2.50|Rich shot^Cappuccino~3.50|Smooth]',
    )
  })
})
