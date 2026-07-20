# Task 3 Report: Rich Medusa Seed Payload and Store Readback

## Implementation commit

- `8aa9a909e6d6ee3800d4b3c3e31d6aac5981fb67`
- Subject: `feat(commerce): preserve rich Medusa catalogs`
- Base: `1455f3841b72c1f8e1d9a66596ba0178c3094946`
- Branch: `codex/medusa-commerce-v2`
- Push: not performed

## Files

- `src/features/commerce/services/generated-commerce-products.ts`
  - Exported the safe generated-product normalizer already used by site-spec extraction.
- `src/features/commerce/server/commerce-api-response.ts`
  - Session provisioning now uses the shared rich request normalizer.
- `src/features/commerce/server/commerce-tenant-api-response.ts`
  - Deployment provisioning uses the same request normalizer.
  - Deployment Store reads use the shared Medusa response normalizer and field contract.
- `src/features/commerce/server/medusa-product-sync.ts`
  - Creates rich product/options/variant/image/price/metadata payloads.
  - Keeps existing provider products authoritative and update-free.
  - Adds deterministic SKU fallback and isolated managed-inventory preparation.
- `src/features/commerce/server/medusa-product-read.ts`
  - Session Store reads use the shared Medusa response normalizer and field contract.
- `src/features/commerce/server/medusa-store-product.ts`
  - Shared session/deployment Store response field selection and normalization.
- Behavioral coverage:
  - `commerce-api-response.test.ts`
  - `commerce-tenant-api-response.test.ts`
  - `medusa-product-sync.test.ts`
  - `medusa-product-read.test.ts`

## TDD red/green evidence

### Request boundaries

- RED: deployment rich request arrived at `syncInitialProducts` with only legacy
  `title`/`handle`/`price`/`description`; collections, images, options, IDs,
  tags, thumbnail, and variants were absent.
- GREEN:
  `rtk proxy bun run test -- src/features/commerce/server/commerce-tenant-api-response.test.ts -t "preserves rich generated products at the deployment provisioning boundary"`
  → 1 passed.
- Session boundary:
  `rtk proxy bun run test -- src/features/commerce/server/commerce-api-response.test.ts -t "preserves rich products from the session request through the Admin create body"`
  → 1 passed.

### Admin product body

- RED: exact rich-body test received the legacy single `Default` variant and
  omitted rich images/options/tags/collection/source metadata/SKUs/prices.
- GREEN:
  `rtk proxy bun run test -- src/features/commerce/server/medusa-product-sync.test.ts -t "creates an exact rich Admin product payload"`
  → 1 passed.
- Full sync module after legacy/existing-product coverage:
  `rtk proxy bun run test -- src/features/commerce/server/medusa-product-sync.test.ts`
  → 11 passed.

### Inventory

- RED: managed variant test observed only product creation; no stock-location,
  inventory-item, or inventory-level calls.
- GREEN:
  `rtk proxy bun run test -- src/features/commerce/server/medusa-product-sync.test.ts -t "initializes requested inventory only for managed variants"`
  → 1 passed.
- Covered sequence:
  1. `GET /admin/stock-locations?limit=1`
  2. `GET /admin/inventory-items?sku=<sku>&limit=1`
  3. `POST /admin/inventory-items` only when absent
  4. `GET /admin/inventory-levels?inventory_item_id=<id>&location_id=<id>&limit=1`
  5. `POST /admin/inventory-items/<id>/location-levels` only when absent
  6. `POST /admin/products` with variant `inventory_items` links
- A retry test proves existing inventory items and levels are reused.
- Unmanaged variants make no inventory-item or location-level requests.

### Store readback and parity

- RED: response exposed only title/handle/description/sourceHandle/first price;
  provider IDs, stable source IDs, images, options, collections, tags, all
  variants, inventory, raw prices, original prices, and lowercase currency were
  absent. Deployment requested only calculated price fields.
- GREEN:
  `rtk proxy bun run test -- src/features/commerce/server/medusa-product-read.test.ts -t "requests rich Store fields and preserves every provider variant losslessly"`
  → 1 passed.
- Parity:
  `rtk proxy bun run test -- src/features/commerce/server/commerce-tenant-api-response.test.ts -t "keeps deployment and session Store readback on the same rich normalization contract"`
  → 1 passed.
- `sourceHandle` remains as a temporary compatibility alias for the current
  preview synchronizer while the response also supplies shared `sourceId`.

## Verification

- `rtk proxy bun run test -- src/features/commerce`
  → 14 files passed, 132 tests passed.
- Changed production subset:
  `rtk proxy bunx tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler src/features/commerce/contracts.ts src/features/commerce/services/generated-commerce-products.ts src/features/commerce/server/medusa-store-product.ts src/features/commerce/server/medusa-product-sync.ts`
  → exit 0.
- `rtk proxy bunx eslint src/features/commerce/server/medusa-store-product.ts --max-warnings=0`
  → exit 0.
- Prettier check for all changed source/test files → exit 0.
- `as any` search across changed production files → 0 matches.

## Medusa v2 contract assumptions

- Confirmed from current Medusa v2 documentation:
  - Admin product variants accept `prices`, `manage_inventory`, metadata,
    option values, and `inventory_items`.
  - Product creation accepts images, thumbnail, `collection_id`, tag IDs,
    shipping profile, and sales channels.
  - Location levels are separate from product creation at
    `POST /admin/inventory-items/{inventory_item_id}/location-levels`.
- The installed integration does not expose an atomic product + inventory-level
  create contract. Inventory is therefore isolated behind the explicit,
  idempotent sequence above.
- Adapter assumptions made explicit and covered by fetch-contract tests:
  - `GET /admin/inventory-items` supports exact `sku` filtering.
  - `GET /admin/inventory-levels` supports `inventory_item_id` and
    `location_id` filtering.
  - `POST /admin/inventory-items` returns `inventory_item.id`.
  - The first stock location is the tenant location in the current
    container-per-tenant deployment.
- Generated collection/tag relations are sent only when their `sourceId` is
  supplied as the Admin relation ID; label-only relations are not invented.

## GitNexus

- Refreshed exact worktree index:
  27,578 nodes, 69,015 edges, 899 clusters, 294 flows.
- Required upstream impacts:
  - `syncGeneratedProductsToMedusa`: LOW, 5 impacted, 3 direct.
  - `createSessionMedusaProductsResponse`: LOW, 1 impacted, 1 direct.
  - deployment `readTenantProducts`: LOW, 7 impacted, 2 direct.
- Staged change detection:
  10 files, 16 indexed symbols, 0 affected processes, LOW risk.

## Remaining risks

- Full repository `rtk tsc` is not a usable gate at this base: it reports 4,288
  pre-existing errors across 1,175 files. The changed production subset passes
  strict isolated TypeScript checking.
- Inventory REST behavior is contract-tested but not exercised against a live
  Medusa instance in this session; no live tenant credentials/runtime were
  available.
- The tenant stock-location assumption should be replaced with an explicit
  configured location ID if a future tenant can own multiple stock locations.
