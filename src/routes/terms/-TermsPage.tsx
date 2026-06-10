import { MarketingShell } from '../pricing/-MarketingShell'

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

export const TermsPage = () => {
  return (
    <MarketingShell footer>
      <main className="relative z-[1] mx-auto w-[min(760px,calc(100%-48px))] px-0 pt-[88px] pb-24 font-sans text-base leading-[1.65] text-[var(--text-primary)] [&_a]:text-[var(--accent-primary)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--accent-hover)] [&_h2]:mb-3.5 [&_h2]:font-sans [&_h2]:text-[1.15rem] [&_h2]:tracking-[-0.02em] [&_h2]:text-[var(--text-primary)] [&_h3]:mt-5 [&_h3]:mb-2.5 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#c4c9d4] [&_header_h1]:mb-3.5 [&_header_h1]:font-[var(--font-display)] [&_header_h1]:text-[clamp(1.75rem,4vw,2.25rem)] [&_header_h1]:tracking-[-0.03em] [&_header_h1]:text-white [&_li]:mb-2 [&_p]:mb-3 [&_section]:mb-6 [&_section]:rounded-[var(--radius-lg)] [&_section]:border [&_section]:border-[var(--glass-border)] [&_section]:bg-[var(--glass-bg)] [&_section]:px-6 [&_section]:py-[22px] [&_section]:shadow-[var(--glass-shadow)] [&_ul]:my-2.5 [&_ul]:ml-5">
        <header className="mb-10 border-b border-white/10 pb-7">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">Legal</p>
          <h1>Terms of service</h1>
          <p className="text-sm text-[#c4c9d4]">
            <strong>{SITE_NAME}</strong> ({SITE_URL}) · Effective date:{' '}
            <time dateTime={TERMS_EFFECTIVE_DATE}>{TERMS_EFFECTIVE_DATE}</time>
          </p>
        </header>

        <section aria-labelledby="h-operator">
          <h2 id="h-operator">1. Operator</h2>
          <p>These terms are between you and <strong>{LEGAL_CONTROLLER_NAME}</strong>, operating {SITE_NAME}.</p>
          <p>Incorporation jurisdiction: <span>{LEGAL_INCORPORATION_JURISDICTION || <span className="text-[var(--warning)]">Pending incorporation data: jurisdiction</span>}</span></p>
          <p>Company registration number: <span>{LEGAL_COMPANY_REGISTRATION_NUMBER || <span className="text-[var(--warning)]">Pending incorporation data: company registration number</span>}</span></p>
          <p className="my-3 rounded-[10px] border border-white/10 bg-[#111113] px-4 py-3.5 text-[var(--text-primary)]">
            {LEGAL_CONTROLLER_ADDRESS ? (
              (LEGAL_CONTROLLER_ADDRESS as string).split(/\r?\n/).filter(Boolean).map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < (LEGAL_CONTROLLER_ADDRESS as string).split(/\r?\n/).filter(Boolean).length - 1 && <br />}
                </span>
              ))
            ) : (
              <span className="text-[var(--warning)]">Pending incorporation data: registered address</span>
            )}
          </p>
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
          <p>{LEGAL_REFUND_POLICY || 'Paid subscriptions and one-off purchases are provided according to the checkout terms shown at purchase time. Statutory rights are not limited.'}</p>
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
