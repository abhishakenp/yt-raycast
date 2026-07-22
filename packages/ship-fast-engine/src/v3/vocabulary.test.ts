import { describe, it, expect } from 'vitest'
import {
  VOCABULARY,
  UNIVERSAL_ROLES,
  getVocabulary,
  roleFieldOrder,
} from './vocabulary'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fieldNames(kind: string, role: string): string[] {
  return (
    getVocabulary(kind)
      .roles.find((r) => r.role === role)
      ?.fields.map((f) => f.name) ?? []
  )
}

const universalRoleNames = UNIVERSAL_ROLES.map((r) => r.role)

// ── Registry shape ───────────────────────────────────────────────────────────
describe('vocabulary registry', () => {
  it('VOCABULARY has 17 kinds', () => {
    expect(VOCABULARY).toHaveLength(17)
  })

  it('every kind has a non-empty roles array', () => {
    for (const kv of VOCABULARY) {
      expect(kv.roles.length).toBeGreaterThan(0)
    }
  })

  it('all 17 known kinds are present', () => {
    const kinds = VOCABULARY.map((v) => v.kind)
    expect(kinds).toEqual(
      expect.arrayContaining([
        'commerce',
        'restaurant',
        'saas',
        'finance',
        'marketplace',
        'realestate',
        'healthcare',
        'portfolio',
        'publication',
        'service',
        'education',
        'events',
        'travel',
        'government',
        'logistics',
        'jobs',
        'marketing',
      ]),
    )
  })
})

// ── UNIVERSAL_ROLES (exported separately) ────────────────────────────────────
describe('UNIVERSAL_ROLES', () => {
  it('is exported as a separate array', () => {
    expect(Array.isArray(UNIVERSAL_ROLES)).toBe(true)
    expect(UNIVERSAL_ROLES.length).toBeGreaterThan(0)
  })

  it('every entry has universal: true', () => {
    for (const r of UNIVERSAL_ROLES) {
      expect(r.universal).toBe(true)
    }
  })

  it('includes navbar, footer, testimonials, faq, cta, stats, contact', () => {
    expect(universalRoleNames).toEqual(
      expect.arrayContaining([
        'navbar',
        'footer',
        'testimonials',
        'faq',
        'cta',
        'stats',
        'contact',
      ]),
    )
  })

  it('navbar has empty fields (brand + nav injected by engine)', () => {
    const navbar = UNIVERSAL_ROLES.find((r) => r.role === 'navbar')!
    expect(navbar.fields).toEqual([])
  })

  it('footer has tagline, columns, social', () => {
    const footer = UNIVERSAL_ROLES.find((r) => r.role === 'footer')!
    expect(footer.fields.map((f) => f.name)).toEqual([
      'tagline',
      'columns',
      'social',
    ])
  })
})

// ── getVocabulary ────────────────────────────────────────────────────────────
describe('getVocabulary', () => {
  it('returns the matching kind vocabulary', () => {
    const v = getVocabulary('saas')
    expect(v.kind).toBe('saas')
    expect(v.roles.length).toBeGreaterThan(0)
  })

  it('falls back to marketing for unknown kind', () => {
    const v = getVocabulary('nonexistent')
    expect(v.kind).toBe('nonexistent')
    // fallback roles are the MARKETING array
    expect(v.roles.map((r) => r.role)).toEqual(
      expect.arrayContaining(['hero', 'navbar', 'footer']),
    )
  })
})

// ── roleFieldOrder ───────────────────────────────────────────────────────────
describe('roleFieldOrder', () => {
  it('returns flattened top-level field names for a role', () => {
    expect(roleFieldOrder('saas', 'hero')).toEqual([
      'badge',
      'heading',
      'subheading',
    ])
  })

  it('returns [] for unknown role', () => {
    expect(roleFieldOrder('saas', 'nonexistent')).toEqual([])
  })

  it('returns [] for unknown kind (fallback marketing still works)', () => {
    // unknown kind falls back to marketing; 'hero' exists in marketing
    expect(roleFieldOrder('zzz', 'hero')).toEqual([
      'badge',
      'heading',
      'subheading',
    ])
    expect(roleFieldOrder('zzz', 'nonexistent')).toEqual([])
  })
})

