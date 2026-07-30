import { describe, expect, it } from 'vitest'
import {
  validatePageStructure,
  repairPageStructure,
} from './page-structure-validator.ts'
import type { ParsedComposition, CompositionSection } from './composition-parser.ts'
import { DEFAULT_DESIGN } from '../../../ship-fast-blocks/src/primitives/design-system.ts'

function makeSection(
  motif: string,
  page: string,
  props: Record<string, string> = {},
): CompositionSection {
  return {
    motif,
    props,
    nested: {},
    line: 0,
    page,
  }
}

function makeComposition(
  pages: string[],
  sections: CompositionSection[],
): ParsedComposition {
  return {
    design: { ...DEFAULT_DESIGN },
    pages,
    sections,
  }
}

describe('validatePageStructure', () => {
  it('returns no violations when sub-pages use different motifs from home', () => {
    const parsed = makeComposition(
      ['home', 'about', 'blog'],
      [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('CardGrid', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('PersonGrid', 'about'),
        makeSection('Timeline', 'about'),
        makeSection('Footer', 'about'),
        makeSection('Navbar', 'blog'),
        makeSection('ArticlePreview', 'blog'),
        makeSection('ContentTabs', 'blog'),
        makeSection('Footer', 'blog'),
      ],
    )
    const violations = validatePageStructure(parsed)
    expect(violations).toHaveLength(0)
  })

  it('flags when sub-page shares multiple motifs with home', () => {
    const parsed = makeComposition(
      ['home', 'about'],
      [
        makeSection('Navbar', 'home'),
        makeSection('CardGrid', 'home'),
        makeSection('TestimonialRow', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CardGrid', 'about'),
        makeSection('TestimonialRow', 'about'),
        makeSection('Footer', 'about'),
      ],
    )
    const violations = validatePageStructure(parsed)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    const dup = violations.find((v) => v.type === 'duplicate_motif_across_pages')
    expect(dup).toBeTruthy()
    expect(dup?.motifs).toContain('CardGrid')
    expect(dup?.motifs).toContain('TestimonialRow')
  })

  it('flags when about page lacks team/story motif', () => {
    const parsed = makeComposition(
      ['home', 'about'],
      [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CardGrid', 'about'),
        makeSection('Footer', 'about'),
      ],
    )
    const violations = validatePageStructure(parsed)
    const missing = violations.find(
      (v) => v.type === 'missing_required_motif' && v.page === 'about',
    )
    expect(missing).toBeTruthy()
    expect(missing?.motifs).toContain('PersonGrid')
  })

  it('flags when blog page lacks ArticlePreview/ContentTabs', () => {
    const parsed = makeComposition(
      ['home', 'blog'],
      [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'blog'),
        makeSection('CardGrid', 'blog'),
        makeSection('Footer', 'blog'),
      ],
    )
    const violations = validatePageStructure(parsed)
    const missing = violations.find(
      (v) => v.type === 'missing_required_motif' && v.page === 'blog',
    )
    expect(missing).toBeTruthy()
    expect(missing?.motifs).toContain('ArticlePreview')
  })

  it('returns no violations for single-page sites', () => {
    const parsed = makeComposition(
      ['home'],
      [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
      ],
    )
    expect(validatePageStructure(parsed)).toHaveLength(0)
  })
})

describe('repairPageStructure', () => {
  it('replaces duplicated CardGrid on about page with PersonGrid', () => {
    const parsed = makeComposition(
      ['home', 'about'],
      [
        makeSection('Navbar', 'home'),
        makeSection('CardGrid', 'home'),
        makeSection('TestimonialRow', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CardGrid', 'about', { heading: 'Our Team' }),
        makeSection('TestimonialRow', 'about'),
        makeSection('Footer', 'about'),
      ],
    )
    const { repaired, violations } = repairPageStructure(parsed)
    expect(repaired).toBe(true)
    expect(violations.length).toBeGreaterThan(0)

    // The CardGrid on about should be replaced with PersonGrid
    const aboutSections = parsed.sections.filter((s) => s.page === 'about')
    const hasPersonGrid = aboutSections.some((s) => s.motif === 'PersonGrid')
    expect(hasPersonGrid).toBe(true)
    // Should still have the heading
    const personGrid = aboutSections.find((s) => s.motif === 'PersonGrid')
    expect(personGrid?.props.heading).toBe('Our Team')
  })

  it('replaces CardGrid on blog page with ArticlePreview', () => {
    const parsed = makeComposition(
      ['home', 'blog'],
      [
        makeSection('Navbar', 'home'),
        makeSection('CardGrid', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'blog'),
        makeSection('CardGrid', 'blog'),
        makeSection('Footer', 'blog'),
      ],
    )
    const { repaired } = repairPageStructure(parsed)
    expect(repaired).toBe(true)

    const blogSections = parsed.sections.filter((s) => s.page === 'blog')
    const hasArticlePreview = blogSections.some(
      (s) => s.motif === 'ArticlePreview',
    )
    expect(hasArticlePreview).toBe(true)
  })

  it('does not repair when no violations', () => {
    const parsed = makeComposition(
      ['home', 'about'],
      [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('PersonGrid', 'about'),
        makeSection('Timeline', 'about'),
        makeSection('Footer', 'about'),
      ],
    )
    const { repaired, violations } = repairPageStructure(parsed)
    expect(repaired).toBe(false)
    expect(violations).toHaveLength(0)
  })

  it('preserves Navbar and Footer sections during repair', () => {
    const parsed = makeComposition(
      ['home', 'about'],
      [
        makeSection('Navbar', 'home'),
        makeSection('CardGrid', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CardGrid', 'about'),
        makeSection('Footer', 'about'),
      ],
    )
    repairPageStructure(parsed)

    const aboutSections = parsed.sections.filter((s) => s.page === 'about')
    expect(aboutSections[0].motif).toBe('Navbar')
    expect(aboutSections[aboutSections.length - 1].motif).toBe('Footer')
  })
})

// ─── Regression tests for deductive break fixes ──────────────────────────

describe('page-type keyword collision fix', () => {
  it('does not force a software "menu" docs page into restaurant GroupedList', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'documentation-menu'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'documentation-menu'),
        makeSection('SidebarNav', 'documentation-menu', { heading: 'API Menu' }),
        makeSection('Footer', 'documentation-menu'),
      ],
    }
    repairPageStructure(parsed)
    // SidebarNav should be preserved — "documentation-menu" should NOT
    // match the "menu" page type (it's a docs page, not a restaurant menu)
    const docsSections = parsed.sections.filter(
      (s) => s.page === 'documentation-menu',
    )
    const contentSection = docsSections.find(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )
    expect(contentSection?.motif).toBe('SidebarNav')
  })

  it('still matches "menu" as a page type for a restaurant menu page', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'menu'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'menu'),
        makeSection('CtaBand', 'menu', { heading: 'Order now' }),
        makeSection('Footer', 'menu'),
      ],
    }
    repairPageStructure(parsed)
    // "menu" page should get GroupedList (restaurant menu repair)
    const menuSections = parsed.sections.filter((s) => s.page === 'menu')
    const contentSection = menuSections.find(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )
    expect(contentSection?.motif).toBe('GroupedList')
  })

  it('matches "about-us" as about page type via hyphen delimiter', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'about-us'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about-us'),
        makeSection('CtaBand', 'about-us', { heading: 'Contact us' }),
        makeSection('Footer', 'about-us'),
      ],
    }
    repairPageStructure(parsed)
    const aboutSections = parsed.sections.filter((s) => s.page === 'about-us')
    const contentSection = aboutSections.find(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )
    expect(contentSection?.motif).toBe('PersonGrid')
  })
})

