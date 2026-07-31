import { describe, expect, it } from 'vitest'
import {
  parseComposition,
  sectionToProps,
  dslNodeToValue,
  type CompositionSection,
  type DslNode,
} from './composition-parser.ts'
import { parseTypeTree } from './openui-signature.ts'
import { DEFAULT_DESIGN } from '../../../ship-fast-blocks/src/primitives/design-system.ts'

describe('parseComposition', () => {
  it('parses @design global line', () => {
    const result = parseComposition('@design radius:rounded shadow:soft')
    expect(result.design.radius).toBe('rounded')
    expect(result.design.shadow).toBe('soft')
  })

  it('defaults to DEFAULT_DESIGN when no @design line', () => {
    const result = parseComposition('@section SplitHero\n  heading Hello')
    expect(result.design.radius).toBe(DEFAULT_DESIGN.radius)
  })

  it('parses @brand and @title', () => {
    const result = parseComposition('@brand Acme\n@title Acme — We ship')
    expect(result.brand).toBe('Acme')
    expect(result.title).toBe('Acme — We ship')
  })

  it('parses @pages', () => {
    const result = parseComposition('@pages home about pricing contact')
    expect(result.pages).toEqual(['home', 'about', 'pricing', 'contact'])
  })

  it('defaults section page to "home" when no @page directive', () => {
    const result = parseComposition('@section SplitHero\n  heading Hello')
    expect(result.sections[0].page).toBe('home')
  })

  it('parses @page directive and tags subsequent sections', () => {
    const result = parseComposition(
      [
        '@section Navbar',
        '  brand Acme',
        '@section SplitHero',
        '  heading Home hero',
        '@page about',
        '@section PersonGrid',
        '  heading About team',
        '@page contact',
        '@section ContactForm',
        '  heading Contact us',
      ].join('\n'),
    )
    expect(result.sections.length).toBe(4)
    expect(result.sections[0].page).toBe('home') // Navbar
    expect(result.sections[1].page).toBe('home') // SplitHero
    expect(result.sections[2].page).toBe('about') // PersonGrid
    expect(result.sections[3].page).toBe('contact') // ContactForm
  })

  it('adds @page pageIds to pages list', () => {
    const result = parseComposition(
      [
        '@pages home about contact',
        '@section Navbar',
        '  brand Acme',
        '@page about',
        '@section PersonGrid',
        '  heading Team',
        '@page contact',
        '@section ContactForm',
        '  heading Contact',
      ].join('\n'),
    )
    expect(result.pages).toContain('about')
    expect(result.pages).toContain('contact')
  })

  it('adds new pageIds from @page not in @pages list', () => {
    const result = parseComposition(
      [
        '@pages home about',
        '@section Navbar',
        '  brand Acme',
        '@page about',
        '@section PersonGrid',
        '  heading Team',
        '@page blog',
        '@section ArticlePreview',
        '  heading Blog posts',
      ].join('\n'),
    )
    expect(result.pages).toContain('blog')
  })

  it('ensures home is first page', () => {
    const result = parseComposition('@pages about pricing')
    expect(result.pages[0]).toBe('home')
    expect(result.pages).toContain('about')
  })

  it('parses @nav labels', () => {
    const result = parseComposition('@nav home:Home about:About pricing:Plans')
    expect(result.navLabels).toEqual({
      home: 'Home',
      about: 'About',
      pricing: 'Plans',
    })
  })

  it('strips <reasoning> blocks', () => {
    const input = `<reasoning>Let me think about this...</reasoning>
@section SplitHero
  heading Hello`
    const result = parseComposition(input)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].motif).toBe('SplitHero')
  })

  it('parses @section with motif name', () => {
    const result = parseComposition('@section CardGrid\n  heading Features')
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0].motif).toBe('CardGrid')
  })

  it('parses multiple sections', () => {
    const input = `
@section SplitHero
  heading Hello
@section CardGrid
  heading Features
@section Footer
  brand Acme`
    const result = parseComposition(input)
    expect(result.sections).toHaveLength(3)
    expect(result.sections[0].motif).toBe('SplitHero')
    expect(result.sections[1].motif).toBe('CardGrid')
    expect(result.sections[2].motif).toBe('Footer')
  })

  it('parses key-value props', () => {
    const result = parseComposition(
      '@section SplitHero\n  heading Hello World\n  primaryCta Start',
    )
    expect(result.sections[0].props.heading).toBe('Hello World')
    expect(result.sections[0].props.primaryCta).toBe('Start')
  })

  it('parses key:value props (colon syntax)', () => {
    const result = parseComposition(
      '@section SplitHero\n  heading: Hello\n  primaryCta: Start',
    )
    expect(result.sections[0].props.heading).toBe('Hello')
    expect(result.sections[0].props.primaryCta).toBe('Start')
  })

  it('parses nested groups (one-level, ~ separated)', () => {
    const input = `@section SplitHero
  stats>120+~Projects^45~Awards^98%~Retention`
    const result = parseComposition(input)
    expect(result.sections[0].nested.stats).toBeDefined()
    expect(result.sections[0].nested.stats.fields).toEqual([
      '120+',
      'Projects',
      '45',
      'Awards',
      '98%',
      'Retention',
    ])
  })

  it('parses per-section @design override', () => {
    const input = `@design radius:rounded
@section CardGrid
  @design radius:sharp
  heading Features`
    const result = parseComposition(input)
    expect(result.design.radius).toBe('rounded')
    expect(result.sections[0].design?.radius).toBe('sharp')
  })

  it('skips comment lines starting with #', () => {
    const input = `# This is a comment
@section SplitHero
  heading Hello`
    const result = parseComposition(input)
    expect(result.sections).toHaveLength(1)
  })

  it('skips empty lines', () => {
    const input = `

@section SplitHero

  heading Hello

@section Footer
  brand Acme`
    const result = parseComposition(input)
    expect(result.sections).toHaveLength(2)
  })
})

