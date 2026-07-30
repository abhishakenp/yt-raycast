import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  DesignSystemProvider,
  DesignOverride,
  useDesignCompositional,
} from './design-context.tsx'
import {
  Button,
  Card,
  Heading,
  Text,
  Divider,
  ImageBlock,
  Navbar,
} from './index.tsx'
import { DEFAULT_DESIGN, type DesignIntent } from './design-system.ts'

// ─── Per-role CSS overrides ────────────────────────────────────────────────

describe('per-role CSS overrides', () => {
  it('generates per-role radius override rules with data-d-role selectors', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    // Per-role rules should target [data-d-role="btn"].rounded-*
    expect(css).toMatch(/\[data-d-role="btn"\]\.rounded/)
    expect(css).toMatch(/\[data-d-role="card"\]\.rounded/)
    expect(css).toMatch(/\[data-d-role="input"\]\.rounded/)
  })

  it('generates per-role shadow override rules', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, shadow: 'soft' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    expect(css).toMatch(/\[data-d-role="card"\]\.shadow/)
    expect(css).toMatch(/\[data-d-role="btn"\]\.shadow/)
  })

  it('generates per-role border override rules when border axis is set', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, border: 'medium' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    const wrapper = container.firstElementChild as HTMLElement
    expect(css).toMatch(/\[data-d-role="card"\]\.border/)
    expect(wrapper.style.getPropertyValue('--d-border-width')).toBe('2px')
  })

  it('does NOT generate border override rules when border axis is undefined', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    const wrapper = container.firstElementChild as HTMLElement
    expect(css).not.toMatch(/data-border/)
    expect(wrapper.style.getPropertyValue('--d-border-width')).toBe('')
  })

  it('generates per-role tracking override rules when tracking axis is set', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, tracking: 'wide' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    const wrapper = container.firstElementChild as HTMLElement
    expect(css).toMatch(/\[data-d-role="display"\]/)
    expect(wrapper.style.getPropertyValue('--d-tracking-display')).toBe(
      '0.025em',
    )
  })

  it('generates per-role weight override rules when weight axis is set', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, weight: 'black' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-weight-display')).toBe('900')
    expect(css).toMatch(/\[data-d-role="display"\]/)
  })

  it('generates per-role opacity override rules when opacity axis is set', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, opacity: 'ghost' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-opacity-decor')).toBe('0.2')
    expect(css).toMatch(/\[data-d-role="decor"\]/)
  })

  it('sets CSS custom properties on the provider wrapper', () => {
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, radius: 'rounded', border: 'bold' }}
      >
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius-btn')).toBe('0.75rem')
    expect(wrapper.style.getPropertyValue('--d-radius-card')).toBe('0.75rem')
    expect(wrapper.style.getPropertyValue('--d-border-width')).toBe('4px')
  })

  it('blanket fallback rules use :not([data-d-role]) qualifier', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, radius: 'rounded' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const css = container.querySelector('style')?.textContent ?? ''
    // Blanket fallback should not target tagged elements
    expect(css).toMatch(
      /\.rounded-lg:not\(\.d-radius-lock\):not\(\[data-d-role\]\)/,
    )
  })
})

// ─── Per-role CSS applied to rendered primitives ───────────────────────────

describe('primitives render with data-d-role', () => {
  it('Button renders with data-d-role="btn"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Button label="Click" />
      </DesignSystemProvider>,
    )
    const btn = container.querySelector('[data-d-role="btn"]')
    expect(btn).toBeTruthy()
  })

  it('Card renders with data-d-role="card"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Card title="Test" />
      </DesignSystemProvider>,
    )
    const card = container.querySelector('[data-d-role="card"]')
    expect(card).toBeTruthy()
  })

  it('Heading display renders with data-d-role="display"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="display" text="Hello" />
      </DesignSystemProvider>,
    )
    const display = container.querySelector('[data-d-role="display"]')
    expect(display).toBeTruthy()
  })

  it('Heading h2 renders with data-d-role="heading"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="h2" text="Hello" />
      </DesignSystemProvider>,
    )
    const heading = container.querySelector('[data-d-role="heading"]')
    expect(heading).toBeTruthy()
  })

  it('Heading eyebrow renders with data-d-role="eyebrow"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Heading level="eyebrow" text="Label" />
      </DesignSystemProvider>,
    )
    const eyebrow = container.querySelector('[data-d-role="eyebrow"]')
    expect(eyebrow).toBeTruthy()
  })

  it('Text renders with data-d-role="body"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Text text="Body content" />
      </DesignSystemProvider>,
    )
    const body = container.querySelector('[data-d-role="body"]')
    expect(body).toBeTruthy()
  })

  it('Divider rule renders with data-d-role="divider"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="rule" />
      </DesignSystemProvider>,
    )
    const divider = container.querySelector('[data-d-role="divider"]')
    expect(divider).toBeTruthy()
  })

  it('Divider watermark renders with data-d-role="watermark"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="watermark" text="*" />
      </DesignSystemProvider>,
    )
    const watermark = container.querySelector('[data-d-role="watermark"]')
    expect(watermark).toBeTruthy()
  })

  it('Divider dot-grid renders with data-d-role="decor"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Divider variant="dot-grid" />
      </DesignSystemProvider>,
    )
    const decor = container.querySelector('[data-d-role="decor"]')
    expect(decor).toBeTruthy()
  })

  it('ImageBlock renders with data-d-role="image"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <ImageBlock alt="test" />
      </DesignSystemProvider>,
    )
    const img = container.querySelector('[data-d-role="image"]')
    expect(img).toBeTruthy()
  })

  it('Navbar renders with data-d-role="nav"', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <Navbar brand="Brand" links={['a', 'b']} />
      </DesignSystemProvider>,
    )
    const nav = container.querySelector('[data-d-role="nav"]')
    expect(nav).toBeTruthy()
  })
})

