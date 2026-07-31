import { describe, it, expect } from 'vitest'
import {
  parseDesignLine,
  parseDesignOverride,
  mergeDesign,
  resolveDesign,
  serializeDesignIntent,
  designValueToCss,
  isNamedPreset,
  DEFAULT_DESIGN,
  AXIS_NAMES,
  DENSITY_PRESETS,
  TYPOGRAPHY_PRESETS,
  GRADIENT_PRESETS,
  MOTION_PRESETS,
  CHROME_PRESETS,
  DECOR_PRESETS,
  type DesignIntent,
} from './design-system.ts'

// ─── Bare Tailwind classes → axis mapping ──────────────────────────────────

describe('parseDesignLine — bare Tailwind classes', () => {
  it('maps rounded-xl → radius', () => {
    const d = parseDesignLine('@design rounded-xl')
    expect(d.radius).toBe('rounded-xl')
  })

  it('maps shadow-lg → shadow', () => {
    const d = parseDesignLine('@design shadow-lg')
    expect(d.shadow).toBe('shadow-lg')
  })

  it('maps tracking-wide → tracking', () => {
    const d = parseDesignLine('@design tracking-wide')
    expect(d.tracking).toBe('tracking-wide')
  })

  it('maps font-black → weight', () => {
    const d = parseDesignLine('@design font-black')
    expect(d.weight).toBe('font-black')
  })

  it('maps uppercase → transform', () => {
    const d = parseDesignLine('@design uppercase')
    expect(d.transform).toBe('uppercase')
  })

  it('maps border-2 → border', () => {
    const d = parseDesignLine('@design border-2')
    expect(d.border).toBe('border-2')
  })

  it('maps grayscale → image', () => {
    const d = parseDesignLine('@design grayscale')
    expect(d.image).toBe('grayscale')
  })

  it('maps leading-tight → leading', () => {
    const d = parseDesignLine('@design leading-tight')
    expect(d.leading).toBe('leading-tight')
  })

  it('maps opacity-50 → opacity', () => {
    const d = parseDesignLine('@design opacity-50')
    expect(d.opacity).toBe('opacity-50')
  })

  it('maps bare border (no suffix) → border', () => {
    const d = parseDesignLine('@design border')
    expect(d.border).toBe('border')
  })

  it('maps rounded-full → radius', () => {
    const d = parseDesignLine('@design rounded-full')
    expect(d.radius).toBe('rounded-full')
  })

  it('maps lowercase → transform', () => {
    const d = parseDesignLine('@design lowercase')
    expect(d.transform).toBe('lowercase')
  })
})

// ─── Arbitrary bracket values ───────────────────────────────────────────────

describe('parseDesignLine — arbitrary values', () => {
  it('accepts rounded-[13px] → radius', () => {
    const d = parseDesignLine('@design rounded-[13px]')
    expect(d.radius).toBe('rounded-[13px]')
  })

  it('accepts shadow-[4px_4px_0_0] → shadow', () => {
    const d = parseDesignLine('@design shadow-[4px_4px_0_0]')
    expect(d.shadow).toBe('shadow-[4px_4px_0_0]')
  })

  it('accepts tracking-[0.3em] → tracking', () => {
    const d = parseDesignLine('@design tracking-[0.3em]')
    expect(d.tracking).toBe('tracking-[0.3em]')
  })

  it('accepts leading-[1.1] → leading', () => {
    const d = parseDesignLine('@design leading-[1.1]')
    expect(d.leading).toBe('leading-[1.1]')
  })

  it('accepts opacity-[0.15] → opacity', () => {
    const d = parseDesignLine('@design opacity-[0.15]')
    expect(d.opacity).toBe('opacity-[0.15]')
  })

  it('accepts arbitrary value via axis-key form radius:[13px]', () => {
    const d = parseDesignLine('@design radius:[13px]')
    expect(d.radius).toBe('[13px]')
  })

  it('preserves underscores inside brackets (shadow with rgba)', () => {
    const d = parseDesignLine('@design shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]')
    expect(d.shadow).toBe('shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]')
  })
})

// ─── Per-role overrides ─────────────────────────────────────────────────────

