# Ship Fast Product Spec

**Status:** AI-researched answers incorporated · **Last Updated:** 2026-08-01  
**Answered:** 30 business decisions + 29 AI-researched technical decisions = 59/59

## Pricing & Tiers

| Property        | Decision                                           |
| --------------- | -------------------------------------------------- |
| Pro price       | ₹999 authoritative                                 |
| Free tier       | Public, indexable, gallery-visible                 |
| Paid tier       | Private, not indexable, hidden from gallery        |
| Credit packs    | Sellable offers                                    |
| Export branding | Paid = unbranded. Free = Ship Fast badge mandatory |
| Retry cost      | Free — entire retry cycle counts as one credit     |

## Access & Visibility

| Property           | Decision                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Public/private     | Based on payment status                                                                                                                      |
| Expired paid users | New = public. Past = private                                                                                                                 |
| URL format         | Same format, ID-level distinction                                                                                                            |
| Missing previews   | Branded error page with Ship Fast logo, "not available" message, links to ship-fast.ai, X/Twitter, LinkedIn. "Built with Ship Fast" tagline. |

## Entitlement & Grace Period

| Property            | Decision                                                  |
| ------------------- | --------------------------------------------------------- |
| Expiry behavior     | Projects NOT deleted. Editing blocked. Websites stay live |
| Grace period        | 1-2 months warning before restrictions                    |
| Recovery            | Full access restored on payment                           |
| Competitor research | Lovable/Replit pause deployments after ~1 month           |

## Browser Support

| Property                    | Decision                             |
| --------------------------- | ------------------------------------ |
| Baseline                    | React's browser compatibility only   |
| Edge cases                  | Not handled — startup speed priority |
| Browser storage unavailable | Wipe session — don't handle          |

## Exports & Artifacts

| Property           | Decision                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Canonical artifact | What user sees — no preview/export divergence                                                    |
| `nextjs` alias     | Never retires — expand targets, not remove                                                       |
| Structural repairs | Not disclosed — smooth UX                                                                        |
| Export migration   | Stable contract exists, legacy still active. **Decision:** retire legacy path, set concrete date |
| Signed downloads   | **Decision:** implement signed URLs with 1-hour expiry, revoke on session deletion               |

## SEO & AEO

| Property | Decision                               |
| -------- | -------------------------------------- |
| SEO      | Mandatory                              |
| AEO      | New differentiator                     |
| Both     | Selling points, study and spec details |

## API & Versioning

| Property             | Decision                                                             |
| -------------------- | -------------------------------------------------------------------- |
| HTTP APIs            | Semantic versioning, 6-month deprecation notice                      |
| Convex functions     | Backward compatibility within major versions                         |
| Stable API contracts | StableEngineArtifact + StableExportInput contracts defined           |
| Generation events    | `by_sessionId_createdAt` index, no cursor guarantees — document this |

## Data Retention & Deletion

| Property          | Decision                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Deletion policy   | Logical deletion only (boolean filter)                                                                           |
| Exception         | Real deletion on explicit GDPR request                                                                           |
| Backups           | Daily, Dokploy infra level                                                                                       |
| IP hash retention | **Decision:** 90-day retention, automatic deletion                                                               |
| Account deletion  | `deleteAccount` mutation exists (Convex only). **Decision:** add external system hooks (Medusa, Lakebed, GitHub) |

## GitHub Tokens

| Property  | Decision                                |
| --------- | --------------------------------------- |
| Retention | Retain for user comfort                 |
| Deletion  | Comply with GDPR requests               |
| Priority  | Don't over-engineer privacy for release |

## Quota Management

| Property  | Decision                         |
| --------- | -------------------------------- |
| Changes   | Manual, by developers in code    |
| Admin UI  | Not user-facing — coding problem |
| Approvals | Development team only            |

## Notifications & Incidents

| Property               | Decision                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Channels               | Slack only. No Telegram                                                                   |
| Current system         | Perfect as implemented                                                                    |
| Incident communication | External (X/Twitter). No in-product                                                       |
| Maintenance mode       | Database boolean → maintenance wall with logo, "sorry, back soon", Twitter/LinkedIn links |

## Error Handling

| Property           | Decision                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- |
| User-facing errors | Clear, friendly, hide technical details                                             |
| Internal details   | Hidden — prevent abuse/competitor copying                                           |
| Stable error codes | **Decision:** document contract-level error codes (400/401/402/403/404/409/429/502) |

## Security — Identity & Secrets

| Property                     | Decision                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Anonymous owner secrets      | **Decision:** headers only (`x-ship-fast-owner-secret`). Remove query param fallback. OWASP ASVS 8.3.1, CWE-598                  |
| IP identifiers               | **Decision:** 32-byte random salt, 90-day retention, annual rotation. GDPR Art 5(1)(e)                                           |
| IP hash disclosure           | **Decision:** update privacy policy with retention period and legal basis                                                        |
| CSRF protection              | **Decision:** not needed — JWT in Authorization header eliminates CSRF risk                                                      |
| CORS for browser APIs        | **Decision:** add explicit CORS with origin whitelist                                                                            |
| Session field redaction      | **Decision:** redact cost, medusaConfig, workspace, isPrivate, designReferenceNotes, designReferenceFingerprint from public APIs |
| Identity conflict resolution | **Decision:** Clerk identity > anonymous owner secret > clientId > IP claim. Document in access matrix                           |
| Moderation appeals           | **Decision:** email-based appeal process, 48h review SLA, retain decisions for 90 days                                           |
| AI capsule sandboxing        | **Decision:** validate JS before blob import, run in iframe sandbox without `allow-same-origin`, strip `eval()`/`Function()`     |

