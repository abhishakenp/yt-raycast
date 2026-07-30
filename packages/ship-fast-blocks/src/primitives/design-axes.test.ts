import { describe, it, expect } from 'vitest'
import {
  parseDesignLine,
  parseDesignOverride,
  mergeDesign,
  resolveDesign,
  serializeDesignIntent,
  DEFAULT_DESIGN,
  BORDER_VALUES,
  TRACKING_VALUES,
  LEADING_VALUES,
  WEIGHT_VALUES,
  TRANSFORM_VALUES,
  IMAGE_VALUES,
  OPACITY_VALUES,
  CHROME_VALUES,
  DECOR_VALUES,
  type DesignIntent,
} from './design-system.ts'

// ─── New atomic axes: parsing ──────────────────────────────────────────────

describe('parseDesignLine — new atomic axes', () => {
  it('parses border:medium', () => {
    const d = parseDesignLine('@design border:medium')
    expect(d.border).toBe('medium')
  })

  it('parses border:hairline via alias thin', () => {
    const d = parseDesignLine('@design border:thin')
    expect(d.border).toBe('hairline')
  })

  it('parses tracking:wide', () => {
    const d = parseDesignLine('@design tracking:wide')
    expect(d.tracking).toBe('wide')
  })

  it('parses tracking via alias letterspacing', () => {
    const d = parseDesignLine('@design letterspacing:tight')
    expect(d.tracking).toBe('tight')
  })

  it('parses tracking via alias letter-spacing (hyphenated)', () => {
    const d = parseDesignLine('@design letter-spacing:wide')
    expect(d.tracking).toBe('wide')
  })

  it('parses leading:compact', () => {
    const d = parseDesignLine('@design leading:compact')
    expect(d.leading).toBe('compact')
  })

  it('parses leading via alias line-height', () => {
    const d = parseDesignLine('@design line-height:relaxed')
    expect(d.leading).toBe('relaxed')
  })

  it('parses weight:black', () => {
    const d = parseDesignLine('@design weight:black')
    expect(d.weight).toBe('black')
  })

  it('parses weight via alias font-weight', () => {
    const d = parseDesignLine('@design font-weight:light')
    expect(d.weight).toBe('light')
  })

  it('parses transform:uppercase', () => {
    const d = parseDesignLine('@design transform:uppercase')
    expect(d.transform).toBe('uppercase')
  })

  it('parses transform via alias text-transform', () => {
    const d = parseDesignLine('@design text-transform:lowercase')
    expect(d.transform).toBe('lowercase')
  })

  it('parses image:grayscale', () => {
    const d = parseDesignLine('@design image:grayscale')
    expect(d.image).toBe('grayscale')
  })

  it('parses image via alias bw', () => {
    const d = parseDesignLine('@design image:bw')
    expect(d.image).toBe('grayscale')
  })

  it('parses opacity:subtle', () => {
    const d = parseDesignLine('@design opacity:subtle')
    expect(d.opacity).toBe('subtle')
  })

  it('parses opacity via alias faint → ghost', () => {
    const d = parseDesignLine('@design opacity:faint')
    expect(d.opacity).toBe('ghost')
  })
})

// ─── Compositional axes: parsing ───────────────────────────────────────────

describe('parseDesignLine — compositional axes', () => {
  it('parses chrome:brutalist', () => {
    const d = parseDesignLine('@design chrome:brutalist')
    expect(d.chrome).toBe('brutalist')
  })

  it('parses chrome via alias mono → terminal', () => {
    const d = parseDesignLine('@design chrome:mono')
    expect(d.chrome).toBe('terminal')
  })

  it('parses decor:graph-paper', () => {
    const d = parseDesignLine('@design decor:graph-paper')
    expect(d.decor).toBe('graph-paper')
  })

  it('parses decor via alias grid → graph-paper', () => {
    const d = parseDesignLine('@design decor:grid')
    expect(d.decor).toBe('graph-paper')
  })
})

// ─── New axes: resolution ──────────────────────────────────────────────────

describe('resolveDesign — new atomic axes', () => {
  it('resolves border:medium to border-2 on cards', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, border: 'medium' })
    expect(d.border.card).toBe('border-2')
    expect(d.border.btn).toBe('border-2')
  })

  it('resolves border:bold to border-4', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, border: 'bold' })
    expect(d.border.card).toBe('border-4')
  })

  it('resolves border:undefined to empty strings', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.border.card).toBe('')
    expect(d.border.btn).toBe('')
  })

  it('resolves tracking:wide to tracking-wide on display', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, tracking: 'wide' })
    expect(d.tracking.display).toBe('tracking-wide')
    expect(d.tracking.eyebrow).toBe('tracking-[0.2em]')
  })

  it('resolves tracking:undefined to empty strings', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.tracking.display).toBe('')
  })

  it('resolves leading:compact to leading-[0.85] on display', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, leading: 'compact' })
    expect(d.leading.display).toBe('leading-[0.85]')
    expect(d.leading.body).toBe('leading-snug')
  })

  it('resolves weight:black to font-black on display', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, weight: 'black' })
    expect(d.weight.display).toBe('font-black')
    expect(d.weight.heading).toBe('font-black')
  })

  it('resolves transform:uppercase to uppercase class', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, transform: 'uppercase' })
    expect(d.transform.display).toBe('uppercase')
    expect(d.transform.eyebrow).toBe('uppercase')
  })

  it('resolves image:grayscale to grayscale class', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, image: 'grayscale' })
    expect(d.image.treatment).toBe('grayscale')
  })

  it('resolves image:zoom to hover:scale class', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, image: 'zoom' })
    expect(d.image.treatment).toContain('hover:scale')
  })

  it('resolves opacity:ghost to opacity-20 on decor', () => {
    const d = resolveDesign({ ...DEFAULT_DESIGN, opacity: 'ghost' })
    expect(d.opacity.decor).toBe('opacity-20')
    expect(d.opacity.watermark).toBe('opacity-[0.02]')
  })
})

