# OpenUI Runtime And Bundle Boundary Verification

Date: 2026-06-17 18:42 CEST
Repository: ship-fast
Group: Quality Consolidation Audit group 3

## Scope

This checkpoint covers the OpenUI runtime and bundle boundary work:

- `vite.config.ts`
- `packages/ship-fast-blocks/src/runtime.ts`
- `packages/ship-fast-blocks/src/runtime-library.ts`
- `packages/ship-fast-blocks/src/component-names.ts`
- `packages/ship-fast-blocks/src/theme.ts`
- `packages/ship-fast-blocks/src/generated/*`
- `src/island/openui/OpenUIViewer.tsx`
- `src/island/openui/openui-runtime-preprocess.ts`
- `packages/ship-fast-engine/src/openui-ssr.js`
- `src/features/exports/services/openui-export-types.ts`
- `src/features/exports/services/openui-html-export-builder.ts`
- `src/features/exports/services/openui-export-builder.ts`
- `src/features/exports/server/create-export-response.ts`
- `scripts/verify-build-bundles.ts`
- export builder tests for OpenUI and SFF HTML output

## Boundary Contract

The browser OpenUI preview path should import from `@ship-fast/blocks/runtime`,
not the eager `@ship-fast/blocks` barrel. Runtime loading should:

- preprocess streamed OpenUI in the island without importing engine metadata;
- extract component names from the current OpenUI response;
- always include the `Stack` root capsule;
- dynamically load only the capsules needed by that response;
- keep generated source manifests behind `@ship-fast/blocks/generated`;
- split generated metadata, prompt specs, primitives, sections, capsules, and
  runtime core into separate build chunks.

React/Next package export generation is allowed to import the eager block
library and the generated compressed React source manifest because it builds
downloadable app artifacts. Standalone HTML export must stay on the
response-scoped runtime path and must not share those full-catalog package
imports.

The core server SSR path should also avoid the eager `@ship-fast/blocks` barrel:
`packages/ship-fast-engine/src/openui-ssr.js` loads
`@ship-fast/blocks/runtime` and builds a per-response library with
`loadOpenUIRuntimeLibrary(preprocessed)`. This keeps Convex completion,
workspace preview rendering, and standalone HTML export rendering on the same
response-scoped contract. React/Next package exports may still use the full
catalog while they materialize component source files.

## Current Evidence

Source inventory after generation:

- `packages/ship-fast-blocks/src/generated/react-export-sources.json`:
  19,542,323 bytes
- `packages/ship-fast-blocks/src/generated/react-export-sources.compressed.ts`:
  2,080,777 bytes
- `packages/ship-fast-blocks/src/generated/runtime-component-loaders.ts`:
  210,058 bytes
- `packages/ship-fast-blocks/src/generated/react-export-sources.provenance.json`:
  records the generator, source roots, generated outputs, and 1,192 component
  input files
- `packages/ship-fast-blocks/src/runtime.ts`: 825 bytes
- `src/island/openui/OpenUIViewer.tsx`: 8,634 bytes
- `src/features/exports/services/openui-html-export-builder.ts`: response-scoped
  standalone HTML export builder
- `scripts/verify-build-bundles.ts`: includes explicit router and HTML export
  chunk absence checks for full-catalog package internals

The generator was run successfully:

```bash
bun run generate:react-export-sources
```

Output:

```text
Wrote 1192 component sources to src/generated/react-export-sources.json
Wrote compressed component sources to src/generated/react-export-sources.compressed.ts
Wrote runtime component names to src/generated/runtime-component-names.ts
Wrote runtime component loaders to src/generated/runtime-component-loaders.ts
Wrote generated artifact provenance to src/generated/react-export-sources.provenance.json
```

The generator check now validates the deterministic provenance lock together
with the generated JSON, compressed source manifest, runtime component names,
and runtime component loaders.

## Added Guardrail

Added `scripts/vite-openui-boundaries.test.ts`.

This source-level invariant test protects the Vite chunking contract directly:

- generated block metadata must use `openui-generated-metadata`;
- generated metadata must be excluded from the runtime chunk group;
- prompt specs must use `openui-prompt-spec`;
- runtime modules must split into primitive, section, capsule, and core chunk
  groups;
- the runtime group must use `getOpenUIRuntimeChunkName` for both `name` and
  membership testing.

This closes the previous gap where Vite chunking was only indirectly covered by
post-build bundle checks.

Added a runtime-loader source invariant in
`packages/ship-fast-blocks/src/runtime-library.test.ts`.

This test protects the generated browser runtime manifest directly:

- `runtime-library.ts` may depend on `runtime-component-loaders.ts`, but not
  the eager block library or generated source manifest subpath;
- `runtime-component-loaders.ts` must keep dynamic `import(...)` entries for
  registry and capsule modules;