describe('parseDesignLine — per-role overrides', () => {
  it('accepts btn:rounded-full → roles.radius.btn', () => {
    const d = parseDesignLine('@design btn:rounded-full')
    expect(d.roles?.radius?.btn).toBe('rounded-full')
  })

  it('accepts card:rounded-2xl → roles.radius.card', () => {
    const d = parseDesignLine('@design card:rounded-2xl')
    expect(d.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('accepts multiple role overrides on same axis', () => {
    const d = parseDesignLine('@design btn:rounded-full card:rounded-2xl')
    expect(d.roles?.radius?.btn).toBe('rounded-full')
    expect(d.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('accepts role override on shadow axis (card:shadow-lg)', () => {
    const d = parseDesignLine('@design card:shadow-lg')
    expect(d.roles?.shadow?.card).toBe('shadow-lg')
  })

  it('accepts role override with arbitrary value (btn:rounded-[13px])', () => {
    const d = parseDesignLine('@design btn:rounded-[13px]')
    expect(d.roles?.radius?.btn).toBe('rounded-[13px]')
  })

  it('combines role override with axis-level value', () => {
    const d = parseDesignLine('@design rounded-xl btn:rounded-full')
    expect(d.radius).toBe('rounded-xl')
    expect(d.roles?.radius?.btn).toBe('rounded-full')
  })

  it('does not set roles when no role overrides present', () => {
    const d = parseDesignLine('@design rounded-xl shadow-lg')
    expect(d.roles).toBeUndefined()
  })
})

// ─── Named-concept presets still work ───────────────────────────────────────

describe('parseDesignLine — named-concept presets', () => {
  it('accepts density:airy', () => {
    const d = parseDesignLine('@design density:airy')
    expect(d.density).toBe('airy')
  })

  it('accepts typography:display', () => {
    const d = parseDesignLine('@design typography:display')
    expect(d.typography).toBe('display')
  })

  it('accepts gradient:vibrant', () => {
    const d = parseDesignLine('@design gradient:vibrant')
    expect(d.gradient).toBe('vibrant')
  })

  it('accepts motion:lively', () => {
    const d = parseDesignLine('@design motion:lively')
    expect(d.motion).toBe('lively')
  })

  it('accepts arbitrary border value (border:[3px])', () => {
    const d = parseDesignLine('@design border:[3px]')
    expect(d.border).toBe('[3px]')
  })

  it('accepts bare grayscale class for image', () => {
    const d = parseDesignLine('@design grayscale')
    expect(d.image).toBe('grayscale')
  })

  it('resolves key aliases (letterspacing → tracking)', () => {
    const d = parseDesignLine('@design letterspacing:tracking-wide')
    expect(d.tracking).toBe('tracking-wide')
  })

  it('resolves key aliases (font-weight → weight)', () => {
    const d = parseDesignLine('@design font-weight:font-light')
    expect(d.weight).toBe('font-light')
  })

  it('resolves key aliases (line-height → leading)', () => {
    const d = parseDesignLine('@design line-height:leading-relaxed')
    expect(d.leading).toBe('leading-relaxed')
  })

  it('resolves key aliases (text-transform → transform)', () => {
    const d = parseDesignLine('@design text-transform:lowercase')
    expect(d.transform).toBe('lowercase')
  })
})

// ─── Mixed inputs ───────────────────────────────────────────────────────────

describe('parseDesignLine — mixed formats', () => {
  it('accepts mixed bare classes + named presets', () => {
    const d = parseDesignLine(
      '@design rounded-xl shadow-lg density:airy typography:display',
    )
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-lg')
    expect(d.density).toBe('airy')
    expect(d.typography).toBe('display')
  })

  it('accepts mixed bare classes + arbitrary + role override', () => {
    const d = parseDesignLine(
      '@design rounded-xl shadow-[4px_4px_0_0] btn:rounded-full',
    )
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-[4px_4px_0_0]')
    expect(d.roles?.radius?.btn).toBe('rounded-full')
  })

  it('accepts mixed named preset + bare class + role override', () => {
    const d = parseDesignLine('@design density:airy font-black card:shadow-lg')
    expect(d.density).toBe('airy')
    expect(d.weight).toBe('font-black')
    expect(d.roles?.shadow?.card).toBe('shadow-lg')
  })

  it('ignores unknown tokens silently', () => {
    const d = parseDesignLine('@design rounded-xl bogus-token shadow-lg')
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-lg')
  })
})

// ─── resolveDesign returns empty objects (deprecated) ───────────────────────

describe('resolveDesign — returns empty objects (backward compat)', () => {
  it('returns empty objects for DEFAULT_DESIGN', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.radius).toEqual({})
    expect(d.shadow).toEqual({})
    expect(d.border).toEqual({})
    expect(d.tracking).toEqual({})
  })

  it('returns empty objects even when intent has values set', () => {
    const d = resolveDesign({
      ...DEFAULT_DESIGN,
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      border: 'border-2',
    })
    expect(d.radius).toEqual({})
    expect(d.shadow).toEqual({})
    expect(d.border).toEqual({})
  })

  it('no longer produces class strings (d.radius.btn is undefined)', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, radius: 'rounded-xl' })
    expect(d.radius.btn).toBeUndefined()
    expect(d.radius.card).toBeUndefined()
  })

  it('returns empty objects for all axes', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'border-2',
      tracking: 'tracking-wide',
      leading: 'leading-tight',
      weight: 'font-black',
      transform: 'uppercase',
      image: 'grayscale',
      opacity: 'opacity-50',
    }
    const d = resolveDesign(intent)
    expect(d.border).toEqual({})
    expect(d.tracking).toEqual({})
    expect(d.leading).toEqual({})
    expect(d.weight).toEqual({})
    expect(d.transform).toEqual({})
    expect(d.image).toEqual({})
    expect(d.opacity).toEqual({})
  })

  it('always returns the same empty shape (referentially stable EMPTY_CLASSES)', () => {
    const a = resolveDesign(DEFAULT_DESIGN)
    const b = resolveDesign({ ...DEFAULT_DESIGN, radius: 'rounded-xl' })
    expect(a).toBe(b)
  })
})

