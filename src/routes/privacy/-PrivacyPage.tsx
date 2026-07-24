import { withdrawMarketingConsent } from '@/features/partners/lib/marketing-consent'

import { MarketingShell } from '../pricing/-MarketingShell'

const SITE_NAME = 'Ship Fast'
const SITE_URL = 'https://ship-fast.ai'
const LEGAL_CONTROLLER_NAME = 'Surya Remanan and Abhishek Pandey'
const PRIVACY_CONTACT_EMAIL = 'hello@ship-fast.ai'
const PRIVACY_POLICY_EFFECTIVE_DATE = '2026-07-17'
const PRIVACY_POLICY_JURISDICTION = 'India'
const LEGAL_CONTROLLER_ADDRESS = ''

const mailtoHref = `mailto:${encodeURIComponent(PRIVACY_CONTACT_EMAIL)}`

export const PrivacyPage = () => {
  return (
    <MarketingShell footer>
      <main className="legal-page relative z-[1] mx-auto w-[min(760px,calc(100%-48px))] px-0 pt-[88px] pb-24 font-sans text-base leading-[1.65] text-[#f0f0f5] [&_a]:text-[#26e7ff] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#69f8ff] [&_h2]:mb-3.5 [&_h2]:font-sans [&_h2]:text-[1.15rem] [&_h2]:tracking-[-0.02em] [&_h2]:text-[#f0f0f5] [&_h3]:mt-5 [&_h3]:mb-2.5 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#c4c9d4] [&_header_h1]:mb-3.5 [&_header_h1]:font-['Fraunces',Georgia,serif] [&_header_h1]:text-[clamp(1.75rem,4vw,2.25rem)] [&_header_h1]:tracking-[-0.03em] [&_header_h1]:text-white [&_li]:mb-2 [&_p]:mb-3 [&_section]:mb-6 [&_section]:rounded-[16px] [&_section]:border [&_section]:border-white/6 [&_section]:px-6 [&_section]:py-[22px] [&_section]:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.2)] [&_ul]:my-2.5 [&_ul]:ml-5">
        <header className="mb-10 border-b border-white/10 pb-7">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">
            Legal
          </p>
          <h1>Privacy policy</h1>
          <p className="text-sm text-[#c4c9d4]">
            <strong>{SITE_NAME}</strong> ({SITE_URL}, "we", "us") · Effective
            date:{' '}
            <time dateTime={PRIVACY_POLICY_EFFECTIVE_DATE}>
              {PRIVACY_POLICY_EFFECTIVE_DATE}
            </time>
          </p>
        </header>

        <section aria-labelledby="h-controller">
          <h2 id="h-controller">1. Who is responsible</h2>
          <p>
            The data controller for personal data processed through this
            service, unless stated otherwise, is
          </p>
          <p>
            <strong>{LEGAL_CONTROLLER_NAME}</strong>
          </p>
          {LEGAL_CONTROLLER_ADDRESS ? (
            <p className="legal-callout my-3 rounded-[10px] border border-white/10 px-4 py-3.5 text-[#f0f0f5]">
              {(LEGAL_CONTROLLER_ADDRESS as string)
                .split(/\r?\n/)
                .filter(Boolean)
                .map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx <
                      (LEGAL_CONTROLLER_ADDRESS as string)
                        .split(/\r?\n/)
                        .filter(Boolean).length -
                        1 && <br />}
                  </span>
                ))}
            </p>
          ) : (
            <p className="legal-callout my-3 rounded-[10px] border border-white/10 px-4 py-3.5 text-[#f0f0f5]">
              Postal address: supplied on a verified request to{' '}
              <a href={mailtoHref}>{PRIVACY_CONTACT_EMAIL}</a> (please send your
              request from the email address associated with your account, if
              any).
            </p>
          )}
          <p>
            Privacy and data-protection requests:{' '}
            <a href={mailtoHref}>{PRIVACY_CONTACT_EMAIL}</a>
          </p>
          {PRIVACY_POLICY_JURISDICTION ? (
            <p>
              Activities described in this notice include processing connected
              to <strong>{PRIVACY_POLICY_JURISDICTION}</strong>. Depending on
              your location, other laws may apply in addition.
            </p>
          ) : (
            <p>
              Depending on your location (for example the EEA, UK, Switzerland,
              India, or US states with privacy laws), you may have additional
              rights alongside those below. Nothing in this notice limits
              statutory protections.
            </p>
          )}
        </section>

        <section aria-labelledby="h-summary">
          <h2 id="h-summary">2. Summary</h2>
          <p>
            {SITE_NAME} is an AI-assisted product for generating website
            projects from text prompts. We process account data, the content you
            submit (including prompts and generated files), technical
            identifiers needed to run and protect the service, and limited
            analytics. Some processing is carried out by vendors (for example
            cloud hosting, authentication, payments, and AI inference) strictly
            to provide the product.
          </p>
        </section>

        <section aria-labelledby="h-collect">
          <h2 id="h-collect">3. What we collect</h2>
          <h3>3.1 Account and authentication</h3>
          <p>
            If you sign in, we use <strong>Clerk Authentication</strong> and may
            process your Clerk user ID, email address, and profile details
            provided by your identity provider (such as Google or GitHub) when
            you choose those options.
          </p>
          <h3>3.2 Projects, prompts, and generated output</h3>
          <p>
            We store the <strong>prompts and other instructions</strong> you
            submit and the <strong>generated project files</strong> needed to
            show previews, exports, deployments, and session history. This
            content is tied to your session and, when you are signed in, to your
            account.
          </p>
          <h3>3.3 Usage, security, and abuse prevention</h3>
          <p>
            We process <strong>IP addresses</strong>, request metadata,
            timestamps, and similar technical data for rate limiting, fraud
            prevention, reliability, and{' '}
            <strong>automated safety checks</strong> on user-submitted text
            (including logging that a request was blocked, with technical
            identifiers such as IP and account where available, without
            retaining the blocked text in security logs by design).
          </p>
          <h3>3.4 Analytics</h3>
          <p>
            We use <strong>Plausible Analytics</strong> configured for
            first-party collection via this site's endpoint. Plausible is
            designed to minimise personal data; please see Plausible's
            documentation for details.
          </p>
          <h3>3.5 Partner attribution and partner programme</h3>
          <p>
            With your consent, we use <strong>Dub</strong> to attribute visits
            from partner referral links. Dub may set a{' '}
            <strong>dub_id marketing cookie</strong> for up to 30 days and
            process a referral click identifier, referring page, landing page,
            and limited browser or device information. We do not load Dub's
            browser analytics until you allow marketing cookies.
          </p>
          <p>
            If you create or use an account after a referral, we apply
            first-source attribution: the earliest eligible native referral or
            Dub partner referral is associated with your account. We may send
            Dub a stable account identifier and limited profile information,
            such as your name and email address, to record the referred signup
            and provide the partner portal.
          </p>
          <p>
            For enrolled partners, Dub supports referral reporting, commissions
            and payouts. For eligible subscription purchases and refunds, we
            send transaction identifiers, amount, currency, status, and payment
            processor type. Payout and tax information you submit directly to
            Dub is governed by Dub's privacy notice.
          </p>
          <h3>3.6 Payments</h3>
          <p>
            Paid features are processed through{' '}
            <strong>Stripe and Razorpay</strong>. We do not receive your full
            payment card number on our servers; payment data is handled by the
            payment provider. We receive status information (for example
            subscription state, invoices, refunds, or credit purchases) through
            our billing integrations and may store it in <strong>Convex</strong>{' '}
            associated with your account. Eligible partner-attributed
            subscription events are also reported to Dub as described above.
          </p>
          <h3>3.7 Optional operations notifications</h3>
          <p>
            If we configure an operations webhook (for example Slack), certain
            events in production may post
            <strong>
              truncated prompt text and user or billing metadata
            </strong>{' '}
            to that system for monitoring. This is disabled in development by
            default and only applies when such an integration is enabled.
          </p>
          <h3>3.8 AI and media providers</h3>
          <p>
            To generate sites and imagery we may send{' '}
            <strong>portions of your prompt and derived instructions</strong>
            to model and infrastructure providers (such as <strong>Groq</strong>
            , <strong>Runpod</strong> where configured, and stock providers such
            as <strong>Pexels</strong> or <strong>Unsplash</strong> for image
            search). Those providers act as further processors and have their
            own terms and privacy notices.
          </p>
          <h3>3.9 GitHub integration</h3>
          <p>
            If you connect GitHub, tokens or credentials required for repository
            actions are handled according to that integration;{' '}
            <strong>do not paste secrets into prompts</strong>.
          </p>
        </section>

        <section aria-labelledby="h-use">
          <h2 id="h-use">4. Why we use data (purposes)</h2>
          <ul>
            <li>
              To provide {SITE_NAME}, including creating and displaying your
              projects and processing exports.
            </li>
            <li>
              To authenticate you and manage your account, quotas, and
              entitlements.
            </li>
            <li>
              To process payments and prevent abuse of billing or promotional
              programmes.
            </li>
            <li>
              With consent, to attribute partner referrals; and to administer
              partner enrollment, reporting, commissions, refunds, and payouts.
            </li>
            <li>
              To secure the service, enforce acceptable use (including automated
              content rules), and investigate incidents.
            </li>
            <li>
              To understand aggregate product usage and improve stability and
              performance.
            </li>
            <li>
              To comply with legal obligations and respond to lawful requests.
            </li>
          </ul>
        </section>

        <section aria-labelledby="h-legal-basis">
          <h2 id="h-legal-basis">
            5. Legal bases (EEA, UK, Switzerland, and similar)
          </h2>
          <p>
            Where GDPR-style rules apply, we rely on the following bases as
            appropriate:
          </p>
          <ul>
            <li>
              <strong>Contract</strong> — providing the service you request.
            </li>
            <li>
              <strong>Legitimate interests</strong> — security, abuse
              prevention, product improvement, and proportionate analytics,
              balanced against your rights.
            </li>
            <li>
              <strong>Legal obligation</strong> — where the law requires
              processing or retention.
            </li>
            <li>
              <strong>Consent</strong> — where we expressly ask for it (for
              example Dub marketing cookies and optional communications), which
              you may withdraw.
            </li>
          </ul>
        </section>

        <section aria-labelledby="h-sharing">
          <h2 id="h-sharing">6. Recipients and subprocessors</h2>
          <p>We share data with categories of recipients including:</p>
          <ul>
            <li>Clerk (Authentication services)</li>
            <li>Convex (Database and backend services for billing data)</li>
            <li>Stripe and Razorpay (payments)</li>
            <li>
              Dub (consent-based partner attribution and partner programme
              administration)
            </li>
            <li>Plausible Analytics</li>
            <li>
              AI, GPU, or inference providers (for example Groq, Runpod) and
              stock imagery APIs (for example Pexels, Unsplash)
            </li>
            <li>
              Infrastructure and deployment providers that host ship-fast.ai and
              related services
            </li>
            <li>Professional advisers or authorities where required by law</li>
          </ul>
        </section>

        <section aria-labelledby="h-transfers">
          <h2 id="h-transfers">7. International transfers</h2>
          <p>
            We and our vendors may process data in{' '}
            <strong>
              Switzerland, the EEA, the United Kingdom, the United States,
              India,
            </strong>{' '}
            and other countries where service providers operate. Where required,
            we implement appropriate safeguards (such as Standard Contractual
            Clauses or equivalent mechanisms) and can provide more information
            on request.
          </p>
        </section>

        <section aria-labelledby="h-retention">
          <h2 id="h-retention">8. Retention</h2>
          <p>
            We keep personal data only as long as needed for the purposes above,
            including any legal, accounting, or reporting requirements. Session
            and project data are kept until you delete them or your account, or
            until we delete them under our data lifecycle rules. Technical logs
            may be kept for a shorter operational period.
          </p>
          <p>
            The Dub browser attribution cookie lasts for up to 30 days unless
            you withdraw consent sooner. Account-level attribution and partner
            transaction records may be kept while your account or partner
            relationship remains active and afterward where needed for
            accounting, fraud prevention, disputes, or legal obligations.
            Withdrawing marketing consent clears the Dub cookie from this
            browser and stops future Dub browser tracking; it does not
            automatically erase records already required for those purposes.
          </p>
        </section>

        <section aria-labelledby="h-rights">
          <h2 id="h-rights">9. Your rights</h2>
          <p>Subject to applicable law, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal data</li>
            <li>Restrict or object to certain processing</li>
            <li>Data portability where technically feasible</li>
            <li>Withdraw consent where processing is consent-based</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p>
            To exercise these rights, contact{' '}
            <a href={mailtoHref}>{PRIVACY_CONTACT_EMAIL}</a>. We may need to
            verify your identity before fulfilling a request.
          </p>
          <button
            className="mt-2 rounded-[6px] border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            onClick={withdrawMarketingConsent}
            type="button"
          >
            Withdraw marketing consent
          </button>
        </section>

        <section aria-labelledby="h-security">
          <h2 id="h-security">10. Security</h2>
          <p>
            We implement technical and organisational measures appropriate to
            the risk, including access controls and encryption in transit where
            supported by our providers. No method of transmission over the
            Internet is completely secure.
          </p>
        </section>

        <section aria-labelledby="h-children">
          <h2 id="h-children">11. Children</h2>
          <p>
            {SITE_NAME} is not directed at children under the age where parental
            consent is required in their jurisdiction. We do not knowingly
            collect personal information from children. Our acceptable-use rules
            prohibit sexual content involving minors and related abuses;
            violations may be blocked and logged.
          </p>
        </section>

        <section aria-labelledby="h-changes">
          <h2 id="h-changes">12. Changes</h2>
          <p>
            We may update this notice. The effective date at the top will change
            when we do. For material changes we will provide notice as required
            by law or through the product.
          </p>
        </section>

        <section aria-labelledby="h-contact">
          <h2 id="h-contact">13. Contact</h2>
          <p>
            Questions about this policy:{' '}
            <a href={mailtoHref}>{PRIVACY_CONTACT_EMAIL}</a>
          </p>
          <p>
            Public site: <a href={`${SITE_URL}/`}>{SITE_URL}/</a>
          </p>
        </section>
      </main>
    </MarketingShell>
  )
}
