import type { CapturedPage, SectionKind } from "./types.ts"
export type { SectionKind }
import { parseHTML } from "linkedom"

// Split a page DOM into an ORDERED, NON-OVERLAPPING partition of semantic sections.
// We iterate only the top-level structural children of <body> (and unwrap a single
// dominant wrapper) so an ancestor and its descendants are never both emitted.
// Classification uses textContent + tag/role + class tokens — never raw outerHTML
// substring matching.

export interface Section {
  kind: SectionKind
  html: string
  startIndex: number
  endIndex: number
}

// linkedom's className can be a string or an SVGAnimatedString (.baseVal). Guard both.
function classTokens(element: Element): Set<string> {
  const raw = element.className as unknown
  let value = ""
  if (typeof raw === "string") {
    value = raw
  } else if (raw && typeof raw === "object" && "baseVal" in raw) {
    value = String((raw as { baseVal: string }).baseVal)
  } else {
    value = element.getAttribute("class") || ""
  }
  return new Set(
    value
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
  )
}

function hasToken(tokens: Set<string>, ...needles: string[]): boolean {
  for (const t of tokens) {
    for (const n of needles) {
      if (t.includes(n)) return true
    }
  }
  return false
}

// True when a block's body is dominated by a list of links — a blog/archive index,
// a link hub, or a hyperlinked-docs body. Structural test only: at least 3 anchors,
// and either those anchors are mostly wrapped in <li>/<dt>/<dd> (a true list), or
// the anchor text makes up the bulk of the block's text (a link-dense index with
// little surrounding prose). This is the page's irreplaceable primary content and
// must never be reduced to its heading.
function isLinkListRegion(element: Element): boolean {
  const anchors = element.querySelectorAll("a")
  if (anchors.length < 3) return false
  // Count anchors that live inside a list/definition row (the repeated-record shape).
  let listed = 0
  let anchorTextLen = 0
  for (const a of Array.from(anchors)) {
    anchorTextLen += (a.textContent || "").replace(/\s+/g, " ").trim().length
    // Walk ancestors (bounded) to see if this anchor sits inside a list/definition
    // row — done manually rather than via closest() for linkedom robustness.
    let p: Element | null = a.parentElement
    for (let guard = 0; p && p !== element && guard < 12; guard++) {
      const t = p.tagName.toLowerCase()
      if (t === "li" || t === "dt" || t === "dd") {
        listed++
        break
      }
      p = p.parentElement
    }
  }
  const totalTextLen = (element.textContent || "").replace(/\s+/g, " ").trim().length || 1
  // Mostly-listed anchors => a list/archive. OR anchors carry most of the text =>
  // a link-dense index even if not in <li> (e.g. <p><a>..</a> <a>..</a> …</p>).
  return listed >= 3 || anchorTextLen / totalTextLen >= 0.5
}

// True when an element is a NAV/HEADER landmark region: a semantic <nav>/<header>,
// a navigation/banner ARIA role, or a div/element classed as one. Uses the SAME
// token logic detectSectionKind uses for "nav"/"header" so the two stay in lock-step.
// Purely structural — landmarks only, no hostname/slug knowledge.
function isNavLandmark(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  const role = (element.getAttribute("role") || "").toLowerCase()
  const cls = classTokens(element)
  if (tag === "nav" || role === "navigation" || hasToken(cls, "nav", "navbar", "menu")) {
    return true
  }
  if (tag === "header" || role === "banner" || hasToken(cls, "header", "masthead")) {
    return true
  }
  return false
}

// Extract the raw hrefs of every anchor inside the page's nav/header LANDMARK
// regions — the REAL site-navigation link set. Structural only: finds landmark
// regions (isNavLandmark), collects all <a href> within them, and returns the raw
// href strings (absolute or relative; normalization happens where the base URL is
// known). Nested landmarks are de-duplicated by anchor identity so a <header><nav>
// does not double-count. Returns [] when there are NO nav/header landmarks.
export function extractNavLinks(root: Element): string[] {
  const landmarks: Element[] = []
  if (isNavLandmark(root)) landmarks.push(root)
  for (const el of Array.from(root.querySelectorAll("nav, header, [role], [class]"))) {
    if (isNavLandmark(el)) landmarks.push(el)
  }
  if (landmarks.length === 0) return []

  const hrefs: string[] = []
  const seenAnchors = new Set<Element>()
  for (const region of landmarks) {
    for (const a of Array.from(region.querySelectorAll("a"))) {
      if (seenAnchors.has(a)) continue
      seenAnchors.add(a)
      const href = a.getAttribute("href")
      if (href) hrefs.push(href)
    }
  }
  return hrefs
}

