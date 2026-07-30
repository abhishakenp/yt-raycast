// @vitest-environment jsdom
/**
 * Behavioral tests for the @design system's CSS-driven architecture.
 *
 * The new system:
 * - CSS handles all styling via design-presets.css using [data-d-role] attrs
 *   and [data-axis="preset"] selectors on the provider wrapper.
 * - resolveDesign() returns empty objects (deprecated) — no more d.*.* strings.
 * - DesignSystemProvider sets data attrs on its wrapper div for named-concept
 *   presets (density, typography, gradient, motion) and inline CSS custom
 *   properties for Tailwind axes (radius, shadow, etc.).
 * - Components use data-d-role="btn" etc. attributes, no d.*.* class reads.
 * - Lock classes (d-radius-lock etc.) opt out of CSS overrides at the CSS level
 *   (design-presets.css uses :not(.d-*-lock) selectors); the provider does not
 *   need to know about them.
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DesignSystemProvider,
  DesignOverride,
  useDesign,
  useDesignIntent,
} from './design-context.tsx'
import {
  DEFAULT_DESIGN,
  resolveDesign,
  type DesignIntent,
} from './design-system.ts'
import {
  Button,
  Card,
  Container,
  Divider,
  Heading,
  ImageBlock,
  List,
  Navbar,
  Section,
  Stat,
  Text,
} from './index.tsx'

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
  roles: { radius: { btn: 'rounded-full' } },
}

function renderWithDesign(intent: DesignIntent, ui: React.ReactElement) {
  return render(<DesignSystemProvider intent={intent}>{ui}</DesignSystemProvider>)
}

/** Probe that exposes useDesign()/useDesignIntent() to the DOM. */
function ContextProbe() {
  const classes = useDesign()
  const intent = useDesignIntent()
  return (
    <div
      data-testid="probe"
      data-radius={intent.radius}
      data-shadow={intent.shadow}
      data-classes-radius={JSON.stringify(classes.radius)}
      data-classes-shadow={JSON.stringify(classes.shadow)}
    >
      probe
    </div>
  )
}

// ─── 1. Primitives render correct data-d-role attributes ──────────────────

describe('primitives render data-d-role attributes', () => {
  it('Button renders data-d-role="btn"', () => {
    const { container } = render(<Button label="Click me" />)
    const btn = container.querySelector('[data-d-role="btn"]')
    expect(btn).toBeTruthy()
    expect(btn?.tagName).toBe('BUTTON')
  })

  it('Button as link renders data-d-role="btn" on an <a>', () => {
    const { container } = render(<Button label="Go" href="/somewhere" />)
    const link = container.querySelector('[data-d-role="btn"]')
    expect(link).toBeTruthy()
    expect(link?.tagName).toBe('A')
  })

  it('Card renders data-d-role="card" on its root', () => {
    const { container } = render(<Card title="Title" description="Desc" />)
    const card = container.querySelector('[data-d-role="card"]')
    expect(card).toBeTruthy()
    expect(card?.getAttribute('data-d-role')).toBe('card')
  })

  it('Heading display renders data-d-role="display" on an h1', () => {
    const { container } = render(<Heading level="display" text="Big" />)
    const heading = container.querySelector('[data-d-role="display"]')
    expect(heading).toBeTruthy()
    expect(heading?.tagName).toBe('H1')
  })

  it('Heading h2 renders data-d-role="heading" on an h2', () => {
    const { container } = render(<Heading level="h2" text="Section" />)
    const heading = container.querySelector('[data-d-role="heading"]')
    expect(heading).toBeTruthy()
    expect(heading?.tagName).toBe('H2')
  })

  it('Heading eyebrow renders data-d-role="eyebrow" on a span', () => {
    const { container } = render(<Heading level="eyebrow" text="Label" />)
    const heading = container.querySelector('[data-d-role="eyebrow"]')
    expect(heading).toBeTruthy()
    expect(heading?.tagName).toBe('SPAN')
  })

  it('Text renders data-d-role="body" on a <p>', () => {
    const { container } = render(<Text text="Body copy" />)
    const text = container.querySelector('[data-d-role="body"]')
    expect(text).toBeTruthy()
    expect(text?.tagName).toBe('P')
  })

  it('Container renders data-d-role="container"', () => {
    const { container } = render(<Container>inside</Container>)
    const el = container.querySelector('[data-d-role="container"]')
    expect(el).toBeTruthy()
    expect(el?.getAttribute('data-d-role')).toBe('container')
  })

  it('Section renders data-d-role="section" on a <section>', () => {
    const { container } = render(<Section>section body</Section>)
    const el = container.querySelector('[data-d-role="section"]')
    expect(el).toBeTruthy()
    expect(el?.tagName).toBe('SECTION')
  })

  it('Stat renders data-d-role="card" on root, stat-value + eyebrow inside', () => {
    const { container } = render(<Stat value="99%" label="uptime" />)
    const value = container.querySelector('[data-d-role="stat-value"]')
    expect(value).toBeTruthy()
    expect(value?.textContent).toBe('99%')
    const label = container.querySelector('[data-d-role="eyebrow"]')
    expect(label).toBeTruthy()
    expect(label?.textContent).toBe('uptime')
    const root = container.querySelector('[data-d-role="card"]')
    expect(root).toBeTruthy()
  })

  it('List renders data-d-role="list" with card items', () => {
    const { container } = render(<List items={[{ title: 'Item A' }]} />)
    const list = container.querySelector('[data-d-role="list"]')
    expect(list).toBeTruthy()
    expect(list?.tagName).toBe('UL')
    const item = container.querySelector('[data-d-role="card"]')
    expect(item).toBeTruthy()
  })

  it('Divider rule renders data-d-role="divider"', () => {
    const { container } = render(<Divider variant="rule" text="Section break" />)
    const el = container.querySelector('[data-d-role="divider"]')
    expect(el).toBeTruthy()
    expect(el?.getAttribute('data-d-role')).toBe('divider')
  })

  it('ImageBlock renders data-d-role="image"', () => {
    const { container } = render(<ImageBlock alt="pic" src="/x.png" />)
    const img = container.querySelector('[data-d-role="image"]')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('data-d-role')).toBe('image')
  })

  it('Navbar renders data-d-role="nav" with link roles', () => {
    const { container } = render(<Navbar brand="Brand" links={['Home', 'About']} />)
    const nav = container.querySelector('[data-d-role="nav"]')
    expect(nav).toBeTruthy()
    expect(nav?.tagName).toBe('NAV')
    const link = container.querySelector('[data-d-role="link"]')
    expect(link).toBeTruthy()
    expect(link?.textContent).toBe('Home')
  })
})

