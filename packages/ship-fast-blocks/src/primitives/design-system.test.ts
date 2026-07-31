import { describe, it, expect } from 'vitest'
import {
  parseDesignLine,
  parseDesignOverride,
  mergeDesign,
  serializeDesignIntent,
  designValueToCss,
  isNamedPreset,
  DEFAULT_DESIGN,
  GRADIENT_PRESETS,
  DENSITY_PRESETS,
  TYPOGRAPHY_PRESETS,
  MOTION_PRESETS,
  type DesignIntent,
} from './design-system.ts'

describe('parseDesignLine — Tailwind axes', () => {
  it('parses bare rounded-xl as radius', () => {
    const intent = parseDesignLine('@design rounded-xl')
    expect(intent.radius).toBe('rounded-xl')
  })

  it('parses bare shadow-lg as shadow', () => {
    const intent = parseDesignLine('@design shadow-lg')
    expect(intent.shadow).toBe('shadow-lg')
  })

  it('parses bare tracking-wide as tracking', () => {
    const intent = parseDesignLine('@design tracking-wide')
    expect(intent.tracking).toBe('tracking-wide')
  })

  it('parses bare font-black as weight', () => {
    const intent = parseDesignLine('@design font-black')
    expect(intent.weight).toBe('font-black')
  })

  it('parses bare uppercase as transform', () => {
    const intent = parseDesignLine('@design uppercase')
    expect(intent.transform).toBe('uppercase')
  })

  it('parses bare border-2 as border', () => {
    const intent = parseDesignLine('@design border-2')
    expect(intent.border).toBe('border-2')
  })

  it('parses arbitrary rounded-[13px] as radius', () => {
    const intent = parseDesignLine('@design rounded-[13px]')
    expect(intent.radius).toBe('rounded-[13px]')
  })

  it('parses arbitrary shadow-[4px_4px_0_0] as shadow', () => {
    const intent = parseDesignLine('@design shadow-[4px_4px_0_0]')
    expect(intent.shadow).toBe('shadow-[4px_4px_0_0]')
  })

  it('parses radius:rounded-xl via axis:key syntax', () => {
    const intent = parseDesignLine('@design radius:rounded-xl')
    expect(intent.radius).toBe('rounded-xl')
  })

  it('parses shadow:shadow-lg via axis:key syntax', () => {
    const intent = parseDesignLine('@design shadow:shadow-lg')
    expect(intent.shadow).toBe('shadow-lg')
  })
})

describe('parseDesignLine — named-concept axes', () => {
  it('parses named presets', () => {
    const intent = parseDesignLine(
      '@design gradient:vibrant density:airy typography:display motion:lively',
    )
    expect(intent.gradient).toBe('vibrant')
    expect(intent.density).toBe('airy')
    expect(intent.typography).toBe('display')
    expect(intent.motion).toBe('lively')
  })

  it('uses defaults for unspecified axes', () => {
    const intent = parseDesignLine('@design rounded-xl')
    expect(intent.radius).toBe('rounded-xl')
    expect(intent.shadow).toBe(DEFAULT_DESIGN.shadow)
    expect(intent.gradient).toBe(DEFAULT_DESIGN.gradient)
  })

  it('ignores unknown keys', () => {
    const intent = parseDesignLine('@design rounded-xl foo:bar')
    expect(intent.radius).toBe('rounded-xl')
  })

  it('accepts singular and plural keys (gradient/gradients)', () => {
    const a = parseDesignLine('@design gradient:vibrant')
    const b = parseDesignLine('@design gradients:vibrant')
    expect(a.gradient).toBe('vibrant')
    expect(b.gradient).toBe('vibrant')
  })

  it('accepts shadow and shadows', () => {
    const a = parseDesignLine('@design shadow:shadow-lg')
    const b = parseDesignLine('@design shadows:shadow-lg')
    expect(a.shadow).toBe('shadow-lg')
    expect(b.shadow).toBe('shadow-lg')
  })

  it('accepts type as alias for typography', () => {
    const intent = parseDesignLine('@design type:technical')
    expect(intent.typography).toBe('technical')
  })

  it('returns defaults for empty line', () => {
    const intent = parseDesignLine('@design')
    expect(intent).toEqual(DEFAULT_DESIGN)
  })

  it('is case-insensitive on keys and values', () => {
    const intent = parseDesignLine('@design DENSITY:AIRY')
    expect(intent.density).toBe('airy')
  })
})

describe('parseDesignLine — mixed Tailwind + named', () => {
  it('parses mixed Tailwind + named presets', () => {
    const intent = parseDesignLine(
      '@design rounded-xl shadow-lg density:airy typography:display',
    )
    expect(intent.radius).toBe('rounded-xl')
    expect(intent.shadow).toBe('shadow-lg')
    expect(intent.density).toBe('airy')
    expect(intent.typography).toBe('display')
  })
})

