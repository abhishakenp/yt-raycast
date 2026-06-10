import { MarketingShell } from '../pricing/-MarketingShell'
import '@/styles/privacy-page.css'

const SITE_NAME = 'Ship Fast'
const SITE_URL = 'https://ship-fast.devliv.io'
const LEGAL_CONTROLLER_NAME = 'Livio Gama'
const PRIVACY_CONTACT_EMAIL = 'privacy@ship-fast.devliv.io'
const TERMS_EFFECTIVE_DATE = '2026-06-04'
const LEGAL_INCORPORATION_JURISDICTION = ''
const LEGAL_COMPANY_REGISTRATION_NUMBER = ''
const LEGAL_CONTROLLER_ADDRESS = ''
const LEGAL_REFUND_POLICY = ''

const mailtoHref = `mailto:${encodeURIComponent(PRIVACY_CONTACT_EMAIL)}`

const missingValue = (label: string) =>
  `<span class="legal-placeholder">Pending incorporation data: ${label}</span>`

const jurisdiction = LEGAL_INCORPORATION_JURISDICTION
  ? LEGAL_INCORPORATION_JURISDICTION
  : missingValue('jurisdiction')
const registration = LEGAL_COMPANY_REGISTRATION_NUMBER
  ? LEGAL_COMPANY_REGISTRATION_NUMBER
  : missingValue('company registration number')
const address = LEGAL_CONTROLLER_ADDRESS
  ? (LEGAL_CONTROLLER_ADDRESS as string).split(/\r?\n/).filter(Boolean).join('<br />')
  : missingValue('registered address')
const refunds = LEGAL_REFUND_POLICY
  ? LEGAL_REFUND_POLICY
  : 'Paid subscriptions and one-off purchases are provided according to the checkout terms shown at purchase time. Statutory rights are not limited.'

export const TermsPage = () => {
  return (
    <MarketingShell footer>
      <main className="page legal-doc">
        <header className="legal-header">
          <p className="kicker">Legal</p>
          <h1>Terms of service</h1>
          <p className="legal-meta">
            <strong>{SITE_NAME}</strong> ({SITE_URL}) · Effective date:{' '}
            <time dateTime={TERMS_EFFECTIVE_DATE}>{TERMS_EFFECTIVE_DATE}</time>
          </p>
        </header>

        <section aria-labelledby="h-operator">
          <h2 id="h-operator">1. Operator</h2>
          <p>These terms are between you and <strong>{LEGAL_CONTROLLER_NAME}</strong>, operating {SITE_NAME}.</p>
          <p>Incorporation jurisdiction: <span dangerouslySetInnerHTML={{ __html: jurisdiction }} /></p>
          <p>Company registration number: <span dangerouslySetInnerHTML={{ __html: registration }} /></p>
          <p className="legal-address" dangerouslySetInnerHTML={{ __html: address }} />
          <p>Contact: <a href={mailtoHref}>{PRIVACY_CONTACT_EMAIL}</a></p>
        </section>

        <section aria-labelledby="h-service">
          <h2 id="h-service">2. Service</h2>
          <p>
            {SITE_NAME} is an AI-assisted website generation product. You provide prompts, optional layout references,
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
            You must not use {SITE_NAME} to generate illegal, harmful, abusive, discriminatory, sexually explicit,
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
          <p dangerouslySetInnerHTML={{ __html: refunds }} />
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
    </MarketingShell>
  )
}
