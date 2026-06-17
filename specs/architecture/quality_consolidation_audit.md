# Quality Consolidation Audit

Date: 2026-06-17
Repository: ship-fast
Purpose: stop the micro-ratchet loop and make the current quality work reviewable.

## Current State

The repo is better than at the start of the quality push, but it is not yet an
11/10 codebase. The current blocker is no longer a single missing test or one
broken path. The blocker is consolidation: many independent quality, runtime,
backend, and UI changes are mixed in one broad local branch review scope.

Current evidence:

- `bun run verify:prepush` passed with explicit lint, typecheck, coverage,
  review-readiness, generated-artifact, build, and bundle-boundary steps.
- Latest measured full-gate coverage is 23.44% statements, 15.70% branches,
  11.30% functions, and 23.01% lines.
- GitNexus `detect_changes` reports no staged or unstaged changes after the
  local commits; the branch-level review scope remains broad and is tracked by
  change groups.
- The local branch differs from upstream by 230 changed paths, and
  `bun run verify:change-groups` classifies every path into a review group:
  Convex session decomposition 78, quality gates/local enforcement 22,
  OpenUI runtime/bundle boundary 41, engine regression coverage 31, frontend
  workflow/preview behavior 37, commerce/external integration 9, and quality
  documentation/assessment 12.
- `specs/architecture/quality_change_groups.md` is a generated file-level
  review manifest for the current local branch/worktree scope;
  `bun run verify:change-report` checks that it matches the current scope.
- `bun run verify:review-readiness` checks that every change group in the
  manifest has matching proof documentation and appears in this audit, so group
  review evidence cannot silently drift.
- `bun run review:groups` writes ignored per-group file lists and patch bundles
  to `.quality-review-groups/`, giving reviewers concrete slices of the broad
  branch scope without adding generated review artifacts to git.
- The largest tracked diff is the Convex session split:
  `convex/sessions.ts` shows 295 inserted lines and 5,083 deleted lines, plus
  many new `convex/lib/session_*` helper modules and tests.

## Why More Small Coverage Passes Are Not Enough

Small coverage passes are still useful when they protect high-risk behavior,
but repeating them now gives diminishing returns. They raise global coverage by
fractions of a point while the review risk remains dominated by broad, mixed
scope.

An 11/10 state needs the repo to be:

- reviewable in coherent changesets;
- verified through the product-critical paths those changes affect;
- protected by gates that prevent regressions;
- clear about generated-code provenance and bundle boundaries;
- free of unrelated editor/local noise in the final patch set.

## Reviewable Change Groups

### 1. Convex Session Decomposition

Scope:

- `convex/sessions.ts`
- `convex/lib/session_*`
- related Convex tests

Why it matters:

- This is the highest-value structural improvement because it turns a very
  large coordination file into helper modules with focused tests.
- It is also the highest review risk because it touches session creation,
  ownership, generation state, export entitlement, CMS, gallery, preview
  history, and event-stream behavior.

Required proof before treating this group as complete:

- Full Convex test suite passes.
- Targeted tests for every extracted helper pass.
- GitNexus affected flows for session create, generation view, export
  entitlement, preview restore, and event stream are reviewed.
- A reviewer can inspect `convex/sessions.ts` as a registration/orchestration
  surface rather than a behavior dump.
- A source-level invariant test prevents the registration surface from growing
  past the 500-line coordination ceiling or losing sibling tests for extracted
  `session_*_helpers.ts` modules.

### 2. Quality Gates And Local Enforcement

Scope:

- `.github/workflows/ci.yml`
- `.githooks/`
- `scripts/git-hook-quality-gate.mjs`
- `scripts/quality-gates-config.test.ts`
- `scripts/verify-build-bundles.ts`
- `vitest.config.ts`
- `package.json`

Why it matters:

- This group converts quality from convention into enforced behavior.
- It includes the coverage gate, CI coverage execution, bundle verification,
  and local pre-commit/pre-push hooks.

