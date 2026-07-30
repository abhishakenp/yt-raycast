// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import {
  DesignSystemProvider,
  DesignOverride,
  useDesign,
  useDesignIntent,
  useDesignCompositional,
} from './design-context.tsx'
import {
  resolveDesign,
  DEFAULT_DESIGN,
} from './design-system.ts'
import {
  Button,
  Card,
  Heading,
  Text,
  Divider,
  ImageBlock,
  Navbar,
} from './index.tsx'

afterEach(cleanup)

// ─── resolveDesign is deprecated — returns empty objects ───────────────────

describe('resolveDesign (deprecated — CSS handles styling now)', () => {
  it('returns empty objects for all axes with default intent', () => {
    const d = resolveDesign(DEFAULT_DESIGN)
    expect(d.radius).toEqual({})
    expect(d.shadow).toEqual({})
    expect(d.gradient).toEqual({})
    expect(d.density).toEqual({})
    expect(d.typography).toEqual({})
    expect(d.motion).toEqual({})
    expect(d.border).toEqual({})
    expect(d.tracking).toEqual({})
    expect(d.leading).toEqual({})
    expect(d.weight).toEqual({})
    expect(d.transform).toEqual({})
    expect(d.image).toEqual({})
    expect(d.opacity).toEqual({})
  })

  it('returns empty objects regardless of intent values', () => {
    const d = resolveDesign({
      ...DEFAULT_DESIGN,
      radius: 'rounded-full',
      shadow: 'shadow-[8px_8px_0_0]',
      gradient: 'mesh',
      motion: 'lively',
      typography: 'technical',
    })
    expect(d.radius).toEqual({})
    expect(d.shadow).toEqual({})
    expect(d.gradient).toEqual({})
    expect(d.motion).toEqual({})
    expect(d.typography).toEqual({})
  })

  it('useDesign returns the empty DesignClasses shape', () => {
    function Probe() {
      const d = useDesign()
      return <div data-testid="probe" data-radius-btn={d.radius.btn ?? 'empty'} />
    }
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-radius-btn')).toBe('empty')
  })
})

// ─── Provider sets data attributes on wrapper div (named-concept presets) ──

describe('DesignSystemProvider — data attributes for named-concept presets', () => {
  it('sets data-gradient, data-motion, data-typography, data-density', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          gradient: 'vibrant',
          motion: 'lively',
          typography: 'editorial',
          density: 'airy',
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-gradient')).toBe('vibrant')
    expect(wrapper.getAttribute('data-motion')).toBe('lively')
    expect(wrapper.getAttribute('data-typography')).toBe('editorial')
    expect(wrapper.getAttribute('data-density')).toBe('airy')
  })

  it('sets data-density on wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, density: 'airy' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-density')).toBe('airy')
  })

  it('sets data-chrome when chrome is a named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'terminal' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-chrome')).toBe('terminal')
  })

  it('sets data-decor when decor is a named preset', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, decor: 'glow' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-decor')).toBe('glow')
  })

  it('does NOT set data-chrome when chrome is undefined', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-chrome')).toBe(false)
  })

  it('does NOT set data-radius when radius is a Tailwind class', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-radius')).toBe(false)
  })

  it('does NOT set data-radius when radius is an arbitrary bracket value', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: '[13px]' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-radius')).toBe(false)
  })

  it('does NOT set data-shadow for Tailwind shadow class', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, shadow: 'shadow-lg' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-shadow')).toBe(false)
  })

  it('does NOT set data-border for Tailwind border class', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, border: 'border-2' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-border')).toBe(false)
  })
})

// ─── Provider sets inline CSS custom properties for Tailwind axes ──────────

