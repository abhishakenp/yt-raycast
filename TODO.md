# Ship Fast Reimplementation TODO

Snapshot: 2026-06-11

This document tracks product features and operational surfaces that were lost or reduced during the rewrite around `acfff7bc Rewrite project`, plus later migration work. It is intended as a practical backlog, not a blame log.

Current caveat: this document now includes a conservative progress review after the first restoration pass. Treat it as an implementation guide and re-check exact runtime behavior before marking any row complete.

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

| # | Task | Priority | Progress feedback | Honest status | Main remaining gaps |
|---:|---|---|---|---|---|
| 1 | Session Creation Admission Policy | P0 | The latest restoration added a real admission-policy service, structured validation errors, prompt cache keys, anonymous client hashing, design-reference normalization/fingerprinting, anonymous/free/paid quota checks, and short-window throttling. Convex session creation now stores preferred language/export target and the restored admission metadata. This is meaningful progress and likely covers the most visible backend admission regressions. | Partial / mostly backend-restored. | Still needs route/browser verification, client IP normalization parity, local/dev bypass review, Slack/ops side effects, brand-profile-aware cache bypass, and full acceptance-check evidence for duplicate prompt reuse and quota boundaries. |
| 2 | Durable Session Artifact Lifecycle | P0 | Convex tables now persist more session-adjacent data such as tasks/events/modules/specs/previews/edits, and that can become the new durable source of truth. However, the old artifact workspace contract has not been fully mapped or replaced, and there is no documented compatibility layer that reconstructs old response/export inputs from Convex state. | Partial foundation only. | Decide canonical storage, implement artifact/response compatibility, persist failed/partial generation recovery data, prove preview/export reconstruction after restart, and verify old-session reload semantics. |
| 3 | Live Dashboard State And Preview Reloads | P0 | Preview edits, exports, and publishing now write some Convex generation events such as `preview_reload`, `export_ready`, and `published`. That restores a few important signals, but the rich dashboard event stream is not back. | Partial. | Restore typed task/log/OpenUI/homepage/site-spec/run-complete/timing/deployment events, replay historical events on reconnect, and browser-test refresh during generation and after failures. |
| 4 | Persistent Preview Editing And History Restore | P0 | The latest restoration added durable preview versions, edit records, history listing, restore-by-copy semantics, and `preview_reload` events. Text replacement safety and ZIP-adjacent tests were added. This is one of the strongest restored areas. | Partial / backend substantially restored. | AI rewrite and style-edit parity remain unproven, old endpoint/UI semantics need checking, browser reload/restore verification is missing, and language/script preservation for AI edits still needs coverage. |
| 5 | Export, Download, And Paywall Flow | P0 | HTML export now returns a ZIP instead of a raw/fragile response, and Convex records an `export_ready` event. The current ZIP contains `index.html` and `README.md`, which is a useful first step. | Partial / HTML ZIP only. | React/Next targets are unsupported, asset/metadata bundles are incomplete, source-hash cache invalidation is missing, free vs paid badge modes are not implemented, auth/ownership checks are absent, and subscription/credit entitlement is not connected. |
| 6 | Billing, Credits, And Checkout | P0 | No substantial restoration was verified. Some billing helper code and schema remnants exist, but the current export path hardcodes `requiresPayment: false`, so the revenue gate is not active. | Not done. | Restore Stripe/Razorpay checkout, webhooks, subscription status, credit balances/ledger, early adopter/credit-pack behavior, idempotency, entitlement decisions, and export credit consumption. |
| 7 | Chat-Based Site Refinement | P1 | Current chat stores user messages in Convex, but it does not create an assistant response, launch a refinement job, update site spec/OpenUI/preview HTML, or emit progress/reload events. | Not done beyond message storage. | Implement refinement jobs, assistant responses, preview version creation, event emission, failure handling, history persistence, and browser verification that chat changes the site and survives reload. |
| 8 | Auto-CMSify Generated Sites | P1 | Current CMS support is configuration storage, not first-party CMSification. There is no verified generated content contract, stable binding extraction, entries/revisions/assets/locales model, or render/export path based on edited CMS entries. | Not done. | Build schema/entry/revision/binding tables, extract contracts from site spec/OpenUI/HTML, add `data-cms` bindings, implement editor UI from schema, support revision restore, and render/export from `siteSpec + cmsEntries`. |
| 9 | Medusa Ecommerce Provisioning And Storefront Sync | P1 | Current commerce support stores backend/admin/storefront URLs and config JSON. It does not provision tenants, extract/sync products, expose storefront config, or proxy cart/checkout behavior. | Not done. | Restore Medusa provisioning/reuse, idempotent product extraction and sync, storefront config endpoint, cart routes, checkout proxy, admin embed config, and acceptance tests. |
| 10 | GitHub Push | P1 | No current equivalent to the old `POST /api/sessions/:id/github/push` route was verified. Export generation exists only for basic HTML ZIP download, not pushing generated files to GitHub. | Not done. | Add route/service, validate repo/branch/token, reuse export builder files, enforce owner/payment access, push files, and return commit/file-list metadata with tests. |
| 11 | Public Gallery, Recent Sessions, And Thumbnails | P1 | Public gallery querying appears partially present with public filtering and pagination-like arguments/response data. This is useful, but it is not full parity with old thumbnail/cache/recent-session behavior. | Partial. | Add stable item lookup, thumbnail extraction/cache/endpoint, full metadata including cost/readiness/preview details, homepage recent-session parity, pagination boundary tests, and private-session exclusion verification. |
| 12 | Deployment Registry And Public Preview URLs | P1 | `publishPreview` now creates or updates deployment records, normalizes/generates slugs, checks conflicts, and emits a deployment-related event. That covers part of the registry behavior. | Partial. | Verify/add public lookup by slug, deployment status route/query, idempotent republish behavior, deployed URL after dashboard reload, event replay, and browser acceptance tests. |
| 13 | Brand, Media, And Design Reference Helpers | P2 | Design reference capture/fingerprinting and a Pexels surface are partially present. Brandfetch/profile artifacts and full stock-image helper parity were not restored by the latest commit. | Partial. | Restore Brandfetch search/lookup, persist brand profiles, connect brand profile/design reference data into generation context, restore stock image browser helpers if still used, and test image/design-reference response shapes. |
| 14 | Localization And Indian-Language Flows | P2 | Preferred language is persisted on sessions and there are prior language-related commits in history, but the app-level translation endpoint, Indian-language detection/fallback, and inline rewrite language preservation were not fully verified. | Partial / unverified. | Trace language from UI to generation runner, restore prompt language options/endpoints where needed, verify generated copy language, preserve selected script in AI edits/chat refinements, and test Hex1/RunPod fallback if still supported. |
| 15 | SEO, AEO, And Public Metadata Outputs | P2 | Engine-level SEO/AEO helpers may still exist, but the restored export path currently writes only `index.html` and `README.md`. App/export metadata outputs are therefore not restored. | Not done in app/export layer. | Include `robots.txt`, `sitemap.xml`, `llms.txt`, SEO/AEO metadata in exports and public routes, add cache invalidation for these files, and test ZIP/public metadata contents. |
| 16 | Monitoring, Quota Alerts, And Usage Metrics | P2 | Generic generation events exist and admission checks can reject quota/rate-limit cases, but old operational monitoring, usage JSONL, timing/cost metrics, and Slack/Telegram alert behavior were not restored. | Not done. | Add metrics records, elapsed/cost/provider/error fields, quota/cache-hit observability, JSONL compatibility if needed, notification adapters with environment gates/idempotency, and tests for intended alert conditions. |
| 17 | QA And Verification Tooling | P2 | Focused unit tests were added for the restored admission/payload/preview/export pieces, but the old end-to-end verification scripts and browser-quality gates are still absent. | Not done. | Restore headed browser generation verifier, site-spec verifier, swiper policy verifier if still relevant, homepage quality gate, gallery verification, TestSprite/regression plan, package scripts, env docs, and full realistic local/browser runs. |

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

Status: reduced.

Current `publishPreview` creates a generated URL record in Convex, but the old deployment registry and deployment event behavior was broader.

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

## P2 - Restore Supporting Quality And Growth Surfaces

### 13. Brand, Media, And Design Reference Helpers

Status: app-level surfaces reduced.

Some engine internals still exist, but the old app had Brandfetch/Pexels/design reference support around session creation and editing.

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

### 14. Localization And Indian-Language Flows

Status: partially restored in later commits, but old app-level endpoints were removed.

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

### 15. SEO, AEO, And Public Metadata Outputs

Status: partially present in engine, old app-level outputs reduced.

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

### 16. Monitoring, Quota Alerts, And Usage Metrics

Status: removed/reduced.

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
