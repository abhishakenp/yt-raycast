import { describe, expect, it } from 'vitest'
import { buildCompositionPrompt } from './composition-prompt.ts'
import { generateGenome } from './genome.ts'

describe('buildCompositionPrompt', () => {
  it('returns system and user prompts', () => {
    const result = buildCompositionPrompt('a coffee shop')
    expect(result.system).toBeTruthy()
    expect(result.user).toContain('coffee shop')
  })

  it('includes reasoning phase instructions', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('<reasoning>')
    expect(result.system).toContain('</reasoning>')
  })

  it('includes DSL format rules', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('@section')
    expect(result.system).toContain('@pages')
    expect(result.system).toContain('@brand')
    expect(result.system).toContain('@nav')
  })

  it('includes highlight syntax [hl]', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('[hl]')
    expect(result.system).toContain('[/hl]')
  })

  it('passes locale to system prompt', () => {
    const result = buildCompositionPrompt('test', { locale: 'fr' })
    expect(result.system).toContain('fr')
  })

  it('defaults to en locale', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('Respond in en')
  })

  it('includes user prompt in user field', () => {
    const result = buildCompositionPrompt('a SaaS analytics platform')
    expect(result.user).toContain(
      'Build a website for: a SaaS analytics platform',
    )
    // User prompt now also includes design preference extraction instructions
    expect(result.user).toContain('DESIGN PREFERENCE EXTRACTION')
  })

  it('without genome, includes all 40 motifs', () => {
    const result = buildCompositionPrompt('test')
    // Without genome, all motifs are available
    expect(result.system).toContain('SplitHero')
    expect(result.system).toContain('DonationBand')
    expect(result.system).toContain('Navbar')
    expect(result.system).toContain('Footer')
  })

  it('with genome, only includes genome-available motifs', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    // Hero and structural motifs are always present
    expect(result.system).toContain(genome.hero)
    expect(result.system).toContain('Navbar')
    expect(result.system).toContain('Footer')
    // All available motifs should be in the prompt
    for (const motif of genome.availableMotifs) {
      expect(result.system).toContain(motif)
    }
  })

  it('with genome, excludes motifs not in the genome', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    // Find motifs that are NOT in the genome
    const allMotifs = [
      'SplitHero',
      'CenteredHero',
      'PosterHero',
      'ComingSoonHero',
      'CardGrid',
      'BentoGrid',
      'ImageGallery',
      'LogoStrip',
      'TestimonialRow',
      'PersonGrid',
      'PricingTable',
      'StatsStrip',
      'FeatureList',
      'GroupedList',
      'NumberedList',
      'SimpleList',
      'FaqAccordion',
      'Timeline',
      'CtaBand',
      'NewsletterCta',
      'ContactForm',
      'BookingForm',
      'Navbar',
      'Footer',
      'MediaSplit',
      'MapBlock',
      'ArticlePreview',
      'CategoryNav',
      'ComparisonTable',
      'StepProcess',
      'ValueProps',
      'QuoteBand',
      'LogosMarquee',
      'ContentTabs',
      'SearchBar',
      'EventSchedule',
      'ProductGrid',
      'TeamShowcase',
      'ProjectGallery',
      'DonationBand',
    ]
    const excluded = allMotifs.filter(
      (m) => !genome.availableMotifs.includes(m),
    )
    // At least some motifs should be excluded (we pick ~9-11 of 40)
    expect(excluded.length).toBeGreaterThan(20)
    // Excluded motifs should NOT appear in the motif list section
    // (they might appear in other parts of the prompt, so we check the
    // AVAILABLE MOTIFS section specifically)
    const motifSection = result.system.split('AVAILABLE MOTIFS')[1] ?? ''
    for (const motif of excluded) {
      // The motif signature line should not be present
      expect(motifSection).not.toContain(`${motif}:`)
    }
  })

  it('includes genome defaults in system prompt', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('STRUCTURAL GENOME')
    expect(result.system).toContain('@availableMotifs')
    expect(result.system).toContain('@chromes')
    expect(result.system).toContain('@rhythm')
    expect(result.system).toContain('@sectionCount')
    expect(result.system).toContain('@pageCount')
    // Hero is now a default, not a MUST constraint
    expect(result.system).toContain(`Default hero: ${genome.hero}`)
  })

  it('includes design axes from genome', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain(`radius:${genome.design.radius}`)
    expect(result.system).toContain(`shadow:${genome.design.shadow}`)
    expect(result.system).toContain(`gradient:${genome.design.gradient}`)
    expect(result.system).toContain(`density:${genome.design.density}`)
    expect(result.system).toContain(`typography:${genome.design.typography}`)
  })

  it('does NOT include old fixed-vertical guidance', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    // The old "DESIGN INTENT GUIDE" mapped verticals to design axes
    expect(result.system).not.toContain('DESIGN INTENT GUIDE')
    // The old "MOTIF SELECTION GUIDE" mapped verticals to motifs
    expect(result.system).not.toContain('MOTIF SELECTION GUIDE')
    // The old "CHROME RULES" mapped verticals to chromes
    expect(result.system).not.toContain('CHROME RULES')
    // No hardcoded vertical→design mapping
    expect(result.system).not.toContain('Tech/SaaS →')
    expect(result.system).not.toContain('Restaurant/Food →')
  })

  it('includes rhythm guide', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('RHYTHM')
    expect(result.system).toContain(genome.rhythm.toUpperCase())
  })

  it('different seeds produce different genomes', () => {
    const genome1 = generateGenome('session-A')
    const genome2 = generateGenome('session-B')
    // They should differ in at least some properties
    const differ =
      genome1.hero !== genome2.hero ||
      genome1.rhythm !== genome2.rhythm ||
      genome1.design.typography !== genome2.design.typography ||
      genome1.contentMotifs.join(',') !== genome2.contentMotifs.join(',')
    expect(differ).toBe(true)
  })

  it('same seed produces same genome (deterministic)', () => {
    const genome1 = generateGenome('session-X')
    const genome2 = generateGenome('session-X')
    expect(genome1).toEqual(genome2)
  })

  it('includes section count as a target, not a hard requirement', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain(`${genome.sectionCount} content sections`)
    // Should NOT say "EXACTLY" anymore — it's now a soft target
    expect(result.system).not.toContain('EXACTLY')
  })

  it('includes per-page content rules', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('PER-PAGE CONTENT RULES')
    expect(result.system).toContain('UNIQUE sections')
    expect(result.system).toContain('Do NOT reuse sections from the home page')
  })

  it('includes @page directive syntax instructions', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('@page')
    expect(result.system).toContain('MULTI-PAGE OUTPUT')
  })

  it('presents genome as defaults, not critical constraints', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('defaults')
    expect(result.system).toContain('DEFAULTS')
    // Should NOT say "CRITICAL — these are your structural constraints" anymore
    expect(result.system).not.toContain(
      'CRITICAL — these are your structural constraints',
    )
  })

  it('includes priority rule that user preferences override genome', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('PRIORITY RULE')
    expect(result.system).toContain('user')
    expect(result.system).toContain('override')
  })

  it('includes design axis override guide for mapping user language', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('DESIGN AXIS OVERRIDE GUIDE')
    expect(result.system).toContain('square buttons')
    expect(result.system).toContain('retro')
    expect(result.system).toContain('split hero')
  })

  it('user prompt includes design preference extraction instructions', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('dog blog with square buttons', {
      genome,
    })
    expect(result.user).toContain('dog blog with square buttons')
    expect(result.user).toContain('DESIGN PREFERENCE EXTRACTION')
    expect(result.user).toContain('override the corresponding genome default')
  })
})