// Heuristic detection of section kind based on tag, role, class tokens, and text content.
function detectSectionKind(element: Element): SectionKind {
  const tag = element.tagName.toLowerCase()
  const role = (element.getAttribute("role") || "").toLowerCase()
  const cls = classTokens(element)
  const id = (element.id || "").toLowerCase()
  const text = (element.textContent || "").toLowerCase()

  // Navigation
  if (tag === "nav" || role === "navigation" || hasToken(cls, "nav", "navbar", "menu")) {
    return "nav"
  }

  // Footer
  if (tag === "footer" || role === "contentinfo" || hasToken(cls, "footer") || id.includes("footer")) {
    return "footer"
  }

  // Header
  if (tag === "header" || role === "banner" || hasToken(cls, "header", "masthead")) {
    return "header"
  }

  // Link-list / index region. A block whose body is a dense list of anchors — a
  // chronological blog index, an archive, a link hub, the classic hyperlinked-docs
  // body — is the PRIMARY CONTENT of the page, not a hero or a heading stub. Checked
  // AFTER the semantic nav/footer/header tags (so a real <footer>/<nav> of links keeps
  // its kind) but BEFORE hero/features/gallery (so a content-rich index isn't reduced
  // to a title-only "hero" that downstream then collapses, dropping every link).
  // Purely structural — anchor counts and list nesting, no domain/slug knowledge.
  if (isLinkListRegion(element)) {
    return "content"
  }

  // Hero
  if (
    hasToken(cls, "hero", "jumbotron", "banner") ||
    id.includes("hero") ||
    (tag === "section" && !!element.querySelector("h1"))
  ) {
    return "hero"
  }

  // Pricing
  if (
    hasToken(cls, "pricing", "price", "plan") ||
    id.includes("pricing") ||
    (text.includes("$") && (text.includes("plan") || text.includes("/mo") || text.includes("per month")))
  ) {
    return "pricing"
  }

  // Testimonials
  if (
    hasToken(cls, "testimonial", "review", "quote") ||
    id.includes("testimonial") ||
    (text.includes("review") && text.includes("quote"))
  ) {
    return "testimonials"
  }

  // Features
  if (
    hasToken(cls, "feature", "benefit", "highlight") ||
    id.includes("feature") ||
    (tag === "section" &&
      !!element.querySelector(".grid, .flex, ul, ol") &&
      (text.includes("feature") || text.includes("benefit")))
  ) {
    return "features"
  }

  // CTA
  if (
    hasToken(cls, "cta", "call-to-action", "action") &&
    !!element.querySelector("button, a")
  ) {
    return "cta"
  }

  // Blog
  if (tag === "article" || role === "article" || hasToken(cls, "blog", "post", "article")) {
    return "blog"
  }

  // Gallery / portfolio
  if (
    hasToken(cls, "gallery", "portfolio", "work", "showcase") ||
    (tag === "section" && element.querySelectorAll("img").length > 3)
  ) {
    return "gallery"
  }

  // Sidebar
  if (tag === "aside" || role === "complementary" || hasToken(cls, "sidebar")) {
    return "sidebar"
  }

  // About
  if (hasToken(cls, "about") || id.includes("about")) {
    return "about"
  }

  // Contact
  if (
    hasToken(cls, "contact") ||
    id.includes("contact") ||
    (tag === "section" && (!!element.querySelector("form") || text.includes("contact us")))
  ) {
    return "contact"
  }

  // Default to generic content
  return "content"
}

// A row/grid container holds REPEATED sibling records (table rows, list items,
// definition pairs) whose horizontal cell structure — e.g. <tr><td>date</td>
// <td><a>title</a></td></tr> — IS the content. Such a block must be kept WHOLE
// as a single section: descending into it would emit each <tr>/<li> (or worse,
// each <td>) as its own "section", and a downstream text-only consumer then
// concatenates the cells ("10/24Steve Ballmer…"), destroying the columnar layout.
// Detected purely by tag shape (table/list with ≥2 rows) — no domain knowledge.
function isRowStructured(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  if (tag === "table") return true
  if (tag === "dl") return element.querySelectorAll("dt, dd").length >= 2
  if (tag === "ul" || tag === "ol") {
    // Count DIRECT <li> children only (nested lists must not inflate the count);
    // avoid `:scope` which linkedom does not reliably support.
    let liCount = 0
    for (const child of Array.from(element.children)) {
      if (child.tagName.toLowerCase() === "li") liCount++
    }
    return liCount >= 2
  }
  return false
}

