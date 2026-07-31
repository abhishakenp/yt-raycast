import { describe, expect, it } from 'vitest'
import { generateGenome, type StructuralGenome } from './genome.ts'

describe('generateGenome', () => {
  it('produces a valid genome with all required fields', () => {
    const genome = generateGenome('test-session')
    expect(genome.hero).toBeTruthy()
    expect(genome.contentMotifs.length).toBeGreaterThanOrEqual(6)
    expect(genome.contentMotifs.length).toBeLessThanOrEqual(8)
    expect(genome.availableMotifs.length).toBeGreaterThan(8)
    expect(genome.chromes.length).toBeGreaterThanOrEqual(2)
    expect(genome.chromes.length).toBeLessThanOrEqual(3)
    expect(genome.design.radius).toBeTruthy()
    expect(genome.design.shadow).toBeTruthy()
    expect(genome.design.gradient).toBeTruthy()
    expect(genome.design.density).toBeTruthy()
    expect(genome.design.typography).toBeTruthy()
    expect(genome.rhythm).toBeTruthy()
    expect(genome.sectionCount).toBeGreaterThanOrEqual(5)
    expect(genome.sectionCount).toBeLessThanOrEqual(9)
    expect(genome.pageCount).toBeGreaterThanOrEqual(1)
    expect(genome.pageCount).toBeLessThanOrEqual(6)
  })

  it('always includes Navbar and Footer in availableMotifs', () => {
    const genome = generateGenome('test-session')
    expect(genome.availableMotifs).toContain('Navbar')
    expect(genome.availableMotifs).toContain('Footer')
  })

  it('includes the hero in availableMotifs', () => {
    const genome = generateGenome('test-session')
    expect(genome.availableMotifs).toContain(genome.hero)
  })

  it('hero is one of the 4 hero motifs', () => {
    const heroes = ['SplitHero', 'CenteredHero', 'PosterHero', 'ComingSoonHero']
    for (let i = 0; i < 20; i++) {
      const genome = generateGenome(`session-${i}`)
      expect(heroes).toContain(genome.hero)
    }
  })

  it('chromes are from the valid set', () => {
    const validChromes = [
      'hairline',
      'brutalist',
      'terminal',
      'editorial',
      'gradient',
      'none',
    ]
    const genome = generateGenome('test-session')
    for (const chrome of genome.chromes) {
      expect(validChromes).toContain(chrome)
    }
  })

  it('design axes are from valid sets', () => {
    const genome = generateGenome('test-session')
    // radius/shadow are now Tailwind classes
    expect([
      'rounded-none',
      'rounded-lg',
      'rounded-xl',
      'rounded-full',
    ]).toContain(genome.design.radius)
    expect([
      'shadow-none',
      'shadow-sm',
      'shadow-[4px_4px_0_0]',
      'shadow-[8px_8px_0_0]',
    ]).toContain(genome.design.shadow)
    // gradient/density/typography are still named concepts
    expect(['none', 'subtle', 'vibrant']).toContain(genome.design.gradient)
    expect(['compact', 'balanced', 'airy']).toContain(genome.design.density)
    expect(['editorial', 'technical', 'display', 'humanist']).toContain(
      genome.design.typography,
    )
  })

  it('rhythm is from valid set', () => {
    const rhythms = ['dense', 'airy', 'alternating', 'cinematic']
    const genome = generateGenome('test-session')
    expect(rhythms).toContain(genome.rhythm)
  })

  it('content motifs are from the content motif set (not structural)', () => {
    const structuralMotifs = [
      'Navbar',
      'Footer',
      'SplitHero',
      'CenteredHero',
      'PosterHero',
      'ComingSoonHero',
    ]
    const genome = generateGenome('test-session')
    for (const motif of genome.contentMotifs) {
      expect(structuralMotifs).not.toContain(motif)
    }
  })

  it('is deterministic — same seed produces same genome', () => {
    const g1 = generateGenome('deterministic-test')
    const g2 = generateGenome('deterministic-test')
    expect(g1).toEqual(g2)
  })

  it('different seeds produce different genomes (high probability)', () => {
    const genomes: StructuralGenome[] = []
    for (let i = 0; i < 10; i++) {
      genomes.push(generateGenome(`diversity-test-${i}`))
    }
    // All heroes should not be the same
    const uniqueHeroes = new Set(genomes.map((g) => g.hero))
    expect(uniqueHeroes.size).toBeGreaterThan(1)
    // All content motif sets should not be identical
    const uniqueMotifSets = new Set(
      genomes.map((g) => g.contentMotifs.sort().join(',')),
    )
    expect(uniqueMotifSets.size).toBeGreaterThan(5)
    // All design axis combos should not be identical
    const uniqueDesigns = new Set(
      genomes.map(
        (g) => `${g.design.radius}-${g.design.shadow}-${g.design.typography}`,
      ),
    )
    expect(uniqueDesigns.size).toBeGreaterThan(3)
  })

  it('availableMotifs has no duplicates', () => {
    const genome = generateGenome('test-session')
    const unique = new Set(genome.availableMotifs)
    expect(unique.size).toBe(genome.availableMotifs.length)
  })

  it('chromes has no duplicates', () => {
    const genome = generateGenome('test-session')
    const unique = new Set(genome.chromes)
    expect(unique.size).toBe(genome.chromes.length)
  })

  it('produces high entropy across many sessions', () => {
    // Generate 100 genomes and measure unique combinations
    const combinations = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const g = generateGenome(`entropy-test-${i}`)
      combinations.add(
        `${g.hero}|${g.contentMotifs.sort().join(',')}|${g.chromes.sort().join(',')}|${g.design.typography}|${g.rhythm}`,
      )
    }
    // With 56 bits of entropy, we expect ~100 unique combinations out of 100
    expect(combinations.size).toBe(100)
  })
})
