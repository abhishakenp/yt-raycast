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

  it('parses @svelte blocks with script and markup', () => {
    const raw = `saas
hero Counter App|The simplest way to count things
@svelte counterdemo
<script>
  let count = 0
  let step = 1
  function inc() { count += step }
  function dec() { count -= step }
  function reset() { count = 0 }
</script>

<div class="flex flex-col items-center gap-8">
  <h1>{count}</h1>
  <button on:click={inc}>+</button>
</div>
@endsvelte
@pages features
@brand Counter`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('saas')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[0].role).toBe('hero')
    expect(plan.sections[1].role).toBe('counterdemo')
    expect(plan.sections[1].svelte).toBeDefined()
    expect(plan.sections[1].svelte!.source).toContain('let count = 0')
    expect(plan.sections[1].svelte!.source).toContain('on:click={inc}')
    expect(plan.sections[1].svelte!.source).toContain('{count}')
  })

  it('parses @svelte block with multi-line source', () => {
    const raw = `saas
hero Test
@svelte widget
<script>
  let value = 0
  function add() { value++ }
</script>

<div class="p-4">
  <span>{value}</span>
  <button on:click={add}>Add</button>
</div>
@endsvelte`
    const plan = parseSitePlan(raw)
    expect(plan.sections[1].svelte!.source).toContain('\n')
    expect(plan.sections[1].svelte!.source).toContain('<button')
  })

  it('handles @svelte block with markup only (no script)', () => {
    const raw = `saas
hero Test
@svelte static
<div class="p-8">Hello world</div>
@endsvelte`
    const plan = parseSitePlan(raw)
    expect(plan.sections[1].svelte).toBeDefined()
    expect(plan.sections[1].svelte!.source).toContain('Hello world')
  })

  it('skips @type line and parses kind correctly', () => {
    const raw = `@type app
marketing
hero My App|A great app
@svelte counterdemo
<script>
  let count = 0
  function inc() { count++ }
</script>

<div>{count}</div>
@endsvelte`
    const plan = parseSitePlan(raw)
    expect(plan.kind).toBe('marketing')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[1].role).toBe('counterdemo')
    expect(plan.sections[1].svelte).toBeDefined()
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
