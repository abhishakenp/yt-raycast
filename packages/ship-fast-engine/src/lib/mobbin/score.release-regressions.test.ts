import { describe, expect, it } from 'vitest'

import {
  anchorAvoidsAurora,
  anchorAvoidsSaasMarketing,
  detectVerbatimAnchorCopy,
  relaxAuroraAuditForAnchor,
  scoreMobbinCoverage,
} from './score'

const anchor = {
  app: 'Reference Product',
  category: 'Software',
  palette: ['#101010', '#5e6ad2', '#ffffff', '#5E6AD2', 'invalid'],
  dna: {
    display: 'Precise Grotesk',
    layout: 'Dense product-led bento composition',
    accents: ['#000000'],
  },
  copyExamples: null,
}

describe('Mobbin coverage scoring', () => {
  it('returns empty coverage for empty output', () => {
    expect(scoreMobbinCoverage('', anchor)).toEqual({
      palette: { hits: 0, total: 0, ratio: 0, hexHits: [] },
      doctrine: { hits: 0, total: 0, ratio: 0 },
    })
  })

  it('uses the explicit anchor palette, validates colors, and deduplicates exact values', () => {
    const result = scoreMobbinCoverage(
      '<main style="color:#5E6AD2;background:#101010">Precise Grotesk dense product-led</main>',
      anchor,
    )

    expect(result.palette.total).toBe(4)
    expect(result.palette.hits).toBe(3)
    expect(result.palette.ratio).toBe(0.75)
    expect(result.palette.hexHits).toEqual(['#101010', '#5e6ad2', '#5E6AD2'])
    expect(result.doctrine.hits).toBeGreaterThan(0)
    expect(result.doctrine.ratio).toBeGreaterThan(0)
  })

  it('falls back to DNA accents when no explicit palette exists', () => {
    const result = scoreMobbinCoverage('<style>#112233</style>', {
      ...anchor,
      palette: null,
      dna: { accents: ['#112233', '#abcdef'] },
    })

    expect(result.palette).toEqual({
      hits: 1,
      total: 2,
      ratio: 0.5,
      hexHits: ['#112233'],
    })
  })

  it('reports zero ratios when an anchor has no scoreable DNA', () => {
    const result = scoreMobbinCoverage('<main>Rendered output</main>', {
      app: 'Bare',
      category: null,
      palette: null,
      dna: null,
      copyExamples: null,
    })

    expect(result.palette.ratio).toBe(0)
    expect(result.doctrine.ratio).toBe(0)
    expect(result.palette.total).toBe(0)
    expect(result.doctrine.total).toBe(0)
  })

  it('matches palette colors and DNA markers without case sensitivity', () => {
    const result = scoreMobbinCoverage(
      '<style>:root{--brand:#ABCDEF}</style><main>EDITORIAL SERIF ASYMMETRIC LAYOUT</main>',
      {
        ...anchor,
        palette: ['#abcdef'],
        dna: {
          display: 'Editorial Serif',
          layout: 'Asymmetric layout',
        },
      },
    )

    expect(result.palette.ratio).toBe(1)
    expect(result.doctrine.ratio).toBe(1)
  })
})

