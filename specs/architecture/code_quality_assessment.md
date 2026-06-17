# Code Quality Assessment Report

Date: 2026-06-17 (local branch snapshot)
Repository: ship-fast
Mode: Full Assessment

## Repository Metrics Dashboard

- **Production Code**: 551,185 lines of TypeScript/JavaScript across app, Convex, packages, and scripts, excluding tests, generated `src/generated` files, local MACP vendor state, and old agent worktrees.
- **Test Code**: 192 test/spec files by raw repository scan; latest full coverage gate executed 176 configured Vitest test files.
- **Test Functions**: 1,204 static test declarations; the latest coverage gate executed 1,161 tests in the configured projects.
- **Documentation**: 2,461 lines across 59 Markdown files.
- **Specifications**: 93 lines across `docs/`; this assessment is the first `specs/architecture` artifact.
- **Dependencies**: 119 direct package dependencies including dev dependencies; heavy but normal for a broad TypeScript product/generation stack.
- **CI/CD**: GitHub Actions runs install, lint, typecheck, coverage-backed tests with enforced baseline thresholds, build, and bundle boundary verification.
- **Local Git Hooks**: Native `.githooks` are installed through `prepare`; pre-commit runs changed-file Prettier plus lint/typecheck and targeted changed tests, while pre-push now runs each full-QA gate explicitly for clearer failures.
- **File Size Distribution**: 248 non-generated source files exceed 500 LOC. `convex/sessions.ts` is 575 formatted LOC after Prettier, but it is now a registration/orchestration surface backed by extracted `convex/lib/session_*` helpers and a source-level boundary test that enforces helper delegation and sibling tests.

## Executive Summary

Ship Fast is an ambitious full-stack generation product with strong quality gates and a clear feature/module structure. The repo now has unusually good runtime/bundle guardrails for the OpenUI path, including response-scoped browser rendering, response-scoped standalone HTML export rendering, and explicit bundle verification. The deduction from an A+ / 11-out-of-10 state is not about basic correctness: it is about scale hygiene. Large source files, low current coverage, and full-catalog React/Next package export weight make future change risk higher than it needs to be.

**Key Strengths:**

- Full QA is enforced locally and in CI: lint, strict typecheck, tests, build, and bundle verification all run through `verify:qa` and `.github/workflows/ci.yml`.
- OpenUI runtime boundaries are now explicit and tested: `@ship-fast/blocks/runtime`, `@ship-fast/blocks/theme`, `@ship-fast/blocks/component-names`, generated runtime loaders, generated artifact provenance, HTML-only export routing, and `scripts/verify-build-bundles.ts` prevent broad runtime regressions.
- The codebase has recognizable ownership boundaries: `src/features`, `convex`, `packages/ship-fast-engine`, `packages/ship-fast-blocks`, and `packages/ship-fast-lakebed` each have distinct responsibilities.
- Tests cover recurring regression surfaces such as Convex sessions, billing, generation, export entitlement, OpenUI preprocessing, bundle boundaries, and dashboard behaviors.

**Areas for Improvement:**

- `convex/sessions.ts` is no longer under a raw formatted 500-line ceiling, but it is now a registration/orchestration surface with session edit, create-edit mutation orchestration, ownership/read/write/theme, prompt, create-admission/cache/quota, create mutation orchestration, chat-history/chat-refinement mutation, fork orchestration, complete-generation action orchestration, deployment, export, gallery, preview-history, serialization, Agentation, operational notification, commerce/Medusa, usage metrics, CMS, task, generated artifact/cache, event-stream, workspace, readiness, public-preview, internal-reference, and shared validator layers split into focused helpers with direct tests.
- The block/capsule catalog has many 1,000+ LOC files; generated export/runtime artifacts now have a deterministic provenance lock and drift verifier, and production source capsules now have a checked origin-classification manifest. The remaining work is reducing or splitting the 184 large source-capsule files and resolving 34 unmarked origins.
- Coverage is now enforced through Vitest/V8 thresholds, but the current measured baseline is still low: 23.43% statements, 15.70% branches, 11.29% functions, and 23.00% lines in the latest full coverage gate.
- Local git hooks now enforce authoring-time checks before commit and full QA before push.
- GitNexus impact analysis is available again after rebuilding the local index with the project runner; keep the runner version aligned with the MCP reader to avoid storage-version drift.