// A structural element is a meaningful, layout-level block we can treat as a section.
function isStructural(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  if (["header", "nav", "main", "section", "article", "aside", "footer"].includes(tag)) {
    return true
  }
  // A data table or multi-row list is an ATOMIC, row-structured section: it must be
  // kept whole (treated as structural so it is never shattered into per-row/per-cell
  // fragments), preserving the date-gutter/title-column grid.
  if (isRowStructured(element)) {
    return true
  }
  if (tag === "div") {
    const cls = classTokens(element)
    return hasToken(
      cls,
      "hero",
      "feature",
      "pricing",
      "testimonial",
      "cta",
      "footer",
      "header",
      "nav",
      "section",
      "container",
      "gallery",
    )
  }
  return false
}

// Element children that actually render (drop script/style/template/noscript).
function renderableChildren(element: Element): Element[] {
  return Array.from(element.children).filter((child) => {
    const tag = child.tagName.toLowerCase()
    return tag !== "script" && tag !== "style" && tag !== "template" && tag !== "noscript"
  })
}

// A LAYOUT-level section is a real page band: a semantic sectioning tag
// (section/article/header/footer/nav/aside/main) or a div explicitly classed as
// one (hero/feature/footer/…). A multi-row list or table is "structural" only in
// the ATOMIC sense (keep-whole), NOT a layout band — an intro paragraph followed
// by a <ul> of links is ONE content block, not two page sections. Distinguishing
// the two lets us keep <h1>+<p>+<ul> coherent while still partitioning true bands.
function isLayoutSection(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  if (["header", "nav", "main", "section", "article", "aside", "footer"].includes(tag)) {
    return true
  }
  if (tag === "div") {
    const cls = classTokens(element)
    return hasToken(
      cls,
      "hero",
      "feature",
      "pricing",
      "testimonial",
      "cta",
      "footer",
      "header",
      "nav",
      "section",
      "container",
      "gallery",
    )
  }
  return false
}

// True when `container` is a SINGLE coherent content block: it has no real
// LAYOUT-level section among its children (only headings, paragraphs, anchors,
// lists, tables, media). Descending would shatter one block into bare
// <h1>/<p>/<a>/<ul> fragments — the "thin stub, content dropped" +
// "entire body dropped, only H1 survives" degeneracy. Keep it whole. Note: a
// bare <ul>/<table> child no longer forces a split (it is content, not a band),
// so an intro paragraph + bulleted list-of-links stays in ONE section.
function childrenAreAllLeaves(container: Element): boolean {
  const kids = renderableChildren(container)
  if (kids.length === 0) return false
  return kids.every((kid) => !isLayoutSection(kid))
}

// True when descending into `container` would yield a finer partition than emitting
// it whole: it has a SINGLE renderable child and that child either is a pure
// (non-structural) wrapper, OR is itself a structural box whose own renderable
// children are multiple/structural sections. This unwraps
// <body><div id=app><main>…</main></div></body> all the way to <main>'s children,
// instead of stopping at the first structural node and emitting one giant section.
function shouldDescend(container: Element): boolean {
  const kids = renderableChildren(container)
  if (kids.length !== 1) return false
  const only = kids[0]
  // Never descend INTO a row-structured block (table/multi-row list): its rows and
  // cells are the content, not sub-sections. Descending would emit <thead>/<tbody>/
  // <tr>/<li> as separate sections and flatten the columnar layout. Keep it whole.
  if (isRowStructured(only)) return false
  // Pure wrapper (e.g. <div id="root">, <div id="app">). Descend ONLY when the
  // wrapper still contains structure to partition. If its own children are all
  // non-structural leaves (a single <h1>/<p>/<a> content block), descending would
  // dissolve one coherent section into bare fragments — keep the wrapper whole.
  if (!isStructural(only)) {
    return !childrenAreAllLeaves(only)
  }
  // Single structural child (e.g. <main>, <div class="container">). Descend only
  // when doing so yields a real partition, NOT when it would dissolve a leaf section
  // into its inline content:
  //  - >1 renderable child  -> those children are the sections; descend.
  //  - exactly 1 child that is ITSELF structural -> a nested wrapper (e.g.
  //    <main><div class="container">…</div></main>); keep descending.
  //  - exactly 1 NON-structural child (e.g. <section><h1>…</h1></section>) -> this
  //    structural node IS the section; do NOT descend.
  const grandKids = renderableChildren(only)
  if (grandKids.length > 1) return true
  if (grandKids.length === 1 && isStructural(grandKids[0])) return shouldDescend(only)
  return false
}

