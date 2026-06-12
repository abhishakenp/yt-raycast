# Ship Fast Remaining TODO

Snapshot: 2026-06-11

Completed/restored migration rows have been removed from this file. Keep this document limited to work that still needs implementation, provider proof, browser proof, or a product decision.

## P0 - Provider Acceptance

### 1. Billing Checkout And Export Unlock Proof

Status: implementation restored; signed-in sandbox acceptance pending.

Remaining work:

- Run signed-in Stripe sandbox checkout for subscription and credit-pack flows.
- Run signed-in Razorpay sandbox checkout for subscription and credit-pack flows.
- Replay or receive provider webhooks with valid signatures.
- Prove Convex billing state changes through the secret-gated webhook mutation.
- Prove export entitlement updates after payment: dashboard create export, ready state, and download for `html`, `react`, and `next` where practical.
- Prove anonymous or unpaid users still receive actionable payment-required responses.

Acceptance evidence to record:

- Checkout session/order IDs.
- Webhook event IDs or replay command output.
- Convex subscription or credit ledger state.
- Dashboard export unlock screenshots or headed-browser verifier output.

Latest implementation:

- `bun run verify:providers` now gates full billing proof on sandbox credentials and writes a provider evidence report.
- `scripts/verify-billing.mjs` now records checkout-start evidence and signed Stripe/Razorpay webhook state changes when signed auth and provider secrets are configured.

### 2. GitHub Push Provider Proof

Status: implementation restored; real provider acceptance pending.

Remaining work:

- Use a signed-in owner session with export access.
- Push generated files to a sandbox/test GitHub repository.
- Validate branch, commit SHA, repo URL, and generated file list.
- Verify non-owner access is forbidden.
- Verify missing payment/export access returns an actionable error.

Acceptance evidence to record:

- Test repo URL.
- Branch name and commit SHA.
- Export target pushed.
- File list for generated output.

Latest implementation:

- `bun run verify:github-provider` now pushes a prepared signed-in export session through `/api/sessions/:id/github/push` and records repo, branch, commit SHA, and file list.

## P1 - Browser And Generated-Site Acceptance

### 3. First-Party CMS Browser Proof

Status: source restored; real generated-site browser acceptance pending.

Remaining work:

- Generate a realistic session with CMS-friendly content such as SaaS, blog, and portfolio variants.
- Verify generated CMS bindings cover hero, features, pricing, FAQ, CTA, and collection-style content where applicable.
- Edit CMS content in the dashboard using headed browser verification.
- Reload the dashboard and prove edited content persists.
- Export the site and verify edited content appears in the downloaded output.

### 4. Brandfetch Design-Reference Generation Proof

Status: Brandfetch route/provider path and design-reference persistence verified; generation influence proof pending.

Remaining work:

- Prove the generated artifacts include brand/design-reference context beyond basic URL persistence.
- Capture preview/source/site-spec evidence showing brand profile or design reference influenced the generated site.
- Add or run a verifier that waits for generation to complete instead of stopping at queued session persistence.

Latest known evidence:

- `/api/brand-profile?domain=https://linear.app/customers` returned provider-backed Linear data with `logoProvider:"brandfetch"` and no provider warning.
- `/api/brand-profile?domain=https://stripe.com` returned provider-backed Stripe data with `logoProvider:"brandfetch"` and no provider warning.
- `verify:brand-localization` passed against the local app.
- Convex session `kh714nb2738923znw7pt8spcx588fd0e` persisted `designReferenceUrls:["https://linear.app/customers"]`, design-reference notes, and fingerprint `8a8f1cee`.
- Local generation polling for that session stayed `queued`, so generated-page influence remains unproven.

### 5. Localization Browser Proof

Status: route and language-cache runtime verified; browser generation acceptance pending.

Remaining work:

- Run a headed-browser generation flow for a non-English or Indian-language prompt.
- Verify the preferred language is persisted on the session.
- Verify generated copy follows the selected language/script.
- Verify inline edit and chat refinement preserve the selected language after reload.

### 6. SEO/AEO Real-Provider Quality Proof

Status: metadata routes and generated-site outputs verified; real-provider quality acceptance pending.

Remaining work:

- Run a full real-provider generation with current credentials.
- Verify generated preview HTML has title, description, canonical, robots, Open Graph, Twitter, JSON-LD, and `/llms.txt` discovery.
- Verify deployed preview metadata routes: `/preview/:slug`, `/preview/:slug/llms.txt`, `/preview/:slug/robots.txt`, and `/preview/:slug/sitemap.xml`.
- Verify exported ZIP includes `index.html`, `robots.txt`, `sitemap.xml`, and `llms.txt`.
- Review provider-produced content quality, not only metadata presence.

## P2 - Operations And QA

### 7. Convex-Scheduled Notification Proof

Status: direct Slack delivery verified; Convex-scheduled notification proof pending.

Remaining work:

- Fix the Convex CLI/admin path for self-hosted verifier commands.
- Rerun `bun run verify:monitoring -- --timeout-ms=90000`.
- Prove `internal.sessions.completeGeneration` records usage metrics and schedules operational notification delivery.
- Prove Slack and, if configured, Telegram notifications are delivered only for intended operational events.
- Run a real provider-backed generation and inspect usage metrics for actual provider, elapsed time, and cost.

Known blocker:

- Latest `verify:monitoring` reached `sessions:create` but failed during `internal.sessions.completeGeneration` with Convex CLI `TypeError: fetch failed`.
- For self-hosted Convex CLI commands, configure `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY`; runtime `CONVEX_URL` and `CONVEX_DEPLOYMENT` are not enough for admin CLI calls.

### 8. Release Verification Gate

Status: verifier surface restored; provider-gated release gate pending.

Remaining work:

- Keep fast local verifiers in `verify:qa`.
- Add provider-gated verifiers for billing, GitHub, Brandfetch/design-reference generation, CMS browser flow, localization browser flow, SEO/AEO real-provider quality, and operational notifications.
- Provider-gated verifiers must skip with clear messages when required credentials or signed-in tokens are absent.
- One release command should cover session creation, preview edit, export, auth, gallery, CMS, GitHub, billing, and browser-visible generation paths without hanging.

Latest implementation:

- `bun run verify:release` now runs the local QA gate followed by `bun run verify:providers`.
- Provider-gated checks skip with explicit missing env names when credentials or signed-in tokens are absent.

## Product Decision

### 9. Medusa Ecommerce Provisioning

Status: optional integration exists; product decision pending.

Decision needed:

- Keep Medusa as an optional advanced ecommerce integration, or remove it from the core migration backlog.

If kept, remaining work:

- Prove an ecommerce prompt creates a commerce-aware site.
- Provision or reuse tenant config.
- Sync products without duplication.
- Verify storefront cart creation/update against a real or sandbox backend.

Latest implementation:

- `bun run verify:medusa` now provisions a commerce session, syncs products twice, and verifies Medusa store config plus cart create/read against the configured sandbox backend.
