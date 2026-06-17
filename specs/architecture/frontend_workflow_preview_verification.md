# Frontend Workflow And Preview Verification

Date: 2026-06-17 19:48 CEST
Repository: ship-fast
Group: Quality Consolidation Audit group 5

## Scope

This checkpoint covers the dashboard, preview, anonymous auth, chat refinement,
CMS edit, and browser verifier paths:

- `src/features/dashboard/components/Dashboard.tsx`
- `src/features/session/services/generation-launch-handoff.ts`
- `src/shared/auth/use-optional-auth.ts`
- `src/app/providers/provider-config.ts`
- `src/features/generation/components/GeneratedModulePreview.tsx`
- `src/features/session/server/*`
- `scripts/verify-dashboard-browser.mjs`
- `scripts/verify-chat-browser.mjs`
- `scripts/verify-cms-browser.mjs`

## Bugs Found By Real Browser Verification

Dashboard browser verification exposed several runtime issues that unit tests
did not catch:

- the browser verifier scripts still had headless cleanup calls despite the
  project requiring headed `agent-browser`;
- `sessions.completeGeneration` rendered OpenUI inside the default Convex
  runtime, which hit missing `MessageChannel` and memory/runtime limits;
- OpenUI SSR could return an `openui-error` HTML shell, which was previously
  persisted as a ready preview;
- `/generate/*` forced Clerk-backed providers even for anonymous sessions;
- `useAuth` and `useClerk` crashed when a route intentionally did not mount
  `<ClerkProvider>`;
- local Convex browser subscriptions can fail while the server-side session API
  remains healthy, leaving the dashboard stuck on the building shell.

## Fixes

- Kept all browser verifier calls headed by removing `headed: false`.
- Moved heavy OpenUI session completion into the Node runtime through
  `convex/session_completion.ts`, while preserving
  `internal.sessions.completeGeneration` as the compatibility delegator.
- Added an early `MessageChannel` shim for OpenUI SSR.
- Made completion fall back to the handoff HTML when OpenUI SSR returns an
  `openui-error` shell.
- Kept `/generate/*` on anonymous Convex providers.
- Added optional Clerk wrappers for both `useAuth` and `useClerk`.
- Extended `/api/sessions/:sessionId` with preview/module/spec fields and added
  Dashboard polling fallback while live Convex query data is unavailable.
- Extracted the generation-launch sessionStorage handoff into
  `src/features/session/services/generation-launch-handoff.ts` so Home and
  Dashboard share one tested storage contract instead of duplicating the key.

## Verification Commands

Focused unit and helper tests:

```bash
bun vitest run --config vitest.config.ts \
  convex/lib/session_api_response_helpers.test.ts \
  src/features/dashboard/components/dashboard-session-lookup.test.ts \
  src/features/dashboard/components/Dashboard.test.tsx \
  src/shared/auth/use-optional-auth.test.ts
```

Result:

```text
Test Files  4 passed (4)
Tests       16 passed (16)
```

Generation launch handoff contract:

```bash
bun vitest run --config vitest.config.ts \
  src/features/session/services/generation-launch-handoff.test.ts \
  src/features/dashboard/components/dashboard-launch-handoff.test.ts \
  src/features/dashboard/components/Dashboard.test.tsx \
  src/features/home/hooks/usePromptHomeController.test.ts
```

Result:

```text
Test Files  4 passed (4)
Tests       21 passed (21)
```

OpenUI/Convex completion tests:

```bash
bun vitest run --config vitest.config.ts \
  convex/lib/session_generation_action_helpers.test.ts \
  convex/generation-view.test.ts \
  convex/usage-metrics.test.ts \
  packages/ship-fast-engine/src/openui-ssr.test.js \
  packages/ship-fast-engine/src/openui-ssr-runtime.test.js
```

Result:

```text
Test Files  5 passed (5)
Tests       33 passed (33)
```

Browser verification setup:

```bash
bunx convex dev --tail-logs disable --env-file <sanitized local Convex env>
VITE_CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210 \
VITE_CONVEX_URL=http://127.0.0.1:3210 \
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210 \
CONVEX_URL=http://127.0.0.1:3210 \
bun run dev
```

Dashboard browser verifier:

```bash
SHIP_FAST_CONVEX_ENV_FILE=<sanitized local Convex env> \
bun run verify:dashboard-browser -- --base-url=http://localhost:3000 --timeout-ms=180000
```

Result: passed. It created a ready session, displayed the generated preview,
published it, reloaded the dashboard, and confirmed Convex deployment status.

Chat browser verifier:

```bash
SHIP_FAST_CONVEX_ENV_FILE=<sanitized local Convex env> \
bun run verify:chat-browser -- --base-url=http://localhost:3000 --timeout-ms=180000
```

Result: passed. It refined the preview headline, reloaded, and confirmed
preview/source/spec/chat-message persistence.

CMS browser verifier:

```bash
SHIP_FAST_CONVEX_ENV_FILE=<sanitized local Convex env> \
bun run verify:cms-browser -- --base-url=http://localhost:3000 --timeout-ms=180000
```

Result: passed. It edited `hero.headline`, reloaded, and confirmed preview,
site-spec, preview history, and CMS content persistence.

## Status

Frontend workflow group now has focused unit coverage and real headed-browser
coverage across dashboard publish/reload, chat refinement, and CMS editing.
The remaining repo-level risk is consolidation of the broad local branch review
scope, not an unverified frontend preview path.
