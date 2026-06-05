# Clone conversion — general rules (round 1)

Structural, site-agnostic heuristics applied to the deep-site-clone engine
(`clone/convert.ts`, `clone/fallback.ts`, `genui/orchestrator.ts::generateFromClone`).
None branch on hostname, slug, or specific copy — an unseen site benefits identically.

## Content coverage / no loss
- A content section's fallback reconstruction MUST capture the FULL subtree:
  every heading, paragraph, EVERY `<li>`, and EVERY `<a>` — not just the title.
- DOM-walk in document order; preserve reading order top-to-bottom.
- Keep a leaf-heavy block whole; never shatter one coherent content block into
  bare `<h1>/<p>/<a>` fragments.

## Containment dedup (kills duplicate entries / stray nodes)
- Track normalized text of every emitted node. Skip a node whose text is a
  substring of, or a superstring containing, an already-emitted node (min 4 chars).
  → a `<li>`/`<p>` and the `<a>` nested inside it never BOTH surface.
- A heading that embeds its own URL emits once; suppress the bare URL so it never
  reappears as a stray Text/Button above/below the heading.

## Row decomposition (one entry = one row)
- When a list row is "lead text + a single trailing link" (e.g. a dated post
  whose title is the anchor), emit it as ONE row: a `Text` lead + a `Button`
  link inside a single `Stack(...,"row","sm")`. Never emit the title as both a
  left-aligned Text AND a separate centered Button.
- If the row text IS just the link, emit a single link, not a row.

## Density (no whitespace collapse)
- Scale section spacing to node count: dense sections (>= ~8 rows) use small gap
  (`"sm"`) and tight padding (`py-8`); small marketing blocks keep comfortable
  (`"md"` / `py-16`). Long indexes stay compact, one row per entry.

## Quality gates in conversion (swap LLM output for deterministic rebuild)
- THIN gate: if expected-content coverage < 0.6, prefer DOM reconstruction when
  it is strictly more faithful.
- DUPLICATION gate: measure per-expected-string multiplicity across the
  program's string literals. Clean output ~1.0; the "Text line + duplicate
  Button" row degeneracy ~1.45+. Ratio >= ~1.4 ⇒ prefer DOM reconstruction when
  it is less duplicated AND not materially less faithful.
- Never substitute canned per-kind copy over real (even partial) scraped content.

## Single-page integrity / page dedup
- Collapse near-duplicate cloned PAGES before building PageSwitch tabs: compare
  ordered section content-signatures (program-literal tokens), drop pages with
  >= 85% Jaccard overlap with an already-kept page, keep the first (home wins).
  → a single-page site stays single-page; in-content links are not promoted to
  fabricated tabs, and paginated/near-identical crawls don't print duplicate tabs.

## Prompt hygiene
- Conversion prompt examples use illustrative PLACEHOLDERS, never real target
  copy, so the model mimics structure without parroting example strings.