// Pick the set of top-level structural children to partition over.
// Descend through dominant single wrappers (pure wrappers AND single structural
// containers like <main>/<div class="container"> whose children are the real
// sections) so we never emit one giant section spanning the whole page.
function topLevelChildren(body: Element): Element[] {
  let container: Element = body
  // Bounded descent to avoid pathological deep single-child chains.
  for (let guard = 0; guard < 12; guard++) {
    const kids = renderableChildren(container)
    if (kids.length === 1 && shouldDescend(container)) {
      container = kids[0]
      continue
    }
    break
  }
  // If the container we landed on has MULTIPLE children that are all
  // non-structural leaves (e.g. a bare <body><h1/><p/><p><a/></p></body> with no
  // wrapper, or a flattened content block), they form ONE coherent content
  // section — not a partition. Emitting each leaf as its own section produces
  // thin H1-only stubs and duplicated heading fragments. Return the container
  // itself as the single section in that case.
  const kids = renderableChildren(container)
  if (kids.length > 1 && container !== body && childrenAreAllLeaves(container)) {
    return [container]
  }
  if (kids.length > 1 && container === body && childrenAreAllLeaves(container)) {
    // body itself holds only leaves: wrap them by returning body as the section
    // root. segmentPage emits one section spanning all of body's leaf content.
    return [body]
  }
  // Document-ordered, renderable children only (script/style/template/noscript dropped).
  return kids
}