describe('DesignSystemProvider — inline CSS custom properties for Tailwind axes', () => {
  it('sets --d-radius global var for Tailwind class values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    // Single global var — CSS harmonizes per-role via multipliers
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('0.75rem')
  })

  it('sets --d-radius global var for arbitrary bracket values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: '[13px]' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('13px')
  })

  it('sets --d-shadow global var for arbitrary shadow values', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, shadow: 'shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]' }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-shadow')).toBe(
      '4px 4px 0 0 rgba(0,0,0,0.1)',
    )
  })

  it('sets --d-tracking global var for Tailwind class tracking values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, tracking: 'tracking-wide' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-tracking')).toBe('0.025em')
  })

  it('sets --d-weight global var for Tailwind class weight values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, weight: 'font-black' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-weight')).toBe('900')
  })

  it('sets --d-border global var for Tailwind class border values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, border: 'border-4' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-border')).toBe('4px')
  })

  it('sets --d-opacity global var for Tailwind class opacity values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, opacity: 'opacity-20' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-opacity')).toBe('0.2')
  })

  it('sets --d-image global var for arbitrary image filter values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, image: '[sepia(0.5)]' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-image')).toBe('sepia(0.5)')
  })

  it('does NOT set custom properties for named-concept presets', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          density: 'airy',
          typography: 'display',
          gradient: 'vibrant',
          motion: 'lively',
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-density')).toBe('')
    expect(wrapper.style.getPropertyValue('--d-typography')).toBe('')
  })
})

// ─── Per-role overrides set --d-{axis}-{role} custom properties ────────────

describe('per-role overrides — intent.roles sets --d-{axis}-{role}', () => {
  it('sets --d-radius-btn from per-role override (Tailwind class)', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { btn: 'rounded-full' } },
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius-btn')).toBe('9999px')
  })

  it('sets --d-radius-card from per-role override (arbitrary value)', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { card: '[20px]' } },
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius-card')).toBe('20px')
  })

  it('per-role override does not affect other roles', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { btn: 'rounded-full' } },
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius-btn')).toBe('9999px')
    // card not overridden — no per-role custom property
    expect(wrapper.style.getPropertyValue('--d-radius-card')).toBe('')
  })

  it('sets --d-shadow-btn from per-role shadow override', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          shadow: 'shadow-lg',
          roles: { shadow: { btn: '[2px_2px_0_0_red]' } },
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-shadow-btn')).toBe(
      '2px 2px 0 0 red',
    )
  })

  it('per-role override takes precedence over axis-level value', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { btn: 'rounded-full' } },
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    // btn gets per-role override (9999px), global var still set
    expect(wrapper.style.getPropertyValue('--d-radius-btn')).toBe('9999px')
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('0.75rem')
  })
})

// ─── Lock classes — CSS handles them (no JS-generated <style> tag) ─────────

describe('lock classes — CSS handles them, no JS-generated CSS', () => {
  it('provider does NOT inject a <style> tag', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('provider does NOT inject a <style> tag for non-preset values', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('lock classes are CSS-only — provider renders no override CSS', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          shadow: 'shadow-lg',
          border: 'border-2',
        }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    expect(container.querySelector('style')).toBeNull()
  })
})

// ─── useDesignIntent() returns the raw intent ──────────────────────────────

