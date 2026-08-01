# Ship Fast Production Readiness — Gap Analysis

**Updated:** 2026-08-01 · **Status:** 59/59 questions answered, 19 blockers remain

## Status Overview

| Dimension              | Spec Status   | Blockers   |
| ---------------------- | ------------- | ---------- |
| Product & pricing      | ✅ COMPLETE   | 0          |
| Access & visibility    | ✅ COMPLETE   | 0          |
| Data & retention       | ✅ COMPLETE   | 0          |
| Security & identity    | ✅ COMPLETE   | 2 critical |
| Billing & entitlements | ✅ COMPLETE   | 4 critical |
| Generation & exports   | ✅ COMPLETE   | 3 critical |
| Infrastructure & ops   | ✅ COMPLETE   | 5 critical |
| Legal & compliance     | ❌ INCOMPLETE | 3 critical |
| QA & CI                | ❌ INCOMPLETE | 2 critical |

## Critical Path to Launch — 19 Blockers

### Security (9 blockers)

| #   | Issue                                                       | Fix                                           |
| --- | ----------------------------------------------------------- | --------------------------------------------- |
| 1   | `confirmCheckoutSubscription` public — free Pro minting     | Add provider verification inside mutation     |
| 2   | Razorpay `halted` → `active` — failed payments grant access | Event-name allowlist, never default to active |
| 3   | No Stripe webhook route                                     | Wire `createWebhookApiResponse` for Stripe    |
| 4   | Recurring webhook idempotency collision                     | Use `x-razorpay-event-id`                     |
| 5   | `/api/rewrite` unauthenticated LLM endpoint                 | Verify bearer token                           |
| 6   | No spend cap / kill switch                                  | Add `MODEL_DAILY_CALL_CAP`                    |
| 7   | Preview HTML XSS — same-origin execution                    | `default-src 'none'` + sandbox CSP            |
| 8   | `gallery_preview_images` lost ownership check               | Restore `assertCanMutateSession`              |
| 9   | `clearCache` mutation zero auth                             | Auth-gate or remove                           |

### Operations (5 blockers)

| #   | Issue                                         | Fix                                       |
| --- | --------------------------------------------- | ----------------------------------------- |
| 10  | Zero backups — RPO = ∞, RTO = ∞               | Daily pg_dump + off-box copy              |
| 11  | Everything on TEST keys                       | Switch to live Clerk/Stripe/Razorpay keys |
| 12  | Plaintext secrets in untracked files          | Rotate + `.gitignore` + scrub             |
| 13  | CI red (17 typecheck errors, 6 test failures) | Fix typecheck + tests                     |
| 14  | OOM killer 17×, swap exhausted                | Remove XRDP desktop from prod server      |

### Infrastructure (2 blockers)

| #   | Issue                                      | Fix                                       |
| --- | ------------------------------------------ | ----------------------------------------- |
| 15  | In-flight generations stranded on redeploy | Schedule `failIfStillStreaming` at +3 min |
| 16  | Disk 95% full                              | `docker builder prune -a` + unused images |

### Legal (3 blockers)

| #   | Issue                                      | Fix                                      |
| --- | ------------------------------------------ | ---------------------------------------- |
| 17  | No refund policy                           | Write legal refund policy text           |
| 18  | No GDPR deletion path for external systems | Add Medusa/Lakebed/GitHub deletion hooks |
| 19  | No error monitoring or structured logging  | Add LogRocket/Sentry                     |

## What Was Answered by AI Research

29 previously undecided technical questions now resolved. Source: codebase analysis + web research + security best practices.

