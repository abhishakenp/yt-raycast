import {
  LEGAL_CONTROLLER_ADDRESS,
  LEGAL_CONTROLLER_NAME,
  PLAUSIBLE_DOMAIN,
  PRIVACY_CONTACT_EMAIL,
  SITE_NAME,
  SITE_URL,
} from '../config.js'
import { escapeHtml } from '@ship-fast/engine/renderers/shared.js'
import { sfGlassPillSvgDefs } from './liquid-glass-button.js'
import {
  GLOBAL_LAUNCH_BACKDROP_HTML,
  renderLaunchBackdropScript,
  renderMarketingFonts,
  renderMarketingLogoBlock,
  renderMarketingTopBarScript,
  renderTopActions,
} from './marketing-shell.js'

const termsEffectiveDate = (process.env.TERMS_EFFECTIVE_DATE ?? '2026-06-04').trim()
const incorporationJurisdiction = (process.env.LEGAL_INCORPORATION_JURISDICTION ?? '').trim()
const companyRegistrationNumber = (process.env.LEGAL_COMPANY_REGISTRATION_NUMBER ?? '').trim()
const refundPolicy = (process.env.LEGAL_REFUND_POLICY ?? '').trim()

const mailtoHref = `mailto:${encodeURIComponent(PRIVACY_CONTACT_EMAIL)}`

const missingValue = (label) =>
  `<span class="legal-placeholder">Pending incorporation data: ${escapeHtml(label)}</span>`

export const renderTermsPage = () => {
  const site = escapeHtml(SITE_NAME)
  const siteUrl = escapeHtml(SITE_URL)
  const plausible = escapeHtml(PLAUSIBLE_DOMAIN)
  const operator = escapeHtml(LEGAL_CONTROLLER_NAME)
  const email = escapeHtml(PRIVACY_CONTACT_EMAIL)
  const effective = escapeHtml(termsEffectiveDate)
  const jurisdiction = incorporationJurisdiction
    ? escapeHtml(incorporationJurisdiction)
    : missingValue('jurisdiction')
  const registration = companyRegistrationNumber
    ? escapeHtml(companyRegistrationNumber)
    : missingValue('company registration number')
  const address = LEGAL_CONTROLLER_ADDRESS
    ? escapeHtml(LEGAL_CONTROLLER_ADDRESS).split(/\r?\n/).filter(Boolean).join('<br />')
    : missingValue('registered address')
  const refunds = refundPolicy
    ? escapeHtml(refundPolicy)
    : 'Paid subscriptions and one-off purchases are provided according to the checkout terms shown at purchase time. Statutory rights are not limited.'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${site} - Terms of service</title>
    <meta name="description" content="Terms that govern use of ${site}." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${siteUrl}/terms" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta name="theme-color" content="#020413" />
    ${renderMarketingFonts()}
    <script defer data-domain="${plausible}" data-api="/api/event" src="/js/script.js"></script>
    <link rel="stylesheet" href="/styles/privacy.css" />
  </head>
  <body>
    ${sfGlassPillSvgDefs()}
    ${GLOBAL_LAUNCH_BACKDROP_HTML}
    ${renderTopActions()}
    ${renderMarketingLogoBlock()}

    <main class="page legal-doc">
      <header class="legal-header">
        <p class="kicker">Legal</p>
        <h1>Terms of service</h1>
        <p class="legal-meta">
          <strong>${site}</strong> (${siteUrl}) &middot; Effective date:
          <time datetime="${effective}">${effective}</time>
        </p>
      </header>

      <section aria-labelledby="h-operator">
        <h2 id="h-operator">1. Operator</h2>
        <p>These terms are between you and <strong>${operator}</strong>, operating ${site}.</p>
        <p>Incorporation jurisdiction: ${jurisdiction}</p>
        <p>Company registration number: ${registration}</p>
        <p class="legal-address">${address}</p>
        <p>Contact: <a href="${mailtoHref}">${email}</a></p>
      </section>

      <section aria-labelledby="h-service">
        <h2 id="h-service">2. Service</h2>
        <p>
          ${site} is an AI-assisted website generation product. You provide prompts, optional layout references,
          account details, and payment details where applicable. We generate previews, downloadable exports,
          and optional GitHub pushes based on those instructions.
        </p>
      </section>

      <section aria-labelledby="h-account">
        <h2 id="h-account">3. Accounts, quotas, and paid features</h2>
        <p>
          Anonymous use, signed-in use, and subscribed use may have different quotas. Internal whitelisted IPs may
          bypass quota enforcement for operational use. Private generations, paid exports without a badge, and
          paid checkout flows require the entitlements shown in the product.
        </p>
      </section>

      <section aria-labelledby="h-use">
        <h2 id="h-use">4. Acceptable use</h2>
        <p>
          You must not use ${site} to generate illegal, harmful, abusive, discriminatory, sexually explicit,
          phishing, malware, counterfeit, or rights-infringing content. We may block prompts, refuse generation,
          limit access, or suspend accounts to protect the service and other users.
        </p>
      </section>

      <section aria-labelledby="h-rights">
        <h2 id="h-rights">5. Content and rights</h2>
        <p>
          You are responsible for prompts, layout references, brand names, assets, and instructions you submit.
          You must have the rights needed to use any referenced material. Generated output may require your own
          review before production use, especially for legal, medical, financial, regulated, or brand-sensitive
          content.
        </p>
      </section>

      <section aria-labelledby="h-billing">
        <h2 id="h-billing">6. Billing, coupons, and refunds</h2>
        <p>
          Payments may be processed by Stripe or Razorpay depending on checkout route, region, and payment method.
          Partner coupons apply only when accepted by the relevant payment provider.
        </p>
        <p>${refunds}</p>
      </section>

      <section aria-labelledby="h-availability">
        <h2 id="h-availability">7. Availability and changes</h2>
        <p>
          The service is provided with reasonable care, but generation quality, latency, model availability, export
          compatibility, and third-party integrations can vary. We may change, pause, or discontinue features where
          needed for reliability, security, legal compliance, or product development.
        </p>
      </section>

      <section aria-labelledby="h-privacy">
        <h2 id="h-privacy">8. Privacy</h2>
        <p>
          Personal data is handled under the <a href="/privacy">Privacy policy</a>. That policy explains processing
          of prompts, generated projects, authentication data, billing metadata, analytics, and operational logs.
        </p>
      </section>

      <section aria-labelledby="h-law">
        <h2 id="h-law">9. Governing law</h2>
        <p>
          Governing law and venue are pending final incorporation data. Nothing in these terms removes mandatory
          consumer protections that apply in your country of residence.
        </p>
      </section>
    </main>
    ${renderMarketingTopBarScript()}
    ${renderLaunchBackdropScript()}
  </body>
</html>`
}
