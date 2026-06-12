# Provider Verification Runbook

Use this after the app and Convex backend are running.

```bash
bun run verify:providers -- --timeout-ms=180000 --report=docs/verification/provider-evidence.json
```

Provider-gated checks skip instead of failing when credentials are absent. A release proof is valid only when the relevant provider rows report `passed`.

## Required Evidence

- Billing: Stripe checkout session IDs, Razorpay subscription/order IDs, signed webhook event IDs, Convex subscription state, credit balance, and credit ledger rows.
- GitHub: `GITHUB_VERIFY_SESSION_ID`, sandbox repo URL/full name, branch, commit SHA, and generated file list.
- Browser generation: headed-browser output for brand/design-reference and localization prompts.
- CMS: headed-browser screenshot path, edited CMS field, preview version, history versions, and persisted Convex CMS content.
- SEO/AEO: preview URL checks plus exported `index.html`, `robots.txt`, `sitemap.xml`, and `llms.txt` evidence.
- Monitoring: usage metrics, `run_completed` event, and Slack/Telegram delivery when configured.
- Medusa: session commerce config, product sync counts, cart ID, and cart readback.

## Provider Env

- Billing: `SHIP_FAST_VERIFY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_CREDITS_3_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PRO_PLAN_ID`, `RAZORPAY_CREDITS_3_PAISE`, `RAZORPAY_WEBHOOK_SECRET`, `BILLING_WEBHOOK_MUTATION_SECRET`.
- GitHub: `SHIP_FAST_VERIFY_AUTH_TOKEN`, `GITHUB_VERIFY_TOKEN`, `GITHUB_VERIFY_REPO`, `GITHUB_VERIFY_SESSION_ID`; optional negative checks use `GITHUB_VERIFY_NON_OWNER_TOKEN` and `GITHUB_VERIFY_UNPAID_SESSION_ID`.
- Browser gates: `SHIP_FAST_VERIFY_BROWSER=true` for browser-only checks; `SHIP_FAST_VERIFY_REAL_GENERATION=true` for provider-backed generation checks.
- Convex self-hosted monitoring: `CONVEX_SELF_HOSTED_URL`, `CONVEX_SELF_HOSTED_ADMIN_KEY`.
- Medusa: `SHIP_FAST_VERIFY_MEDUSA=true`, `MEDUSA_BACKEND_URL`, `MEDUSA_PUBLISHABLE_API_KEY`; optional `MEDUSA_ADMIN_URL`, `MEDUSA_STOREFRONT_URL`.
