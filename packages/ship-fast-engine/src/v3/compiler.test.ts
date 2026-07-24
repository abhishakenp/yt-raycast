import { describe, it, expect } from 'vitest'
import type { ParsedSitePlan } from './types'
import { compileSitePlan, compileSection } from './compiler'

const restaurantPlan: ParsedSitePlan = {
  kind: 'restaurant',
  sections: [
    {
      role: 'hero',
      content: [
        'Farm to Table',
        'Wood-fired cuisine in the heart of the valley',
        'Seasonal menus sourced from local farms cooked over open flame',
        'Rustic dining room with candlelit tables',
      ],
    },
    {
      role: 'menu',
      content: [
        'Autumn Menu',
        'Three courses from Chef Marco changing weekly with the harvest',
      ],
      nested: [
        {
          name: 'Starters',
          items: [
            {
              fields: [
                'Roasted Beet Tartare',
                'Charred beets horseradish creme rye crisp',
                '14',
                'Vegan',
              ],
            },
            {
              fields: [
                'Charred Octopus',
                'Smoked paprika fingerling potato aioli',
                '18',
                '',
              ],
            },
          ],
        },
        {
          name: 'Mains',
          items: [
            { fields: ['Grilled Ribeye', 'Charred onion confit', '42', ''] },
            { fields: ['Pan-seared Salmon', 'Lemon butter capers', '34', ''] },
          ],
        },
      ],
    },
    {
      role: 'reservations',
      content: ['Book a Table', 'Parties up to 8 for larger groups call us'],
    },
    { role: 'footer', content: [] },
  ],
  pages: ['menu', 'reservations'],
  tables: [],
  operations: [],
}

describe('compileSection', () => {
  it('produces a component call + SectionAnchor with anchor ref', () => {
    const { statements, ref } = compileSection(
      { role: 'hero', content: ['Eyebrow', 'Heading', 'Sub', 'Alt'] },
      'restaurant',
      'home',
      'TestBrand',
      ['Home', 'Menu'],
    )
    expect(statements).toHaveLength(2)
    // buildComponentCall maps named props (eyebrow, heading, subheading, imageAlt)
    // to spec positional order; gaps (primaryCta, primaryTarget, …) become null.
    expect(statements[0]).toBe(
      'home_hero = RestaurantHero("Eyebrow", "Heading", "Sub", null, null, null, null, "Alt")',
    )
    expect(statements[1]).toBe(
      'home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")',
    )
    expect(ref).not.toBeNull()
    expect(ref).toBe('home_hero_anchor')
  })

  it('navbar anchor omits the scroll class', () => {
    const { statements } = compileSection(
      { role: 'navbar', content: [] },
      'restaurant',
      'menu',
      'TestBrand',
      ['Home', 'Menu'],
    )
    // navbar injects brand + nav as first two positional args
    expect(statements[0]).toBe(
      'menu_navbar = RestaurantNavbar("TestBrand", ["Home","Menu"])',
    )
    expect(statements[1]).toBe(
      'menu_navbar_anchor = SectionAnchor("menu_navbar", menu_navbar)',
    )
  })

  it('nested menu section serializes categories array', () => {
    const { statements, ref } = compileSection(
      restaurantPlan.sections[1]!,
      'restaurant',
      'home',
      'TestBrand',
      ['Home', 'Menu'],
    )
    expect(ref).not.toBeNull()
    // call statement starts with home_menu = RestaurantMenu(
    expect(statements[0]!.startsWith('home_menu = RestaurantMenu(')).toBe(true)
    // categories array present as JSON with group names
    expect(statements[0]).toContain('Starters')
    expect(statements[0]).toContain('Roasted Beet Tartare')
    expect(statements[0]).toContain('Mains')
  })

  it('trailing undefined omitted, gaps become null', () => {
    const { statements } = compileSection(
      { role: 'hero', content: ['Eyebrow'] },
      'restaurant',
      'home',
      'TestBrand',
      ['Home', 'Menu'],
    )
    // only one positional value → no trailing nulls
    expect(statements[0]).toBe('home_hero = RestaurantHero("Eyebrow")')
  })

  it('unknown component (not in registry) returns empty statements + null ref', () => {
    // 'reservations' role has no RestaurantReservations component in the spec
    const { statements, ref } = compileSection(
      { role: 'reservations', content: ['Book a Table'] },
      'restaurant',
      'home',
      'TestBrand',
      ['Home'],
    )
    expect(statements).toEqual([])
    expect(ref).toBeNull()
  })

  it('emits Freeform call for sections with freeform def', () => {
    const { statements, ref } = compileSection(
      {
        role: 'counterdemo',
        content: [],
        freeform: {
          state: { count: '0' },
          actions: { inc: 'count+1', dec: 'count-1' },
          layout: '<div>{count}</div>',
        },
      },
      'saas',
      'home',
      'Counter',
      ['Home'],
    )
    expect(statements).toHaveLength(2)
    expect(statements[0]).toContain('home_counterdemo = Freeform(')
    // Freeform JSON is double-encoded: JSON.stringify(def) then JSON.stringify(string)
    // so inner quotes are escaped. Verify the content is present.
    expect(statements[0]).toContain('count')
    expect(statements[0]).toContain('inc')
    expect(statements[0]).toContain('layout')
    expect(ref).toBe('home_counterdemo_anchor')
  })

  it('unknown component without freeform still returns empty', () => {
    const { statements, ref } = compileSection(
      { role: 'nonexistent', content: ['test'] },
      'saas',
      'home',
      'Brand',
      ['Home'],
    )
    expect(statements).toEqual([])
    expect(ref).toBeNull()
  })
})

