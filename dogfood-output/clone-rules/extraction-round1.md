
## Round 1 — crawl dedup + row-structured segmentation (segment.ts, crawler.ts)

- Record the home (depth-0) page's content signature so a byte-identical descendant URL (self-link/alias) collapses INTO home; never let an exact body-duplicate survive as a second page (root cause of fabricated PageSwitch tabs / duplicated pages). Home is still never *dropped* — only *matched against*.
- Only depth>0 pages are eligible to be dropped as content-duplicates; the seed/home page is always kept as its own canonical page.
- Treat a `<table>`, multi-item `<ul>`/`<ol>`, or multi-pair `<dl>` as an ATOMIC, structure-bearing section: keep it whole, never descend into it. Its rows/cells (`<tr><td>date</td><td><a>title</a></td>`) are the content layout, not sub-sections.
- Never descend a single-child wrapper when that child is row-structured (would emit `<thead>`/`<tbody>`/`<tr>`/`<li>` as separate sections and flatten date-gutter/title-column grids into concatenated text).
- A section's full subtree is emitted via outerHTML (headings + every row + every cell/anchor) — preserve reading order and the original row/grid structure rather than text-flattening.
- All heuristics keyed on TAG SHAPE and DOM structure only (table/list/dl, row counts, single-child wrappers) — no host, slug, URL, or copy special-casing; unseen sites benefit identically.
