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
    expect(result.system).toContain('LANGUAGE: en')
  })

  it('includes user prompt in user field', () => {
    const result = buildCompositionPrompt('a SaaS analytics platform')
    expect(result.user).toContain(
      'Build a website for: a SaaS analytics platform',
    )
    expect(result.user).toContain('design preferences')
  })

  it('without genome, includes all 40 motifs', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('SplitHero')
    expect(result.system).toContain('DonationBand')
    expect(result.system).toContain('Navbar')
    expect(result.system).toContain('Footer')
  })

  it('with genome, only includes genome-available motifs', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain(genome.hero)
    expect(result.system).toContain('Navbar')
    expect(result.system).toContain('Footer')
    for (const motif of genome.availableMotifs) {
      expect(result.system).toContain(motif)
    }
  })

  it('with genome, excludes motifs not in the genome', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    const allMotifs = [
      'SplitHero', 'CenteredHero', 'PosterHero', 'ComingSoonHero',
      'CardGrid', 'BentoGrid', 'ImageGallery', 'LogoStrip',
      'TestimonialRow', 'PersonGrid', 'PricingTable', 'StatsStrip',
      'FeatureList', 'GroupedList', 'NumberedList', 'SimpleList',
      'FaqAccordion', 'Timeline', 'CtaBand', 'NewsletterCta',
      'ContactForm', 'BookingForm', 'Navbar', 'Footer',
      'MediaSplit', 'MapBlock', 'ArticlePreview', 'CategoryNav',
      'ComparisonTable', 'StepProcess', 'ValueProps', 'QuoteBand',
      'LogosMarquee', 'ContentTabs', 'SearchBar', 'EventSchedule',
      'ProductGrid', 'TeamShowcase', 'ProjectGallery', 'DonationBand',
    ]
    const excluded = allMotifs.filter(
      (m) => !genome.availableMotifs.includes(m),
    )
    expect(excluded.length).toBeGreaterThan(20)
    const motifSection = result.system.split('MOTIFS')[1] ?? ''
    for (const motif of excluded) {
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
    expect(result.system).toContain(`@hero ${genome.hero}`)
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
    expect(result.system).not.toContain('DESIGN INTENT GUIDE')
    expect(result.system).not.toContain('MOTIF SELECTION GUIDE')
    expect(result.system).not.toContain('CHROME RULES')
    expect(result.system).not.toContain('Tech/SaaS →')
    expect(result.system).not.toContain('Restaurant/Food →')
  })

  it('includes rhythm guide', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('@rhythm')
    expect(result.system).toContain(genome.rhythm)
  })

  it('different seeds produce different genomes', () => {
    const genome1 = generateGenome('session-A')
    const genome2 = generateGenome('session-B')
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

  it('includes section count guidance', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain(`${genome.sectionCount}`)
  })

  it('includes per-page uniqueness rules', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('UNIQUE sections')
    expect(result.system).toContain("Don't reuse motifs across pages")
  })

  it('includes @page directive syntax instructions', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('@page')
    expect(result.system).toContain('NO @page home')
  })

  it('presents genome as defaults, not critical constraints', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('defaults')
  })

  it('includes user preference override instruction', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('test', { genome })
    expect(result.system).toContain('override')
  })

  it('includes separator examples', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('EXAMPLES')
    expect(result.system).toContain('cards>')
    expect(result.system).toContain('tiers>')
    expect(result.system).toContain('testimonials>')
  })

  it('includes chrome guide', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('hairline')
    expect(result.system).toContain('brutalist')
    expect(result.system).toContain('terminal')
    expect(result.system).toContain('editorial')
  })

  it('includes content quality rules', () => {
    const result = buildCompositionPrompt('test')
    expect(result.system).toContain('imageAlt')
    expect(result.system).toContain('English')
  })

  it('user prompt includes design preference extraction', () => {
    const genome = generateGenome('test-session-1')
    const result = buildCompositionPrompt('dog blog with square buttons', {
      genome,
    })
    expect(result.user).toContain('dog blog with square buttons')
    expect(result.user).toContain('design preferences')
  })
})
