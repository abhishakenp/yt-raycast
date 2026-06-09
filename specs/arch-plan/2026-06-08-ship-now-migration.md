# Architecture Plan: Ship Now Feature Migration

Status: approved-for-execution

Plan owner: Codex
Self-approval: accepted for autonomous execution after current-generation recovery was verified on June 8, 2026.

## Goal

Migrate the useful product logic from `~/Documents/ship-now` into this `ship-fast` repository while preserving `ship-fast` history, visual direction, generation reliability, and existing deployment/session features.

## Context

`ship-fast` is currently a Bun/Express app with browser-script islands, filesystem-backed sessions, OpenUI SSR, SSE/WebSocket streaming, public gallery, exports, CMS/Medusa provisioning, preview tools, billing/auth, and the launch homepage. `ship-now` drifted into a React/TanStack Router + Convex + Clerk prototype that restored generation, inline editing, AI text rewrite, TopBar controls, image relevance helpers, and Agentation annotation persistence.

The right migration is not to replace `ship-fast` wholesale. The right migration is to preserve the working `ship-fast` engine and UI shell, introduce a React/TanStack Start application shell behind compatibility adapters, and port `ship-now` feature domains one at a time with real verification after each boundary.

### References

- Goal spec: user request in this thread on June 8, 2026.
- Current `ship-fast` generation proof: generated sessions `d97e95c80433`, `295b46224cc3`, and `636558e3ba83` render directly in headed Brave.
- Current post-recovery generation proof: generated sessions `b92c55c214e0`, `7d4eae245118`, and `a3a3b40ca7ba` render in headed Brave with populated `/preview/:sessionId` iframes and final dashboard status. The final live proof `a3a3b40ca7ba` reached `Project generated in 91.6s` through the homepage submit path.
- `ship-fast` code explored: `src/server/index.js`, `src/server/sessions.js`, `src/scripts/homepage.ts`, `src/scripts/home-session-embed.ts`, `src/scripts/preview-editor/*`, `packages/ship-fast-engine/src/*`, `packages/ship-fast-blocks/src/*`.
- `ship-now` code explored: `src/routes/index.tsx`, `src/routes/generate.$sessionId.tsx`, `src/components/GenUI/TopBar.tsx`, `src/components/GenUI/AgentationSessionBridge.tsx`, `src/hooks/use-text-edit.ts`, `src/hooks/use-ai-text-edit.ts`, `src/routes/api.rewrite.tsx`, `src/lib/stock-image.ts`, `src/lib/stock-image-browser.ts`, `src/lib/image-query.ts`, `src/lib/img.tsx`, `convex/schema.ts`, `convex/genui.ts`, `convex/sessions.ts`, `convex/agentation.ts`.
- `ship-now` history checked: `f07345c`, `c52cc6e`, `7d96bda`, `c685467`, `8c4cc7d`, `23c1b76`, `bd4f982`, `f1ddba9`, `94e35b9`, `de2d0ee`, `087e2a8`, `74d8887`, `2fda5b2`, `8447006`, `f59cac0`.
- TanStack Start docs checked from official docs: `https://tanstack.com/start/latest/docs/framework/react/overview`, `https://tanstack.com/start/latest/docs/framework/react/quick-start`, `https://tanstack.com/start/latest/docs/framework/react/guide/server-functions`, `https://tanstack.com/start/latest/docs/framework/react/guide/server-routes`, and `https://tanstack.com/start/latest/docs/framework/react/guide/hosting`. Context7 was attempted first but unavailable due an invalid API key.

### Constraints

- Keep the `ship-fast` git repository and history as the source of truth.
- Preserve the current homepage UI direction, including the rocket asset and frosted gallery/footer treatment.
- Do not remove existing `ship-fast` capabilities: public gallery, preview tools, OpenUI preview, exports, CMS/Sanity, Medusa, billing, auth, deployment, GitHub push, and session history.
- Generation must be verified through the real user path with headed Brave/agent-browser, plus direct session URL checks.
- Framework migration cannot block generation. The engine must remain callable while shell migration proceeds.
- `ship-now` uses Convex IDs and live queries; `ship-fast` uses short filesystem session IDs. A compatibility layer is mandatory before any UI route is swapped.
- Current `ship-fast` React/Next export targets report unsupported in the vanilla project; migration must either implement those targets or stop advertising them as ready.
- Sanity provisioning can return external 429s; verification must distinguish generation failure from external CMS quota failure.

### Assumptions

- **ASM-001**: TanStack Start should be introduced as the React shell target, not plain TanStack Router only. **Why:** the goal explicitly anticipates React TanStack Start, and Start gives file routing plus server-side boundaries that can replace Express routes incrementally. Confidence: HIGH.
- **ASM-002**: The `ship-fast` engine remains the canonical generator during migration. **Why:** it currently generates and renders sessions locally; replacing it with the older `ship-now` Convex action path would regress existing exports/CMS/deploy integrations. Confidence: HIGH.
- **ASM-003**: Convex should first be modeled as an optional persistence adapter, not immediately required for all sessions. **Why:** `ship-fast` already has filesystem sessions and anonymous access; forcing Convex first would create a risky data migration before feature parity. Confidence: HIGH.
- **ASM-004**: Agentation can be ported with a storage interface independent of Convex. **Why:** `ship-now` isolates most Agentation UI in `AgentationSessionBridge` and persistence in `convex/agentation.ts`. Confidence: MEDIUM.
- **ASM-005**: Existing `ship-fast` preview editor should be reconciled with `ship-now` inline text editing rather than replaced. **Why:** `ship-fast` already has preview tools and AI/style endpoints; `ship-now` provides a simpler generated-program override workflow. Confidence: HIGH.

