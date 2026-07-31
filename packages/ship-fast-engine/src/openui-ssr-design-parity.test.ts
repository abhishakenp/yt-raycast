import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from './openui-ssr.js'
import { DEFAULT_DESIGN } from '@ship-fast/blocks/runtime'

/**
 * Design system parity tests.
 *
 * The dashboard's live preview wraps the Renderer in `DesignSystemProvider`
 * (see OpenUIViewer.tsx), which sets `data-density`/`data-typography`/... and
 * `--d-radius`/`--d-shadow`/... CSS custom properties on a wrapper div. The
 * 416-line `design-presets.css` (imported via `src/styles.css`) matches those
 * attributes and variables. Without the provider, the entire @design axis
 * system is dead CSS — causing visual disparity between the dashboard preview
 * and gallery/export SSR output.
 *
 * These tests verify the SSR render path (`renderOpenUIToHTML`) emits the same
 * wrapper attributes and CSS custom properties as the dashboard's
 * `DesignSystemProvider`.
 */
describe('renderOpenUIToHTML — design system parity', () => {
  const minimalSource = 'root = Stack([Text("parity test")])'

  it('emits DesignSystemProvider wrapper with data-density attribute (DEFAULT_DESIGN)', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.density = 'balanced' — a named preset, so the provider
    // sets data-density="balanced" on the wrapper div.
    expect(html).toContain('data-density="balanced"')
  })

  it('emits data-typography attribute for the DEFAULT_DESIGN typography preset', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.typography = 'editorial'
    expect(html).toContain('data-typography="editorial"')
  })

  it('emits data-gradient attribute for the DEFAULT_DESIGN gradient preset', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.gradient = 'none'
    expect(html).toContain('data-gradient="none"')
  })

  it('emits data-motion attribute for the DEFAULT_DESIGN motion preset', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.motion = 'subtle'
    expect(html).toContain('data-motion="subtle"')
  })

  it('emits --d-radius CSS custom property for the DEFAULT_DESIGN radius (Tailwind axis)', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.radius = 'rounded-none' → designValueToCss → '0px'
    // Tailwind axes set --d-{axis} as inline CSS custom properties.
    expect(html).toContain('--d-radius')
  })

  it('emits --d-shadow CSS custom property for the DEFAULT_DESIGN shadow (Tailwind axis)', async () => {
    const html = await renderOpenUIToHTML(minimalSource)

    // DEFAULT_DESIGN.shadow = 'shadow-[4px_4px_0_0]'
    expect(html).toContain('--d-shadow')
  })

  it('respects a custom designIntent with non-default presets', async () => {
    const html = await renderOpenUIToHTML(
      minimalSource,
      null,
      'en',
      null,
      null,
      null,
      {
        ...DEFAULT_DESIGN,
        density: 'compact',
        typography: 'technical',
        radius: 'rounded-xl',
      },
    )

    expect(html).toContain('data-density="compact"')
    expect(html).toContain('data-typography="technical"')
    // rounded-xl is a Tailwind axis → CSS custom property, not a data attribute
    expect(html).toContain('--d-radius')
    // Should NOT contain the default density attribute
    expect(html).not.toContain('data-density="balanced"')
  })

  it('falls back to DEFAULT_DESIGN when designIntent is null', async () => {
    const html = await renderOpenUIToHTML(
      minimalSource,
      null,
      'en',
      null,
      null,
      null,
      null,
    )

    expect(html).toContain('data-density="balanced"')
    expect(html).toContain('data-typography="editorial"')
  })
})
