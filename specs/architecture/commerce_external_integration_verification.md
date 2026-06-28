# Commerce And External Integration Verification

Date: 2026-06-17 18:49 CEST
Repository: ship-fast
Group: Quality Consolidation Audit group 6

## Scope

This checkpoint covers payment, Medusa commerce,
and stock image provider boundaries:

- `src/routes/api/medusa-store.cart.ts`
- `src/routes/api/medusa-store.cart.$id.ts`
- `src/routes/api/medusa-store.cart.line-items.ts`
- `src/routes/api/medusa-checkout.ts`
- `src/features/commerce/server/commerce-api-response.ts`
- `src/features/commerce/server/medusa-store-env.ts`
- `src/features/commerce/server/openui-medusa-integration.test.tsx`
- `src/billing/payments.ts`
- `src/lib/stock-image.ts`
- `packages/ship-fast-blocks/src/lib/image-search-query.test.ts`
- `convex/lib/session_commerce_helpers.ts`

## Boundary Contract

Commerce and external integrations should be locally testable without real
payment, Medusa, or stock image services. The product contract is:

- billing access decisions are deterministic under mocked Convex and payment
  configuration;
- stock image resolution prefers configured providers but has a deterministic
  fallback;
- Medusa provisioning records session-scoped configuration without requiring
  live external services;
- generated OpenUI Medusa providers read session-scoped config, not stale
  provisioning endpoints;
- Medusa Store API route responses preserve stable JSON envelopes and HTTP
  status codes.

## Added Guardrail

Added `src/routes/api/-medusa-store-routes.test.ts`.

This test directly exercises the exported TanStack server handler configs with
mocked `createFileRoute`, Medusa env helpers, and `fetch`. It covers:

- cart creation returns `503` JSON and does not call `fetch` when the
  publishable key is missing;
- cart creation fetches regions, creates a cart, and returns `{ cart }`;
- cart retrieval preserves upstream failure status while returning
  `{ error: "cart retrieve failed" }`;
- line item creation validates `cart_id` and `variant_id` before calling
  Medusa;
- line item quantity is clamped to at least `1` and returns `{ cart }`;
- checkout proxies the payload and preserves the upstream success envelope.

## GitNexus Impact

GitNexus did not have these TanStack API files indexed as route nodes, so
`api_impact` could not find route entries for:

- `/api/medusa-store/cart`
- `/api/medusa-store/cart/$id`
- `/api/medusa-store/cart/line-items`
- `/api/medusa-checkout`

Symbol impact was checked instead:

- `POST`, `src/routes/api/medusa-store.cart.ts`: LOW risk, no indexed upstream
  callers.
- `GET`, `src/routes/api/medusa-store.cart.$id.ts`: LOW risk, no indexed
  upstream callers.
- `POST`, `src/routes/api/medusa-store.cart.line-items.ts`: LOW risk, no
  indexed upstream callers.
- `POST`, `src/routes/api/medusa-checkout.ts`: LOW risk, no indexed upstream
  callers.

The missing route-node indexing is a GitNexus coverage limitation, not proof
that the routes are unused.

## Verification Commands

New Medusa route contract test:

```bash
bun vitest run --config vitest.config.ts src/routes/api/-medusa-store-routes.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       6 passed (6)
```

Focused commerce and external integration group:

```bash
bun vitest run --config vitest.config.ts \
  src/routes/api/-medusa-store-routes.test.ts \
  src/features/commerce/server/medusa-store-env.test.ts \
  src/features/commerce/server/commerce-api-response.test.ts \
  src/features/commerce/server/openui-medusa-integration.test.tsx \
  src/billing/payments.test.ts \
  src/lib/stock-image.test.ts \
  packages/ship-fast-blocks/src/lib/image-search-query.test.ts \
  convex/medusa.test.ts \
  convex/lib/session_commerce_helpers.test.ts
```

Result:

```text
Test Files  9 passed (9)
Tests       65 passed (65)
```

Whitespace check:

```bash
git diff --check -- src/routes/api/-medusa-store-routes.test.ts \
  specs/architecture/commerce_external_integration_verification.md
```

Result: passed with no output.

Route discovery check:

```bash
bun run dev
curl -I http://localhost:3000/
```

Result: Vite started on `http://localhost:3000/` with no TanStack route warning
for the Medusa route-contract test, and the homepage returned `HTTP/1.1 200`.

## Status

This group now has route-level Medusa JSON contract coverage in addition to the
existing service-layer, billing, stock image, OpenUI Medusa provider, and Convex
commerce helper tests. The route-contract test is prefixed with `-` so it is
kept out of TanStack route discovery. It remains part of the broad dirty
worktree and should be reviewed as one coherent commerce/external integration
changeset.
