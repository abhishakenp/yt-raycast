// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  DesignSystemProvider,
  DesignOverride,
  useDesignIntent,
  useDesignCompositional,
} from './design-context.tsx'
import {
  DEFAULT_DESIGN,
  resolveDesign,
  type DesignIntent,
} from './design-system.ts'

afterEach(() => {
  cleanup()
})

// ─── Fixtures ─────────────────────────────────────────────────────────────

// Named-concept axes use presets → data attributes
const NAMED_CONCEPTS: DesignIntent = {
  ...DEFAULT_DESIGN,
  gradient: 'vibrant',
  motion: 'lively',
  typography: 'editorial',
  density: 'airy',
}

// Tailwind axes use Tailwind classes → CSS custom properties
const TAILWIND_VALUES: DesignIntent = {
  ...DEFAULT_DESIGN,
  radius: 'rounded-xl',
  shadow: 'shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]',
}

const PER_ROLE: DesignIntent = {
  ...DEFAULT_DESIGN,
  radius: 'rounded-xl',
  roles: {
    radius: { btn: 'rounded-full' },
  },
}

let capturedIntent: DesignIntent | undefined
function IntentConsumer() {
  capturedIntent = useDesignIntent()
  return null
}

let capturedCompositional: { chrome?: string; decor?: string } | undefined
function CompositionalConsumer() {
  capturedCompositional = useDesignCompositional()
  return null
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('DesignSystemProvider — data attributes for named-concept presets', () => {
  it('sets data-gradient attribute for named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-gradient')).toBe('vibrant')
  })

  it('sets data-motion attribute for named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-motion')).toBe('lively')
  })

  it('sets data-typography attribute for named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-typography')).toBe('editorial')
  })

  it('sets data-density attribute for named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-density')).toBe('airy')
  })

  it('sets all named-concept data attributes simultaneously', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-gradient')).toBe('vibrant')
    expect(wrapper?.getAttribute('data-motion')).toBe('lively')
    expect(wrapper?.getAttribute('data-typography')).toBe('editorial')
    expect(wrapper?.getAttribute('data-density')).toBe('airy')
  })
})