describe('parseDesignLine — per-role overrides', () => {
  it('parses btn:rounded-full as per-role radius override', () => {
    const intent = parseDesignLine('@design btn:rounded-full')
    expect(intent.roles?.radius?.btn).toBe('rounded-full')
  })

  it('parses card:rounded-2xl as per-role radius override', () => {
    const intent = parseDesignLine('@design card:rounded-2xl')
    expect(intent.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('parses mixed global + per-role', () => {
    const intent = parseDesignLine(
      '@design rounded-xl btn:rounded-full shadow-lg',
    )
    expect(intent.radius).toBe('rounded-xl')
    expect(intent.shadow).toBe('shadow-lg')
    expect(intent.roles?.radius?.btn).toBe('rounded-full')
  })
})

describe('parseDesignLine — aliases', () => {
  it('maps motion:gentle to subtle via alias', () => {
    expect(parseDesignLine('@design motion:gentle').motion).toBe('subtle')
  })

  it('maps motion:kinetic to lively via alias', () => {
    expect(parseDesignLine('@design motion:kinetic').motion).toBe('lively')
  })

  it('maps motion:static to none via alias', () => {
    expect(parseDesignLine('@design motion:static').motion).toBe('none')
  })

  it('preserves valid motion values without alias', () => {
    expect(parseDesignLine('@design motion:none').motion).toBe('none')
    expect(parseDesignLine('@design motion:subtle').motion).toBe('subtle')
    expect(parseDesignLine('@design motion:lively').motion).toBe('lively')
  })
})

describe('parseDesignLine — edge cases', () => {
  it('handles double-colon radius::rounded-xl', () => {
    expect(parseDesignLine('@design radius::rounded-xl').radius).toBe(
      'rounded-xl',
    )
  })

  it('handles double-colon on multiple axes', () => {
    const d = parseDesignLine('@design ::rounded-xl ::shadow-lg')
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-lg')
  })

  it('accepts unknown values as-is (Tailwind classes or arbitrary)', () => {
    const d = parseDesignLine('@design radius:banana shadow:nothing')
    expect(d.radius).toBe('banana')
    expect(d.shadow).toBe('nothing')
  })
})

describe('parseDesignOverride', () => {
  it('returns only explicitly set axes', () => {
    const override = parseDesignOverride('@design rounded-xl')
    expect(override.radius).toBe('rounded-xl')
    expect(override.shadow).toBeUndefined()
  })

  it('returns empty object for empty line', () => {
    expect(parseDesignOverride('@design')).toEqual({})
  })

  it('parses per-role overrides', () => {
    const override = parseDesignOverride('@design btn:rounded-full')
    expect(override.roles?.radius?.btn).toBe('rounded-full')
  })
})

describe('mergeDesign', () => {
  it('merges override onto parent', () => {
    const parent = DEFAULT_DESIGN
    const merged = mergeDesign(parent, { radius: 'rounded-xl' })
    expect(merged.radius).toBe('rounded-xl')
    expect(merged.shadow).toBe(parent.shadow)
  })

  it('deep merges per-role overrides', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: { radius: { btn: 'rounded-full' } },
    }
    const merged = mergeDesign(parent, {
      roles: { radius: { card: 'rounded-2xl' } },
    })
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
    expect(merged.roles?.radius?.card).toBe('rounded-2xl')
  })
})

describe('serializeDesignIntent', () => {
  it('round-trips through parse → serialize → parse', () => {
    const original: DesignIntent = {
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }
    const serialized = serializeDesignIntent(original)
    const reparsed = parseDesignLine(serialized)
    expect(reparsed).toEqual(original)
  })
})

describe('designValueToCss', () => {
  it('converts arbitrary bracket values', () => {
    expect(designValueToCss('[13px]')).toBe('13px')
  })

  it('converts Tailwind classes', () => {
    expect(designValueToCss('rounded-xl')).toBe('0.75rem')
    expect(designValueToCss('font-black')).toBe('900')
    expect(designValueToCss('tracking-wide')).toBe('0.025em')
  })

  it('returns null for named-concept presets', () => {
    expect(designValueToCss('airy')).toBeNull()
    expect(designValueToCss('vibrant')).toBeNull()
  })

  it('passes through raw CSS values', () => {
    expect(designValueToCss('0.75rem')).toBe('0.75rem')
  })
})

describe('isNamedPreset', () => {
  it('returns true for named-concept presets', () => {
    expect(isNamedPreset('density', 'airy')).toBe(true)
    expect(isNamedPreset('typography', 'display')).toBe(true)
    expect(isNamedPreset('gradient', 'vibrant')).toBe(true)
    expect(isNamedPreset('motion', 'lively')).toBe(true)
  })

  it('returns false for Tailwind axes (no presets)', () => {
    expect(isNamedPreset('radius', 'rounded-xl')).toBe(false)
    expect(isNamedPreset('shadow', 'shadow-lg')).toBe(false)
  })
})

describe('preset completeness', () => {
  it('all gradient presets are valid', () => {
    for (const v of GRADIENT_PRESETS) {
      const intent = parseDesignLine(`@design gradient:${v}`)
      expect(intent.gradient).toBe(v)
    }
  })

  it('all density presets are valid', () => {
    for (const v of DENSITY_PRESETS) {
      const intent = parseDesignLine(`@design density:${v}`)
      expect(intent.density).toBe(v)
    }
  })

  it('all typography presets are valid', () => {
    for (const v of TYPOGRAPHY_PRESETS) {
      const intent = parseDesignLine(`@design typography:${v}`)
      expect(intent.typography).toBe(v)
    }
  })

  it('all motion presets are valid', () => {
    for (const v of MOTION_PRESETS) {
      const intent = parseDesignLine(`@design motion:${v}`)
      expect(intent.motion).toBe(v)
    }
  })
})