// ── Inline array parsing (~ and ^ separators) ───────────────────────────────
// The LLM naturally generates array content inline like:
//   features Why Choose Us|Delight in every sip|Online Ordering~Order ahead^Loyalty Program~Earn points
// These tests verify the compiler parses that into proper JS arrays/objects.
describe('compileSection — inline array parsing', () => {
  it('parses flat object array with ~ and ^ separators', () => {
    const { statements } = compileSection(
      {
        role: 'features',
        content: [
          'Why Choose Us',
          'Delight in every sip',
          'Online Ordering~Order ahead and skip the wait^Loyalty Program~Earn points for every visit^Fresh Roasted~Sourced locally',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    // Should contain 3 feature objects with title + description
    const call = statements.find((s) => s.includes('EcommerceFeatures'))
    expect(call).toBeDefined()
    expect(call).toContain('Online Ordering')
    expect(call).toContain('Order ahead and skip the wait')
    expect(call).toContain('Loyalty Program')
    expect(call).toContain('Earn points for every visit')
    expect(call).toContain('Fresh Roasted')
    expect(call).toContain('Sourced locally')
  })

  it('strips fieldName[...] bracket prefix when LLM copies vocabulary signature', () => {
    // LLM sometimes writes: features[Online Ordering~Order ahead^Loyalty Program~Earn points]
    // instead of just the values. The compiler must strip the "features[...]" wrapper.
    const { statements } = compileSection(
      {
        role: 'features',
        content: [
          'Why Choose Us',
          'Delight in every sip',
          'features[Online Ordering~Order ahead^Loyalty Program~Earn points]',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    const call = statements.find((s) => s.includes('EcommerceFeatures'))
    expect(call).toBeDefined()
    expect(call).toContain('Online Ordering')
    expect(call).toContain('Order ahead')
    expect(call).toContain('Loyalty Program')
    expect(call).toContain('Earn points')
    // Should NOT contain the literal "features[" prefix
    expect(call).not.toContain('features[')
  })

  it('parses primitive array (no sub-fields) with ~ separator', () => {
    // products[] is a primitive array — just item names separated by ~
    const { statements } = compileSection(
      {
        role: 'gallery',
        content: [
          'Our Menu',
          'Explore our handcrafted drinks',
          'products[Espresso~Cold Brew~Cappuccino~Mocha]',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    const call = statements.find((s) => s.includes('EcommerceGallery'))
    expect(call).toBeDefined()
    expect(call).toContain('Espresso')
    expect(call).toContain('Cold Brew')
    expect(call).toContain('Cappuccino')
    expect(call).toContain('Mocha')
  })

  it('parses testimonials with 4 fields per item using ~ and ^', () => {
    // reviews[quote~name~role~rating] — 4 fields per item
    const { statements } = compileSection(
      {
        role: 'testimonials',
        content: [
          'What Customers Say',
          'Loved by locals',
          'Best coffee ever!~Emily~Regular~5^Great service~Mark~Visitor~4',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    const call = statements.find((s) => s.includes('EcommerceTestimonials'))
    expect(call).toBeDefined()
    expect(call).toContain('Best coffee ever!')
    expect(call).toContain('Emily')
    expect(call).toContain('Regular')
    expect(call).toContain('5')
    expect(call).toContain('Great service')
    expect(call).toContain('Mark')
    expect(call).toContain('Visitor')
    expect(call).toContain('4')
  })

  it('parses footer columns with sub-array links[]', () => {
    // columns[title~links[]] — each column has a title + variable-length links array
    // Format: About~Our Story~Our Team^Shop~Menu~Locations
    const { statements } = compileSection(
      {
        role: 'footer',
        content: [
          'Brewing happiness',
          'About~Our Story~Our Team^Shop~Menu~Locations',
          'Facebook~Instagram',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    const call = statements.find((s) => s.includes('EcommerceFooter'))
    expect(call).toBeDefined()
    expect(call).toContain('About')
    expect(call).toContain('Our Story')
    expect(call).toContain('Our Team')
    expect(call).toContain('Shop')
    expect(call).toContain('Menu')
    expect(call).toContain('Locations')
    expect(call).toContain('Facebook')
    expect(call).toContain('Instagram')
  })
})

describe('compileSitePlan', () => {
  const result = compileSitePlan(restaurantPlan, {
    brand: 'Valley Fire',
    theme: 'warm',
    locale: 'en',
    nav: ['Home', 'Menu', 'Reservations'],
    kind: 'restaurant',
    tagline: 'Wood-fired cuisine',
  })

  it('source contains home Stack and PageSwitch skeleton', () => {
    expect(result.source).toContain('home = Stack([')
    expect(result.source).toContain('root = PageSwitch(')
  })

  it('source contains SectionAnchor statements', () => {
    expect(result.source).toContain('SectionAnchor(')
  })

  it('component names use default family + PascalCase role', () => {
    expect(result.source).toContain('RestaurantHero')
    expect(result.source).toContain('RestaurantMenu')
    expect(result.source).toContain('RestaurantNavbar')
    expect(result.source).toContain('RestaurantFooter')
    // RestaurantReservations has no component in the spec → skipped silently
    expect(result.source).not.toContain('RestaurantReservations')
  })

  it('pageSources has home + secondary pages', () => {
    expect(result.pageSources.home).toBeDefined()
    expect(result.pageSources.menu).toBeDefined()
    expect(result.pageSources.reservations).toBeDefined()
    expect(result.pageSources.home).toContain('home = Stack([')
    expect(result.pageSources.menu).toContain('menu = Stack([')
  })

  it('skeleton targets map nav labels to page ids', () => {
    expect(result.skeleton).toContain('"Home":"home"')
    expect(result.skeleton).toContain('"Menu":"menu"')
    expect(result.skeleton).toContain('"Reservations":"reservations"')
  })

  it('lakebed has tables inferred from menu + reservations', () => {
    expect(result.lakebed.tables.length).toBeGreaterThan(0)
    expect(result.lakebed.tables.some((t) => t.name === 'menuItems')).toBe(true)
  })

  it('siteSpec shape matches V3SiteSpec contract', () => {
    expect(result.siteSpec.kind).toBe('restaurant')
    expect(result.siteSpec.brand).toBe('Valley Fire')
    expect(result.siteSpec.tagline).toBe('Wood-fired cuisine')
    expect(result.siteSpec.theme).toBe('warm')
    expect(result.siteSpec.locale).toBe('en')
    expect(result.siteSpec.skeleton).toBe(result.skeleton)
    expect(result.siteSpec.modules).toBe(result.pageSources)
    expect(result.siteSpec.sitePlan).toBe(restaurantPlan)
  })

  it('fullstackManifest.tables non-empty and derived from lakebed', () => {
    expect(result.siteSpec.fullstackManifest.tables).toEqual(
      result.lakebed.tables.map((t) => t.name),
    )
    expect(result.siteSpec.fullstackManifest.tables.length).toBeGreaterThan(0)
    expect(result.siteSpec.fullstackManifest.schemaVersion).toBe(1)
    expect(result.siteSpec.fullstackManifest.auth).toBe(false)
  })

  it('auth flag true when auth operation present', () => {
    const plan: ParsedSitePlan = {
      ...restaurantPlan,
      operations: [
        { name: 'recordSession', macroType: 'auth', table: 'authSessions' },
      ],
    }
    const r = compileSitePlan(plan, {
      brand: 'B',
      theme: 't',
      locale: 'en',
      nav: ['Home'],
      kind: 'restaurant',
    })
    expect(r.siteSpec.fullstackManifest.auth).toBe(true)
  })

  it('skipped pages are excluded from navbar nav labels and skeleton', () => {
    // Plan with a page ('contact') that has NO matching section and NO alias.
    // opts.nav includes 'Contact' but the page should be skipped, and the
    // navbar + skeleton must NOT reference it.
    const plan: ParsedSitePlan = {
      kind: 'commerce',
      sections: [
        { role: 'hero', content: ['Welcome'] },
        { role: 'gallery', content: ['Our Products', 'Great stuff'] },
      ],
      pages: ['contact', 'shop'],
      tables: [],
      operations: [],
    }
    const r = compileSitePlan(plan, {
      brand: 'TestShop',
      theme: 'default',
      locale: 'en',
      nav: ['Home', 'Contact', 'Shop'],
      kind: 'commerce',
    })

    // 'contact' page should NOT exist (no matching section, no alias)
    expect(r.pageSources['contact']).toBeUndefined()
    // 'shop' page SHOULD exist (alias → gallery)
    expect(r.pageSources['shop']).toBeDefined()

    // Skeleton must only contain Home + Shop, NOT Contact
    expect(r.skeleton).toContain('"Home"')
    expect(r.skeleton).toContain('"Shop"')
    expect(r.skeleton).not.toContain('"Contact"')

    // Navbar on home page must use filtered nav (no Contact)
    const homeNavbarStmt = r.pageSources.home
      .split('\n')
      .find((l) => l.includes('home_navbar'))
    expect(homeNavbarStmt).toBeDefined()
    expect(homeNavbarStmt).not.toContain('Contact')
    expect(homeNavbarStmt).toContain('Shop')

    // Navbar on shop page must also use filtered nav (no Contact)
    const shopNavbarStmt = r.pageSources.shop
      .split('\n')
      .find((l) => l.includes('shop_navbar'))
    expect(shopNavbarStmt).toBeDefined()
    expect(shopNavbarStmt).not.toContain('Contact')
  })

  it('secondary page with no exact role match falls back to fuzzy match', () => {
    // Simulate LLM saying @pages menu for a commerce kind (which has no 'menu' role,
    // but has 'gallery' which contains 'menu' content). The fuzzy match should find
    // a section whose role includes the page name or vice versa.
    const plan: ParsedSitePlan = {
      kind: 'commerce',
      sections: [
        { role: 'hero', content: ['Welcome'] },
        { role: 'gallery', content: ['Our Menu', 'Drinks and treats'] },
      ],
      pages: ['menu'],
      tables: [],
      operations: [],
    }
    const r = compileSitePlan(plan, {
      brand: 'TestCafe',
      theme: 'default',
      locale: 'en',
      nav: ['Home', 'Menu'],
      kind: 'commerce',
    })
    // The 'menu' page source should contain the gallery content (fuzzy matched)
    expect(r.pageSources['menu']).toBeDefined()
    expect(r.pageSources['menu']).toContain('EcommerceGallery')
    expect(r.pageSources['menu']).toContain('Our Menu')
  })

  it('BUG 1: home page gets footer appended when LLM did not author one', () => {
    const plan: ParsedSitePlan = {
      kind: 'commerce',
      sections: [
        { role: 'hero', content: ['Welcome to the shop'] },
        { role: 'gallery', content: ['Our Products', 'Great stuff'] },
      ],
      pages: ['shop'],
      tables: [],
      operations: [],
    }
    const r = compileSitePlan(plan, {
      brand: 'TestShop',
      theme: 'default',
      locale: 'en',
      nav: ['Home', 'Shop'],
      kind: 'commerce',
    })
    // Home page must contain a footer call even though no footer was authored
    expect(r.pageSources.home).toContain('EcommerceFooter')
    const homeLines = r.pageSources.home.split('\n')
    const footerLine = homeLines.find((l) => l.includes('home_footer'))
    expect(footerLine).toBeDefined()
    // The footer should appear before the Stack assignment
    const stackIdx = homeLines.findIndex((l) => l.startsWith('home = Stack('))
    const footerIdx = homeLines.findIndex((l) => l.includes('home_footer'))
    expect(footerIdx).toBeLessThan(stackIdx)
  })

  it('BUG 1: home page does NOT get duplicate footer when LLM authored one', () => {
    const plan: ParsedSitePlan = {
      kind: 'commerce',
      sections: [
        { role: 'hero', content: ['Welcome'] },
        {
          role: 'footer',
          content: [
            'Our tagline',
            'Shop~New Arrivals^Help~FAQ',
            'Twitter~Instagram',
          ],
        },
      ],
      pages: [],
      tables: [],
      operations: [],
    }
    const r = compileSitePlan(plan, {
      brand: 'TestShop',
      theme: 'default',
      locale: 'en',
      nav: ['Home'],
      kind: 'commerce',
    })
    // Should contain exactly one footer call on the home page
    const homeFooterCalls = r.pageSources.home
      .split('\n')
      .filter((l) => l.includes('home_footer') && l.includes('EcommerceFooter'))
    expect(homeFooterCalls).toHaveLength(1)
  })

  it('BUG 2: footer with empty columns gets auto-generated columns from nav', () => {
    const { statements } = compileSection(
      { role: 'footer', content: [] },
      'commerce',
      'home',
      'TestBrand',
      ['Home', 'Gallery', 'Testimonials'],
    )
    const call = statements.find((s) => s.includes('EcommerceFooter'))
    expect(call).toBeDefined()
    // Auto-generated "Pages" column should contain all nav labels
    expect(call).toContain('Pages')
    expect(call).toContain('Home')
    expect(call).toContain('Gallery')
    expect(call).toContain('Testimonials')
    // Auto-generated "Company" column
    expect(call).toContain('Company')
    expect(call).toContain('About')
    expect(call).toContain('Contact')
    // Auto-generated "Legal" column
    expect(call).toContain('Legal')
    expect(call).toContain('Privacy')
    expect(call).toContain('Terms')
  })

  it('BUG 2: footer with authored columns does NOT get auto-generated columns', () => {
    const { statements } = compileSection(
      {
        role: 'footer',
        content: [
          'Our tagline',
          'Shop~New Arrivals^Help~FAQ',
          'Twitter~Instagram',
        ],
      },
      'commerce',
      'home',
      'TestBrand',
      ['Home', 'Gallery'],
    )
    const call = statements.find((s) => s.includes('EcommerceFooter'))
    expect(call).toBeDefined()
    // Authored columns should be present, NOT auto-generated ones
    expect(call).toContain('Shop')
    expect(call).toContain('New Arrivals')
    expect(call).toContain('Help')
    expect(call).toContain('FAQ')
    // Should NOT contain auto-generated "Pages" column
    expect(call).not.toContain('Pages')
  })

  it('BUG 2: footer with no social content gets empty social []', () => {
    const { statements } = compileSection(
      { role: 'footer', content: [] },
      'commerce',
      'home',
      'TestBrand',
      ['Home'],
    )
    const call = statements.find((s) => s.includes('EcommerceFooter'))
    expect(call).toBeDefined()
    // social should be [] (empty array), not null, so component doesn't use defaults
    // The call is: EcommerceFooter(brand, tagline, columns, social, ...)
    // Empty social [] appears as [] in the serialized call
    expect(call).toMatch(/\[\]/)
  })
})
