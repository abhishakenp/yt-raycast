// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PricingContent } from './PricingContent'

vi.mock('@/features/home/components/ShareBonusPanel', () => ({
  ShareBonusPanel: () => <div data-testid="share-panel" />,
}))

describe('PricingContent', () => {
  afterEach(cleanup)

  it('exposes pricing FAQ questions as expandable button controls', () => {
    const { getByRole, getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onShareClick={() => {}}
      />,
    )

    const question = getByRole('button', { name: 'What is included in Pro?' })
    const answer = getByText(
      'Pro includes website generation, CMS, ZIP export, the full template library, AI iteration, better image generation, community access, and monthly template drops.',
    )

    expect(question.getAttribute('aria-expanded')).toBe('false')
    expect(answer.hidden).toBe(true)

    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('true')
    expect(answer.hidden).toBe(false)

    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('false')
    expect(answer.hidden).toBe(true)
  })

  it('renders the Free plan with Most Popular badge', () => {
    const { getByText, getByLabelText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onShareClick={() => {}}
      />,
    )

    expect(getByLabelText('Most popular plan')).toBeDefined()
    expect(getByText('Free')).toBeDefined()
    expect(getByText('₹0')).toBeDefined()
    expect(getByText('3 generations/day without login')).toBeDefined()
    expect(getByText('5 generations/day when logged in')).toBeDefined()
    expect(getByText('10 free generations/month')).toBeDefined()
  })

  it('renders the Free FAQ item', () => {
    const { getByRole, getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onShareClick={() => {}}
      />,
    )

    const question = getByRole('button', { name: 'What is included in Free?' })
    const answer = getByText(
      'Free gives you 3 generations per day without even logging in, 5 per day when signed in, and 10 free generations per month. No credit card required.',
    )

    expect(question).toBeDefined()
    expect(answer.hidden).toBe(true)
  })

  it('renders the ShareBonusPanel inside the affiliate card when authed', () => {
    const { container } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onShareClick={() => {}}
        referralCode="TEST123"
      />,
    )

    const affiliateCard = container.querySelector('.affiliate-card')
    const sharePanel = container.querySelector('[data-testid="share-panel"]')
    expect(sharePanel).not.toBeNull()
    expect(affiliateCard?.contains(sharePanel)).toBe(true)
  })

  it('hides the ShareBonusPanel when not authed (no referral code)', () => {
    const { container } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onShareClick={() => {}}
      />,
    )

    const sharePanel = container.querySelector('[data-testid="share-panel"]')
    expect(sharePanel).toBeNull()
  })

  it('calls onCheckoutClick when a checkout CTA is clicked', () => {
    const onCheckoutClick = vi.fn()
    const { getAllByText } = render(
      <PricingContent
        onCheckoutClick={onCheckoutClick}
        isCheckoutStarting={false}
        onShareClick={() => {}}
      />,
    )

    const buttons = getAllByText('Start Pro')
    fireEvent.click(buttons[0])
    expect(onCheckoutClick).toHaveBeenCalledTimes(1)
  })
})
