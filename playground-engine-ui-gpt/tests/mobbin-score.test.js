import { describe, expect, it } from 'vitest'
import { resolveAnchor } from '../src/dna.js'
import { auditMobbinCoverage, detectVerbatimAnchorCopy, scoreMobbinCoverage } from '../src/mobbin-score.js'

describe('offline Mobbin audit', () => {
  it('detects verbatim anchor copy', () => {
    const result = detectVerbatimAnchorCopy('<h1>Move work forward</h1><p>Streamline issues, projects, and product roadmaps.</p>')
    expect(result.count).toBeGreaterThan(0)
    expect(result.matches.some((match) => match.app === 'Linear')).toBe(true)
  })

  it('scores palette inheritance for a resolved anchor', () => {
    const anchor = resolveAnchor({ app: 'Linear' })
    const score = scoreMobbinCoverage('<div class="bg-[#5e6ad2] text-[#1c1d24]">Linear-style product surface</div>', anchor)
    expect(score.palette.hits).toBeGreaterThan(0)
    expect(score.palette.total).toBeGreaterThan(0)
  })

  it('warns when anchor copy is borrowed verbatim', () => {
    const anchor = resolveAnchor({ app: 'Stripe' })
    const audit = auditMobbinCoverage('<h1>Accept payments online</h1><div class="bg-[#635bff]">Connect Atlas Radar</div>', anchor)
    expect(audit.ok).toBe(false)
    expect(audit.warnings.join(' ')).toContain('verbatim')
  })

  it('allows brief-adapted hotel palettes while keeping the warning visible', () => {
    const anchor = resolveAnchor({ app: 'Airbnb' })
    const audit = auditMobbinCoverage('<div class="bg-[#f6f1e9] text-[#17211f] border-[#0f766e]">Coastal room</div>', anchor, {
      route: { siteHint: 'local-experience' },
      plan: { visualWorld: { bg: '#f6f1e9', surface: '#ffffff', text: '#17211f', accent: '#0f766e', accent2: '#b45309' } },
    })
    expect(audit.ok).toBe(true)
    expect(audit.warnings.join(' ')).toContain('adapted')
  })

  it('allows brief-adapted Figma portfolio palettes while keeping the warning visible', () => {
    const anchor = resolveAnchor({ app: 'Figma' })
    const audit = auditMobbinCoverage('<div class="bg-[#f6f1e9] text-[#1f2937] border-[#6d28d9]">Case study</div>', anchor, {
      route: { siteHint: 'portfolio' },
      plan: { visualWorld: { bg: '#f6f1e9', surface: '#ffffff', text: '#1f2937', accent: '#6d28d9', accent2: '#0f766e' } },
    })
    expect(audit.ok).toBe(true)
    expect(audit.warnings.join(' ')).toContain('adapted')
  })
})
