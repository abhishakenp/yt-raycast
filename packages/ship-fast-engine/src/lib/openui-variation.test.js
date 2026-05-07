import { describe, expect, it } from 'vitest'
import { buildOpenUIVariationBlock } from './openui-variation.js'

describe('buildOpenUIVariationBlock', () => {
  const prompt = 'Build a healthcare patient portal with appointments and records.'

  it('is stable for the same seed and prompt', () => {
    const a = buildOpenUIVariationBlock('sess-1', prompt)
    const b = buildOpenUIVariationBlock('sess-1', prompt)
    expect(a).toBe(b)
  })

  it('differs across seeds for the same prompt (diversity)', () => {
    const blocks = new Set()
    for (let i = 0; i < 24; i++) {
      blocks.add(buildOpenUIVariationBlock(`seed-${i}`, prompt))
    }
    expect(blocks.size).toBeGreaterThan(1)
  })

  it('includes persona and hero hints', () => {
    const block = buildOpenUIVariationBlock('abc', prompt)
    expect(block).toContain('visualPersona:')
    expect(block).toContain('preferredHeroFamily:')
    expect(block).toContain('sectionOrderHint:')
    expect(block).toContain('variationFingerprint:')
    expect(block).toContain('compositionHint:')
    expect(block).toContain('dashboardShellChrome:')
  })
})
