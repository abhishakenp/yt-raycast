# Extraction rules — round 2 (segment / crawler)

General, structure-driven heuristics. No host/slug/lang/keyword branches.

## Segmentation (segment.ts)
- A section that carries body content (`<a>`, `<li>`, `<img>`/media, `<form>`/`<input>`/`<button>`, `<table>`, `<dl>`) is IRREPLACEABLE: never cull it via heading-stub or text-dedup. Prevents "entire body dropped, only H1 survives."
- Distinguish a LAYOUT band (section/article/header/footer/nav/aside/main, or a div classed hero/feature/footer/…) from ATOMIC content (a `<ul>`/`<table>`). A bare list/table is content, not a band — so `<h1>` + intro `<p>` + `<ul>`-of-links stays ONE coherent section instead of fragmenting or collapsing to the H1.
- A container with NO layout-band child is a single coherent content block → keep whole (don't shatter into bare `<h1>`/`<p>`/`<a>`/`<ul>` fragments).
- Pre-scan ALL body headings up front. Drop a bare text line that equals or is a ≥50%-length substring of any heading (and carries no body of its own) — kills the "orphan text node above/repeating the H1" fragment regardless of document order.
- Keep the all-dropped fallback: a page must never segment to zero sections.

## Crawl dedup (crawler.ts)
- Add a LANGUAGE-INDEPENDENT structural fingerprint = ordered block-tag skeleton + per-tag counts + coarse log2 text-length bucket (words excluded). Collapse a descendant page whose fingerprint matches an already-stored page INTO that canonical page.
- This collapses translation/variant mirrors of one single-page essay (same DOM shape, different language) that the text-bearing content signature can't catch — keeping a single-page site SINGLE instead of promoting `/es`,`/zh`,`/fr`,`/de` into fabricated top-level tabs.
- Guard against over-merge: require ≥6 block elements and an exact ordered-skeleton + count match; length bucket separates short vs long bodies of the same shape.
- Home (depth 0) is recorded but never dropped; only descendants collapse into a canonical sibling. Preserve graph node/edge for collapsed URLs (link structure intact, page+cap not double-counted).
