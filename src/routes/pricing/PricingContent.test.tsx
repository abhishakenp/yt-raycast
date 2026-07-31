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
        onStartFreeClick={() => {}}
        onShareClick={() => {}}
      />,
    )

    const question = getByRole('button', { name: 'What is included in Pro?' })
    const answer = getByText(
      'Pro includes website generation, ZIP export, the full template library, AI iteration, community access, and monthly template drops.',
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

  it('renders the Free plan without the Most Popular badge', () => {
    // The badge belongs on the plan we want people to buy. Putting it on the
    // ₹0 card advertises the free tier as the recommended choice.
    const { container, getByLabelText, getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onStartFreeClick={() => {}}
        onShareClick={() => {}}
      />,
    )

    const badge = getByLabelText('Most popular plan')
    const freeCard = getByText('Free').closest('.pricing-card')
    expect(freeCard).not.toBeNull()
    expect(freeCard?.contains(badge)).toBe(false)
    expect(freeCard?.classList.contains('featured')).toBe(false)
    expect(container.querySelector('.pricing-card.featured')).not.toBeNull()
    expect(getByText('Free')).toBeDefined()
    expect(getByText('₹0')).toBeDefined()
    expect(getByText('2 generations/day without login')).toBeDefined()
    expect(getByText('5 generations/day when logged in')).toBeDefined()
    expect(getByText('10 free generations/month')).toBeDefined()
  })

  it('marks the Pro plan as the featured, most-popular plan', () => {
    const { getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onStartFreeClick={() => {}}
        onShareClick={() => {}}
      />,
    )

    const proCard = getByText('Pro').closest('.pricing-card')
    expect(proCard).not.toBeNull()
    expect(proCard?.classList.contains('featured')).toBe(true)
    expect(proCard?.querySelector('.popular-badge')?.textContent).toBe(
      'Most Popular',
    )
  })

  it('calls the free-tier handler (not the share handler) from Start Free', () => {
    const onStartFreeClick = vi.fn()
    const onShareClick = vi.fn()
    const { getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onStartFreeClick={onStartFreeClick}
        onShareClick={onShareClick}
      />,
    )

    fireEvent.click(getByText('Start Free'))

    expect(onStartFreeClick).toHaveBeenCalledTimes(1)
    expect(onShareClick).not.toHaveBeenCalled()
  })

  it('keeps Start Free enabled while a Pro checkout is starting', () => {
    const onStartFreeClick = vi.fn()
    const { getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting
        onStartFreeClick={onStartFreeClick}
        onShareClick={() => {}}
      />,
    )

    fireEvent.click(getByText('Start Free'))

    expect(onStartFreeClick).toHaveBeenCalledTimes(1)
  })

  it('renders the Free FAQ item', () => {
    const { getByRole, getByText } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onStartFreeClick={() => {}}
        onShareClick={() => {}}
      />,
    )

    const question = getByRole('button', { name: 'What is included in Free?' })
    const answer = getByText(
      'Free gives you 2 generations per day without even logging in, 5 per day when signed in, and 10 free generations per month. No credit card required.',
    )

    expect(question).toBeDefined()
    expect(answer.hidden).toBe(true)
  })

  it('renders the ShareBonusPanel inside the affiliate card when authed', () => {
    const { container } = render(
      <PricingContent
        onCheckoutClick={() => {}}
        isCheckoutStarting={false}
        onStartFreeClick={() => {}}
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
        onStartFreeClick={() => {}}
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
        onStartFreeClick={() => {}}
        onShareClick={() => {}}
      />,
    )

    const buttons = getAllByText('Start Pro')
    fireEvent.click(buttons[0])
    expect(onCheckoutClick).toHaveBeenCalledTimes(1)
  })
})