// ─── All axes parse correctly ────────────────────────────────────────────────

describe('parseDesignLine — all axes', () => {
  describe('border axis (Tailwind)', () => {
    it('parses bare Tailwind border classes', () => {
      expect(parseDesignLine('@design border').border).toBe('border')
      expect(parseDesignLine('@design border-2').border).toBe('border-2')
      expect(parseDesignLine('@design border-4').border).toBe('border-4')
    })
  })

  describe('tracking axis (Tailwind)', () => {
    it('parses bare Tailwind tracking classes', () => {
      expect(parseDesignLine('@design tracking-tight').tracking).toBe(
        'tracking-tight',
      )
      expect(parseDesignLine('@design tracking-wide').tracking).toBe(
        'tracking-wide',
      )
      expect(parseDesignLine('@design tracking-widest').tracking).toBe(
        'tracking-widest',
      )
    })
  })

  describe('leading axis (Tailwind)', () => {
    it('parses bare Tailwind leading classes', () => {
      expect(parseDesignLine('@design leading-tight').leading).toBe(
        'leading-tight',
      )
      expect(parseDesignLine('@design leading-relaxed').leading).toBe(
        'leading-relaxed',
      )
    })
  })

  describe('weight axis (Tailwind)', () => {
    it('parses bare Tailwind font-weight classes', () => {
      expect(parseDesignLine('@design font-light').weight).toBe('font-light')
      expect(parseDesignLine('@design font-bold').weight).toBe('font-bold')
      expect(parseDesignLine('@design font-black').weight).toBe('font-black')
    })
  })

  describe('transform axis (Tailwind)', () => {
    it('parses bare Tailwind transform classes', () => {
      expect(parseDesignLine('@design uppercase').transform).toBe('uppercase')
      expect(parseDesignLine('@design lowercase').transform).toBe('lowercase')
      expect(parseDesignLine('@design capitalize').transform).toBe('capitalize')
    })
  })

  describe('image axis (Tailwind)', () => {
    it('parses bare grayscale class', () => {
      expect(parseDesignLine('@design grayscale').image).toBe('grayscale')
      expect(parseDesignLine('@design grayscale-0').image).toBe('grayscale-0')
    })
  })

  describe('opacity axis (Tailwind)', () => {
    it('parses bare Tailwind opacity classes', () => {
      expect(parseDesignLine('@design opacity-50').opacity).toBe('opacity-50')
      expect(parseDesignLine('@design opacity-100').opacity).toBe('opacity-100')
    })
  })

  describe('gradient axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of GRADIENT_PRESETS) {
        const d = parseDesignLine(`@design gradient:${v}`)
        expect(d.gradient).toBe(v)
      }
    })
  })

  describe('density axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of DENSITY_PRESETS) {
        const d = parseDesignLine(`@design density:${v}`)
        expect(d.density).toBe(v)
      }
    })
  })

  describe('typography axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of TYPOGRAPHY_PRESETS) {
        const d = parseDesignLine(`@design typography:${v}`)
        expect(d.typography).toBe(v)
      }
    })
  })

  describe('motion axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of MOTION_PRESETS) {
        const d = parseDesignLine(`@design motion:${v}`)
        expect(d.motion).toBe(v)
      }
    })
  })

  describe('chrome axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of CHROME_PRESETS) {
        const d = parseDesignLine(`@design chrome:${v}`)
        expect(d.chrome).toBe(v)
      }
    })
  })

  describe('decor axis (named concept)', () => {
    it('parses named presets', () => {
      for (const v of DECOR_PRESETS) {
        const d = parseDesignLine(`@design decor:${v}`)
        expect(d.decor).toBe(v)
      }
    })
  })
})