describe('parseComposition — recursive nesting', () => {
  it('parses two-level groups (GroupedList.groups)', () => {
    const input = `@section GroupedList
  groups>Espresso>Americano~Double shot~$4^Cappuccino~Steamed milk~$5|Pour Over>V60~Floral~$6`
    const result = parseComposition(input)
    const node = result.sections[0].nested.groups
    expect(node).toBeDefined()
    expect(node.children).toBeDefined()
    expect(node.children!.Espresso).toBeDefined()
    expect(node.children!.Espresso.fields).toEqual([
      'Americano',
      'Double shot',
      '$4',
      'Cappuccino',
      'Steamed milk',
      '$5',
    ])
    expect(node.children!['Pour Over']).toBeDefined()
    expect(node.children!['Pour Over'].fields).toEqual(['V60', 'Floral', '$6'])
  })

  it('parses three-level groups (hypothetical)', () => {
    const input = `@section GroupedList
  groups>Hot>Espresso>Americano~$4^Cappuccino~$5|Cold>Iced Latte~$5`
    const result = parseComposition(input)
    const node = result.sections[0].nested.groups
    expect(node.children!.Hot.children).toBeDefined()
    expect(node.children!.Hot.children!.Espresso.fields).toEqual([
      'Americano',
      '$4',
      'Cappuccino',
      '$5',
    ])
    expect(node.children!.Cold.fields).toEqual(['Iced Latte', '$5'])
  })
})

