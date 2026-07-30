// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  DesignSystemProvider,
  DesignOverride,
  useDesign,
  useDesignIntent,
} from './design-context.tsx'
import {
  DEFAULT_DESIGN,
  parseDesignOverride,
  mergeDesign,
  type DesignIntent,
} from './design-system.ts'

afterEach(cleanup)

// Probe component that reads the current design context and renders it
function DesignProbe() {
  const classes = useDesign()
  const intent = useDesignIntent()
  return (
    <div
      data-testid="probe"
      data-radius={intent.radius}
      data-shadow={intent.shadow}
      data-gradient={intent.gradient}
      data-density={intent.density}
      data-typography={intent.typography}
      data-motion={intent.motion}
      data-btn-radius={classes.radius.btn}
    />
  )
}

describe('parseDesignOverride', () => {
  it('returns only the axes specified (Partial<DesignIntent>)', () => {
    const override = parseDesignOverride('radius:sharp')
    expect(override.radius).toBe('sharp')
    expect(override.shadow).toBeUndefined()
    expect(override.gradient).toBeUndefined()
    expect(override.density).toBeUndefined()
    expect(override.typography).toBeUndefined()
    expect(override.motion).toBeUndefined()
  })

  it('returns empty object for empty string', () => {
    const override = parseDesignOverride('')
    expect(override).toEqual({})
  })

  it('parses multiple axes', () => {
    const override = parseDesignOverride('radius:pill shadow:none')
    expect(override.radius).toBe('pill')
    expect(override.shadow).toBe('none')
    expect(override.gradient).toBeUndefined()
  })

  it('accepts @design prefix or bare key:value', () => {
    expect(parseDesignOverride('@design radius:sharp').radius).toBe('sharp')
    expect(parseDesignOverride('radius:sharp').radius).toBe('sharp')
  })

  it('handles aliases', () => {
    expect(parseDesignOverride('motion:gentle').motion).toBe('subtle')
    expect(parseDesignOverride('radius:square').radius).toBe('sharp')
  })

  it('handles double-colon', () => {
    expect(parseDesignOverride('radius::sharp').radius).toBe('sharp')
  })
})

describe('mergeDesign', () => {
  it('merges override onto parent, keeping unspecified axes from parent', () => {
    const parent: DesignIntent = {
      radius: 'rounded',
      shadow: 'soft',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }
    const merged = mergeDesign(parent, { radius: 'sharp' })
    expect(merged.radius).toBe('sharp')
    expect(merged.shadow).toBe('soft')
    expect(merged.gradient).toBe('vibrant')
    expect(merged.density).toBe('airy')
    expect(merged.typography).toBe('display')
    expect(merged.motion).toBe('lively')
  })

  it('empty override returns parent unchanged', () => {
    const parent = DEFAULT_DESIGN
    const merged = mergeDesign(parent, {})
    expect(merged).toEqual(parent)
  })

  it('full override replaces all axes', () => {
    const parent: DesignIntent = {
      radius: 'rounded',
      shadow: 'soft',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }
    const merged = mergeDesign(parent, {
      radius: 'pill',
      shadow: 'brutalist',
      gradient: 'none',
      density: 'compact',
      typography: 'technical',
      motion: 'none',
    })
    expect(merged).toEqual({
      radius: 'pill',
      shadow: 'brutalist',
      gradient: 'none',
      density: 'compact',
      typography: 'technical',
      motion: 'none',
    })
  })
})

describe('DesignSystemProvider cascade — section merges onto global', () => {
  it('DesignOverride (section-level) inherits unspecified axes from parent', () => {
    const globalIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      radius: 'rounded',
      shadow: 'soft',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }

    render(
      <DesignSystemProvider intent={globalIntent}>
        {/* Section override: only radius specified, rest should inherit */}
        <DesignOverride override={{ radius: 'sharp' }}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    // Section explicitly set sharp
    expect(probe.getAttribute('data-radius')).toBe('sharp')
    // These should be INHERITED from global, not reset to defaults
    expect(probe.getAttribute('data-shadow')).toBe('soft')
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
    expect(probe.getAttribute('data-density')).toBe('airy')
    expect(probe.getAttribute('data-typography')).toBe('display')
    expect(probe.getAttribute('data-motion')).toBe('lively')
  })
})

describe('DesignOverride — element-level cascade', () => {
  it('DesignOverride merges onto parent context', () => {
    const globalIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      radius: 'rounded',
      shadow: 'soft',
      gradient: 'vibrant',
    }

    render(
      <DesignSystemProvider intent={globalIntent}>
        <DesignOverride override={{ radius: 'pill' }}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('pill')
    // Inherited from global
    expect(probe.getAttribute('data-shadow')).toBe('soft')
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
  })

  it('DesignOverride cascades through multiple levels', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded',
          shadow: 'soft',
          gradient: 'vibrant',
          density: 'airy',
        }}
      >
        <DesignOverride override={{ shadow: 'brutalist' }}>
          <DesignOverride override={{ radius: 'pill' }}>
            <DesignProbe />
          </DesignOverride>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('pill')
    expect(probe.getAttribute('data-shadow')).toBe('brutalist')
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
    expect(probe.getAttribute('data-density')).toBe('airy')
  })

  it('DesignOverride with empty override inherits everything', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'pill',
          shadow: 'brutalist',
        }}
      >
        <DesignOverride override={{}}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('pill')
    expect(probe.getAttribute('data-shadow')).toBe('brutalist')
  })
})

describe('CSS override layer — nested provider specificity', () => {
  it('inner provider CSS overrides outer for elements in its subtree', () => {
    // Global = rounded, section override = sharp
    // A .rounded-lg button inside the section should get sharp (0px),
    // not rounded (0.75rem) — the inner <style> appears later in DOM order
    // and wins the same-specificity tie.
    render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded' }}>
        <DesignOverride override={{ radius: 'sharp' }}>
          <button className="rounded-lg" data-testid="btn">
            Test
          </button>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const btn = screen.getByTestId('btn')
    const computed = window.getComputedStyle(btn)
    // sharp = 0px border-radius
    expect(computed.borderRadius).toBe('0px')
  })

  it('outer provider CSS still applies to elements outside the override', () => {
    render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded' }}>
        <button className="rounded-lg" data-testid="outer-btn">
          Outer
        </button>
        <DesignOverride override={{ radius: 'sharp' }}>
          <button className="rounded-lg" data-testid="inner-btn">
            Inner
          </button>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const outerBtn = screen.getByTestId('outer-btn')
    const innerBtn = screen.getByTestId('inner-btn')
    const outerComputed = window.getComputedStyle(outerBtn)
    const innerComputed = window.getComputedStyle(innerBtn)
    // Outer button gets rounded (0.75rem)
    expect(outerComputed.borderRadius).toBe('0.75rem')
    // Inner button gets sharp (0px)
    expect(innerComputed.borderRadius).toBe('0px')
  })
})
