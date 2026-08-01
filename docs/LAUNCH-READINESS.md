# Launch readiness register

## Launch contract

- Convex Cloud is the application backend; Dokploy hosts the web application.
- India launch payments are Razorpay-only. `STRIPE_ENABLED=false` is an invariant.
- The only subscription is Pro at ₹999/month. Early Adopter is retired.
- Two qualified referrals earn a 50% discount.
- LinkForty provides referral links and click ingestion.
- Backups and credential rotation are accepted post-launch exceptions.

## Evidence register

| Requirement                         | Status   | Evidence / remaining gate                                                                   |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| CI for deployed SHA                 | verified | GitHub Actions run `30688823046` succeeded for `4b2c8cd4`.                                  |
| Production configuration            | verified | Dokploy build ran config drift successfully; Cloud functions deployed.                      |
| Live web service                    | verified | `GET /api/health` returned 200 with Convex reachable after rollout.                         |
| Razorpay key policy                 | verified | Runtime browser key is live-shaped; server credential previously passed Razorpay API probe. |
| Razorpay webhook guard              | verified | Unsigned live webhook returned 400 `Invalid webhook signature.`                             |
| LinkForty configuration             | verified | LinkForty enabled in web + Convex; short-link create, redirect, and deletion passed.        |
| LinkForty webhook guard             | verified | Unsigned live webhook returned 401 `Invalid signature.`                                     |
| LinkForty click ingestion           | pending  | Send a signed safe click event and verify exactly one Convex event.                         |
| Payment entitlement/referral/export | pending  | Requires an authorized real or sandbox Razorpay subscription and signed provider event.     |
| Groq Zero Data Retention            | pending  | Requires Console Data Controls evidence.                                                    |
| Monitoring/alerts                   | pending  | Require dashboard and alert-delivery evidence.                                              |
| GDPR external deletion              | pending  | Require enabled-provider deletion evidence or no-data attestations.                         |

## Change control

Any change to payment provider, subscription plan, referral rule, environment placement,
or launch gate updates this register with a command, dated artifact, and rollback note.

## Commerce PR

PR #135 adds customer-isolated Medusa infrastructure. It is not a payment-launch
prerequisite. It requires its own tenant-isolation, lifecycle, and live-provider
acceptance record before being enabled as a launch promise.