Required proof:

- `bun run test:coverage` passes at the enforced threshold.
- `bun run verify:prepush` passes.
- `scripts/quality-gates-config.test.ts` protects coverage and CI wiring.
- `bun run verify:generated` fails when OpenUI generated runtime/export
  artifacts drift from their generator.
- Generated/editor-local files are excluded from the final commit unless
  intentionally part of the repo contract.

### 3. OpenUI Runtime And Bundle Boundary

Scope:

- `vite.config.ts`
- `packages/ship-fast-blocks/src/runtime.ts`
- `packages/ship-fast-blocks/src/runtime-library.ts`
- `packages/ship-fast-blocks/src/theme.ts`
- `packages/ship-fast-blocks/src/component-names.ts`
- `packages/ship-fast-blocks/src/generated/*`
- `packages/ship-fast-engine/src/openui-ssr.js`
- `src/island/openui/OpenUIViewer.tsx`
- `src/features/exports/services/openui-html-export-builder.ts`
- `src/features/exports/services/openui-export-builder.ts`
- `src/features/exports/server/create-export-response.ts`
- export/build bundle verifier tests

Why it matters:

- This is the main path toward reducing OpenUI browser/server weight.
- It is architectural, not just test coverage.

Required proof:

- Browser runtime imports do not pull the generated capsule catalog eagerly.
- Core OpenUI SSR loads response-scoped runtime libraries instead of the eager
  block barrel.
- Standalone HTML export uses the response-scoped HTML builder, while
  React/Next package export keeps the full-catalog source-manifest path.
- Build bundle verifier rejects broad eager OpenUI chunks.
- Generated runtime manifests are reproducible through the generator script.
- Server export path still renders existing OpenUI outputs correctly.

Current checkpoint:

- `specs/architecture/openui_runtime_bundle_boundary_verification.md`
  records the focused source, bundle, generator, GitNexus, and export-builder
  verification for this group.

### 4. Engine Regression Coverage

Scope:

- `packages/ship-fast-engine/src/spec/*`
- `packages/ship-fast-engine/src/clone/*`
- `packages/ship-fast-engine/src/llm/*`
- `packages/ship-fast-engine/src/pipeline/*`
- `packages/ship-fast-engine/src/renderers/*`

Why it matters:

- These tests protect the generation engine from the repeated regressions this
  repo has seen: invalid site URLs, missing blog grids, clone security gaps,
  LLM retry behavior, renderer output, and media hydration.

Required proof:

- Focused engine tests pass.
- Full coverage gate includes these test globs.
- Fixes stay generic by site kind or structural pattern, not one-off prompt
  branches.

Current checkpoint:

- `specs/architecture/engine_regression_coverage_verification.md` records the
  generic blog fallback invariant, the invalid blog-spec fix, GitNexus impact,
  and focused engine regression verification for this group.

### 5. Frontend Workflow And Preview Behavior

Scope:

- `src/features/dashboard/components/Dashboard.tsx`
- `src/features/generation/components/GeneratedModulePreview.tsx`
- `src/features/editing/components/InlineEditToolbar.tsx`
- `src/features/session/server/*`
- `src/hooks/useWarpCanvas.ts`
- `src/island/openui/openui-runtime-preprocess.ts`

Why it matters:

- This group affects the user-facing generation, preview, editing, and reload
  loops.
- It must be verified with actual browser/runtime behavior where UI behavior is
  part of the claim.

Required proof:

- Focused unit tests pass.
- For UI-affecting changes, browser verification is run with the project
  preferred browser automation path.
- State persistence and reload behavior are explicitly checked where changed.

Current checkpoint:

- `specs/architecture/frontend_workflow_preview_verification.md` records the
  focused unit, Convex/OpenUI completion, and headed browser verification for
  dashboard publish/reload, chat refinement, and CMS edit workflows.