### Open Questions

- **OQ-001**: Should Convex become production storage, or remain an optional realtime layer over filesystem/session storage? **Impact:** changes deployment, auth, backup, and migration strategy.
- **OQ-002**: Which auth model should win: current `ship-fast` Firebase/payment auth or `ship-now` Clerk + Convex auth? **Impact:** affects session ownership, anonymous claims, billing, and Agentation access.
- **OQ-003**: Is Agentation expected for anonymous users in production or only local/authenticated sessions? **Impact:** changes permissions and persistence validation.
- **OQ-004**: Should React/Next exports be implemented during the TanStack migration, or hidden until supported? **Impact:** affects export UI and acceptance tests.

## Components

### App Shell (`src/app/` or `app/`)

**Responsibility:** Own React/TanStack Start routes, layouts, providers, and client navigation while preserving the `ship-fast` homepage/dashboard visual language.

**Boundaries:**
- Exposes: typed routes for home, session dashboard, preview, pricing/legal, API/server functions where appropriate.
- Depends on: Session Domain API, Generation Orchestrator, Auth adapter, Asset/preview services.

**Key decisions:**
- Use adapter-first route parity: every migrated route must proxy or call the existing `ship-fast` API contract before replacing it.
- Keep the current homepage as the first migrated route only after the generation submit path is stable.

### Session Domain (`src/session-domain/`)

**Responsibility:** Provide a storage-neutral session model that can read/write both `ship-fast` filesystem sessions and future Convex records.

**Boundaries:**
- Exposes: create, get, list, claim, update readiness, save program override, save preview history, get generated modules/pages.
- Depends on: filesystem session repository initially; optional Convex repository later.

**Key decisions:**
- Canonical ID remains the existing `ship-fast` short session ID until a deliberate data migration is complete.
- Convex `Id<"sessions">` must never leak into engine or public URL contracts without an alias table.

### Generation Orchestrator (`packages/ship-fast-engine`, `src/server/index.js` during transition)

**Responsibility:** Generate site spec, OpenUI source, preview HTML, exports, CMS setup hooks, and stream progress.

**Boundaries:**
- Exposes: `startGeneration(sessionId, prompt, options)`, event stream, readiness signals, render/repair utilities.
- Depends on: LLM config, OpenUI blocks, image resolver, session domain, export services.

**Key decisions:**
- Keep the current engine. Port `ship-now` fixes into this engine only when they generalize, especially image relevance and module status handling.
- Add defensive SSR contract tests for generated components: generated partial props must not throw.

### Generated Site Preview (`src/session-ui/preview/`)

**Responsibility:** Render generated OpenUI content, stream updates, show loading/error states, and expose editing/annotation affordances.

**Boundaries:**
- Exposes: preview iframe/direct renderer, selected element bridge, edit mode, AI edit mode, Agentation toggle.
- Depends on: Session Domain, OpenUI renderer, preview tools, Agentation adapter.

**Key decisions:**
- Preserve `ship-fast` preview iframe/tools for deployment/export parity.
- Port `ship-now` DirectPreview and TopBar concepts into the existing dashboard shell only after proving no overlap with `src/scripts/preview-tools/*`.

### Inline Editing Domain (`src/editing/`)

**Responsibility:** Support manual text edits, AI text rewrite, save/revert, and persistence across reload.

**Boundaries:**
- Exposes: select text, replace in OpenUI program/source, preview change, save override, restore original.
- Depends on: Session Domain, AI rewrite endpoint, OpenUI parser/renderer.

**Key decisions:**
- Store edits as source/program overrides and checkpoint entries, not only DOM patches.
- Keep edit APIs idempotent and reload-proof.

### Agentation Adapter (`src/agentation/`)

**Responsibility:** Integrate `agentation@3.0.2` UI and persist annotations against a `ship-fast` session.

**Boundaries:**
- Exposes: enable/disable Agentation, list/upsert/delete/clear annotations, session key builder.
- Depends on: Session Domain storage, optional Convex persistence, client bridge.

**Key decisions:**
- Port `ship-now` annotation schema, but implement storage through a repository interface so Convex is not a hard prerequisite.
- Anonymous sessions are allowed if they have the existing `anonOwnerSecret` or local session ownership proof.

### Image Relevance Service (`src/images/`)

**Responsibility:** Resolve generated-image alt text and prompt intent into relevant stock/generated imagery.

**Boundaries:**
- Exposes: `resolveImage({ prompt, alt, siteType, section })`.
- Depends on: existing `ship-fast` image hints plus `ship-now` stock image browser/query helpers.

**Key decisions:**
- Merge generic relevance heuristics, not one-off vertical rules.
- Cache by normalized query and attribution data.

### Auth/Billing Adapter (`src/auth-adapter/`)

**Responsibility:** Hide Firebase/Clerk/anonymous differences from app routes and session actions.

**Boundaries:**
- Exposes: current user, ownership check, anonymous ownership secret, billing tier/quota.
- Depends on: current `ship-fast` auth first; Clerk only if explicitly selected after spike.

**Key decisions:**
- Keep current `ship-fast` billing and quota logic unless a scoped auth migration is approved after parity.

## Interfaces

### App Shell -> Session Domain

**Contract:** typed session DTO: `{ id, prompt, createdAt, owner, homepageReady, siteSpecReady, openuiReady, status, theme, programOverride, exportTargets, deployment, agentation }`.
**Direction:** routes/components call domain services; services hide filesystem/Convex.
**Invariants:** IDs are stable, anonymous sessions remain claimable, readiness flags match actual artifacts.

### Session Domain -> Generation Orchestrator

