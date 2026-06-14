import { runAll, runAllV2 } from '@ship-fast/engine'
import { describe, expect, it } from 'vitest'

import { getSelectedEngine } from './engine-selector'

describe('engine selector', () => {
  it('selects the original engine for v1 sessions', () => {
    expect(getSelectedEngine('v1')).toBe(runAll)
  })

  it('selects the v2 engine for v2 sessions', () => {
    expect(getSelectedEngine('v2')).toBe(runAllV2)
  })
})
