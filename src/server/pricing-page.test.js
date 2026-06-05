import { describe, expect, it } from 'vitest'
import { renderPricingPage } from './pricing-page.js'

describe('pricing page', () => {
  it('keeps public pricing copy aligned with the enforced Pro quota', () => {
    const html = renderPricingPage()

    expect(html).toContain('30 generations/month')
    expect(html).toContain('30/month')
    expect(html).toContain('10/month previews')
    expect(html).not.toContain('5 generations/month')
    expect(html).not.toContain('Need more than 5 generations/month')
    expect(html).not.toContain('need unlimited generations')
  })

  it('does not render a stale hard-coded countdown date', () => {
    const html = renderPricingPage()

    expect(html).toContain('Early adopter slots still open')
    expect(html).not.toContain('2026-05-23')
    expect(html).not.toContain('Price increases in 23d')
  })
})
