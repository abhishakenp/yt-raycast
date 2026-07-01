import { runAll, runAllV2, runAllV3 } from '@ship-fast/engine'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSelectedEngine } from './engine-selector'

describe('engine selector', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('selects the original engine for v1 sessions', () => {
    expect(getSelectedEngine('v1')).toBe(runAll)
  })

  it('selects the v2 engine for v2 sessions', () => {
    expect(getSelectedEngine('v2')).toBe(runAllV2)
  })

  it('selects the v3 engine for v3 sessions', () => {
    expect(getSelectedEngine('v3')).toBe(runAllV3)
  })

  it('uses SHIP_FAST_ENGINE as the module-level default when no session version overrides it', async () => {
    vi.stubEnv('SHIP_FAST_ENGINE', 'v2')
    vi.resetModules()

    const engine = await import('@ship-fast/engine')
    const module = await import('./engine-selector')

    expect(module.engineVersion).toBe('v2')
    expect(module.selectedEngine).toBe(engine.runAllV2)
    expect(module.getSelectedEngine('v1')).toBe(engine.runAllV2)
  })
})