describe('Mobbin audit relaxation', () => {
  it('detects aurora rejection language only from an explicit avoid list', () => {
    expect(anchorAvoidsAurora(null)).toBe(false)
    expect(anchorAvoidsAurora({})).toBe(false)
    expect(
      anchorAvoidsAurora({ avoid: ['Use one accent, no gradient blob'] }),
    ).toBe(true)
    expect(anchorAvoidsAurora({ avoid: ['MULTI-COLOR aurora effects'] })).toBe(
      true,
    )
  })

  it('detects anchors that reject generic SaaS marketing structure', () => {
    expect(anchorAvoidsSaasMarketing(null)).toBe(false)
    expect(
      anchorAvoidsSaasMarketing({ avoid: ['No feature grid or trust strip'] }),
    ).toBe(true)
    expect(anchorAvoidsSaasMarketing({ avoid: ['No generic cards'] })).toBe(
      false,
    )
  })

  it('leaves passing, ineligible, and feedback-free audits unchanged', () => {
    const passing = { ok: true, feedback: '' }
    const failing = { ok: false, feedback: 'Quality audit: add aurora blobs' }
    const empty = { ok: false, feedback: '' }

    expect(relaxAuroraAuditForAnchor(passing, true)).toBe(passing)
    expect(relaxAuroraAuditForAnchor(failing, false)).toBe(failing)
    expect(relaxAuroraAuditForAnchor(empty, true)).toBe(empty)
  })

  it('converts an aurora-only failure to a passing audit for anti-aurora DNA', () => {
    const result = relaxAuroraAuditForAnchor(
      {
        ok: false,
        feedback:
          'Quality audit: add violet blobs; combine amber and cyan aurora; increase gradient glow',
      },
      { avoid: ['No multi-colour aurora'] },
    )

    expect(result).toEqual({
      ok: true,
      feedback: '',
      auroraRelaxed: true,
      originalFeedback:
        'Quality audit: add violet blobs; combine amber and cyan aurora; increase gradient glow',
    })
  })

  it('preserves structural and contrast failures while removing visual scaffolding', () => {
    const result = relaxAuroraAuditForAnchor(
      {
        ok: false,
        feedback:
          'Quality audit: add aurora glow; missing data-reveal hooks; text-slate-500 contrast is too weak',
      },
      true,
    )

    expect(result.ok).toBe(false)
    expect(result.auroraRelaxed).toBe(false)
    expect(result.feedback).toContain('missing data-reveal hooks')
    expect(result.feedback).toContain('contrast is too weak')
    expect(result.feedback).not.toContain('add aurora glow')
  })

  it('supports non-prefixed audit feedback without inventing a prefix', () => {
    const result = relaxAuroraAuditForAnchor(
      { ok: false, feedback: 'missing data-magnet; add gradient blobs' },
      true,
    )

    expect(result.feedback).toBe('missing data-magnet')
  })
})

describe('verbatim anchor-copy detection', () => {
  it('returns no matches for empty or original copy', () => {
    expect(detectVerbatimAnchorCopy('')).toEqual({ count: 0, matches: [] })
    expect(
      detectVerbatimAnchorCopy(
        '<h1>Plan the next release with evidence from your own workflow</h1>',
      ),
    ).toEqual({ count: 0, matches: [] })
  })

  it('finds known headlines and long sub-headlines case-insensitively', () => {
    const result = detectVerbatimAnchorCopy(`
      <h1>THE BEST TOOL FOR SOFTWARE TEAMS</h1>
      <p>Meet the system for modern software development.</p>
    `)

    expect(result.matches).toEqual(
      expect.arrayContaining([
        {
          app: 'Linear',
          location: 'headline',
          verbatim: 'The best tool for software teams',
        },
        {
          app: 'Linear',
          location: 'sub',
          verbatim: 'Meet the system for modern software development.',
        },
      ]),
    )
  })

  it('flags clusters of three proprietary product nouns but not two', () => {
    const two = detectVerbatimAnchorCopy('<p>Cycles and Triage</p>')
    const three = detectVerbatimAnchorCopy(
      '<p>Cycles, Triage, and Initiatives</p>',
    )

    expect(two.matches).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: 'product-noun-cluster' }),
      ]),
    )
    expect(three.matches).toEqual(
      expect.arrayContaining([
        {
          app: 'Linear',
          location: 'product-noun-cluster',
          verbatim: 'Cycles + Triage + Initiatives',
        },
      ]),
    )
  })

  it('does not report short two-word headline fragments', () => {
    const result = detectVerbatimAnchorCopy('<h1>Accept payments</h1>')

    expect(result.count).toBe(0)
  })
})