// ── Saas — field names match actual component spec args ──────────────────────
describe('saas vocabulary', () => {
  it('hero has badge, heading, subheading (not eyebrow/heading/subheading/imageAlt)', () => {
    expect(fieldNames('saas', 'hero')).toEqual([
      'badge',
      'heading',
      'subheading',
    ])
  })

  it('features has heading, subheading, features[]', () => {
    const features = getVocabulary('saas').roles.find(
      (r) => r.role === 'features',
    )!
    expect(features.fields.map((f) => f.name)).toEqual([
      'heading',
      'subheading',
      'features',
    ])
    const arr = features.fields.find((f) => f.name === 'features')!
    expect(arr.array).toBe(true)
    expect(arr.nested?.map((n) => n.name)).toEqual(['title', 'description'])
  })

  it('pricing has heading, subheading, tiers[]', () => {
    const names = fieldNames('saas', 'pricing')
    expect(names).toEqual(['heading', 'subheading', 'tiers'])
  })

  it('logos has label, names[]', () => {
    expect(fieldNames('saas', 'logos')).toEqual(['label', 'names'])
  })

  it('includes navbar and footer', () => {
    const roles = getVocabulary('saas').roles.map((r) => r.role)
    expect(roles).toContain('navbar')
    expect(roles).toContain('footer')
  })
})

// ── Restaurant — roles used by integration test ──────────────────────────────
describe('restaurant vocabulary', () => {
  it('has hero, menu, footer roles', () => {
    const roles = getVocabulary('restaurant').roles.map((r) => r.role)
    expect(roles).toContain('hero')
    expect(roles).toContain('menu')
    expect(roles).toContain('footer')
  })

  it('hero has eyebrow, heading, subheading, imageAlt', () => {
    expect(fieldNames('restaurant', 'hero')).toEqual([
      'eyebrow',
      'heading',
      'subheading',
      'imageAlt',
    ])
  })

  it('menu has heading, description, categories[] with nested items', () => {
    const menu = getVocabulary('restaurant').roles.find(
      (r) => r.role === 'menu',
    )!
    expect(menu.fields.map((f) => f.name)).toEqual([
      'heading',
      'description',
      'categories',
    ])
    const categories = menu.fields.find((f) => f.name === 'categories')!
    expect(categories.array).toBe(true)
    // categories nested: name + items[name, description, price, tag]
    const catFields = categories.nested!
    expect(catFields.map((f) => f.name)).toEqual(['name', 'items'])
    const items = catFields.find((f) => f.name === 'items')!
    expect(items.array).toBe(true)
    expect(items.nested?.map((n) => n.name)).toEqual([
      'name',
      'description',
      'price',
      'tag',
    ])
  })
})

// ── Publication — roles with existing Newsroom/Blog/News components ─────────
describe('publication vocabulary', () => {
  it('has hero, featuredStory, storyGrid, topics, authors, subscribe, navbar, footer', () => {
    const roles = getVocabulary('publication').roles.map((r) => r.role)
    expect(roles).toContain('hero')
    expect(roles).toContain('navbar')
    expect(roles).toContain('footer')
    expect(roles).toContain('featuredStory')
    expect(roles).toContain('storyGrid')
    expect(roles).toContain('topics')
    expect(roles).toContain('authors')
    expect(roles).toContain('subscribe')
    expect(roles).not.toContain('articles')
    expect(roles).not.toContain('archive')
  })

  it('hero has kicker, headline, dek, imageAlt, caption', () => {
    expect(fieldNames('publication', 'hero')).toEqual([
      'kicker',
      'headline',
      'dek',
      'imageAlt',
      'caption',
    ])
  })
})

// ── Commerce ─────────────────────────────────────────────────────────────────
describe('commerce vocabulary', () => {
  it('hero has eyebrow, heading, subheading, imageAlt', () => {
    expect(fieldNames('commerce', 'hero')).toEqual([
      'eyebrow',
      'heading',
      'subheading',
      'imageAlt',
    ])
  })

  it('gallery has heading, subheading, products[]', () => {
    expect(fieldNames('commerce', 'gallery')).toEqual([
      'heading',
      'subheading',
      'products',
    ])
  })

  it('testimonials uses reviews[] not items[]', () => {
    const t = getVocabulary('commerce').roles.find(
      (r) => r.role === 'testimonials',
    )!
    expect(t.fields.map((f) => f.name)).toEqual([
      'heading',
      'subheading',
      'reviews',
    ])
  })
})

// ── Finance ──────────────────────────────────────────────────────────────────
describe('finance vocabulary', () => {
  it('cta has eyebrow, title, subtitle (not heading/subheading)', () => {
    expect(fieldNames('finance', 'cta')).toEqual([
      'eyebrow',
      'title',
      'subtitle',
    ])
  })

  it('footer has tagline, columns, social, legal, note', () => {
    expect(fieldNames('finance', 'footer')).toEqual([
      'tagline',
      'columns',
      'social',
      'legal',
      'note',
    ])
  })
})

