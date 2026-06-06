import { glassPillButtonHtml } from './glass-pill-html.ts'

const goHome = ' onclick="location.href=\'/\'"'

const lockIcon15 = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

const lockIcon16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

export const PRICING_PAGE_MAIN_HTML = `<div class="page">

      <section class="pricing-hero section-gap" aria-labelledby="pricing-heading">
        <span class="kicker">Pricing</span>
        <h1 id="pricing-heading">Simple pricing.<br>No surprises.</h1>
        <p>Start free. Upgrade when you're ready. Lock the early adopter rate before it's gone&nbsp;forever.</p>
        <div class="urgency-row">
          <span class="seats-badge" aria-label="347 of 500 early adopter slots taken">
            <div class="seats-bar-wrap" aria-hidden="true"><div class="seats-bar-fill"></div></div>
            347 / 500 slots taken
          </span>
          <span class="countdown-badge" id="countdown-badge" aria-live="polite">
            <span class="countdown-dot" aria-hidden="true"></span>
            <span id="countdown-text">Early adopter slots still open</span>
          </span>
        </div>
      </section>

      <section class="section-gap" aria-labelledby="plans-heading">
        <h2 id="plans-heading" class="sr-only">Plans</h2>
        <div class="pricing-grid">

          <div class="pricing-card">
            <p class="plan-label">Free</p>
            <div class="plan-price-row">
              <span class="plan-price">₹0</span>
            </div>
            <p class="plan-desc">Preview the magic — no card needed.</p>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Generate website preview
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Limited templates
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                10 generations/month
              </li>
              <li class="off">
                <svg class="feat-icon cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ZIP export
              </li>
              <li class="off">
                <svg class="feat-icon cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                AI iteration
              </li>
              <li class="off">
                <svg class="feat-icon cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Community &amp; monthly drops
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'plan-btn ghost', extraAttrs: goHome, text: 'Start free' })}
          </div>

          <div class="pricing-card featured">
            <div class="popular-badge" aria-label="Most popular plan">Most Popular</div>
            <p class="plan-label">Pro</p>
            <div class="early-ribbon" aria-label="Early adopter offer">
              <span class="ribbon-dot" aria-hidden="true"></span>
              Early Adopter — Limited slots
            </div>
            <div class="plan-price-row">
              <span class="plan-price">₹199</span>
              <span class="plan-period">/month</span>
            </div>
            <p class="plan-original">₹399/month after slots fill</p>
            <span class="plan-save">50% OFF — locked forever</span>
            <p class="plan-desc">Discount stays as long as your subscription is active. Cancel&nbsp;→&nbsp;lose&nbsp;it.</p>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                30 generations/month
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited ZIP download
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Full template library
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                AI iteration &amp; refinement
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Community access
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Monthly template drops
              </li>
            </ul>
            ${glassPillButtonHtml({
              className: 'plan-btn primary',
              extraAttrs: goHome,
              html: `${lockIcon15}
              Lock lifetime discount`,
            })}
            <p class="seats-note">First 500 users only · cancel anytime</p>
          </div>

          <div class="pricing-card dim" aria-label="Future full price plan">
            <p class="plan-label">Pro</p>
            <div class="plan-price-row">
              <span class="plan-price">₹399</span>
              <span class="plan-period">/month</span>
            </div>
            <p class="plan-desc">Full price once early adopter slots are gone.</p>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Everything in Early Adopter Pro
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                New features as they ship
              </li>
              <li>
                <svg class="feat-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Priority support
              </li>
            </ul>
            ${glassPillButtonHtml({
              className: 'plan-btn ghost',
              disabled: true,
              extraAttrs: ' aria-disabled="true"',
              text: 'Available when slots fill',
            })}
          </div>

        </div>
        <p class="pricing-contact-note">Need more than 30 generations/month? <a href="https://x.com/LivioGama" target="_blank" rel="noopener">Contact us</a></p>
      </section>

      <section class="packs-section section-gap" aria-labelledby="packs-heading">
        <div class="section-title">
          <span class="kicker">Pay-as-you-go</span>
          <h2 id="packs-heading">No subscription?<br>No problem.</h2>
          <p>Buy a credit pack and download only when you need it.</p>
        </div>
        <div class="packs-grid">

          <div class="pack-card">
            <div class="pack-header">
              <span class="pack-name">Starter Pack</span>
              <span class="pack-qty">3 downloads</span>
            </div>
            <div class="pack-price-row">
              <span class="pack-price">₹199</span>
              <span class="pack-per">&nbsp;one-time</span>
            </div>
            <ul class="pack-features">
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                3 ZIP exports
              </li>
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                All frameworks included
              </li>
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Never expires
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'pack-btn ghost', extraAttrs: goHome, text: 'Buy pack' })}
          </div>

          <div class="pack-card best">
            <div class="pack-best-label" aria-label="Best value">Best Value</div>
            <div class="pack-header">
              <span class="pack-name">Growth Pack</span>
              <span class="pack-qty">10 downloads</span>
            </div>
            <div class="pack-price-row">
              <span class="pack-price">₹399</span>
              <span class="pack-per">&nbsp;one-time</span>
            </div>
            <ul class="pack-features">
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                10 ZIP exports
              </li>
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                All frameworks included
              </li>
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Never expires
              </li>
              <li>
                <svg class="feat-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                ₹39.90/download — 66% cheaper
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'pack-btn primary', extraAttrs: goHome, text: 'Buy pack' })}
          </div>

        </div>
      </section>

      <section class="comparison-section section-gap" aria-labelledby="compare-heading">
        <div class="section-title">
          <span class="kicker">Compare</span>
          <h2 id="compare-heading">Everything, side by side.</h2>
        </div>
        <div style="overflow-x: auto;">
          <table class="compare-table" aria-label="Feature comparison between plans">
            <thead>
              <tr>
                <th scope="col" style="width:40%">Feature</th>
                <th scope="col">Free</th>
                <th scope="col" class="highlight-col">Pro ₹199</th>
                <th scope="col">Credit Pack</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Website generation</td>
                <td><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td class="highlight-col"><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
              </tr>
              <tr>
                <td>Generation limit</td>
                <td>10/month</td>
                <td class="highlight-col" style="color:#EDEDEF;font-weight:600;">30/month</td>
                <td>10/month previews</td>
              </tr>
              <tr>
                <td>ZIP download</td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="highlight-col"><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td>Per credit</td>
              </tr>
              <tr>
                <td>Template library</td>
                <td>Limited</td>
                <td class="highlight-col"><span class="check-icon" aria-label="Full access"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>AI iteration</td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="highlight-col"><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>Community &amp; monthly drops</td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="highlight-col"><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="cross-icon" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>UPI payment (India)</td>
                <td><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td class="highlight-col"><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="check-icon" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="faq-section section-gap" aria-labelledby="faq-heading">
        <div class="section-title">
          <span class="kicker">FAQ</span>
          <h2 id="faq-heading">Questions answered.</h2>
        </div>
        <div class="faq-list">

          <details class="faq-item">
            <summary>
              What happens when the 500 early adopter slots fill up?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Once all 500 slots are gone, the price moves to ₹399/month permanently. Users who locked in at ₹199 keep their rate forever — but only as long as their subscription stays active. If you cancel, the slot is released and you'd rejoin at the full price.</p>
          </details>

          <details class="faq-item">
            <summary>
              Is there a free trial for Pro?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Yes — the Free plan lets you generate previews and explore templates without a card. When you're ready to export a full project as a ZIP or need a higher monthly generation limit, upgrade to Pro or grab a credit pack.</p>
          </details>

          <details class="faq-item">
            <summary>
              What payment methods are accepted?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Pay via UPI (including UPI Autopay for subscriptions), cards, and net banking through Razorpay.</p>
          </details>

          <details class="faq-item">
            <summary>
              What is a "credit" in the credit packs?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>One credit equals one ZIP export of a generated project. Credits never expire and can be used across any generated session. Generating previews does not consume credits and stays subject to your plan's generation quota.</p>
          </details>

          <details class="faq-item">
            <summary>
              Can I cancel my subscription anytime?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Yes, cancel anytime from your account settings. No cancellation fees. Note that cancelling as an early adopter means you lose the ₹199 rate — if you resubscribe later, you'll pay the then-current price.</p>
          </details>

          <details class="faq-item">
            <summary>
              What frameworks does the generator support?
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Ship Fast generates clean HTML/CSS/JS by default. Pro users gain access to React, Next.js, and additional framework renderers as they are added. Each new framework ships as part of the monthly drops.</p>
          </details>

        </div>
      </section>

      <section class="cta-section" aria-labelledby="cta-heading">
        <span class="kicker">Ready to ship?</span>
        <h2 id="cta-heading">Build your SaaS in seconds.<br>Lock the rate forever.</h2>
        <p>153 slots remaining. Once they're gone, the price goes up — and it won't come back.</p>
        ${glassPillButtonHtml({
          className: 'cta-btn',
          extraAttrs: goHome,
          html: `${lockIcon16}
          Lock lifetime discount`,
        })}
        <p class="cta-note">Free to start · ₹199/month early adopter · cancel anytime</p>
      </section>

      <footer class="site-footer">
        <span class="footer-brand">SHIP FAST © 2025</span>
        <nav class="footer-nav" aria-label="Footer links">
          <a href="/">Home</a>
          <a href="/pricing" aria-current="page">Pricing</a>
        </nav>
      </footer>

    </div>

    <script>
      function tick() {
        document.getElementById('countdown-text').textContent = 'Early adopter slots still open'
      }

      tick()
      setInterval(tick, 30000)
    </script>` as const
