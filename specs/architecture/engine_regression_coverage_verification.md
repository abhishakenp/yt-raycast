# Engine Regression Coverage Verification

Date: 2026-06-17 18:56 CEST
Repository: ship-fast
Group: Quality Consolidation Audit group 4

## Scope

This checkpoint covers generation engine regression coverage:

- `packages/ship-fast-engine/src/spec/*`
- `packages/ship-fast-engine/src/clone/*`
- `packages/ship-fast-engine/src/llm/*`
- `packages/ship-fast-engine/src/pipeline/*`
- `packages/ship-fast-engine/src/renderers/*`
- `packages/ship-fast-engine/src/genui/*`
- `vitest.config.ts` engine test globs

## Boundary Contract

Engine fixes must remain generic. Production behavior should route by site kind,
structural pattern, prompt grammar, and validated site-spec contracts rather
than accumulating named prompt or vertical branches.

This group protects the repeated regression classes called out in the
consolidation audit:

- fallback site specs must validate;
- blog/publication homes must include a publication structure;
- clone crawling must enforce SSRF protections and stable URL graph behavior;
- LLM retry and provider handling must be deterministic under mocks;
- renderer output must avoid leaking internal OpenUI/generation details;
- pipeline phases must preserve language, brand, media, and SFF HTML behavior.

## Bug Found And Fixed

Added a generic blog fallback invariant to
`packages/ship-fast-engine/src/spec/defaults.test.js` using arbitrary blog
subjects:

- `Independent magazine about urban gardening`
- `Founder journal for robotics operations`

The test exposed a real production mismatch:

- `buildFallbackSiteSpec({ siteType: "blog" })` emitted `newsletter` and
  `content` sections;
- `validateSiteSpec` rejected those section types because
  `SUPPORTED_SECTION_TYPES` did not include them;
- blog CTA defaults fell through to generic pricing/contact CTAs even though
  blog fallback pages are `Home`, `Blog`, `About`, and `Contact`.

The production fix in `packages/ship-fast-engine/src/spec/defaults.js` is
scoped to:

- add `newsletter` and `content` to `SUPPORTED_SECTION_TYPES`;
- add a blog branch in `defaultNavActions` that targets `Blog` and `About`.

The invariant also asserts that generated blog fallback specs do not contain
the named demo tokens `blog-dogs` or `KubeMeter`.

> **Note:** The site-spec generation path (`buildFallbackSiteSpec`,
> `validateSiteSpec`, `defaults.js`, etc.) has since been removed as dead
> code. The V2 engine goes straight to generation without a blueprint phase.
> The V1 capsule engine never used it. This section is kept for historical
> context.

## GitNexus Impact

GitNexus impact was checked before the production edit:

- `SUPPORTED_SECTION_TYPES`, `packages/ship-fast-engine/src/spec/defaults.js`:
  LOW risk, no indexed upstream callers.
- `defaultSectionsForSiteType`,
  `packages/ship-fast-engine/src/spec/defaults.js`: LOW risk, one direct
  indexed caller.
- `defaultNavActions`, `packages/ship-fast-engine/src/spec/defaults.js`: HIGH
  risk because it feeds `buildFallbackSiteSpec`, site-spec generation,
  migration/sanitization, and renderer preparation.

Because `defaultNavActions` is HIGH risk, the production edit was intentionally
limited to a `siteType === "blog"` branch and verified through focused and broad
engine tests.

## Verification Commands

Focused blog fallback test:

```bash
bun vitest run --config vitest.config.ts packages/ship-fast-engine/src/spec/defaults.test.js
```

Result:

```text
Test Files  1 passed (1)
Tests       4 passed (4)
```

Focused engine regression group:

```bash
bun vitest run --config vitest.config.ts $(find \
  packages/ship-fast-engine/src/clone \
  packages/ship-fast-engine/src/genui \
  packages/ship-fast-engine/src/llm \
  packages/ship-fast-engine/src/pipeline \
  packages/ship-fast-engine/src/renderers \
  packages/ship-fast-engine/src/spec \
  -type f \( -name '*.test.ts' -o -name '*.test.js' \) | sort)
```

Result:

```text
Test Files  27 passed (27)
Tests       151 passed (151)
```

Whitespace check:

```bash
git diff --check -- packages/ship-fast-engine/src/spec/defaults.js packages/ship-fast-engine/src/spec/defaults.test.js
```

Result: passed with no output.

Production hardcode scan:

```bash
grep -n "blog-dogs\|KubeMeter" packages/ship-fast-engine/src
```

Result: the only match is the new negative assertion in
`packages/ship-fast-engine/src/spec/defaults.test.js`.

## Status

This group now has a concrete generic blog/publication fallback invariant, a
production fix for invalid blog fallback specs, and a passing focused engine
regression suite. It remains part of the broad local branch review scope and
should be reviewed as one coherent engine changeset.
