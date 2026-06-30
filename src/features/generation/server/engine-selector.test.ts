import { runAll, runAllV2, runAllV3 } from '@ship-fast/engine'
import { describe, expect, it } from 'vitest'

import { getSelectedEngine } from './engine-selector'

describe('engine selector', () => {
  it('selects the original engine for v1 sessions', () => {
    expect(getSelectedEngine('v1')).toBe(runAll)
  })

  it('selects the v2 engine for v2 sessions', () => {
    expect(getSelectedEngine('v2')).toBe(runAllV2)
  })

  it('selects the v3 engine for v3 sessions', () => {
    expect(getSelectedEngine('v3')).toBe(runAllV3)
  })
})
