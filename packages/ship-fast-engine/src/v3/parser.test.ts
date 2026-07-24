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

describe('reasoning block stripping', () => {
  it('strips <reasoning>...</reasoning> blocks before parsing', () => {
    const raw = `<reasoning>
The user wants a coffee shop website. Brand: "Meridian Coffee".
Sections needed: hero, features, menu, footer.
Tone: warm, inviting.
</reasoning>
restaurant
hero Meridian Coffee|Fresh coffee daily|Warm and inviting cafe|Cozy cafe interior
footer
@pages menu`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[0].role).toBe('hero')
    expect(plan.pages).toEqual(['menu'])
  })

  it('handles reasoning block with DSL-like content inside it', () => {
    const raw = `<reasoning>
I think this is a restaurant. Let me plan:
hero with heading
menu with categories
</reasoning>
restaurant
hero Test Brand|Test subtitle
footer`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(2)
    // The "hero" and "menu" lines inside reasoning must NOT be parsed as sections
    expect(plan.sections[0].role).toBe('hero')
    expect(plan.sections[1].role).toBe('footer')
  })

  it('parses normally when no reasoning block present', () => {
    const raw = `restaurant
hero Test|Subtitle
footer`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(2)
  })

  it('parses @freeform blocks with state, actions, and layout', () => {
    const raw = `saas
hero Counter App|The simplest way to count things
@freeform counterdemo
state: count=0 step=1
actions: inc→count+1, dec→count-1, reset→count=0
layout: <div class="flex flex-col items-center gap-8"><h1>{count}</h1><button onclick="inc">+</button></div>
@endfreeform
@pages features
@brand Counter`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('saas')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[0].role).toBe('hero')
    expect(plan.sections[1].role).toBe('counterdemo')
    expect(plan.sections[1].freeform).toBeDefined()
    expect(plan.sections[1].freeform!.state).toEqual({ count: '0', step: '1' })
    expect(plan.sections[1].freeform!.actions).toEqual({
      inc: 'count+1',
      dec: 'count-1',
      reset: 'count=0',
    })
    expect(plan.sections[1].freeform!.layout).toContain('{count}')
    expect(plan.sections[1].freeform!.layout).toContain('onclick="inc"')
  })

  it('parses @freeform block with multi-line layout', () => {
    const raw = `saas
hero Test
@freeform widget
state: value=0
actions: add→value+1
layout: <div class="p-4">
<span>{value}</span>
<button onclick="add">Add</button>
</div>
@endfreeform`
    const plan = parseSitePlan(raw)
    expect(plan.sections[1].freeform!.layout).toContain('\n')
    expect(plan.sections[1].freeform!.layout).toContain('<button')
  })

  it('handles @freeform block with no state or actions', () => {
    const raw = `saas
hero Test
@freeform static
layout: <div class="p-8">Hello world</div>
@endfreeform`
    const plan = parseSitePlan(raw)
    expect(plan.sections[1].freeform).toBeDefined()
    expect(plan.sections[1].freeform!.state).toEqual({})
    expect(plan.sections[1].freeform!.actions).toEqual({})
    expect(plan.sections[1].freeform!.layout).toContain('Hello world')
  })

  it('skips @type line and parses kind correctly', () => {
    const raw = `@type app
marketing
hero My App|A great app
@freeform counterdemo
state: count=0
actions: inc→count+1
layout: <div>{count}</div>
@endfreeform`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('marketing')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[1].role).toBe('counterdemo')
    expect(plan.sections[1].freeform).toBeDefined()
  })

  it('skips @type website line', () => {
    const raw = `@type website
restaurant
hero Test Restaurant|A fine place`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(1)
  })
})
