import { glassPillButtonHtml } from '@/lib/glass-pill-html'

const startCheckout = ' data-pricing-checkout-cta="true"'

const lockIcon15 = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

const lockIcon16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

const checkIcon = `<svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`

export const PRICING_PAGE_MAIN_HTML = `<div class="page">

      <section class="pricing-hero section-gap" aria-labelledby="pricing-heading">
        <span class="kicker">Pricing</span>
        <h1 id="pricing-heading">One plan.<br>Everything included.</h1>
        <p>Generate, iterate, export, and keep shipping with the full Ship Fast workflow.</p>
      </section>

      <section class="section-gap" aria-labelledby="plans-heading">
        <h2 id="plans-heading" class="sr-only">Plans</h2>
        <div class="pricing-grid single-plan">
          <div class="pricing-card featured">
            <div class="popular-badge" aria-label="Most popular plan">Most Popular</div>
            <p class="plan-label">Pro</p>
            <div class="plan-price-row">
              <span class="plan-price">₹999</span>
              <span class="plan-period">/month</span>
            </div>
            <span class="plan-save">Bring 2 active users · get 50% off</span>
            <p class="plan-desc">The full generator, export flow, AI iteration, and monthly drops in one subscription.</p>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              <li>${checkIcon} 30 generations/month</li>
              <li>${checkIcon} Unlimited ZIP downloads</li>
              <li>${checkIcon} Full template library</li>
              <li>${checkIcon} AI iteration &amp; refinement</li>
              <li>${checkIcon} Community access</li>
              <li>${checkIcon} Monthly template drops</li>
            </ul>
            ${glassPillButtonHtml({
              className: 'plan-btn primary',
              extraAttrs: startCheckout,
              html: `${lockIcon15}
              Start Pro`,
            })}
            <p class="seats-note">Cancel anytime. Referral discounts require active subscriptions.</p>
          </div>
        </div>
      </section>

      <section class="affiliate-section section-gap" aria-labelledby="affiliate-heading">
        <div class="affiliate-card">
          <span class="kicker">Affiliation</span>
          <h2 id="affiliate-heading">Bring 2 people</h2>
          <div class="affiliate-diagram" aria-label="Bring two active people to receive a 50 percent discount">
            <div class="affiliate-people">
              <div class="affiliate-person" aria-label="Person 1">
                <span class="person-icon" aria-hidden="true"><i></i><b></b></span>
              </div>
              <div class="affiliate-person" aria-label="Person 2">
                <span class="person-icon" aria-hidden="true"><i></i><b></b></span>
              </div>
            </div>
            <div class="affiliate-joint" aria-hidden="true"></div>

            <div class="affiliate-reward">
              <strong>-50%</strong>
              <span>for life</span>
            </div>
          </div>
        </div>
      </section>

      <section class="faq-section section-gap" aria-labelledby="faq-heading">
        <div class="section-title">
          <span class="kicker">FAQ</span>
          <h2 id="faq-heading">Questions answered.</h2>
        </div>
        <div class="faq-list">

          <div class="faq-item" data-faq-item>
            <button type="button" class="faq-question" aria-expanded="false" aria-controls="pricing-faq-pro" data-faq-trigger>
              What is included in Pro?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <p id="pricing-faq-pro" hidden>Pro includes website generation, ZIP export, the full template library, AI iteration, community access, and monthly template drops.</p>
          </div>

          <div class="faq-item" data-faq-item>
            <button type="button" class="faq-question" aria-expanded="false" aria-controls="pricing-faq-referrals" data-faq-trigger>
              How does the bring-2-people discount work?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <p id="pricing-faq-referrals" hidden>Refer 2 active users and your future subscription payments are discounted by 50%. The benefit is tied to active accounts: if you cancel, or if the active referral count drops below 2, the discount no longer applies until the requirement is met again.</p>
          </div>

          <div class="faq-item" data-faq-item>
            <button type="button" class="faq-question" aria-expanded="false" aria-controls="pricing-faq-payments" data-faq-trigger>
              What payment methods are accepted?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <p id="pricing-faq-payments" hidden>Pay via UPI (including UPI Autopay for subscriptions), cards, and net banking through Razorpay.</p>
          </div>

          <div class="faq-item" data-faq-item>
            <button type="button" class="faq-question" aria-expanded="false" aria-controls="pricing-faq-cancel" data-faq-trigger>
              Can I cancel my subscription anytime?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <p id="pricing-faq-cancel" hidden>Yes, cancel anytime from your account settings. No cancellation fees. Cancelling ends active pricing benefits, including any referral discount. If you resubscribe later, you'll pay the then-current price.</p>
          </div>

          <div class="faq-item" data-faq-item>
            <button type="button" class="faq-question" aria-expanded="false" aria-controls="pricing-faq-frameworks" data-faq-trigger>
              What frameworks does the generator support?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <p id="pricing-faq-frameworks" hidden>Ship Fast generates clean HTML/CSS/JS by default. Pro users gain access to React, Next.js, and additional framework renderers as they are added. Each new framework ships as part of the monthly drops.</p>
          </div>

        </div>
      </section>

      <section class="cta-section" aria-labelledby="cta-heading">
        <span class="kicker">Ready to ship?</span>
        <h2 id="cta-heading">Build your SaaS in seconds.<br>Ship with Pro.</h2>
        <p>One plan, full access, and a referral discount when two active users join through you.</p>
        ${glassPillButtonHtml({
          className: 'cta-btn',
          extraAttrs: startCheckout,
          html: `${lockIcon16}
          Start Pro`,
        })}
        <p class="cta-note">₹999/month · cancel anytime · referral discount while active</p>
      </section>

    </div>` as const
