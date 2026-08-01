# Ship Fast Launch Readiness - Complete Documentation

**Status:** Work in Progress · **Last Updated:** 2026-08-01  
**Purpose:** Single comprehensive source merging all launch readiness documentation, security assessments, infrastructure decisions, and action items.

---

## Table of Contents

1. [Security Assessment - First Review](#security-assessment-first-review)
2. [Security Assessment - Re-review](#security-assessment-re-review)
3. [Launch Readiness Audit](#launch-readiness-audit)
4. [Launch Readiness Review 2](#launch-readiness-review-2)
5. [Infrastructure Decisions](#infrastructure-decisions)
6. [Documentation Control](#documentation-control)
7. [Project Reference](#project-reference)
8. [Gap Register](#gap-register)
9. [Decision Interview](#decision-interview)
10. [Action Items](#action-items)

---

# Ship Fast imminent-release security assessment

**Verdict: NO-GO.** The screenshot is not a verified release assessment. Multiple claims are false at `develop@4b018f18`; four security/revenue failures were reproduced through real handlers. “Bulletproof” should be withdrawn.

## Release blockers

| Severity | Screenshot claim | What is wrong |
|---|---|---|
| Critical | Checkout ownership prevents IDOR | [`confirmCheckoutSubscription`](/Users/livio/Documents/ship-fast/convex/billing.ts#L266) is a public Convex mutation. A client can bypass the checked HTTP wrapper, supply provider/status/plan/subscription ID, reassign an existing subscription, or insert an active one at lines 283-314. No provider lookup, signed assertion, secret, or ownership-conflict check. |
| Critical | Billing/webhooks are launch-safe | [`webhook-api-response.ts`](/Users/livio/Documents/ship-fast/src/features/billing/server/webhook-api-response.ts#L289) grants Razorpay pack credits without requiring a paid/success event. Reproduced: correctly signed `payment.failed` returned `200` and attempted `credits: 10`. Unknown Razorpay subscription states also default to entitlement-bearing `active` at line 129; reproduced with `subscription.halted`. |
| Critical | Svelte XSS validation is fatal and compiler-enforced | [`validateSvelteSource`](/Users/livio/Documents/ship-fast/packages/ship-fast-engine/src/genui/svelte-compiler.ts#L79) exists, but [`compileSvelteBlock`](/Users/livio/Documents/ship-fast/packages/ship-fast-engine/src/genui/svelte-compiler.ts#L118) never calls it. Production compiles directly at [`composition-compiler.ts:342`](/Users/livio/Documents/ship-fast/packages/ship-fast-engine/src/genui/composition-compiler.ts#L342) and line 437, then dynamically imports/executes generated SSR JS at [`svelte-compiler.ts:157`](/Users/livio/Documents/ship-fast/packages/ship-fast-engine/src/genui/svelte-compiler.ts#L157). Reproduced: validator rejected malicious source while the production compiler succeeded and emitted `onerror`. Browser XSS and server-side generated-code execution remain reachable. |
| Critical | Preview HTML XSS is blocked | Full-preview saves bypass `containsExecutablePreviewFragment`: [`session-preview-edit-response.ts:188`](/Users/livio/Documents/ship-fast/src/features/session/server/session-preview-edit-response.ts#L188) checks only renderer-error/handoff documents, then mutates at line 209. Reproduced: full `<script>` HTML returned `200` and mutated. Inline validation is a raw regex; entity-encoded `javascript:` also returned `200` and mutated. |
| High | Anonymous claim/share mutations require a server secret | IP claim accepts only `clientIpHash` at [`session_validators.ts:114`](/Users/livio/Documents/ship-fast/convex/lib/session_validators.ts#L114); its public mutation/helper has no secret check at [`sessions.ts:748`](/Users/livio/Documents/ship-fast/convex/sessions.ts#L748) and [`session_access_helpers.ts:380`](/Users/livio/Documents/ship-fast/convex/lib/session_access_helpers.ts#L380). The HTTP route sends an unsupported `secret` at [`claim-anon-sessions.ts:92`](/Users/livio/Documents/ship-fast/src/routes/api/claim-anon-sessions.ts#L92), which Convex rejects as an extra argument, producing the caught `502` path. Public [`claimShareBonus`](/Users/livio/Documents/ship-fast/convex/shareBonus.ts#L31) likewise accepts/checks no secret; its HTTP route sends none. |
| High | Billing read access has a secret gate | [`requireBillingReadAccess`](/Users/livio/Documents/ship-fast/convex/billing.ts#L44) has no secret and permits any requested user ID without `|`. Public billing queries therefore expose legacy opaque-ID subscription, credit, and ledger data. Existing tests cover only issuer-qualified IDs. |

## Other false or overstated claims

- **Rate limits:** checkout `5/10m`, export `10/10m`, download `20/10m`, and preview-save `10/10m` are not wired. [`checkRateLimit`](/Users/livio/Documents/ship-fast/src/lib/rate-limit.ts#L9) has no production caller and is process-local. Reproduced: 11 valid preview saves produced 11 x `200` and 11 mutations. Generation is not `5/10m/IP`; constants are `5/10m/user`, `10/10m/IP`, and authenticated `30/10m/IP` at [`billing_constants.ts:25`](/Users/livio/Documents/ship-fast/convex/lib/billing_constants.ts#L25).
- **Preview headers:** successful [`session-preview-raw-response.ts`](/Users/livio/Documents/ship-fast/src/features/session/server/session-preview-raw-response.ts#L56) sets Content-Type, Cache-Control, and X-Robots-Tag only. No `X-Frame-Options` or CSP. Those headers were confused with a different deployment-preview response. Live invalid preview responses also lacked both headers; a live `200` preview was unavailable.
- **Client secrets:** production source still reads `import.meta.env.VITE_PEXELS_API_KEY` and `VITE_UNSPLASH_ACCESS_KEY` at [`stock-image.ts:209`](/Users/livio/Documents/ship-fast/src/lib/stock-image.ts#L209) and line 347, and client components import that module. [`vite.config.ts:692`](/Users/livio/Documents/ship-fast/vite.config.ts#L692) exposes every `VITE_` variable. Current production container has only publishable `VITE_` names, so this is a live configuration footgun, not proof of a currently bundled key.
- **Plaintext credential hygiene:** untracked [`dev-staging-setup.md:140`](/Users/livio/Documents/ship-fast/specs/architecture/dev-staging-setup.md#L140) contains a credential-form Pexels value. Active status was not tested and value is redacted here. It must not be committed/shared; rotate if real.
- **Timing-safe comparison:** provider signatures use a local JS XOR helper at [`webhook-api-response.ts:80`](/Users/livio/Documents/ship-fast/src/features/billing/server/webhook-api-response.ts#L80), not `crypto.timingSafeEqual`; Convex mutation secrets use ordinary equality at [`billing.ts:441`](/Users/livio/Documents/ship-fast/convex/billing.ts#L441). “All webhook secrets” is false.
- **Webhook idempotency:** Convex OCC supports atomic check/write, but tests prove sequential duplicates only. Razorpay dedupe ignores `x-razorpay-event-id` and uses `event:subscriptionId` at [`webhook-api-response.ts:272`](/Users/livio/Documents/ship-fast/src/features/billing/server/webhook-api-response.ts#L272), colliding across recurring charges. Stripe event-ID dedupe does not cover logically duplicate Event objects.
- **Prompt claim:** the system prompt contains role, examples, page guide, genome, content/design rules, and the user brief at [`composition-prompt.ts:158`](/Users/livio/Documents/ship-fast/packages/ship-fast-engine/src/genui/composition-prompt.ts#L158), not “only DSL syntax.” No secret interpolation was found, but no adversarial prompt-exfiltration proof exists.
- **Launch evidence:** [`TODO.md:7`](/Users/livio/Documents/ship-fast/TODO.md#L7) still marks P0 provider acceptance pending: signed-in checkout, valid signed webhook, Convex state, export unlock, and download. Deployment revision parity, real checkout/export/download, concurrency, and live Groq moderation were not proven.

## Narrow claims that do hold

- Moderation code runs deterministic checks before semantic Groq classification and maps provider errors/timeouts to fail-closed `503`; evidence is mocked tests, not live behavior.
- Anonymous owner secrets use 32 random bytes and SHA-256 storage/comparison.
- Convex serializable OCC supports atomic mutation retries; it does not establish application idempotency or uniqueness by itself. [Convex OCC documentation](https://docs.convex.dev/database/advanced/occ)
- Iframe sandbox omits `allow-same-origin`, isolating parent cookies/localStorage. This narrow property does not make executable user HTML safe; popups can escape the sandbox.
- Exodus production app had non-empty server-side `GROQ_API_KEY`, `PEXELS_API_KEY`, Stripe secrets, and `SHARE_BONUS_MUTATION_SECRET`; no secret values were printed. Convex prod/dev secret presence remains unverified and absent checks make that secret ineffective anyway.

## Evidence executed

- History/current state: `develop@4b018f18`; recent moderation and anonymous-claim fixes inspected.
- Billing tests: 39/39 targeted tests passed, but omitted reproduced failure modes.
- Generation/session tests: 98 passed, 1 failed; failure was the anonymous-claim route success path.
- Direct probes reproduced: Svelte XSS bypass; signed failed-payment credit grant; halted-to-active normalization; recurring webhook dedupe collision; full-preview script acceptance; entity-encoded JS acceptance; 11/11 unthrottled preview saves.
- Live read-only probes: homepage `200`; invalid checkout `401`; invalid export/download `400`; invalid webhook signatures `400`; invalid preview `404` without claimed headers; Exodus containers healthy and production server env names inspected without values.

**VERIFIED: targeted tests, real exported-handler probes, live HTTP probes, Git history/source review, and read-only Exodus inspection -> screenshot contains reproduced critical failures and unsupported deployment claims; release signoff is NO-GO.**


---


# Ship Fast security re-review

**Target:** fetched `origin/develop@2dca311c`  
**Verdict:** major fixes confirmed; **Billing remains NO-GO**.

`git pull --ff-only` fetched the commit but could not update local `develop`: local is ahead 4 / behind 1. Review ran in an isolated worktree. No merge, rebase, stash, or product-file change was made.

## Reduced result

| Section | Re-review |
|---|---|
| Generation | **Fixed in source.** Svelte production compilation now validates first; moderation/admission tests pass. Live Groq and deployed revision remain unverified. |
| Billing + Exports | **NO-GO.** Two critical entitlement bugs reproduced; rate limiting improved but has correctness/scale defects. |
| Session | **Fixed in source.** Anonymous claim and share bonus now verify server secrets. Direct missing/wrong-secret Convex regression tests and deployed-secret parity are still missing. |
| Preview + Dashboard | **Mostly fixed.** Raw headers, full-preview guard, and 10/10m limiter are wired. Entity-encoded URL bypass remains unaddressed/untested; limiter is process-local. |
| Home | **Fixed in source.** Stock-image calls now use a server proxy and server-only keys. Deployment bundle/env remains unverified. |

## Remaining release blockers

1. **Critical - authenticated subscription self-grant.** Public [`confirmCheckoutSubscription`](/tmp/ship-fast-rereview-2dca311c/convex/billing.ts#L262) still trusts authenticated client-supplied provider/status/plan data and inserts an active subscription without provider verification. Direct probe persisted `sub_fabricated_not_at_provider` as `active` for an authenticated caller.
2. **Critical - Razorpay `halted` becomes `active`.** [`webhook-api-response.ts:120`](/tmp/ship-fast-rereview-2dca311c/src/features/billing/server/webhook-api-response.ts#L120) defaults non-recognized statuses to `active`. A realistically signed `subscription.halted` probe returned `200` and sent `status: active` to Convex.
3. **High - recurring webhook collision.** [`webhook-api-response.ts:224`](/tmp/ship-fast-rereview-2dca311c/src/features/billing/server/webhook-api-response.ts#L224) uses `event:subscriptionId`, ignoring provider event ID. Two distinct recurring charge events generated the same idempotency key.
4. **High - preview validation remains regex-based.** [`session-preview-edit-response.ts:79`](/tmp/ship-fast-rereview-2dca311c/src/features/session/server/session-preview-edit-response.ts#L79) does not decode HTML entities or parse DOM. The prior entity-encoded `javascript:` mechanism is unchanged and lacks a regression test.

## Non-blocking but not “bulletproof”

- Checkout incorrectly shares `exportHits`; five export attempts made the first checkout return `429`.
- Rate-limit maps are process-local and reset on restart; limits are not global across replicas.
- New raw-preview headers, iframe sandbox value, 11th-save `429`, compiler rejection, and direct Convex secret rejection lack path-level regression assertions.
- Generated SSR JS is still dynamically imported host-side. Validation reduces risk but is not process isolation.
- Local untracked `specs/architecture/dev-staging-setup.md` still contains credential-form Pexels data; value was not printed.
- [`TODO.md:7`](/tmp/ship-fast-rereview-2dca311c/TODO.md#L7) still records P0 provider acceptance as pending. Full `5516 tests pass` and production revision/env parity were not independently verified.

## Correction to first review

The earlier `payment.failed -> credits` proof used a synthetic signed payload containing an order entity. Official Razorpay failed-payment payloads use a payment entity. That item is **retracted as a proven production exploit**. The two critical blockers above were reproduced independently and remain valid.

## Evidence

- Generation/session: targeted runs `151/151`, `16/16`, and `47/47` passed.
- Preview/home: `93/93` passed.
- Billing/export: `52/52` passed; direct probes still reproduced self-grant and halted-to-active.
- Concurrency probe: one webhook event, one credit row, 10 credits; OCC/idempotency improvement confirmed.

**VERIFIED: fetched `origin/develop@2dca311c`; targeted tests and direct billing probes confirm major remediation, two critical billing blockers, one high webhook defect, and one unresolved preview-validation gap.**


---


# Launch-Readiness Audit — fact-check of the "5/5 Bulletproof" status report

**Date:** 2026-07-31 · **Branch:** `develop` · **Method:** 6 parallel read-only code investigations against the claim list. No code changed.

**Verdict: the report is not safe to launch on.** Of 22 verifiable sub-claims: **6 confirmed, 7 partial/misleading, 9 false.** Every one of the 5 sections marked "✅ Bulletproof for launch" contains at least one refuted claim. Several refuted claims are the exact controls the section was resting on.

Beyond accuracy, the report's **scope is the problem**: it audits 5 features on a security axis only, and is silent on test health, CI status, spend caps, secrets hygiene, monitoring, backups, and legal — where the actual launch blockers are.

---

## 0. Launch blockers not mentioned anywhere in the report

| # | Blocker | Evidence |
|---|---|---|
| ❌ B1 | **Everything is on TEST keys.** Clerk `pk_test_`/`sk_test_`, Stripe `sk_test_`, Razorpay `rzp_test_` | `.env.local:5-7,36,43`; no `pk_live_` anywhere in repo |
| ❌ B2 | **Plaintext secrets in two untracked-but-NOT-gitignored files** — one `git add -A` from permanent history | `.env.local.bak` (24 secret lines; `.gitignore:7` `*.local` does not match `*.local.bak`); `specs/architecture/dev-staging-setup.md:72-141` (incl. a live-shaped `whsec_` and Razorpay key secret). **Rotate both sets + add ignore rules.** |
| ❌ B3 | **`/api/rewrite` is an unauthenticated, unmetered LLM endpoint.** Auth is `/^Bearer\s+.+$/i` against the header — token never verified | `src/routes/api/rewrite.ts:17-20`. `curl -H 'Authorization: Bearer x'` in a loop bills your Groq/Cerebras key directly. Only guard is a 1 MB body cap. |
| ❌ B4 | **No spend cap or kill switch of any kind.** Zero matches for daily budget / circuit breaker / kill switch repo-wide. `usageMetrics.cost` is written and displayed, never compared to a limit | `convex/schema.ts:298-303` |
| ❌ B5 | **CI is red.** `bun run typecheck` → **43 errors**, and CI has a `typecheck` job | incl. `src/island/openui/OpenUIViewer.tsx:9` missing export; `src/routes/api/claim-anon-sessions.ts:94` invalid arg |
| ❌ B6 | **Test suite doesn't finish** (killed at 580 s locally; CI job capped at 15 min). ≥14 failing suites observed, **including files inside the "bulletproof" scope** | `section-edit-response.entitlement.test.ts`, `-claim-anon-sessions-route.test.ts`, `composition-e2e.test.ts`, … |
| ❌ B7 | **Branch protection unavailable** (private free-tier repo → `403 Upgrade to GitHub Pro`), and local git hooks are **not installed** (`core.hooksPath` unset, `.git/hooks/` only `.sample`) | CI is advisory only; nothing gates a merge or a push |
| ❌ B8 | **No refund policy** on a paid product selling into EU/UK/India via Stripe + Razorpay | `src/routes/terms/-TermsPage.tsx:13` → `const LEGAL_REFUND_POLICY = ''` |
| ❌ B9 | **No account or data deletion.** No `deleteAccount`/`purgeUser`, no Clerk `user.deleted` webhook. GDPR erasure exists only as prose + mailto | `-PrivacyPage.tsx:322` |
| ❌ B10 | **No error monitoring, no structured logging, no Convex backup, no migration path, no alerting, no runbook** | 0 Sentry/Datadog; 59 raw `console.*`; `scripts/deploy-convex.mjs:53` deploys with no `convex export`; 46 tables, no migrations dir; `convex/crons.ts` has 1 unrelated cron |

---

## 1. Generation — claimed ✅ Bulletproof · actual ⚠️ **two hard failures**

| Claim | Verdict | Evidence |
|---|---|---|
| Dual-gate moderation, fail-closed on timeout | ✅ Confirmed | `content_moderation_classifier.ts:246,284-286` → 503 at `enforce-user-input-moderation.ts:99`. Missing key / bad JSON / audit-write failure all fail closed too. |
| System prompt has no secrets/PII | ✅ Confirmed | `packages/ship-fast-engine/src/genui/composition-prompt.ts:158-215` — pure DSL, no `process.env` |
| `@svelte` XSS validation is fatal, `compileSvelteBlock` validates before compiling | ❌ **FALSE — both halves** | Validation is explicitly non-fatal: `composition-runner.ts:207` logs `"Svelte validation errors (non-fatal)"` and continues. Order is inverted: compile at `:184`, validate at `:191`. `compileSvelteBlock` (`composition-compiler.ts:342,437`) never calls `validateSvelteSource` and wraps failures in bare `catch {}`. |
| 5 generation starts / 10 min / IP | ⚠️ Numbers right, key is spoofable | `session_creation_helpers.ts:47,210`. But `session-create-response.ts:43-47` takes the **first `X-Forwarded-For` entry with no trusted-proxy allowlist** (0 repo-wide hits for `trustProxy`). Rotate the header → fresh 5/10min bucket + fresh daily/monthly anon quota. IP hash salt defaults to `''` (`:59`) and `SHIP_FAST_IP_HASH_SALT` is in no env file → unsalted SHA-256 of an IPv4 is trivially reversible. |
| OCC makes concurrent mutations safe | ⚠️ True where it applies | Quota RMW is in one mutation. But moderation, IP derivation and generation kickoff run **outside** Convex in the HTTP route, and `startVpsGeneration` is fire-and-forget (`session-create-response.ts:281`) — neither transactional nor retried. |

**Omitted, and worse than anything listed:**
- ❌ **Moderation is fully bypassable.** `api.sessions.create` is a **public** Convex mutation (`convex/sessions.ts:301`) taking client-supplied `clientIpHash`, with no shared-secret gate — and the Convex URL ships in the browser bundle. Calling it directly skips the Groq classifier entirely *and* lets the caller choose their own rate-limit bucket. (`convex/moderation.ts:145` *does* require a secret — `sessions.create` has no equivalent.)
- ❌ **Server-side execution of LLM-generated code**: `svelte-compiler.ts:157-176` writes model output to `process.cwd()` and `await import()`s it — module-level code runs in the VPS Node process with full fs/net/env access. With the XSS check non-fatal, nothing gates this.
- ❌ `/api/sessions/:id/start-generation` has **no moderation and no rate limit** (`start-generation-response.ts:29-40`).
- ❌ `cloneUrl` / `designReferenceUrls` are never moderated, though `cloneBrief` is the *primary* prompt (`vps-generation-handler.ts:37-39`).
- ⚠️ Blocked prompts are shipped to Slack **with `userEmail`/`userName`** (`convex/moderation.ts:167-190`) — PII retention question the "no PII" claim doesn't cover.

---

## 2. Billing + Exports — claimed ✅ Bulletproof · actual ❌ **the worst section**

| Claim | Verdict | Evidence |
|---|---|---|
| Webhook idempotency | ⚠️ Record exists, key is wrong | Real dedupe at `convex/billing.ts:506-534`. But the Razorpay key is `"<eventName>:<subscriptionId>"` (`webhook-api-response.ts:272-274`) — **every future `subscription.charged` for the same subscription is silently swallowed as a duplicate**. Renewals never update status or `currentPeriodEnd`. |
| Credit doubling safe via OCC | ✅ Confirmed | Grant is in one mutation (`convex/billing.ts:579-604`); no action→mutation path. (Note: `addCreditsForUser`, `consumeCreditForExport`, `upsertSubscriptionForUser`, `recordWebhookEvent` have **zero callers** — dead code.) |
| IDOR closed by ownership check + secret gate | ❌ **FALSE** | `confirmCheckoutSubscription` (`convex/billing.ts:266`) is a **public** mutation that authenticates the caller then blindly patches the row matching a **client-supplied** `providerSubscriptionId`, reassigning `userId` to the caller (`:292-303`) — no ownership guard. Any signed-in user calls it from the browser Convex client with `status:'active', planId:'pro'` → **free Pro, or theft of another user's subscription**. The route-level signature check (`checkout-confirm-api-response.ts:122,179`) is bypassed because it isn't in the mutation. Separately, `requireBillingReadAccess` (`:44-50`) **returns with no auth at all** when the userId lacks a `\|` → `getUserCredits`/`getCreditLedger`/`hasActiveSubscription` world-readable for legacy ids. |
| All webhook secrets use `timingSafeEqual` | ❌ **FALSE** | Provider signatures do (`webhook-api-response.ts:110,119`), but the shared mutation secret is compared with plain `!==` at **`convex/billing.ts:442`** and **`convex/partners.ts:49`**. Stripe is **not** verified via SDK `constructEvent` — hand-rolled at `:89-111`, and `Object.fromEntries` keeps only the last `v1=`, so multi-signature rotation deliveries fail. |
| Checkout 5/10min, export 10/10min, download 20/10min | ❌ **FALSE — none exist** | `src/lib/rate-limit.ts:9` `checkRateLimit` has **no call sites outside its own test**. `api/checkout.start.ts`, `sessions.$sessionId.export.ts`, `sessions.$sessionId.download.$target.ts` are entirely unthrottled. |

**Omitted:**
- ❌ **No Stripe webhook route exists.** `createWebhookApiResponse(…, 'stripe')` is only wired for Razorpay. **Stripe payments never reconcile to Convex.**
- ❌ **Event type is never checked** (`webhook-api-response.ts:259-308` acts on any payload carrying a subscription/order entity) and unknown statuses **default to `'active'`** (`:126,133`) → a `subscription.halted` / `payment.failed` delivery *grants* paid access.
- ❌ **Amount/currency never validated**: `creditsForPack` (`:143`) maps `notes.packId` → 3/10 credits with no comparison to `order.amount_paid`. A ₹1 order with the right note yields 10 credits.
- ❌ **Refunds/chargebacks don't touch entitlements** — no clawback, no downgrade, no `charge.dispute.*`.
- ❌ **`DUB_PARTNERS_ENABLED=true` swallows billing**: `invoice.paid` returns at `:514` before `applyBillingWebhook` runs.
- ⚠️ Export credit is debited **before** the artifact builds (`session_export_helpers.ts:1078`) with no refund; charged against `session.userId` not the caller, and re-charged per `previewVersion` (`:1288`) — an edit-then-export loop drains the owner.
- ⚠️ `DISABLE_PAYWALL=true` makes every export free (`session_export_helpers.ts:68-71`).

---

## 3. Session — claimed ✅ Bulletproof · actual ❌ **four of five claims false**

| Claim | Verdict | Evidence |
|---|---|---|
| **Every** mutation calls `assertCanMutateSession` or `assertGenerationOwnership` | ❌ **FALSE** | Neither helper is called by: `shareBonus.ts:31` (no auth at all), `sessions.ts:748/739` (claim-by-IP / by-clientId, both on forgeable client args), **`sessions.ts:1016 forkSession` → `session_fork_helpers.ts:22-52` with zero read check on the source session — any caller forks a *private* session by id and receives its cloned artifacts (`:71`)**, `sessions.ts:301 create`, `contentCache.ts:63 setPublic` (unauthenticated shared-cache write → poisoning), `lakebed.ts:339,425` (`getSessionActor:126-142` only blocks non-owners when `isPrivate === true`), `translationCache.ts:77,125,193,257`. |
| 256-bit anon secret, SHA-256 hashed, not brute-forceable | ⚠️ Entropy fine, handling is not | 32 bytes `getRandomValues` (`anonymous-owner-secret.ts:28`), only hash stored (`session_creation_helpers.ts:350-352`). But the **raw secret is accepted in the URL query string** (`create-export-response.ts:187`, `session-event-stream-route.ts:46`) → access logs, Referer, history. And `getGenerationSessionPublic` (`sessions.ts:453`) returns the whole doc **including `anonOwnerSecretHash`** to any reader of a public session. Compare is plain `===` (`session_access_helpers.ts:138`). |
| `claimAnonymousSessionsByIp` requires a server secret | ❌ **FALSE** | The validator is `{clientIpHash: v.string()}` — **there is no `secret` field** (`session_validators.ts:114`). The route passes `secret:` anyway (`api/claim-anon-sessions.ts:94`), so if the env var is actually set, Convex rejects the extra arg → **502**; if unset, no check at all. Any signed-in user calls the public mutation with an arbitrary IP hash and **absorbs every anon session on that IP**. (This is also one of the 43 typecheck errors.) |
| `claimShareBonus` requires a server secret | ❌ **FALSE** | `convex/shareBonus.ts:31` is a fully public mutation — no secret, no auth, no rate limit. Idempotent only per `(clientIpHash, date)` with an **attacker-chosen** hash → unlimited bonus minting. |
| `SHARE_BONUS_MUTATION_SECRET` deployed to Dokploy (3 apps) + Convex (prod + dev) | ❌ **Deployment is irrelevant** | The var is read in exactly one place repo-wide (`api/claim-anon-sessions.ts:94`) and is **never compared anywhere in `convex/`**. Deploying it changes nothing except breaking that route. |

**Omitted:**
- ❌ **Unbounded free generation**: `sessions.create` is public and `clientIpHash`/`anonymousClientId` are *optional* — omit both and `loadGenerationAdmission` (`session_creation_helpers.ts:170-208`) sees zero priors → unlimited anon generations, uncapped LLM spend.
- ❌ **Claiming nulls `anonOwnerSecretHash`** (`session_access_helpers.ts:362`) → permanently locks out the true anon owner. Irreversible.
- ❌ **`VITE_DISABLE_CLERK=true` or `DISABLE_PAYWALL=true` on the Convex deployment disables *all* session ownership checks**, not just the paywall (`session_access_helpers.ts:210`). One typo = total authz bypass, and this coupling is undocumented.

---

## 4. Preview + Dashboard — claimed ✅ Bulletproof · actual ❌ **headers claim points at the wrong file**

| Claim | Verdict | Evidence |
|---|---|---|
| Iframe sandbox `allow-scripts` without `allow-same-origin` | ⚠️ Misleading | The one real iframe (`GeneratedModulePreview.tsx:244-249`) omits `allow-same-origin` ✅ but grants **`allow-popups-to-escape-sandbox`** — any `window.open()` from attacker HTML spawns a fully unsandboxed top-level document. More importantly the **default path is not an iframe at all**: with no `sourceUrl`, `:251` renders `OpenUIModuleRenderer` (`:138`) which executes generated module source **in the app DOM, same origin, no sandbox**. Also `<iframe srcDoc>` with **no sandbox attribute** ships inside customer exports (`stable-export-builder.ts:124,149`). |
| preview-raw sets `X-Frame-Options: SAMEORIGIN` + CSP `frame-ancestors 'self'` | ❌ **FALSE** | `session-preview-raw-response.ts:56-63` sets only `Content-Type`, `Cache-Control`, `X-Robots-Tag`. **No XFO, no CSP, no nosniff**; error paths (`:38,44,53,65`) set nothing. Those headers live in a *different* file — `deployments/server/deployment-preview-response.ts:23-38` — and even there the CSP allows `script-src 'self' 'unsafe-inline' https:`. preview-raw is served from the **main app origin** (`api/sessions.$sessionId.preview-raw.ts:5`), i.e. attacker-authored HTML executing same-origin with the dashboard session → stored XSS, which `frame-ancestors` would not mitigate anyway. Plus `Cache-Control: public, max-age=300` with no `Vary`/`nosniff` → shared-cache poisoning. |
| `containsExecutablePreviewFragment` blocks script injection | ⚠️ Weak denylist, mostly unwired | One regex denylist (`session-preview-edit-response.ts:12-13,74`) applied at **exactly one call site** (`:276`, inline-style edits). It is **not** applied in `createPreviewHtmlSaveResponse` (`:188-225`) — the actual preview-HTML save path is unfiltered — and never on read/serve. Bypasses it misses: `<svg/onload=…>` (slash separator), `&#106;avascript:` (entity-encoded scheme), `<style>@import…>` (tag absent from list), `<button formaction="https://evil…">`, `<math>/<mglyph>` mXSS, `<animate attributeName="href" values="javascript:…">`. |
| Preview HTML saves rate-limited 10/10min | ❌ **FALSE** | `checkRateLimit` is imported nowhere; `createPreviewHtmlSaveResponse` has no limiter, and Convex has none for this path. |

**Omitted:** `api.sessions.createEdit` is a **public** mutation (`convex/sessions.ts:998`) with no HTML validation — the denylist lives only in the HTTP layer, so the browser client skips it entirely. `anonymousOwnerSecret` is brute-forceable (sole guard at `session_edit_mutation_helpers.ts:782`, no lockout, no limit). **No app-wide CSP or X-Frame-Options anywhere** → dashboard is framable (clickjacking); `__root.tsx:69` uses `dangerouslySetInnerHTML`. The Svelte compiler hard-blocks `<iframe>` (`svelte-compiler.ts:67`) while the HTML preview path allows it — the team already treats this input as hostile elsewhere.

---

## 5. Home / client bundle — claimed ✅ Bulletproof · actual ⚠️ **true today, one commit from false**

| Claim | Verdict | Evidence |
|---|---|---|
| No secrets in client bundle | ⚠️ True of current *values*, false of the *code* | Built assets contain no real key values (verified against `.output/public/`). But two secret-class vars are read via `import.meta.env` in client-bundled code. |
| Pexels server-only, dead `VITE_` fallbacks removed | ❌ **FALSE** | `src/lib/stock-image.ts:211-212,349-350` still read `process.env.VITE_PEXELS_API_KEY \|\| import.meta.env.VITE_PEXELS_API_KEY`, and the module **is** client-bundled — `.output/public/assets/InlineEditToolbar-*.js` contains `{}.PEXELS_API_KEY\|\|{}.VITE_PEXELS_API_KEY\|\|void 0`. The `void 0` proves the var is unset today, so the key is **not burned** — but the moment anyone sets `VITE_PEXELS_API_KEY` in a build env it is inlined into the public bundle. The hardening commit `2532b97c` touched this file and removed **zero** `PEXELS`/`import.meta` lines. |
| All other API keys server-only | ✅ with one exception | No hardcoded literal secrets in tracked files; Convex admin key is server-only. Exception: `VITE_UNSPLASH_ACCESS_KEY`, identical latent leak (`stock-image.ts:216,353`). |

**Unverifiable from the repo:** whether any past CI/Dokploy build ever had `VITE_PEXELS_API_KEY` set. Check the Doppler `prd` config for any `VITE_*_KEY` before calling this clean.

---

## Pattern behind the failures

Four of the nine false claims share one root cause: **a control implemented in the HTTP route while the underlying Convex mutation stays public.** Convex mutations are directly callable from the browser — the deployment URL is in the bundle. Any guard that lives only in `src/routes/api/*` or `src/features/*/server/*` is advisory.

Affected: `sessions.create` (moderation + rate-limit bucket), `confirmCheckoutSubscription` (billing signature), `sessions.createEdit` (HTML denylist), `claimAnonymousSessionsByIp` / `claimShareBonus` (server secret). The correct pattern already exists in the codebase — `convex/moderation.ts:146-152` — it just wasn't applied.

Second pattern: **claims verified against the wrong file.** The preview-raw headers, the export/download rate limits, and the share-bonus secret all exist *somewhere* in the repo — just not on the path they're claimed for.

---

## Suggested triage (not performed)

1. **Stop-ship:** B1 test keys, B2 secret files (rotate + ignore), B3 `/api/rewrite`, billing IDOR (`confirmCheckoutSubscription`), `forkSession` private-session exfiltration, `claimShareBonus`/`claimAnonymousSessionsByIp` open mutations, preview-raw same-origin XSS.
2. **Before revenue:** Stripe webhook route (doesn't exist), Razorpay idempotency key, unknown-status→`active` default, credit-pack amount validation, refund/chargeback handling, refund policy text.
3. **Before scale:** B4 spend cap + kill switch, real rate limiting (wire `checkRateLimit` or move to Convex), trusted-proxy IP handling, salt the IP hash.
4. **Before "done":** B5 typecheck, B6 test suite, B7 CI gating + hooks, B9 deletion path, B10 monitoring/backups/runbook.

## What was and wasn't verified here

**Verified:** all 22 claims read against source on `develop`, `bun run typecheck`, partial `vitest run` (timed out at 580 s), `git grep` for literal secrets, built-asset scan of `.output/public/`, `git log`/`status`/branch divergence, `gh api` branch protection.
**Not verified:** runtime behaviour on production infra (Dokploy/Convex prod env var values, Doppler `prd` contents), live provider webhook deliveries, any claim about what is deployed rather than what is in the repo.


---


# Re-review #2 — did the fix commit actually address it?

**Date:** 2026-07-31 · **Target:** `origin/develop @ 2dca311c` — *"launch checklist: security hardening + env sync + all limitations fixed"* (343 files, +22 349 / −16 798)
**Baseline:** `docs/LAUNCH-READINESS-AUDIT-2026-07-31.md` (audit of `4b018f18`)
**Method:** 6 parallel read-only investigations in an isolated worktree at `2dca311c` with a **clean `bun install`** (the first pass shared `node_modules` with the divergent main checkout, which contaminated the numbers — those are corrected below). No code changed.

---

## Verdict: still **NO-GO**, and the commit introduced two new critical authz holes

| Outcome | Count |
|---|---|
| ✅ Fully fixed | **7** of 45 tracked defects |
| ⚠️ Partially fixed | 11 |
| ❌ Untouched | 27 |
| 🆕 **New defects introduced by this commit** | **11** |

The commit message's two headline claims are both false:
- ❌ *"all limitations fixed"* — 27 of 45 were not touched at all; several files named in the previous audit were never opened.
- ❌ *"5516 tests pass, 0 failures"* — the real number on a clean install is **7696 passed, 6 failed across 4 suites** (225 s). Two of those failures are **regressions caused by this commit**.

**Credit where it's due:** the session layer is genuinely much better. The four fixes that landed (S1, S2, S3, S8) are all implemented *inside the Convex mutation*, which is the correct place — that was the central architectural criticism of the first audit and it was understood and acted on. The Pexels/Unsplash client-bundle leak (E1) was fixed properly with a server proxy. `timingSafeEqual` is a real constant-time implementation, Convex-runtime-safe, wired at both call sites. That is real work.

It just wasn't applied to the other two thirds of the list.

---

## 🆕 New defects introduced by `2dca311c`

These did not exist before. Two are critical.

| # | Defect | Evidence |
|---|---|---|
| 🆕 **N1** | **`gallery_preview_images` lost its ownership check.** `generateUploadUrl` (`convex/gallery_preview_images.ts:85-100`) and `commit` (`:104-130`) had `assertCanMutateSession`; the commit **deleted it**, along with the `.rejects.toThrow('FORBIDDEN')` test that guarded it. Any anonymous browser caller can now mint a Convex storage upload URL and overwrite the gallery preview image of **any** public session. | defacement + storage abuse |
| 🆕 **N2** | **New public `clearCache` mutation with zero auth** — `convex/gallery_preview_images.ts:58-83`, documented as "Admin utility". `clearCache({})` with no arguments deletes **every** row in `galleryPreviewImages` and their storage blobs. One anonymous call wipes the gallery. | total cache destruction |
| 🆕 N3 | **Disposable-email referral fraud re-opened.** `convex/lib/referral_qualification.ts:94` — the disposable-email disqualification branch was deleted, and its test removed. Disposable-email referrals now qualify and unlock referrer rewards. | |
| 🆕 N4 | **`/api/stock-images` is unauthenticated and unrate-limited** (`src/routes/api/stock-images.ts:8` → `stock-image-search-response.ts:18-43`) — the very same commit added rate limiting to `/api/sessions/create`. `perPage` is passed through as `Number(perPage)` with no clamp: `perPage=100000` → `fetchCount ≈ 50002` upstream; `Number('abc')` → `NaN` into the URL. `Cache-Control: public, max-age=300` caches errors at the edge. | burns your Pexels/Unsplash quota |
| 🆕 N5 | **Generated-site navigation is broken.** The extraction of `openui-runtime-preprocess.ts` into `@ship-fast/engine/lib/openui-preprocess.ts` now strips URL string values inside object values. Its own regression test fails: `expected 'root = PageSwitch(["Home"], [home], "…' to contain '"https://facebook.com/blog"'` — nav targets come out **empty**. `section-kit-render.test.ts:110` fails for the same reason. | product regression, not security |
| 🆕 N6 | **Pricing page CTA is wired to the wrong handler.** `PricingContent.tsx:143` — the Free plan's "Start Free" button is `onClick={onShareClick}`, which is the share-bonus handler typed `(platform: string) => void` (`:83`). Clicking it fires the share flow with a React `MouseEvent` as `platform`. This is also the one remaining `PricingContent.tsx` typecheck error — proof `tsc` wasn't run before pushing. | |
| 🆕 N7 | **"Most Popular" badge moved from Pro to the ₹0 Free card** (`PricingContent.tsx:116-118`); Pro lost `featured`. | conversion regression |
| 🆕 N8 | **Availability risk:** anonymous session creation now hard-depends on `SHARE_BONUS_MUTATION_SECRET` (`session_creation_helpers.ts:151-169`), but that var is **not declared in `convex/convex.config.ts:6-15`** (unlike the billing and moderation secrets) and is absent from the generated `Env` type. If it resolves to `undefined` on the deployment, **every anonymous generation fails closed** with `CLIENT_IP_REQUIRED`. Verify on the live deployment before launch. | |
| 🆕 N9 | `session_deployment_helpers.ts:459` calls `assertCanReadPrivateSession(ctx, session, undefined)` with a hardcoded `undefined` secret → anonymous owners of **private** sessions are blocked from their own lakebed deployment entitlement check. | |
| 🆕 N10 | `resolveStockImage` (`src/lib/stock-image.ts:338-369`) has no `typeof window` guard — unlike `searchStockImages` (`:213`) — yet is imported by the client module `inline-edit-client-tools.ts:27`. In the browser: `ReferenceError: process is not defined`, or silent picsum fallback. The fix hardened one of two entry points. | |
| 🆕 N11 | `rateLimitByIp` (`src/lib/rate-limit.ts:63-88`) uses `require()` inside an ESM module to dodge a circular import — it would throw if ever called. Currently zero callers, i.e. untested dead code in the middle of the new rate-limiting work. | |

Also: **untrusted `clientIpHash` is still persisted** to the session doc (`session_creation_helpers.ts:406-407`) without the `serverSecret` gate that now guards *counting*. Combined with the new `MAX_FREE_PER_IP_MONTHLY` cap (`:258`) and the still-empty IP hash salt, a signed-in attacker can attribute sessions to a victim network's hash and **exhaust their quota**. The new cap created this vector.

---

## 1. Generation

| # | Defect | Status | Evidence at `2dca311c` |
|---|---|---|---|
| D1 | Svelte XSS validation non-fatal + ran after compile | ⚠️ **PARTIAL** | `compileSvelteBlock` now validates and **throws** (`svelte-compiler.ts:211-216`), and `runComposition` validates before compile (`composition-runner.ts:185-211`) ✅. But **`streamComposition` (`:379`) has no pre-compile gate** — straight to `compileComposition` at `:473`. And the bare `catch {}` at `composition-compiler.ts:348,449` now silently swallows the new XSS throw; the comment "the runner will validate and retry" is false on the streaming path. |
| D2 | LLM output written to `process.cwd()` and `await import()`ed — model-authored code runs in the VPS Node process | ❌ **UNTOUCHED** | verbatim at `svelte-compiler.ts:303-306`. No tmpdir, no sandbox, no gate. |
| D3 | Moderation bypassable — `sessions.create` public, Groq classifier only in the HTTP route | ⚠️ **PARTIAL** | IP-hash forgery closed (`session_creation_helpers.ts:151-157`, secret-gated trust) ✅. But the mutation is **still public with no secret gate** (`convex/sessions.ts:301`) and still runs only the deterministic regex (`:384`) — an **authenticated** user calling Convex directly still skips the LLM classifier entirely. The headline defect is unfixed. |
| D4 | `/start-generation` had no moderation, no rate limit | ⚠️ **PARTIAL** | Rate limit added and real (`start-generation-response.ts:38-44`, 5/10 min/IP) ✅. Moderation call count in that file: **0**. |
| D5 | X-Forwarded-For spoofable; IP hash salt defaults to `''` | ⚠️ **PARTIAL** | Now takes the **last** XFF entry and prefers proxy headers (`session-create-response.ts:44-60`) ✅. But **no trusted-proxy allowlist** — `x-real-ip` is accepted unconditionally, so the new comment "cannot be spoofed by the client" is false. **Salt still defaults to `''`** (`:71`) and does not fail closed. |
| D6 | `cloneUrl` / `designReferenceUrls` never moderated | ❌ **UNTOUCHED** | Neither is in `ModerationField` (`content_moderation_policy.ts:23-32`) or `FIELD_ORDER` (`:209-219`). (`cloneBrief` *is* moderated now — `session_clone_helpers.ts:116` ✅.) |
| — | New `src/lib/ssrf-protection.ts` | 🆕 **dead code** | **Zero importers repo-wide.** The real protection on the clone path is the pre-existing `assertPublicUrlPreflight` (`packages/ship-fast-engine/src/clone/security.ts:136,150-162`). The new module is strictly *weaker*: no DNS resolution (misses `metadata.google.internal`, DNS rebinding), no redirect handling. `clone.ts`'s +15 lines were only a rate limit. |

---

## 2. Billing — 1 of 10 fixed

| # | Defect | Status | Evidence |
|---|---|---|---|
| B1 | **IDOR in `confirmCheckoutSubscription`** | ⚠️ **PARTIAL — free Pro still mintable** | `userId` reassignment removed and an ownership guard added (`convex/billing.ts:286-295`) → subscription *theft* fixed ✅. But it is **still a public mutation** (`:262`) and the **insert branch is unguarded** (`:307-318`): any signed-in user calls it from the browser with an invented `providerSubscriptionId` + `status:'active'`, `planId:'pro'` and mints an active subscription. `getActiveSubscription` (`:28`) feeds quota and entitlement off that table. Provider verification still lives only in the HTTP route (`checkout-confirm-api-response.ts:150-190`). `convex/billing.test.ts:148` only covers the patch path. |
| B2 | `requireBillingReadAccess` no-auth bypass for ids without `\|` | ✅ **FIXED** | `convex/billing.ts:44-76` — secret-or-owner-or-admin. ⚠️ minor: if the secret is ever set to `""`, `timingSafeEqual('','')` is true → world-readable again. Add a non-empty check. |
| B3 | Plain `!==` on mutation secrets; Stripe hand-rolled | ⚠️ **PARTIAL** | Constant-time compare is real, Convex-safe, and wired at **both** sites (`convex/lib/timingSafeEqual.ts:9`, used `billing.ts:440`, `partners.ts:49`) ✅. Stripe is **still hand-rolled** (`webhook-api-response.ts:79-100`; no `stripe` dep, no `constructEvent`), and the `Object.fromEntries` multi-`v1=` bug **remains** at `:85` → valid events rejected during webhook-secret rotation. |
| B4 | Rate limits declared but never wired | ⚠️ **PARTIAL** | Now genuinely enforced: export 10/10 min (`export-api-response.ts:84`), download 20/10 min (`:140`), checkout start 5/10 min (`checkout-api-response.ts:221`), checkout confirm 5/10 min, clone 3, session create 10, generation 5, AI edit 10, translate 10, preview-html 10 ✅. **But** it is still a **process-local in-memory `Map`** (`src/lib/rate-limit.ts:1-17`) — resets on every deploy, per-instance, so with 3 Dokploy replicas the effective limit is 3×. Checkout start reuses the **shared `exportHits` map**, colliding with the export budget. |
| B5 | **No Stripe webhook route exists** | ❌ **UNTOUCHED** | `createWebhookApiResponse` is wired only at `routes/api/payments.razorpay.webhook.ts:12` and `razorpay.webhook.ts:9`. **Stripe payments still never reconcile to Convex.** |
| B6 | No event-name allowlist; unknown status defaults to `active` | ❌ **UNTOUCHED** | `stripePayloadToMutation:165` / `razorpayPayloadToMutation:211` still ignore `event.type`. `normalizeStripeStatus` → `return 'active'` (`:117`), `normalizeRazorpayStatus` → `'active'` (`:124`). A `payment.failed` / `subscription.halted` payload still grants access. |
| B7 | Credit-pack amount/currency never validated | ❌ **UNTOUCHED** | `creditsForPack:127` still maps `packId` → 3/10 credits with no check against `amount_paid` at either call site (`:186`, `:242`). Amount validation exists only on the Dub partner path. |
| B8 | Razorpay idempotency key `"<event>:<subscriptionId>"` swallows renewals | ❌ **UNTOUCHED** | Still `:224-227` and `:246-247`. `x-razorpay-event-id` never read. |
| B9 | No refund/chargeback clawback; credit debited before build | ❌ **UNTOUCHED** | No `charge.dispute.*`, no `payment.refunded` in `applyBillingWebhook` (`convex/billing.ts:417+`). Credit still debited before the artifact builds (`session_export_helpers.ts:1076-1096`), still charged to `session.userId` not the caller (`:1276`). |
| B10 | `DUB_PARTNERS_ENABLED` short-circuits `invoice.paid` | ❌ **WORSE** | `webhook-api-response.ts:441-457` still returns before `applyBillingWebhook`, and the commit **added `stripePartnerPayloadToMutation` (`:359`)** so `invoice.paid` / `invoice.payment_succeeded` now short-circuit for **Stripe too**. |

---

## 3. Session — the section that was genuinely fixed

| # | Defect | Status | Evidence |
|---|---|---|---|
| S1 | `forkSession` exfiltrated private sessions | ✅ **FIXED — in the mutation** | `session_fork_helpers.ts:41-53` calls `canReadPrivateSession` and throws FORBIDDEN. |
| S2 | `claimShareBonus` fully public | ✅ **FIXED — in the mutation** | `convex/shareBonus.ts:64-77` `verifyServerSecret()`, called by both `claimShareBonus` (`:44`) and `getShareBonusStatus` (`:18`), uses `timingSafeEqual`, fail-closed on missing env. |
| S3 | `claimAnonymousSessionsByIp` had no secret field → 502 or no check | ✅ **FIXED — in the mutation** | `session_validators.ts:114-117` now carries `secret`; verified in `session_access_helpers.ts:388-400` *before* `getUserId`, fail-closed. Route maps FORBIDDEN → 403 (`claim-anon-sessions.ts:93`). |
| S8 | Unbounded anonymous generation by omitting the IP hash | ✅ **FIXED — in the mutation** | `session_creation_helpers.ts:154-169` — `clientIpHash` trusted only with a matching `serverSecret`; anon without a trusted IP → `CLIENT_IP_REQUIRED`. |
| S4 | Other mutations with no ownership check | ❌ **UNTOUCHED** | `contentCache.ts:63 setPublic` still unauthenticated (shared-cache poisoning). `lakebed.ts:339,425` — `getSessionActor:114-179` still only rejects non-owners when `isPrivate === true`. `translationCache.ts:193 completeBatch` and `:257 releaseBatch` have **no auth at all**. `claimAnonymousSessionsByClientId` still has no secret and a forgeable id (`:337-370`). |
| S5 | Raw owner secret in URL query string; hash returned in public reads | ❌ **UNTOUCHED** | `create-export-response.ts:193`, `session-event-stream-route.ts:46-49`. `getGenerationSessionPublic` (`convex/sessions.ts:453-462`) still returns the raw doc including `anonOwnerSecretHash`, `clientIpHash`, `anonymousClientIdHash`, `ownerEmail`. |
| S6 | Claiming nulls `anonOwnerSecretHash` → permanent lockout of the true anon owner | ❌ **UNTOUCHED** | `session_access_helpers.ts:326,364,424`. |
| S7 | `DISABLE_PAYWALL` / `VITE_DISABLE_CLERK` disable **all** ownership checks | ❌ **UNTOUCHED** | `session_access_helpers.ts:212` (and `:156`, `:177`); `isUserAdmin` returns true for everyone when auth is disabled (`:113`); mirrored at `convex/lakebed.ts:170-176`. No production gate. The only mitigation is the commit message's claim that `VITE_DISABLE_CLERK=false` was set on prod — **configuration, not code**. |

Note: `MAX_PER_USER`, `MAX_PER_IP`, `MAX_PER_IP_AUTHED`, `MAX_CONCURRENT_PER_USER` in `billing_constants.ts` are **still dead** — no non-test importer; `session_creation_helpers.ts:50` hardcodes its own `SHORT_WINDOW_LIMIT = 5`.

---

## 4. Preview + Dashboard — the CSP does not do what it looks like it does

| # | Defect | Status | Evidence |
|---|---|---|---|
| P1 | preview-raw served attacker HTML same-origin with no headers | ⚠️ **PARTIAL — still XSS-exploitable** | `session-preview-raw-response.ts:56-65` added `X-Frame-Options: SAMEORIGIN` and a CSP — but the CSP is `default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self'`. **`'unsafe-inline'` + `'unsafe-eval'` means inline `<script>` and `on*=` handlers in attacker HTML execute normally.** No `sandbox`, no `script-src 'none'`, still on the main app origin. XFO only stops framing, which was never the attack. Still no `nosniff`; 404 (`:27,32,54`) and 503 (`:68`) paths still set **zero** headers; `Cache-Control: public, max-age=300` still has no `Vary`. A correct CSP already exists 20 lines away in `deployment-preview-response.ts:38` (`default-src 'none'`) — it just wasn't reused. |
| P2 | Filter absent from the full preview-save path | ✅ **FIXED** (HTTP layer) | `session-preview-edit-response.ts:223`. Not applied on read/serve. |
| P3 | Denylist bypasses | ❌ **5 of 6 SURVIVE** | Tested against the live pattern at `:17-18`. Still pass: `<svg/onload=alert(1)>` (attr alternation needs a literal `\s`; `/` isn't); `<a href="&#106;avascript:…">` (no entity decoding); `<style>@import url(//evil)</style>` (`style` not in the tag list); `<math><mtext><table><mglyph><style><!--</style><img title="--></mglyph><img&Tab;src=1&Tab;onerror=…">`; `<animate attributeName="href" values="javascript:…">`. `formaction` was added but `<button/formaction=javascript:…>` still passes via the same `\s` gap. |
| P4 | `createEdit` is a public mutation with no HTML validation | ❌ **UNTOUCHED — makes P2 cosmetic** | `convex/sessions.ts:998`; `createEditArgs` (`session_validators.ts:232`) gained **no** `serverSecret`, unlike `claimAnonymousByClientIdArgs`. A browser posting `afterHtml` straight to Convex skips P2 and P3 entirely. |
| P5 | No rate limit on preview saves | ⚠️ **PARTIAL** | 10/10 min added (`:198-205`) but process-local, and bypassable via P4. `createInlineStyleEditResponse` / `createInlineTextEditResponse` remain unlimited. |
| P6 | Sandbox escape + unsandboxed default path + unsandboxed export `srcDoc` | ❌ **ALL THREE UNTOUCHED** | `GeneratedModulePreview.tsx:244` still grants `allow-popups-to-escape-sandbox`; `:247` still renders `OpenUIModuleRenderer` in the app DOM same-origin (the commit's only edit here was import formatting); `stable-export-builder.ts:124,149` still emit `<iframe srcDoc>` with no `sandbox`. |
| P7 | No app-wide CSP / X-Frame-Options | ❌ **UNTOUCHED** | `vite.config.ts` diff is a one-char `res`→`_res` rename. No `_headers`, no helmet, no HSTS. `__root.tsx:69` still uses `dangerouslySetInnerHTML`. |
| P8 | Owner-secret brute-force: no rate limit, no lockout | ❌ **UNTOUCHED** | `session_edit_mutation_helpers.ts:782` → `session_access_helpers.ts:128-141`. The new `timingSafeEqual` was wired into linkforty/shareBonus/moderation/claim-anon — **not** into the owner-secret path. |

---

## 5. Secrets & env — the one real win, and the trap left armed

| # | Defect | Status | Evidence |
|---|---|---|---|
| E1 | `VITE_PEXELS_API_KEY` / `VITE_UNSPLASH_ACCESS_KEY` read in client-bundled code | ✅ **FIXED properly** | `stock-image.ts:213-229` now proxies through `fetch('/api/stock-images')` in the browser; server path reads the unprefixed vars only (`:235-236`, `:368-369`). No `import.meta.env.VITE_*` reads remain outside a comment and negative-assertion tests. |
| E2 | `envPrefix` exposes every `VITE_` var; no guard | ❌ **UNTOUCHED — trap still armed** | `vite.config.ts:692-699` byte-identical. Setting `VITE_PEXELS_API_KEY` in any build env still inlines it into the public bundle. |
| E3 | Everything on test keys | ❌ **UNTOUCHED** | `.env.local` / `.env.local.bak` / `dev-staging-setup.md`: Clerk `pk_test`/`sk_test`, Stripe `sk_test` + `whsec_`, Razorpay `rzp_tes`. `git grep -nIE "pk_live\|sk_live\|rzp_live"` over `docs scripts .github` → **0 hits**. No CI or doc gate requiring live keys. The "env sync" in the commit was one blank line added to `.env.example`. |
| E4 | Plaintext-secret files untracked **and not gitignored** | ❌ **UNTOUCHED** | `.gitignore` was **not modified by the commit**; still bare `*.local`. `git check-ignore -v .env.local.bak specs/architecture/dev-staging-setup.md` → no output, exit 1. Both still `??` in `git status`. `.env.local.bak` holds `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `MEDUSA_ADMIN_API_TOKEN`, `ADMIN_SSO_PRIVATE_KEY`, `BILLING_WEBHOOK_MUTATION_SECRET`, `DOKPLOY_API_TOKEN`, `CONVEX_SELF_HOSTED_ADMIN_KEY`. **One `git add .` from permanent history. Rotate and ignore.** |
| E5 | Did this commit leak secrets into history? | ✅ **CLEAN** | `git log -1 -p 2dca311c \| grep -cE "(sk_live_\|sk_test_\|whsec_\|rzp_…)"` → **0**. Tree-wide matches are all test fixtures/placeholders. |
| E6 | `VITE_DISABLE_CLERK` auth-bypass honoured server-side | ❌ **UNTOUCHED** | `clerk-runtime.ts:17-20` still trusts the raw value; no `NODE_ENV`/`import.meta.env.PROD` guard anywhere. Server-side honourers unchanged in `session_export_helpers.ts:83`, `section-edit-response.ts:147`, `translate-response.ts:227`, `rewrite.ts:13`, `github-oauth-response.ts:232`, `convex/lakebed.ts:168`. `use-optional-auth.ts:225` still documents "every visitor is treated as a super admin". Not even documented in `.env.example`. |

---

## 6. Tests, CI, ops, legal

Numbers below are from a **clean `bun install` inside the worktree** (the `isolated-vm` native build fails, everything else installed).

| # | Item | Status | Measured |
|---|---|---|---|
| O1 | Typecheck | ⚠️ **IMPROVED, still red** | **17 errors** (was 43). Top: `OpenUIViewer.tsx` (3), `openui-ssr.ts` (3), `GeneratedModulePreview.tsx` (2), `openui-html-export-builder.ts` (2), `section-edit-response.ts` (2), **`PricingContent.tsx` (1 — the N6 regression)**. CI runs `bun run typecheck` → **CI is red**. |
| O2 | Test suite | ⚠️ **finishes now, not green** | `Test Files 4 failed \| 700 passed \| 4 skipped (708)`, `Tests 6 failed \| 7696 passed \| 30 skipped (7732)`, 225 s (was: never finished in 580 s). **Contradicts "5516 tests pass, 0 failures".** Failures: `openui-preprocess.test.ts` + `section-kit-render.test.ts` = **regressions from this commit (N5)**; `-examples.behavioral.test.tsx` (3 tests — the `/examples` admin gate no longer 404s for non-admins) = **pre-existing**, last touched by `0cc29af9`; `toolchain-release.test.ts` = Bun pin drift, `1.3.14` local vs `1.3.12` pinned. Previously-failing `section-edit-response.entitlement`, `composition-e2e`, `claim-anon-sessions-route` now **pass** ✅. |
| O3 | `/api/rewrite` unauthenticated + unmetered LLM endpoint | ❌ **FILE NOT TOUCHED** | `rewrite.ts:16-20` byte-identical: `return /^Bearer\s+.+$/i.test(auth)`. Token never verified. No rate limit, no quota, no entitlement. `Bearer x` still reaches `generateText` at `:154`. It is now the **only** LLM route with neither real auth nor a limiter — clone, translate and section-edit all got one. |
| O4 | Spend cap / kill switch | ❌ **UNTOUCHED** | grep for `kill.?switch\|circuit.?breaker\|daily.?budget\|spend.?cap\|maxSpend\|costCap` across `src convex scripts packages` → **0 files**. |
| O5 | CI gating | ❌ **`.github/` NOT TOUCHED** | `ci.yml` still runs none of `verify:providers\|billing\|medusa\|monitoring\|generation\|seo-aeo`; `verify:release` never invoked. `git config core.hooksPath` → unset, hooks still not installed. |
| O6 | Refund policy / account deletion | ❌ **BOTH UNTOUCHED** | `-TermsPage.tsx:13` still `const LEGAL_REFUND_POLICY = ''`. `deleteAccount\|purgeUser\|user\.deleted` across `src` + `convex` → **0 hits**. |
| O7 | Monitoring, logging, backups, migrations, alerting, runbook | ❌ **ALL SEVEN UNTOUCHED** | No Sentry, no `@sentry/*` dep. No logger (`createLogger\|pino\|winston` → 0); **50** raw `console.*` in non-test `src` (was 59). `scripts/deploy-convex.mjs` → 0 hits for `backup\|snapshot\|export`. No `convex/migrations/`. No `cronJobs`. No `SECURITY.md`. |
| O8 | `.gitignore` hygiene (`output.txt`, `.interview/`) | ❌ **UNTOUCHED** | `.gitignore` not modified by the commit. |

**Commit composition:** 116 test/spec files vs 227 non-test (34 % / 66 %). The work is real, it just landed almost entirely on the session layer and the rate-limit plumbing.

---

## Where the effort went vs. where the risk is

| Area | Defects fixed | Defects left |
|---|---|---|
| Session | 4 / 8 (all four correctly inside the mutation) | 4 |
| Client secrets | 1 / 5 | 4 |
| Generation | 0 / 6 (4 partial) | 6 |
| Preview | 1 / 8 | 7 |
| Billing | 1 / 10 | 9 |
| Ops / CI / legal | 0 / 8 | 8 |

The pattern from the first audit **repeated**: several "fixes" were added to the HTTP layer while the Convex mutation stayed public — `confirmCheckoutSubscription` (B1 insert branch), `createEdit` (P4), `sessions.create` moderation (D3). The session fixes prove the team knows how to do it right; the same technique just wasn't carried across to billing and preview.

---

## Minimum set to reconsider a go

1. **Revert or re-guard the two new holes:** restore `assertCanMutateSession` on `gallery_preview_images.generateUploadUrl`/`commit` and delete or auth-gate `clearCache` (N1, N2). Restore the disposable-email check (N3).
2. **Billing:** guard the insert branch of `confirmCheckoutSubscription` or make it internal (B1); add the Stripe webhook route (B5); add an event-name allowlist and stop defaulting unknown status to `active` (B6); validate credit-pack amounts (B7); fix the Razorpay idempotency key (B8).
3. **Preview:** serve preview-raw with `default-src 'none'` + `sandbox` (or from a separate origin) — the CSP that already exists in `deployment-preview-response.ts` (P1); validate HTML inside `createEdit` (P4).
4. **Generation:** gate `streamComposition` (D1); move the SSR `import()` off `process.cwd()` and sandbox it (D2).
5. **Secrets:** switch to live keys (E3); gitignore + rotate `.env.local.bak` and `dev-staging-setup.md` (E4); add an `envPrefix` guard (E2).
6. **Cost:** authenticate `/api/rewrite` (O3) and add a spend cap (O4) — these are the two that can produce an unbounded bill on day one.
7. **Green the build:** 17 typecheck errors, 6 failing tests, and fix N5 before shipping — generated-site navigation is currently broken.

## What was and wasn't verified

**Verified:** all 45 defects re-read against source at `2dca311c` in an isolated worktree; `bunx tsc -p tsconfig.typecheck.json --noEmit` → 17 errors; full `vitest run` on clean deps → 4 suites / 6 tests failing, 225 s; P3 regex bypasses executed against the live pattern; `git show`/`grep` on the commit diff for secrets → 0.
**Not verified:** production runtime state — whether `SHARE_BONUS_MUTATION_SECRET`, `VITE_DISABLE_CLERK=false` and the model config vars are actually set on the Convex deployment and the 3 Dokploy apps (the commit message asserts this; N8 makes it load-bearing for *all* anonymous generation). No live webhook deliveries tested.


---


# Infrastructure decision memo — Convex hosting & where the web app should live

**Date:** 2026-07-31 · **Repo:** ship-fast @ `develop` (`4b018f18`) · **Live infra:** exodus (`livio-vps-2026-05-01`, 4 vCPU / 7.6 GiB)
**Method:** 4 parallel read-only investigations (filesystem/native deps, runtime shape, infra coupling, Convex cost & ops burden) + live read-only inspection of exodus + current Convex and Vercel pricing. **No files or config were changed and no deploys were run.**

Two questions were asked:
1. Should Convex move from self-hosted to Convex Cloud?
2. Is there any good reason to keep Ship Fast on Dokploy rather than moving to Vercel?

Short answers: **yes, move Convex now** — and **no, Vercel is not the right move**. The web app should stay on Dokploy.

> ## ⚠️ REVISION 2 — 2026-08-01
>
> Two claims in revision 1 were wrong and are corrected throughout this document. Read this box before the rest.
>
> **Correction A — Convex is not the disk problem.** Revision 1 implied that removing Convex and dead services would fix the 95 % disk. Measured breakdown: **Docker build cache is 47.6 GB (35 % of the disk)** and unused images are 13.75 GB; Convex's four volumes are 7.8 GB. `docker builder prune -a` + unused-image removal frees **~34 GB**; Convex → Cloud frees **9.7 GB**. Convex → Cloud is still a clear yes — its value is **operational tax and data-loss risk**, not gigabytes.
>
> **Correction B — the managed-container-host recommendation is withdrawn.** Revision 1 scored Railway/Render/Fly at 76/100. That score implicitly assumed exodus would be retired. The owner is **keeping Medusa, self-hosted Dub, Plausible and LinkForty**, so the box stays either way — which makes a third vendor pure addition: another bill, another place to debug, and a network hop to every service that stays. **Revised to ~25/100. The web app stays on Dokploy.**
>
> **New finding C — memory, not disk, is the live danger.** Swap is 4.0/4.0 GiB from *general* pressure across ~10 services (no single hog), and the OOM killer fired **17 times on the previous boot**. A **full XRDP desktop stack** (`xrdp`, `lightdm`, `pipewire`, `wireplumber`) is running on this 7.6 GiB production server and was the OOM victim set. Removing Convex returns only ~15 % of the pressure.
>
> **New finding D — in-flight generations are stranded permanently on every redeploy.** See the new section *"2b. Deploy safety"*. This is a production bug, independent of any hosting decision, and it has a ~30-line fix.

---

## Scorecard (revised 2026-08-01)

| Option | Case for | Case against | Overall |
|---|---|---|---|
| **`docker builder prune -a` + unused images** | **97/100** | 3/100 | **97/100 — the actual disk fix** |
| **Schedule `failIfStillStreaming` reaper** | **96/100** | 4/100 | **96/100 — ~30 lines, stops stranding users** |
| **Remove the XRDP/desktop stack from the server** | **92/100** | 8/100 | **92/100 — it was the OOM victim set** |
| **Convex → Convex Cloud** | **94/100** | **12/100** | **93/100 — risk + ops tax, not disk** |
| **Backups for every stateful service that stays** | **90/100** | 10/100 | **90/100 — Convex Cloud covers only Convex** |
| **Docker log rotation (`daemon.json`)** | 85/100 | 5/100 | **85/100 — latent, cheap** |
| **Split the generation worker** (2nd Dokploy app, same repo) | 80/100 | 30/100 | **80/100 — deploy safety, same box, no new vendor** |
| **Remove PocketBase** (zero code references) | 70/100 | 5/100 | **70/100** |
| **Web app stays on Dokploy** | 74/100 | 26/100 | **75/100 — correct call** |
| ~~Web app → managed container host~~ | 30/100 | 78/100 | **~~76~~ → 25/100 — withdrawn, see Correction B** |
| **Web app → Vercel, as-is** | 30/100 | 85/100 | **20/100 — no** |
| **Web app → Vercel, after worker extraction** | 62/100 | 45/100 | **55/100 — plausible later, not now** |
| **Status quo** | 20/100 | **90/100** | **15/100** |

---

# 1. Convex: self-hosted vs Cloud

## The fact that settles it — you land on the free tier

| Metric | Measured usage today | Convex Starter (free) |
|---|---|---|
| Database | **148 MB** (`db.sqlite3`) | 0.5 GB |
| File storage | **175 MB** (1591 files) | 1 GB |
| Function calls | **~55 k/month** | 1 M |
| Developers | 1 | up to 6, **no seat charge** |

Traffic derivation: 7 days of `shipfast-convex-w0pyvp-backend-1` logs (29 501 lines, back to 2026-07-24) show 11 322 `/api/query`, 633 `/api/mutation`, 338 `/api/actions`, 367 `/api/storage` → ≈ 12.7 k HTTP function calls per 7 days ≈ **1 800/day ≈ 55 k/month**. Websocket-multiplexed subscription re-runs are undercounted, so treat this as a floor — it is still one to two orders of magnitude under the 1 M free allowance.

Starter overage is pay-as-you-go: **$2.20 / 1M calls, $0.22/GB database, $0.033/GB file storage, $0.132/GB egress**. At 10× current traffic that is roughly **$1–3/month**. The Professional plan ($25/developer/month, 25 M calls, 50 GB DB, 100 GB files, 50 GB egress) buys headroom you are nowhere near needing.

**The question is not whether Cloud is worth the money. It is why you are paying in disk, RAM and incidents for something that would be free.**

## What self-hosting costs today (measured)

### Risk

- ❌ **Zero backups.** `sudo crontab -l` → none for root. No `/etc/cron.d` or `cron.daily` entries. `docker ps -a | grep -iE 'backup|restic|borg|duplicati'` → empty. `systemctl list-timers` → stock only. No volume snapshot, no off-box copy. `scripts/deploy-convex.mjs` runs only `bunx convex deploy -y` — zero hits for `backup|snapshot|export`.
- ❌ The **only** backup artifact in existence is a manual `db.sqlite3.pre-gallery-cleanup-20260615162924` (29 M) — a human `cp` before a risky cleanup, now six weeks stale.
- ❌ **Losing `/dev/sda1` today loses every session, subscription, credit-ledger entry, referral, commerce tenant, and 1591 user files, with no recovery path. RPO = ∞, RTO = ∞.**

### Capacity

- ❌ `df -h /` → **150 G total, 136 G used, 8.2 G free, 95 %**.
- ❌ `free -h` → 7.6 Gi total, 4.1 Gi used, 427 Mi free, **swap 4.0 Gi of 4.0 Gi — fully exhausted**. Load 1.14 on 4 cores (CPU is not the constraint; RAM and disk are).
- ❌ Convex occupies **7.8 GB** on disk for **320 MB of real data**:

| Path | Size | Nature |
|---|---|---|
| `shipfast-convex-w0pyvp_data/storage/modules` | **4.8 G** | deploy exhaust — a source package per push, never GC'd |
| `…/tmp` | **1.6 G** | leftover `.tmpXXXX` dirs (largest 136 M) |
| `…/storage/files` | 175 M | real user data |
| `…/db.sqlite3` | 148 M | real user data |
| `shipfast-convex-free-rr9lw4_data` | 861 M | free-tier instance |
| `shipfast-convex-g2wtj0_data` | 174 M | **orphaned — no container exists** |
| `shipfast-convex-stg1-m4rw4m_data` | 136 M | **orphaned — no container exists** |

  ~73 % of the prod volume is self-hosting exhaust, driven by **32 `finish_push` in 7 days ≈ 4.6 Convex deploys/day (~140/month)**.
- ❌ 410 MiB resident RAM (`shipfast-convex-w0pyvp-backend-1`) — the #3 memory consumer of 40 containers, on a box that is already swapping.

### Incidents already paid for

| Commit | What it was | Cost |
|---|---|---|
| `a7539b79` (07-31) | `fix(deploy): prevent Convex deploy timeouts and restart loops` — V8 isolate analysis timeouts (2 s limit) → `evaluate_push` 400 → build failure → **Dokploy restart loop 12×/day** | 17 files, +1155/−1106; nixpacks reorder, 3×30 s retry, and relocating 6 runtime modules into `convex/lib/` purely to shrink the analyze bundle |
| `387eec09` / `9efc9cc1` (06-16) | `harden deploy: auto-deploy Convex functions` — fixing frontend/Convex **version skew** causing `ArgumentValidationError` generation outages | quoted in `scripts/deploy-convex.mjs:1-12` |
| `4e117f14` (07-30) | `fix(convex): preserve legacy preview schema` | |
| `7172bb22` (07-31) | `fix(convex): treat VITE_DISABLE_CLERK as admin + skip prompt-cache` | |
| `82893abf` (07-31) | `docs(agents): add staging Convex backend reference` — an entire spec (`specs/architecture/dev-staging-setup.md`) exists only to document self-hosted topology | Traefik dynamic file, hand-created external network, per-container admin-key generation |

Plus a permanent unfixed wart, documented at `specs/architecture/dev-staging-setup.md:258-265`: the prod admin key returns `BadAdminKey` from outside the container; the recorded workaround is *"deploy from inside the container, or use staging."* Admin keys are minted by `docker exec … generate_admin_key.sh`.

Backend health noise over 7 days: **378 `developer_error`, 27 OCC errors, 1 `out_of_retention`, 1 cron system error**; prod backend `RestartCount=1`, restarted 2 h before inspection.

Instance sprawl from repeated self-host migrations (`.io` → `.ai` → staging) left 4 data volumes and 2 dead deployments; the spec's "Production Convex" container `g2wtj0` no longer exists while the app still points at `https://convex-backend.ship-fast.io` (= `w0pyvp`).

## What the migration costs — config, not code

- URL resolution already degrades gracefully: `src/shared/env/convex-runtime.ts:27-30` falls back `CONVEX_SELF_HOSTED_URL ?? CONVEX_URL ?? VITE_CONVEX_SELF_HOSTED_URL ?? VITE_CONVEX_URL`; every field in `src/shared/env/app-env.ts:8-14` is `.optional()`; `vite.config.ts:695-696` inlines both names.
- The only real coupling is `scripts/deploy-convex.mjs:38-46`, which hard-sets `CONVEX_SELF_HOSTED_URL`/`_ADMIN_KEY` and blanks `CONVEX_DEPLOYMENT`. Switching to Cloud means using `CONVEX_DEPLOY_KEY` instead — **≈10 lines plus its test** (`scripts/deploy-convex.test.ts`).
- **No self-hosted-only feature is in use**: one hourly cron (`convex/crons.ts:11-15`, commerce lifecycle sweep — Cloud-supported), one component (`@ikhrustalev/convex-debouncer`), 7 declared env vars. Nothing Cloud-only is missing either.
- **No `convex/http.ts` exists** — no `httpRouter`/`httpAction` anywhere, and `VITE_CONVEX_SITE_URL` has zero code references. So there are no HTTP-action URLs, CORS rules, or webhook endpoints to re-register.
- Data move: `convex export` from self-hosted → `convex import` to Cloud, ~320 MB.

## Verdict

**95/100 — move to Convex Cloud before launch, not after.** You are hand-operating a database with no backups, on a 95 %-full disk with exhausted swap, to save $0/month. The migration is a config change and one 10-line script edit.

---

# 2. Dokploy vs Vercel

## Headline finding: the web server *is* the generation engine

`startVpsGeneration` is misleadingly named. There is **no VPS worker, no queue, no second deployment**:

```
vps-generation-handler.ts:187   const { runComposition } = await import('@ship-fast/engine')
vps-generation-handler.ts:193   runEngineGeneration({ runAll: runComposition, ... })
```

The engine runs **in the same Node process that served the HTTP request**. The only network hop is to Convex. The web tier is not a thin API in front of a worker — it is the compiler, a headless-browser host, and a V8-isolate sandbox.

## What is NOT a blocker

Duration is fine. Vercel Fluid Compute (default) allows **300 s by default, 800 s max on Pro, 1800 s in beta**, and `waitUntil` continues work after the response is sent.

| Path | Worst case | Evidence | Fits |
|---|---|---|---|
| Generation | ~90–120 s | `GENERATION_TIMEOUT_MS = 90_000` × `GENERATION_ATTEMPTS = 2` sharing one abort scope (`generation-runner.ts:59-61,140`) | ✅ |
| Section edit | ~180–210 s | `SECTION_EDIT_TIMEOUT_MS = 45_000` × `MAX_AUTO_FIX_RETRIES = 3` loop (`section-edit-response.ts:80,85,963`) + esbuild + isolate smoke test | ✅ |
| Clone job | ~180 s | `JOB_TIMEOUT_MS = 180_000` (`clone-orchestrator-response.ts:23`) | ✅ |
| Translate | ~60 s | 12 s abort × 4 sequential chunks + `CACHE_CLAIM_WAIT_MS = 12_000` | ✅ |

The two `void`-ed fire-and-forget calls (`session-create-response.ts:281`, `routes/api/clone.ts:177`) would become `waitUntil(...)` — a contained change, not an architecture rewrite.

Also non-issues: there is **no real SSE** (`session-event-stream-route.ts:162` returns a fully materialized string and closes; no client consumes `/api/sessions/:id/stream` — the route looks vestigial), and realtime comes over Convex's own websocket directly from the browser (`ClerkConvexProvider.tsx:22`), never through the web server. `src/lib/rate-limit.ts`'s module-level `Map`s are already write-dead, so serverless changes nothing there.

## What IS a blocker

| # | Blocker | Evidence | Severity |
|---|---|---|---|
| V1 | **`docker` shell-out for Medusa tenant provisioning** — `docker inspect medusa-postgres-1`, `docker exec … psql -c "CREATE DATABASE"`, `docker run -d --network medusa_default`, `docker logs` — reached from an HTTP route | `medusa-container-provisioner.ts:1-6,125,134,258,266` ← `commerce-api-response.ts:609` ← `routes/api/sessions.$sessionId.provision.medusa.ts` | **HARD** — no Docker daemon on Lambda. This is a *product feature* (customer-isolated multi-tenancy), not incidental |
| V2 | **In-process headless Chromium** on request paths | `clone-orchestrator-response.ts:159`, `gallery-preview-image-generation.ts:57-79`; `nixpacks.toml:11,20` pins `PLAYWRIGHT_BROWSERS_PATH=0` and installs Chromium with `--with-deps` (needs apt root — impossible in a Vercel build); ~450 MB vs a 250 MB unzipped function limit | **HARD as written** — needs `@sparticuz/chromium` or an external screenshot worker |
| V3 | **Runtime reads of the repo source tree** — export builders `readdirSync`/`readFileSync` over `packages/ship-fast-blocks/**/*.tsx`, walk `src/`, read `src/styles.css` and `bun.lock` at request time | `openui-export-builder.ts:111,520,545,3607`, `export-tailwind-css.ts:28,31-32,139` ← `routes/export.$sessionId.$target.ts` | **MEDIUM-HARD** — Vercel tree-shakes; would require shipping the source tree via `outputFileTracingIncludes`. Doable, brittle, large |
| V4 | **`isolated-vm` native V8 addon** on the section-edit path | `section-edit-response.ts:6,838` via `@tanstack/ai-isolate-node`; `nixpacks.toml:1-5,38-41` pins nodejs_22 and refuses bun *because of* the ABI | **MEDIUM** — an `abi127.glibc` prebuild exists, but it loads via `node-gyp-build` at runtime, so Vercel's tracer will likely miss it |
| V5 | **`svelte-compiler` writes to cwd then `await import()`s** — comment: *"Write inside the project root so node_modules resolution works"* | `svelte-compiler.ts:159-165` | **MEDIUM** — "point it at `/tmp`" does **not** work; `/tmp` has no `node_modules`, so `svelte/internal` won't resolve. Needs pre-bundling or `nodePaths` injection |
| V6 | esbuild binary `chmodSync` + `execFileSync` on a read-only bundle; cwd-joined `node_modules/lakebed` resolution | `lakebed-deploy-service.ts:29,312-321,831,905` | **MEDIUM** |
| V7 | Disk-backed early-adopter counter (`_early_adopter_count.json`) | `payments.ts:60-68,92` | **SOFT** — move to Convex |
| V8 | `/tmp` workspace resume across invocations | `generation-runner.ts:128` `readCompletedWorkspace` | **SOFT** — already falls through on miss; cost is redoing LLM work |
| V9 | Nitro preset is `nodeServer`; no `vercel.json` exists | `vite.config.ts:741,746` | **SOFT** |

## The meta-point that actually settles it

**34 of the 40 containers on exodus are Ship Fast.**

Self-hosted Convex ×2 (prod + free-tier), the shared Medusa stack (`medusa.ship-fast.ai`: server, worker, Postgres, Redis), LinkForty (`links.ship-fast.ai`) + Postgres + Redis, a full self-hosted Dub (ClickHouse + MySQL + Tinybird + QStash + MinIO + Redis), Plausible + Postgres + ClickHouse, and a `shipfast-pocketbase` with **zero references in `src/` or `convex/`**.

The only non-Ship-Fast workloads are `github-forks-app` + `github-forks-pocketbase` (a separate project) and the platform itself (dokploy, dokploy-postgres, dokploy-redis, traefik).

**Moving only the web app to Vercel leaves ~30 containers still needed on that box.** You would pay Vercel, keep paying for exodus, still have no backups, still be at 95 % disk — and now debug across two hosting models, having re-expressed the wildcard-subdomain routing (`subdomain-rewrite.ts:74-85`, currently Traefik `HostRegexp('^([a-z0-9]…)\.ship-fast\.ai$')`) as a Vercel wildcard domain. All of the cost, none of the relief.

## Things that are genuinely *not* tied to Dokploy (good news)

- **Dokploy is not a product dependency.** `DOKPLOY_API_TOKEN`/`DOKPLOY_API_URL` appear only in `specs/architecture/dev-staging-setup.md:103-104` and `.env.local` — **zero application call sites**. The only client, `packages/commerce-provisioner/src/dokploy-client.ts:41-79`, is a deliberate stub that throws `DokployIntegrationUnverifiedError`. Business logic targets the provider-agnostic `SwarmInfraProvider` interface (`packages/commerce-provisioner/src/types.ts:68`). **No user site is deployed to Dokploy by the product.** Those two env vars can simply be deleted.
- **User sites deploy to Lakebed**, an external SaaS — `lakebed-deploy-service.ts:215-227` → `https://api.lakebed.app`. Moves with the app.
- **The hourly cron runs inside Convex** (`convex/crons.ts:11-15`), not the web app — unaffected by any web-host move.
- **No Convex HTTP actions** → no host-split CORS or webhook breakage. The cost of split hosting is latency only (every SSR query crossing Vercel → exodus).

## What would have to be repointed (config only)

`CONVEX_SELF_HOSTED_URL` / `_ADMIN_KEY` / `VITE_CONVEX_URL`; `MEDUSA_BACKEND_URL` + `VITE_MEDUSA_*` + `MEDUSA_ADMIN_API_TOKEN`; `LINKFORTY_API_URL`; `DUB_API_URL`/`DUB_API_KEY`; `APP_BASE_URL` / `NEXT_PUBLIC_BASE_DOMAIN`; `GITHUB_OAUTH_REDIRECT_URI`; the Plausible script host. Plus DNS + **wildcard TLS** for `*.ship-fast.ai` and `*.ship-fast.io`, and re-registering 4 webhook URLs (Razorpay ×2, Stripe — same handler, `webhook-api-response.ts:470` — LinkForty, Medusa per-deployment).

## ~~The option not asked about~~ — WITHDRAWN (see Correction B)

Revision 1 recommended a managed container host (Railway / Render / Fly) on the reasoning that Ship Fast is a container app and Vercel asks it to stop being one. That reasoning is still correct; the **conclusion** was not.

The score assumed exodus would be retired. It will not be: Medusa, self-hosted Dub, Plausible and LinkForty are all staying by choice. With the box staying, a managed container host adds a second vendor, a second bill, a second place to debug, and a network hop from the web app to every service that remains on exodus — while removing nothing. **Keep the web app on Dokploy.**

The genuine deploy-safety concern that motivated the idea is real, and it has a better answer that costs no new infrastructure: split the generation worker into a **second Dokploy app from the same repo** (§2b).

---

## 2b. Deploy safety — in-flight generations are stranded permanently

This is a production bug that exists today, independent of any hosting decision.

| Finding | Evidence |
|---|---|
| Generation start writes `status: 'streaming'` | `convex/lib/session_generation_progress_helpers.ts:36` |
| The only terminal writes (`completeGeneratedSession` / `failGeneratedSession`) are reachable **only from inside the same Node process** | `session_generation_state_helpers.ts:120,196` ← `generation-runner.ts:158,177` |
| **No reaper.** `convex/crons.ts` is 18 lines, one job (commerce sweep). No lease/heartbeat on `sessions` — `leaseExpiresAt` exists only on `dubEventOutbox` and commerce ops | `convex/schema.ts:52,570,672` |
| A reaper could not even enumerate stuck rows — `sessions` has no `by_status` index | `convex/schema.ts:225-238` |
| **Unrestartable by design** — `startableGenerationStatuses` excludes `'streaming'`, so retry returns `started:false, reason:'generation_already_started'` and the route answers `200 {status:'skipped'}` | `session_generation_progress_helpers.ts:7-11`; `start-generation-response.ts:44` |
| **No SIGTERM handler anywhere**; start command is plain `node .output/server/index.mjs` as PID 1 | `nixpacks.toml [start]`; zero `process.on('SIGTERM')` in `src/`, `convex/`, `packages/*/src` |
| Client shows the generating skeleton **forever** — `hasGenerationFailure` requires `session.errorCode`, never set on a strand | `Dashboard.tsx:594-598,1759` |
| **The user's quota is already spent** — quota counts `sessions` rows at create time, excluding only drafts; `regenerateSession` is admin-only | `billing_generation_quota.ts:57-63`; `sessions.ts:326` |

**Estimated blast radius:** ~120 s exposure per generation. At 20 generations/day and ~4.6 deploys/day ≈ 1 stranded session/week — but bursty: 20 generations in one demo hour gives ~67 % odds of losing one to a deploy in that hour. Under the 12×/day restart-loop regime already experienced, several per day.

**The ~30-line fix, available today, no worker required.** A scheduler self-heal precedent already exists in the file that would be edited: `ctx.scheduler.runAfter(DRAFT_SESSION_TTL_MS, deleteDraftSessionIfStillDraft, …)` at `convex/lib/session_creation_helpers.ts:494-499`. Apply the same pattern inside `markSessionGenerationStarted` — schedule `failIfStillStreaming(sessionId)` at +3 min; if still `streaming` when it fires, mark failed with a real `errorCode`. This makes the UI show a failure and makes retry possible.

**Then the worker split.** `startVpsGeneration` is already worker-shaped: its input is a plain object (`sessionId`, `anonymousOwnerSecret`, `bearerToken`), no `Request`, no route coupling, and every read/write is a `ConvexHttpClient` call — generation state is already fully in Convex (`vps-generation-handler.ts:103-116`). Disk affinity is not real: `prepareEngineWorkspace` `rmSync`s the workspace at the start of every run and `readCompletedWorkspace` is a best-effort resume that falls through on a miss. The job-queue pattern already exists twice in the schema — `dubEventOutbox` (`schema.ts:41-56,829`, drained by `partners_worker.ts:20,68-71`) and the `translationCacheClaims` claim-or-steal lease (`translationCache.ts:180-186,192,257`).

**Single real obstacle:** all generation writes go through *public* mutations gated by `assertGenerationOwnership`, keyed on the caller's Clerk JWT or `anonOwnerSecret` — which a detached worker cannot hold. Internal/service-identity mutation variants are required. That overlaps with the public-mutation findings in the security audits, so the work is dual-purpose.

**What it does not buy:** a slimmer web image. Section-edit keeps `isolated-vm`, export keeps reading the source tree. ~85–90 % of the 92 API routes stay in web. The win is deploy safety and blast-radius isolation.

---

# 2c. Measured host forensics (2026-08-01)

## Where the 136 GB actually is

```
136G /
├── 104G /var  →  103G /var/lib/docker  →  92G overlay2, 9.5G volumes
├──  20G /home  (19G /home/livio: .cargo 4.0G, .local 2.2G, .cache 1.9G, .codex 1.6G, .rustup 1.4G, go 1.2G, .bun 1.2G)
└── 4.4G /etc   (/etc/dokploy 4.5G: applications 3.2G, compose 986M)
```

```
TYPE            TOTAL  ACTIVE  SIZE      RECLAIMABLE
Images          44     40      67.31GB   13.75GB
Build Cache     227    10      47.60GB   47.03GB   ← 35% of the disk
Local Volumes   42     27       9.96GB    0.34GB
Containers      51     40       4.21GB    0B
```

Ground-truth bound: overlay2 is 92 G; active images (53.6 G) + container rw layers (4.2 G) = 57.8 G must stay → **~34 GB genuinely recoverable**. Docker's own "47 G + 13.75 G" double-counts shared layers.

## Reclaim math (Dub, Plausible, Medusa, LinkForty all staying)

| Action | Freed | Used after | % |
|---|---|---|---|
| baseline | — | 136 G | **95 %** |
| Convex → Cloud (4 volumes 7.77 G + 2 images 1.68 G + rw layers) | 9.7 G | 126 G | 84 % |
| + PocketBase (`shipfast_pb_data` 28 M + image 53 M only — see correction below) | 0.08 G | 126 G | 84 % |
| + `docker builder prune -a` + unused images | **~34 G** | **92 G** | **61 %** |
| **all** | **~44 G** | **~92 G** | **~61 %, 52 G free** |

> **EXECUTED 2026-08-01** — build-cache prune + dangling-image prune + 2 unreferenced Convex volumes: **136 G → 105 G, 95 % → 73 %, 39 G free.** Actual delta is lower than Docker's logical figures (47.03 G + 13.75 G) because layers are shared. 40/40 containers still running, none unhealthy, `ship-fast.ai` → 200. Remaining lever: **27.3 GB raw** held by 6 untagged old deploy images pinned by 11 *exited* swarm task containers — `docker image prune -a` reclaims 0 B until those containers are removed first. **Swap unchanged at 4.0/4.0 GiB — disk work does nothing for the memory problem.**
>
> ⚠️ **Correction to this table:** `compose-program-back-end-microchip-f7np6u_pocketbase-data` (177 M) was listed as an orphan. It is **not** — it is mounted by `github-forks-pocketbase`, Up and healthy. Deleting it would have destroyed a live service's data. It was correctly skipped.

## Memory — the live danger

`Mem 7.6Gi total / 4.1Gi used / 308Mi free · Swap 4.0Gi used / 3.8Mi free · swappiness=10 · load 1.96`

Swap holders (sum 3.92 GiB) — **no single hog**:

| Process | Swap | Belongs to |
|---|---|---|
| `next-server` | 1006 MB (26 %) | web app |
| `convex-local-ba` | 739 MB (19 %) | Convex |
| `mysqld` | 360 MB | Dub |
| `clickhouse-server` | 269 MB | Dub |
| `beam.smp` | 240 MB | Plausible |
| `node` / `MainThread` | ~690 MB | assorted |

Top RSS: `dokploy 788.8 MiB`, `clickhouse 586.8 MiB`, `convex-w0pyvp-backend 380.9 MiB`, `medusa-server 224.3 MiB`, `outline 189.2 MiB`.

**OOM history:** current boot (27 h) 0 kills; **previous boot (Jul 30 01:25→19:28): 17 kills** — `wireplumber ×5, pipewire ×4, pipewire-pulse ×3, chrome-headless ×3, systemd, dbus-daemon`. Box rebooted Jul 30 19:28 after 35 days uptime. **A full XRDP desktop stack (`xrdp`, `lightdm`, `pipewire`, `wireplumber`) runs on this 7.6 GiB production server and was the OOM victim set.**

**Log rotation:** `/etc/docker/daemon.json` **does not exist** → no `log-opts`, no `max-size`, unbounded `json-file` logging. Total json logs are only 94 MB today because ~140 deploys/month keep recreating containers — latent, not current.

## Why the combination produces an incident on its own schedule

1. **Disk fills during the operation that needs it most.** A Dokploy deploy writes a new ~4.2 GB image layer set *before* dropping the old one (8 dangling 4.22 GB images from one app rebuilt 8× in 23 h). With 8.1 GB free, a build needing more fails partway, leaving a half-written layer and *less* free space than before — the restart-loop shape already hit on 07-31.
2. **ENOSPC is not graceful in databases.** Convex's SQLite needs WAL + checkpoint room; Postgres (dokploy, Medusa, Plausible, LinkForty), MySQL and ClickHouse (Dub) need WAL/binlog headroom. Postgres **PANICs and shuts down** if it cannot write WAL. "Disk full" therefore means several stateful services stop, some mid-write.
3. **Swap at 4.0/4.0 GiB means no shock absorber.** Everything evictable is already evicted; the next spike goes to the OOM killer — which has already fired 17×.
4. **The coupling:** a deploy spikes disk *and* RAM simultaneously, ~140×/month.
5. **No backups turn an incident into a loss.** With backups: disk-full → restore → annoying afternoon. Without: a damaged SQLite file or Postgres volume is terminal.

---

# 2d. Convex Cloud: staging + production in one account — confirmed

- Every project has **one shared production deployment + one dev deployment per team member**.
- **A team can have multiple projects.** The documented pattern for a persistent staging environment is *"use a separate Convex project, and deploy to it by setting the `CONVEX_DEPLOY_KEY` environment variable when running deployment commands."*
- **Preview deployments** (per feature branch, auto-created, auto-expiring) are available on **all tiers including free** — 5 days on Free/Starter, 14 days on Professional.

Target shape: one team → project `ship-fast` (production) + project `ship-fast-staging`, each with its own deploy key, one bill. This maps 1:1 onto the current `convex-backend.ship-fast.ai` + staging backend topology.

**Caveat:** plan limits (1 M calls / 0.5 GB DB / 1 GB files on Starter) are **team-level**, so staging and production share one allowance. At 148 MB / ~55 k calls this is irrelevant — ~15× growth before it matters. Professional ($25/developer) raises it to 25 M calls / 50 GB DB.

---

# 3. Recommended sequence (revised 2026-08-01)

| # | Action | Effort | Why | Score |
|---|---|---|---|---|
| 1 | `docker builder prune -a` + remove unused images | 10 min | 95 % → ~63 % disk. **The actual disk fix** | **97/100** |
| 2 | Schedule `failIfStillStreaming` at +3 min | ~30 lines | Stops stranding users' sessions *and* their quota. Works today, no worker needed | **96/100** |
| 3 | Remove the XRDP/desktop stack (`xrdp`, `lightdm`, `pipewire`, `wireplumber`) | 15 min | A desktop environment on a 7.6 GiB prod server; it was the OOM victim set | **92/100** |
| 4 | Convex → Cloud (prod + staging as two projects, one team) | ~10 lines + export/import | Removes the operational tax and the largest single-point data-loss risk | **93/100** |
| 5 | `/etc/docker/daemon.json` with `log-opts max-size` | 5 min | Unbounded json logs; small only by accident | **85/100** |
| 6 | Backups for everything that stays — nightly `pg_dump` / ClickHouse dump for Medusa, Dub, Plausible, LinkForty → off-box | ~2 h | Convex Cloud covers only Convex | **90/100** |
| 7 | Remove PocketBase — **`shipfast_pb_data` + image only** (~81 M) | 10 min | Zero code references. ⚠️ `…f7np6u_pocketbase-data` (177 M) is **live** — mounted by `github-forks-pocketbase`, a different project. Do not touch | 45/100 |
| 8 | Split the generation worker into a second Dokploy app from the same repo, Convex-backed job queue with a lease | days | Deploy the site freely without killing generations. Same box, no new vendor | **80/100** |
| — | ~~Railway / Render / Fly~~ | — | Withdrawn — the box stays, so it is pure addition | 25/100 |
| — | ~~Vercel~~ | — | Four hard blockers, and the box stays anyway | 20/100 |

**Steps 1–3 are same-day and remove most of the live risk. 4 and 6 are this week. 8 is the real architectural improvement — step 2 makes it non-urgent.**

---

## Verification note

**Verified:** `convex/schema.ts` table count; `du`/`df`/`free`/`uptime`/`docker stats`/`docker ps` on exodus (read-only); 7 days of Convex backend logs; `git log` for Convex-related commits; `crontab`/`systemctl list-timers`/backup-container search; source reads with `file:line` for every code claim above; Convex pricing (convex.dev/pricing) and Vercel duration limits (vercel.com/docs, updated 2026-07-01).
**Not verified:** actual egress volume (the one free-tier metric not directly measurable read-only); real cost on Railway/Render/Fly for this workload; whether a Convex Cloud import of the 148 MB DB + 175 MB files succeeds first time.
**Changed:** nothing. No files edited, no deploys, no config changes, no restarts.


---


# Documentation Control

## Source hierarchy

1. Current production source plus focused behavioral tests: implementation truth.
2. Generated API/schema artifacts: interface truth when generated from current source.
3. This living reference and its companion gap register: maintained explanation of current behavior and missing decisions.
4. Architecture specs and verification reports: dated evidence, not a promise that behavior still exists.
5. `codemap.md`: navigation aid only until corrected; it currently cites removed generator files.
6. `TODO.md`: acceptance backlog, not behavior specification.

When sources disagree, document the disagreement, inspect current implementation/tests, and either correct the document or open a decision. Never silently preserve stale architecture prose.

## Documentation inventory

| Document | Current value | Limitation |
| --- | --- | --- |
| `readme.md` | onboarding and minimal environment/scripts | Does not cover product, API, data, auth, operations, or errors. |
| `codemap.md` | high-level directory/control-flow atlas | Drift: removed `runner-v2.ts` and `phase-sff-html.ts` named as live entry points. |
| `docs/go-prod.md` | quota/admin safety | Not a complete auth or incident runbook. |
| `docs/verification/provider-runbook.md` | provider-proof evidence checklist | Not a contract or completed acceptance record. |
| `src/features/exports/STABLE_CONTRACT.md` | intended stable export migration | Active route still uses legacy/OpenUI artifact behavior. |
| `specs/architecture/*.md` | historical audits/design proposals | Most are snapshots; no refresh owner/trigger. |
| `TODO.md` | pending provider and launch proof | No ownership, target date, or risk acceptance. |

## Required companion documents to add

The audit found no maintained canonical versions of these artifacts:

- Generated API catalog: HTTP and Convex public/internal function name, caller, args, return data, auth, rate limit, errors, and deprecation status.
- Schema/data dictionary: field purpose, indexes, PII classification, ownership, lifecycle, retention, deletion, and source-of-truth status for all 46 tables.
- State machine set: session, generation task/event, export artifact, deployment, billing entitlement, commerce instance/store, and outbox retry transitions.
- Access matrix: anonymous, signed-in, paid, admin, server integration, and public preview capabilities for every operation.
- Environment/secrets catalog: placement (browser/app/Convex), owner, rotation, least privilege, test/staging/prod values, and fallback behavior.
- Integration runbooks: data flow, auth/scopes, webhook verification, idempotency, retries, degradation, reconciliation, monitoring, and offboarding.
- Release/runbook matrix: each verification command, prerequisites, owner, CI/manual classification, evidence output, and rollback action.
- Privacy/retention model: generated content, IP hashes, analytics, third-party media, OAuth state, webhooks, exports, and deletion requests.

## Update triggers

Documentation changes are required whenever a change touches:

- `src/routes/` or `src/features/*/server/`: route/API catalog and user journey.
- `convex/schema.ts` or `convex/*.ts`: data dictionary, state machine, public/internal API, access/error matrix.
- `packages/`: generation/output contract, package public surface, component provenance, and export tree.
- env/config/deployment files: environment catalog and operational runbook.
- payment/auth/referral/analytics/media provider code: integration and privacy contracts.
- test gates/scripts: verification matrix and release evidence.

## Known unsafe documentation artifact

The backend audit reported active-looking credential material in the untracked staging setup file. Do not copy it into docs, logs, commits, issue trackers, or chat. Confirm ownership, rotate any real values, scrub the artifact, and replace values with placeholders before it becomes tracked.



---


# Ship Fast — Living Project Reference

**Status:** code-backed reference, audited 2026-07-31.  
**Scope:** current application, Convex backend, generation packages, exports, commerce, integrations, and release operations.  
**Authority:** this document records behavior observed in current source and focused tests. It does not turn unverified provider behavior into a promise. See [Documentation Control](DOCUMENTATION-CONTROL.md) and [Open Questions](DOCUMENTATION-GAP-REGISTER.md).

## Product boundary

Ship Fast turns a user brief into an editable website. A session holds the prompt, generation progress, preview, edits, export artifacts, publication/deployment data, entitlement state, and optional commerce/CMS configuration. Users can generate anonymously or while signed in, inspect and edit a preview, publish or export it, and optionally connect commerce or GitHub workflows.

The product has three main execution planes:

1. **Browser application.** Captures the brief, owns dashboard interaction, renders previews, and calls server routes and Convex.
2. **Session and entitlement backend.** Stores durable state, enforces access/quota/billing rules, records event and artifact history, and runs scheduled lifecycle work.
3. **Generation and delivery packages.** Produce an OpenUI composition and render/export it into HTML, React, Next.js, Lakebed, and preview artifacts.

## User journeys

### Create and generate

1. The home screen accepts a prompt, language, privacy choice, optional design-reference URLs/notes, and attribution/share context.
2. Client validation rejects empty, gibberish, and over-5,000-character prompts. It persists a local draft and creates an anonymous owner secret/client/workspace identity when needed.
3. `POST /api/sessions/create` accepts JSON only with an Origin header; it limits request bodies to 1 MiB, moderates the brief, passes a hashed client-IP signal to admission, and starts VPS generation after a session is admitted.
4. Admission failures are explicit: malformed input (400), too large (413), quota/rate-limit (429), invalid upstream state (502), and unexpected service failure (500). The UI maps known application errors and otherwise shows a generic failure.
5. The browser navigates to `/generate/:sessionId/`. The workspace obtains reactive generation state from Convex and uses replayable event data for progress.

### Edit, preview, and restore

The workspace supports preview/device modes, regeneration, clone navigation, inline content/image/style/link edits, section changes, undo/redo, themes, localization, branding, exports, deployment, billing, GitHub, and commerce controls. Generated-page navigation uses browser history plus preview view state rather than forcing a full route transition.

Public preview is served under `/preview/:slug/*`; deployed sites resolve under `/deployed/:slug/*` and may be mapped from a subdomain. Preview composition applies persisted text/image/style/theme/localization changes. Missing or non-renderable preview data currently renders a blank fixed shell; this is observed implementation behavior, not yet an approved product contract.

### Export and delivery

`GET /export/:sessionId/:target` supports `html`, `react`, `next`, and `lakebed` (`nextjs` is accepted as an alias). The route authenticates through bearer credentials or an anonymous owner secret, then checks ownership, entitlement, artifact freshness, target safety, expected content type/signature, and download metadata. It can initiate/rebuild an artifact on demand. Typical status outcomes: 400 unsupported target, 401 authentication, 402 payment, 403 ownership, 404 missing session/artifact, 409 stale/failed artifact, 422 unsafe metadata, and 502 unavailable builder.

## Browser route and API surface

| Surface | Purpose | Access / key behavior |
| --- | --- | --- |
| `/` | Prompt entry and examples | Anonymous-capable; local draft and owner secret support. |
| `/generate/:sessionId/*` | Editable workspace | Session identity/ownership; first nested path segment is used as page state. |
| `/preview/:slug/*` | Session preview | Public-preview state; same first-segment navigation behavior. |
| `/deployed/:slug/*` | Deployment view | Internal deployment prefix hidden from public browser URL. |
| `/gallery`, `/mine`, `/pricing`, `/partners`, `/referrals`, `/examples` | Discovery/account/commercial pages | Referrals requires signed-in Clerk state; examples can be availability-gated. |
| `/health` | Health response | Operational route. |
| SEO routes | Root and preview `robots.txt`, sitemap, and `llms.txt` | Generated metadata/discovery endpoints. |
| `/api/sessions/*` | Session creation, reads, generation, edits, history, media, exports, GitHub, Lakebed, Medusa | Ownership/auth varies by endpoint; exact request schemas are not yet centrally published. |
| `/api/rewrite` | Moderated rewrite generation | Bearer required unless Clerk is disabled; 1 MiB payload cap and 30-second abort. |
| Commercial APIs | Billing, referrals, brand, images, translation, OAuth, analytics, LinkForty, commerce/cart/store | Provider-specific controls; see integrations below. |

The full method/auth/status contract is deliberately tracked as a documentation gap. Route groups and behavior are backed by `src/routes/`, `src/features/*/server/`, and route behavioral tests.

## Durable concepts and lifecycle

Convex declares 46 tables. The session is the aggregate root. Related durable records include tasks, generation events/modules, previews/history, edits, exports/artifacts, deployments, clone pages, themes, session data, metrics, generated capsules, files/image caches, translations, billing ledgers/subscriptions, referrals, partner outbox records, and commerce instance/store/operation records.

Session creation coordinates prompt validation, authenticated or anonymous ownership, idempotent workspace reuse, draft expiry, admission/quota, and content-cache reuse. Drafts do not consume quota. Completion records generated artifacts/events and may schedule operational notifications. Edits invalidate stale output paths; preview history supports restore/fork semantics.

Current admission constants are implementation values, not a documented commercial policy: free authenticated users have monthly allowances, active subscribers receive a multiplier, and anonymous users are subject to monthly/daily/IP-window controls with a share bonus. `IS_DEV` or `DISABLE_LIMIT` is the server-owned bypass and must remain false/absent in production.

### Access model

Clerk identity normally uses its token identifier. Anonymous access relies on an owner secret and, for claim/recovery flows, client and IP-based claims. Public server-integration mutations are distinct from client session access and need an explicit caller/secret inventory before launch. Admin claims bypass broad ownership, quota, and export checks; `docs/go-prod.md` documents this as a high-trust role.

### Billing and referrals

Billing maintains subscriptions, customer credits, a ledger, and deduplicated webhook events. Webhook application requires `BILLING_WEBHOOK_MUTATION_SECRET`, validates event integrity, blocks cross-user subscription ownership, and may qualify referral rewards. A referral is pending, qualified, or disqualified; reward unlock after two qualified referrals is permanent, while application to an active subscription remains provider-dependent.

### Commerce

Commerce supports session config/tenants, customer-isolated instances/stores, and durable idempotent operations. A cron runs hourly to suspend/delete commerce instances according to entitlement expiry. The production implementation boundary matters: `DokployInfraProvider` currently throws `DokployIntegrationUnverifiedError` for real infrastructure operations. Do not describe commerce provisioning as production-ready until live acceptance proves it.

## Generation and rendering

The current primary generator is `packages/ship-fast-engine/src/genui/composition-runner.ts`, not the removed `pipeline/runner-v2.ts` or `phase-sff-html.ts` cited by the prior codemap.

1. Prompt and selected model feed composition generation.
2. The composition parser converts the DSL into a parsed composition.
3. The compiler expands macros, plans pages, creates fallbacks, and emits OpenUI calls.
4. Page-structure validation/repair and composition-quality checks enforce structural and copy constraints.
5. `runComposition` returns a completed artifact; `streamComposition` emits progressive results/events.
6. The OpenUI viewer preprocesses source, resolves a runtime library, wraps integration providers, and renders the result.

Transient LLM failures (429, 5xx, timeout, overload) are retried; hard configuration/auth failures are classified separately. Language resolution currently conflicts with an English-only enforcement block, so non-English behavior remains an open launch question.

The block runtime creates a static registry and lazy runtime library for referenced components. Generated AI capsule JavaScript is blob-imported and must default-export a React function; sandboxing, validation, and provenance guarantees are not yet documented.

Renderers produce HTML, React, and Next.js artifacts. AEO helpers normalize metadata and generate robots, sitemap, structured data, and `llms.txt`. The existing stable-artifact document describes a migration target, but the protected download route still uses the active OpenUI artifact path; treat the current route and tests as implementation authority until a migration decision is recorded.

## External systems

| Integration | Current responsibility | Failure/operational status |
| --- | --- | --- |
| Clerk | Signed-in identity and admin claim | Auth/ownership boundary; exact role matrix missing. |
| Convex | Sessions, artifacts, billing state, caches, cron | Self-hosted topology; backup/recovery policy missing. |
| Groq, Gemini, Cerebras, Talaas, OpenRouter, Ollama | Generation/model alternatives | Routing/cost/timeout policy missing. |
| Stripe and Razorpay | Checkout, subscriptions, credits, webhooks | Sandbox/provider acceptance still pending in `TODO.md`. |
| GitHub | OAuth and generated-project push | Real sandbox push proof pending. |
| Medusa, Dokploy, Lakebed | Commerce, customer data/deployment | Real Dokploy provisioning explicitly unverified. |
| Brandfetch, Pexels, Unsplash, Pollinations | Brand/media enrichment and image fallback/cache | Licensing/retention and provider SLA missing. |
| Dub, LinkForty | Attribution, referral links/clicks | Consent, privacy, reconciliation policy missing. |
| Slack, Telegram, LogRocket, Plausible | Notifications/observability | Event/redaction/on-call policy missing. |

## Configuration and operations

`.env.example` names browser/app configuration for Clerk, Convex, models, media, monitoring, billing, attribution/referrals, GitHub, Medusa, and LogRocket. Convex deployment variables are a separate deployment boundary. Secrets must not be copied into documentation or committed environment files.

Main developer checks are `lint`, `typecheck`, `test`, `verify:generated`, `verify:bundle`, `verify:qa`, and `verify:release`. More than 50 targeted verification scripts exist, but their prerequisites and CI/manual ownership are not documented in one place. `TODO.md` is the present acceptance backlog: provider checkout/webhooks, GitHub push, CMS, localization, real-provider SEO/AEO, scheduled notifications, release proof, and a Medusa product decision remain incomplete.

## Documentation maintenance rule

Update this reference in the same change as behavior when a route, state transition, error code, data field, external integration, environment variable, test gate, or runbook changes. Add the exact code/test evidence. Move unresolved items to the gap register only when they genuinely require a product, security, or operational decision.



---


# Documentation Gap Register and Decision Questions

**Purpose:** prevents implied behavior from becoming accidental product policy. Every question below was derived from audited source/docs, not invented as filler. Until answered, code behavior is implementation evidence only.

## Critical drift and launch blockers

| ID | Finding | Evidence | Required decision/action |
| --- | --- | --- | --- |
| D-01 | Architecture atlas names removed generator files. | `codemap.md` vs `packages/ship-fast-engine/src/genui/composition-runner.ts` | Replace old pipeline description; designate current generator owner. |
| D-02 | Stable export doc describes coexistence/migration while active route uses OpenUI artifacts. | `src/features/exports/STABLE_CONTRACT.md`, `create-export-response.ts` | Declare supported export contract and migration deadline. |
| D-03 | Real Dokploy commerce operations deliberately throw unverified errors. | `packages/commerce-provisioner` `DokployInfraProvider` | Block launch claims or implement and accept-test provisioning. |
| D-04 | No canonical route/Convex API/error catalog. | 114 route files; public Convex surface | Generate and review an API reference. |
| D-05 | No data dictionary or retention model. | 46-table Convex schema | Classify data, owners, TTL/deletion/backup obligations. |
| D-06 | Authentication/anonymous-owner model lacks threat model. | Session access helpers and public mutations | Approve access matrix, secret transport, logging/referrer controls. |
| D-07 | Provider proof remains incomplete. | `TODO.md`, provider runbook | Run signed sandbox and real-generation acceptance; retain evidence. |
| D-08 | Language detection conflicts with English-only prompt enforcement. | GenUI language/enforcement logic | Confirm policy or fix behavior and regression-test it. |
| D-09 | Local Traefik config contains a nonportable absolute path. | `.local-proxy/traefik.yml` | Make config portable or clearly retire local proxy path. |
| D-10 | Staging setup artifact may contain live credentials. | Backend audit observation | Rotate/scrub before any publication or commit. |

## Questions requiring answers

### Product, journeys, and preview

1. What are the supported user tiers, prices, currencies, and feature differences?
2. Which dashboard capabilities are anonymous, signed-in, paid, admin-only, or feature-flagged?
3. What is the definitive session lifecycle and terminal-state retry policy?
4. What does the user see when a session is undefined, absent, forbidden, queued, failed, or not renderable?
5. Should a missing public preview be blank, 404, or a branded error page?
6. Are `/preview/:slug` and `/deployed/:slug` intended public, indexed, and accessible for private sessions?
7. Is first-path-segment-only generated-page routing intentional; how must nested posts/products work?
8. What is the recovery path when browser storage is blocked and anonymous ownership cannot persist?
9. What end-user recovery applies if session creation succeeds but VPS generation handoff fails?
10. Which browsers and accessibility requirements are supported for SSE, iframe preview, local storage, dynamic imports, and editing?
11. Which source wins when OpenUI, rendered HTML, stable artifact, clone HTML, and persisted edits disagree?
12. What is the product decision for the currently disabled/“soon” 3D feature?

### HTTP and Convex API contracts

13. What public API/versioning/deprecation policy applies to every HTTP route and Convex function?
14. What request/response schema, authorization, status, and error code applies to every `/api/*` route?
15. Which server routes may invoke each `*Public` generation mutation and how are they authenticated?
16. Which generation event types exist, what payload schema do they use, and which ordering/cursor guarantees apply?
17. Why does SSE replay then close; which mechanism supplies continuing live updates?
18. Which APIs are CSRF-protected, CORS-enabled, or safe for credentialed cross-origin calls?
19. Which endpoints are rate-limited, by which identity, and how is reset information returned?
20. Which error codes are stable customer contracts versus internal implementation detail?
21. Which compatibility aliases (for example `nextjs`) are supported and until when?
22. What pagination, filtering, and maximum payload contracts apply to gallery, history, events, and session reads?

### Identity, authorization, and privacy

23. Is an anonymous owner secret intentionally accepted in query strings; what referrer/logging leakage mitigation exists?
24. What constitutes anonymous identity when owner secret, client ID, and IP claim disagree?
25. How are IP hashes salted, retained, disclosed, and privacy-reviewed?
26. Which session fields are public, confidential, PII, or safe for gallery exposure?
27. What is the authoritative public-vs-private serialization/redaction matrix?
28. Which roles exist besides `admin`, and which operations does an admin override?
29. What permissions/scopes are requested from GitHub and how are tokens encrypted, expired, revoked, and deleted?
30. What consent/opt-out/delete behavior applies to LogRocket, Plausible, Dub, LinkForty, and referral attribution?
31. How are moderation decisions appealed, retained, reviewed, and distinguished from provider outages?
32. What security controls validate and sandbox AI capsule JavaScript before persistence and blob import?

### Data, durability, and lifecycle

33. Which tables are durable records versus caches, and what are their eviction/invalidation rules?
34. What fields/indexes/relations define the 46-table schema and which component owns each?
35. What retention/deletion schedule applies to drafts, prompts, previews, exports, images, OAuth state, moderation flags, metrics, and webhook events?
36. Does session deletion cascade into files, artifacts, external deployments, generated code, and provider data?
37. What is the backup cadence, recovery-test cadence, RPO, and RTO for self-hosted Convex and file storage?
38. Who owns schema migrations, backwards compatibility, and rollback?
39. What state transitions are legal for session, task, event, export, deployment, commerce instance/store, subscription, and outbox records?
40. What retry, idempotency, poison-message, lease, and backoff policy governs all asynchronous work?
41. What data is persisted/redacted/reused in prompt/content/translation/export caches?
42. What provenance, integrity, and license record accompanies exported code and third-party media?

### Generation, content, and quality

43. Was `runner-v2.ts`/`phase-sff-html.ts` intentionally removed and what superseded each stage?
44. Which production path calls `runComposition` versus `streamComposition`?
45. What grammar/version and compatibility policy govern the composition DSL and macros?
46. What happens after parser, compiler, quality-audit, structural-repair, or partial-stream failure?
47. Which repairs may alter user-visible content and how is that disclosed?
48. Is English-only visible copy permanent policy, a temporary safeguard, or a bug?
49. What provider-selection, token-budget, retry, latency, cost, and circuit-breaker policy maps model IDs to providers?
50. Which LLM outputs are retained, logged, cached, or used as cache keys?
51. Which capsule registry APIs/components are stable, experimental, internal, or safe for prompts?
52. What prop/data/ownership contract is required for a new editable realtime section?
53. What cache invalidation applies to runtime components, capsules, themes, and generated loaders?
54. What SEO/AEO fields are mandatory, defaults, user-editable, or rejected; how is “truthful” structured data verified?

### Billing, exports, referrals, and commerce

55. Which subscription states count as active across Stripe and Razorpay?
56. Are quota constants launch policy, configuration, or temporary defaults; who can change them?
57. How do credits, subscriptions, export entitlements, cancellation dates, and historical-access flags compose?
58. How is provider/Convex billing divergence reconciled and manually corrected?
59. What webhook signature, replay, idempotency, and secret-rotation process applies to every provider?
60. What exact file trees/dependencies are contractual for each supported export target?
61. What authorization, expiry, replay, and revocation guarantees apply to downloads and GitHub pushes?
62. Is the stable export artifact contract the active standard; what date retires the legacy path?
63. What rules prevent fraudulent referral qualification or reward correction?
64. What tenant-isolation guarantees span session configs, Medusa stacks, Lakebed data, and exported applications?
65. What happens to commerce data at entitlement expiry and after the 30-day deletion window?
66. What blocks real `DokployInfraProvider` implementation, who owns it, and what acceptance test releases it?

### Integrations, configuration, and operations

67. Which environment variables belong in browser, application, Convex, staging, and production scopes?
68. Who owns each secret, rotation schedule, least-privilege policy, and emergency revocation action?
69. How is configuration drift between app and Convex detected before deployment?
70. Why do some Convex paths use raw environment reads despite typed environment guidance, and what is the migration plan?
71. Is the documented production Convex admin-key TTL issue still active and who owns remediation?
72. What customer data flows to/from each LLM, media, analytics, payment, GitHub, commerce, and messaging provider?
73. What fallback, timeout, quota, SLO, and error-budget applies per external provider?
74. Which notification events go to Slack versus Telegram, with what redaction and on-call ownership?
75. What dashboards/alerts track quota denials, webhook failures, cron skips, retry exhaustion, data growth, generation/render regressions, and deployment outages?
76. What is the supported deployment topology between app, Convex, Medusa, Dokploy, Traefik, and customer deployments?
77. What is the rollback/runbook for app, schema/functions, exports, Medusa, and per-customer stacks?
78. Why does local Traefik reference an abandoned absolute path, and can it be used from this checkout?

### Verification and launch governance

79. Which verification scripts are developer-local, pre-commit, pre-push, CI-only, provider-gated, benchmark-only, or manual investigations?
80. What credentials, seeded data, app instances, browser sessions, and external services does each verification require?
81. Which tests run against real staging and what test data is permitted there?
82. What acceptance evidence must be retained for billing, GitHub, CMS, localization, SEO/AEO, monitoring, and Medusa?
83. Who owns stale architecture docs and what event triggers a refresh?
84. Which sources are authoritative when code, generated output, artifacts, specs, and tests conflict?
85. What is the launch definition of done beyond unit/regression tests?
86. What availability, performance, and accessibility SLOs cover first streamed preview, final preview, export, deployment, and commerce provisioning?
87. What incident severity, communication, customer support, and postmortem process applies to data/auth/billing/generation events?
88. What change-management review must occur for prompt handling, payments, auth, data retention, and external integrations?

## Resolution protocol

For each answer: record owner, decision date, authority, implementation location, acceptance test, security/privacy impact, and next review date. Do not close a question with “current code does X” when the question asks for a product or operational policy.



---


# Ship Fast — Decision Interview

This is the interview source. It intentionally excludes facts already recoverable from code, tests, or the living project reference. Every prompt below requires a product, security, legal, operational, or ownership decision.

## Questions requiring answers

### Product, access, and public behavior

1. Which published Pro price is authoritative: ₹999 in the UI or ₹399/$9 in backend configuration, and are Free and credit packs sellable offers?
2. Should non-private previews and deployments be indexable, and should private and missing URLs be intentionally indistinguishable?
3. If all browser storage is unavailable, should anonymous sessions survive reload or warn users that they are temporary?
4. What retry or recovery action must users receive after a session is created but VPS generation handoff fails?
5. Which browser versions and accessibility baseline do we support for generation, editing, preview, and export?
6. When generated source, preview HTML, and persisted edits conflict, which is the canonical exportable artifact?
7. What versioning and deprecation promise applies to externally consumed HTTP and Convex APIs?
8. Which generation-event fields and ordering guarantees are stable for external consumers?
9. Which cross-origin credentialed integrations are supported, and what CORS and CSRF controls apply?

### Security, identity, and privacy

10. Which API error codes are stable customer contracts rather than internal details?
11. When, if ever, will the `nextjs` export-target alias retire?
12. May anonymous owner secrets remain in query strings, or must clients use headers only?
13. When identity signals conflict, which one controls ownership, quotas, and later account claim?
14. How are IP-derived identifiers salted, retained, and disclosed?
15. Which session fields may be public or gallery-visible, and which are confidential or PII?
16. Approve the public/private session-field redaction matrix.
17. What is the GitHub token retention, encryption, revocation, and deletion policy?
18. What appeal, review, retention, and outage-classification process applies to moderation decisions?
19. What validation and sandbox boundary applies to AI capsule JavaScript before persistence or blob import?

### Data, durability, and lifecycle

20. Which records and caches need explicit retention/deletion policy beyond existing draft and commerce exceptions?
21. What external deletion is guaranteed and audited after a session is deleted from Convex?
22. What backup cadence, recovery-test cadence, RPO, and RTO apply to self-hosted Convex and file storage?
23. Who owns schema migrations, backward compatibility, and rollback approval?
24. Which state transitions require a documented contract beyond the existing commerce lifecycle state machine?
25. What common retry, idempotency, poison-message, and backoff standard governs asynchronous work outside the commerce ledger?
26. What generated/cached content may be retained, reused, or shared, and for how long?
27. What provenance, integrity, and licensing record must accompany exports and third-party media?

### Generation, content, and exports

28. What grammar/version and backward-compatibility policy governs the composition DSL and macros?
29. Must user-visible structural repairs be disclosed, and if so how?
30. What provider cost, latency, retry, and circuit-breaker SLOs apply beyond current implementation defaults?
31. Which model outputs may be retained, logged, or used as cache keys?
32. Which registry capsules are stable public prompt targets, experimental, or internal only?
33. What contract must a new editable realtime section satisfy for data ownership, props, and compatibility?
34. What invalidation guarantee applies to runtime components, capsules, themes, and generated loaders?
35. Which SEO/AEO claims are mandatory, user-editable, or rejected, and how is truthful structured data verified?
36. What signed-download expiry/revocation and GitHub-token lifecycle guarantees apply to exports?
37. What is the decision and deadline for migrating from the legacy export artifact path to the stable-artifact contract?

### Billing, referrals, and commerce

38. Who approves and deploys quota-constant changes?
39. What historical access, if any, persists after entitlement expiry?
40. What reconciliation and manual-correction procedure resolves provider and Convex billing divergence?
41. What webhook-secret rotation and replay-retention process applies to every provider?
42. What fraud-review and manual referral-correction process exists beyond coded qualification rules?
43. What production proof makes the documented commerce-isolation contract enforceable?
44. How is external stack and customer-data deletion audited after paid-through expiry and the 30-day retention window?
45. Who owns `DokployInfraProvider`, and what live acceptance test must pass before it is treated as supported?

### Integrations, operations, and launch governance

46. Who owns each secret's rotation, least-privilege policy, and emergency revocation action?
47. How is configuration drift between browser, app, and Convex deployments detected before release?
48. Is raw environment access in Convex an accepted exception or a migration target, and who owns it?
49. Who owns remediation of the production Convex admin-key TTL issue, and what is the deadline?
50. What provider data-processing, privacy, and user-disclosure obligations are approved?
51. What availability, fallback, error-budget, and incident policy applies per external provider?
52. What notification redaction and on-call ownership applies to Slack and Telegram operational events?
53. Which dashboards and alerts are required for quota denials, webhooks, cron skips, retry exhaustion, data growth, generation failures, and deployments?
54. What rollback/runbook policy applies to app, Convex, exports, Medusa, and customer stacks?
55. Which verification scripts are release gates, who owns each, and what evidence is required?
56. What staging data is permitted, and which real-provider acceptance tests must run before launch?
57. What is the launch definition of done beyond current unit and regression tests?
58. What performance and accessibility SLOs cover first preview, final preview, export, deployment, and commerce provisioning?
59. What incident severity, customer communication, support, and postmortem process applies to auth, billing, data, and generation failures?

## Resolution protocol

For each answer, record owner, decision date, authority, implementation location, acceptance test, privacy/security impact, and next review date. Code evidence is not a policy decision until an accountable owner approves it.


---

## Action Items


### Immediate (This Sprint) - SECURITY BLOCKERS

1. **Critical Security Fixes**
   - [ ] Fix authenticated subscription self-grant vulnerability
   - [ ] Fix Razorpay `halted` → `active` default status
   - [ ] Fix recurring webhook collision (use provider event ID)
   - [ ] Improve preview validation (decode HTML entities, parse DOM)
   - [ ] Fix gallery preview images ownership check
   - [ ] Remove or auth-protect clearCache mutation

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
   - [ ] Add authentication to `/api/stock-images`
   - [ ] Fix stock-image client-side imports

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
