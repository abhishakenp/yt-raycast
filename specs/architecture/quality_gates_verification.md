# Quality Gates Verification

Date: 2026-06-17
Repository: ship-fast
Change group: quality gates and local enforcement

## Scope

This verification covers the second review group identified in
`specs/architecture/quality_consolidation_audit.md`:

- `.github/workflows/ci.yml`
- `.githooks/pre-commit`
- `.githooks/pre-push`
- `package.json`
- `vitest.config.ts`
- `scripts/git-hook-quality-gate.mjs`
- `scripts/git-hook-quality-gate.test.ts`
- `scripts/quality-gates-config.test.ts`
- `scripts/verify-build-bundles.ts`
- `scripts/verify-build-bundles.test.ts`
- `scripts/export-review-groups.ts`
- `scripts/export-review-groups.test.ts`
- `scripts/verify-change-groups.ts`
- `scripts/verify-change-groups.test.ts`
- `scripts/verify-review-readiness.ts`
- `scripts/verify-review-readiness.test.ts`

The group turns quality checks into enforced local and CI behavior:

- CI runs lint, typecheck, coverage-backed tests, build, and bundle verification.
- `verify:qa` runs lint, typecheck, coverage, build, and bundle verification.
- `verify:qa` runs change-group classification so broad dirty-tree work cannot
  pick up unreviewable files silently.
- `verify:qa` checks generated OpenUI/runtime artifacts before build can
  regenerate them.
- `verify:prepush` runs the full QA gates explicitly so failures are isolated by step.
- `prepare` installs `.githooks` through `core.hooksPath`.
- Vitest uses explicit node and Convex projects, with V8 coverage thresholds.
- Bundle verification enforces OpenUI/browser/server chunk boundaries.
- OpenUI generated manifests are checked for deterministic freshness through
  `generate-react-export-sources.mjs --check`.
- Current branch/worktree files are checked against the quality consolidation review
  groups through `scripts/verify-change-groups.ts`.
- Review readiness is checked through `scripts/verify-review-readiness.ts`, so
  every review group must have a proof document and top-level audit/manifest
  coverage before full QA can pass.
- Ignored per-group review bundles can be regenerated with
  `bun run review:groups` under `.quality-review-groups/`.
- The current file-level review manifest is checked through
  `scripts/verify-change-groups.ts --check-report`.

## Current Enforced Coverage Floor

`vitest.config.ts` currently enforces:

- statements: 23.38%
- branches: 15.67%
- functions: 11.26%
- lines: 22.95%

These floors are intentionally not the final quality target. They are a ratchet
that prevents the current baseline from sliding backward while higher-value
structural work continues.

## Verification Run

Focused quality-gate tests:

```bash
bun vitest run --config vitest.config.ts \
  scripts/export-review-groups.test.ts \
  scripts/git-hook-quality-gate.test.ts \
  scripts/quality-gates-config.test.ts \
  scripts/verify-build-bundles.test.ts \
  scripts/verify-change-groups.test.ts \
  scripts/verify-review-readiness.test.ts
```

Result:

- 6 test files passed.
- 24 tests passed.

Generated artifact provenance:

```bash
bun run verify:generated
```

Result:

- Passed.
- `packages/ship-fast-blocks/scripts/generate-react-export-sources.mjs --check`
  confirmed the committed JSON, compressed source manifest, runtime component
  names, runtime component loaders, and generated provenance lock match the
  generator output.

Capsule source classification:

```bash
bun run verify:capsule-sources
```

Result:

- Passed.
- `packages/ship-fast-blocks/src/capsules/source-classification.json` records
  375 production capsule source files: 341 marked Kimi/generated ports, 34
  unmarked source files, 184 files over 1,000 LOC, and a current max of 1,839
  LOC.

Review group classification:

```bash
bun run verify:change-groups
```

Result:

- Passed.
- Every changed file in the current worktree is assigned to a documented
  quality consolidation review group.

Review manifest freshness:

```bash
bun run verify:change-report
```

Result:

- Passed.
- `specs/architecture/quality_change_groups.md` matches the current file-level
  `git status --porcelain=v1 --untracked-files=all` output.

Review readiness proof:

```bash
bun run verify:review-readiness
```

Result:

- Passed.
- Every quality consolidation group has a proof document with required
  verification evidence, and both the audit and file-level manifest mention the
  group.

Review bundle export:

```bash
bun run review:groups
```

Result:

- Passed.
- Wrote ignored per-group file lists and patch bundles to
  `.quality-review-groups/`.

Real bundle verifier:

```bash
bun run verify:bundle
```

Result:

- Passed.

Hook installation path:

```bash
bun run prepare
git config core.hooksPath
```

Result:

- Passed.
- `core.hooksPath` is `.githooks`.
- `.githooks/pre-commit` and `.githooks/pre-push` are executable.

Full pre-push gate:

```bash
bun run verify:prepush
```

Result:

- Passed.
- The build still emits the known chunk-size warning, but bundle boundary
  verification passes.

## Review Notes

The focused tests cover:

- pre-commit planning for staged app code, test files, and config files;
- pre-push planning delegating to full QA;
- coverage and CI wiring in `package.json`, `vitest.config.ts`, and CI;
- review-group classification wiring in `verify:qa`;
- review-readiness proof wiring in `verify:qa`;
- ignored review-bundle export through `review:groups`;
- file-level review manifest freshness through `verify:change-report`;
- generated OpenUI/runtime artifact freshness wiring in `verify:qa`;
- bundle verifier acceptance of isolated chunks;
- bundle verifier rejection of generated-preview registry leakage, oversized
  router/source/OpenUI runtime chunks, and public eager capsule indexes.

This group is now reviewable as an enforcement layer. It should remain separate
from the Convex session decomposition and OpenUI runtime/bundle-boundary code
changes when preparing final review or commits.

## Remaining Work Before 11/10

The quality-gate group is verified, but the repo is still not 11/10 because the
local branch review scope remains broad. The next consolidation group should be
OpenUI runtime and bundle boundary, because that is the largest remaining
architecture and performance concern after Convex decomposition and enforcement
gates.
