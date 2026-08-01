# Ship Fast Launch Readiness - Complete Documentation

**Status:** Work in Progress · **Last Updated:** 2026-08-01  
**Purpose:** Single comprehensive source for all launch readiness decisions, security assessments, infrastructure decisions, and action items.

---

## Table of Contents

1. [Security Assessment](#security-assessment)
2. [Infrastructure Decisions](#infrastructure-decisions)
3. [Documentation Control](#documentation-control)
4. [Project Reference](#project-reference)
5. [Gap Register](#gap-register)
6. [Action Items](#action-items)

---

## Security Assessment

### Current Status: NO-GO - Critical Blockers Remain

**Verdict:** Multiple critical security vulnerabilities must be addressed before launch.

#### Critical Release Blockers

| Severity | Issue | Status |
|----------|-------|--------|
| **Critical** | Authenticated subscription self-grant via `confirmCheckoutSubscription` - public Convex mutation allows reassigning subscriptions without provider verification | **UNRESOLVED** |
| **Critical** | Razorpay `halted` status defaults to `active` - failed payments can grant entitlements | **UNRESOLVED** |
| **Critical** | Recurring webhook collision - uses `event:subscriptionId` ignoring provider event ID, causing duplicate idempotency keys | **UNRESOLVED** |
| **High** | Preview validation remains regex-based - does not decode HTML entities or parse DOM, entity-encoded `javascript:` bypass possible | **UNRESOLVED** |

#### Fixed Issues

- ✅ Svelte XSS validation - production compilation now validates first
- ✅ Anonymous claim and share bonus now verify server secrets
- ✅ Stock-image calls use server proxy and server-only keys
- ✅ Raw preview headers, full-preview guard, and rate limiter wired
- ✅ Rate limiting improved (though has correctness/scale defects)

#### Remaining Security Concerns

- Checkout incorrectly shares `exportHits` - rate limit not properly isolated
- Rate-limit maps are process-local and reset on restart - not global across replicas
- Generated SSR JS still dynamically imported host-side - validation reduces risk but not process isolation
- Local untracked `specs/architecture/dev-staging-setup.md` contains credential-form Pexels data
- Provider acceptance testing still pending (TODO.md P0 items)

---

## Infrastructure Decisions

### Convex Hosting: Move to Convex Cloud

**Decision:** Move Convex from self-hosted to Convex Cloud immediately.

**Rationale:**
- Current usage fits within free tier (148 MB DB, 175 MB files, ~55k calls/month)
- Eliminates operational tax and data-loss risk
- Removes backup burden (currently zero backups exist)
- Frees ~9.7 GB disk space
- Starter overage at 10× traffic would be only $1-3/month

**Implementation Priority:**
1. Schedule `failIfStillStreaming` reaper (96/100) - ~30 lines, stops stranding users on redeploy
2. Move Convex to Cloud (93/100)
3. Remove XRDP/desktop stack from production server (92/100) - was OOM victim set
4. Implement Docker log rotation (85/100)
5. Run `docker builder prune -a` to free ~34 GB disk space (97/100)

### Web App Hosting: Stay on Dokploy

**Decision:** Keep web app on Dokploy, do not move to Vercel.

**Rationale:**
- Managed container hosts scored only 25/100 (withdrawn from 76/100)
- Owner is keeping Medusa, self-hosted Dub, Plausible, LinkForty - server stays anyway
- Third vendor would be pure addition: another bill, another debug surface, network hop
- Dokploy is working correctly for current needs

**Future Consideration:**
- Vercel after worker extraction (55/100) - plausible later, not now
- Split generation worker into 2nd Dokploy app (80/100) - deploy safety, same box

### Current Infrastructure Issues

**Memory Pressure:**
- Swap 4.0/4.0 GiB fully exhausted
- OOM killer fired 17 times on previous boot
- XRDP desktop stack running on production server consuming memory

**Disk Usage:**
- 150 GB total, 136 GB used (95%)
- Docker build cache: 47.6 GB (35%)
- Convex volumes: 7.8 GB (but only 320 MB real data)
- Unused images: 13.75 GB

---

## Documentation Control

### Source Hierarchy

1. Current production source plus focused behavioral tests: implementation truth
2. Generated API/schema artifacts: interface truth when generated from current source
3. Living reference and gap register: maintained explanation of current behavior
4. Architecture specs and verification reports: dated evidence, not promises
5. `codemap.md`: navigation aid only until corrected (cites removed generator files)

### Documentation Inventory

| Document | Current Value | Limitation |
|----------|---------------|------------|
| `readme.md` | Onboarding and minimal environment/scripts | Does not cover product, API, data, auth, operations |
| `codemap.md` | High-level directory/control-flow atlas | Drift: removed generator files named as live entry points |
| `docs/go-prod.md` | Quota/admin safety | Not complete auth or incident runbook |
| `docs/verification/provider-runbook.md` | Provider-proof evidence checklist | Not contract or completed acceptance record |
| `src/features/exports/STABLE_CONTRACT.md` | Intended stable export migration | Active route still uses legacy/OpenUI behavior |
| `specs/architecture/*.md` | Historical audits/design proposals | Most are snapshots; no refresh owner/trigger |
| `TODO.md` | Pending provider and launch proof | No ownership, target date, or risk acceptance |

### Required Companion Documents

- Generated API catalog: HTTP and Convex functions, auth, rate limits, errors
- Schema/data dictionary: field purpose, PII classification, ownership, lifecycle
- State machine set: session, generation, export, deployment, billing transitions
- Access matrix: anonymous, signed-in, paid, admin capabilities per operation
- Environment/secrets catalog: placement, owner, rotation, least privilege
- Integration runbooks: data flow, auth, webhooks, idempotency, monitoring
- Release/runbook matrix: verification commands, prerequisites, evidence output
- Privacy/retention model: generated content, IP hashes, analytics, deletion

---

## Project Reference

### Product Boundary

Ship Fast turns a user brief into an editable website. A session holds the prompt, generation progress, preview, edits, export artifacts, publication/deployment data, entitlement state, and optional commerce/CMS configuration.

**Three Main Execution Planes:**
1. **Browser application** - Captures brief, dashboard interaction, renders previews, calls server routes and Convex
2. **Session and entitlement backend** - Stores durable state, enforces access/quota/billing rules, records event/artifact history
3. **Generation and delivery packages** - Produce OpenUI composition and render/export into HTML, React, Next.js, Lakebed, and preview artifacts

### Access Model

- Clerk identity uses token identifier
- Anonymous access uses owner secret and client/IP-based claims
- Admin claims bypass ownership, quota, and export checks

### Billing and Referrals

- Subscriptions, customer credits, ledger, deduplicated webhook events
- Referral states: pending, qualified, disqualified
- Reward unlock after two qualified referrals is permanent

---

## Gap Register

### Critical Drift and Launch Blockers

| ID | Finding | Evidence | Required Decision/Action |
|----|---------|----------|---------------------------|
| D-01 | Architecture atlas names removed generator files | `codemap.md` vs current code | Replace old pipeline description |
| D-02 | Stable export doc describes migration while active route uses legacy | Export files | Declare supported contract and migration deadline |
| D-03 | Real Dokploy commerce operations throw unverified errors | `DokployInfraProvider` | Block launch or implement provisioning |
| D-04 | No canonical route/Convex API/error catalog | 114 route files | Generate and review API reference |
| D-05 | No data dictionary or retention model | 46-table Convex schema | Classify data, owners, TTL/deletion obligations |
| D-06 | Authentication/anonymous-owner model lacks threat model | Session access helpers | Approve access matrix, secret transport |
| D-07 | Provider proof remains incomplete | `TODO.md`, provider runbook | Run signed sandbox and real-generation acceptance |
| D-08 | Language detection conflicts with English-only enforcement | GenUI logic | Confirm policy or fix behavior |

---

## Action Items

### Immediate (This Sprint) - SECURITY BLOCKERS

1. **Critical Security Fixes**
   - [ ] Fix authenticated subscription self-grant vulnerability
   - [ ] Fix Razorpay `halted` → `active` default status
   - [ ] Fix recurring webhook collision (use provider event ID)
   - [ ] Improve preview validation (decode HTML entities, parse DOM)

2. **Infrastructure**
   - [ ] Implement `failIfStillStreaming` reaper to prevent user stranding
   - [ ] Move Convex to Convex Cloud
   - [ ] Remove XRDP desktop stack from production server
   - [ ] Implement Docker log rotation
   - [ ] Run `docker builder prune -a` to free disk space

3. **Security**
   - [ ] Fix rate limiting to be global across replicas
   - [ ] Remove credential-form Pexels data from staging setup
   - [ ] Implement proper secret verification for all public mutations

### Medium Term

1. **Documentation**
   - [ ] Generate API catalog for all routes and Convex functions
   - [ ] Create data dictionary for 46-table schema
   - [ ] Document state machine for all entities
   - [ ] Create access matrix for all operations
   - [ ] Create environment/secrets catalog

2. **Operations**
   - [ ] Set up dashboards for quota denials, webhook failures, retry exhaustion
   - [ ] Implement rollback runbooks for all services
   - [ ] Document verification scripts and CI/manual ownership

### Provider Acceptance (P0 from TODO.md)

- [ ] Signed-in checkout verification
- [ ] Valid signed webhook testing
- [ ] Convex state verification
- [ ] Export unlock verification
- [ ] Download verification
- [ ] Deployment revision parity
- [ ] Real checkout/export/download testing
- [ ] Concurrency testing
- [ ] Live Groq moderation

---

**Next Review Date:** 2026-08-15  
**Owner:** Development Team  
**Status:** ACTIVE - Security blockers must be resolved before launch