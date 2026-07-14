import { describe, expect, it } from 'vitest'

import {
  buildSectionSeedPatch,
  mergeSectionProps,
} from './section-realtime.tsx'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function recordWithPrototypeKey(heading: string) {
  const record: Record<string, unknown> = { heading }
  Object.defineProperty(record, '__proto__', {
    enumerable: true,
    value: { polluted: true },
  })
  return record
}

describe('Lakebed realtime section data integrity', () => {
  it('does not allow generated JSON keys to replace the seed snapshot prototype', () => {
    const generated = recordWithPrototypeKey('Launch')

    const patch = buildSectionSeedPatch(generated, {})
    const snapshot = patch.shipFastGeneratedProps

    expect(isRecord(snapshot)).toBe(true)
    expect(Object.getPrototypeOf(snapshot)).toBe(Object.prototype)
    expect(snapshot).not.toHaveProperty('polluted')
  })

  it('does not allow live synchronized JSON keys to replace merged-props prototype', () => {
    const live = recordWithPrototypeKey('Edited')

    const merged = mergeSectionProps({ heading: 'Generated' }, live)

    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)
    expect(merged).toEqual({ heading: 'Edited' })
    expect('polluted' in merged).toBe(false)
  })

  it('continues to merge ordinary synchronized edits over generated props', () => {
    const merged = mergeSectionProps(
      { heading: 'Generated', subheading: 'Stable' },
      {
        heading: 'Edited',
        shipFastGeneratedProps: {
          heading: 'Generated',
          subheading: 'Stable',
        },
      },
    )

    expect(merged).toEqual({ heading: 'Edited', subheading: 'Stable' })
  })
})
