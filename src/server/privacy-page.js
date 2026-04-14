import {
  BASE_DOMAIN,
  LEGAL_CONTROLLER_ADDRESS,
  LEGAL_CONTROLLER_NAME,
  PLAUSIBLE_DOMAIN,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_EFFECTIVE_DATE,
  PRIVACY_POLICY_JURISDICTION,
  SITE_NAME,
  SITE_URL,
} from '../config.js'
import { escapeHtml } from '../renderers/shared.js'

const mailtoHref = `mailto:${encodeURIComponent(PRIVACY_CONTACT_EMAIL)}`

export const renderPrivacyPage = () => {
  const controllerAddressHtml = LEGAL_CONTROLLER_ADDRESS
    ? `<p class="legal-address">${escapeHtml(LEGAL_CONTROLLER_ADDRESS).split(/\r?\n/).filter(Boolean).join('<br />')}</p>`
    : `<p class="legal-address">Postal address: supplied on a verified request to <a href="${mailtoHref}">${escapeHtml(PRIVACY_CONTACT_EMAIL)}</a> (please send your request from the email address associated with your account, if any).</p>`

  const jurisdictionBlock = PRIVACY_POLICY_JURISDICTION
    ? `<p>Activities described in this notice include processing connected to <strong>${escapeHtml(PRIVACY_POLICY_JURISDICTION)}</strong>. Depending on your location, other laws may apply in addition.</p>`
    : `<p>Depending on your location (for example the EEA, UK, Switzerland, India, or US states with privacy laws), you may have additional rights alongside those below. Nothing in this notice limits statutory protections.</p>`

  const site = escapeHtml(SITE_NAME)
  const siteUrl = escapeHtml(SITE_URL)
  const domain = escapeHtml(BASE_DOMAIN)
  const plausible = escapeHtml(PLAUSIBLE_DOMAIN)
  const controller = escapeHtml(LEGAL_CONTROLLER_NAME)
  const email = escapeHtml(PRIVACY_CONTACT_EMAIL)
  const effective = escapeHtml(PRIVACY_POLICY_EFFECTIVE_DATE)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${site} — Privacy policy</title>
    <meta
      name="description"
      content="How ${site} collects, uses, and shares personal data when you use ${siteUrl}."
    />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${siteUrl}/privacy" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script defer data-domain="${plausible}" data-api="/api/event" src="/js/script.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/styles/privacy.css" />
  </head>
  <body>
    <div class="bg-glow" aria-hidden="true"></div>
    <nav class="site-nav" aria-label="Main navigation">
      <div class="nav-inner">
        <a href="/" class="nav-brand" aria-label="${site} home">
          <span class="nav-logo-text">SHIP FAST</span>
        </a>
        <nav class="nav-links" aria-label="Page links">
          <a href="/">Home</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy" class="active" aria-current="page">Privacy</a>
        </nav>
        <a href="/" class="nav-cta">Get started</a>
      </div>
    </nav>

    <main class="page legal-doc">
      <header class="legal-header">
        <p class="kicker">Legal</p>
        <h1>Privacy policy</h1>
        <p class="legal-meta">
          <strong>${site}</strong> (${siteUrl}, “we”, “us”) &middot; Effective date:
          <time datetime="${PRIVACY_POLICY_EFFECTIVE_DATE}">${effective}</time>
        </p>
      </header>

      <section aria-labelledby="h-controller">
        <h2 id="h-controller">1. Who is responsible</h2>
        <p>
          The data controller for personal data processed through this service, unless stated otherwise, is
        </p>
        <p><strong>${controller}</strong></p>
        ${controllerAddressHtml}
        <p>
          Privacy and data-protection requests:
          <a href="${mailtoHref}">${email}</a>
        </p>
        ${jurisdictionBlock}
      </section>

      <section aria-labelledby="h-summary">
        <h2 id="h-summary">2. Summary</h2>
        <p>
          ${site} is an AI-assisted product for generating website projects from text prompts. We process account
          data, the content you submit (including prompts and generated files), technical identifiers needed to run
          and protect the service, and limited analytics. Some processing is carried out by vendors (for example
          cloud hosting, authentication, payments, and AI inference) strictly to provide the product.
        </p>
      </section>

      <section aria-labelledby="h-collect">
        <h2 id="h-collect">3. What we collect</h2>
        <h3>3.1 Account and authentication</h3>
        <p>
          If you sign in, we use <strong>Firebase Authentication</strong> (Google LLC) and may process your
          Firebase user ID, email address, and profile details provided by your identity provider (such as Google or
          GitHub) when you choose those options. If you use email and password sign-in, we process your email address
          and credentials through Firebase.
        </p>
        <h3>3.2 Projects, prompts, and generated output</h3>
        <p>
          We store the <strong>prompts and other instructions</strong> you submit and the <strong>generated project
          files</strong> needed to show previews, exports, deployments, and session history. This content is tied to
          your session and, when you are signed in, to your account.
        </p>
        <h3>3.3 Usage, security, and abuse prevention</h3>
        <p>
          We process <strong>IP addresses</strong>, request metadata, timestamps, and similar technical data for
          rate limiting, fraud prevention, reliability, and <strong>automated safety checks</strong> on user-submitted
          text (including logging that a request was blocked, with technical identifiers such as IP and account where
          available, without retaining the blocked text in security logs by design).
        </p>
        <h3>3.4 Analytics</h3>
        <p>
          We use <strong>Plausible Analytics</strong> (${plausible}) configured for first-party collection via this
          site’s endpoint. Plausible is designed to minimise personal data; please see Plausible’s documentation for
          details.
        </p>
        <h3>3.5 Payments</h3>
        <p>
          Paid features are processed through <strong>Razorpay</strong>.
          We do not receive your full payment card number on our servers; payment data is handled by the payment
          provider. We receive status information (for example subscription state or credit purchases) through our
          billing integration and may store it in <strong>Google Cloud Firestore</strong> associated with your
          account.
        </p>
        <h3>3.6 Optional operations notifications</h3>
        <p>
          If we configure an operations webhook (for example Slack), certain events in production may post
          <strong>truncated prompt text and user or billing metadata</strong> to that system for monitoring. This is
          disabled in development by default and only applies when such an integration is enabled.
        </p>
        <h3>3.7 AI and media providers</h3>
        <p>
          To generate sites and imagery we may send <strong>portions of your prompt and derived instructions</strong>
          to model and infrastructure providers (such as <strong>Groq</strong>, <strong>Runpod</strong> where
          configured, and stock providers such as <strong>Pexels</strong> or <strong>Unsplash</strong> for image
          search). Those providers act as further processors and have their own terms and privacy notices.
        </p>
        <h3>3.8 GitHub integration</h3>
        <p>
          If you connect GitHub, tokens or credentials required for repository actions are handled according to that
          integration; <strong>do not paste secrets into prompts</strong>.
        </p>
      </section>

      <section aria-labelledby="h-use">
        <h2 id="h-use">4. Why we use data (purposes)</h2>
        <ul>
          <li>To provide ${site}, including creating and displaying your projects and processing exports.</li>
          <li>To authenticate you and manage your account, quotas, and entitlements.</li>
          <li>To process payments and prevent abuse of billing or promotional programmes.</li>
          <li>To secure the service, enforce acceptable use (including automated content rules), and investigate incidents.</li>
          <li>To understand aggregate product usage and improve stability and performance.</li>
          <li>To comply with legal obligations and respond to lawful requests.</li>
        </ul>
      </section>

      <section aria-labelledby="h-legal-basis">
        <h2 id="h-legal-basis">5. Legal bases (EEA, UK, Switzerland, and similar)</h2>
        <p>Where GDPR-style rules apply, we rely on the following bases as appropriate:</p>
        <ul>
          <li><strong>Contract</strong> — providing the service you request.</li>
          <li><strong>Legitimate interests</strong> — security, abuse prevention, product improvement, and proportionate analytics, balanced against your rights.</li>
          <li><strong>Legal obligation</strong> — where the law requires processing or retention.</li>
          <li><strong>Consent</strong> — where we expressly ask for it (for example optional communications), which you may withdraw.</li>
        </ul>
      </section>

      <section aria-labelledby="h-sharing">
        <h2 id="h-sharing">6. Recipients and subprocessors</h2>
        <p>We share data with categories of recipients including:</p>
        <ul>
          <li>Google (Firebase Authentication, Firestore, and related Google Cloud services)</li>
          <li>Razorpay (payments)</li>
          <li>Plausible Analytics</li>
          <li>AI, GPU, or inference providers (for example Groq, Runpod) and stock imagery APIs (for example Pexels, Unsplash)</li>
          <li>Infrastructure and deployment providers that host ${domain} and related services</li>
          <li>Professional advisers or authorities where required by law</li>
        </ul>
      </section>

      <section aria-labelledby="h-transfers">
        <h2 id="h-transfers">7. International transfers</h2>
        <p>
          We and our vendors may process data in <strong>Switzerland, the EEA, the United Kingdom, the United States,
          India,</strong> and other countries where service providers operate. Where required, we implement appropriate
          safeguards (such as Standard Contractual Clauses or equivalent mechanisms) and can provide more
          information on request.
        </p>
      </section>

      <section aria-labelledby="h-retention">
        <h2 id="h-retention">8. Retention</h2>
        <p>
          We keep personal data only as long as needed for the purposes above, including any legal, accounting, or
          reporting requirements. Session and project data are kept until you delete them or your account, or until
          we delete them under our data lifecycle rules. Technical logs may be kept for a shorter operational period.
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
          To exercise these rights, contact <a href="${mailtoHref}">${email}</a>. We may need to verify your identity
          before fulfilling a request.
        </p>
      </section>

      <section aria-labelledby="h-security">
        <h2 id="h-security">10. Security</h2>
        <p>
          We implement technical and organisational measures appropriate to the risk, including access controls and
          encryption in transit where supported by our providers. No method of transmission over the Internet is
          completely secure.
        </p>
      </section>

      <section aria-labelledby="h-children">
        <h2 id="h-children">11. Children</h2>
        <p>
          ${site} is not directed at children under the age where parental consent is required in their jurisdiction.
          We do not knowingly collect personal information from children. Our acceptable-use rules prohibit sexual
          content involving minors and related abuses; violations may be blocked and logged.
        </p>
      </section>

      <section aria-labelledby="h-changes">
        <h2 id="h-changes">12. Changes</h2>
        <p>
          We may update this notice. The effective date at the top will change when we do. For material changes we
          will provide notice as required by law or through the product.
        </p>
      </section>

      <section aria-labelledby="h-contact">
        <h2 id="h-contact">13. Contact</h2>
        <p>
          Questions about this policy:
          <a href="${mailtoHref}">${email}</a>
        </p>
        <p>Public site: <a href="${siteUrl}/">${siteUrl}/</a></p>
      </section>
    </main>
  </body>
</html>`
}