// ─── Compositional cascade (chrome/decor inherit through context) ──────────

describe('compositional cascade — chrome/decor', () => {
  it('useDesignCompositional returns chrome from provider', () => {
    function TestConsumer() {
      const { chrome, decor } = useDesignCompositional()
      return (
        <div data-testid="consumer" data-chrome={chrome} data-decor={decor} />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, chrome: 'brutalist', decor: 'glow' }}
      >
        <TestConsumer />
      </DesignSystemProvider>,
    )
    const el = container.querySelector(
      '[data-testid="consumer"]',
    ) as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('brutalist')
    expect(el.getAttribute('data-decor')).toBe('glow')
  })

  it('useDesignCompositional returns undefined when axes not set', () => {
    function TestConsumer() {
      const { chrome, decor } = useDesignCompositional()
      return (
        <div
          data-testid="consumer"
          data-chrome={chrome ?? 'unset'}
          data-decor={decor ?? 'unset'}
        />
      )
    }
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <TestConsumer />
      </DesignSystemProvider>,
    )
    const el = container.querySelector(
      '[data-testid="consumer"]',
    ) as HTMLElement
    expect(el.getAttribute('data-chrome')).toBe('unset')
    expect(el.getAttribute('data-decor')).toBe('unset')
  })

  it('DesignOverride merges chrome onto parent intent', () => {
    function TestConsumer() {
      const { chrome, decor } = useDesignCompositional()
      return (
        <div data-testid="consumer" data-chrome={chrome} data-decor={decor} />
      )
    }
    const { container } = render(
      <DesignSystemProvider
        intent={{ ...DEFAULT_DESIGN, chrome: 'editorial', decor: 'dot-grid' }}
      >
        <DesignOverride override={{ chrome: 'terminal' }}>
          <TestConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector(
      '[data-testid="consumer"]',
    ) as HTMLElement
    // chrome overridden
    expect(el.getAttribute('data-chrome')).toBe('terminal')
    // decor inherited from parent
    expect(el.getAttribute('data-decor')).toBe('dot-grid')
  })

  it('DesignOverride inherits chrome from parent when not overridden', () => {
    function TestConsumer() {
      const { chrome } = useDesignCompositional()
      return <div data-testid="consumer" data-chrome={chrome} />
    }
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'brutalist' }}>
        <DesignOverride override={{ radius: 'pill' }}>
          <TestConsumer />
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector(
      '[data-testid="consumer"]',
    ) as HTMLElement
    // chrome inherited from parent even though override only set radius
    expect(el.getAttribute('data-chrome')).toBe('brutalist')
  })

  it('nested DesignOverride chains chrome through multiple levels', () => {
    function TestConsumer() {
      const { chrome } = useDesignCompositional()
      return <div data-testid="consumer" data-chrome={chrome} />
    }
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'none' }}>
        <DesignOverride override={{ chrome: 'hairline' }}>
          <DesignOverride override={{ radius: 'pill' }}>
            <TestConsumer />
          </DesignOverride>
        </DesignOverride>
      </DesignSystemProvider>,
    )
    const el = container.querySelector(
      '[data-testid="consumer"]',
    ) as HTMLElement
    // chrome from first override, inherited through second
    expect(el.getAttribute('data-chrome')).toBe('hairline')
  })

  it('provider sets data-chrome attribute on wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, chrome: 'terminal' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-chrome')).toBe('terminal')
  })

  it('provider sets data-decor attribute on wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, decor: 'glow' }}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('data-decor')).toBe('glow')
  })

  it('provider does NOT set data-chrome when chrome is undefined', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.hasAttribute('data-chrome')).toBe(false)
  })
})

// ─── Image treatment applied to ImageBlock ─────────────────────────────────

describe('image treatment axis', () => {
  it('ImageBlock applies grayscale class when image:grayscale', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, image: 'grayscale' }}>
        <ImageBlock alt="test" />
      </DesignSystemProvider>,
    )
    const img = container.querySelector('[data-d-role="image"]') as HTMLElement
    expect(img.className).toContain('grayscale')
  })

  it('ImageBlock applies zoom class when image:zoom', () => {
    const { container } = render(
      <DesignSystemProvider intent={{ ...DEFAULT_DESIGN, image: 'zoom' }}>
        <ImageBlock alt="test" />
      </DesignSystemProvider>,
    )
    const img = container.querySelector('[data-d-role="image"]') as HTMLElement
    expect(img.className).toContain('hover:scale')
  })

  it('ImageBlock has no treatment class when image axis is undefined', () => {
    const { container } = render(
      <DesignSystemProvider intent={DEFAULT_DESIGN}>
        <ImageBlock alt="test" />
      </DesignSystemProvider>,
    )
    const img = container.querySelector('[data-d-role="image"]') as HTMLElement
    expect(img.className).not.toContain('grayscale')
    expect(img.className).not.toContain('hover:scale')
  })
})
