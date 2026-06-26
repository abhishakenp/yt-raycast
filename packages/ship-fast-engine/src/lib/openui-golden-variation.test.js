import { describe, expect, it } from 'vitest'
import { buildOpenUIVariationBlock } from './openui-variation.js'

describe('golden variation spread (same prompt, many seeds)', () => {
  it('achieves high unique block ratio for a fixed brief', () => {
    const prompt =
      'E-commerce site for sustainable home goods with cart and PLP.'
    const n = 48
    const set = new Set()
    for (let i = 0; i < n; i++) {
      set.add(buildOpenUIVariationBlock(`eval-${i}`, prompt))
    }
    expect(set.size / n).toBeGreaterThan(0.85)
  })
})
