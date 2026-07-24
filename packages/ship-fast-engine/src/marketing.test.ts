// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { SHIP_FAST_SITE_URL, shipFastFooterLogoMarkup } from './marketing'

describe('Ship Fast marketing markup', () => {
  it('exposes the canonical site URL used by generated footer links', () => {
    expect(new URL(SHIP_FAST_SITE_URL).origin).toBe('https://ship-fast.ai')
  })

  it('renders a decorative footer logo with caller-scoped gradient ids', () => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = shipFastFooterLogoMarkup('export-footer')

    const logo = wrapper.querySelector('.footer-branding__logo')
    const svg = wrapper.querySelector('svg')
    const gradients = wrapper.querySelectorAll('linearGradient')

    expect(logo).not.toBeNull()
    expect(logo?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 52 52')
    expect([...gradients].map((node) => node.id)).toEqual([
      'export-footer-fg1',
      'export-footer-fg2',
    ])
    expect(wrapper.querySelector('[fill="url(#export-footer-fg1)"]')).toBe(
      svg?.querySelector('path'),
    )
  })
})