// ─── 2. DesignSystemProvider sets data attributes for named-concept presets

describe('DesignSystemProvider data attributes for named-concept presets', () => {
  it('sets data-gradient for a named preset', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    expect(container.firstElementChild?.getAttribute('data-gradient')).toBe('vibrant')
  })

  it('sets data-typography for a named preset', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    expect(container.firstElementChild?.getAttribute('data-typography')).toBe('editorial')
  })

  it('sets data-motion for a named preset', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    expect(container.firstElementChild?.getAttribute('data-motion')).toBe('lively')
  })

  it('sets data-density for a named preset', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    expect(container.firstElementChild?.getAttribute('data-density')).toBe('airy')
  })

  it('sets multiple data attributes at once', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-gradient')).toBe('vibrant')
    expect(wrapper?.getAttribute('data-typography')).toBe('editorial')
    expect(wrapper?.getAttribute('data-motion')).toBe('lively')
    expect(wrapper?.getAttribute('data-density')).toBe('airy')
  })

  it('wraps children in a div (not a fragment)', () => {
    const { container } = renderWithDesign(
      { ...DEFAULT_DESIGN, density: 'airy' },
      <span data-testid="child">child</span>,
    )
    const child = screen.getByTestId('child')
    const wrapper = child.parentElement
    expect(wrapper).toBeTruthy()
    expect(wrapper?.getAttribute('data-density')).toBe('airy')
  })
})

// ─── 3. DesignSystemProvider inline CSS custom properties ─────────────────