describe('DesignSystemProvider — no data attributes for Tailwind axes', () => {
  it('does NOT set data-radius for rounded-xl (Tailwind class)', () => {
    const { container } = render(
      <DesignSystemProvider intent={TAILWIND_VALUES}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-radius')).toBeNull()
  })

  it('does NOT set data-shadow for Tailwind shadow class', () => {
    const { container } = render(
      <DesignSystemProvider intent={TAILWIND_VALUES}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-shadow')).toBeNull()
  })
})

describe('DesignSystemProvider — inline CSS custom properties for Tailwind axes', () => {
  it('sets --d-radius global custom property for Tailwind class value', () => {
    const { container } = render(
      <DesignSystemProvider intent={TAILWIND_VALUES}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // rounded-xl → 0.75rem, single global var
    expect(style).toMatch(/--d-radius:\s*0\.75rem/)
  })

  it('sets --d-shadow global custom property for arbitrary bracket value', () => {
    const { container } = render(
      <DesignSystemProvider intent={TAILWIND_VALUES}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] → extract inner value
    expect(style).toMatch(/--d-shadow:\s*4px 4px 0 0 rgba\(0,0,0,0\.1\)/)
  })

  it('does NOT set per-role vars for global Tailwind value (CSS harmonizes)', () => {
    const { container } = render(
      <DesignSystemProvider intent={TAILWIND_VALUES}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // Global value sets --d-radius, NOT --d-radius-btn etc.
    expect(style).not.toMatch(/--d-radius-btn/)
    expect(style).not.toMatch(/--d-radius-card/)
  })

  it('does NOT set custom properties for named-concept presets', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // Named presets are handled by CSS file via data attributes
    expect(style).not.toMatch(/--d-density/)
    expect(style).not.toMatch(/--d-typography/)
  })
})

describe('DesignSystemProvider — per-role overrides', () => {
  it('sets --d-{axis}-{role} custom property for per-role override', () => {
    const { container } = render(
      <DesignSystemProvider intent={PER_ROLE}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // roles.radius.btn = 'rounded-full' → 9999px
    expect(style).toMatch(/--d-radius-btn:\s*9999px/)
  })

  it('per-role override does not affect other roles on same axis', () => {
    const { container } = render(
      <DesignSystemProvider intent={PER_ROLE}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // card role should NOT get the btn override value
    expect(style).not.toMatch(/--d-radius-card:\s*9999px/)
  })

  it('per-role override coexists with global CSS var', () => {
    const { container } = render(
      <DesignSystemProvider intent={PER_ROLE}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild
    const style = wrapper?.getAttribute('style') ?? ''
    // Global radius → --d-radius
    expect(style).toMatch(/--d-radius:\s*0\.75rem/)
    // Per-role btn override → --d-radius-btn
    expect(style).toMatch(/--d-radius-btn:\s*9999px/)
  })
})

describe('useDesignIntent()', () => {
  it('returns the raw intent passed to provider', () => {
    render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <IntentConsumer />
      </DesignSystemProvider>,
    )
    expect(capturedIntent).toEqual(NAMED_CONCEPTS)
  })

  it('returns intent with per-role overrides', () => {
    render(
      <DesignSystemProvider intent={PER_ROLE}>
        <IntentConsumer />
      </DesignSystemProvider>,
    )
    expect(capturedIntent?.roles).toEqual({ radius: { btn: 'rounded-full' } })
  })
})

describe('useDesignCompositional()', () => {
  it('returns chrome and decor from intent', () => {
    const intent: DesignIntent = {
      ...DEFAULT_DESIGN,
      chrome: 'brutalist',
      decor: 'dot-grid',
    }
    render(
      <DesignSystemProvider intent={intent}>
        <CompositionalConsumer />
      </DesignSystemProvider>,
    )
    expect(capturedCompositional).toEqual({ chrome: 'brutalist', decor: 'dot-grid' })
  })

  it('returns undefined for unset chrome/decor', () => {
    render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <CompositionalConsumer />
      </DesignSystemProvider>,
    )
    expect(capturedCompositional).toEqual({ chrome: undefined, decor: undefined })
  })
})

describe('DesignOverride — cascade merging', () => {
  it('merges override onto parent intent', () => {
    render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <IntentConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Override should change radius, keep other axes from parent
    expect(capturedIntent?.radius).toBe('rounded-full')
    expect(capturedIntent?.gradient).toBe('vibrant')
    expect(capturedIntent?.motion).toBe('lively')
  })

  it('nested override sets CSS var for overridden Tailwind axis', () => {
    const { container } = render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <div>nested</div>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // The nested wrapper should have --d-radius: 9999px
    // Find the innermost wrapper with --d-radius (the override wrapper)
    const wrappers = container.querySelectorAll('[style*="--d-radius"]')
    expect(wrappers.length).toBeGreaterThanOrEqual(1)
    const nestedStyle = wrappers[wrappers.length - 1]?.getAttribute('style') ?? ''
    expect(nestedStyle).toMatch(/--d-radius:\s*9999px/)
  })

  it('merges per-role overrides from parent and child', () => {
    const parentIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: { radius: { btn: 'rounded-full' } },
    }
    render(
      <DesignSystemProvider intent={parentIntent}>
        <DesignOverride
          override={{
            roles: { radius: { card: 'rounded-2xl' } },
          }}
        >
          <IntentConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Both parent and child role overrides should be present
    expect(capturedIntent?.roles?.radius?.btn).toBe('rounded-full')
    expect(capturedIntent?.roles?.radius?.card).toBe('rounded-2xl')
  })

  it('child override wins for same role on same axis', () => {
    const parentIntent: DesignIntent = {
      ...DEFAULT_DESIGN,
      roles: { radius: { btn: 'rounded-full' } },
    }
    render(
      <DesignSystemProvider intent={parentIntent}>
        <DesignOverride
          override={{
            roles: { radius: { btn: 'rounded-lg' } },
          }}
        >
          <IntentConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    expect(capturedIntent?.roles?.radius?.btn).toBe('rounded-lg')
  })

  it('unspecified axes inherit from parent', () => {
    render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <DesignOverride override={{ motion: 'none' }}>
          <IntentConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Only motion overridden
    expect(capturedIntent?.motion).toBe('none')
    // gradient inherited from parent
    expect(capturedIntent?.gradient).toBe('vibrant')
  })
})

describe('resolveDesign() — deprecated, returns empty', () => {
  it('returns empty classes object', () => {
    const classes = resolveDesign(NAMED_CONCEPTS)
    expect(classes.radius).toEqual({})
    expect(classes.shadow).toEqual({})
    expect(classes.gradient).toEqual({})
    expect(classes.motion).toEqual({})
  })
})
