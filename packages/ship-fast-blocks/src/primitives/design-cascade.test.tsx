// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import {
  DesignSystemProvider,
  DesignOverride,
  useDesignIntent,
} from './design-context.tsx'
import {
  DEFAULT_DESIGN,
  parseDesignOverride,
  mergeDesign,
  type DesignIntent,
} from './design-system.ts'

afterEach(cleanup)

// ─── Probe component ──────────────────────────────────────────────────────
// Reads the current design intent from context and renders it as data attrs.
// This is how we verify the cascade — the child sees the merged intent.
function DesignProbe() {
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
      data-border={intent.border}
      data-chrome={intent.chrome}
    />
  )
}

// Probe that also exposes per-role overrides so we can verify deep-merge.
function RoleProbe() {
  const intent = useDesignIntent()
  const roles = intent.roles ?? {}
  return (
    <div
      data-testid="role-probe"
      data-radius-btn={roles.radius?.btn}
      data-radius-card={roles.radius?.card}
      data-radius-input={roles.radius?.input}
    />
  )
}

// ─── parseDesignOverride ──────────────────────────────────────────────────

describe('parseDesignOverride', () => {
  it('returns only the axes explicitly set (Partial<DesignIntent>)', () => {
    const override = parseDesignOverride('rounded-none')
    expect(override.radius).toBe('rounded-none')
    expect(override.shadow).toBeUndefined()
    expect(override.gradient).toBeUndefined()
    expect(override.density).toBeUndefined()
    expect(override.typography).toBeUndefined()
    expect(override.motion).toBeUndefined()
  })

  it('returns empty object for empty string', () => {
    expect(parseDesignOverride('')).toEqual({})
  })

  it('returns empty object for bare @design prefix', () => {
    expect(parseDesignOverride('@design')).toEqual({})
  })

  it('parses multiple axes', () => {
    const override = parseDesignOverride('rounded-full shadow-none')
    expect(override.radius).toBe('rounded-full')
    expect(override.shadow).toBe('shadow-none')
    expect(override.gradient).toBeUndefined()
  })

  it('accepts @design prefix or bare key:value', () => {
    expect(parseDesignOverride('@design rounded-none').radius).toBe(
      'rounded-none',
    )
    expect(parseDesignOverride('rounded-none').radius).toBe('rounded-none')
  })

  it('resolves value aliases to canonical presets', () => {
    expect(parseDesignOverride('motion:gentle').motion).toBe('subtle')
  })

  it('handles double-colon syntax', () => {
    expect(parseDesignOverride('radius::rounded-none').radius).toBe(
      'rounded-none',
    )
  })

  it('parses per-role overrides into roles map', () => {
    const override = parseDesignOverride('btn:rounded-full card:rounded-2xl')
    expect(override.roles).toBeDefined()
    expect(override.roles?.radius?.btn).toBe('rounded-full')
    expect(override.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('parses mixed axis + role overrides', () => {
    const override = parseDesignOverride('rounded-xl btn:rounded-full')
    expect(override.radius).toBe('rounded-xl')
    expect(override.roles?.radius?.btn).toBe('rounded-full')
  })

  it('does NOT fill in defaults for unspecified axes', () => {
    const override = parseDesignOverride('shadow-lg')
    // Only shadow is set — radius, gradient, etc. must be absent
    expect(Object.keys(override)).not.toContain('radius')
    expect(Object.keys(override)).not.toContain('gradient')
    expect(Object.keys(override)).not.toContain('density')
  })
})

// ─── mergeDesign ──────────────────────────────────────────────────────────

describe('mergeDesign', () => {
  it('merges override onto parent, keeping unspecified axes from parent', () => {
    const parent: DesignIntent = {
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }
    const merged = mergeDesign(parent, { radius: 'rounded-none' })
    expect(merged.radius).toBe('rounded-none')
    expect(merged.shadow).toBe('shadow-lg')
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
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }
    const merged = mergeDesign(parent, {
      radius: 'rounded-full',
      shadow: 'shadow-[8px_8px_0_0]',
      gradient: 'none',
      density: 'compact',
      typography: 'technical',
      motion: 'none',
    })
    expect(merged).toEqual({
      radius: 'rounded-full',
      shadow: 'shadow-[8px_8px_0_0]',
      gradient: 'none',
      density: 'compact',
      typography: 'technical',
      motion: 'none',
    })
  })

  it('deep-merges per-role overrides: parent roles + override roles coexist', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: {
        radius: { btn: 'rounded-full' },
      },
    }
    const merged = mergeDesign(parent, {
      roles: {
        radius: { card: 'rounded-2xl' },
      },
    })
    // Both parent's btn and override's card should be present
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
    expect(merged.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('override role value wins over parent role value for same role', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: {
        radius: { btn: 'rounded-full', card: 'rounded-lg' },
      },
    }
    const merged = mergeDesign(parent, {
      roles: {
        radius: { btn: 'rounded-none' },
      },
    })
    // Override wins for btn, parent's card is preserved
    expect(merged.roles?.radius?.btn).toBe('rounded-none')
    expect(merged.roles?.radius?.card).toBe('rounded-lg')
  })

  it('merges roles across different axes', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: {
        radius: { btn: 'rounded-full' },
      },
    }
    const merged = mergeDesign(parent, {
      roles: {
        shadow: { card: 'shadow-lg' },
      },
    })
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
    expect(merged.roles?.shadow?.card).toBe('shadow-lg')
  })

  it('parent roles preserved when override has no roles', () => {
    const parent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: {
        radius: { btn: 'rounded-full' },
      },
    }
    const merged = mergeDesign(parent, { radius: 'rounded-none' })
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
  })

  it('override roles added when parent has no roles', () => {
    const parent: DesignIntent = { ...DEFAULT_DESIGN }
    const merged = mergeDesign(parent, {
      roles: { radius: { btn: 'rounded-full' } },
    })
    expect(merged.roles?.radius?.btn).toBe('rounded-full')
  })
})

