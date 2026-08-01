# Ship Fast Product Spec

**Status:** Decisions incorporated from interview (30/59 answered) · **Last Updated:** 2026-08-01

## Pricing & Tiers

| Property | Decision |
|----------|----------|
| Pro price | ₹999 authoritative (overrides any backend config) |
| Free tier | Public, indexable — acts as advertising. Gallery-visible |
| Paid tier | Private, not indexable, hidden from gallery |
| Credit packs | Sellable offers |
| Export branding | Paid = unbranded. Free = Ship Fast badge mandatory |
| Retry cost | Free — entire retry cycle counts as one credit, no charge for failures |

## Access & Visibility

| Property | Decision |
|----------|----------|
| Public/private | Based on payment status. Free = public. Paid = private |
| Expired paid users | New generations become public. Past paid generations stay private |
| Gallery | Shows free-tier public sessions only |
| Missing previews | TBD (was blank — needs product decision) |
| URL format | Same format for public/private, distinction at ID level |

## Entitlement & Grace Period

| Property | Decision |
|----------|----------|
| Expiry behavior | Old projects NOT deleted. Editing blocked by backend. Websites stay live |
| Grace period | 1-2 months warning before restrictions apply |
| Recovery | Full access restored when user pays again |
| Research needed | Lovable/Replit competitor approaches (they pause deployments after ~1 month) |

## Browser Support

| Property | Decision |
|----------|----------|
| Baseline | React's browser compatibility baseline only |
| Edge cases | Not handled. Startup speed priority over fringe browsers |
| Browser storage unavailable | Wipe session — don't handle. Paying users are priority |

## Exports & Artifacts

| Property | Decision |
|----------|----------|
| Canonical artifact | What the user sees — no divergence between preview and export |
| `nextjs` alias | Will never retire. Goal is to expand export targets, not remove |
| Structural repairs | Not disclosed to user — smooth UX |

## SEO & AEO

| Property | Decision |
|----------|----------|
| SEO | Mandatory — nobody wants an unfindable site |
| AEO | New differentiator — people browse with agents now |
| Both | Selling points. Study specs after interview if underspecified |

## API & Versioning

| Property | Decision |
|----------|----------|
| HTTP APIs | Semantic versioning, minimum 6-month deprecation notice |
| Convex functions | Backward compatibility within major versions |

## Data Retention & Deletion

| Property | Decision |
|----------|----------|
| Deletion policy | Logical deletion only (boolean filter). Never real deletion |
| Exception | Real deletion only when user explicitly requests (GDPR) |
| Rationale | Everything generated costs money — don't delete value |
| Backups | Daily, handled at Dokploy infra level (not in code) |

## GitHub Tokens

| Property | Decision |
|----------|----------|
| Retention | Retain for user comfort and convenience |
| Deletion | Comply with GDPR/privacy requests when explicitly asked |
| Priority | Don't over-engineer privacy — prioritize user comfort for release |

## Quota Management

| Property | Decision |
|----------|----------|
| Changes | Manual, by developers in code only |
| No admin UI | Not a user-facing feature — coding problem only |
| Approvals | Development team only |

## Notifications & Incidents

| Property | Decision |
|----------|----------|
| Channels | Slack only. No Telegram |
| Current system | Perfect as implemented — nothing to add/remove |
| Incident communication | External (X/Twitter). No in-product communication now |
| Maintenance mode | Database boolean → beautiful full-screen maintenance wall with logo, "sorry, back soon", Twitter/LinkedIn links |

## Error Handling

| Property | Decision |
|----------|----------|
| User-facing errors | Clear, friendly, hide internal technical details |
| Internal details | Hidden (model names, implementation) — prevent abuse/competitor copying |

## Undecided (Technical — AI to Research)

1. Stable API contracts for external consumers
2. CORS/CSRF controls for integrations
3. Anonymous owner secrets: query strings vs headers
4. Identity conflict resolution strategy
5. IP-derived identifiers: salting, retention, disclosure
6. Session field classification (public vs PII)
7. Moderation appeal process
8. JavaScript validation and sandboxing for AI capsules
9. Schema migration ownership (Convex auto-migration)
10. State transition contracts
11. Retry/idempotency standards
12. Content retention and reuse policies
13. DSL versioning and compatibility
14. Provider cost/latency/retry SLOs
15. Model output retention and caching
16. Registry capsule classification (stable/experimental/internal)
17. Realtime section contracts
18. Cache invalidation guarantees
19. Signed download expiry/revocation
20. Export migration from legacy to stable contract
21. Billing reconciliation procedures
22. Webhook secret rotation
23. Fraud review process
24. Commerce isolation proof
25. Data deletion auditing
26. Dokploy ownership
27. Secret rotation and least privilege
28. Config drift detection
29. Convex environment access migration
30. Admin-key TTL remediation
31. Provider privacy obligations (Groq, Cerebras, pixels)
32. Provider availability and fallback policies
33. Required operational dashboards
34. Rollback policies
35. Verification scripts ownership
36. Staging data policy
37. Launch definition of done
38. Performance and accessibility SLOs

## Implementation Required

| Feature | Source | Priority |
|---------|--------|----------|
| Maintenance wall | Q59 | High |
| Retry-without-cost logic | Q4 | Critical |
| Entitlement grace period | Q39 | High |
| Public/private session toggle | Q2, Q16 | Critical |
| Export branding (free badge) | Q27 | Medium |
| Logical deletion filter | Q20 | Medium |