**Contract:** generation request: `{ sessionId, prompt, preferredLanguage, designReferences, exportTarget, authContext }`; event stream emits status/module/openui/export/readiness events.
**Direction:** session creation calls generation start; orchestrator writes artifacts through session repository.
**Invariants:** generation start never requires a browser tab; generated artifacts can render directly from URL.

### Preview -> Inline Editing Domain

**Contract:** selected text/edit request: `{ sessionId, route, oldText, newText | instruction, selectionMeta }`.
**Direction:** preview emits selection/change; editing domain returns patched source/program and save status.
**Invariants:** saved edits survive reload and are included in export/preview.

### Preview -> Agentation Adapter

**Contract:** annotation payload compatible with `agentation` plus `sessionId`, `agentationSessionId`, status fields, and thread metadata.
**Direction:** client bridge emits annotation mutations; adapter persists and rehydrates.
**Invariants:** disabling Agentation hides UI but does not delete annotations.

### Image Relevance Service -> Generation Orchestrator

**Contract:** image candidates with URL, alt, source, dimensions, attribution, and confidence.
**Direction:** orchestrator asks service for candidates while rendering/repairing pages.
**Invariants:** image choice must be generic and prompt-aware, never hardcoded per demo slug.

## Data Flow

```text
Homepage prompt
  -> App Shell submit route/action
  -> Session Domain create(session)
  -> Generation Orchestrator start(sessionId)
  -> Session Domain artifact writes + event stream
  -> Session Dashboard route
  -> Preview renderer
  -> Inline Editing / Agentation / Export / Deploy
```

```text
Inline text selection
  -> Preview selection bridge
  -> Editing Domain patch source/program
  -> Session Domain save override + checkpoint
  -> Preview re-render
  -> Export uses override
```

```text
Agentation toggle
  -> TopBar control
  -> Agentation Adapter enable(sessionId)
  -> Dynamic import agentation
  -> Annotation add/update/delete
  -> Session Domain annotation repository
  -> Rehydrate annotation count on reload
```

## Cross-Cutting Concerns

| Concern | Approach |
|---------|----------|
| Error handling | Generation failures become session status and visible dashboard errors. SSR component failures become test failures and fallback HTML only as a last resort. |
| Observability | Preserve existing server logs, generation monitoring, SSE/WebSocket events; add route-level logs for Start server functions. |
| Configuration | Keep Doppler/env based config. Add TanStack/Convex/Clerk env only behind explicit feature flags. |
| Testing | Unit-test session adapters and SSR contracts; browser-test homepage submit, direct session URL, inline edit persistence, Agentation toggle, export/deploy routes. |
| Migration safety | One feature flag per migrated route/domain; old Express route remains callable until equivalent Start route passes. |
| Security | Ownership checks stay server-side. Anonymous write actions require session secret or local anonymous proof. |
| Performance | Do not move large generated payloads into client route state; stream/read from server or storage. |

## Decomposition

### Scope 1: Current Generation Stabilization

**Component(s):** Generation Orchestrator, OpenUI blocks, homepage submit scripts.
**Boundary:** Fix current blocking generation paths and add regression tests for SSR partial-prop tolerance and homepage navigation. Out of scope: framework migration.
**Done when:** A real homepage prompt in headed Brave reaches a session dashboard without `about:blank`; direct session URL renders; generated sessions for portfolio, consulting, bakery, wellness, SaaS, and commerce prompts have no `openui-error`; `bun run build:scripts` and focused tests pass.
**Depends on:** none.

### Scope 2: Ship Now Feature Inventory and Diff Map

**Component(s):** migration docs, source inventory.
**Boundary:** Produce a file-by-file map from `ship-now` features to `ship-fast` target domains. Out of scope: code porting.
**Done when:** Each `ship-now` feature commit from `8447006` through `f07345c` is classified as port, ignore, or already-present, with target files and risks.
**Depends on:** none.

### Scope 3: TanStack Start Shell Spike

**Component(s):** App Shell.
**Boundary:** Add a minimal Start/Vite React shell alongside Express without replacing existing server routes. Out of scope: moving all pages.
**Done when:** Start route renders a non-production test page, can call one existing session API through the adapter, builds locally, and does not change `http://localhost:7420/` behavior.
**Depends on:** Scope 2.

### Scope 4: Session Domain Adapter

**Component(s):** Session Domain, Auth/Billing Adapter.
**Boundary:** Extract session operations from Express handlers into storage-neutral services. Out of scope: Convex production migration.
**Done when:** existing Express `/api/sessions*` routes call the adapter; existing session tests pass; filesystem sessions still list/get/claim/delete; optional Convex interface is typed but disabled.
**Depends on:** Scope 1.

### Scope 5: Session Dashboard Route Parity

**Component(s):** App Shell, Generated Site Preview, TopBar.
**Boundary:** Port `ship-now` TopBar/session route concepts into a React route that consumes the Session Domain. Out of scope: inline editing and Agentation behavior beyond disabled controls.
**Done when:** `/session/:id` or Start equivalent shows the current preview, back/home, export status, prompt, elapsed time, theme, and file/page controls with current `ship-fast` styling.
**Depends on:** Scopes 3, 4.

### Scope 6: Inline Editing and AI Rewrite

**Component(s):** Inline Editing Domain, Preview.
**Boundary:** Port `use-text-edit`, `use-ai-text-edit`, `AIPromptBox`, and `api.rewrite` behavior into `ship-fast` preview/edit architecture.
**Done when:** manual edit changes visible text, save persists across reload, AI rewrite replaces selected text, export uses saved override, and restore/checkpoint works.
**Depends on:** Scope 5.

### Scope 7: Agentation Integration