// ─── New axes: cascade merge ───────────────────────────────────────────────

describe('mergeDesign — new axes cascade', () => {
  it('inherits unspecified new axes from parent', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'bold',
      tracking: 'wide',
      chrome: 'brutalist',
    }
    const override = parseDesignOverride('radius:sharp')
    const merged = mergeDesign(parent, override)
    // radius overridden
    expect(merged.radius).toBe('sharp')
    // new axes inherited from parent
    expect(merged.border).toBe('bold')
    expect(merged.tracking).toBe('wide')
    expect(merged.chrome).toBe('brutalist')
  })

  it('overrides a new axis while keeping others from parent', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'bold',
      tracking: 'wide',
      weight: 'black',
    }
    const override = parseDesignOverride('border:hairline')
    const merged = mergeDesign(parent, override)
    expect(merged.border).toBe('hairline')
    expect(merged.tracking).toBe('wide')
    expect(merged.weight).toBe('black')
  })

  it('parseDesignOverride returns partial for new axes', () => {
    const partial = parseDesignOverride('border:medium chrome:terminal')
    expect(partial.border).toBe('medium')
    expect(partial.chrome).toBe('terminal')
    // Unspecified axes should NOT be in the partial
    expect(partial.tracking).toBeUndefined()
    expect(partial.radius).toBeUndefined()
  })
})

// ─── New axes: serialization round-trip ────────────────────────────────────

describe('serializeDesignIntent — new axes', () => {
  it('serializes all axes including new ones', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'medium',
      tracking: 'wide',
      chrome: 'brutalist',
      decor: 'glow',
    }
    const s = serializeDesignIntent(intent)
    expect(s).toContain('border:medium')
    expect(s).toContain('tracking:wide')
    expect(s).toContain('chrome:brutalist')
    expect(s).toContain('decor:glow')
  })

  it('round-trips through serialize → parse', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      border: 'bold',
      tracking: 'tight',
      leading: 'compact',
      weight: 'black',
      transform: 'uppercase',
      image: 'grayscale',
      opacity: 'subtle',
      chrome: 'editorial',
      decor: 'dot-grid',
    }
    const s = serializeDesignIntent(intent)
    const reparsed = parseDesignLine(s)
    expect(reparsed).toEqual(intent)
  })

  it('does not serialize undefined new axes', () => {
    const s = serializeDesignIntent(DEFAULT_DESIGN)
    // Default has no new axes set
    expect(s).not.toContain('border:')
    expect(s).not.toContain('tracking:')
    expect(s).not.toContain('chrome:')
  })
})

// ─── Enum completeness ─────────────────────────────────────────────────────

describe('enum completeness — new axes', () => {
  it('all border values resolve', () => {
    for (const v of BORDER_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, border: v })
      expect(d.border.card).toBeTruthy()
    }
  })
  it('all tracking values resolve', () => {
    for (const v of TRACKING_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, tracking: v })
      expect(d.tracking.display).toBeTruthy()
    }
  })
  it('all leading values resolve', () => {
    for (const v of LEADING_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, leading: v })
      expect(d.leading.display).toBeTruthy()
    }
  })
  it('all weight values resolve', () => {
    for (const v of WEIGHT_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, weight: v })
      expect(d.weight.display).toBeTruthy()
    }
  })
  it('all transform values resolve', () => {
    for (const v of TRANSFORM_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, transform: v })
      expect(d.transform.eyebrow).toBeTruthy()
    }
  })
  it('all image values resolve', () => {
    for (const v of IMAGE_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, image: v })
      expect(d.image.treatment).toBeDefined()
    }
  })
  it('all opacity values resolve', () => {
    for (const v of OPACITY_VALUES) {
      const d = resolveDesign({ ...DEFAULT_DESIGN, opacity: v })
      expect(d.opacity.decor).toBeTruthy()
    }
  })
  it('all chrome values parse', () => {
    for (const v of CHROME_VALUES) {
      const d = parseDesignLine(`@design chrome:${v}`)
      expect(d.chrome).toBe(v)
    }
  })
  it('all decor values parse', () => {
    for (const v of DECOR_VALUES) {
      const d = parseDesignLine(`@design decor:${v}`)
      expect(d.decor).toBe(v)
    }
  })
})

// ─── Backward compatibility ────────────────────────────────────────────────

describe('backward compatibility — new axes are opt-in', () => {
  it('DEFAULT_DESIGN has no new axes set', () => {
    expect(DEFAULT_DESIGN.border).toBeUndefined()
    expect(DEFAULT_DESIGN.tracking).toBeUndefined()
    expect(DEFAULT_DESIGN.chrome).toBeUndefined()
  })

  it('resolveDesign(DEFAULT_DESIGN) returns empty strings for new axes', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.border.btn).toBe('')
    expect(d.tracking.display).toBe('')
    expect(d.opacity.decor).toBe('')
  })

  it('existing @design lines without new axes still parse identically', () => {
    const d = parseDesignLine('@design radius:rounded shadow:soft')
    expect(d.radius).toBe('rounded')
    expect(d.shadow).toBe('soft')
    expect(d.border).toBeUndefined()
    expect(d.chrome).toBeUndefined()
  })
})
