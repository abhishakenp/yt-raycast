# DOM-Based Anchors

Contract for how inline edits target elements and sections in the preview DOM
without depending on OpenUI capsule internals. This is the canonical targeting
mechanism for HTML sessions; OpenUI capsule markers (`data-openui-component`,
`data-openui-var`) are legacy and deprecated — see
[Migration from OpenUI capsule markers](#migration-from-openui-capsule-markers).

## Anchor formats and priority

`getElementStyleAnchor(element)` (in `src/features/editing/element-path.ts`)
computes an anchor for a single element using a strict priority order —
the first available marker wins:

| Priority | Marker                 | Anchor form                             | Status                |
| -------- | ---------------------- | --------------------------------------- | --------------------- |
| 1        | `id`                   | `#hero_main`                            | Preferred (most stable) |
| 2        | `class`                | `py-24 bg-muted text-center`            | Preferred             |
| 3        | `data-sf-export-page`  | `[data-sf-export-page="Home"]`          | DOM-based, kept       |
| 4        | `data-openui-var`      | `[data-openui-var="home_hero"]`         | Legacy, deprecated    |

Contract details:

- **ID anchors** are escaped with `CSS.escape` (fallback: manual escaping when
  `CSS.escape` is unavailable), so `#hero:main` becomes `#hero\:main` and still
  resolves via `querySelector`.
- **Class anchors** are the *full class string* verbatim, in original token
  order. Consumers (e.g. `applyStyleEdit` in `src/lib/edit-helpers.ts`) match
  by token-set inclusion: every anchor token must be present on the target tag.
  A whitespace-only `class` attribute is treated as absent and falls through.
- **Attribute anchors** escape `\` and `"` in the value
  (`cssAttributeSelectorValue`), so `Look"book` becomes
  `[data-sf-export-page="Look\"book"]`.
- An element with none of these markers yields `undefined` — callers must
  handle the no-anchor case (fall back to other anchors or text content).

## Section anchors

`findSectionAnchor(element)` resolves the *editable section* anchor for a
selection:

1. Walk from the element (inclusive) to the nearest ancestor matching
   `section, article, aside, footer, header, main, [role="region"]`.
2. Compute `getElementStyleAnchor` for that section. If it has no anchor,
   keep climbing to the next section ancestor — unanchored wrappers are
   skipped, never anchored by accident.
3. Non-section ancestors (`div`, `span`, …) are ignored even when they carry
   ids or classes — section anchors always refer to semantic containers.

The result is exposed on `InspectorSelection.sectionAnchor`
(`buildInspectorSelection`). The server (`section-edit-response.ts`) prefers
`sectionAnchor` for section-scoped edits and only falls back to
`[data-openui-var="…"]` when no DOM-based section anchor exists.

## Producers and consumers

| Site                                                        | Role                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `src/features/editing/element-path.ts`                      | `getElementStyleAnchor`, `findSectionAnchor`, `buildInspectorSelection` |
| `src/features/editing/components/InlineEditToolbar.tsx`     | `getStyleSourceAnchor` for manual style edits (id → class → `data-sf-export-page` → legacy `data-openui-var`) |
| `src/features/editing/server/section-edit-response.ts`      | `selectionStyleAnchor` / `selectionSectionAnchor` for AI tool calls    |
| `src/lib/edit-helpers.ts`                                   | `applyStyleEdit` / `tagMatchesStyleAnchor` — resolves anchors in HTML/JSX source |
| `src/features/editing/lib/inline-edit-commands.ts`          | `buildStyleApplyCommand` etc. — persists anchors as edit `beforeText`  |

## Deprecation policy

Legacy capsule markers are still populated for backwards compatibility with
OpenUI sessions but are deprecated:

- `InspectorSelection.openuiComponent` / `openuiVar` — `@deprecated`, kept for
  OpenUI capsule edits.
- `[data-openui-var="…"]` anchors — last-resort fallback (priority 4).
- `buildSectionMoveCommand` and the `replacementOpenUiSource` path of
  `buildSectionRewriteCommand` — `@deprecated`.

Every legacy-path usage logs a `[ship-fast] Deprecated:` warning
(`console.warn`) so remaining callers can be found in logs and migrated:

- client: once per capsule when a selection relies on `data-openui-*` markers;
- command builders: on each `buildSectionMoveCommand` /
  `replacementOpenUiSource` invocation;
- server: on each section edit served through the OpenUI capsule path.

## Migration from OpenUI capsule markers

For session types, tooling, and AI tool flows that still target
`data-openui-component` / `data-openui-var`:

1. **Section targeting**: use `selection.sectionAnchor` (DOM-based) instead of
   constructing `[data-openui-var="…"]` selectors. `findSectionAnchor` already
   prefers ids and classes, so most OpenUI-rendered sections with an `id` on
   their wrapper migrate automatically.
2. **Section rewrites**: send `replacementHtml` + `beforeHtml` (the selected
   section's outerHTML) instead of `replacementOpenUiSource` +
   `sectionVarName`. The HTML path splices the rewritten fragment by exact
   anchor match (`applySectionHtmlReplace`) and never trusts the replacement
   as the whole document.
3. **Section reordering**: reorder sections in HTML output rather than
   reordering `Stack([...])` entries in OpenUI source (`buildSectionMoveCommand`
   is deprecated).
4. **Page scoping**: rely on `data-sf-export-page` (`pageLabel` /
   `[data-sf-export-page="…"]` anchors), which is DOM-based and works for both
   HTML exports and OpenUI-rendered pages.
5. **New code must not** read `openuiComponent` / `openuiVar` or emit
   `data-openui-*` selectors. Grep for `[ship-fast] Deprecated:` in logs to
   find remaining runtime callers.

The legacy fields remain functional until all OpenUI session flows migrate;
there is no forced failure mode. Removal will only happen after a release with
zero `[ship-fast] Deprecated:` warnings observed in production logs.