**Overall Rating: A (10.75/10).** The codebase is production-capable and improving quickly, but the deduction from A+ is for scale-risk controls that are not yet complete: low absolute coverage despite enforced thresholds, remaining large-file decomposition, and unmarked source-capsule origins that are now tracked mechanically.

---

## Detailed Subsystem Analysis

### Application Shell & Feature Modules (`src/`) ★★★★☆

**Strengths:**

- Feature modules are grouped by product area (`dashboard`, `exports`, `generation`, `home`, `session`, `editing`, `billing`, `admin`), which keeps route modules from owning all behavior.
- The OpenUI island now imports from lightweight runtime subpaths and was verified in a headed browser generation flow.

**Concerns:**

- `src/features/dashboard/components/Dashboard.tsx` is 1,753 LOC after the generation-launch handoff extraction, indicating the dashboard shell still mixes preview controls, rails, state transitions, and interaction panels in one component.

### Convex Backend (`convex/`) ★★★★☆

**Strengths:**

- Convex behavior has broad regression tests across sessions, billing, CMS, deployment, usage metrics, and entitlement paths.
- Session edit mechanics now live in focused helper modules: `convex/lib/session_edit_helpers.ts` for pure HTML edits and `convex/lib/session_edit_mutation_helpers.ts` for preview/artifact mutation orchestration, including create-edit session lookup, authorization, and mutation delegation.
- Session ownership helpers now live in `convex/lib/session_access_helpers.ts`, with focused tests for SHA-256 owner-secret hashing, authenticated identity resolution, anonymous ownership, private-read rejection, owner-scoped session deletion by authenticated or anonymous client identity, anonymous-session claiming success/failure modes, theme override mutation behavior, and public mutation delegation.
- Prompt/request validation helpers now live in `convex/lib/session_prompt_helpers.ts`, with focused tests for cache-key normalization, gibberish detection, content-policy blocking, HTTPS URL normalization, and fingerprint stability.
- Session creation admission helpers now live in `convex/lib/session_creation_helpers.ts`, with focused tests for environment bypass detection, bounded prompt-cache lookup, workspace idempotency/conflict rejection, short-window rate limiting, anonymous/free/paid quota behavior, disabled-limit bypass, and create-mutation delegation.
- Session create orchestration now also lives in `convex/lib/session_creation_helpers.ts`, with focused tests for normalized queued-session insertion, homepage-task/event creation, default deployment slug reservation, generation scheduling with anonymous ownership, model-configuration failure patching, and public mutation delegation.
- Session chat mutation helpers now live in `convex/lib/session_chat_helpers.ts`, with focused tests for durable chat refinement writes, generated module/site-spec patching, chat/edit/event persistence, empty-message rejection, missing-preview rejection, and public mutation delegation.
- Session fork helpers now live in `convex/lib/session_fork_helpers.ts`, with focused tests for signed-in fallback preview forks, text-edit replay, anonymous owner rejection, missing-source rejection, missing-preview rejection, and public mutation delegation.
- Commerce and Medusa helpers now live in `convex/lib/session_commerce_helpers.ts`, with focused tests for owned config create/update/read, ownership rejection, Medusa tenant provisioning, product-count sync, missing-config failure, and session-handler delegation.
- Deployment helpers now live in `convex/lib/session_deployment_helpers.ts`, with focused tests for slug normalization, default slug construction, fallback behavior, public deployment URL generation, publish insert/update behavior, lifecycle event recording, private/not-ready/missing-preview/slug-conflict rejection, deployment-by-slug session metadata, missing deployment/session fallback, deployment status lookup, and public mutation delegation.
- Session serialization helpers now live in `convex/lib/session_serialization_helpers.ts`, with focused tests for legacy status fallback, anonymous claimability, explicit field preservation, engine task status mapping, and dashboard task-key compatibility.
- Agentation sync and annotation mutation helpers now live in `convex/lib/session_agentation_helpers.ts`, with focused tests for annotation listing/serialization, public query delegation, public annotation create/upsert behavior, `saveAgentationSession` ownership enforcement, session-key parsing, legacy sync compatibility, explicit key matching, invalid/not-found/forbidden failures, sync upsert/update/delete behavior, owned annotation deletion by Convex id, Agentation-id deletion/idempotency, ownership rejection, clear-all behavior, and public mutation delegation.
- Operational notification helpers now live in `convex/lib/session_operational_notifications.ts`, with focused tests for alert classification, message formatting, Slack and Telegram adapter sends/skips, aggregate adapter gating, scheduler gating, generation-event recording, usage metric fallbacks, missing-session failures, and session-action delegation.
- Usage metrics helpers now live in `convex/lib/session_usage_metrics_helpers.ts`, with focused tests for metric insertion payloads, provider/event aggregation, bounded session reads, user timestamp filtering, and public function delegation.
- CMS config/binding/read/mutation/internal maintenance helpers now live in `convex/lib/session_cms_binding_helpers.ts`, with focused tests for config create/update/read, config ownership rejection, generated HTML seeding, site-spec field deduplication, existing binding/entry reuse, empty-content handling, bounded entry reads, binding-entry content joins, revision ownership guards, newest-first revision serialization, content upsert creation, existing-entry revisioning, revision restore writes, internal binding insertion, internal entry update/revisioning, internal revision restore, bounded raw revision reads, and public/internal function delegation.
- Task upsert helpers now live in `convex/lib/session_task_helpers.ts`, with focused tests for task insert/update behavior, homepage key normalization, and engine-status mapping.
- Generated artifact/cache helpers now live in `convex/lib/session_artifact_helpers.ts`, with focused tests for site-spec persistence, generated home-module insert/update/skip behavior, prompt-cache artifact cloning, fallback task creation, operational event recording, and target-session readiness patching.
- Export helpers now live in `convex/lib/session_export_helpers.ts`, with focused tests for target file counts, export-record loading, missing export fallback, export creation/update behavior, ready/current-preview reuse, not-ready/artifact-missing rejection, owned download payloads, payment-required download metadata, GitHub-push authorization/staleness/payment failures, anonymous payment requirements, subscription entitlement, credit consumption, ledger writes, and no-credit payment-required behavior.
- Public gallery session helpers now live in `convex/lib/session_gallery_helpers.ts`, with focused tests for artifact loading, public list pagination/search/category filtering, visible/public-only filtering, detail lookup rejection, list/detail serialization differences, legacy site-spec fallback behavior, stored-preview readiness fallback, and category derivation.
- Preview-history helpers now live in `convex/lib/session_preview_history_helpers.ts`, with focused tests for client serialization, preview-history listing, edit-history listing, artifact activation during restores, generation-event insertion, session version patching, public query/mutation delegation, owned restore success, missing-session rejection, mutation-ownership rejection, missing-preview rejection, and fallback behavior when restored artifacts are absent.
- Generation-state helpers now live in `convex/lib/session_generation_state_helpers.ts`, with focused tests for completion writes, task/artifact persistence, usage metrics, operational scheduling, failure events, session failure patches, and late-failure skip behavior once a preview exists.
- Generation action helpers now live in `convex/lib/session_generation_action_helpers.ts`, with focused tests for missing-session rejection, existing-preview skip behavior, OpenUI SSR pre-rendering, CMS-annotated HTML render bypass, renderer-failure fallback to handoff HTML, and internal mutation delegation.
- Generation-progress helpers now live in `convex/lib/session_generation_progress_helpers.ts`, with focused tests for start gating, homepage task insertion, progress event insertion, generated-module upsert semantics, stale error clearing, and status-event session advancement.
- Generation-view helpers now live in `convex/lib/session_generation_view_helpers.ts`, with focused tests for direct/export/deployment lookup resolution, serialized view assembly, task ordering, event ordering, artifact loading, and null fallbacks.
- Event-stream helpers now live in `convex/lib/session_event_stream_helpers.ts`, with focused tests for limit clamping, cursor filtering, ordered events, empty cursor responses, missing-session fallbacks, and private anonymous-owner access checks.
- Session API response helpers now live in `convex/lib/session_api_response_helpers.ts`, with focused tests for task sorting, completion counts, export targets, deployment fallback, integration flags, row loading, and missing-session fallbacks.
- Workspace helpers now live in `convex/lib/session_workspace_helpers.ts`, with focused tests for serialized workspace state, task ordering, latest preview selection, deployment inclusion, event ordering, and deleted-session fallback.
- Readiness helpers now live in `convex/lib/session_readiness_helpers.ts`, with focused tests for status/task/preview/site-spec/OpenUI readiness computation and a public `api.sessions.getSessionReadiness` Convex regression test.
- Public-preview helpers now live in `convex/lib/session_public_preview_helpers.ts`, with focused tests for direct session lookup, deployment slug lookup pinned to a preview version, private/missing-session rejection, and empty-preview metadata fallback.
- Convex same-file internal references now use the narrow adapter in `convex/lib/session_internal_references.ts`, replacing the previous broad untyped internal escape hatch in `convex/sessions.ts`.
- The warp canvas animation controller is directly unit-tested for canvas sizing, frame scheduling, draw calls, and cleanup behavior, adding coverage to a formerly untested frontend hook path.
- The image-hints media hydration engine now has focused tests for media-hint merging, trusted stock URL normalization, generated-media polishing, `data-img` hydration, storefront slot hydration, trusted-stock eager marking, responsive hero CSS injection, approved image/video realignment, and live resolver behavior with mocked Pexels/Unsplash provider filtering, health probes, prompt-block output, and progress events. `packages/ship-fast-engine/src/pipeline/image-hints.js` rose to 66.98% line coverage from 4.33%.
- GenUI homepage orchestration now has focused failure-path tests that assert hard planner failures surface immediately instead of falling back to placeholders, and that fallback planning fails the run when every generated module fails. `packages/ship-fast-engine/src/genui/orchestrator.ts` rose to 53.25% line coverage from 48.98%.
- The brand-profile enrichment path now has focused tests for prompt brand detection, the verified Brandfetch fast path, explicit-site scraping for metadata/logo/contact/social signals, and unverified fallback profile persistence. `packages/ship-fast-engine/src/pipeline/brand-profile.js` rose to 76.15% line coverage from 4.06%.
- Renderer shared utilities now have focused tests for route helpers, exact-clone bundle slimming, language font markup, README generation, ecommerce navigation, hero/FAQ/CTA/form/footer/product sections, generic/pricing/testimonial/stat sections, exact-clone runtime/component strings, HTML runtime scripts, motion modules, and global CSS token output. `packages/ship-fast-engine/src/renderers/shared.js` rose to 84.83% line coverage from 0%.
- Clone crawler behavior now has focused tests for URL normalization, same-domain crawling, redirect graph edges, external-link exclusion, duplicate-body collapse, failed-fetch page-cap release, and pre-aborted crawl no-op behavior. `packages/ship-fast-engine/src/clone/crawler.ts` rose to 82.44% line coverage from 2.65%.
- Clone fallback behavior now has focused tests for DOM content extraction, coverage/duplication/hallucination scoring, dense native fallback generation, and canned-copy fallback behavior. `packages/ship-fast-engine/src/clone/fallback.ts` rose to 90.99% line coverage from 0.94%.
- Clone token extraction now has focused tests for CSS color normalization, foreground contrast fallback, brand color selection, concrete font detection, dominant radius/gap extraction, serif detection, and theme variable mapping. `packages/ship-fast-engine/src/clone/tokens.ts` rose to 96.35% line coverage from 1.45%.
- Clone SSRF URL guarding now has focused tests for scheme validation, unparseable URL rejection, localhost/metadata/unspecified host blocking, private IPv4/IPv6 literal blocking, public IP allowance, DNS failure/no-record handling, mixed private/public DNS rejection, and public DNS allowance. `packages/ship-fast-engine/src/clone/security.ts` rose to 95.58% line coverage from 1.47%.
- Site-spec normalization now has configured Vitest coverage for the existing normalize tests plus focused tests for heuristic business-profile inference, profile fallback normalization, HTML render-blueprint extraction, workspace blueprint enrichment, and blueprint stripping. `packages/ship-fast-engine/src/spec/normalize.js` rose to 64.91% line coverage from 0%, `business-profile.js` rose to 81.96% from 0%, and `blueprints.js` rose to 83.33% from 0%.
- Site-spec fallback and validation now have focused tests for fallback page generation across ecommerce/institutional/dashboard variants, URL normalization, validation error reporting, collapsed-page supplementation, and homepage prompt-slice serialization. `packages/ship-fast-engine/src/spec/defaults.js` rose to 90.44% line coverage, `validate.js` to 95.55%, `supplement-pages.js` to 100%, and `homepage-spec-slice.js` to 100%; the pass also fixed explicit non-HTTP `site_url` inputs being converted into malformed HTTPS hosts.
- LLM boundary helpers now have enforced Vitest coverage for text/fence/reasoning cleanup, pricing/TPS formatting, retry behavior, Groq/OpenAI-compatible request assembly, Ollama cloud routing, synthesized stream callbacks, parallel request defaults, and existing translation quality loops. `packages/ship-fast-engine/src/llm/utils.js` rose to 97.22% line coverage, `retry.js` to 100%, `groq.js` to 100%, and `translator.js` to 88.11%.
- Billing payment decisions now have focused tests for country/header resolution, anonymous download denial, subscription-backed export access, credit-backed export access, request-level export target decoration, and Stripe session payment details with credit packs/quota/unlock state. `src/billing/payments.ts` rose to 67.20% line coverage and 64.23% branch coverage.
- Stock image resolution now has focused tests for Pexels request assembly and size selection, Pexels-to-Unsplash fallback, Unsplash size clamping, deterministic Picsum fallback, provider warning behavior, and query/dimension caching. `src/lib/stock-image.ts` rose to 95.00% line coverage, 100% function coverage, and 64.06% branch coverage.

