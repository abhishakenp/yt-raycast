# Stable Engine→Artifact Contract

## Overview

This document defines the stable contract between the engine and the exports/deployments features. The purpose of this contract is to decouple exports and deployments from engine internals, making them resilient to engine changes.

## Problem Statement

Previously, exports and deployments depended directly on engine internals:

- `preprocessOpenUIResponse` - OpenUI code normalization
- `renderOpenUIToHTMLWithTheme` - OpenUI to HTML rendering
- `parseOpenUIForExport` - OpenUI parsing
- Component spec and capsule structures

When the engine changed its internal implementation, exports and deployments would break.

## Solution

The engine now produces a **stable artifact** containing the final rendered HTML and metadata. Exports and deployments consume this stable artifact instead of engine internals.

## Stable Artifact Contract

### Core Interface

```typescript
type StableEngineArtifact = {
  // Final rendered HTML - the complete, ready-to-use HTML document
  html: string

  // Site specification as structured JSON
  siteSpec?: SiteSpec

  // SEO metadata
  seo?: SiteSeoMetadata

  // Route/page structure
  routes?: RouteInfo[]

  // Lakebed-specific data (for deployments)
  lakebedData?: LakebedArtifactData
}
```

### Detailed Types

```typescript
type SiteSpec = {
  projectName?: string
  brand?: string
  themeName?: string
  pages?: PageSpec[]
  seo?: SeoSpec
}

type PageSpec = {
  title?: string
  name?: string
  route?: string
  seo?: {
    noIndex?: boolean
    description?: string
  }
}

type SiteSeoMetadata = {
  title?: string
  description?: string
  siteUrl?: string
  llmsTxtContent?: string
}

type RouteInfo = {
  path: string
  label: string
  componentName?: string
}

type LakebedArtifactData = {
  seedData?: Record<string, Array<Record<string, unknown>>>
  syncSecret?: string
}
```

### Export Input

```typescript
type StableExportInput = {
  artifact: StableEngineArtifact
  sessionId: string
  target: 'html' | 'react' | 'next' | 'lakebed'
  theme?: ThemeInfo
  selectedBrandLogo?: BrandLogoSelection | null
  includeBadge?: boolean
  prompt?: string
  formatCache?: Record<string, string>
  onProgress?: (stageKey: string) => void | Promise<void>
}
```

## Implementation

### Stable Export Builders

The following builders work with stable artifacts and **do not depend on engine internals**:

1. **`stable-html-export-builder.ts`** - Builds HTML exports from final HTML
2. **`stable-lakebed-export-builder.ts`** - Builds Lakebed projects from final HTML
3. **`stable-export-builder.ts`** - Main entry point for stable exports

### Adapter Layer

The adapter layer (`stable-artifact-adapter.ts`) provides:

- Conversion between stable and legacy formats
- Backwards compatibility during migration
- Gradual migration path

### Deployment Adapter

The deployment adapter (`stable-deployment-adapter.ts`) allows deployments to work with stable artifacts without depending on engine internals.

## Migration Path

### Current State

- Legacy builders (`openui-export-builder.ts`, `openui-html-export-builder.ts`) still depend on engine internals
- Stable builders are implemented and tested
- Both paths coexist for gradual migration

### Migration Steps

1. **Engine produces stable artifacts** - Engine should output `StableEngineArtifact` in addition to or instead of raw OpenUI source
2. **Update export endpoints** - Use `buildExportFromStableArtifact` instead of `buildOpenUIArtifactFiles`
3. **Update deployment endpoints** - Use `deployStableArtifactToLakebed` instead of legacy builders
4. **Remove legacy builders** - Once migration is complete, remove legacy builders and their engine dependencies

## Verification

### Tests

Run the decoupling verification tests:

```bash
bun test src/features/exports/services/stable-export-decoupling.test.ts
```

These tests verify:

- Stable files do not import from `@ship-fast/engine`
- Stable files do not import from `@openuidev/lang-core`
- Legacy files still have engine dependencies (as expected)

### Validation

Use the validator to check artifacts conform to the contract:

```typescript
import { validateStableArtifact } from './stable-artifact-contract'

const result = validateStableArtifact(artifact)
if (!result.valid) {
  console.error('Invalid artifact:', result.errors)
}
```

## Benefits

1. **Engine independence** - Exports/deployments don't break when engine internals change
2. **Clear contract** - Well-defined interface between engine and consumers
3. **Testability** - Stable artifacts can be easily mocked for testing
4. **Performance** - No need to re-parse or re-render; work with final HTML directly
5. **Flexibility** - Engine implementation can change without affecting consumers

## File Structure

```
src/features/exports/services/
├── stable-artifact-contract.ts          # Contract definition
├── stable-artifact-contract.test.ts     # Contract tests
├── stable-artifact-adapter.ts           # Adapter layer
├── stable-html-export-builder.ts        # HTML export builder
├── stable-lakebed-export-builder.ts     # Lakebed export builder
├── stable-export-builder.ts             # Main export builder
├── stable-export-decoupling.test.ts     # Decoupling verification tests
└── [legacy files...]                    # Legacy builders (to be removed)

src/features/deployments/services/
└── stable-deployment-adapter.ts         # Deployment adapter
```

## Contract Stability Guarantees

The stable contract is guaranteed to be stable across engine versions. Any breaking changes to the contract will be:

1. **Versioned** - New contract versions will be clearly labeled
2. **Documented** - Migration guides will be provided
3. **Backwards compatible** - Old versions will be supported for a transition period

## Future Enhancements

1. **React/Next.js stable builders** - Implement stable builders for React and Next.js exports
2. **Schema inference** - Extract database schema from HTML for Lakebed deployments
3. **Component extraction** - Extract reusable components from final HTML
4. **Incremental updates** - Support incremental artifact updates for faster rebuilds