| #   | Question                            | Answer                                                                             | Source                     |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| Q8  | Stable API contracts                | StableEngineArtifact + StableExportInput documented                                | Codebase                   |
| Q9  | CORS/CSRF controls                  | No CSRF needed (JWT). Add CORS for browser APIs                                    | OWASP research             |
| Q12 | Anonymous secrets: query vs headers | Headers only. Remove query param fallback                                          | OWASP ASVS 8.3.1, CWE-598  |
| Q13 | Identity conflict resolution        | Clerk > owner secret > clientId > IP                                               | Designed                   |
| Q14 | IP identifier handling              | 32-byte salt, 90-day retention, GDPR disclosure                                    | RSSAC040, GDPR Art 5(1)(e) |
| Q15 | Session field classification        | 6 fields overexposed: cost, medusaConfig, workspace, isPrivate, notes, fingerprint | Codebase analysis          |
| Q18 | Moderation appeals                  | Email-based, 48h SLA, 90-day retention                                             | Designed                   |
| Q19 | AI capsule sandboxing               | Validate JS, iframe sandbox, strip eval/Function                                   | Security best practices    |
| Q23 | Schema migration ownership          | Convex auto-migration. Dev team owns rollback                                      | Codebase                   |
| Q24 | State transition contracts          | Export: queued→building→ready/failed. Session: 8 states documented                 | Codebase analysis          |
| Q25 | Retry/idempotency standards         | Exponential backoff + jitter. `{scope}:{op}:{id}:{nonce}` keys                     | AWS/Stripe patterns        |
| Q26 | Content retention                   | Plan cache 24h, translation 7d, never cache raw prompts                            | Designed                   |
| Q28 | DSL versioning                      | Semver, parser supports last 2 major versions                                      | Designed                   |
| Q30 | Provider SLOs                       | Cerebras 5s P95, Groq 10s P95. Circuit breaker 5→60s                               | Codebase + research        |
| Q31 | Model output retention              | See Q26 — plan/translation cache only                                              | Designed                   |
| Q32 | Capsule classification              | stable/experimental/internal taxonomy with 58 primitives + 40 motifs classified    | Codebase analysis          |
| Q33 | Realtime section contracts          | EditableRealtimeSectionContract with 7 requirements                                | Codebase analysis          |
| Q34 | Cache invalidation                  | Content-addressed (export), TTL-based (plan/translation), manual API               | Codebase analysis          |
| Q36 | Signed downloads                    | Signed URLs with 1-hour expiry, revoke on session deletion                         | Designed                   |
| Q37 | Export migration                    | Stable exists, legacy active. Retire legacy with concrete date                     | Codebase analysis          |
| Q40 | Billing reconciliation              | Ledger exists. Add runbook + automated daily comparison                            | Codebase                   |
| Q41 | Webhook secret rotation             | 90-day, 7-day dual-secret overlap                                                  | Industry standard          |
| Q42 | Fraud review                        | Restore disposable email check. Manual review dashboard                            | Codebase                   |
| Q43 | Commerce isolation                  | Schema supports it. DokployInfraProvider is stub                                   | Codebase                   |
| Q44 | Data deletion auditing              | deleteAccount exists. Add external hooks + audit trail                             | Codebase                   |
| Q45 | Dokploy ownership                   | Assign owner. Acceptance test: provision + isolation + cleanup                     | Codebase                   |
| Q46 | Secret rotation/ownership           | 40+ secrets cataloged. Quarterly/semi-annual rotation                              | Codebase analysis          |
| Q47 | Config drift detection              | Pre-deploy script verifying env completeness                                       | Designed                   |
| Q48 | Convex env migration                | 5-phase migration: raw process.env → typed ctx.env                                 | Codebase analysis          |
| Q49 | Admin-key TTL                       | Convex Cloud migration is permanent fix                                            | Infra audit                |
| Q50 | Provider privacy                    | Groq ZDR enabled. Cerebras strong. Pollinations risky                              | Web research               |
| Q51 | Provider availability               | Multi-provider fallback chain + circuit breakers                                   | Designed                   |
| Q53 | Required dashboards                 | 4: generation perf, business, infra health, cost                                   | Designed                   |
| Q54 | Rollback policies                   | Per-service: app 15min, Convex 20min, Medusa 30min RTO                             | Designed                   |
| Q55 | Verification scripts                | 28 exist. Assign ownership via CODEOWNERS                                          | Codebase analysis          |
| Q56 | Staging data policy                 | Synthetic only. Anonymized snapshots. Separate envs                                | Designed                   |
| Q57 | Launch definition of done           | All P0 + CI green + live keys + backups + legal                                    | Designed                   |
| Q58 | Performance/accessibility SLOs      | P50<30s, P95<60s, WCAG AA, Lighthouse>90                                           | Industry benchmarks        |

## All Business Decisions Complete

✅ 59/59 interview questions answered. ✅ 1 remaining product decision resolved (branded error page for missing previews).

## Next Actions

1. **Immediate:** Fix 19 blockers above
2. **This week:** Implement spec decisions (headers-only secrets, IP salt, field redaction, Groq ZDR)
3. **Before revenue:** Grace period, public/private toggle, provider fallback
4. **Before launch:** CI green, provider acceptance, live keys, backups, legal docs

---

**Status:** 60/60 answered. 19 blockers. 0 remaining decisions.