// ─── DesignOverride — element-level cascade via context ───────────────────

describe('DesignOverride — merges parent intent with override', () => {
  it('child sees merged intent via useDesignIntent()', () => {
    const globalIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      gradient: 'vibrant',
    }

    render(
      <DesignSystemProvider intent={globalIntent}>
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('rounded-full')
    // Inherited from global
    expect(probe.getAttribute('data-shadow')).toBe('shadow-lg')
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
  })

  it('unspecified axes inherit from parent', () => {
    const globalIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      radius: 'rounded-xl',
      shadow: 'shadow-lg',
      gradient: 'vibrant',
      density: 'airy',
      typography: 'display',
      motion: 'lively',
    }

    render(
      <DesignSystemProvider intent={globalIntent}>
        {/* Section override: only radius specified, rest should inherit */}
        <DesignOverride override={{ radius: 'rounded-none' }}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('rounded-none')
    // These should be INHERITED from global, not reset to defaults
    expect(probe.getAttribute('data-shadow')).toBe('shadow-lg')
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
    expect(probe.getAttribute('data-density')).toBe('airy')
    expect(probe.getAttribute('data-typography')).toBe('display')
    expect(probe.getAttribute('data-motion')).toBe('lively')
  })

  it('empty override inherits everything from parent', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-full',
          shadow: 'shadow-[8px_8px_0_0]',
        }}
      >
        <DesignOverride override={{}}>
          <DesignProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('rounded-full')
    expect(probe.getAttribute('data-shadow')).toBe('shadow-[8px_8px_0_0]')
  })
})

// ─── Cascade: global → section → element ──────────────────────────────────