// ── Marketplace ──────────────────────────────────────────────────────────────
describe('marketplace vocabulary', () => {
  it('hero has badge, headingLead, headingTail, subheading', () => {
    expect(fieldNames('marketplace', 'hero')).toEqual([
      'badge',
      'headingLead',
      'headingTail',
      'subheading',
    ])
  })
})

// ── Healthcare ───────────────────────────────────────────────────────────────
describe('healthcare vocabulary', () => {
  it('hero has badge, headingBefore, headingAfter, subheading, imageAlt', () => {
    expect(fieldNames('healthcare', 'hero')).toEqual([
      'badge',
      'headingBefore',
      'headingAfter',
      'subheading',
      'imageAlt',
    ])
  })

  it('stats has only items[] (no heading)', () => {
    const stats = getVocabulary('healthcare').roles.find(
      (r) => r.role === 'stats',
    )!
    expect(stats.fields.map((f) => f.name)).toEqual(['items'])
  })
})

// ── Portfolio ────────────────────────────────────────────────────────────────
describe('portfolio vocabulary', () => {
  it('hero has eyebrow, headlineLead, headlineAccent, headlineTail, description', () => {
    expect(fieldNames('portfolio', 'hero')).toEqual([
      'eyebrow',
      'headlineLead',
      'headlineAccent',
      'headlineTail',
      'description',
    ])
  })

  it('logos has only clients[]', () => {
    const logos = getVocabulary('portfolio').roles.find(
      (r) => r.role === 'logos',
    )!
    expect(logos.fields.map((f) => f.name)).toEqual(['clients'])
  })
})

// ── Government ───────────────────────────────────────────────────────────────
describe('government vocabulary', () => {
  it('hero has slides[], ticker[] (no heading)', () => {
    const hero = getVocabulary('government').roles.find(
      (r) => r.role === 'hero',
    )!
    expect(hero.fields.map((f) => f.name)).toEqual(['slides', 'ticker'])
  })

  it('about has sectionHeading, overview', () => {
    expect(fieldNames('government', 'about')).toEqual([
      'sectionHeading',
      'overview',
    ])
  })
})

// ── Travel ───────────────────────────────────────────────────────────────────
describe('travel vocabulary', () => {
  it('hero has location, headingTop, headingBottom, subheading, imageAlt', () => {
    expect(fieldNames('travel', 'hero')).toEqual([
      'location',
      'headingTop',
      'headingBottom',
      'subheading',
      'imageAlt',
    ])
  })

  it('has rooms role', () => {
    const roles = getVocabulary('travel').roles.map((r) => r.role)
    expect(roles).toContain('rooms')
  })
})

// ── Jobs ─────────────────────────────────────────────────────────────────────
describe('jobs vocabulary', () => {
  it('has jobs role with heading, description, items[]', () => {
    expect(fieldNames('jobs', 'jobs')).toEqual([
      'heading',
      'description',
      'items',
    ])
  })

  it('logos has heading, companies[]', () => {
    expect(fieldNames('jobs', 'logos')).toEqual(['heading', 'companies'])
  })
})

// ── Marketing (fallback) ─────────────────────────────────────────────────────
describe('marketing vocabulary', () => {
  it('hero has badge, heading, subheading', () => {
    expect(fieldNames('marketing', 'hero')).toEqual([
      'badge',
      'heading',
      'subheading',
    ])
  })

  it('footer has links[], copyright', () => {
    expect(fieldNames('marketing', 'footer')).toEqual(['links', 'copyright'])
  })
})

// ── Array field structure ────────────────────────────────────────────────────
describe('array field structure', () => {
  it('array fields have array: true and nested array', () => {
    const features = getVocabulary('saas')
      .roles.find((r) => r.role === 'features')!
      .fields.find((f) => f.name === 'features')!
    expect(features.array).toBe(true)
    expect(features.nested).toBeDefined()
    expect(features.nested!.length).toBeGreaterThan(0)
  })

  it('primitive array fields have empty nested', () => {
    const social = getVocabulary('commerce')
      .roles.find((r) => r.role === 'footer')!
      .fields.find((f) => f.name === 'social')!
    expect(social.array).toBe(true)
    expect(social.nested).toEqual([])
  })
})