### 6. Commerce And External Integration Hardening

Scope:

- `src/routes/api/medusa-*`
- `src/billing/*`
- `src/lib/stock-image.ts`
- `src/lib/image-context.ts`
- related Convex commerce/CMS helpers

Why it matters:

- These paths touch payment, checkout, stock media, Medusa, CMS, and generated
  storefront behavior.
- They require mocked external boundaries in tests and real-path validation
  when integration behavior changes.

Required proof:

- Billing and stock-image tests pass.
- Medusa route response shapes are covered.
- No real external dependency is required for local test success.

Current checkpoint:

- `specs/architecture/commerce_external_integration_verification.md`
  records the focused route-contract, billing, stock-image, Medusa service,
  OpenUI Medusa provider, and Convex commerce/CMS verification for this group.

### 7. Quality Documentation And Assessment

Scope:

- `specs/architecture/code_quality_assessment.md`
- `specs/architecture/quality_consolidation_audit.md`
- `specs/architecture/quality_change_groups.md`
- group-specific verification notes under `specs/architecture/`
- repo-local operating instructions that materially affect quality gates

Why it matters:

- The quality push is broad enough that its evidence has to be reviewable as
  part of the patch, not reconstructed from terminal history.
- This group ties the repo rating, branch-scope consolidation plan, generated
  review manifest, and proof documents together.

Required proof:

- `bun run verify:review-readiness` passes.
- `bun run verify:change-report` passes when the local branch/worktree scope changes.
- The code quality assessment date, rating, and metric claims reflect current
  gates and do not contradict the consolidation audit.

Current checkpoint:

- `specs/architecture/code_quality_assessment.md` records the current code
  quality rating and metric baseline.
- This audit records the review groups and 11/10 exit criteria.
- `specs/architecture/quality_change_groups.md` records the current file-level
  review manifest.

## Noise To Exclude Or Justify

The final review set should not accidentally include local/editor or generated
noise unless intentionally justified:

- `.idea/`
- generated manifests that were not regenerated by a tracked script;
- lockfile changes not explained by dependency changes;
- AGENTS/CLAUDE edits not directly required by repo behavior;
- broad package metadata churn.

## Recommended Next Sequence

1. Freeze new feature/coverage work until the current local branch scope is split into
   the groups above.
2. Start with the Convex session decomposition group, because it is the largest
   blast radius and explains most of the deleted/added lines.
3. Verify that group independently with Convex-focused tests plus the full
   pre-push verifier.
4. Move quality gates and bundle verifier into a second review group.
5. Move OpenUI runtime/bundle changes into a third review group with bundle
   evidence.
6. Only after those groups are reviewable should additional coverage ratchets
   continue.

## 11/10 Exit Criteria

The repo should not be called 11/10 until all of these are true:

- The local branch/worktree scope is split into coherent, reviewable changesets.
- Full `verify:prepush` passes for the final assembled worktree.
- GitNexus `detect_changes` is understood at the group level, not dismissed as
  one broad critical blob.
- `bun run verify:change-groups` passes, proving every changed file is assigned
  to one of the review groups in this audit.
- `bun run verify:change-report` passes, proving the file-level review
  manifest is current.
- `bun run verify:review-readiness` passes, proving every review group has
  linked proof documentation and top-level audit coverage.
- `bun run review:groups` has been run, producing ignored per-group file lists
  and patch bundles for review.
- `bun run verify:quality-exit` passes, proving the exit criteria, package
  scripts, review manifest, assessment, and ignored review bundles are wired
  together.
- The assessment document reflects current metrics and no stale claims.
- Generated OpenUI/runtime artifacts have reproducible provenance.
- Source capsule files have reproducible origin classification.
- Coverage gates are enforced and meaningfully ratcheted, but not used as a
  substitute for structural review.
- Product-critical paths affected by the changes have real-path verification,
  including browser verification for UI behavior.