**Component(s):** Agentation Adapter, Preview, Session Domain.
**Boundary:** Port `AgentationSessionBridge`, annotation persistence, session keys, enable toggle, and annotation count.
**Done when:** anonymous and authenticated sessions can enable Agentation, add/update/delete annotations, reload with annotations intact, and disable without deleting data.
**Depends on:** Scopes 4, 5.

### Scope 8: Image Relevance Merge

**Component(s):** Image Relevance Service, Generation Orchestrator.
**Boundary:** Merge `ship-now` stock image query/browser helpers into generic `ship-fast` image resolution.
**Done when:** image selection improves for product, portfolio, local service, blog, SaaS, and wellness prompts without hardcoded vertical branches; tests cover query normalization and fallback.
**Depends on:** Scope 1.

### Scope 9: Convex/Clerk Decision Gate

**Component(s):** Session Domain, Auth/Billing Adapter.
**Boundary:** Decide whether Convex/Clerk become production dependencies or remain optional. Out of scope: full migration until decision recorded.
**Done when:** a short ADR compares filesystem+Firebase, Convex+Clerk, and hybrid options against generation, Agentation, billing, anonymous sessions, and deployment needs.
**Depends on:** Scopes 2, 4, 7.

### Scope 10: Export and Deployment Parity

**Component(s):** Export services, deployment services, GitHub push, CMS/Medusa.
**Boundary:** Ensure Start shell does not regress existing export/deploy/provision flows; implement or hide unsupported React/Next exports.
**Done when:** HTML export passes; React/Next export UI truthfully reports supported/unsupported; deploy, GitHub push, Sanity, Medusa config routes behave as before.
**Depends on:** Scopes 4, 5.

### Scope 11: Verification Harness

**Component(s):** tests, agent-browser scripts, fixtures.
**Boundary:** Add repeatable verification for the full product, not just unit tests.
**Done when:** one command or documented harness runs: server start, homepage generate, direct session render, inline edit reload, Agentation annotation reload, export HTML, gallery, auth/quota checks, and screenshots.
**Depends on:** Scopes 1, 5, 6, 7, 10.

### Scope 12: Cutover and Cleanup

**Component(s):** App Shell, Express server, scripts, docs.
**Boundary:** Move default routes to the Start shell only after parity. Out of scope: deleting Express engine APIs before replacements prove equivalent.
**Done when:** default local URL serves the migrated shell; old compatibility routes remain for one release; stale `ship-now` imports are removed; docs describe dev/start/test/deploy flow.
**Depends on:** Scopes 3 through 11.

### Spec Coverage

| Spec Requirement | Scope |
|------------------|-------|
| Keep `ship-fast` UI/history | Scopes 3, 5, 12 |
| Import `ship-now` features and logic | Scopes 2, 5, 6, 7, 8, 9 |
| Consider/perform React TanStack Start transformation | Scopes 3, 5, 12 |
| Verify website generation still works | Scopes 1, 11 |
| Verify Agentation still works | Scope 7, 11 |
| Preserve existing generation/export/deploy/CMS capabilities | Scopes 4, 10, 11 |
| Run autonomously with accepted plan | This document status plus Scope ordering |

## Execution Rule

Proceed in scope order unless a scope exposes a blocker. Do not start the broad TanStack shell migration until Scope 1 proves homepage generation no longer strands the browser. Do not make Convex/Clerk mandatory until Scope 9 is accepted by evidence. After every scope, run the real user path before continuing.

## Self-Approval Decision

Codex accepts this plan for execution without waiting for another user confirmation.

Rationale:

- The user explicitly asked for a self-accepted plan because they are leaving and want a long-running autonomous process.
- The migration direction is bounded: keep `ship-fast` repository/history/UI, import the useful `ship-now` logic, and introduce TanStack Start through adapters rather than a destructive rewrite.
- Current generation was repaired and verified before approving the migration plan, so the migration starts from a working baseline rather than using framework work to hide a broken product path.
- The plan has stop gates that prevent irreversible replacement of storage, auth, routing, export, or preview flows until the equivalent migrated path passes the real browser checks.

Approval conditions already met:

- `ship-fast` git history was checked before planning.
- Existing migration plan and current dirty worktree were inspected.
- `~/Documents/ship-now` structure, dependencies, route files, Convex modules, Agentation files, TopBar, inline edit hooks, image helpers, and generation modules were inventoried.
- Current generation baseline was verified with headed Brave/agent-browser and direct SSR checks.
- TanStack Start was validated against official documentation at planning time; Context7 was attempted first but unavailable.

## Ship Now Feature Import Ledger

