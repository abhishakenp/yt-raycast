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
