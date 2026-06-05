# Clone theme — general rules (round 1)

Structural, site-agnostic heuristics applied to the deep-site-clone theme head / token synthesis.
No hostnames, slugs, or copy. An unseen target must benefit identically.

## Alignment coherence
- A link/CTA button living inside a left-aligned content column must share the prose's inline axis. Intrinsic-width link buttons (inline-flex / inline-grid anchors & buttons) inadvertently inherit a centering wrapper (text-align:center, place-items:center, justify/align-center) and float to the middle, producing a zig-zag against left-aligned headings/paragraphs.
- Fix is keyed on STRUCTURE (left text-flow ancestor + inline link-button display), not on any site: snap such buttons to the start of the reading axis (`margin-inline:0; align-self/justify-self:start; text-align:start`) so the button column lines up with the text column.
- Only re-anchor intrinsic-width (inline-flex/inline-grid) link buttons; full-width / explicitly-centered hero CTAs are left untouched because they are not part of a left-aligned list flow.