| Ship Now source | Feature / logic | Target in Ship Fast | Decision | Acceptance evidence |
|-----------------|-----------------|---------------------|----------|---------------------|
| `src/routes/index.tsx` | React prompt homepage / submit experience | TanStack Start App Shell + existing `src/scripts/homepage.ts` parity | Port selectively | Homepage submit reaches `/session/:id` in headed Brave; gallery remains styled with Ship Fast rocket/frosted UI. |
| `src/routes/generate.$sessionId.tsx` | Generated session route, preview shell, loading state | Session Dashboard Route Parity | Port through adapter | Direct `/session/:id` loads generated iframe, final status, controls, and no `about:blank`. |
| `src/components/GenUI/TopBar.tsx` | TopBar controls, Agentation toggle, edit affordances | Preview shell / TopBar domain | Port and restyle | Controls do not overlap generated UI; export/back/edit/Agentation controls work on desktop and mobile. |
| `src/components/GenUI/DirectPreview.tsx` | Direct React preview renderer | Generated Site Preview | Evaluate and partially port | Ship Fast iframe/export/deploy parity remains; direct renderer only used where it does not bypass preview tooling. |
| `src/components/GenUI/AgentationSessionBridge.tsx` | Agentation UI bridge | Agentation Adapter | Port | Anonymous and authenticated sessions can add/update/delete annotations and reload with annotations intact. |
| `src/lib/agentation-session.ts` | Stable Agentation session key logic | Agentation Adapter | Port | Session keys are deterministic for existing short IDs and do not expose Convex IDs publicly. |
| `convex/agentation.ts` | Annotation persistence schema/actions | Session Domain annotation repository | Port behind storage interface | Filesystem adapter works first; Convex adapter can be enabled by feature flag later. |
| `src/hooks/use-text-edit.ts` | Manual inline text edits | Inline Editing Domain | Port | Text edits persist across reload and are included in preview/export. |
| `src/hooks/use-ai-text-edit.ts`, `src/routes/api.rewrite.tsx` | AI rewrite selected text | Inline Editing Domain + existing preview AI endpoints | Merge | AI rewrite replaces selected text, saves checkpoint, and handles failures visibly. |
| `convex/genui.ts`, `src/genui/*` | Generation orchestration prototype and OpenUI helpers | Generation Orchestrator | Mine, do not replace wholesale | Only generic fixes land; current Ship Fast engine remains canonical and continues passing full generation proof. |
| `src/lib/stock-image.ts`, `stock-image-browser.ts`, `image-query.ts`, `img.tsx` | Image relevance/query/fallback helpers | Image Relevance Service | Port generic logic | Product, portfolio, local service, blog, SaaS, and wellness prompts use relevant images without hardcoded vertical branches. |
| `convex/schema.ts`, `sessions.ts`, `tasks.ts` | Convex session/task storage | Session Domain optional adapter | Defer behind ADR | ADR proves whether Convex is production storage, optional realtime layer, or rejected. |
| `src/integrations/clerk/*` | Clerk auth provider/header | Auth/Billing Adapter | Defer behind ADR | Firebase/current billing remains working; Clerk not introduced until auth ownership decision is made. |
| `src/integrations/tanstack-query/*` | Query provider/devtools | App Shell data layer | Port where useful | Query cache does not store large generated programs in route state. |
| `src/components/ui/*` | React UI primitives | App Shell component library | Port selectively | Components match Ship Fast visual language and do not introduce a competing theme. |
| `src/components/GenUI/Intro*`, `useWarpCanvas.ts` | React intro animation | App Shell / dashboard intro | Merge only if better than current rocket flow | Generation loader remains loved, non-blocking, and exits only when preview is ready or terminal fallback fires. |
| `src/genui/registry/*`, `src/genui/components/ThemePicker.tsx` | Prototype block registry/theme tools | Engine/block registry | Compare against `packages/ship-fast-blocks` | No duplicate registry; useful themes/components are ported into canonical packages only. |

## Autonomous Execution Protocol

Every scope must follow Build -> Verify -> Next:

1. Claim only the files for the active scope.
2. Before editing a symbol, run GitNexus impact for that symbol and record low/medium/high risk in the implementation note.
3. Make the smallest domain-aligned change that advances the current scope.
4. Rebuild or test the changed module immediately.
5. Run a real path that exercises the changed behavior before touching the next scope.
6. If the same failure repeats twice, stop serial retrying and split investigation into independent causes.
7. At scope close, run the scope acceptance commands and attach screenshots/log snippets to the implementation note.
8. Do not delete Express/session/filesystem routes until the migrated TanStack route passes parity and the old route is retained for one release.

## Execution Waves

### Wave 0: Baseline Lock

Purpose: freeze the working state so migration regressions are obvious.

Actions:

- Keep the current generation fixes from `src/scripts/dashboard-main.ts`, `src/server/session-gallery-thumbnail.js`, homepage submit, and OpenUI page-block partial-prop fixes.
- Add a scripted proof command for headed Brave generation once stable enough to automate.
- Record baseline sessions and screenshots under a local verification note.

Exit gate:

- `bun run build:scripts` passes.
- Focused tests pass.
- Headed Brave homepage generation reaches a populated preview and final generated status.
- Direct `/preview/:sessionId/` SSR check has `hasError: false`.

### Wave 1: Inventory and Adapters

Purpose: make feature movement explicit before framework movement.

Actions:

- Add `src/session-domain/` interface plan and tests around current filesystem sessions.
- Add a no-op Agentation repository interface with filesystem-backed tests.
- Add inline-edit source override contracts without moving UI yet.
- Classify every `ship-now` source file as port/merge/defer/ignore in the ledger above.

Exit gate:

- Existing Express routes still pass through the same response shape.
- No public URL changes.
- Unit tests prove filesystem session get/list/create/update behavior.

### Wave 2: TanStack Start Shell Alongside Express

Purpose: introduce Start without breaking the working app.

Actions:

- Add TanStack Start dependencies and a Vite/Start config behind an opt-in script or dev port.
- Create a single non-production health route that reads one session through the Session Domain.
- Add providers only when needed: React Query first; Convex/Clerk stay disabled.
- Keep `http://localhost:7420/` served by the existing app during the spike.

Exit gate:

- Start route builds and can call the Session Domain.
- Existing `ship-fast` dev server and generation path still work unchanged.
- No generated payload is moved into client route state.

### Wave 3: React Session Shell Parity

Purpose: port the useful `ship-now` route/TopBar shell while preserving Ship Fast UI.

Actions:

- Build a React session route that consumes the Session Domain and renders the existing preview iframe.
- Port TopBar controls in Ship Fast styling.
- Add dashboard status and stream recovery semantics from the repaired `dashboard-main.ts`.

Exit gate:

