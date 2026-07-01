// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GLASS_LENS_FILTER_ID, GlassPillSvgDefs } from './GlassPillSvgDefs'

describe('GlassPillSvgDefs', () => {
  afterEach(cleanup)

  it('renders the reusable hidden SVG filter used by glass pill controls', () => {
    const { container } = render(<GlassPillSvgDefs />)

    const svg = container.querySelector('svg')
    const filter = container.querySelector(`filter#${GLASS_LENS_FILTER_ID}`)
    const turbulence = container.querySelector('feTurbulence')
    const displacement = container.querySelector('feDisplacementMap')

    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(filter).not.toBeNull()
    expect(turbulence?.getAttribute('type')).toBe('fractalNoise')
    expect(displacement?.getAttribute('in')).toBe('SourceGraphic')
  })
})
