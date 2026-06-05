# Clone extraction rules — round 4 (crawler + segmentation, structural only)

General, domain-agnostic heuristics applied this round. No host/slug/keyword/hostname
branches — every rule keys purely on DOM shape and counts, so an unseen site benefits
identically.

- **Classify a link-dominated block as primary CONTENT, never a title-only hero.**
  A block with >= 3 anchors where the anchors are mostly wrapped in `<li>/<dt>/<dd>`
  (a true list) OR the anchor text is >= 50% of the block's text (a link-dense index)
  is a blog/archive index, link hub, or hyperlinked-docs body — the page's
  irreplaceable content. Detect by shape and emit as `content` so a downstream
  "hero = heading only" collapse can't discard every link/`<li>` (the "entire body
  dropped, only the H1/Overview survives" failure).
- **Order the link-list check AFTER semantic nav/footer/header tags but BEFORE
  hero/features/gallery.** A real `<footer>`/`<nav>` full of links keeps its kind
  (no regression), while a content-rich index outranks the generic hero/feature
  heuristics that would otherwise mislabel and shrink it.
- **Body-bearing sections stay irreplaceable** (carried from round 3): any section
  with `<a>/<li>/<img>/form/table` is exempt from stub/echo/text-dedup culling.
  Combined with the link-list classifier, an intro `<p>` + a `<ul>` of post links
  survives whole and in reading order.
- **Ancestor walk instead of `closest()` for list-membership** — bounded manual
  parent traversal (guard 12) for linkedom robustness; same result, no reliance on
  selector-list support in `closest`.
- **Canonicalize directory-index aliases in URL normalization.** Strip a trailing
  default document — `index.html|htm|php|aspx|asp|jsp` — leaving the directory slash
  intact, so `/` and `/index.html` (and `/docs/` vs `/docs/index.html`) collapse to
  one page. A static single page that self-links as both forms no longer yields a
  second phantom page that downstream promotes into a fabricated 2-tab `PageSwitch`
  with a duplicated paragraph. Filename-only strip => never merges distinct `/a` vs
  `/a/`.