## Security — Webhooks & Secrets

| Property                 | Decision                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Webhook secret rotation  | **Decision:** 90-day rotation, 7-day dual-secret overlap window                                         |
| Webhook idempotency      | Current pattern correct. **Decision:** add GitHub webhook signature verification                        |
| Secret ownership         | **Decision:** assign owners per category (auth/payments/LLM/media/monitoring/Convex)                    |
| Secret rotation schedule | High-risk quarterly, medium-risk semi-annually                                                          |
| Config drift detection   | **Decision:** add pre-deploy script verifying Convex env completeness, type validation, secret presence |

## Infrastructure

| Property          | Decision                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| Convex hosting    | Move to Convex Cloud (93/100 priority)                                                 |
| Web app hosting   | Stay on Dokploy (75/100)                                                               |
| Admin-key TTL     | Known issue — Convex Cloud migration is permanent fix                                  |
| Convex env access | **Decision:** migrate from raw `process.env` to typed `ctx.env` in 5 phases            |
| Rollback policy   | **Decision:** per-service policies (app 15min RTO, Convex 20min RTO, Medusa 30min RTO) |

## Provider Management

| Property       | Decision                                                                            |
| -------------- | ----------------------------------------------------------------------------------- |
| Groq           | Enable Zero Data Retention. Primary text generation                                 |
| Cerebras       | Strong privacy. Secondary/fallback text generation                                  |
| Pollinations   | Indefinite caching risk. Use ONLY for public, non-sensitive image generation        |
| Provider SLOs  | Cerebras: 5s P95, Groq: 10s P95. Circuit breaker: 5 consecutive failures → 60s open |
| Retry strategy | Capped exponential backoff with full jitter. Base 250ms, max 30s, 5 attempts        |
| Fallback chain | Cerebras → Groq → Pollinations (text). Groq → Pollinations (image)                  |
| Cost cap       | **Decision:** `MODEL_DAILY_CALL_CAP` env var. Recommended: $100/day                 |

## Generation & DSL

| Property                  | Decision                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| DSL versioning            | Semver. Parser supports last 2 major versions. Default: current stable                    |
| Capsule classification    | stable (core primitives + motifs), experimental (edge cases), internal (infrastructure)   |
| Realtime section contract | EditableRealtimeSectionContract with propsSchema, lakebed config, reserved key compliance |
| Model output retention    | **Decision:** plan cache 24h TTL, translation cache 7d TTL, never cache raw prompts       |
| Cache invalidation        | Content-addressed (export render cache), TTL-based (plan/translation), manual API         |

## Operations

| Property             | Decision                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Idempotency keys     | `{scope}:{operation}:{entityId}:{nonce}` format                                                    |
| Retry/backoff        | Exponential with jitter. 5 max attempts                                                            |
| Poison messages      | Non-transient errors = immediate DLQ. 3+ consecutive failures = DLQ                                |
| Dead letter queue    | Centralized `deadLetterQueue` table with classification (transient/permanent/malformed/crash_loop) |
| Verification scripts | 28 exist. **Decision:** assign per-script ownership via CODEOWNERS                                 |
| Staging data         | Synthetic only. Anonymized production snapshots allowed. Separate Convex/Clerk/Stripe              |
| Dashboards           | 4 required: generation perf, business metrics, infra health, cost. Critical alerts via PagerDuty   |
| Launch DoD           | All P0 items + CI green + production keys + backups + legal docs                                   |

## Performance SLOs

| Metric                   | Target           |
| ------------------------ | ---------------- |
| Generation P50           | < 30s            |
| Generation P95           | < 60s            |
| Generation failure rate  | < 5%             |
| Provider error rate      | < 1%             |
| Cache hit rate           | > 80%            |
| WCAG                     | Level AA minimum |
| Lighthouse accessibility | > 90             |

## Billing & Commerce

| Property           | Decision                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Reconciliation     | **Decision:** create billing reconciliation runbook. Add automated daily comparison job              |
| Commerce isolation | Schema supports it. **Decision:** implement DokployInfraProvider or abandon for Docker-based path    |
| Dokploy ownership  | **Decision:** assign owner. Acceptance test: provision + verify isolation + verify cleanup           |
| Fraud review       | **Decision:** restore disposable email check. Add manual review dashboard. Flag IP/referral patterns |

## Implementation Queue

| #   | Feature                             | Priority | Effort |
| --- | ----------------------------------- | -------- | ------ |
| 1   | Remove query param secret fallback  | P0       | Small  |
| 2   | Add IP hash salt + retention policy | P0       | Small  |
| 3   | Session field redaction (6 fields)  | P0       | Medium |
| 4   | Retry-without-cost logic            | P0       | Medium |
| 5   | Public/private session toggle       | P0       | Medium |
| 6   | Entitlement grace period            | P0       | Large  |
| 7   | Enable Groq ZDR                     | P0       | 5 min  |
| 8   | Maintenance wall                    | P1       | Small  |
| 9   | Export branding (free badge)        | P1       | Small  |
| 10  | Export migration (retire legacy)    | P1       | Large  |
| 11  | SEO/AEO spec and implementation     | P1       | Large  |
| 12  | Provider fallback + circuit breaker | P2       | Large  |
| 13  | DLQ + retry infrastructure          | P2       | Large  |
| 14  | Convex env migration (raw → typed)  | P2       | Medium |
