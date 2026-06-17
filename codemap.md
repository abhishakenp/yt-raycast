# Repository Atlas: ship-fast

## Project Responsibility

Ship Fast is a TanStack Start application for generating, previewing, editing, exporting, and deploying generated websites. The frontend shell coordinates session creation, live preview, inline editing, gallery browsing, billing, and export/download workflows. Convex stores session state and entitlements. The `packages/` workspace contains the generation engine, OpenUI block library, AEO helpers, and Lakebed data integrations.

## System Entry Points

| Entry Point                                                | Responsibility                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `package.json`                                             | Workspace scripts, quality gates, app dependencies, and Bun runtime target.                            |
| `vite.config.ts`                                           | TanStack Start/Vite build, route generation, SSR/Nitro output, and bundle behavior.                    |
| `src/router.tsx` and `src/routes/`                         | Application route tree, API routes, dashboard route, gallery, marketing pages, export/download routes. |
| `src/features/home/components/HomePage.tsx`                | Homepage generation entry UI and gallery surface.                                                      |
| `src/features/dashboard/components/Dashboard.tsx`          | Session workspace: live preview, status, editing tools, export/deploy panels, chat, and activity.      |
| `convex/sessions.ts`                                       | Core session backend mutations/queries for generation status, previews, ownership, and exports.        |
| `packages/ship-fast-engine/src/pipeline/runner-v2.ts`      | Main generation pipeline orchestration and persisted artifact handoff.                                 |
| `packages/ship-fast-engine/src/pipeline/phase-sff-html.ts` | SFF HTML homepage production path.                                                                     |
| `packages/ship-fast-blocks/src/library.ts`                 | OpenUI renderer library assembled from registry blocks and capsules.                                   |

## Directory Map

| Directory                     | Responsibility Summary                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/`             | Shared React UI primitives and GenUI preview shell components.                                                                                         |
| `src/features/`               | Feature modules organized by product area: dashboard, exports, gallery, home, session streaming, editing, billing, admin, chat, brand, and agentation. |
| `src/island/openui/`          | Browser-side OpenUI rendering island, translation provider, runtime preprocessing, and preview providers.                                              |
| `src/lib/`                    | Shared browser/server helpers for auth, image context, home flow, and utility concerns.                                                                |
| `src/routes/`                 | TanStack file routes and API endpoints; route modules should delegate behavior to feature/server modules.                                              |
| `convex/`                     | Convex schema-adjacent backend functions, tests, entitlement/session state, and billing/deployment integrations.                                       |
| `packages/ship-fast-engine/`  | Website generation engine, prompt/planner phases, renderers, export SSR, clone flow, and artifact writing.                                             |
| `packages/ship-fast-blocks/`  | OpenUI component registry, capsules, UI primitives, generated component metadata, and exportable block source manifests.                               |
| `packages/ship-fast-lakebed/` | Lakebed client/provider and integration context used by generated commerce/CMS blocks.                                                                 |
| `packages/ship-fast-aeo/`     | SEO/AEO helpers for generated preview metadata, robots, sitemap, and llms output.                                                                      |
| `scripts/`                    | Verification, deployment, generation, and maintenance scripts used by package scripts and CI.                                                          |
| `public/`                     | Static assets and browser scripts served to previews and generated artifacts.                                                                          |

## Data And Control Flow

1. User starts a generation from `HomePage` or dashboard controls.
2. Frontend writes/reads session state through Convex APIs in `convex/sessions.ts`.
3. The engine pipeline in `packages/ship-fast-engine/src/pipeline/runner-v2.ts` runs site-spec, homepage, OpenUI/SFF HTML, export, and artifact phases.
4. Preview state flows back to the dashboard through Convex session queries and event-stream routes in `src/features/session/server/`.
5. `GeneratedModulePreview` renders SFF HTML directly in an iframe, or lazy-loads `OpenUIViewer` for OpenUI programs.
6. `OpenUIViewer` normalizes runtime OpenUI source, wraps renderer providers, and renders via the `@ship-fast/blocks` library.
7. Export routes call `createExportResponse`, which checks entitlement/session ownership first, then dynamically loads `openui-export-builder` only for ready downloads.
8. Gallery routes use session metadata, generated thumbnails, or lightweight preview fallbacks without owning generation logic.

## Integration Boundaries

| Boundary             | Contract                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend to Convex   | Use generated `api` references and feature/server wrappers; preserve anonymous owner secret handling for low-friction sessions.                              |
| Dashboard to Preview | Prefer URL/view-state changes and live reload events; avoid iframe-wrapping the homepage behind a session unless required.                                   |
| Engine to Blocks     | Engine may consume full component metadata for generation and export; browser runtime should avoid generated source/spec manifests unless explicitly needed. |
| Export Download      | Entitlement and staleness checks happen before loading heavy export-building dependencies.                                                                   |
| Generated UI         | Runtime renderer uses `@ship-fast/blocks` and `OpenUIIntegrationProviders`; generated-data manifests live behind `@ship-fast/blocks/generated`.              |
| External Services    | Use Doppler-provided env for real keys; mock external dependencies in local tests.                                                                           |

## Quality Gates

| Gate      | Command             |
| --------- | ------------------- |
| Lint      | `bun run lint`      |
| Typecheck | `bun run typecheck` |
| Tests     | `bun run test`      |
| Full QA   | `bun run verify:qa` |

The full QA path runs lint with zero warnings, strict TypeScript, Vitest, and the production build.
