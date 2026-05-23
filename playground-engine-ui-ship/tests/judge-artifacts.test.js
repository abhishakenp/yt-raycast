import { describe, expect, it } from 'vitest'
import { judgeMeetsTarget } from '../scripts/lib/judge-artifacts.mjs'

describe('judgeMeetsTarget', () => {
  it('requires both a passing Kimi verdict and the target score', () => {
    expect(judgeMeetsTarget({ pass: true, score: 90 }, 90)).toBe(true)
    expect(judgeMeetsTarget({ pass: false, score: 95 }, 90)).toBe(false)
    expect(judgeMeetsTarget({ pass: true, score: 89 }, 90)).toBe(false)
  })
})