**Concerns:**

- `convex/sessions.ts` is still a dense Convex API registration surface where future edits should keep helper logic outside the registration file.

### Generation Engine (`packages/ship-fast-engine/`) ★★★★☆

**Strengths:**

- The engine has dedicated modules for pipeline phases, rendering, clone conversion, validation, and fallback behavior.
- SSR crash tests and pipeline tests cover important generation failure modes.

**Concerns:**

- Core OpenUI SSR and standalone HTML export rendering now load response-scoped runtime libraries through `@ship-fast/blocks/runtime`, but React/Next export generation still needs the full catalog/source manifest and continues to emit large OpenUI server chunks.

### OpenUI Blocks (`packages/ship-fast-blocks/`) ★★★★☆

**Strengths:**

- Browser runtime concerns are now split into runtime, theme, generated metadata, and component-name subpaths with source-level tests preventing accidental eager imports.
- Bundle verification rejects public eager capsule indexes and broad OpenUI runtime chunks.
- Generated OpenUI export/runtime artifacts now include `react-export-sources.provenance.json`, recording the generator, source roots, output files, and 1,192 input component source files; `verify:generated` checks the provenance lock together with the generated manifests.
- Source capsules now include `source-classification.json`, recording 375 production capsule files, 341 marked Kimi/generated ports, 34 unmarked source files, 184 files over 1,000 LOC, and the current max file size of 1,839 LOC; `verify:capsule-sources` checks the manifest.