describe('cascade: global → section → element', () => {
  it('each level overrides the previous', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          shadow: 'shadow-lg',
          gradient: 'vibrant',
          density: 'airy',
        }}
      >
        {/* Section level: override shadow */}
        <DesignOverride override={{ shadow: 'shadow-[8px_8px_0_0]' }}>
          {/* Element level: override radius */}
          <DesignOverride override={{ radius: 'rounded-full' }}>
            <DesignProbe />
          </DesignOverride>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    // Element level wins for radius
    expect(probe.getAttribute('data-radius')).toBe('rounded-full')
    // Section level wins for shadow
    expect(probe.getAttribute('data-shadow')).toBe('shadow-[8px_8px_0_0]')
    // Global inherited for the rest
    expect(probe.getAttribute('data-gradient')).toBe('vibrant')
    expect(probe.getAttribute('data-density')).toBe('airy')
  })

  it('three levels deep: element overrides section overrides global', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-none',
          shadow: 'shadow-none',
        }}
      >
        <DesignOverride override={{ radius: 'rounded-xl' }}>
          <DesignOverride override={{ radius: 'rounded-full' }}>
            <DesignProbe />
          </DesignOverride>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('probe')
    // Innermost override wins
    expect(probe.getAttribute('data-radius')).toBe('rounded-full')
    // Section didn't override shadow, global inherited
    expect(probe.getAttribute('data-shadow')).toBe('shadow-none')
  })

  it('section override does not leak to siblings outside it', () => {
    render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}
      >
        <DesignProbe />
        <DesignOverride override={{ radius: 'rounded-none' }}>
          <div data-testid="section-content">
            <DesignProbe />
          </div>
        </DesignOverride>
      </DesignSystemProvider>,
    )

    // The first probe (outside the override) sees the global intent
    const probes = screen.getAllByTestId('probe')
    expect(probes[0].getAttribute('data-radius')).toBe('rounded-xl')
    // The probe inside the section sees the override
    expect(probes[1].getAttribute('data-radius')).toBe('rounded-none')
  })
})

// ─── DesignOverride deep-merge of roles through context ───────────────────

describe('DesignOverride deep-merges per-role overrides through context', () => {
  it('parent roles + override roles both visible to child', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          roles: {
            radius: { btn: 'rounded-full' },
          },
        }}
      >
        <DesignOverride
          override={{
            roles: { radius: { card: 'rounded-2xl' } },
          }}
        >
          <RoleProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('role-probe')
    // Parent's btn role preserved
    expect(probe.getAttribute('data-radius-btn')).toBe('rounded-full')
    // Override's card role added
    expect(probe.getAttribute('data-radius-card')).toBe('rounded-2xl')
  })

  it('override role value wins over parent for same role', () => {
    render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          roles: {
            radius: { btn: 'rounded-full', input: 'rounded-md' },
          },
        }}
      >
        <DesignOverride
          override={{
            roles: { radius: { btn: 'rounded-none' } },
          }}
        >
          <RoleProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )

    const probe = screen.getByTestId('role-probe')
    expect(probe.getAttribute('data-radius-btn')).toBe('rounded-none')
    // Parent's input role preserved
    expect(probe.getAttribute('data-radius-input')).toBe('rounded-md')
  })
})

// ─── DesignSystemProvider sets data attrs + CSS custom properties ─────────

describe('DesignSystemProvider renders data attrs and CSS custom properties', () => {
  it('sets data attributes for named-concept presets', () => {
    const html = renderToString(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, density: 'airy' }}>
        <div data-testid="child">x</div>
      </DesignSystemProvider>,
    )
    // Named preset → data attribute
    expect(html).toContain('data-density="airy"')
  })

  it('sets inline CSS custom properties for Tailwind class values', () => {
    const html = renderToString(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}
      >
        <div>x</div>
      </DesignSystemProvider>,
    )
    // Tailwind class → single global CSS custom property
    // rounded-xl = 0.75rem
    expect(html).toContain('--d-radius')
    expect(html).toContain('0.75rem')
  })

  it('sets inline CSS custom properties for arbitrary bracket values', () => {
    const html = renderToString(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: '[13px]' }}>
        <div>x</div>
      </DesignSystemProvider>,
    )
    expect(html).toContain('--d-radius')
    expect(html).toContain('13px')
  })

  it('sets per-role override CSS custom properties', () => {
    const html = renderToString(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { btn: 'rounded-full' } },
        }}
      >
        <div>x</div>
      </DesignSystemProvider>,
    )
    // Per-role override → custom property for that role
    expect(html).toContain('--d-radius-btn')
    // rounded-full = 9999px
    expect(html).toContain('9999px')
  })

  it('does not set data attribute for Tailwind axis values', () => {
    const html = renderToString(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}
      >
        <div>x</div>
      </DesignSystemProvider>,
    )
    // Tailwind class is not a named preset → no data-radius attr
    expect(html).not.toContain('data-radius="rounded-xl"')
  })
})
