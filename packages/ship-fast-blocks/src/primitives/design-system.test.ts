import { describe, it, expect } from 'vitest'
import {
  resolveDesign,
  parseDesignLine,
  DEFAULT_DESIGN,
  serializeDesignIntent,
  RADIUS_VALUES,
  SHADOW_VALUES,
  GRADIENT_VALUES,
  DENSITY_VALUES,
  TYPOGRAPHY_VALUES,
  MOTION_VALUES,
  type DesignIntent,
} from './design-system.ts'

describe('resolveDesign', () => {
  it('resolves default design to sharp radius + hard shadow', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.radius.btn).toBe('rounded-none')
    expect(d.shadow.btn).toContain('shadow-[4px_4px_0_0]')
  })

  it('resolves rounded radius to rounded-xl on buttons', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, radius: 'rounded' })
    expect(d.radius.btn).toBe('rounded-xl')
    expect(d.radius.card).toBe('rounded-xl')
  })

  it('resolves pill radius to rounded-full on buttons', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, radius: 'pill' })
    expect(d.radius.btn).toBe('rounded-full')
  })

  it('resolves soft shadow to shadow-sm', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, shadow: 'soft' })
    expect(d.shadow.card).toBe('shadow-sm')
  })

  it('resolves none shadow to empty string', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, shadow: 'none' })
    expect(d.shadow.btn).toBe('')
    expect(d.shadow.card).toBe('')
  })

  it('resolves vibrant gradient to indigo-violet-fuchsia', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, gradient: 'vibrant' })
    expect(d.gradient.highlight).toContain('from-indigo-500')
    expect(d.gradient.highlight).toContain('via-violet-500')
    expect(d.gradient.highlight).toContain('to-fuchsia-500')
    expect(d.gradient.text).toContain('[-webkit-text-fill-color:transparent]')
  })

  it('resolves none gradient to solid primary', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, gradient: 'none' })
    expect(d.gradient.highlight).toBe('bg-primary')
    expect(d.gradient.text).toBe('')
  })

  it('resolves airy density to py-24', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, density: 'airy' })
    expect(d.density.section).toBe('py-24')
    expect(d.density.card).toBe('p-8')
  })

  it('resolves compact density to py-10', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, density: 'compact' })
    expect(d.density.section).toBe('py-10')
    expect(d.density.card).toBe('p-4')
  })

  it('resolves display typography to font-black', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, typography: 'display' })
    expect(d.typography.display).toContain('font-black')
  })

  it('resolves technical typography to tabular-nums', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, typography: 'technical' })
    expect(d.typography.display).toContain('tabular-nums')
  })

  it('resolves lively motion to scale on hover', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, motion: 'lively' })
    expect(d.motion.hover).toContain('hover:scale-[1.02]')
  })

  it('resolves none motion to empty strings', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, motion: 'none' })
    expect(d.motion.hover).toBe('')
    expect(d.motion.transition).toBe('')
  })
})

describe('parseDesignLine', () => {
  it('parses a full @design line', () => {
    const line =
      '@design radius:rounded gradients:vibrant density:airy typography:display motion:lively'
    const intent = parseDesignLine(line)
    expect(intent.radius).toBe('rounded')
    expect(intent.gradient).toBe('vibrant')
    expect(intent.density).toBe('airy')
    expect(intent.typography).toBe('display')
    expect(intent.motion).toBe('lively')
  })

  it('uses defaults for unspecified axes', () => {
    const intent = parseDesignLine('@design radius:rounded')
    expect(intent.radius).toBe('rounded')
    expect(intent.shadow).toBe(DEFAULT_DESIGN.shadow)
    expect(intent.gradient).toBe(DEFAULT_DESIGN.gradient)
  })

  it('ignores unknown keys', () => {
    const intent = parseDesignLine('@design radius:rounded foo:bar')
    expect(intent.radius).toBe('rounded')
  })

  it('ignores invalid enum values', () => {
    const intent = parseDesignLine('@design radius:extraround')
    expect(intent.radius).toBe(DEFAULT_DESIGN.radius)
  })

  it('accepts singular and plural keys (gradient/gradients)', () => {
    const a = parseDesignLine('@design gradient:vibrant')
    const b = parseDesignLine('@design gradients:vibrant')
    expect(a.gradient).toBe('vibrant')
    expect(b.gradient).toBe('vibrant')
  })

  it('accepts shadow and shadows', () => {
    const a = parseDesignLine('@design shadow:soft')
    const b = parseDesignLine('@design shadows:soft')
    expect(a.shadow).toBe('soft')
    expect(b.shadow).toBe('soft')
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
    const intent = parseDesignLine('@design RADIUS:ROUNDED')
    expect(intent.radius).toBe('rounded')
  })
})

describe('serializeDesignIntent', () => {
  it('round-trips through parse → serialize → parse', () => {
    const original: DesignIntent = {
      radius: 'rounded',
      shadow: 'soft',
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

describe('enum completeness', () => {
  it('all radius values resolve', () => {
    for (const v of RADIUS_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, radius: v })
      expect(d.radius.btn).toBeTruthy()
    }
  })
  it('all shadow values resolve', () => {
    for (const v of SHADOW_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, shadow: v })
      expect(d.shadow).toBeDefined()
    }
  })
  it('all gradient values resolve', () => {
    for (const v of GRADIENT_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, gradient: v })
      expect(d.gradient.highlight).toBeDefined()
    }
  })
  it('all density values resolve', () => {
    for (const v of DENSITY_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, density: v })
      expect(d.density.section).toBeTruthy()
    }
  })
  it('all typography values resolve', () => {
    for (const v of TYPOGRAPHY_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, typography: v })
      expect(d.typography.display).toBeTruthy()
    }
  })
  it('all motion values resolve', () => {
    for (const v of MOTION_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, motion: v })
      expect(d.motion).toBeDefined()
    }
  })
})
