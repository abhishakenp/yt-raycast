# Security Findings

Date: 2026-06-04

Scope: launch-blocking Ship Fast generation, auth, quota, payments, export, and notification paths.

## Implemented Controls

- Authentication stays on the existing Firebase flow.
- Anonymous quota remains server-enforced at 2 generations per IP/day.
- Subscribed quota is capped at 5 generations/month.
- Internal IP bypass uses `WHITELISTED_IPS` and skips generation rate limits for trusted addresses.
- Private generations are accepted only for authenticated subscribed users.
- Prompt safety now hard-blocks obvious gibberish, adult/sexual prompts, racist/offensive prompts, phishing/scam/malware prompts, illegal marketplace prompts, weapon/drug prompts, and counterfeit/brand-clone prompts before quota is consumed.
- Free exports include a Ship Fast badge; paid exports and paid GitHub pushes omit it.
- Partner coupons must validate against configured provider IDs before checkout starts.
- Per-generation monitoring writes local usage records and can notify Slack/Telegram when monthly tracked cost crosses the configured threshold.

## Remaining Risks

- The prompt policy is deterministic and conservative. It is suitable for hard blocking obvious launch risks, but it is not a full trust-and-safety moderation system.
- IP whitelisting trusts proxy-derived client IPs. Production must keep `trust proxy` aligned with the actual ingress layer.
- GitHub export verification still depends on a live GitHub token and an external repository write path.
- Stripe/Razorpay webhook authenticity should be checked in the deployed environment with real provider signatures.
- Slack/Telegram webhooks are implemented but inert until env vars are populated.

## Recommended Next Pass

- Add provider-signature fixture tests for Stripe and Razorpay webhooks.
- Add a small admin/report page for monthly generation usage and quota utilization.
- Add uptime monitors for `/health`, homepage, dashboard, and one preview URL.
- Run a short black-box abuse pass against `/api/sessions`, export download, GitHub push, and payment start routes before public traffic.