- runtime loaders must not import the root blocks barrel, full library,
  `react-export-sources`, or component-spec metadata.

Added a generated-artifact provenance invariant in
`packages/ship-fast-blocks/src/generated-provenance.test.ts`.

This test protects the generator/catalog maintenance boundary directly:

- the provenance file must name
  `packages/ship-fast-blocks/scripts/generate-react-export-sources.mjs`;
- source roots must be exactly `src/registry` and `src/capsules`;
- every declared generated output must exist;
- the provenance component list must match `runtime-component-names.ts`;
- every recorded component source must exist under registry or capsules.

Added standalone HTML export boundary checks in
`src/features/exports/services/openui-export-builder.test.ts`,
`src/features/exports/server/create-export-response.test.ts`, and
`scripts/verify-build-bundles.ts`.

These tests and bundle rules protect the export split directly:

- `target=html` downloads import `openui-html-export-builder`;
- React/Next downloads import the full `openui-export-builder`;
- the HTML builder imports `@ship-fast/blocks/runtime` and calls
  `loadOpenUIRuntimeLibrary(cleaned)`;
- the HTML builder must not import `@ship-fast/blocks`,
  `@ship-fast/blocks/generated`, `reactExportSourcesBase64`,
  `brotliDecompressSync`, `typescript`, or the full package builder;
- built router and `openui-html-export-builder` chunks must not contain
  `reactExportSourcesBase64`, `brotliDecompressSync`, or `require_typescript`.

## GitNexus Impact

Key OpenUI runtime symbols were checked:

- `OpenUIViewer`, `src/island/openui/OpenUIViewer.tsx`: LOW risk, no indexed
  upstream callers.
- `loadOpenUIRuntimeLibrary`,
  `packages/ship-fast-blocks/src/runtime-library.ts`: LOW risk, one direct
  caller, `OpenUIViewer`.
- `getOpenUIRuntimeChunkName`, `vite.config.ts`: LOW risk, one direct indexed
  caller in the Vite code-splitting group test function.

The first `getOpenUIRuntimeChunkName` lookup was ambiguous between a function
and const symbol, so the function UID was used for the final impact check.

## Verification Commands

New Vite boundary invariant:

```bash
bun vitest run --config vitest.config.ts scripts/vite-openui-boundaries.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       3 passed (3)
```

Focused OpenUI runtime, bundle boundary, SSR, and export split group:

```bash
bun vitest run --config vitest.config.ts \
  packages/ship-fast-blocks/src/index.test.ts \
  packages/ship-fast-blocks/src/runtime-library.test.ts \
  src/island/openui/openui-runtime-preprocess.test.ts \
  scripts/verify-build-bundles.test.ts \
  scripts/vite-openui-boundaries.test.ts \
  src/features/generation/components/GeneratedModulePreview.test.tsx \
  src/features/exports/services/openui-export-builder.test.ts \
  src/features/exports/server/create-export-response.test.ts \
  packages/ship-fast-engine/src/openui-ssr.test.js \
  packages/ship-fast-engine/src/openui-ssr-runtime.test.js \
  packages/ship-fast-engine/src/genui/ssr-render-crashes.test.ts \
  packages/ship-fast-engine/src/renderers/index.test.ts
```

Result:

```text
Test Files  12 passed (12)
Tests       56 passed (56)
```

Bundle boundary verifier:

```bash
bun run verify:bundle
```

Result:

```text
Bundle boundary verification passed
```

Server export compatibility:

```bash
bun vitest run --config vitest.config.ts \
  src/features/exports/services/openui-export-builder.test.ts \
  src/features/exports/server/create-export-response.test.ts
```

Result:

```text
Test Files  2 passed (2)
Tests       12 passed (12)
```

Response-scoped SSR migration:

```bash
bun vitest run --config vitest.config.ts \
  packages/ship-fast-engine/src/openui-ssr.test.js \
  packages/ship-fast-engine/src/openui-ssr-runtime.test.js \
  packages/ship-fast-engine/src/genui/ssr-render-crashes.test.ts \
  packages/ship-fast-engine/src/renderers/index.test.ts \
  src/features/exports/services/openui-export-builder.test.ts \
  src/features/exports/server/create-export-response.test.ts
```

Result:

```text
Test Files  6 passed (6)
Tests       29 passed (29)
```

Build and bundle verification:

```bash
bun run build && bun run verify:bundle
```

Result:

```text
Bundle boundary verification passed
```

Whitespace check:

```bash
git diff --check -- scripts/vite-openui-boundaries.test.ts
```

Result: passed with no output.

## Status

This group is verified at the source, unit, generated-manifest, bundle,
server-export, and response-scoped SSR levels. It is still part of a broad local
branch review scope, so it should be reviewed as one coherent OpenUI
runtime/bundle changeset rather
than mixed with Convex, billing, or dashboard workflow work.
