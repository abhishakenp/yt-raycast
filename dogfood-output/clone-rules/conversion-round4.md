# Clone conversion — general rules (round 4)

Structural heuristics applied this round (no domain/slug/URL branching):

- Carry the ORIGINAL section HTML alongside every converted section (`sourceHtml`,
  an optional extra field — structurally compatible with the section type, read via
  a type guard, no `as any`). Every later repair/fallback can then DOM-reconstruct
  real content instead of inventing copy.
- A repair/fallback for an INVALID section MUST receive that section's source HTML.
  Omitting it makes the rebuild collapse to generic per-kind filler
  (e.g. "Overview" + "Read more about this.") — a degenerate single-fallback render.
  Always thread the html into every `generateFallbackSection` call site
  (conversion-error catch, cache-miss fallback, page-error fallback, post-validation
  repair, force-fallback).
- Canned per-kind copy is the LAST resort: it may only render when the source DOM
  genuinely yields zero recoverable content nodes — never as the response to a parse
  failure on a section that has real headings/paragraphs/links.
- DOM reconstruction preserves the FULL subtree in reading order: every heading
  (as a Heading at its real level, never downgraded to Text), the intro paragraph,
  EVERY `<li>`, EVERY `<a>` — not just the title.
- Capture is FLAKY by nature: a single capture pass that returns empty or is missing
  the home page (goto timeout overshoot, 429 burst, transient network) must be
  RETRIED once for the still-missing urls (home prioritised, batch-capped) before the
  job is declared a no-output failure. Retry keys on which urls produced no capture,
  never on hostname.
- Density follows content SHAPE, not node count alone: a link/row index with no media
  stays tight (small gap, small padding); only a near-bare heading band gets tall
  hero padding. Prevents the "95% empty whitespace" render.
- Keep a single-page site SINGLE-page: collapse near-identical crawled pages
  (content-signature Jaccard) and drop non-home pages with no substantive copy, so
  in-content anchors don't fabricate spurious PageSwitch tabs.
