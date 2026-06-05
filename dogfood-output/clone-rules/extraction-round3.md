# Clone extraction rules — round 3 (crawler + segmentation, structural only)

General, domain-agnostic heuristics applied this round. No host/slug/keyword branches.

- **Near-duplicate page collapse by text containment.** Beyond exact content-signature
  and language-independent structural-signature dedup, collapse a descendant page whose
  visible-text word-bigram (shingle) set is contained (>= 0.8 of the smaller set) in an
  already-stored page's shingle set. Catches same-page-with-markup-noise and
  degraded/truncated captures that reduce to a shared intro — which otherwise survive as
  fabricated PageSwitch tabs repeating the home intro. Containment (not symmetric Jaccard)
  so a smaller truncated capture still collapses into its fuller sibling.
- **Compute the home page's fingerprint even though home is never dropped**, so a later
  descendant that merely repeats the home intro collapses INTO home → a single-page site
  stays single (no invented tabs).
- **High containment threshold + min-length guard** (skip pages with < 8 words): only
  substantially-same prose collapses; pages sharing just a header/nav phrase stay separate.
- **A section is emitted as its FULL subtree, never just its title.** When a container's
  children are all leaves (headings/paragraphs/anchors/lists/media), keep the container
  whole as ONE content section — an intro `<p>` + a `<ul>` of link `<li>`s is one block,
  not a heading stub. Every `<li>`/`<a>` survives in document order.
- **Body-bearing sections are irreplaceable.** Any section containing `<a>/<li>/<img>/form/
  table` is exempt from stub/echo/text-dedup culling — those passes only remove bare
  heading/title echoes, never the real body.
- **Dedup the page title vs `<h1>`.** A bare text line that is a prefix/substring of an
  emitted heading (>= half its length) is a redundant title echo and dropped — but only
  when it carries no body content of its own.