// A section is a DEGENERATE STUB when its only rendered content is heading text
// (no paragraphs/lists/media/interactive elements). Such a block carries no body
// — it is almost always the page-title <h1> echoed as a standalone "section".
// Emitting it produces the thin, duplicate-heading pseudo-sections
// (section_content_1/3/5/…) the dogfood audit flagged. Nav/header/footer are
// exempt: a bare-text nav or footer is legitimately heading-light.
function isHeadingOnlyStub(element: Element, kind: SectionKind): boolean {
  if (kind === "nav" || kind === "header" || kind === "footer") return false
  if (element.querySelector("img, svg, video, picture, canvas, form, input, button, table, ul, ol")) {
    return false
  }
  const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6")
  if (headings.length === 0) return false
  const headingText = Array.from(headings)
    .map((h) => (h.textContent || "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
  const allText = (element.textContent || "").replace(/\s+/g, " ").trim()
  // If everything the section says IS the heading(s), there is no body.
  return allText.length > 0 && allText.length <= headingText.length + 4
}

// Collapse repeated whitespace + lowercase for stub/heading equality checks.
function normText(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase()
}

// A section carries IRREPLACEABLE body content when it contains links, list
// items, media, or interactive controls. Such a section must NEVER be dropped by
// the heading-stub or text-dedup passes — doing so silently deletes the page's
// real body (intro paragraph + bulleted list of links), the exact "entire page
// body dropped / only the H1 survives" content-coverage failure. Purely
// structural test: presence of <a>/<li>/<img>/etc., no domain knowledge.
function carriesBodyContent(element: Element): boolean {
  return !!element.querySelector(
    "a, li, img, svg, video, picture, canvas, form, input, button, table, dl",
  )
}

// True when `text` is a leading/trailing fragment of an already-emitted heading
// (or vice-versa): the classic "orphan text node repeating the start of the H1"
// degeneracy, where the page URL/title is emitted BOTH as a bare text line AND as
// part of the <h1>. We treat one as redundant when the shorter normalized string
// is fully contained in the longer AND the shorter has no interactive/list body
// of its own (handled by the caller). Length-guarded so a short generic word does
// not swallow a distinct section.
function isRedundantHeadingEcho(text: string, seenHeadings: Set<string>): boolean {
  const key = normText(text)
  if (key.length < 4) return false
  for (const h of seenHeadings) {
    if (h.length < 4) continue
    if (h === key) return true
    // Bare line is a prefix/substring of a richer heading (or vice-versa) and is
    // at least half its length — a duplicated title fragment, not new content.
    const longer = h.length >= key.length ? h : key
    const shorter = h.length >= key.length ? key : h
    if (longer.includes(shorter) && shorter.length >= longer.length * 0.5) {
      return true
    }
  }
  return false
}

// Normalized text of every heading inside an element (for echo detection).
function headingTexts(element: Element): string[] {
  return Array.from(element.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    .map((h) => normText(h.textContent || ""))
    .filter((t) => t.length > 0)
}

// Parse HTML and extract an ordered, non-overlapping list of sections.
export function segmentPage(captured: CapturedPage): Section[] {
  const { document: doc } = parseHTML(captured.html)
  const body = doc.body
  if (!body) return []

  const children = topLevelChildren(body)
  const sections: Section[] = []
  // Fallback: every renderable child kept whole, no stub/dup filtering. Used only
  // when aggressive filtering would otherwise leave the page with ZERO sections
  // (e.g. a minimal page that is genuinely just a single heading) — a page must
  // never render empty.
  const rawSections: Section[] = []
  // Track normalized text of emitted sections so the SAME page-title heading
  // (e.g. repeated across siblings) is never emitted as a section twice.
  const seenText = new Set<string>()
  // Normalized text of EVERY heading anywhere in the body, pre-scanned up front so
  // a bare text line that repeats (a fragment of) a heading is recognized as a
  // redundant echo even when the orphan line appears ABOVE its heading in document
  // order (the "orphan text node above the H1" degeneracy).
  const seenHeadings = new Set<string>(
    Array.from(body.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((h) => normText(h.textContent || ""))
      .filter((t) => t.length > 0),
  )

  for (const child of children) {
    // Skip non-rendering / empty nodes.
    const tag = child.tagName.toLowerCase()
    if (tag === "script" || tag === "style" || tag === "template" || tag === "noscript") {
      continue
    }
    const text = (child.textContent || "").trim()
    const hasMedia = !!child.querySelector("img, svg, video, picture, canvas")
    if (!text && !hasMedia) continue

    const kind = detectSectionKind(child)

    // Record every candidate in the unfiltered fallback set first.
    rawSections.push({
      kind,
      html: child.outerHTML,
      startIndex: rawSections.length,
      endIndex: rawSections.length,
    })

    // A section that carries real body content (links, list items, media, forms)
    // is IRREPLACEABLE and is NEVER dropped by the stub/echo/dedup passes below —
    // those passes only ever cull bare heading/title echoes. This guarantees an
    // intro paragraph + bulleted list-of-links survives instead of collapsing to
    // a lone H1 (the "entire page body dropped" content-coverage failure).
    const bodyBearing = carriesBodyContent(child)

    if (!bodyBearing) {
      // Drop body-less heading stubs (the duplicated page-title <h1> degeneracy).
      if (isHeadingOnlyStub(child, kind)) continue

      // Drop a bare text line that merely repeats (a fragment of) an already-emitted
      // heading: the orphan "http://info.cern.ch" line echoing the start of the H1.
      const ownHeadings = headingTexts(child)
      if (ownHeadings.length === 0 && isRedundantHeadingEcho(text, seenHeadings)) {
        continue
      }

      // De-duplicate identical text blocks (same heading echoed many times).
      if (text) {
        const key = normText(text)
        if (key && seenText.has(key)) continue
        if (key) seenText.add(key)
      }
    }

    const index = sections.length
    sections.push({
      kind,
      html: child.outerHTML,
      startIndex: index,
      endIndex: index,
    })
  }

  // A page must never end up empty. If stub/dup filtering removed everything,
  // keep the single best fallback section (the first, deduped to one) so the page
  // still renders its heading rather than a blank tab.
  if (sections.length === 0 && rawSections.length > 0) {
    const first = rawSections[0]
    return [{ kind: first.kind, html: first.html, startIndex: 0, endIndex: 0 }]
  }

  return sections
}

// Extract text content from a section
export function extractSectionText(sectionHtml: string): string {
  const { document: doc } = parseHTML(sectionHtml)
  return doc.body?.textContent?.trim() || ""
}

// Parse a captured page and return the raw nav-destination hrefs from its nav/header
// landmark regions (see extractNavLinks). Parses captured.html the same way
// segmentPage does, so the caller (job.ts) never has to handle the DOM itself.
// hrefs are raw (absolute or relative); the caller resolves + normalizes them
// against the page URL. Returns [] when the page has no body or no nav/header landmarks.
export function extractPageNavLinks(captured: CapturedPage): string[] {
  const { document: doc } = parseHTML(captured.html)
  const body = doc.body
  if (!body) return []
  return extractNavLinks(body)
}