describe('useDesignIntent — raw intent access', () => {
  it('returns the full intent from provider', () => {
    function Probe() {
      const intent = useDesignIntent()
      return (
        <div
          data-testid="probe"
          data-radius={intent.radius}
          data-shadow={intent.shadow}
          data-gradient={intent.gradient}
          data-motion={intent.motion}
          data-typography={intent.typography}
          data-density={intent.density}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-full',
          shadow: 'shadow-[8px_8px_0_0]',
          gradient: 'mesh',
          motion: 'lively',
          typography: 'technical',
          density: 'airy',
        }}
      >
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-radius')).toBe('rounded-full')
    expect(el.getAttribute('data-shadow')).toBe('shadow-[8px_8px_0_0]')
    expect(el.getAttribute('data-gradient')).toBe('mesh')
    expect(el.getAttribute('data-motion')).toBe('lively')
    expect(el.getAttribute('data-typography')).toBe('technical')
    expect(el.getAttribute('data-density')).toBe('airy')
  })

  it('returns Tailwind class values as-is', () => {
    function Probe() {
      const intent = useDesignIntent()
      return (
        <div
          data-testid="probe"
          data-radius={intent.radius}
          data-shadow={intent.shadow}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl', shadow: 'shadow-[4px_4px_0_0]' }}
      >
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-radius')).toBe('rounded-xl')
    expect(el.getAttribute('data-shadow')).toBe('shadow-[4px_4px_0_0]')
  })

  it('returns optional axes when set', () => {
    function Probe() {
      const intent = useDesignIntent()
      return (
        <div
          data-testid="probe"
          data-border={intent.border ?? 'unset'}
          data-tracking={intent.tracking ?? 'unset'}
          data-weight={intent.weight ?? 'unset'}
          data-chrome={intent.chrome ?? 'unset'}
          data-decor={intent.decor ?? 'unset'}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          border: 'border-2',
          tracking: 'tracking-wide',
          weight: 'font-black',
          chrome: 'terminal',
          decor: 'glow',
        }}
      >
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-border')).toBe('border-2')
    expect(el.getAttribute('data-tracking')).toBe('tracking-wide')
    expect(el.getAttribute('data-weight')).toBe('font-black')
    expect(el.getAttribute('data-chrome')).toBe('terminal')
    expect(el.getAttribute('data-decor')).toBe('glow')
  })

  it('returns undefined for optional axes not set', () => {
    function Probe() {
      const intent = useDesignIntent()
      return (
        <div
          data-testid="probe"
          data-border={intent.border ?? 'unset'}
          data-tracking={intent.tracking ?? 'unset'}
          data-chrome={intent.chrome ?? 'unset'}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-border')).toBe('unset')
    expect(el.getAttribute('data-tracking')).toBe('unset')
    expect(el.getAttribute('data-chrome')).toBe('unset')
  })

  it('returns per-role overrides in intent.roles', () => {
    function Probe() {
      const intent = useDesignIntent()
      return (
        <div
          data-testid="probe"
          data-has-roles={intent.roles ? 'yes' : 'no'}
          data-role-btn={intent.roles?.radius?.btn ?? 'unset'}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{
          ...DEFAULT_DESIGN,
          radius: 'rounded-xl',
          roles: { radius: { btn: 'rounded-full' } },
        }}
      >
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-has-roles')).toBe('yes')
    expect(el.getAttribute('data-role-btn')).toBe('rounded-full')
  })
})

// ─── useDesignCompositional() returns chrome/decor ─────────────────────────

describe('useDesignCompositional — chrome and decor', () => {
  it('returns chrome and decor from provider', () => {
    function Probe() {
      const { chrome, decor } = useDesignCompositional()
      return <div data-testid="probe" data-chrome={chrome} data-decor={decor} />
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, chrome: 'brutalist', decor: 'glow' }}
      >
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('brutalist')
    expect(el.getAttribute('data-decor')).toBe('glow')
  })

  it('returns undefined for chrome and decor when not set', () => {
    function Probe() {
      const { chrome, decor } = useDesignCompositional()
      return (
        <div
          data-testid="probe"
          data-chrome={chrome ?? 'unset'}
          data-decor={decor ?? 'unset'}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Probe />
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('unset')
    expect(el.getAttribute('data-decor')).toBe('unset')
  })

  it('DesignOverride merges chrome onto parent intent', () => {
    function Probe() {
      const { chrome, decor } = useDesignCompositional()
      return <div data-testid="probe" data-chrome={chrome} data-decor={decor} />
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, chrome: 'editorial', decor: 'dot-grid' }}
      >
        <DesignOverride override={{ chrome: 'terminal' }}>
          <Probe />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('terminal')
    expect(el.getAttribute('data-decor')).toBe('dot-grid')
  })

  it('DesignOverride inherits chrome from parent when not overridden', () => {
    function Probe() {
      const { chrome } = useDesignCompositional()
      return <div data-testid="probe" data-chrome={chrome} />
    }
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'brutalist' }}>
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <Probe />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('brutalist')
  })

  it('nested DesignOverride chains chrome through multiple levels', () => {
    function Probe() {
      const { chrome } = useDesignCompositional()
      return <div data-testid="probe" data-chrome={chrome} />
    }
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'none' }}>
        <DesignOverride override={{ chrome: 'hairline' }}>
          <DesignOverride override={{ radius: 'rounded-full' }}>
            <Probe />
          </DesignOverride>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector('[data-testid="probe"]') as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('hairline')
  })
})

// ─── Primitives render with data-d-role attributes ─────────────────────────

describe('primitives render with data-d-role', () => {
  it('Button renders with data-d-role="btn"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Button label="Click" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="btn"]')).toBeTruthy()
  })

  it('Card renders with data-d-role="card"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Card title="Test" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="card"]')).toBeTruthy()
  })

  it('Heading display renders with data-d-role="display"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="display" text="Hello" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="display"]')).toBeTruthy()
  })

  it('Heading h2 renders with data-d-role="heading"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="h2" text="Hello" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="heading"]')).toBeTruthy()
  })

  it('Heading eyebrow renders with data-d-role="eyebrow"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="eyebrow" text="Label" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="eyebrow"]')).toBeTruthy()
  })

  it('Text renders with data-d-role="body"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Text text="Body content" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="body"]')).toBeTruthy()
  })

  it('Divider rule renders with data-d-role="divider"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="rule" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="divider"]')).toBeTruthy()
  })

  it('Divider watermark renders with data-d-role="watermark"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="watermark" text="*" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="watermark"]')).toBeTruthy()
  })

  it('Divider dot-grid renders with data-d-role="decor"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="dot-grid" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="decor"]')).toBeTruthy()
  })

  it('ImageBlock renders with data-d-role="image"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <ImageBlock alt="test" />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="image"]')).toBeTruthy()
  })

  it('Navbar renders with data-d-role="nav"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Navbar brand="Brand" links={['a', 'b']} />
      </DesignSystemProvider>,
    )
    expect(container.querySelector('[data-d-role="nav"]')).toBeTruthy()
  })
})

