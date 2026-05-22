import { describe, expect, it } from 'vitest'
import { compareSignatures, varietyDistance } from '../src/quality/variety-metrics.js'

describe('variety-metrics', () => {
  it('detects different palettes as distinct', () => {
    const a = { palette: ['#111', '#222'], fonts: ['A', 'B'], tokenSample: ['grid-cols-3', 'rounded-xl'], grammarId: 'a', anchor: 'Linear', treatment: 'grain', contentStrategy: 'proof', pageKind: 'vertical-doc', fingerprint: '1' }
    const b = { palette: ['#fff', '#eee'], fonts: ['C', 'D'], tokenSample: ['grid-cols-4', 'rounded-2xl'], grammarId: 'b', anchor: 'Stripe', treatment: 'duotone', contentStrategy: 'story', pageKind: 'vertical-doc', fingerprint: '2' }
    const c = compareSignatures(a, b)
    expect(c.ok).toBe(true)
    expect(c.diffs.length).toBeGreaterThanOrEqual(3)
  })

  it('flags identical fingerprints as low variety', () => {
    const sig = { palette: ['#1'], fonts: ['A'], tokenSample: ['x'], grammarId: 'g', anchor: 'X', treatment: 't', contentStrategy: 's', pageKind: 'vertical-doc', fingerprint: 'same' }
    const v = varietyDistance([sig, { ...sig }])
    expect(v.varietyOk).toBe(false)
  })
})
