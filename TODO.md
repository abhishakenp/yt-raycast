# Ship Fast Reimplementation TODO

Snapshot: 2026-06-11

**Architecture Review Update (2026-06-11):** After reviewing the new TanStack Start + Convex + Clerk architecture, several TODO items were found to be obsolete or factually incorrect:
- TODO #8 (Auto-CMSify): Data-cms attribute parsing approach doesn't align with new OpenUI/React blocks architecture
- TODO #9 (Medusa): Ship Fast is a prompt-to-website generator, not an e-commerce platform; Medusa may not be aligned with product direction
- TODO #11 (Public Gallery): Claim that getPublicGallerySession was not deployed is factually incorrect; it exists and is actively used
- TODO #13 (Brand/Media): Infrastructure is complete (Brandfetch, Pexels, stock image helper all exist)
- TODO #14 (Localization): Infrastructure is complete (language detection, UI labels, Convex integration all exist)

These items have been marked accordingly below.

This document tracks product features and operational surfaces that were lost or reduced during the rewrite around `acfff7bc Rewrite project`, plus later migration work. It is intended as a practical backlog, not a blame log.

Current caveat: this document now includes a conservative progress review after the first restoration pass. Treat it as an implementation guide and re-check exact runtime behavior before marking any row complete.

Architecture guardrail: use old commits to identify missing product capabilities and acceptance behavior, not to recreate the old Bun/Express/file-backed architecture. If the TanStack Start + Convex + Clerk implementation already provides the user-visible feature with durable state, correct access control, and runtime proof, do not port the old implementation back. Only rebuild old surfaces when they are still required as public compatibility contracts or when no equivalent current feature exists.

## Baseline Used

- Rewrite commit reviewed: `acfff7bc Rewrite project`
- Parent before rewrite: `3b6eba8b bug fixes`
- Old runtime shape: Bun/Express server on port `7420`, file-backed session workspaces, dashboard scripts, WebSocket/SSE state, export/download/payment routes, Sanity and Medusa optional integrations.
- New runtime shape: Vite/TanStack Router/Convex app with Convex-backed session state and a smaller API surface.
- Important note: most core generation engine code still exists under `packages/ship-fast-engine/src`. The biggest losses are in app orchestration, route contracts, durable artifact management, integrations, payments, and end-to-end dashboard behavior.

## Priority Legend

- P0: Revenue, core product loop, or user trust.
- P1: Strong product differentiation or repeated workflow.
- P2: Useful supporting surface, but can follow core restoration.

## Progress Review Matrix

Review date: 2026-06-11, after commit `bea7622 Restore session admission, persistent preview edits, and ZIP exports`.

This column is intentionally conservative. A task is only considered complete when it satisfies the acceptance checks below and the "Minimal Definition Of Done" near the end of this file. Focused unit tests alone are not enough for completion; route/mutation coverage, realistic local runs, browser verification, and reload/restart verification still matter.

Audit correction (active): rows labeled "Implementation restored / acceptance pending." are not complete for goal tracking. Treat that label as "source and focused tests exist, but acceptance is unproven" unless the row records concrete passing evidence for the relevant acceptance checks: realistic local API/UI runs, reload or restart persistence checks, browser verification for user-facing flows, and real-provider or sandbox verification for payment/GitHub/integration surfaces. The next implementation pass must either run and record those checks or keep the row acceptance-pending.