**Concerns:**

- Many capsule files exceed 1,000 LOC. Source capsule origins are now classified mechanically, but 34 files remain unmarked and 184 source capsule files still exceed the 1,000 LOC large-file threshold.

### Export & Deployment (`src/features/exports`, routes, renderer services) ★★★★☆

**Strengths:**

- Export routes defer heavy export-builder loading until entitlement/session checks pass.
- Standalone HTML downloads now route through `openui-html-export-builder`, which uses `loadOpenUIRuntimeLibrary` instead of the full block barrel/source manifest.
- Bundle budgets explicitly cap export-builder, HTML export-builder, and router chunk growth.

**Concerns:**

- React/Next package generation still imports the full block library and compressed source manifest so downloadable app exports can materialize components.

## Testing & Quality Infrastructure ★★★★☆

**Strengths:**

- The latest full coverage gate passed with measured V8 coverage of 23.43% statements, 15.70% branches, 11.29% functions, and 23.00% lines.
- Lakebed browser auth now has focused coverage for current and legacy stored identities, decoded Google token claims, Google callback exchange/persistence, PKCE sign-in URL creation, unsafe return-route filtering, and sign-out; `packages/ship-fast-lakebed/src/auth.tsx` rose from 25.80% to 86.02% line coverage.
- `verify:qa` now runs Vitest with V8 coverage thresholds before build and bundle verification; CI uses the same coverage-backed test command.
- Source-level invariant tests protect architecture boundaries that ordinary behavior tests would miss.