// ─── parseDesignOverride ────────────────────────────────────────────────────

describe('parseDesignOverride — new behavior', () => {
  it('returns partial with only explicitly set axes', () => {
    const partial = parseDesignOverride('border-2 tracking-wide')
    expect(partial.border).toBe('border-2')
    expect(partial.tracking).toBe('tracking-wide')
    expect(partial.radius).toBeUndefined()
    expect(partial.shadow).toBeUndefined()
  })

  it('accepts bare Tailwind classes', () => {
    const partial = parseDesignOverride('rounded-xl font-black')
    expect(partial.radius).toBe('rounded-xl')
    expect(partial.weight).toBe('font-black')
  })

  it('accepts role overrides', () => {
    const partial = parseDesignOverride('btn:rounded-full')
    expect(partial.roles?.radius?.btn).toBe('rounded-full')
  })

  it('returns empty object for empty input', () => {
    expect(parseDesignOverride('')).toEqual({})
    expect(parseDesignOverride('@design')).toEqual({})
  })
})

// ─── mergeDesign ────────────────────────────────────────────────────────────

describe('mergeDesign — cascade', () => {
  it('inherits unspecified axes from parent', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'border-2',
      tracking: 'tracking-wide',
    }
    const override = parseDesignOverride('rounded-none')
    const merged = mergeDesign(parent, override)
    expect(merged.radius).toBe('rounded-none')
    expect(merged.border).toBe('border-2')
    expect(merged.tracking).toBe('tracking-wide')
  })

  it('overrides one axis while keeping others from parent', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'border-2',
      tracking: 'tracking-wide',
      weight: 'font-black',
    }
    const override = parseDesignOverride('border')
    const merged = mergeDesign(parent, override)
    expect(merged.border).toBe('border')
    expect(merged.tracking).toBe('tracking-wide')
    expect(merged.weight).toBe('font-black')
  })

  it('deep-merges per-role overrides', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: { radius: { btn: 'rounded-full' } },
    }
    const override = parseDesignOverride('card:rounded-2xl')
    const merged = mergeDesign(parent, override)
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
    expect(merged.roles?.radius?.card).toBe('rounded-2xl')
  })
})

// ─── serializeDesignIntent ──────────────────────────────────────────────────

describe('serializeDesignIntent', () => {
  it('serializes all axes', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'border-2',
      tracking: 'tracking-wide',
    }
    const s = serializeDesignIntent(intent)
    expect(s).toContain('border:border-2')
    expect(s).toContain('tracking:tracking-wide')
  })

  it('serializes per-role overrides as role:value', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: { radius: { btn: 'rounded-full' } },
    }
    const s = serializeDesignIntent(intent)
    expect(s).toContain('btn:rounded-full')
  })

  it('round-trips through serialize → parse', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'border-2',
      tracking: 'tracking-tight',
      leading: 'leading-tight',
      weight: 'font-black',
      transform: 'uppercase',
      image: 'grayscale',
      opacity: 'opacity-50',
    }
    const s = serializeDesignIntent(intent)
    const reparsed = parseDesignLine(s)
    expect(reparsed).toEqual(intent)
  })

  it('does not serialize undefined axes', () => {
    const s = serializeDesignIntent(DEFAULT_DESIGN)
    expect(s).not.toContain('border:')
    expect(s).not.toContain('tracking:')
  })
})