describe('sectionToProps — type-driven mapping', () => {
  it('converts flat props', () => {
    const section: CompositionSection = {
      motif: 'SplitHero',
      props: { heading: 'Hello', primaryCta: 'Start' },
      nested: {},
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.heading).toBe('Hello')
    expect(props.primaryCta).toBe('Start')
  })

  it('converts nested stats group to array of objects with type-driven names', () => {
    const section: CompositionSection = {
      motif: 'SplitHero',
      props: {},
      nested: {
        stats: { fields: ['120+', 'Projects', '45', 'Awards'] },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.stats).toEqual([
      { value: '120+', label: 'Projects' },
      { value: '45', label: 'Awards' },
    ])
  })

  it('converts nested cards group with type-driven field names', () => {
    const section: CompositionSection = {
      motif: 'CardGrid',
      props: {},
      nested: {
        cards: {
          fields: [
            'Feature One',
            'Does the thing',
            'Feature Two',
            'Does another',
          ],
        },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.cards).toEqual([
      {
        title: 'Feature One',
        description: 'Does the thing',
        imageAlt: 'Feature Two',
        imageSrc: 'Does another',
      },
    ])
  })

  it('converts two-level GroupedList.groups with correct nested shape', () => {
    const section: CompositionSection = {
      motif: 'GroupedList',
      props: {},
      nested: {
        groups: {
          fields: [],
          children: {
            Espresso: {
              fields: [
                'Americano',
                'Double shot',
                '$4',
                'Cappuccino',
                'Steamed milk',
                '$5',
              ],
            },
            'Pour Over': { fields: ['V60', 'Floral', '$6'] },
          },
        },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.groups).toEqual([
      {
        name: 'Espresso',
        items: [
          { title: 'Americano', description: 'Double shot', price: '$4' },
          { title: 'Cappuccino', description: 'Steamed milk', price: '$5' },
        ],
      },
      {
        name: 'Pour Over',
        items: [{ title: 'V60', description: 'Floral', price: '$6' }],
      },
    ])
  })

  it('converts PricingTable.tiers with comma-separated features (string[])', () => {
    const section: CompositionSection = {
      motif: 'PricingTable',
      props: {},
      nested: {
        tiers: {
          fields: [
            'Starter',
            '$0/mo',
            '1 project, 50 deploys',
            'Start Free',
            'false',
            'Pro',
            '$29/mo',
            '10 projects, unlimited deploys',
            'Start trial',
            'true',
          ],
        },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.tiers).toEqual([
      {
        name: 'Starter',
        price: '$0/mo',
        features: ['1 project', '50 deploys'],
        cta: 'Start Free',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$29/mo',
        features: ['10 projects', 'unlimited deploys'],
        cta: 'Start trial',
        highlighted: true,
      },
    ])
  })

  it('converts Footer.columns with comma-separated links (string[])', () => {
    const section: CompositionSection = {
      motif: 'Footer',
      props: {},
      nested: {
        columns: {
          fields: ['Pages', 'Home, Menu, About', 'Company', 'About, Contact'],
        },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.columns).toEqual([
      { title: 'Pages', links: ['Home', 'Menu', 'About'] },
      { title: 'Company', links: ['About', 'Contact'] },
    ])
  })

  it('includes design string when section has design override', () => {
    const section: CompositionSection = {
      motif: 'CardGrid',
      props: {},
      nested: {},
      page: 'home',
      line: 1,
      design: { ...DEFAULT_DESIGN, radius: 'sharp' },
    }
    const props = sectionToProps(section)
    expect(props.design).toContain('radius:sharp')
  })

  it('handles unknown group names by passing raw fields', () => {
    const section: CompositionSection = {
      motif: 'Custom',
      props: {},
      nested: {
        unknownGroup: { fields: ['a', 'b', 'c'] },
      },
      page: 'home',
      line: 1,
    }
    const props = sectionToProps(section)
    expect(props.unknownGroup).toEqual(['a', 'b', 'c'])
  })
})

describe('dslNodeToValue — recursive type mapping', () => {
  it('maps primitive type', () => {
    const tree = parseTypeTree('string')
    expect(dslNodeToValue({ fields: ['hello'] }, tree)).toBe('hello')
  })

  it('maps string[] type', () => {
    const tree = parseTypeTree('string[]')
    expect(dslNodeToValue({ fields: ['a', 'b', 'c'] }, tree)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('maps object[] type (one-level, flat fields)', () => {
    const tree = parseTypeTree('{value: string, label: string}[]')
    const node: DslNode = { fields: ['120+', 'Projects', '45', 'Awards'] }
    expect(dslNodeToValue(node, tree)).toEqual([
      { value: '120+', label: 'Projects' },
      { value: '45', label: 'Awards' },
    ])
  })

  it('maps nested object[] type (two-level, branch node)', () => {
    const tree = parseTypeTree(
      '{name: string, items: {title: string, price?: string}[]}[]',
    )
    const node: DslNode = {
      fields: [],
      children: {
        Espresso: { fields: ['Americano', '$4', 'Cappuccino', '$5'] },
        Cold: { fields: ['Iced Latte', '$5'] },
      },
    }
    expect(dslNodeToValue(node, tree)).toEqual([
      {
        name: 'Espresso',
        items: [
          { title: 'Americano', price: '$4' },
          { title: 'Cappuccino', price: '$5' },
        ],
      },
      { name: 'Cold', items: [{ title: 'Iced Latte', price: '$5' }] },
    ])
  })

  it('coerces boolean fields', () => {
    const tree = parseTypeTree('{name: string, highlighted?: boolean}[]')
    const node: DslNode = { fields: ['Starter', 'false', 'Pro', 'true'] }
    expect(dslNodeToValue(node, tree)).toEqual([
      { name: 'Starter', highlighted: false },
      { name: 'Pro', highlighted: true },
    ])
  })

  it('coerces number fields', () => {
    const tree = parseTypeTree('{count: number}[]')
    const node: DslNode = { fields: ['42', '7'] }
    expect(dslNodeToValue(node, tree)).toEqual([{ count: 42 }, { count: 7 }])
  })
})

describe('parseTypeTree', () => {
  it('parses primitive', () => {
    expect(parseTypeTree('string')).toEqual({
      kind: 'primitive',
      tsType: 'string',
    })
  })

  it('parses string[]', () => {
    expect(parseTypeTree('string[]')).toEqual({ kind: 'stringArray' })
  })

  it('parses object', () => {
    const tree = parseTypeTree('{title: string, price?: string}')
    expect(tree.kind).toBe('object')
    if (tree.kind === 'object') {
      expect(tree.fields).toHaveLength(2)
      expect(tree.fields[0].name).toBe('title')
      expect(tree.fields[1].optional).toBe(true)
    }
  })

  it('parses object[]', () => {
    const tree = parseTypeTree('{name: string, items: {title: string}[]}[]')
    expect(tree.kind).toBe('objectArray')
    if (tree.kind === 'objectArray') {
      expect(tree.fields).toHaveLength(2)
      expect(tree.fields[1].name).toBe('items')
      expect(tree.fields[1].type.kind).toBe('objectArray')
    }
  })
})

describe('stripHlTags — [hl] tags stripped from all nested values', () => {
  it('strips [hl] from footer column titles (stringArray in nested group)', () => {
    const result = parseComposition(
      [
        '@section Footer',
        '  brand Acme',
        '  columns>[hl]Studio[/hl]~Home, About^[hl]Company[/hl]~Our Story, Careers',
      ].join('\n'),
    )
    const footer = result.sections[0]
    const props = sectionToProps(footer)
    const columns = props.columns as Array<{
      title: string
      links: string[]
    }>
    expect(columns).toBeDefined()
    expect(columns[0].title).toBe('Studio')
    expect(columns[0].title).not.toContain('[hl]')
    expect(columns[1].title).toBe('Company')
    expect(columns[1].title).not.toContain('[hl]')
    expect(columns[0].links).toEqual(['Home', 'About'])
    expect(columns[1].links).toEqual(['Our Story', 'Careers'])
  })

  it('strips [hl] from string[] fields (links)', () => {
    const result = parseComposition(
      [
        '@section Navbar',
        '  brand Acme',
        '  links>[hl]Home[/hl], [hl]About[/hl], Contact',
      ].join('\n'),
    )
    const navbar = result.sections[0]
    const props = sectionToProps(navbar)
    const links = props.links as string[]
    expect(links).toEqual(['Home', 'About', 'Contact'])
    expect(links.every((l) => !l.includes('[hl]'))).toBe(true)
  })

  it('strips [hl] from top-level heading props', () => {
    const result = parseComposition(
      ['@section SplitHero', '  heading Build [hl]faster[/hl] with us'].join(
        '\n',
      ),
    )
    const props = sectionToProps(result.sections[0])
    expect(props.heading).toBe('Build faster with us')
    expect(props.heading).not.toContain('[hl]')
  })
})
