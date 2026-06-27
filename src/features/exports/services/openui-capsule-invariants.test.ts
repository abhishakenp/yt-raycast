import { describe, expect, it } from 'vitest'

import { isExportableComponentFactory } from './openui-export-builder'
import { isExportableFactory } from './openui-lakebed-export-builder'

describe('OpenUI export capsule invariants', () => {
  it('only treats defineCapsule as the registry component factory', () => {
    expect(typeof isExportableComponentFactory).toBe('function')
    expect(typeof isExportableFactory).toBe('function')

    expect(isExportableComponentFactory('defineCapsule')).toBe(true)
    expect(isExportableFactory('defineCapsule')).toBe(true)
  })

  it('rejects non-defineCapsule expressions', () => {
    expect(isExportableComponentFactory('defineComponent')).toBe(false)
    expect(isExportableComponentFactory('defineBlock')).toBe(false)
    expect(isExportableComponentFactory('')).toBe(false)

    expect(isExportableFactory('defineComponent')).toBe(false)
    expect(isExportableFactory('defineBlock')).toBe(false)
    expect(isExportableFactory('')).toBe(false)
  })
})