// ─── designValueToCss ───────────────────────────────────────────────────────

describe('designValueToCss', () => {
  it('extracts arbitrary bracket values', () => {
    expect(designValueToCss('[13px]')).toBe('13px')
    expect(designValueToCss('[4px_4px_0_0]')).toBe('4px 4px 0 0')
  })

  it('looks up Tailwind classes', () => {
    expect(designValueToCss('rounded-xl')).toBe('0.75rem')
    expect(designValueToCss('font-black')).toBe('900')
    expect(designValueToCss('tracking-wide')).toBe('0.025em')
    expect(designValueToCss('border-2')).toBe('2px')
    expect(designValueToCss('grayscale')).toBe('grayscale(1)')
  })

  it('returns null for named-concept presets (CSS handles them)', () => {
    expect(designValueToCss('airy')).toBeNull()
    expect(designValueToCss('vibrant')).toBeNull()
  })

  it('passes through raw CSS values', () => {
    expect(designValueToCss('0.75rem')).toBe('0.75rem')
    expect(designValueToCss('4px')).toBe('4px')
  })
})

// ─── isNamedPreset ──────────────────────────────────────────────────────────

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
    expect(isNamedPreset('weight', 'font-black')).toBe(false)
    expect(isNamedPreset('border', 'border-2')).toBe(false)
  })

  it('returns false for unknown axis', () => {
    expect(isNamedPreset('nonexistent', 'foo')).toBe(false)
  })
})

// ─── AXIS_REGISTRY completeness ─────────────────────────────────────────────

describe('AXIS_REGISTRY completeness', () => {
  it('includes all expected axes', () => {
    const expected = [
      'radius',
      'shadow',
      'gradient',
      'density',
      'typography',
      'motion',
      'border',
      'tracking',
      'leading',
      'weight',
      'transform',
      'image',
      'opacity',
      'chrome',
      'decor',
    ]
    expect(AXIS_NAMES).toEqual(expect.arrayContaining(expected))
    expect(AXIS_NAMES.length).toBeGreaterThanOrEqual(expected.length)
  })

  it('named-concept axes have presets', () => {
    expect(DENSITY_PRESETS.length).toBeGreaterThan(0)
    expect(TYPOGRAPHY_PRESETS.length).toBeGreaterThan(0)
    expect(GRADIENT_PRESETS.length).toBeGreaterThan(0)
    expect(MOTION_PRESETS.length).toBeGreaterThan(0)
    expect(CHROME_PRESETS.length).toBeGreaterThan(0)
    expect(DECOR_PRESETS.length).toBeGreaterThan(0)
  })
})

// ─── Backward compatibility ─────────────────────────────────────────────────

describe('backward compatibility', () => {
  it('DEFAULT_DESIGN has required axes set, optional axes undefined', () => {
    expect(DEFAULT_DESIGN.radius).toBe('rounded-none')
    expect(DEFAULT_DESIGN.shadow).toBe('shadow-[4px_4px_0_0]')
    expect(DEFAULT_DESIGN.gradient).toBe('none')
    expect(DEFAULT_DESIGN.density).toBe('balanced')
    expect(DEFAULT_DESIGN.typography).toBe('editorial')
    expect(DEFAULT_DESIGN.motion).toBe('subtle')
    expect(DEFAULT_DESIGN.border).toBeUndefined()
    expect(DEFAULT_DESIGN.tracking).toBeUndefined()
    expect(DEFAULT_DESIGN.chrome).toBeUndefined()
  })

  it('existing @design lines without optional axes still parse', () => {
    const d = parseDesignLine('@design rounded-xl shadow-lg')
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-lg')
    expect(d.border).toBeUndefined()
    expect(d.chrome).toBeUndefined()
  })

  it('empty @design returns DEFAULT_DESIGN', () => {
    const d = parseDesignLine('@design')
    expect(d).toEqual(DEFAULT_DESIGN)
  })

  it('@design prefix is optional (bare line works)', () => {
    const d = parseDesignLine('rounded-xl shadow-lg')
    expect(d.radius).toBe('rounded-xl')
    expect(d.shadow).toBe('shadow-lg')
  })
})