Verifier reconciliation (active, 2026-06-11): after checking the actual filesystem and package scripts, the runnable verifier set currently includes `verify:generation`, `verify:site-spec`, `verify:homepage-quality`, `verify:gallery`, `verify:admission`, `verify:authenticated-admission`, `verify:restored-routes`, `verify:deployment-preview`, `verify:brand-localization`, `verify:billing`, `verify:billing-state`, `verify:chat-refinement`, `verify:dashboard-browser`, `verify:chat-browser`, `verify:cms-browser`, `verify:monitoring`, `verify:restart-persistence`, and `verify:qa`. The public fake generation completion API is gone. Verifiers that need a ready preview must either run real generation or seed artifacts through `internal.sessions.completeGeneration`, the same persistence boundary used by the scheduled real generation action. Fresh headed-Brave evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:dashboard-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7cpg234r0hen4vvzpkz7dy1x88fc9w`; `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:chat-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7ddd87xc7yzsy9v3jhz1xf7988ee3k`; `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:cms-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh77af2r0yhn6bfqh6bptb9swn88fgtx`; `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:restart-persistence -- --timeout-ms=180000` passed with session `kh74rat8s1926sajx3bc82w1t988en1t`, proving a generated Convex-backed session, edit history, SSE replay, export target readiness, and restore mutation still work after a full local Vite process restart; `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:authenticated-admission` passed, proving signed-in free quota rejection, paid quota allowance, and auth-derived ownership through a dedicated Convex identity harness; and `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:billing-state` passed, proving secret-gated webhook mutation idempotency for subscriptions and credit packs plus export-credit ledger consumption.

## Current Execution Queue

1. Fix the runtime Convex compatibility regression first: `sessions:getGenerationView` must accept the client shape `{ lookup }` as well as `{ sessionId }`, and tests must cover lookup-only calls so the dashboard no longer throws `ArgumentValidationError`.
2. Finish the real incomplete features: row 7 needs OpenUI-native/LLM-backed refinement instead of a visible marker overlay; rows 8 and 9 need a product decision before treating CMS/Medusa as core backlog.
3. Prove rows 1-6 and 10-16 with acceptance evidence, not source inspection: run realistic local API/UI paths, reload/restart persistence checks, headed browser verification for visible flows, and sandbox/real-provider verification for billing, webhooks, GitHub, and notification surfaces.
4. Restore QA tooling in row 17: keep bounded non-server route verifiers, then add a headed browser generation verifier, site-spec verifier, homepage quality gate, gallery verifier, and Playwright or agent-browser configuration that can run locally without hanging.

Implementation pass note (2026-06-11): this pass deliberately did not port old Bun/Express/file-backed internals. It kept the current TanStack Start + Convex architecture and only filled missing user-visible/product surfaces:
- Added stale-generation protection so delayed Convex generation jobs cannot move an already-ready preview back to streaming, overwrite current artifacts, or mark it failed after a restored/completed preview exists.
- Added first-party CMS content APIs (`listCmsContent`, `upsertCmsContentEntry`) that join Convex bindings with entries, owner-check writes, record revisions, and promote text content edits into durable preview versions through the current preview/artifact edit pipeline.
- Replaced the dashboard's Sanity-oriented/inert CMS area with a first-party Convex content editor. Sanity remains a historical reference, not a restored dependency.
- Added owner-checked CMS revision listing/restoration (`listCmsEntryRevisions`, `restoreCmsContentRevision`) and dashboard history controls so prior content values can be restored through the same durable preview/artifact pipeline.
- Wired the existing commerce config component into the dashboard rail and fixed async config hydration in its inputs.
- Exposed existing current-stack chat refinement, edit history, and annotation panels as proper dashboard rail modes instead of leaving them unreachable or embedded in the wrong panel.
- Expanded the dashboard edit panel from read-only history into a durable preview editing surface: users can submit a text replacement through the current Convex `createEdit` pipeline and restore prior preview versions through `restorePreviewVersion`.
- Added a dashboard Activity panel over the existing `getGenerationView` tasks/events so persisted generation tasks, preview reloads, completion/failure events, elapsed time, cost, provider, and preview-version metadata are visible after reload.
- Restored thin current-stack export compatibility endpoints: `GET /api/sessions/:id/export-targets`, `POST /api/sessions/:id/export`, and `GET /api/sessions/:id/download/:target`.
- Added a dashboard export panel that discovers targets, creates ZIP exports, and exposes download links through the restored compatibility routes.
- Added a dashboard GitHub panel over the existing `/api/sessions/:id/github/push` route so the current GitHub push implementation is reachable from the product UI.
- Added a dashboard Billing panel over the existing `/api/billing-overview` and `/api/checkout/start` routes so subscription state, remaining credits, export unlock status, Pro checkout, and credit-pack checkout are reachable from the generation dashboard.
- Added a dashboard Brand and Media panel over the existing `/api/brand-profile` and `/api/pexels` routes, using the session's persisted clone/design-reference metadata as starting context.
- Added a dashboard Localization panel over the existing `/api/translate` route, initialized from the session's preferred language and prompt so translation support is reachable from the current product UI.
- Added automatic first-party CMS binding seeding when generated previews are persisted: current `data-cms` attributes are parsed into Convex bindings/entries, and site-spec title/tagline/hero/home fields seed editable entries without restoring the old Sanity architecture.
- Expanded first-party CMS seeding to walk arbitrary generated `siteSpec` arrays/objects, so feature lists, pricing bullets, FAQs, blog posts/authors/categories, and portfolio projects become editable content entries even when rendered HTML has no `data-cms` attributes.
- Removed the public fake generation completion shortcut and deleted the old generation stub service/test helpers. Test-only generated preview seeding now goes through the internal `completeGeneration` persistence boundary, matching the real scheduled generation action's write path.
- Removed chat refinement fallback marker markup from generated previews. Future chat fallback sections render as ordinary generated page sections while still cleaning legacy `ship-fast-chat-refinement-note` / `data-ship-fast-chat-note` output from older previews.
- Added export preview-version metadata and stale-export guards so downloads and GitHub pushes cannot silently use an export generated for an older preview version.
- Repaired the Convex export entitlement boundary so `createExport` no longer hardcodes every export as badge-free. Anonymous/unpaid sessions now persist `payment_required` export records/events, subscribed users get badge-free ready exports, credited users atomically consume one credit for a new current-preview export, and the dashboard export panel displays payment-required/stale target states.
- Added real dashboard publish/republish controls using `publishPreview` plus `getDeploymentStatus`, and changed the dashboard URL display to show the public deployment URL only after the deployment registry reports `ready`.
- Added session-scoped Medusa compatibility routes over the current Convex commerce config: `GET /api/sessions/:id/medusa-config` and `POST /api/sessions/:id/provision/medusa`. These do not restore old Docker/provisioning internals.
- Bounded the dashboard/session Convex query reads that were still using unbounded collection (`tasks`, chat messages, annotations, usage metrics, and quota lookups) to keep the restored surfaces aligned with current Convex guidelines.
- ACPX availability check: `acpx --agent "swe 1.6" ...` still fails with `Failed to spawn agent command: swe 1.6`. `acpx --agent "devin acp" ...` resolves only to a disconnected `connection_close` session with no agent session id or prompt history, so no Devin/SWE implementation result is claimed.
- Per user instruction, no test/build/browser verification was run after these UI/API additions. Convex codegen and TanStack route generation were run for changed functions/routes.

|   # | Task                                              | Priority | Progress feedback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Honest status                                   | Main remaining gaps                                                                                                                                                                                                                                                                                                               |
| --: | ------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Session Creation Admission Policy                 | P0       | The latest restoration added a real admission-policy service, structured validation errors, prompt cache keys, anonymous client hashing, design-reference normalization/fingerprinting, anonymous/free/paid quota checks, and short-window throttling. Convex session creation now enforces the same visible admission behavior at the live mutation boundary and stores preferred language/export target plus design-reference metadata. Runtime verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:admission -- --timeout-ms=90000` passed against live Convex with session `kh7e4z30v9jfsk63fctmh758qh88eg1n`; it proved anonymous valid create, protected owner-secret mutation, preferred language `fr`, preferred export target `next`, persisted design-reference fingerprint `7a19a80c`, structured rejection of empty, gibberish, content-policy, and invalid design-reference prompts, anonymous quota rejection after the configured daily cap, and duplicate public prompt cache reuse. Authenticated harness evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:authenticated-admission` passed with `convex-test` `withIdentity`, proving the live `sessions.create` mutation rejects a signed-in free user at `MAX_FREE_PER_MONTH`, allows a signed-in subscribed user under `MAX_PAID_PER_MONTH`, stores the auth-derived `tokenIdentifier` as `userId`, and does not persist anonymous owner/client hashes for signed-in sessions. | Complete / anonymous runtime and authenticated quota harness verified.              | Verified comprehensive admission policy exists in `src/features/session/services/session-admission-policy.ts` with content policy checks (via `src/lib/content-policy.ts`), gibberish detection (`isLikelyGibberishPrompt`), short-window limits, and anonymous/free/paid quota policy constants. Convex `sessions.create` enforces prompt validation, content policy, HTTPS design-reference normalization, anonymous client hashing for anonymous users, auth-derived ownership for signed-in users, owner-secret hashing only for anonymous sessions, prompt cache keys, anonymous daily quota, authenticated monthly quota branches, and duplicate prompt cache reuse. Runtime verifier proves the anonymous/public path end to end, and the dedicated authenticated harness proves signed-in free and paid monthly quota behavior without accepting client-supplied user IDs.                                                                                    |
|   2 | Durable Session Artifact Lifecycle                | P0       | Convex tables now persist more session-adjacent data such as tasks/events/modules/specs/previews/edits/exports, and a first compatibility surface now reconstructs the old `GET /api/sessions/:id` response shape from Convex through `getSessionApiResponse` plus `/api/sessions/$sessionId`. Focused tests cover the reconstructed session DTO and route helper. `getGenerationView` now accepts both `{ sessionId }` and `{ lookup }`, fixing the dashboard/client compatibility validator crash. Remote production evidence: `bunx convex run --prod sessions:getGenerationView '{"lookup":"<sessionId>"}'` returned a generation view instead of the previous validator error. Runtime route verifier evidence: `bun run verify:restored-routes -- --base-url=http://localhost:3000 --timeout-ms=90000` passed against Vite + local Convex, creating a real session, completing a generated preview, fetching `/api/sessions/:id`, and then exercising persisted edits/history/restore/export from that session. Headed dashboard CMS verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:cms-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7a2ejp1pgvtsc73d7h7pcabs88f1ve`, proving a generated session loads in Brave, renders persisted Convex preview artifacts, survives dashboard reload after edit, and still exposes Convex preview/OpenUI/site-spec artifacts. Restart verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:restart-persistence -- --timeout-ms=180000` passed with session `kh74rat8s1926sajx3bc82w1t988en1t`; it started a dedicated Vite server on `127.0.0.1:3017`, created/completed a Convex-backed session, edited preview text to version 2, stopped the server, started a fresh Vite process, then verified `/api/sessions/:id`, SSE replay, history versions, export-target readiness, and post-restart restore to preview version 3. | Implementation restored / route, dashboard browser, and restart runtime verified.              | Verified `getSessionApiResponse` Convex query exists in `convex/sessions.ts` and reconstructs old session response format (id, prompt, createdAt, deployment, homepageReady, siteSpecReady, preferredExportTarget, preferredLanguage, exportTargets, payment, themeOverride, taskCount, done, tasks, elapsed, cost, isAnonymous, ecommerce, openuiReady, integrations, medusaAdminEmbed). Server route helper `createSessionApiResponse` exists in `src/features/session/server/session-api-response-route.ts` with client injection and tests. Runtime verifiers now prove persisted session data can drive restored routes, ZIP export, a headed dashboard reload/edit path, and a generated session surviving a local Vite process restart.                                                                                                                 |
|   3 | Live Dashboard State And Preview Reloads          | P0       | Preview edits, exports, and publishing now write Convex generation events such as `preview_reload`, `export_ready`, and `published`. A compatibility SSE route now exists at `/api/sessions/$sessionId/stream` and replays persisted Convex events with `since` / `Last-Event-ID` cursor support. Runtime verifier evidence: `bun run verify:restored-routes -- --base-url=http://localhost:3000 --timeout-ms=90000` passed and confirmed a real session's `/api/sessions/:id/stream` response is `text/event-stream`, replays `preview_ready`, and finishes with `replay_complete`; the same verifier then causes edit/restore/export events on that session. Headed dashboard verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:cms-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7a2ejp1pgvtsc73d7h7pcabs88f1ve`, proving a visible dashboard edit created preview version 2, updated the rendered preview, survived browser reload, and recorded a `preview_reload` event.                                                                                                                                                                                                                                                                                                                                                                                                                                 | Implementation restored / SSE and dashboard browser runtime verified.              | Verified `getEventStream` Convex query exists in `convex/sessions.ts` with optional `since` parameter for historical event replay. Server route helper `createSessionEventStreamResponse` exists in `src/features/session/server/session-event-stream-route.ts` with SSE serialization and cursor support. TanStack route exists at `/api/sessions/$sessionId.stream`. Runtime verifiers prove replayable SSE from persisted Convex events and headed dashboard proof that preview reloads update the visible preview and survive refresh.                                                                                     |
|   4 | Persistent Preview Editing And History Restore    | P0       | The latest restoration added durable preview versions, edit records, history listing, restore-by-copy semantics, and `preview_reload` events. Text replacement safety and ZIP-adjacent tests were added. Old REST compatibility routes are now restored for history listing, history restore, full preview HTML save, inline text edits, and inline style HTML edits, all backed by the Convex preview/edit mutations. Runtime verifier evidence: `bun run verify:restored-routes -- --base-url=http://localhost:3000 --timeout-ms=90000` passed and proved a real `/api/sessions/:id/preview-inline-text` edit persisted preview version 2, `/api/sessions/:id/history` returned versions 1 and 2, and `/api/sessions/:id/history/1/restore` created preview version 3. Headed dashboard verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:cms-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7a2ejp1pgvtsc73d7h7pcabs88f1ve`, editing the hero headline through the visible CMS panel, observing the preview update, reloading the page, verifying `/api/sessions/:id/history` contained versions 1 and 2, and confirming latest preview/OpenUI/site-spec artifacts contained the edited headline.                                                                                                                                                                                                                                                                                                                                                                                                             | Implementation restored / route and headed browser runtime verified.              | Verified `createEdit` Convex mutation exists in `convex/sessions.ts` handling `text`, `ai_rewrite`, `chat`, and `style` edit types. Server route helpers exist in `src/features/session/server/session-preview-edit-response.ts` for history listing, restore, and preview edits. TanStack routes exist at `/api/sessions/$sessionId/history`, `/api/sessions/$sessionId/history/$version/restore`, `/api/sessions/$sessionId/preview-homepage-html`, `/api/sessions/$sessionId/preview-inline-text`, `/api/sessions/$sessionId/preview-inline-style`. Runtime verifiers prove edit/history/restore persistence plus headed dashboard editing/reload behavior.                                                                                                                    |
|   5 | Export, Download, And Paywall Flow                | P0       | HTML export now returns a ZIP instead of a raw/fragile response, and Convex records export readiness/payment events. Export creation is now wired to Convex subscription/credit entitlement at the mutation boundary: anonymous or unpaid users get a `payment_required` export record/event, subscribed users get badge-free ready exports, credited users consume one credit for a new current-preview export, and repeated creation for an already-ready current preview does not consume another credit. The dashboard export panel now displays payment-required and stale target states instead of hiding the reason downloads are unavailable. Focused entitlement evidence: `bun run test convex/export-entitlement.test.ts` passed with 3 tests. Prior runtime verifier evidence: `bun run verify:restored-routes -- --base-url=http://localhost:3000 --timeout-ms=90000` passed and created a ready HTML export for a real session, then downloaded `/export/:sessionId/html` as `application/zip` with expected filename and 1729 bytes.                                                                                                                                                                                                                                      | Implementation restored / ZIP runtime verified; sandbox provider/browser acceptance pending.              | Verified `createExport` in `convex/sessions.ts` now reads `subscriptions` / `customerCredits`, writes `payment_required` when needed, records `export_payment_required`, consumes credit ledger entries atomically for credited users, and leaves entitled exports badge-free. Verified `createExportResponse` exists in `src/features/exports/server/create-export-response.ts` handling HTML, React, and Next exports with payment checks (402 for payment_required). `createReactExportFiles` and `createNextExportFiles` generate project scaffolding with package.json, config files, and README. ZIP builder exists in `src/features/exports/services/zip-builder.ts`. Route exists at `/export/$sessionId/$target`. Runtime verifier proves ZIP download from persisted session data; remaining acceptance gap is sandbox payment checkout/webhook proof plus headed browser confirmation of the new export-panel payment/stale states. |
|   6 | Billing, Credits, And Checkout                    | P0       | A Convex billing API surface now exists for signed-in subscription status, credit balance, and billing overview, and export entitlement reads existing `subscriptions` / `customerCredits` records instead of hardcoding `requiresPayment: false`. The app now exposes `/api/subscription-status`, `/api/credits`, `/api/billing-overview`, `/api/checkout/start`, `/api/stripe/webhook`, and `/api/razorpay/webhook`. Checkout start uses direct Stripe/Razorpay REST calls with authenticated Convex user resolution, and webhooks verify provider signatures before calling a secret-gated Convex mutation that idempotently upserts subscriptions or credits. Runtime verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:billing -- --base-url=http://localhost:3000 --timeout-ms=90000` passed against Vite + local Convex; it verified billing endpoints return structured `401` auth JSON, checkout returns structured `401`/`400` JSON for unauthenticated and malformed requests, unconfigured webhook routes return structured `503` JSON without backend leaks, and live Convex billing queries return no subscription, zero credits, and an empty ledger for a fresh verifier user. State verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:billing-state` passed with 3 tests, proving the secret-gated `applyBillingWebhook` mutation rejects bad secrets, idempotently applies Stripe subscription webhooks without duplicate/cancel overwrite, idempotently applies Razorpay credit-pack webhooks, and writes the export credit ledger when a credit is consumed. | Implementation restored / billing route and state mutation verified; provider checkout acceptance pending.                  | Verified billing API routes exist at `/api/subscription-status`, `/api/credits`, `/api/billing-overview`, `/api/checkout/start`, `/api/stripe/webhook`, `/api/razorpay/webhook`. Convex billing module exists in `convex/billing.ts` with subscription/credit management. `applyBillingWebhook` is secret-gated and idempotent through `webhookEvents`; `consumeCreditForExport` handles credit consumption during exports; creditLedger table exists with userId, sessionId, amount, balanceAfter, reason, createdAt fields; `getCreditLedger` returns transaction history with pagination. `verify:billing` proves route registration, structured error behavior, and live zero-state Convex billing reads from a running app, while `verify:billing-state` proves subscription/credit webhook state mutation and export-credit ledger behavior locally. Remaining acceptance gap: run Stripe/Razorpay checkout and webhook flows with sandbox provider credentials plus a signed-in Clerk/Convex user token, then prove provider-created checkout/order IDs and gated export access end to end. |
|   7 | Chat-Based Site Refinement                        | P1       | Chat now has an LLM-planned route plus a Convex-native durable refinement transaction. The dashboard sends chat through `/api/sessions/:sessionId/chat`; `createChatRefinementResponse` loads the current generation view, asks the configured model for a compact OpenUI/site refinement plan, normalizes JSON for headline, CTA, replacements, sections, and assistant summary, then persists that plan through `sendChatMessage`. `sendChatMessage` still validates ownership/content, requires a ready preview, stores the user message, creates a new preview version, records a `chat` edit with `afterHtml`, inserts the assistant summary, updates session `previewVersion`, patches the current `home` OpenUI module when present, patches `siteSpecs.specJson` with field-level plan edits plus a `shipFastChatRefinements` audit trail, and emits `chat_refinement_started`, `preview_reload`, and `chat_refinement_completed` events. Focused tests prove model-plan parsing, route fallback behavior, plan persistence across preview/OpenUI/site spec, chat history, replayable events, and generation view source updates. Runtime verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:chat-refinement -- --base-url=http://localhost:3000 --timeout-ms=90000 --expect-ai-plan` passed against Vite + local Convex with session `kh72vqgrvav1g8qh4zqc9rv3f188edmk`, confirmed `usedAiPlan:true`, preview version 2, refined headline in public preview, refined headline in OpenUI source and site spec, and two durable chat messages. Headed dashboard verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:chat-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh71ny2ettwgttaqmqd73bwphh88efh6`; it rendered the visible dashboard chat UI in headed Brave, submitted `Change the headline to "Launch pastries faster"`, observed the preview update, reloaded the dashboard, and verified preview/chat persistence plus Convex OpenUI source and site-spec updates. | Complete / LLM route and dashboard browser verified. | Verified `src/features/chat/server/chat-refinement-response.ts` implements the LLM refinement planner and durable Convex write path, `src/routes/api/sessions.$sessionId.chat.ts` exposes the restored chat route, `src/features/chat/hooks/useChatController.ts` now uses that route from the dashboard, `src/features/dashboard/components/Dashboard.tsx` mounts the chat UI in the visible tools rail, and `sendChatMessage` in `convex/sessions.ts` applies structured AI plans across preview HTML, OpenUI source, site spec JSON, preview history, chat history, and event replay. `bun run test -- convex/chat-refinement.test.ts src/features/chat/server/chat-refinement-response.test.ts` passed with 7 tests, and the headed browser verifier proved the user-facing chat/reload path end to end.        |
|   8 | Auto-CMSify Generated Sites                       | P1       | The rewrite no longer needs the old Sanity-first CMSification flow as a core product dependency, but a Convex-native CMS compatibility layer now exists. `cmsBindings`, `cmsEntries`, and `cmsRevisions` tables support stable bindings, edited content, and revision history. Generated previews seed CMS bindings from `data-cms` attributes plus generic `siteSpec` traversal: hero/site fields, feature lists, pricing cards/bullets, FAQ question/answer pairs, blog posts/authors/categories, and portfolio projects are inferred as editable entries even when the renderer did not emit `data-cms`. The dashboard exposes a first-party CMS panel backed by `listCmsContent`, `upsertCmsContentEntry`, `listCmsEntryRevisions`, and `restoreCmsContentRevision`, so users can edit generated content and restore previous content values through the durable preview/artifact pipeline. CMS preview promotion now honors field type: text/rich text edits replace rendered text, while image and link fields update `src`/`href` attributes on their bound `data-cms` element before creating a new preview version. Focused Convex evidence: `bun run test convex/cms.test.ts` passed with 5 tests covering binding extraction, entry creation/revisioning, restore behavior, image/link preview attribute updates, and generic collection extraction from site spec without Sanity or HTML `data-cms`. Headed dashboard verifier evidence is stale after fake-generation verifier cleanup and must be rerun through a real generated session.                                                                                                                                                                                                                                                                                                                                                                                                                | Optional compatibility layer / source restored; browser acceptance pending.                 | Verified `cmsBindings`, `cmsEntries`, and `cmsRevisions` tables exist in `convex/schema.ts`; `extractCmsBindings`, `insertCmsBinding`, `updateCmsEntry`, `restoreCmsRevision`, `listCmsEntries`, `listCmsRevisions`, `listCmsContent`, `listCmsEntryRevisions`, `upsertCmsContentEntry`, and `restoreCmsContentRevision` exist in `convex/sessions.ts`; `CmsPanel` exposes content editing plus per-field history restore, `applyCmsPreviewEdit` updates image/link attributes for generated HTML bindings, and `extractCmsBindingCandidatesFromSiteSpec` now walks arbitrary generated content structures. Remaining decision: confirm whether CMS editing is still a core product requirement; if yes, rerun headed browser proof on a real generated session and continue toward richer asset/localization workflows without recreating the old Sanity architecture.                                                                                                     |
|   9 | Medusa Ecommerce Provisioning And Storefront Sync | P1       | Medusa/e-commerce remains optional rather than core to the prompt-to-website product, but a removed operational surface exists as a compatibility integration. Convex stores commerce tenant config with backend/admin/storefront URLs and product count, provides tenant provisioning and product sync mutations, and exposes session commerce config to the dashboard/OpenUI viewer. Server routes exist for storefront config, cart creation/read, line-item proxying, checkout proxying, and admin config. Focused Convex tests cover tenant provisioning/update and product sync. Do not expand this unless Medusa is explicitly confirmed as a current product feature.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Reassess / optional integration exists.                   | Verified `commerceConfigs` table exists in `convex/schema.ts`; `provisionMedusaTenant`, `syncMedusaProducts`, and `getCommerceConfig` exist in `convex/sessions.ts`; routes exist for `/api/medusa-store/config`, `/api/medusa-store/cart`, `/api/medusa-store/cart/$id`, `/api/medusa-store/cart/line-items`, `/api/medusa-checkout`, and `/api/medusa-admin/config`; `convex/medusa.test.ts` covers provisioning and product sync. Product direction decision remains: keep Medusa optional and avoid making e-commerce assumptions in generic homepage generation.                                                                                                                                                     |
|  10 | GitHub Push                                       | P1       | The restored server path exposes `POST /api/sessions/:sessionId/github/push`, requires a signed-in app bearer token, reads an owner-only Convex export snapshot through `sessions:getOwnedExportForGitHubPush`, enforces ready/paid export access, validates GitHub token/repo/branch inputs, creates or reuses a private GitHub repository, writes a git tree/commit, updates the branch ref, and returns target/repo/branch/commit/file metadata. The route now passes the requested `html`, `react`, or `next` target through to Convex and GitHub instead of always pushing HTML. Focused tests cover app auth/token errors, signed-in owner-style fake GitHub pushes, React target file pushes, forbidden Convex ownership errors, and payment-required export access errors. `bun run test src/features/github/server/github-push-response.test.ts` passed with 5 tests, `bunx convex codegen` passed, and `bun run build` passed.                                                                                                 | Implementation restored / provider acceptance pending.                 | Verified `createGitHubPushResponse` exists in `src/features/github/server/github-push-response.ts` with full GitHub API integration (getRepository, createRepository, getBranchRef, seedRepository, git tree/commit, branch update). Route exists at `/api/sessions/$sessionId/github/push`. `getOwnedExportForGitHubPush` exists in `convex/sessions.ts` and gates GitHub pushes by signed-in owner, ready export, payment state, and latest preview HTML. Supports HTML, React, and Next export targets with proper project scaffolding. Remaining acceptance gap: run against a real/sandbox GitHub repository with a signed-in owner token and record the repo URL/branch/file list result.                                                                               |
|  11 | Public Gallery, Recent Sessions, And Thumbnails   | P1       | The current Convex/TanStack gallery path now covers the product surface without restoring the old file-cache architecture: `/api/gallery` and `/api/sessions/recent` share `createGalleryApiResponse`, forward pagination/search/category filters into `sessions:listPublicSessions`, and return public-only visible sessions with prompt, status, preview version, created/updated timestamps, elapsed time, cost when present, readiness metadata, preview HTML, OpenUI module source, site spec JSON, and category facets. `/api/sessions/:sessionId/gallery-thumb` uses `sessions:getPublicGallerySession` and returns deterministic SVG thumbnails with metadata labels. Focused tests prove public/private filtering, gallery metadata, pagination/query forwarding, recent-session search aliasing, and thumbnail response behavior. Runtime verifier evidence: `bun run verify:gallery -- --base-url=http://localhost:3000 --timeout-ms=30000` passed against Vite + local Convex with `/gallery`, `/api/gallery`, `/api/sessions/recent`, and a thumbnail SVG route; headed Brave rendered `/gallery` with category filters and preview cards, screenshot `/tmp/ship-fast-gallery-verify.png`.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Complete / runtime verified.              | Verified `listPublicSessions` and `getPublicGallerySession` exist in `convex/sessions.ts`; `createGalleryApiResponse` exists in `src/features/gallery/server/gallery-api-response.ts`; deterministic thumbnail response exists in `src/features/gallery/server/gallery-thumbnail-response.ts`; routes exist for `/api/gallery`, `/api/sessions/recent`, `/gallery`, and `/api/sessions/$sessionId/gallery-thumb`; `scripts/verify-gallery.mjs` validates route-level runtime behavior including recent-session compatibility and thumbnail SVG generation. Focused tests passed with 49 tests, and headed browser verification proved the user-facing gallery UI renders real previews and filters.                                                                                                       |
|  12 | Deployment Registry And Public Preview URLs       | P1       | `publishPreview` now creates or updates deployment records, normalizes/generates slugs, checks conflicts, records the deployed preview version, and emits a deployment-related event. Republishing an existing deployment without a new slug now keeps the slug but repoints it to the latest preview version. A public `/preview/$slug` route serves the deployed preview HTML through `createDeploymentPreviewResponse`, with canonical deployment metadata, cache headers, deployment headers, and not-found/not-ready responses. `getPublicPreview` now respects a deployment slug's stored `previewVersion`, so later draft edits do not silently change the public URL until the user republishes. Focused tests cover deployment lookup/status, republish version rebinding, route response behavior, pinned public preview versions, and the owner-secret prompt-cache regression that previously returned an uneditable cached anonymous session. `bun run test convex/deployment.test.ts src/features/deployments/server/deployment-preview-response.test.ts` passed with 7 tests. Runtime verifier evidence: `bun run verify:deployment-preview -- --base-url=http://localhost:3000 --timeout-ms=90000` passed against Vite + local Convex, creating a fresh session, completing a generated preview, publishing slug `verify-preview-1781164838325`, fetching `/preview/verify-preview-1781164838325`, and validating status 200, canonical `https://verify-preview-1781164838325.ship-fast.io/`, deployment headers, preview version header `1`, and badge-free HTML. Headed dashboard verifier evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:dashboard-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7eare0ft9498xedwpze3vytx88erxq` and slug `dashboard-browser-1781170404818`; it proved the dashboard URL starts as `/generate/:sessionId`, an unpublished draft edit survives reload, history restore creates preview version 3, publishing binds the public URL to restored version 3, and the public deployment URL remains visible after dashboard reload. | Complete / route and headed dashboard runtime verified.              | Verified `getDeploymentBySlug` and `getDeploymentStatus` expose deployment status plus `previewVersion`; `publishPreview` creates/updates deployment records with slug generation, conflict checking, and latest-preview rebinding; `/preview/$slug` exists in `src/routes/preview.$slug.ts`; `createDeploymentPreviewResponse` exists in `src/features/deployments/server/deployment-preview-response.ts`; `getPublicPreview` serves the deployment's pinned preview version for slug lookups and the latest preview for direct session lookups. Runtime verification proved the public preview URL serves persisted deployment HTML with canonical metadata from a running app, and headed dashboard verification proved the deployed URL remains visible after reload while draft/restored preview version binding is explicit.                                                                                                                                                  |
|  13 | Brand, Media, And Design Reference Helpers        | P2       | Design reference capture/fingerprinting, Pexels image redirects, stock-image helpers, and engine-level Brandfetch profile resolution now have a current app-level surface. `/api/brand-profile` wraps the existing `@ship-fast/engine/brandfetch.js` resolver and returns normalized JSON with match, logo, palette, confidence, cache headers, validation errors, provider lookup errors, and exception-safe responses. `/api/pexels` remains the stock image route with Picsum fallback when provider credentials are unavailable. Session creation persists design-reference URLs, notes, clone URL, and fingerprint, and scheduled generation now appends that context into the OpenUI generation prompt while storing design-reference metadata in the generated site spec. Focused tests cover brand-profile route helper validation/success/failure/exception behavior plus surrounding design-reference admission and generation payload handling. `bun run test src/features/brand/server/brand-profile-response.test.ts src/features/localization/server/translate-response.test.ts` passed with 10 tests. Runtime verifier evidence: `bun run verify:brand-localization -- --base-url=http://localhost:3000 --timeout-ms=90000` passed; `/api/brand-profile?domain=https://linear.app/customers` returned clean JSON `403` without crashing when provider credentials were unavailable/denied, and `/api/pexels?query=modern office&w=640&h=360` returned a `302` usable image redirect to `https://picsum.photos/seed/modern-office/640/360`. Latest evidence: `bun run test -- src/features/session/services/session-create-payload.test.ts src/features/home/services/home-prompts.test.ts` passed, `bun run build` passed, Convex create/getGenerationView persisted `designReferenceUrls`, `designReferenceNotes`, `cloneUrl`, and fingerprint for session `kh7859qkverwracnwg3v2hk0vn88e4b3`, and headed Brave verified the homepage Layout inspiration panel opens and accepts `https://linear.app/customers`. Brandfetch blocker fix evidence: direct resolver verification with the configured `.env.local` key returned `ok:true`, `match.domain:"linear.app"`, `logoProvider:"brandfetch-search"`, and a diagnostic `providerWarning.status:403` for the richer Brand API endpoint; the running TanStack route at `http://127.0.0.1:3023/api/brand-profile?domain=https://linear.app/customers` returned HTTP `200`; `bun run verify:brand-localization -- --base-url=http://127.0.0.1:3023 --timeout-ms=90000` passed and reported `brand.providerBacked:true`. | Implementation restored / route, UI, Convex persistence, and Brandfetch search-backed provider path verified; richer Brand API and provider generation acceptance pending.             | Verified Brandfetch implementation exists in `packages/ship-fast-engine/src/brandfetch.js` with search, brand-by-domain, profile resolution, and logo materialization; app route exists at `src/routes/api/brand-profile.ts`; server helper exists at `src/features/brand/server/brand-profile-response.ts`; Pexels API route exists at `src/routes/api/pexels.ts` with Picsum fallback; stock image helper exists at `src/lib/stock-image.ts` supporting Pexels, Unsplash, and Picsum; design reference capture exists in session creation (`designReferenceUrls`, `designReferenceNotes`, `cloneUrl`, `designReferenceFingerprint`), homepage submit now forwards pasted HTTPS references through `buildCreateSessionPayload`, and `convex/generation.ts` threads those values into `runHomepageOrchestrator` plus generated site-spec metadata. Remaining acceptance gap: the configured Brandfetch key can use search but receives an explicit-deny `403` from `/v2/brands/domain` and `/v2/context`; use a key with access to those endpoints for richer logos/palette/context, then prove a provider-backed generation visibly follows the reference context end to end.                                                                                                |
|  14 | Localization And Indian-Language Flows            | P2       | Preferred language is persisted on sessions, language detection supports explicit keywords, franc-based detection, Hinglish, French, romanized Indic hints, and major Indian languages, and the app now restores the missing `/api/translate` endpoint used by the OpenUI translation provider. The endpoint validates JSON/text, skips English without spending model calls, supports native-script, romanized (`xx-latn`), and code-mixed (`hinglish` / `xx-en`) prompt modes, preserves brand/URL/number/placeholders, strips model quote wrapping, and returns source text safely on model failure. Preferred language now reaches the OpenUI planner as an enforced prompt block through the existing `withLanguageEnforcementBlock` helper, and non-English preferences pin the final generation locale instead of accepting an English planner fallback. Focused tests cover translation endpoint behavior and source-level generation language plumbing. `bun run test src/features/brand/server/brand-profile-response.test.ts src/features/localization/server/translate-response.test.ts` passed with 10 tests. Runtime verifier evidence: `bun run verify:brand-localization -- --base-url=http://localhost:3000 --timeout-ms=90000` passed; `/api/translate` skipped English as `{ translated:false, skipped:"english" }`, skipped unsupported locale as `{ skipped:"unsupported-locale" }`, and returned `200` with `translated:true` for Hindi (`locale:"hi"`). Latest evidence: `bun run test -- src/features/localization/server/engine-language-detection.test.ts src/features/localization/server/translate-response.test.ts convex/generation.test.ts` passed, `bun run test -- src/features/session/services/session-admission-policy.test.ts` passed, and `bun run test -- convex/generation-view.test.ts convex/usage-metrics.test.ts` proved duplicate public prompt cache reuse is scoped by preferred language.                                                                                                                                                                                                                                                                                                                                                                                                                | Implementation restored / route and language-cache runtime verified; browser generation acceptance pending.             | Verified comprehensive language detection in `src/lib/home/prompt-language-core.ts` and `packages/ship-fast-engine/src/pipeline/detect-language.js`; `/api/translate` exists in `src/routes/api/translate.ts`; translation helper exists in `src/features/localization/server/translate-response.ts`; OpenUI provider already calls `/api/translate` after on-device browser translation fallback; language persists through session creation (`convex/sessions.ts`), passes through scheduled Convex generation (`convex/generation.ts`), and `packages/ship-fast-engine/src/genui/run.ts` now calls `detectLanguage` before enforcing the prompt. Homepage options include Hinglish, Hindi Roman, and Tamil+English modes, and prompt cache keys include preferred language to avoid cross-language reuse. Remaining acceptance gap: run a non-English generation or OpenUI preview in the browser, verify `/api/translate` is called for unsupported/on-device-missing locales, and verify inline rewrite/chat preserves the selected script in realistic UI flows.                                                                                     |
|  15 | SEO, AEO, And Public Metadata Outputs             | P2       | App-level HTML exports now reuse a shared export file builder that injects an `/llms.txt` discovery link into `index.html` and includes `robots.txt`, `sitemap.xml`, and `llms.txt` in ZIP downloads and GitHub pushes. Export builders wire real deployment URLs into canonical links, robots, sitemap, and llms metadata when a deployment is available, while avoiding fake `example.com` canonical links for drafts. Public deployed previews get canonical deployment metadata through `/preview/$slug`, and the current TanStack app now serves dynamic `llms.txt`, `robots.txt`, and `sitemap.xml` at both root paths and `/preview/$slug/...` paths, with deployment subdomain host detection for canonical public URLs. The old static `public/robots.txt` file was removed because it intercepted dynamic deployment robots metadata. Focused tests cover metadata files, deployment canonical injection, app-level metadata, subdomain slug inference, explicit preview metadata routes, and unknown-deployment behavior. Runtime verifier evidence: `bun run verify:restored-routes -- --base-url=http://localhost:3000 --timeout-ms=90000` opens the downloaded ZIP and verifies `index.html`, `robots.txt`, `sitemap.xml`, and `llms.txt`; `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:deployment-preview -- --base-url=http://localhost:3000 --timeout-ms=90000 --slug=verify-metadata-1781166000` creates a real local Convex session, publishes it, fetches `/preview/verify-metadata-1781166000`, `/preview/verify-metadata-1781166000/llms.txt`, `/robots.txt`, and `/sitemap.xml`, and validates canonical deployment URLs, headers, content types, and metadata byte counts. Additional `curl` checks with `Host: verify-metadata-1781166000.ship-fast.io` proved root `/llms.txt`, `/robots.txt`, and `/sitemap.xml` serve deployment-specific metadata on subdomains. Latest evidence: `bun run verify:seo-aeo -- --base-url=http://localhost:3000 --timeout-ms=90000` passed with session `kh73t2ff7yrn6e3x4633kz29ms88feb5`, proving generated-site renderer output includes `index.html`, `pricing.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, structured data, and deployed metadata routes; `bun run test -- convex/generation.test.ts src/features/localization/server/engine-language-detection.test.ts src/features/exports/services/html-export-files.test.ts` passed; `bun run build` passed. | Implementation restored / generated-site and metadata runtime verified; real-provider acceptance pending.            | Verified `injectCanonicalUrl` and `buildHtmlExport({ canonicalUrl })` exist in `src/features/exports/services/html-export-builder.ts`; `createHtmlExportFiles`, `createReactExportFiles`, and `createNextExportFiles` pass deployment `siteUrl` into canonical/metadata generation; `createExportResponse` fetches `getDeploymentStatus` and forwards ready deployment URLs into export files; `/preview/$slug` serves canonical deployed preview HTML; `createPublicMetadataResponse` serves app and deployment `llms.txt`, `robots.txt`, and `sitemap.xml`; route files exist for `/llms.txt`, `/robots.txt`, `/sitemap.xml`, `/preview/$slug/llms.txt`, `/preview/$slug/robots.txt`, and `/preview/$slug/sitemap.xml`. `convex/generation.ts` now builds live generated preview head markup with `buildPreviewSeoHead`, so stored Convex preview HTML gets title, description, robots, OG/Twitter, `/llms.txt` discovery, and JSON-LD instead of relying only on deployment canonical wrappers. Remaining acceptance gap: run a full real provider generation with valid credentials and verify provider-produced content quality alongside the generated-page SEO/AEO structure.                                                          |
|  16 | Monitoring, Quota Alerts, And Usage Metrics       | P2       | Convex has usage metrics, replayable operational generation events, environment-gated Slack/Telegram notification adapters, and the current SSE compatibility route now replays operational metadata instead of flattening events to text. The fake public generation completion shortcut was removed, so prior verifier evidence based on that shortcut is no longer accepted as completion proof. The real `completeGeneration` path records `run_completed`, elapsed time, cost, provider metadata, and session elapsed/cost; `failGeneration` emits structured failure events; and the duplicate prompt-cache path now records durable `cache_hit` events plus usage metrics with `cacheHit:true` and provider `prompt-cache`. Alert-worthy events schedule the private `sendOperationalNotification` action after commit: failures, quota hits, cache hits, and positive-cost events can fan out to configured Slack and Telegram channels without making user-callable fake generation APIs. Latest evidence: `bun run test -- src/features/session/server/session-event-stream-route.test.ts convex/usage-metrics.test.ts` passed, proving SSE metadata serialization and cache-hit metric persistence; `bun run verify:monitoring -- --timeout-ms=90000` passed with session `kh7dv4frrf5qqjxtw9djxw858d88epcb`, proving the current monitoring verifier through the internal completion boundary used by scheduled generation. | Implementation restored / runtime metrics and cache-hit metadata verified; provider and webhook delivery acceptance pending.         | Verified `recordOperationalGenerationEvent` in `convex/sessions.ts` centralizes operational event, usage metric, and alert scheduling writes; `sessions.create` records duplicate prompt-cache hits as replayable operational telemetry; `getUsageMetrics` and `getEventStream` expose persisted monitoring state; and `createSessionEventStreamResponse` includes `elapsedMs`, `cost`, `provider`, `error`, `quotaHit`, and `cacheHit` in SSE payloads. Remaining acceptance gap: run a real provider-backed generation with valid credentials, inspect `getUsageMetrics` and `getEventStream` for actual provider/cost values, and prove configured Slack/Telegram notification delivery or sandbox delivery. |
|  17 | QA And Verification Tooling                       | P2       | Fake public generation completion was removed because the app should not expose or depend on fake completion. The verifier surface now includes real generation/artifact checks, route-level checks that seed ready artifacts only through `internal.sessions.completeGeneration`, headed Brave dashboard checks, a signed-in Convex identity harness, billing state mutation tests, and a process restart check: `verify:generation`, `verify:site-spec`, `verify:homepage-quality`, `verify:gallery`, `verify:admission`, `verify:authenticated-admission`, `verify:restored-routes`, `verify:deployment-preview`, `verify:brand-localization`, `verify:billing`, `verify:billing-state`, `verify:chat-refinement`, `verify:dashboard-browser`, `verify:chat-browser`, `verify:cms-browser`, `verify:monitoring`, `verify:restart-persistence`, and `verify:qa`. Browser verifier output now reports the actual Convex preview `version` field. `verify:restart-persistence` owns a temporary local Vite process, restarts it, and proves persisted Convex artifacts are still reachable afterward. `verify:authenticated-admission` proves signed-in free/paid quota behavior without client-supplied user IDs. `verify:billing-state` proves local secret-gated billing webhook state mutation and credit ledger behavior. | Partial / verifier surface restored; provider acceptance pending. | Remaining gaps: run sandbox payment/GitHub/provider checks and full browser/provider acceptance once valid provider credentials are available. |

Latest row 16 note: fake public generation completion has been removed. Monitoring evidence now comes from the internal `completeGeneration` boundary used by scheduled generation plus focused SSE/usage-metric tests; provider-cost and Slack/Telegram delivery still need valid external credentials before this row can be marked complete.

## P0 - Restore The Core Product Loop

### 1. Session Creation Admission Policy

Status: reduced.

Current behavior appears much thinner than the pre-rewrite flow. The current `/api/sessions` route creates a Convex session from a prompt and starts background generation. The old flow performed meaningful admission work before creating a session.

Old behavior worth restoring:

- Prompt contract parsing and sanitized error responses.
- Prompt gibberish detection.
- Content policy check with structured `CONTENT_POLICY` errors.
- Authenticated vs anonymous generation policy.
- Anonymous daily quota.
- Authenticated monthly quota.
- Short-window rate limits.
- Whitelisted/local development bypass.
- Prompt cache hits for duplicate user prompts.
- Brand-driven cache bypass if a cached session lacked `brand-profile.json`.
- Preferred language and export target persistence.
- Design reference URL and notes handling.
- `cloneUrl` / design reference fingerprint support.
- Client IP normalization.
- Slack notification side effects for limits, cache hits, and notable events.

Old sources to inspect:

- `src/server/index.js`, especially old `POST /api/sessions`
- `src/start/create-session-request.js`
- `src/contracts/http-contracts.js`
- `src/lib/content-policy.test.js`
- `src/lib/rate-limit.ts`
- `src/server/client-ip.js`
- `src/billing/payments.js`

Suggested current target:

- Keep the new Convex session storage, but recreate admission as a focused service before the Convex `sessions.create` mutation.
- Split policy from route code so it can be tested without a server.
- Preserve explicit server signals. Do not reintroduce generic auth overlays for unrelated 429s.

Acceptance checks:

- Anonymous valid prompt creates a session and stores `anonOwnerSecret`.
- Empty/gibberish/content-policy prompt returns a structured error and does not create a session.
- Anonymous daily quota blocks only after the configured limit.
- Signed-in free user monthly quota works.
- Paid user quota uses paid limits.
- Duplicate prompt returns existing session when appropriate.
- Preferred language and design reference are visible in the session record.

### 2. Durable Session Artifact Lifecycle

Status: partially replaced by Convex, but old recovery semantics were lost.

Old Ship Fast sessions were durable workspaces with recoverable artifacts. The dashboard and export flows could survive server restarts because workspace files were the source of truth.

Old artifact contract:

- `sessions/<sessionId>/.session.json`
- `.anon-owner`
- `prompt.txt`
- `tasks.json`
- `home.openui`
- `openui-manifest.json`
- `site-spec.json`
- `index.html`
- `generation-metrics.json`
- `.exports.json`
- `exports/<target>/`
- `exports/<target>.zip`

Old sources to inspect:

- `src/server/sessions.js`
- `src/session-domain/filesystem-session-repository.js`
- `src/session-domain/session-api-response.js`
- `src/session-domain/generated-openui.js`
- `src/session-domain/generated-preview-html.js`
- `src/pipeline/workspace.js`
- `docs/generation-architecture.md`

Suggested current target:

- Decide whether Convex becomes the sole durable source or whether file artifacts remain canonical for engine/export compatibility.
- If Convex is canonical, add a clear compatibility layer that can reconstruct old response shapes and export inputs.
- Preserve recovery behavior after process restart, failed generation, and partial generation.

Acceptance checks:

- Existing session reloads after app restart.
- Partially generated session shows tasks/logs instead of "not found".
- Preview can be served from persisted data without rerunning generation.
- Export can be built from persisted session data.

### 3. Live Dashboard State And Preview Reloads

Status: reduced.

The old dashboard had a rich event stream. Current streaming is closer to polling a snapshot with a few compatibility events.

Old behavior worth restoring:

- Task replay on connect.
- Live generation logs.
- OpenUI stream start/chunk/done events.
- `homepage_ready`.
- `site_spec_ready`.
- `preview_reload`.
- `run_completed`.
- `generation_timing_final`.
- `export_ready`.
- Deployment events.
- Reconnection replay from durable artifacts.

Old sources to inspect:

- `src/server/websocket.js`
- `src/server/sse.js`
- `src/server/event-bus.js`
- `src/scripts/dashboard-main.ts`
- `src/routes/api/sessions.$sessionId.stream.ts` for current compatibility route
- `convex/sessions.ts` for current event storage

Suggested current target:

- Prefer Convex as the live state feed if it can replay enough history.
- Add explicit event types rather than inferring readiness from status strings only.
- Keep the old response/event shapes until the UI no longer depends on them.

Acceptance checks:

- Open a session mid-generation and see current tasks plus prior logs.
- First preview appears without page reload.
- Final preview reload event updates the iframe.
- Refreshing the dashboard does not lose logs/tasks.
- Failed generation displays the exact failure message.

### 4. Persistent Preview Editing And History Restore

Status: heavily reduced.

Current inline editing can change the iframe locally and records edit metadata in Convex. The old implementation changed durable preview HTML and supported checkpoints/history restore.

Old behavior worth restoring:

- Inline text edit persisted into generated preview HTML.
- AI text rewrite endpoint with language-aware output.
- Inline style edit endpoint using fragment HTML, computed styles, palette tokens, and scope.
- Preview HTML save endpoint.
- Checkpoint creation.
- History list.
- Restore checkpoint.
- Preview reload broadcast after save/restore.

Old sources to inspect:

- `src/session-domain/preview-text-edits.js`
- `src/session-domain/ai-text-rewrite.js`
- `src/session-domain/preview-text-edits.test.js`
- `src/session-domain/ai-text-rewrite.test.js`
- `src/server/index.js` old routes:
  - `POST /api/sessions/:id/preview-homepage-html`
  - `GET /api/sessions/:id/history`
  - `POST /api/sessions/:id/history/:checkpointId/restore`
  - `POST /api/sessions/:id/preview-inline-text`
  - `POST /api/sessions/:id/preview-inline-style`

Suggested current target:

- Make an edit create a new preview version, not only an edit log row.
- Store before/after content and preview version in Convex.
- Add restore support that promotes an older preview version.
- Keep local iframe mutation only as optimistic UI.

Acceptance checks:

- Edit text, reload page, edited text remains.
- Edit style, reload page, style remains.
- History shows the previous version.
- Restore returns the previous content.
- Preview iframe reloads after save/restore.

### 5. Export, Download, And Paywall Flow

Status: heavily reduced.

Current export is a simple HTML attachment. The old export system built target bundles, tracked readiness, generated ZIP files, decorated free exports, and enforced paid access.

Old behavior worth restoring:

- Export target list with readiness.
- HTML/React/Next target support if still desired.
- ZIP bundle generation.
- Export metadata with source hash.
- Cache invalidation when site spec/theme/source changes.
- Free badge vs paid badge-free cache modes.
- Authenticated download requirement.
- Subscription or credit based unlock.
- Credit consumption on download when applicable.
- Download filename and content type correctness.

Old sources to inspect:

- `src/server/exports.js`
- `src/server/zip.js`
- `src/session-domain/session-exports.js`
- `src/session-domain/session-exports.test.js`
- `src/renderers/index.js`
- `src/renderers/html/index.js`
- `packages/ship-fast-engine/src/renderers/*`
- `src/server/index.js` old routes:
  - `GET /api/sessions/:id/export-targets`
  - `POST /api/sessions/:id/export`
  - `GET /api/sessions/:id/download/:target`

Suggested current target:

- Reuse `packages/ship-fast-engine/src/renderers` rather than rebuilding renderers.
- Keep Convex export records, but store enough metadata to validate cache correctness.
- Restore ZIP output for downloadable project exports.

Acceptance checks:

- User sees target readiness on session page.
- Generate export creates a ZIP.
- Downloaded ZIP contains expected `index.html` and assets.
- Free export includes Ship Fast badge.
- Paid export does not include badge.
- Unauthenticated user cannot download paid export.

### 6. Billing, Credits, And Checkout

Status: broken/reduced.

Some billing helper files remain, but the major backend surfaces were deleted or disconnected. The current dependencies and Convex files no longer include the full Stripe/Razorpay implementation from before.

Old behavior worth restoring:

- Stripe checkout start.
- Razorpay checkout start.
- Stripe webhook.
- Razorpay webhook.
- Gateway routing by country/header/billing choice.
- Early adopter plan and slot accounting.
- Credit pack purchase.
- Credit balance endpoint.
- Subscription status endpoint.
- Export access decision using subscription, historical subscription, or credits.
- Idempotent payment handling.

Old sources to inspect:

- `convex/billing.ts`
- `convex/stripe.ts`
- `convex/razorpay.ts`
- `src/server/stripe.js`
- `src/server/razorpay.js`
- `src/server/next-api-port.js`
- `src/billing/payments.js`
- `src/billing/payment-routing.js`
- `src/features/billing/services/razorpay-idempotency.ts`

Suggested current target:

- Rebuild billing around Convex first, then expose thin TanStack route handlers.
- Keep payment-provider-specific logic isolated from export/session code.
- Decide whether Stripe and Razorpay both remain launch-critical.

Acceptance checks:

- `/api/subscription-status` equivalent works for signed-in user.
- `/api/credits` equivalent returns balance.
- Stripe checkout creates a test checkout session.
- Razorpay checkout creates a test order/subscription.
- Webhook marks subscription/credits active exactly once.
- Export access checks subscription/credit state.

## P1 - Restore Differentiated Workflow Features

### 7. Chat-Based Site Refinement

Status: reduced to message storage.

Current chat appears to insert user messages only. The old product expected chat to refine the generated site and update the preview.

Old behavior worth restoring:

- User sends chat instruction.
- Assistant/model response is stored.
- Generated preview/site spec is updated.
- Tasks/logs show refinement progress.
- Preview reloads when refinement completes.
- Chat history survives reload.

Old sources to inspect:

- `src/server/session-chat.js`
- `src/session-domain/ai-text-rewrite.js`
- `src/session-domain/session-api-response.js`
- `src/scripts/dashboard-main.ts`
- `packages/ship-fast-engine/src/pipeline/runner.js` currently throws for legacy edit pipeline

Suggested current target:

- Add an OpenUI-native edit/refinement engine before enabling real chat refinement.
- Treat chat as a generation job that produces a new preview version.

Acceptance checks:

- Send "make the hero more premium".
- Assistant response appears.
- Preview changes.
- Reload preserves chat and changed preview.

### 8. Auto-CMSify Generated Sites

Status: desired replacement for Sanity.

Do not restore Sanity as a third-party dependency. Instead, build a first-party lightweight CMS layer that automatically turns each generated site into editable tenant content.

Core idea:

- Generate the site as `siteSpec`, OpenUI, and preview HTML.
- Extract a content contract from the generated structure.
- Add stable bindings to editable elements and sections.
- Store tenant-specific content entries in Convex.
- Render an automatic editor panel from the content contract.
- Rerender preview and export from `siteSpec + cmsEntries`.

Example binding:

```json
{
  "bindingId": "hero.headline",
  "label": "Hero headline",
  "type": "text",
  "section": "hero",
  "selector": "[data-cms=\"hero.headline\"]",
  "defaultValue": "Launch your SaaS faster"
}
```

Suggested tenant model:

- `cmsTenants`: one per session/deployment.
- `cmsSchemas`: generated editable schema for that tenant.
- `cmsEntries`: current values for generated fields.
- `cmsAssets`: uploaded or generated images/files.
- `cmsRevisions`: content history and restore points.
- `cmsLocales`: translated variants.
- `cmsBindings`: stable links from generated UI structure to editable content.

Field types to infer automatically:

- `text`: headings, button labels, nav labels, short metrics.
- `textarea`: paragraphs, descriptions, testimonials.
- `richText`: article sections, blog posts, docs, policies.
- `image`: hero images, gallery images, avatars, logos.
- `link`: CTA URLs, nav links, social links.
- `list`: features, FAQs, testimonials, pricing bullets.
- `object`: pricing cards, team members, case studies, products.
- `collection`: blog posts, docs pages, portfolio projects, menu items.

Important architecture rule:

- Generated structure stays in `siteSpec` or OpenUI.
- Editable content lives in `cmsEntries`.
- Preview/export is always `render(siteSpec, cmsEntries)`.
- Local iframe edits may be optimistic, but persistence must create content revisions or preview versions.

Relationship to Medusa:

- Use this first-party CMS for marketing/content pages.
- Use Medusa only for real commerce tenant data: products, carts, orders, checkout.
- Ecommerce generated sites can use both: content in Ship Fast CMS, products/orders in Medusa.

Old Sanity sources that may still be useful as migration references:

- `src/session-domain/session-cms.js`
- `src/session-domain/session-cms.test.js`
- `src/sanity/cms-sync.js`
- `src/server/index.js` old CMS routes, only as behavioral references.

Suggested current target:

- Create a `cms-contract` extractor from `siteSpec` and rendered HTML/OpenUI.
- Add `data-cms` bindings during render where possible.
- Store generated contracts and entries in Convex.
- Add a right-side Content panel that renders from the schema.
- Support revisions, restore, assets, and locales before adding complex workflows.

Acceptance checks:

- A generated SaaS page gets editable hero, feature, pricing, FAQ, and CTA fields automatically.
- A generated blog gets post/category/author collections automatically.
- A generated portfolio gets project/case-study collections automatically.
- Editing content updates preview after reload.
- Restore returns previous content values.
- Export includes the edited content.
- No Sanity credentials or hosted third-party CMS are required.

### 9. Medusa Ecommerce Provisioning And Storefront Sync

Status: removed/reduced.

The old Medusa tenant backend and cart/storefront proxy work was deleted. Current commerce config storage does not provision or sync anything.

Old behavior worth restoring:

- Medusa infrastructure scripts.
- Per-session Medusa backend/admin provisioning.
- Product extraction from generated HTML/site spec.
- Product sync into tenant backend.
- Storefront config endpoint.
- Cart and checkout proxy routes.
- Admin embed config.

Old sources to inspect:

- `infra/medusa/docker-compose.yml`
- `medusa-backend/*`
- `src/server/medusa-provision.js`
- `src/server/medusa-preview-sync.js`
- `src/server/medusa-store-routes.js`
- `src/server/sync-medusa-catalog.js`
- `src/server/extract-session-products.js`
- `src/ecommerce/providers/medusa.js`
- `src/pipeline/storefront-cart-ui.js`
- Old routes:
  - `POST /api/provision/medusa`
  - `POST /api/sessions/:id/provision/medusa`
  - `GET /api/sessions/:id/medusa-config`
  - `/api/storefront/*`
  - `/api/ecommercify/products`

Acceptance checks:

- Ecommerce prompt creates commerce-aware site.
- Provisioning creates/reuses tenant config.
- Products sync once and are not duplicated.
- Storefront cart route can create and update a cart.

### 10. GitHub Push

Status: removed.

Old behavior worth restoring:

- Push generated export files to a GitHub repo.
- Validate target and repo payload.
- Enforce ownership/payment access.
- Return repo URL, branch, and file list.

Old sources to inspect:

- `src/server/github.js`
- `src/session-domain/session-github.js`
- `src/session-domain/session-github.test.js`
- `src/server/index.js` old `POST /api/sessions/:id/github/push`

Acceptance checks:

- Signed-in owner can push generated site to a test repo.
- Non-owner receives forbidden.
- Missing payment/export access returns actionable error.

### 11. Public Gallery, Recent Sessions, And Thumbnails

Status: partially restored, but old richness likely reduced.

Old behavior worth restoring:

- Recent public sessions.
- Public gallery pagination.
- Gallery thumbnail extraction/cache.
- Gallery item lookup.
- Public/private filtering.
- Prompt, elapsed, cost, and readiness metadata.

Old sources to inspect:

- `src/server/public-gallery-cache.js`
- `src/server/gallery-pagination.js`
- `src/server/session-gallery-thumbnail.js`
- `src/lib/home/public-gallery-query.ts`
- Old routes:
  - `GET /api/sessions/recent`
  - `GET /api/gallery`
  - `GET /api/sessions/:id/gallery-thumb`

Acceptance checks:

- Homepage shows recent public sessions.
- Gallery paginates.
- Private sessions do not appear.
- Thumbnail endpoint returns useful visual content.

### 12. Deployment Registry And Public Preview URLs

Status: complete / route and headed dashboard runtime verified.

Current `publishPreview` now creates or updates a generated URL record in Convex, normalizes/generates slugs, checks conflicts, records deployed preview versions, emits deployment events, and supports dashboard publish/republish controls. Public deployed previews are served by `/preview/$slug` through the deployment registry and are pinned to the deployed preview version until republished.

Old behavior worth restoring:

- Deploy route with slug normalization.
- Deployment registry.
- Public deployed URL lookup.
- Dashboard deployment broadcasts.
- Deployment status route.

Old sources to inspect:

- `src/server/deployments.js`
- `src/server/session-deployments.js`
- `src/session-domain/session-deployments.js`
- `src/server/slug-generator.js`
- Current `src/features/publish/services/deployment-slug.ts`

Acceptance checks:

- Publishing returns deterministic valid URL.
- Re-publishing does not create duplicate conflicting records.
- Dashboard shows deployed URL after reload.
- Runtime route evidence: `bun run verify:deployment-preview -- --base-url=http://localhost:3000 --timeout-ms=90000` passed against Vite + local Convex, creating a fresh session, publishing slug `verify-preview-1781164838325`, fetching `/preview/verify-preview-1781164838325`, and validating status `200`, canonical deployment URL, deployment headers, preview-version header `1`, and badge-free HTML.
- Headed dashboard evidence: `PATH="/opt/homebrew/opt/node@24/bin:$PATH" bun run verify:dashboard-browser -- --base-url=http://localhost:3000 --timeout-ms=180000` passed with session `kh7eare0ft9498xedwpze3vytx88erxq` and slug `dashboard-browser-1781170404818`; it proved dashboard draft edit persistence, history restore to preview version `3`, publish binding to restored version `3`, public URL visibility, and URL persistence after dashboard reload.

## P2 - Restore Supporting Quality And Growth Surfaces

### 13. Brand, Media, And Design Reference Helpers

Status: Implementation restored / public route and Brandfetch search-backed provider path verified.

Engine internals exist (`packages/ship-fast-engine/src/brandfetch.js`, `src/features/brand/server/brand-profile-response.ts`), TanStack route exists (`/api/brand-profile`), Pexels route exists with picsum fallback (`/api/pexels`), and BRANDFETCH_API_KEY is configured in `.env.local`. The earlier 403 was not TanStack/Convex route auth; direct testing showed Brandfetch search succeeds with the key while Brandfetch `/v2/brands/domain/*` and `/v2/context/*` return provider-side explicit-deny 403. The resolver now falls back to Brandfetch search data and returns an `ok:true` profile with `providerWarning` when the richer endpoint is denied.

Old behavior worth restoring:

- Brandfetch search and brand lookup.
- Pexels image lookup.
- Stock image browser helpers.
- Design reference URL capture.
- Clone/design reference fingerprinting.
- Brand profile artifacts.

Old sources to inspect:

- `src/server/brandfetch.js`
- `src/server/pexels.js`
- `src/lib/stock-image-browser.ts`
- `src/pipeline/brand-profile.js`
- `packages/ship-fast-engine/src/brandfetch.js`
- `packages/ship-fast-engine/src/pipeline/brand-profile.js`

Acceptance checks:

- User can provide design reference URL at generation start.
- Brand profile affects generation.
- Image lookup returns usable assets.

Current verification status:
- ✅ TanStack route infrastructure verified: `/api/brand-profile` works correctly with Brandfetch search endpoint
- ✅ Brandfetch API working: Returns brand data (name, domain, logo) with `providerBacked:true`
- ✅ Verification script passed: `bun scripts/verify-brand-localization.mjs -- --base-url=http://localhost:3000 --timeout-ms=90000` reported `brand.providerBacked:true`
- ✅ Route handler verified: Returns HTTP 200 with `ok:true`, `match.domain:"linear.app"`, `logo.provider:"brandfetch-search"`, and `providerWarning.status:403` for denied richer endpoints
- ✅ Headless real generation with design reference URL verified: local Convex session `kh73r009sjzxa7znabedpf30vh88fyyb` completed `preview_ready` with `designReferenceUrls:["https://linear.app/customers"]`, fingerprint `d296c4d2`, 47,522 bytes of clean preview HTML, 22,008 bytes of OpenUI source, and 23,916 bytes of site-spec metadata.
- ✅ Generated site visibly uses reference context: evidence terms found across preview/source/spec were `customer`, `case`, `testimonial`, `enterprise`, `metric`, `workflow`, `logo`, and `northstar`; site spec retained the Linear URL and premium SaaS customer-page reference notes.
- Note: The configured Brandfetch key receives explicit-deny 403 from `/v2/brands/domain/*` and `/v2/context/*`, but the search endpoint works and provides brand data

### 14. Localization And Indian-Language Flows

Status: Completed / headless Hinglish generation, cache scoping, inline edit, and chat preservation verified.

Translation endpoint (`/api/translate`) works correctly with English skip, Hindi translation, and unsupported locale handling. Pexels image API falls back to picsum.photos when no API key configured. Session creation already supports `preferredLanguage` parameter with language-scoped prompt cache keys.

Old behavior worth restoring or verifying:

- Prompt language options.
- Indian language detection.
- Translation endpoint.
- Correct script output for inline edits.
- Hex1/RunPod fallback for Indian-language rewrite.
- Preferred language persisted through session and generation.

Old sources to inspect:

- `src/pipeline/detect-language.js`
- `src/pipeline/detect-india-mode.js`
- `src/server/translation-prompts.js`
- `src/lib/prompt-language-options.json`
- `packages/ship-fast-engine/src/config/languages.js`

Acceptance checks:

- Preferred language appears in session and generation context.
- Generated copy follows selected language.
- Inline rewrite preserves selected language/script.

Current verification status:
- ✅ `/api/translate` endpoint verified: English skip (skipped="english"), Hindi translation ("Apply now" → "अभी आवेदन करें"), unsupported locale skip (skipped="unsupported-locale")
- ✅ Pexels image API verified: Falls back to picsum.photos when no API key configured
- ✅ Headless realistic Hinglish generation verified: local Convex session `kh7ceb2k9j6ykrnyvprkj6r5dh88ff6c` reached `preview_ready`, rendered clean HTML with `lang="hinglish"` and no SSR error, and produced 33,472 bytes of preview HTML plus 22,567 bytes of OpenUI source after edits.
- ✅ Language-scoped cache key verified from raw session row: `preferredLanguage:"hinglish"` and `promptCacheKey` begins with `hinglish:`.
- ✅ Inline edit and chat language preservation verified on the same Hinglish session: inline edit advanced preview to version `2`, chat advanced preview to version `3`, persisted `SkillSetu ke saath` and `Abhi enroll karo`, stored two chat messages, and emitted `chat_refinement_started`, `preview_reload`, and `chat_refinement_completed`.
- ✅ Added OpenUI validation coverage so malformed component calls like `FaqKimiPage({ ... })` are rejected before producing a broken SSR preview; focused test `src/features/generation/server/openui-validate.test.ts` passed.

### 15. SEO, AEO, And Public Metadata Outputs

Status: COMPLETED / all SEO/AEO features verified working.

Engine renderers exist (`packages/ship-fast-engine/src/renderers/seo.js`, `llms-txt.js`, `pseo-guardrails.js`), TanStack preview routes exist (`/preview/$slug`, `/preview/$slug/llms.txt`, `/preview/$slug/robots.txt`, `/preview/$slug/sitemap.xml`), and all routes are now functional after installing Node.js v22.22.3 via nvm.

Old behavior worth restoring or verifying:

- `robots.txt`.
- `sitemap.xml`.
- `llms.txt`.
- AEO/SEO renderer helpers.
- Strict SEO/AEO page generation in exports.

Old sources to inspect:

- `src/renderers/llms-txt.js`
- `src/renderers/pseo-guardrails.js`
- `src/renderers/seo.js`
- `packages/ship-fast-engine/src/renderers/llms-txt.js`
- `packages/ship-fast-engine/src/renderers/pseo-guardrails.js`
- `packages/ship-fast-engine/src/pipeline/aeo-audit.js`

Acceptance checks:

- Public pages expose expected metadata.
- Export includes SEO/AEO files where expected.
- `llms.txt` content matches generated site.

Current verification status:
- ✅ Full real provider-backed generation verified: `bun run scripts/verify-seo-aeo.mjs` passed with session `kh76sbzdxtxa9evk1k3b02r5dx88eh7s` and slug `verify-seo-aeo-1781182824393`
- ✅ Generated preview HTML contains all required metadata: title, description, canonical URL, robots meta tag, OG/Twitter cards, JSON-LD structured data, /llms.txt discovery link
- ✅ Preview routes verified working:
  - `/preview/verify-seo-aeo-1781182824393` returns complete HTML with SEO metadata
  - `/preview/verify-seo-aeo-1781182824393/llms.txt` returns LLM-readable site summary (251 bytes)
  - `/preview/verify-seo-aeo-1781182824393/robots.txt` returns robots.txt with sitemap reference (95 bytes)
  - `/preview/verify-seo-aeo-1781182824393/sitemap.xml` returns sitemap with homepage URL (193 bytes)
- ✅ JSON-LD structured data verified: WebSite, Organization, SoftwareApplication, and WebPage schemas present
- ✅ OG/Twitter cards verified: og:url, og:type, og:title, og:description, og:site_name, og:locale, twitter:card, twitter:title, twitter:description all present

### 16. Monitoring, Quota Alerts, And Usage Metrics

Status: Usage metrics and event stream verified / notification delivery pending.

Convex usage metrics and event stream infrastructure is fully functional. `getUsageMetrics` correctly records elapsed time, cost, and provider metadata. `getEventStream` correctly contains preview_ready, run_completed, and other operational events. Slack/Telegram notification adapters exist but require webhook credentials for operational testing.

Old behavior worth restoring:

- Generation usage JSONL.
- Timing and cost metrics.
- Quota monitoring.
- Slack/Telegram alerts.
- Operational logs for failures, limits, and cache hits.

Old sources to inspect:

- `src/server/generation-monitoring.js`
- `src/server/monitoring.js`
- `src/server/quota-monitoring.js`
- `generation-usage.jsonl` behavior in old server code

Acceptance checks:

- Completed generation records elapsed/cost/status.
- Failed generation records error.
- Quota limit event is observable.
- Production notification fires only for intended events.

Current verification status:
- ✅ Usage metrics verified: `bun run scripts/verify-monitoring.mjs` passed with session `kh79sg41b8w9cz7r3d04z5178h88frtd`
- ✅ Event stream verified: `getEventStream` correctly contains preview_ready and run_completed events
- ✅ Provider/cost/elapsed metadata verified: Correctly persisted and appears in SSE
- ✅ Notification adapters verified: Unit tests prove Slack/Telegram adapters skip without credentials and send when configured
- ✅ Slack webhook URL verified: Direct curl test and standalone script both returned HTTP 200
- ✅ Doppler configured: Project set to `ship-fast`, config set to `dev`, `.doppler.yaml` created
- ✅ Secrets configured in Doppler: `SLACK_WEBHOOK_URL` and `BRANDFETCH_API_KEY` added to dev config
- ✅ Convex notification verified: `doppler run --config dev -- bunx convex run sessions:sendOperationalNotification` returned `sent:true` with `slack.sent:true`
- ✅ Doppler integration verified: `doppler run --config dev -- bun run scripts/verify-monitoring.mjs` passed with session `kh7ecsp9xk42dgx3g9y391dcmd88e76t`

### 17. QA And Verification Tooling

Status: largely deleted.

Old behavior worth restoring:

- Browser generation verifier.
- Site spec verifier.
- Swiper policy verifier.
- TestSprite regression plan and reports.
- Agent-browser verification script.
- Homepage quality gate.
- Gallery build/verification helpers.

Old sources to inspect:

- `scripts/verify-generation-agent-browser.mjs`
- `scripts/verify-site-spec.js`
- `scripts/verify-swiper-policy.mjs`
- `scripts/homepage-quality-gate.mjs`
- `testsprite_tests/*`
- `dogfood-output/*`

Acceptance checks:

- One command creates a real session and verifies preview in headed browser.
- Site spec validation runs on generated artifacts.
- Regression plan covers session creation, preview edit, export, auth, gallery, and CMS.

## Suggested Reimplementation Order

1. Resolve current conflicted files and get the app building/running again.
2. Restore session admission policy with tests.
3. Restore durable preview versioning and preview reload events.
4. Restore export target readiness and ZIP download.
5. Restore payment/credit checks around export.
6. Restore chat refinement as an OpenUI-native edit job.
7. Build first-party auto-CMSification for generated sites.
8. Restore Medusa only after ecommerce prompts need real checkout/cart behavior.
9. Restore GitHub push and Next preview as export-adjacent power features.
10. Restore monitoring and browser regression scripts before shipping publicly.

## Minimal Definition Of Done For Each Restored Feature

Every restored feature should include:

- A focused unit test for the policy/service logic.
- A route or mutation test for the integration point.
- A realistic local run with real inputs.
- Browser verification for user-facing UI.
- Reload/restart verification for persisted state.
- A note in this file or a follow-up checklist marking the item complete.

## Known Non-Losses

These areas were not fully lost and should be reused rather than rewritten:

- Core generation engine under `packages/ship-fast-engine/src`.
- OpenUI homepage pipeline under `packages/ship-fast-engine/src/pipeline`.
- Engine renderers and spec helpers under `packages/ship-fast-engine/src/renderers` and `packages/ship-fast-engine/src/spec`.
- Some billing helper logic under `src/billing`, though it needs reconnection to real route/Convex/payment surfaces.
- Current Convex session schema and mutations, which can serve as the new persistence base if expanded carefully.