describe('i18n repair heading fix', () => {
  it('preserves existing non-English heading instead of injecting English', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'about'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CtaBand', 'about', { heading: 'Visitez notre boulangerie' }),
        makeSection('Footer', 'about'),
      ],
    }
    repairPageStructure(parsed)
    const aboutSections = parsed.sections.filter((s) => s.page === 'about')
    const contentSection = aboutSections.find(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )
    // Motif should be repaired to PersonGrid
    expect(contentSection?.motif).toBe('PersonGrid')
    // But the French heading should be preserved, not replaced with "Our Team"
    expect(contentSection?.props.heading).toBe('Visitez notre boulangerie')
  })

  it('does not inject English heading when original had no heading', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'about'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'about'),
        makeSection('CtaBand', 'about', { subheading: 'Some subheading' }),
        makeSection('Footer', 'about'),
      ],
    }
    repairPageStructure(parsed)
    const aboutSections = parsed.sections.filter((s) => s.page === 'about')
    const contentSection = aboutSections.find(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )
    expect(contentSection?.motif).toBe('PersonGrid')
    // No English heading injected
    expect(contentSection?.props.heading).toBeUndefined()
  })
})

// ─── pageTypeFromId tiebreaker tests ────────────────────────────────────

describe('pageTypeFromId equal-length tiebreaker', () => {
  it('prefers prefix "blog" over suffix "post" for "blog-post"', () => {
    // "blog-post" matches both "blog" (prefix) and "post" (suffix), both 4 chars.
    // The prefix "blog" should win as it's the primary page type.
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'blog-post'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'blog-post'),
        // BlogPost is required for "post" type, ArticlePreview for "blog" type.
        // If "blog" wins, ArticlePreview satisfies the requirement.
        // If "post" wins, BlogPost satisfies the requirement.
        makeSection('ArticlePreview', 'blog-post'),
        makeSection('Footer', 'blog-post'),
      ],
    }
    const violations = validatePageStructure(parsed)
    // If "blog" is the page type, ArticlePreview satisfies it → no violation.
    // If "post" is the page type, ArticlePreview does NOT satisfy it → violation.
    const blogPostViolations = violations.filter(
      (v) => v.page === 'blog-post',
    )
    expect(blogPostViolations).toHaveLength(0)
  })

  it('prefers longer key "documentation" over shorter "menu" for "documentation-menu"', () => {
    const parsed: ParsedComposition = {
      design: { ...DEFAULT_DESIGN },
      pages: ['home', 'documentation-menu'],
      sections: [
        makeSection('Navbar', 'home'),
        makeSection('SplitHero', 'home'),
        makeSection('Footer', 'home'),
        makeSection('Navbar', 'documentation-menu'),
        makeSection('SidebarNav', 'documentation-menu'),
        makeSection('Footer', 'documentation-menu'),
      ],
    }
    const violations = validatePageStructure(parsed)
    // "documentation" (13 chars) should win over "menu" (4 chars).
    // SidebarNav satisfies "documentation" → no violation.
    const docViolations = violations.filter(
      (v) => v.page === 'documentation-menu',
    )
    expect(docViolations).toHaveLength(0)
  })
})
