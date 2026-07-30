// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import { DesignSystemProvider } from './design-context.tsx'
import { DEFAULT_DESIGN, type DesignIntent } from './design-system.ts'

const SHARP: DesignIntent = { ...DEFAULT_DESIGN, radius: 'sharp' }
const ROUNDED: DesignIntent = { ...DEFAULT_DESIGN, radius: 'rounded' }
const PILL: DesignIntent = { ...DEFAULT_DESIGN, radius: 'pill' }

describe('DesignSystemProvider CSS override layer', () => {
  it('sets data-radius attribute on wrapper', () => {
    const { container } = render(
      <DesignSystemProvider intent={SHARP}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const wrapper = container.querySelector('[data-radius]')
    expect(wrapper).toBeTruthy()
    expect(wrapper?.getAttribute('data-radius')).toBe('sharp')
  })

  it('injects a style element with radius override CSS', () => {
    const { container } = render(
      <DesignSystemProvider intent={SHARP}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const style = container.querySelector('style')
    expect(style).toBeTruthy()
    // CSS should contain overrides for rounded-lg, rounded-xl, etc.
    expect(style?.textContent).toContain('rounded-lg')
    expect(style?.textContent).toContain('border-radius: 0px')
  })

  it('generates different CSS for rounded intent', () => {
    const { container } = render(
      <DesignSystemProvider intent={ROUNDED}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const style = container.querySelector('style')
    expect(style).toBeTruthy()
    // rounded intent → 0.75rem (12px)
    expect(style?.textContent).toContain('border-radius: 0.75rem')
    // Should NOT contain 0px overrides
    expect(style?.textContent).not.toContain('border-radius: 0px')
  })

  it('does not blanket-override rounded-full when intent is pill', () => {
    const { container } = render(
      <DesignSystemProvider intent={PILL}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const style = container.querySelector('style')
    expect(style).toBeTruthy()
    // pill intent should NOT blanket-override rounded-full (it stays full)
    // Per-role rules may reference rounded-full via var() — that's fine.
    // The blanket fallback (no data-d-role) should skip rounded-full for pill.
    const css = style?.textContent ?? ''
    // Check that blanket fallback doesn't contain rounded-full override
    // (blanket rules have :not([data-d-role]) qualifier)
    expect(css).not.toMatch(
      /\.rounded-full:not\(\.d-radius-lock\):not\(\[data-d-role\]\)/,
    )
  })

  it('overrides rounded-full when intent is sharp', () => {
    const { container } = render(
      <DesignSystemProvider intent={SHARP}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const style = container.querySelector('style')
    expect(style).toBeTruthy()
    // sharp intent should override rounded-full → 0px
    expect(style?.textContent).toContain('.rounded-full')
    expect(style?.textContent).toContain('border-radius: 0px')
  })

  it('includes d-radius-lock opt-out in CSS', () => {
    const { container } = render(
      <DesignSystemProvider intent={SHARP}>
        <div>test</div>
      </DesignSystemProvider>,
    )
    const style = container.querySelector('style')
    expect(style).toBeTruthy()
    expect(style?.textContent).toContain('d-radius-lock')
    expect(style?.textContent).toContain(':not(.d-radius-lock)')
  })
})