**Concerns:**

- Coverage thresholds are enforced at the latest measured baseline, but the absolute baseline is intentionally conservative and should continue rising as focused tests land.

## Local Hooks & CI Pipeline ★★★★★

**Strengths:**

- CI is simple and strict: install, lint, typecheck, coverage-backed tests, build, bundle verifier.
- Local `.githooks` are activated by `prepare`; pre-commit runs changed-file Prettier, lint, typecheck, and changed test files, while pre-push runs `verify:qa`.
- Bundle verification is first-class and catches performance regressions that normal tests miss.

**Concerns:**

- Coverage thresholding is now present and ratcheted to the latest measured gate, but the absolute floors remain low and need continued ratcheting once higher-value paths are covered.

## Documentation & Specifications ★★★☆☆

**Strengths:**

- `codemap.md`, AGENTS instructions, and runbooks capture important operational context.

**Concerns:**

- Architecture and quality status were not previously persisted under `specs/architecture`, so recurring quality decisions depended on conversation memory instead of versioned artifacts.

---

## Refactoring Recommendations by Priority

### Priority 1: High Impact / Low Risk

#### 1.1 Keep `convex/sessions.ts` Below the Coordination Ceiling

- **What**: Keep the extraction boundary intact as new Convex session behavior lands: registrations may stay in `convex/sessions.ts`, but validation, access control, orchestration, and serialization should continue living in focused helper modules with sibling tests.
- **Risk**: Low to Medium — behavior can be preserved with existing Convex tests.
- **Impact**: Reduces backend change risk in the largest hand-authored file.

