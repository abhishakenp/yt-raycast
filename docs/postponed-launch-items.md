# Postponed Launch Items

Date: 2026-06-04

These items were intentionally documented instead of fully implemented in this release.

## Design Review

Status: postponed.

Current state: the layout inspiration field was tightened in the homepage form, and the generation loading text/progress flow was polished. A full product design review still needs a browser pass across homepage, dashboard, payment modal, export panel, and mobile breakpoints.

## Pricing Review

Status: postponed.

Current state: paid generation copy and quota now use 5 subscribed generations/month. The existing checkout/payment flows remain. A pricing review should confirm public copy, partner discount rules, upgrade language, and whether extra-generation packs should exist.

## Kuma Uptime

Status: postponed.

Recommended checks:

- `GET /health`
- `GET /`
- `GET /pricing`
- `GET /dashboard` or the authenticated shell URL used in production
- One generated preview URL
- Payment webhook endpoint reachability

Alert routing should go to Slack first, with Telegram as fallback if the env vars are populated.

## Attack And Throttling Review

Status: postponed.

Current state: existing quota/rate-limit logic is preserved, and trusted internal IPs bypass limits. The next pass should stress anonymous generation, signed-in generation, private generation, export download, GitHub push, coupon validation, and payment start routes.

## Terms Of Service

Status: postponed for incorporation data.

Needed inputs:

- Legal company name
- Incorporation jurisdiction
- Registered address
- Contact email
- Refund policy wording
- Data retention wording for prompts, generated sites, exports, and billing metadata

Do not publish final ToS copy until those fields are confirmed.

## Stripe International And UPI Routing

Status: postponed.

Current state: Stripe and Razorpay paths remain separate. Partner coupons now support both providers when provider-specific IDs are configured.

Next checks:

- Confirm default global users route to Stripe.
- Confirm India/UPI users route to Razorpay.
- Confirm Stripe promotion codes and Razorpay offer IDs are mapped for the same partner code.
- Confirm failed coupon validation blocks checkout before provider redirect.

## Ship Fast Free Version

Status: skipped and documented.

Recommendation: keep a branch adapted from the existing app rather than regenerating from scratch. The free branch should remove auth-wall/paywall behavior deliberately and keep the export badge policy.

## Social Media And Buffer

Status: skipped and documented.

Recommended sequence:

- Reserve handles.
- Prepare Buffer workspace.
- Add brand profile, logo, and launch link.
- Draft first 10 launch posts after pricing and ToS are final.
