import { describe, expect, it } from 'vitest'
import { renderTermsPage } from './terms-page.js'

describe('renderTermsPage', () => {
  it('renders terms with incorporation placeholders and privacy link', () => {
    const html = renderTermsPage()
    expect(html).toContain('Terms of service')
    expect(html).toContain('global-launch-backdrop')
    expect(html).toContain('launch-backdrop.js')
    expect(html).toContain('top-actions')
    expect(html).toContain('marketing-logo-block')
    expect(html).not.toContain('top-actions-brand')
    expect(html).not.toContain('legal-page-header')
    expect(html).toContain('Pending incorporation data: jurisdiction')
    expect(html).toContain('Pending incorporation data: company registration number')
    expect(html).toContain('Pending incorporation data: registered address')
    expect(html).toContain('href="/privacy"')
  })

  it('mentions launch-critical product policies', () => {
    const html = renderTermsPage()
    expect(html).toContain('Private generations')
    expect(html).toContain('Partner coupons')
    expect(html).toContain('Stripe or Razorpay')
    expect(html).toContain('prompts, generated projects, authentication data, billing metadata')
  })
})
