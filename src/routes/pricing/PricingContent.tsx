import { useState } from 'react'

import { GlassPillButton } from '@/features/home/components/GlassPill'
import { ShareBonusPanel } from '@/features/home/components/ShareBonusPanel'

const LockIcon = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CheckIcon = () => (
  <svg
    className="feat-icon check"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronIcon = () => (
  <svg
    className="faq-chevron"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

type FaqItemProps = {
  question: string
  answer: string
  controlsId: string
}

const FaqItem = ({ question, answer, controlsId }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="faq-item" data-faq-item data-open={isOpen || undefined}>
      <button
        type="button"
        className="faq-question"
        aria-expanded={isOpen}
        aria-controls={controlsId}
        data-faq-trigger
        onClick={() => setIsOpen((v) => !v)}
      >
        {question}
        <ChevronIcon />
      </button>
      <p id={controlsId} hidden={!isOpen}>
        {answer}
      </p>
    </div>
  )
}

type PricingContentProps = {
  onCheckoutClick: () => void
  isCheckoutStarting: boolean
  onStartFreeClick: () => void
  onShareClick: (platform: string) => void
  referralCode?: string | null
}

export const PricingContent = ({
  onCheckoutClick,
  isCheckoutStarting,
  onStartFreeClick,
  onShareClick,
  referralCode,
}: PricingContentProps) => {
  return (
    <div className="page">
      <section
        className="pricing-hero section-gap"
        aria-labelledby="pricing-heading"
      >
        <span className="kicker">Pricing</span>
        <h1 id="pricing-heading">
          Start free.
          <br />
          Upgrade when you ship.
        </h1>
        <p>
          Generate, iterate, export, and keep shipping with the full Ship Fast
          workflow.
        </p>
      </section>

      <section className="section-gap" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <p className="plan-label">Free</p>
            <div className="plan-price-row">
              <span className="plan-price">₹0</span>
              <span className="plan-period">/forever</span>
            </div>
            <p className="plan-desc">
              Try the generator without logging in. The first ones are on us —
              no credit card required.
            </p>
            <div className="plan-divider" />
            <ul className="plan-features">
              <li>
                <CheckIcon /> 2 generations/day without login
              </li>
              <li>
                <CheckIcon /> 5 generations/day when logged in
              </li>
              <li>
                <CheckIcon /> 10 free generations/month
              </li>
            </ul>
            <GlassPillButton className="plan-btn" onClick={onStartFreeClick}>
              Start Free
            </GlassPillButton>
            <p className="seats-note">No credit card required.</p>
          </div>
          <div className="pricing-card featured">
            <div className="popular-badge" aria-label="Most popular plan">
              Most Popular
            </div>
            <p className="plan-label">Pro</p>
            <div className="plan-price-row">
              <span className="plan-price">₹999</span>
              <span className="plan-period">/month</span>
            </div>
            <span className="plan-save">
              Bring 2 active users · get 50% off
            </span>
            <p className="plan-desc">
              The full generator, export flow, AI iteration, and monthly drops
              in one subscription.
            </p>
            <div className="plan-divider" />
            <ul className="plan-features">
              <li>
                <CheckIcon /> 30 generations/month
              </li>
              <li>
                <CheckIcon /> Unlimited ZIP downloads
              </li>
              <li>
                <CheckIcon /> Full template library
              </li>
              <li>
                <CheckIcon /> AI iteration &amp; refinement
              </li>
              <li>
                <CheckIcon /> Community access
              </li>
              <li>
                <CheckIcon /> Monthly template drops
              </li>
            </ul>
            <GlassPillButton
              className="plan-btn primary"
              onClick={onCheckoutClick}
              disabled={isCheckoutStarting}
            >
              <LockIcon size={15} />
              Start Pro
            </GlassPillButton>
            <p className="seats-note">
              Cancel anytime. Referral discounts require active subscriptions.
            </p>
          </div>
        </div>
      </section>

      <section
        className="affiliate-section section-gap"
        aria-labelledby="affiliate-heading"
      >
        <div className="affiliate-card">
          <span className="kicker">Affiliation</span>
          <h2 id="affiliate-heading">Bring 2 people</h2>
          <div
            className="affiliate-diagram"
            aria-label="Bring two active people to receive a 50 percent discount"
          >
            <div className="affiliate-people">
              <div className="affiliate-person" aria-label="Person 1">
                <span className="person-icon" aria-hidden="true">
                  <i />
                  <b />
                </span>
              </div>
              <div className="affiliate-person" aria-label="Person 2">
                <span className="person-icon" aria-hidden="true">
                  <i />
                  <b />
                </span>
              </div>
            </div>
            <div className="affiliate-joint" aria-hidden="true" />
            <div className="affiliate-reward">
              <strong>-50%</strong>
              <span>for life</span>
            </div>
          </div>
          {referralCode ? (
            <ShareBonusPanel
              visible
              onShareClick={onShareClick}
              referralCode={referralCode}
              label="Bring 2 people for 50% discount for life"
              className="mt-5"
            />
          ) : null}
        </div>
      </section>

      <section
        className="faq-section section-gap"
        aria-labelledby="faq-heading"
      >
        <div className="section-title">
          <span className="kicker">FAQ</span>
          <h2 id="faq-heading">Questions answered.</h2>
        </div>
        <div className="faq-list">
          <FaqItem
            question="What is included in Free?"
            answer="Free gives you 2 generations per day without even logging in, 5 per day when signed in, and 10 free generations per month. No credit card required."
            controlsId="pricing-faq-free"
          />
          <FaqItem
            question="What is included in Pro?"
            answer="Pro includes website generation, ZIP export, the full template library, AI iteration, community access, and monthly template drops."
            controlsId="pricing-faq-pro"
          />
          <FaqItem
            question="How does the bring-2-people discount work?"
            answer="Refer 2 active users and your future subscription payments are discounted by 50%. The benefit is tied to active accounts: if you cancel, or if the active referral count drops below 2, the discount no longer applies until the requirement is met again."
            controlsId="pricing-faq-referrals"
          />
          <FaqItem
            question="What payment methods are accepted?"
            answer="Pay via UPI (including UPI Autopay for subscriptions), cards, and net banking through Razorpay."
            controlsId="pricing-faq-payments"
          />
          <FaqItem
            question="Can I cancel my subscription anytime?"
            answer="Yes, cancel anytime from your account settings. No cancellation fees. Cancelling ends active pricing benefits, including any referral discount. If you resubscribe later, you'll pay the then-current price."
            controlsId="pricing-faq-cancel"
          />
          <FaqItem
            question="What frameworks does the generator support?"
            answer="Ship Fast generates clean HTML/CSS/JS by default. Pro users gain access to React, Next.js, and additional framework renderers as they are added. Each new framework ships as part of the monthly drops."
            controlsId="pricing-faq-frameworks"
          />
        </div>
      </section>

      <section className="cta-section" aria-labelledby="cta-heading">
        <span className="kicker">Ready to ship?</span>
        <h2 id="cta-heading">
          Build your SaaS in seconds.
          <br />
          Ship with Pro.
        </h2>
        <p>
          One plan, full access, and a referral discount when two active users
          join through you.
        </p>
        <GlassPillButton
          className="cta-btn"
          onClick={onCheckoutClick}
          disabled={isCheckoutStarting}
        >
          <LockIcon size={16} />
          Start Pro
        </GlassPillButton>
        <p className="cta-note">
          ₹999/month · cancel anytime · referral discount while active
        </p>
      </section>
    </div>
  )
}
