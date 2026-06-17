# Convex Session Decomposition Verification

Date: 2026-06-17
Repository: ship-fast
Change group: Convex session decomposition

## Scope

This verification covers the largest review group identified in
`specs/architecture/quality_consolidation_audit.md`:

- `convex/sessions.ts`
- `convex/lib/session_*`
- related Convex session, entitlement, CMS, deployment, generation, gallery,
  preview-history, event-stream, and usage tests

Current inventory:

- `convex/sessions.ts` is 575 formatted LOC after Prettier.
- 27 `convex/lib/session_*_helpers.ts` files exist, each with a sibling
  `*.test.ts` file.
- 46 Convex test files exist in total.
- `wc -l convex/sessions.ts convex/lib/session_*.ts` reports 17,017 total
  lines across the session registration file, helpers, and helper tests.
- `convex/lib/session_decomposition_boundary.test.ts` now enforces helper
  delegation, validator extraction, public registration anchors, and sibling
  tests for every extracted `session_*_helpers.ts` module.

## Verification Run

Focused helper/session-readiness verification:

```bash
bun vitest run --config vitest.config.ts convex/lib/session_*_helpers.test.ts convex/session-readiness.test.ts
```

Result:

- 29 test files passed.
- 209 tests passed.

Focused decomposition-boundary verification:

```bash
bun vitest run --config vitest.config.ts convex/lib/session_decomposition_boundary.test.ts
```

Result:

- 1 test file passed.
- 2 tests passed.

Full Convex verification:

```bash
bun vitest run --config vitest.config.ts "convex/**/*.test.ts"
```

Result:

- 33 test files passed.
- 514 tests passed.

Full worktree verification already passed immediately before this
documentation-only verification record:

```bash
bun run verify:prepush
```

## Current Public Session Surface

The current `convex/sessions.ts` exports a thin registration/orchestration
surface for the critical session flows, including:

- creation and admission: `create`, `claimAnonymous`, `deleteMine`
- generation state: `getGenerationSession`, `markGenerationStarted`,
  `upsertGenerationTask`, `upsertGeneratedModule`, `addGenerationEvent`,
  `completeGeneration`, `completeGenerationInternal`, `failGeneration`
- read APIs: `getGenerationView`, `getEventStream`, `getSessionApiResponse`,
  `getWorkspace`, `getSessionReadiness`, `getPublicPreview`
- export entitlement/download: `createExport`, `getExport`,
  `getOwnedExportDownload`, `getOwnedExportForGitHubPush`
- editing/fork/chat/history: `createEdit`, `forkSession`, `listEdits`,
  `listPreviewHistory`, `restorePreviewVersion`, `sendChatMessage`,
  `listChatMessages`
- deployment/gallery: `publishPreview`, `getDeploymentBySlug`,
  `getDeploymentStatus`, `listPublicSessions`, `getPublicGallerySession`
- commerce/CMS/Agentation/usage/operational notification helpers

The point of the decomposition is that these registrations delegate behavior to
focused helpers under `convex/lib/session_*` instead of keeping all logic inside
`convex/sessions.ts`.

## GitNexus Review

GitNexus `detect_changes` reports no staged or unstaged changes after the local
quality commits. Earlier broad-scope impact review was treated as branch-level
review evidence, not as an active dirty-tree blocker.

For this group, direct upstream impact checks were run for the core public
session exports:

- `create`
- `getGenerationView`
- `getExportEntitlement`
- `restorePreviewVersion`
- `getEventStream`

Observed result:

- `getExportEntitlement` showed one direct caller in `convex/sessions.ts` and
  one affected Convex handler process.
- The other checked exports did not show direct upstream consumers in the
  current GitNexus output.

Caveat:

- GitNexus symbol line numbers for `convex/sessions.ts` may be stale relative
  to the current 575-line file, so this record treats GitNexus as a coarse
  affected-surface signal, not exact line evidence.
- The authoritative proof for this group is the current source inventory plus
  the focused helper and full Convex test runs above.

## Remaining Work Before 11/10

This group is now much more reviewable, but the overall repo is still not
11/10 because the broader local branch review scope remains mixed. The next
consolidation step should be the quality-gates/bundle-verifier group, then the
OpenUI runtime/bundle-boundary group.
