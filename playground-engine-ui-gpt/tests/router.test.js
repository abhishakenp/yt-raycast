import { describe, expect, it } from 'vitest'
import { buildRunVariety, inferSiteHint, selectAnchorPair } from '../src/router.js'

describe('design router', () => {
  const brief = 'Homepage for a fleet operations console with live maps, robot battery status, incident queues, and teleoperation controls.'

  it('classifies operational tools as ops-console hints', () => {
    expect(inferSiteHint(brief)).toBe('ops-console')
  })

  it('is deterministic for the same seed', () => {
    const a = selectAnchorPair(brief, { seed: 'same-seed' })
    const b = selectAnchorPair(brief, { seed: 'same-seed' })
    expect(a.primary.app).toBe(b.primary.app)
    expect(a.secondary.app).toBe(b.secondary.app)
  })

  it('varies anchors or variety axes for the same brief across seeds', () => {
    const seen = new Set()
    for (let i = 0; i < 16; i++) {
      const route = selectAnchorPair(brief, { seed: `seed-${i}` })
      const variety = buildRunVariety(brief, `seed-${i}`)
      seen.add(`${route.primary.app}/${route.secondary.app}/${variety.layoutGrammar}/${variety.ground}`)
    }
    expect(seen.size).toBeGreaterThan(4)
  })

  it('varies primary software anchors for the same product brief across seeds', () => {
    const software = 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time.'
    const primaries = new Set()
    for (let i = 0; i < 12; i++) {
      primaries.add(selectAnchorPair(software, { seed: `software-${i}` }).primary.app)
    }
    expect(primaries.size).toBeGreaterThan(1)
  })

  it('keeps high-touch hotel briefs away from accidental dev-tool anchors', () => {
    const hotel = 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, spa, fire pits, hiking trails.'
    const route = selectAnchorPair(hotel, { seed: 'hotel-regression' })
    expect(route.siteHint).toBe('local-experience')
    expect(['GitHub', 'Cursor', 'Sentry', 'Hopper']).not.toContain(route.primary.app)
  })
})