describe('DesignSystemProvider inline CSS custom properties for Tailwind axes', () => {
  it('emits --d-radius global var for a Tailwind radius class', () => {
    const { container } = renderWithDesign(TAILWIND_VALUES, <div>test</div>)
    const style = container.firstElementChild?.getAttribute('style') ?? ''
    // rounded-xl → 0.75rem, single global var
    expect(style).toMatch(/--d-radius:\s*0\.75rem/)
  })

  it('emits --d-shadow global var for an arbitrary bracket value', () => {
    const { container } = renderWithDesign(TAILWIND_VALUES, <div>test</div>)
    const style = container.firstElementChild?.getAttribute('style') ?? ''
    // shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] → extract inner value
    expect(style).toMatch(/--d-shadow:\s*4px 4px 0 0 rgba\(0,0,0,0\.1\)/)
  })

  it('does NOT emit data attributes for Tailwind axis values', () => {
    const { container } = renderWithDesign(TAILWIND_VALUES, <div>test</div>)
    expect(container.firstElementChild?.getAttribute('data-radius')).toBeNull()
    expect(container.firstElementChild?.getAttribute('data-shadow')).toBeNull()
  })

  it('does NOT emit inline custom properties for named-concept presets', () => {
    const { container } = renderWithDesign(NAMED_CONCEPTS, <div>test</div>)
    const style = container.firstElementChild?.getAttribute('style') ?? ''
    expect(style).not.toContain('--d-density')
    expect(style).not.toContain('--d-typography')
  })

  it('emits per-role override custom properties from intent.roles', () => {
    const { container } = renderWithDesign(PER_ROLE, <div>test</div>)
    const style = container.firstElementChild?.getAttribute('style') ?? ''
    // roles.radius.btn = 'rounded-full' → 9999px
    expect(style).toMatch(/--d-radius-btn:\s*9999px/)
  })

  it('per-role override does not affect other roles on the same axis', () => {
    const { container } = renderWithDesign(PER_ROLE, <div>test</div>)
    const style = container.firstElementChild?.getAttribute('style') ?? ''
    expect(style).not.toMatch(/--d-radius-card:\s*9999px/)
  })
})

// ─── 4. useDesign() returns empty classes (backward compat) ───────────────

describe('useDesign() returns empty classes (deprecated, backward compat)', () => {
  it('returns empty objects for every axis via context', () => {
    renderWithDesign(NAMED_CONCEPTS, <ContextProbe />)
    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-classes-radius')).toBe('{}')
    expect(probe.getAttribute('data-classes-shadow')).toBe('{}')
  })

  it('resolveDesign() returns an empty shape regardless of intent', () => {
    const classes = resolveDesign(NAMED_CONCEPTS)
    expect(classes.radius).toEqual({})
    expect(classes.shadow).toEqual({})
    expect(classes.gradient).toEqual({})
    expect(classes.motion).toEqual({})
    // No d.*.* class strings anywhere — every axis map is empty
    for (const axis of Object.values(classes)) {
      expect(Object.keys(axis)).toHaveLength(0)
    }
  })
})

// ─── 5. useDesignIntent() returns the raw intent ──────────────────────────

describe('useDesignIntent() returns the raw intent', () => {
  it('exposes the intent passed to the provider', () => {
    renderWithDesign(NAMED_CONCEPTS, <ContextProbe />)
    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('rounded-none')
    expect(probe.getAttribute('data-shadow')).toBe('shadow-[4px_4px_0_0]')
  })

  it('DesignOverride merges intent onto the parent context (cascade)', () => {
    render(
      <DesignSystemProvider intent={NAMED_CONCEPTS}>
        <DesignOverride override={{ radius: 'rounded-full' }}>
          <ContextProbe />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const probe = screen.getByTestId('probe')
    expect(probe.getAttribute('data-radius')).toBe('rounded-full')
    // gradient inherited from parent
    expect(probe.getAttribute('data-shadow')).toBe('shadow-[4px_4px_0_0]')
  })
})

// ─── 6. Lock classes opt out of CSS overrides (CSS-level) ─────────────────

describe('lock classes opt out of CSS overrides (CSS-level)', () => {
  it('d-radius-lock class is preserved on the element DOM (CSS handles opt-out)', () => {
    renderWithDesign(NAMED_CONCEPTS, <div className="rounded-xl d-radius-lock">locked</div>)
    const el = screen.getByText('locked')
    // The lock class passes through to the DOM; the actual override exclusion
    // happens in design-presets.css via :not(.d-radius-lock) selectors.
    expect(el.className).toContain('d-radius-lock')
    expect(el.className).toContain('rounded-xl')
  })

  it('d-shadow-lock class is preserved on the element DOM', () => {
    renderWithDesign(NAMED_CONCEPTS, <div className="shadow-lg d-shadow-lock">locked</div>)
    const el = screen.getByText('locked')
    expect(el.className).toContain('d-shadow-lock')
  })

  it('d-gradient-lock class is preserved on the element DOM', () => {
    renderWithDesign(
      { ...DEFAULT_DESIGN, gradient: 'none' },
      <div className="bg-gradient-to-r d-gradient-lock">locked</div>,
    )
    const el = screen.getByText('locked')
    expect(el.className).toContain('d-gradient-lock')
  })

  it('lock classes do not affect provider data attributes or inline custom properties', () => {
    const { container } = renderWithDesign(
      NAMED_CONCEPTS,
      <div className="d-radius-lock">locked</div>,
    )
    // Provider still emits data-density for the preset; the lock only affects
    // CSS override rule matching in design-presets.css, not provider output.
    expect(container.firstElementChild?.getAttribute('data-density')).toBe('airy')
  })
})