#### 1.2 Ratchet Coverage Thresholds Above Baseline

- **What**: Raise the enforced V8 coverage thresholds in `vitest.config.ts` as focused tests land for Convex session flows, dashboard behavior, and export/server rendering paths.
- **Risk**: Low to Medium — thresholds need careful ratcheting to avoid blocking unrelated work.
- **Impact**: Converts the new baseline gate into a meaningful quality ratchet rather than a static floor.

### Priority 2: Medium Impact / Medium Risk

#### 2.1 Keep Full-Catalog OpenUI Exports Behind App Targets

- **What**: Preserve the new split where `target=html` imports `openui-html-export-builder` and React/Next app targets import `openui-export-builder`; keep bundle verification rejecting full-catalog package internals inside the HTML export chunk.
- **Risk**: Low to Medium — future export refactors could accidentally recombine the paths without source and bundle guardrails.
- **Impact**: Keeps standalone HTML downloads response-scoped while preserving React/Next ZIP generation.

#### 2.2 Normalize Capsule Generation Provenance

- **What**: Continue the new generated-artifact provenance pattern into the remaining capsule/catalog maintenance surface. `react-export-sources.provenance.json` now records generated artifact inputs/outputs, and `source-classification.json` now records source-capsule origin classes. The remaining work is resolving the 34 unmarked source files and splitting or generating smaller modules for the 184 files over 1,000 LOC.
- **Risk**: Medium — depends on how much catalog content is intentionally hand-edited.
- **Impact**: Keeps capsule provenance explicit and turns future source-capsule drift into a verifier failure instead of a conversation-memory problem.

### Priority 3: Strategic / Long-Term

#### 3.1 Keep GitNexus Runner/MCP Versions Aligned

- **What**: Prefer `node .gitnexus/run.cjs analyze --force` for local rebuilds and avoid mixing newer `npx gitnexus` index writers with an older MCP reader.
- **Risk**: Low — tooling-only.
- **Impact**: Prevents future LadybugDB storage-version drift from disabling required impact analysis.

#### 3.2 Add Architecture Drift Checks

- **What**: Expand source-level invariant tests for import boundaries, route ownership, and heavy dependency isolation.
- **Risk**: Low to Medium — false positives need careful tuning.
- **Impact**: Keeps the repo’s architecture from regressing as feature velocity continues.

---

## Summary

Ship Fast is already well above average for a fast-moving TypeScript generation product: it has strong local hooks and CI, real bundle guardrails, a modular product layout, restored graph impact analysis, enforced coverage thresholds in the main QA path, the largest Convex coordination file is now delegated to focused helper modules, standalone HTML exports are split from full-catalog package exports, and generated OpenUI export/runtime artifacts plus source capsules now have deterministic provenance/classification. The path from 10.75/10 to a credible 11/10 is now clear: keep `convex/sessions.ts` as a thin registration surface, raise coverage thresholds area by area, keep GitNexus version alignment stable, resolve the 34 unmarked capsule origins, and reduce the 184 large source-capsule files.

**Overall Rating: A (10.75/10).** The deduction from A+ is for low absolute coverage, remaining large-file decomposition, and unmarked source-capsule origins that remain measurable and tractable.