- Direct session URL works after reload.
- Homepage submit can navigate to the React shell behind a feature flag.
- Preview iframe, status, export controls, back/home, and gallery links all remain correct.

### Wave 4: Editing, Agentation, and Images

Purpose: import the `ship-now` product logic that users actually feel.

Actions:

- Port manual inline text edit and AI rewrite into the existing preview editor architecture.
- Port Agentation bridge and annotation persistence behind storage interface.
- Merge image relevance helpers into the generic image service.

Exit gate:

- Manual edit persists across reload and export.
- AI rewrite persists across reload and export.
- Agentation add/update/delete/clear works for anonymous session ownership.
- Image relevance tests cover multiple arbitrary site kinds.

### Wave 5: Storage/Auth ADR and Optional Convex/Clerk

Purpose: decide deliberately instead of inheriting prototype infrastructure accidentally.

Actions:

- Write ADR comparing filesystem+Firebase, Convex+Clerk, and hybrid.
- Only if accepted by evidence, add Convex/Clerk adapters behind feature flags.
- Keep anonymous sessions and billing behavior stable.

Exit gate:

- ADR exists and is linked from this plan.
- Current auth, billing, quota, and anonymous generation still pass.
- Any new storage/auth path has migration and rollback instructions.

### Wave 6: Cutover, Export Truth, and Cleanup

Purpose: make the migrated shell the default only after parity.

Actions:

- Move default routes to Start shell after all feature gates pass.
- Keep compatibility routes for one release.
- Implement or hide unsupported React/Next export targets.
- Remove dead prototype imports and document the final dev/deploy flow.

Exit gate:

- Default local URL serves migrated shell.
- Generation, direct preview, gallery, inline edit, Agentation, export, deploy, CMS/Medusa, GitHub push, auth/quota checks pass.
- Rollback to compatibility route is documented.

## Verification Matrix

| Area | Proof command / action | Required evidence |
|------|------------------------|-------------------|
| Browser generation | `agent-browser --session <name> --headed --executable-path "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" open http://127.0.0.1:7420/`, fill prompt, click Generate, wait to final preview | URL is `/session/:id`; iframe src is `/preview/:id?...`; iframe text contains generated site; phase says `Project generated...`; screenshot saved. |
| Direct preview SSR | Render `sessions/<id>/home.openui` through `renderOpenUIToHTMLWithTheme` | JSON reports `hasError:false`, no `ReferenceError`/`TypeError`, non-trivial HTML length. |
| Reload recovery | Open a completed `/session/:id` in a fresh headed browser | Dashboard skips stuck intro, loads preview iframe, and shows final status. |
| Homepage UI | Open `/` and inspect screenshot | Rocket asset is visible/cropped acceptably; gallery grid is inside frosted card; prompt controls remain usable. |
| Gallery thumbnails | Open `/` after sessions exist | Thumbnail worker does not steal the active agent-browser session; gallery iframes/thumbnails render. |
| Inline edit | Select visible preview text, edit, save, reload | Edited text remains after reload and appears in export/preview HTML. |
| AI rewrite | Select text, request rewrite, save, reload | AI replacement appears, errors are visible, checkpoint exists. |
| Agentation | Enable Agentation, add/update/delete annotation, reload | Annotation count and visible annotations persist; anonymous ownership works with existing secret. |
| Image relevance | Generate product, local service, blog, SaaS, wellness prompts | Images are semantically relevant without slug-specific hardcoding. |
| Export | Export HTML and any enabled React/Next targets | HTML download is valid; unsupported targets are hidden or truthfully disabled. |
| Deploy/GitHub/CMS/Medusa | Exercise existing controls with mocked or real configured env as appropriate | Existing server responses and UI states remain intact; external quota/auth failures are surfaced as external failures, not generation failures. |
| Auth/quota | Anonymous and authenticated generation attempts | Anonymous limits, ownership secrets, sign-in, and billing gates behave as before. |

## Stop / Rollback Rules

- If homepage generation regresses to `about:blank`, stop migration work and repair Scope 1 before continuing.
- If a TanStack Start route cannot call the Session Domain without duplicating generated payload state in the browser, stop and redesign the adapter.
- If Convex/Clerk requires breaking current anonymous sessions, billing, or ownership semantics, defer it and continue with filesystem/Firebase adapters.
- If Agentation requires authenticated-only access, keep it feature-flagged until anonymous session ownership is supported.
- If export/deploy/CMS flows regress, keep the Express compatibility route as default and only expose the Start route behind a local flag.
- Never delete a legacy route, script, or storage path in the same scope that introduces its replacement; deletion belongs to Wave 6 after parity evidence.

## Current Baseline Evidence

As of this plan update:

