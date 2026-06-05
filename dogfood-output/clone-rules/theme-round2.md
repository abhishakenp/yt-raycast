# Clone theme rules — round 2 (typography + surface tonality)

General, structure-driven heuristics applied so theme application is confirmable
across content bands (not just the hero heading). No site/slug/host branching.

- Font family: `<body>` usually reports a GENERIC keyword (`sans-serif`); the real
  brand typeface lives on content elements. Prefer body's first *concrete*
  (non-generic) family; else adopt the dominant concrete `font-family` across all
  captured elements. Reject CSS generic keywords (`sans-serif`, `serif`,
  `system-ui`, `ui-*`, `inherit`, …).
- Border radius is a content-component signal (cards/buttons/inputs), not a body
  property (body radius ≈ 0). Adopt the dominant *non-zero* single-value radius
  across captured elements; reject `0`/per-corner multi-values; fall back to body
  then default.
- Spacing: derive from the dominant `gap` among captured flex/grid containers;
  reject `normal`/`0`; body rarely sets gap.
- Dominant-value survey is generic: count a property across captured elements,
  pick the most frequent accepted value, ignore a baseline. Recovers any
  component-level signal body cannot carry.
- Serif/display detection (`looksSerif`): keyed on the stack's generic fallback
  (`serif` vs `sans-serif`/`monospace`) plus common serif family-name tokens.
  When the extracted typeface IS serif, it is the brand font — drive the serif
  token and `h1–h6` from it (keeps the original serif character on EVERY band's
  heading), keep a clean sans for body. Never force serif onto sans-first sites.
- Replace hardcoded `Georgia, serif` heading with the original's actual serif
  (extracted family + Georgia fallback) — generalizes, no per-site copy.
- `muted-foreground` must NOT equal full `foreground`, or muted sections render
  identical to primary content and the theme is invisible there. Blend foreground
  ≈40% toward background → legibly softer secondary text. Palette-agnostic
  (works light + dark).
- Emit `--font-serif` in `:root` (alongside `--font-sans`) so registry serif
  utilities resolve to the brand serif on content bands.