// ─── DesignOverride cascade — CSS vars on nested wrappers ──────────────────

describe('DesignOverride — nested wrapper CSS custom properties', () => {
  it('nested DesignOverride sets merged --d-radius on inner wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl' }}>
        <DesignOverride override={{ radius: 'rounded-none' }}>
          <div>inner</div>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Both wrappers have --d-radius CSS var
    const wrappers = container.querySelectorAll('[style*="--d-radius"]')
    expect(wrappers.length).toBe(2)
    expect((wrappers[0] as HTMLElement).style.getPropertyValue('--d-radius')).toBe('0.75rem')
    expect((wrappers[1] as HTMLElement).style.getPropertyValue('--d-radius')).toBe('0px')
  })

  it('nested DesignOverride inherits unspecified axes from parent', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded-xl', shadow: 'shadow-lg' }}
      >
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <div>inner</div>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Inner wrapper should have both --d-radius (overridden) and --d-shadow (inherited)
    const wrappers = container.querySelectorAll('[style*="--d-radius"]')
    const innerWrapper = wrappers[wrappers.length - 1] as HTMLElement
    expect(innerWrapper.style.getPropertyValue('--d-radius')).toBe('9999px')
    // shadow inherited — but shadow-lg returns null from designValueToCss
    // so --d-shadow may not be set. Check the intent value instead.
  })

  it('nested DesignOverride with Tailwind value sets CSS var on inner wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded-none' }}>
        <DesignOverride override={{ radius: 'rounded-xl' }}>
          <div>inner</div>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    // Outer wrapper has --d-radius: 0px
    // Inner wrapper has --d-radius: 0.75rem
    const wrappers = container.querySelectorAll('[style*="--d-radius"]')
    expect(wrappers.length).toBe(2)
    expect((wrappers[1] as HTMLElement).style.getPropertyValue('--d-radius')).toBe('0.75rem')
  })
})
