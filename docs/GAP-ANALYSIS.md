# Ship Fast Production Readiness — Gap Analysis

**Generated:** 2026-08-01 · **Sources:** Interview answers (30/59), launch readiness audits, security reviews, infra decisions

## Status Overview

| Dimension | Decided | Undecided | Blockers |
|-----------|---------|-----------|----------|
| Product & pricing | ✅ | 3 questions | 0 |
| Access & visibility | ✅ | 2 questions | 0 |
| Data & retention | ✅ | 5 questions | 0 |
| Billing & entitlements | ✅ | 8 questions | 4 critical |
| Security & identity | ⚠️ partial | 7 questions | 2 critical |
| Generation & exports | ⚠️ partial | 10 questions | 3 critical |
| Infrastructure & ops | ⚠️ partial | 10 questions | 5 critical |
| Legal & compliance | ❌ | 3 questions | 3 critical |
| QA & CI | ❌ | 5 questions | 2 critical |

## Critical Path to Launch

### Must Fix (Security & Revenue)

| # | Issue | Source | Status |
|---|-------|--------|--------|
| 1 | `confirmCheckoutSubscription` public mutation — free Pro minting | Security audit | ❌ |
| 2 | Razorpay `halted` → `active` default — failed payments grant access | Security audit | ❌ |
| 3 | No Stripe webhook route — payments never reconcile | Security audit | ❌ |
| 4 | Recurring webhook idempotency collision | Security audit | ❌ |
| 5 | `/api/rewrite` unauthenticated + unmetered LLM endpoint | Security audit | ❌ |
| 6 | No spend cap / kill switch | Security audit | ❌ |
| 7 | Preview HTML XSS — same-origin script execution | Security audit | ❌ |
| 8 | `gallery_preview_images` lost ownership check | Re-review | ❌ |
| 9 | `clearCache` mutation with zero auth — total gallery wipe | Re-review | ❌ |

### Must Fix (Operations)

| # | Issue | Source | Status |
|---|-------|--------|--------|
| 10 | Zero backups — RPO = ∞, RTO = ∞ | Infra audit | ❌ |
| 11 | Everything on TEST keys (Clerk, Stripe, Razorpay) | Launch audit | ❌ |
| 12 | Plaintext secrets in untracked files — one `git add -A` from history | Launch audit | ❌ |
| 13 | `VITE_PEXELS_API_KEY` / Unsplash key in client-bundled code | Launch audit | ❌ |
| 14 | CI is red (17 typecheck errors, 6 test failures) | Launch audit | ❌ |
| 15 | OOM killer fired 17× — swap exhausted, XRDP desktop on prod | Infra audit | ❌ |
| 16 | In-flight generations stranded permanently on redeploy | Infra audit | ❌ |

### Must Fix (Legal)

| # | Issue | Source | Status |
|---|-------|--------|--------|
| 17 | No refund policy — selling into EU/UK/India | Launch audit | ❌ |
| 18 | No account/data deletion — GDPR non-compliant | Launch audit | ❌ |
| 19 | No error monitoring, structured logging, or alerting | Launch audit | ❌ |

## Spec Status By Category

### Product & Pricing — SPEC COMPLETE ✅
- Pro price: ₹999
- Free = public/indexable, Paid = private
- Export branding by payment status
- Retry without cost
- Browser baseline: React only

### Access & Visibility — SPEC COMPLETE ✅
- Public/private based on payment
- Expired users: new = public, past = private
- Same URL format, ID-level distinction

### Entitlements — SPEC COMPLETE ✅
- 1-2 month grace period
- Edit blocking, websites stay live
- Full restore on payment

### Data & Retention — SPEC COMPLETE ✅
- Logical deletion only (boolean filter)
- Real deletion on explicit GDPR request
- Daily backups at infra level
- GitHub tokens: retain, delete on request

### API & Versioning — SPEC COMPLETE ✅
- Semantic versioning, 6-month deprecation
- `nextjs` alias never retires
- User-friendly errors, hide internals

### SEO/AEO — SPEC COMPLETE ✅
- Both mandatory, AEO as differentiator
- Need to study and spec details

### Security — PARTIAL ⚠️
- Error messages decided ✅
- Session field classification — UNDECIDED
- Anonymous secrets (query string vs headers) — UNDECIDED
- IP identifier handling — UNDECIDED
- Identity conflict resolution — UNDECIDED
- Moderation appeals — UNDECIDED
- AI capsule sandboxing — UNDECIDED

### Billing — PARTIAL ⚠️
- Quota management: manual, dev-only ✅
- Webhook secret rotation — UNDECIDED
- Fraud review — UNDECIDED
- Commerce isolation proof — UNDECIDED
- Reconciliation procedures — UNDECIDED
- 4 critical security blockers remain

### Generation — PARTIAL ⚠️
- Structural repairs hidden ✅
- Stable API contracts — UNDECIDED
- DSL versioning — UNDECIDED
- Provider SLOs — UNDECIDED
- Model output retention — UNDECIDED
- Registry capsule classification — UNDECIDED
- Realtime section contracts — UNDECIDED
- 3 critical security blockers remain (Svelte XSS, SSR execution, moderation bypass)

### Infrastructure — PARTIAL ⚠️
- Notifications: Slack only ✅
- Incident communication: X/Twitter ✅
- Maintenance wall: spec'd ✅
- Convex Cloud migration — DECIDED but not executed
- Secret rotation — UNDECIDED
- Config drift detection — UNDECIDED
- Admin-key TTL — UNDECIDED
- Provider privacy obligations — UNDECIDED
- Required dashboards — UNDECIDED
- Rollback policies — UNDECIDED

### QA & CI — INCOMPLETE ❌
- Verification scripts ownership — UNDECIDED
- Staging data policy — UNDECIDED
- Launch definition of done — UNDECIDED
- Performance SLOs — UNDECIDED
- CI is red, tests fail, typecheck broken

### Legal & Compliance — INCOMPLETE ❌
- Refund policy: empty string
- No account deletion
- No GDPR erasure path
- No error monitoring

## Feature Implementation Queue

Based on interview decisions, ordered by launch criticality:

| # | Feature | Interview Q | Effort | Blocks Launch |
|---|---------|-------------|--------|---------------|
| 1 | Retry-without-cost logic | Q4 | Medium | Yes |
| 2 | Public/private session toggle | Q2, Q16 | Medium | Yes |
| 3 | Entitlement grace period (1-2mo) | Q39 | Large | Yes |
| 4 | Maintenance wall | Q59 | Small | No |
| 5 | Export branding (free badge) | Q27 | Small | No |
| 6 | Logical deletion filter | Q20 | Medium | No |
| 7 | SEO/AEO spec and implementation | Q35 | Large | No |

## Next Actions

1. **Immediate:** Fix 19 must-fix items above
2. **This week:** Research and answer 38 undecided technical questions
3. **Before revenue:** Implement entitlement grace period, public/private toggle
4. **Before launch:** Green CI, provider acceptance testing, live keys, backups

---

**Status:** ACTIVE — 19 blockers, 38 undecided decisions, 7 features spec'd for implementation