- `bun run build:scripts` passes.
- `bun run start:shell:build` passes for the new opt-in TanStack Start shell.
- `bun run test:session-domain` passes for the filesystem repository and `/api/sessions/:id` response adapter.
- `bun run test:agentation` passes for the first Shipnow Agentation session-key/annotation adapter.
- Focused tests pass for preview reset guard, homepage sanity, and session gallery thumbnail capture.
- Session `a3a3b40ca7ba` was generated from the homepage in headed Brave and reached `/preview/a3a3b40ca7ba?...` with final dashboard status.
- Session `7d4eae245118` proved reload recovery after missed live events.
- Session `b92c55c214e0` proved completed-session reload after the blank iframe fix.
- Session `be2f85e361c4` was generated from the homepage in headed Brave after the Start shell install; OpenUI completed in 18.7s and the Start shell detail route at `/session/be2f85e361c4` rendered it as `Sunrise Bakery`.
- The Start shell at `http://127.0.0.1:7430/` reads real local Shipfast sessions through `createFilesystemSessionRepository()` and links to `/session/$sessionId` detail routes.
- The Start shell now has a Shipnow-compatible generated workspace route at `/generate/$sessionId`; `http://127.0.0.1:7430/generate/be2f85e361c4` rendered the `Sunrise Bakery` session, status strip, toolbar, current-dashboard/open-preview links, and a nonblank embedded preview iframe.
- Iframe verification for `/generate/be2f85e361c4` saw the generated website content inside the frame, including navigation, hero copy, menu sections, reviews, contact content, and footer links. Screenshot: `/tmp/ship-fast-generate-route.png`.
- The generated workspace now prefers local `sessions/<id>/index.html` through `readGeneratedPreviewHtml()` and `iframe.srcDoc`, falling back to the current Express preview URL only when no completed HTML artifact exists. This was verified against `be2f85e361c4`; screenshot: `/tmp/ship-fast-generate-route-srcdoc.png`.
- The Start-owned `/generate/$sessionId` route now supports persisted inline text edits for completed local previews. `writePreviewTextEdit()` uses structured HTML traversal through `linkedom`, updates only the first matching visible text node, writes `sessions/<id>/index.html`, and stores a backup plus `.preview-edits/edits.jsonl`.
- Inline edit verification on `be2f85e361c4`: headed Brave enabled edit mode, populated the toolbar from iframe text selection, saved a paragraph change, reloaded `/generate/be2f85e361c4`, and confirmed the iframe text changed from `cozy corner for your morning ritual` to `cozy table for every morning ritual`. Screenshot: `/tmp/ship-fast-inline-edit-persisted.png`.
- AI rewrite is wired into the same Start-owned edit toolbar through `rewriteSelectedText()`, using Shipfast's `@ship-fast/engine` `generateText` path with `AI_REWRITE_MODEL` override support, a fast Groq default, and a 25s abort timeout so provider slowness does not block the editor indefinitely.
- AI rewrite verification on `be2f85e361c4`: headed Brave selected `cozy table for every morning ritual`, ran the AI rewrite action, saved the returned replacement `A warm table for every morning`, reloaded `/generate/be2f85e361c4`, and confirmed the iframe contained the rewritten text while the previous selected phrase was gone. Screenshot: `/tmp/ship-fast-ai-rewrite-persisted.png`.
- Agentation parity now has disk-backed Shipfast persistence through `readAgentationState()`, `setAgentationEnabled()`, `upsertAgentationAnnotation()`, `deleteAgentationAnnotation()`, and `clearAgentationAnnotations()`. Storage lives under `sessions/<id>/.agentation/`, uses the Shipnow-style annotation payload shape, and keeps the migrated `ship-fast:session:<id>` Agentation session key.
- Agentation verification on `be2f85e361c4`: headed Brave enabled annotations in `/generate/be2f85e361c4`, entered `Make this hero CTA more specific`, clicked the `View Menu` button inside the iframe, confirmed a marker and list row appeared, verified disk state `{ enabled: true, count: 1, agentationSessionId: "ship-fast:session:be2f85e361c4" }`, reloaded and saw the marker/list persist, then deleted the annotation and verified disk count returned to `0`. Screenshot: `/tmp/ship-fast-agentation-created.png`.
- Start-native generation is wired from the TanStack Start homepage through `createStartGeneration`, `useServerFn`, and the tested `createShipfastGeneration()` bridge. The bridge posts to the existing Shipfast `/api/sessions` engine endpoint, validates the returned session id, and navigates into `/generate/$sessionId`.
- Start-native generation verification: headed Brave submitted the Nova Robotics prompt from `http://127.0.0.1:7430/`, created session `283278a9ddf2`, navigated to `/generate/283278a9ddf2`, and rendered the completed generated iframe after workspace refresh. The iframe contained `Nova Robotics`, `Scale Your Warehouse with Intelligent Automation`, pricing cards, and demo CTAs. Screenshot: `/tmp/ship-fast-start-native-generation.png`.
- The generated workspace now auto-revalidates while it has no local `index.html`, then stops when the preview artifact appears. Headed Brave submitted the Atlas Ledger prompt from the Start homepage, created session `975621ea936a`, navigated to `/generate/975621ea936a`, and auto-swapped from pending state to an enabled preview iframe without manually pressing refresh. Disk proof: `sessions/975621ea936a/index.html` exists and is 67,664 bytes with `Atlas Ledger` metadata/content.
- `bun run test:start-shell` passes for the Start generation request bridge.
- Export parity has a Start-owned local adapter through `readStartExportState()`, `buildStartSessionExport()`, `readStartExportBundle()`, and `/api/start/sessions/$sessionId/download/$target`. It reuses the existing Shipfast export service, requires the anonymous owner secret for anonymous local downloads, and now accepts Clerk bearer ownership for user-owned sessions.
- Start export verification: headed Brave generated fresh session `4e7ddbc9d492` from the Start homepage, reached `/generate/4e7ddbc9d492`, built the HTML export from the Start workspace export panel, enabled the Download button, and fetched `/api/start/sessions/4e7ddbc9d492/download/html` with the stored owner secret. Browser-context fetch returned `{ status: 200, contentType: "application/zip", length: 30046, signature: "PK\\u0003\\u0004", hasSecret: true }`. Disk proof: `sessions/4e7ddbc9d492/exports/html.zip` exists with `README.md`, `site.css`, `site.js`, `robots.txt`, and `llms.txt`. Screenshot: `/tmp/ship-fast-start-export-ready.png`.
- Deployment parity now has a shared server service via `readSessionDeployment()` and `provisionDeploymentIfNeeded()`, replacing the previous nested Express-only helper while preserving the existing `/api/sessions/:id/deploy` behavior. The Start adapter `readStartDeploymentState()` / `provisionStartDeployment()` requires the anonymous owner secret for anonymous sessions and accepts Clerk subject ownership for user sessions.
- Start deploy verification: headed Brave opened local deploy-test session `15e3bea2d879`, stored its anonymous owner secret, clicked Deploy in `/generate/15e3bea2d879`, and the Start workspace changed to Deployed with `https://demo-registry-go.ship-fast.io/`. Disk proof: `sessions/15e3bea2d879/deploy.json` contains the deployed URL and `sessions/_deployments.json` contains `"demo-registry-go": { "sessionId": "15e3bea2d879", ... }`. Screenshot: `/tmp/ship-fast-start-deploy-registry.png`.
- Start deploy verification found and fixed a registry initialization bug: the first Start deploy wrote `deploy.json` but missed `_deployments.json`; the Start deployment adapter now calls `initDeployments(sessionsDir)` and `readSessionDeployment()` re-registers existing `deploy.json` entries with preserved timestamps when the map is missing.
- GitHub push parity now has a Start adapter via `readStartGitHubState()` / `pushStartSessionToGitHub()`, reusing the existing `pushSessionToGitHub()` engine instead of duplicating GitHub API behavior. Anonymous Start pushes require the browser's owner secret and a GitHub access token; user-owned pushes accept a verified Clerk subject plus a GitHub access token.
- Start GitHub verification: headed Brave opened `/generate/15e3bea2d879`, rendered the GitHub panel, showed the no-token validation message, then rejected a fake-token push without the anonymous owner secret before any successful external push. Screenshots: `/tmp/ship-fast-start-github-panel.png` and `/tmp/ship-fast-start-github-owner-secret.png`.
- CMS/Medusa parity now has a Start adapter via `readStartCmsState()` / `provisionStartSanity()` / `provisionStartMedusa()`, reusing the existing Sanity provisioning, Medusa provisioning, product extraction, and Medusa catalog sync helpers. Anonymous Start provisioning requires the browser's owner secret; user-owned provisioning accepts verified Clerk subject ownership.
- Start CMS verification: headed Brave opened `/generate/15e3bea2d879`, rendered the CMS panel, showed Sanity as ready to provision and Medusa as not configured in the current local environment, then surfaced the no-owner-secret guard for Sanity. Screenshots: `/tmp/ship-fast-start-cms-panel.png` and `/tmp/ship-fast-start-cms-owner-secret.png`.
- Clerk/Convex migration slice: Start shell now includes Shipnow-style `ClerkProvider` + `ConvexProviderWithClerk` wrappers, `@clerk/clerk-react`, `@clerk/backend`, and `convex` dependencies, a Convex schema with `legacySessionId` bridging, and `convex/sessions.ts` actions for mirroring/claiming legacy Shipfast sessions. The Start auth bridge verifies Clerk bearer tokens via `@clerk/backend` and compares Clerk `sub` to `session.userId`; Firebase is no longer used for new Start-owned access checks.
- Clerk/Convex verification: `bun run test:session-domain` passes, focused Clerk ownership tests pass as part of that suite, `bun run start:shell:build` passes, and `bunx tsc -p convex/tsconfig.json --noEmit` passes. `bunx convex codegen --dry-run --typecheck disable` is blocked until `CONVEX_DEPLOYMENT` is configured; generated Convex stubs are checked in for the current schema until a real deployment can regenerate them.
- Product UI verification remains on the existing Ship Fast surface: headed Brave generated session `d77c948d0922` through `http://127.0.0.1:7420/`, landed on `/session/d77c948d0922`, rendered the real dashboard preview iframe, and `/api/sessions/d77c948d0922` reported `homepageReady:true`, `siteSpecReady:true`, and `15/15` tasks done. The `7430` Start app is a migration verification surface, not the customer-facing UI.
- Clerk-on-7420 bridge: `/api/config` on the real Express app now exposes `clerkPublishableKey` and `convexUrl` alongside legacy Firebase keys. `requireAuth`, `optionalAuth`, and `requireProvisionAuth` prefer verified Clerk bearer tokens through the shared Start auth bridge, with Firebase retained only as a legacy fallback. The existing vanilla home/session UI keeps the same buttons and globals, but `top-actions-auth.ts` and `dashboard-auth.ts` now initialize Clerk first when configured and expose Clerk tokens through `window.shipFastDashboardAuth.getCurrentIdToken()`.
- Clerk-on-7420 verification: `bun run build:scripts`, `bun run test:session-domain`, `bunx tsc -p convex/tsconfig.json --noEmit`, and `bun run start:shell:build` pass. After restarting `http://127.0.0.1:7420`, `GET /api/config` returned the new keys (`clerkPublishableKey`, `convexUrl`) and the existing Ship Fast UI loaded from the real `7420` surface without replacing the UI with the Start lab.
- Direct SSR check for `a3a3b40ca7ba` returned `hasError:false`.

## Next Code-Planning Outputs

The next implementer should create one implementation note per wave:

1. `specs/code-plan/ship-now-wave-0-baseline-lock.md`
2. `specs/code-plan/ship-now-wave-1-session-domain-adapters.md`
3. `specs/code-plan/ship-now-wave-2-tanstack-start-shell.md`
4. `specs/code-plan/ship-now-wave-3-react-session-shell.md`
5. `specs/code-plan/ship-now-wave-4-editing-agentation-images.md`
6. `specs/code-plan/ship-now-wave-5-storage-auth-adr.md`
7. `specs/code-plan/ship-now-wave-6-cutover-cleanup.md`

Each implementation note must copy the relevant exit gate from this document and cannot mark its wave complete without the required evidence.
