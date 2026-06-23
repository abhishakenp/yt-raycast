import type { SectionKind, ClonedSection, ExtractedTokens } from './types.ts'
import { parseHTML } from 'linkedom'

// Nearest native block by taxonomy tags for failed sections. Whatever we emit
// here MUST satisfy the clone CONTRACT: a section program defines exactly one
// variable `section_${kind}_${index}` and contains NO root. The program is
// composed from the primitive spine (Stack/Section/Heading/Text/Button/...) so
// it always validates against `componentNames`, regardless of which registry
// block matched.

// Nearest native section ROLE for a failed clone section, recorded as
// provenance only. The emitted program is always a primitive composition
// (Stack/Section/Heading/Text/Button) that validates against the spine
// regardless of which role matched — so this is metadata for the fallback
// hash, never a component that gets rendered.
const KIND_TO_ROLE: Record<SectionKind, string> = {
  nav: 'Navbar',
  hero: 'Hero',
  features: 'Features',
  pricing: 'Pricing',
  testimonials: 'Testimonials',
  cta: 'Cta',
  footer: 'Footer',
  content: 'StoryGrid',
  sidebar: 'Navbar',
  header: 'Navbar',
  about: 'About',
  contact: 'Contact',
  blog: 'StoryGrid',
  gallery: 'Gallery',
  unknown: 'Hero',
}

// Nearest native section role for a failed section (provenance only).
export function findFallbackBlock(sectionKind: SectionKind, _index = 0): string {
  return KIND_TO_ROLE[sectionKind] || 'Hero'
}

// Default heading/sub copy per section kind for the primitive composition.
const KIND_COPY: Record<
  SectionKind,
  { heading: string; sub: string; cta?: string }
> = {
  nav: { heading: 'Navigation', sub: '' },
  hero: {
    heading: 'Welcome',
    sub: 'Build something great, faster.',
    cta: 'Get Started',
  },
  features: { heading: 'Features', sub: 'Everything you need in one place.' },
  pricing: {
    heading: 'Pricing',
    sub: 'Simple plans that scale with you.',
    cta: 'Choose Plan',
  },
  testimonials: {
    heading: 'What people say',
    sub: 'Trusted by teams everywhere.',
  },
  cta: {
    heading: 'Ready to start?',
    sub: 'Join us today.',
    cta: 'Get Started',
  },
  footer: { heading: '', sub: '© All rights reserved.' },
  content: { heading: 'Overview', sub: 'Read more about this.' },
  sidebar: { heading: 'Sections', sub: '' },
  header: { heading: '', sub: '' },
  about: { heading: 'About us', sub: 'Our story and mission.' },
  contact: {
    heading: 'Contact',
    sub: 'Get in touch with the team.',
    cta: 'Send Message',
  },
  blog: { heading: 'Latest posts', sub: 'Insights and updates.' },
  gallery: { heading: 'Gallery', sub: 'A selection of our work.' },
  unknown: { heading: 'Section', sub: '' },
}

// Escape a string for embedding inside an OpenUI-Lang double-quoted literal.
function lit(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

// Collapse runs of whitespace and trim — DOM textContent is noisy with newlines
// and indentation from the scraped markup.
function clean(s: string | null | undefined): string {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
}

// One emittable content node extracted from the original section DOM. Order is
// document order so the fallback mirrors the real reading order of the page.
// A "row" node carries a primary line plus an optional trailing link label so a
// list row like "10/24  Steve Ballmer was an underrated CEO" (where the title is
// itself an <a>) emits as ONE row, never as a left-aligned Text PLUS a separate
// centered Button — the duplicate-entry / density-collapse degeneracy.
export type ContentNode =
  | { t: 'heading'; text: string; level: string }
  | { t: 'text'; text: string }
  | { t: 'link'; text: string }
  | { t: 'row'; text: string; link: string }

// Strip a trailing URL token off a heading/text label so a heading that already
// contains its own URL (e.g. "http://info.cern.ch — site") doesn't get a second
// stray URL Text node emitted alongside it. Returns the URL found (or "").
function leadingOrTrailingUrl(text: string): string {
  const m = text.match(/https?:\/\/[^\s]+/)
  return m ? m[0] : ''
}

// Walk the section DOM and pull out the meaningful content in document order:
// headings (h1-h6), paragraphs / standalone text blocks, list items, and links.
// This is what lets a *failed* LLM conversion still reproduce the original copy,
// the bulleted list, and the "Learn more" anchors instead of collapsing to a
// single generic heading. Works for ANY site — no per-domain logic.
//
// CONTAINMENT DEDUP (general): we emit content in document order but track the
// normalized text of every node already emitted. Before emitting a node we skip
// it when its text is a substring of, or a superstring containing, text we
// already emitted at a coarser granularity — so a <li>/<p> and the <a> nested
// inside it never both surface, and an anchor whose label is already inside an
// emitted row is suppressed. This kills the "every entry duplicated (Text +
// Button)" and "stray URL Text above the heading" degeneracies structurally,
// for ANY site, while still preserving every distinct list item / link.
export function extractContentNodes(html: string): ContentNode[] {
  const nodes: ContentNode[] = []
  if (!html || !html.trim()) return nodes

  let root: Element | null = null
  try {
    const { document: doc } = parseHTML(`<div id="__clone_root">${html}</div>`)
    root = doc.getElementById('__clone_root')
  } catch {
    return nodes
  }
  if (!root) return nodes

  // Caps so a huge scraped section can't explode the fallback program.
  const MAX_NODES = 60
  const MAX_LEN = 280
  // Exact-text dedup of identical boilerplate (same heading echoed many times).
  const seenExact = new Set<string>()
  // Every normalized fragment we've already surfaced — used for containment
  // dedup so a parent row and its child link don't both emit.
  const emitted: string[] = []

  const norm = (s: string): string => normForMatch(s)

  // True when `t` is ALREADY FULLY COVERED by something we emitted — i.e. its
  // normalized text is a substring of (or equal to) an emitted node. This is the
  // ONLY direction that warrants dropping: the content is already on screen.
  //
  // We deliberately DO NOT treat a node that is a SUPERSTRING of an emitted
  // fragment as contained. A longer node carries MORE content; dropping it would
  // truncate copy (e.g. emit a bare-URL anchor first, then discard the full
  // "<url> - home of the first website" heading because it merely "contains" the
  // url). Superstrings are handled by `subsumeShorter` instead, which upgrades the
  // shorter emitted fragment to the richer text. Short fragments (<4 chars) are
  // never containment matches, to avoid eating tiny distinct labels.
  const isContained = (t: string): boolean => {
    const nt = norm(t)
    if (nt.length < 4) return false
    for (const e of emitted) {
      if (e.length < 4) continue
      if (e === nt) return true
      if (e.includes(nt)) return true // nt is a substring of an emitted node
    }
    return false
  }

  // When a new, richer node CONTAINS an already-emitted shorter fragment, that
  // shorter fragment was a truncation of this one. Drop the shorter emitted node
  // (and its bookkeeping) so the fuller text replaces it — no duplicate, no
  // truncation. Returns true when at least one shorter fragment was subsumed.
  // Length-guarded (>=4) and only fires when the shorter is a real prefix/substring
  // worth half the longer, so distinct short labels are not swallowed.
  const subsumeShorter = (t: string): boolean => {
    const nt = norm(t)
    if (nt.length < 4) return false
    let changed = false
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const prim = n.t === 'row' ? `${n.text} ${n.link}` : n.text
      const e = norm(prim)
      if (e.length < 4 || e === nt) continue
      if (nt.includes(e) && e.length >= nt.length * 0.5) {
        nodes.splice(i, 1)
        const ix = emitted.indexOf(e)
        if (ix !== -1) emitted.splice(ix, 1)
        seenExact.delete(`${n.t}:${prim.toLowerCase()}`)
        changed = true
      }
    }
    return changed
  }

  const text = (el: Element): string => clean(el.textContent).slice(0, MAX_LEN)

  const push = (n: ContentNode): boolean => {
    const primary = n.t === 'row' ? `${n.text} ${n.link}` : n.text
    const exactKey = `${n.t}:${primary.toLowerCase()}`
    if (seenExact.has(exactKey)) return true
    seenExact.add(exactKey)
    nodes.push(n)
    emitted.push(norm(primary))
    if (n.t === 'row' && n.link) emitted.push(norm(n.link))
    return nodes.length < MAX_NODES
  }

  // Direct-anchor of a list/paragraph row: the single <a> that is (effectively)
  // the actionable label of the row. Returns its label when the row decomposes
  // into "lead text + one trailing link", else "".
  const rowLink = (el: Element): string => {
    const anchors = Array.from(el.querySelectorAll('a')) as Element[]
    if (anchors.length !== 1) return ''
    const label = clean(anchors[0].textContent)
    return label.length > 0 && label.length <= 120 ? label : ''
  }

  // Selector covers the content-bearing leaf elements we know how to map onto
  // primitives. Document order is preserved by querySelectorAll.
  const candidates = Array.from(
    root.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, a, blockquote, figcaption',
    ),
  ) as Element[]

  for (const el of candidates) {
    const tag = el.tagName.toLowerCase()
    const t = text(el)
    if (!t) continue

    if (/^h[1-6]$/.test(tag)) {
      // A heading that embeds its own URL is one node — don't let that URL also
      // surface later as a stray Text/Button.
      const url = leadingOrTrailingUrl(t)
      if (isContained(t)) continue
      // If a shorter fragment of THIS heading was already emitted (e.g. a bare
      // url/anchor that is a prefix of the full title), drop it so the full
      // heading text replaces it instead of the heading being truncated.
      subsumeShorter(t)
      if (!push({ t: 'heading', text: t, level: tag.slice(1) })) break
      if (url) emitted.push(norm(url)) // suppress the bare-URL duplicate
      continue
    }

    if (tag === 'a') {
      // Anchors that are wrappers around an already-emitted heading/paragraph/row
      // (or whose label is contained in one) are skipped — the content is present.
      if (t.length > 80) continue
      if (isContained(t)) continue
      if (!push({ t: 'link', text: t })) break
      continue
    }

    // p, li, blockquote, figcaption.
    if (isContained(t)) continue

    // Row decomposition: "lead text + single trailing link" (e.g. a dated post
    // entry whose title is the link). Emit as ONE row so we don't duplicate the
    // title as both a Text line and a separate Button.
    const link = rowLink(el)
    if (link) {
      const lead = clean(t.slice(0, t.length))
      // If the whole row IS just the link, emit a single link, not a row.
      if (norm(lead) === norm(link)) {
        if (!push({ t: 'link', text: link })) break
      } else {
        const leadOnly = clean(t.replace(link, ''))
          .replace(/[|•·\-–—]+$/g, '')
          .trim()
        if (!push({ t: 'row', text: leadOnly || lead, link })) break
      }
      continue
    }

    if (!push({ t: 'text', text: t })) break
  }

  return nodes
}

// Normalize a content string for fuzzy comparison: lowercase, strip non
// alphanumerics, collapse whitespace. Lets us check whether an LLM program
// reproduces a piece of scraped copy even if it re-quoted/re-cased it slightly.
function normForMatch(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// The set of meaningful content strings the original section is expected to
// surface: every heading, paragraph/list-item body, and link label. Used to
// score how faithfully an LLM conversion reproduced the source content.
export function expectedContentStrings(html: string): string[] {
  const out: string[] = []
  for (const n of extractContentNodes(html)) {
    out.push(normForMatch(n.text))
    if (n.t === 'row' && n.link) out.push(normForMatch(n.link))
  }
  return out.filter((s) => s.length >= 3)
}

// Fraction of the original section's expected content strings that actually
// appear (as substrings, normalized) somewhere in the converted program text.
// 1 = every heading/paragraph/link the source had is present; 0 = none. The
// program's own string literals carry the rendered copy, so a faithful
// conversion scores high and a thin "just the title" stub scores low.
export function contentCoverage(program: string, html: string): number {
  const expected = expectedContentStrings(html)
  if (expected.length === 0) return 1
  const hay = normForMatch(program)
  let hits = 0
  for (const want of expected) {
    if (hay.includes(want)) hits++
  }
  return hits / expected.length
}

// Pull every string literal out of an OpenUI-Lang program. The rendered copy
// lives in double-quoted literals; counting how often a given source string
// appears across them reveals DUPLICATION (the same post title emitted as both
// a Text line and a separate Button).
function programLiterals(program: string): string[] {
  const out: string[] = []
  for (const m of String(program || '').matchAll(/"((?:\\.|[^"\\])*)"/g)) {
    const v = normForMatch(m[1])
    if (v.length >= 3) out.push(v)
  }
  return out
}

// How over-duplicated a conversion is relative to the source. For each distinct
// expected content string we count how many program literals it appears in; a
// faithful conversion emits each ~once (ratio ~1). A program that emits every
// entry twice (left Text + centered Button) scores ~2. Returns the average
// per-expected-string multiplicity over strings that appear at least once.
// Source-structure driven, not site specific.
export function duplicationRatio(program: string, html: string): number {
  const expected = Array.from(new Set(expectedContentStrings(html)))
  if (expected.length === 0) return 1
  const lits = programLiterals(program)
  let total = 0
  let counted = 0
  for (const want of expected) {
    let n = 0
    for (const literal of lits) {
      if (literal === want || literal.includes(want)) n++
    }
    if (n > 0) {
      total += n
      counted++
    }
  }
  return counted === 0 ? 1 : total / counted
}

// Tokenize a normalized string into word tokens (>=3 chars) for groundedness
// scoring. Short stopword-ish tokens are dropped so a single shared "the"/"and"
// does not falsely "ground" a fabricated sentence.
function contentTokens(s: string): string[] {
  return normForMatch(s)
    .split(/\s+/)
    .filter((t) => t.length >= 3)
}

// GROUNDEDNESS / HALLUCINATION score (general, structure-driven). A faithful
// conversion only renders copy that exists in the source DOM. An LLM that
// fabricates content ("Yes I now i'm a squirrel…", invented names) emits program
// literals whose words do NOT appear in the source text at all. We measure the
// fraction of the program's rendered word-tokens that are absent from the source
// vocabulary. ~0 = every word came from the page (faithful); high = large blocks
// of invented copy. This catches hallucination even when the program ALSO covers
// the real headings (so coverage looks fine) — coverage and groundedness are
// independent axes. No per-site logic: the source vocabulary IS the ground truth.
export function hallucinationRatio(program: string, html: string): number {
  const sourceVocab = new Set<string>()
  // Source vocabulary = every word in every extracted content node + raw text.
  for (const n of extractContentNodes(html)) {
    for (const tok of contentTokens(n.text)) sourceVocab.add(tok)
    if (n.t === 'row' && n.link)
      for (const tok of contentTokens(n.link)) sourceVocab.add(tok)
  }
  // Also fold in the raw section text so prose not captured as a discrete node
  // (e.g. inline emphasis) still counts as grounding vocabulary.
  for (const tok of contentTokens(htmlToText(html))) sourceVocab.add(tok)
  if (sourceVocab.size === 0) return 0

  let total = 0
  let ungrounded = 0
  for (const litStr of programLiterals(program)) {
    for (const tok of litStr.split(/\s+/)) {
      if (tok.length < 3) continue
      total++
      if (!sourceVocab.has(tok)) ungrounded++
    }
  }
  return total === 0 ? 0 : ungrounded / total
}

// Plain text of a section's HTML (whitespace-collapsed). Used to build the
// source vocabulary for groundedness scoring without re-walking the DOM tree.
function htmlToText(html: string): string {
  if (!html || !html.trim()) return ''
  try {
    const { document: doc } = parseHTML(`<div id="__clone_txt">${html}</div>`)
    return clean(doc.getElementById('__clone_txt')?.textContent)
  } catch {
    return ''
  }
}

// Build OpenUI-Lang lines + child var refs from extracted content nodes.
// Heading -> Heading, text -> Text, link -> link-variant Button (there is no
// anchor primitive; the renderer styles Button(..,"link") as a link).
function emitContentNodes(
  sectionVar: string,
  contentNodes: ContentNode[],
): { lines: string[]; childVars: string[] } {
  const lines: string[] = []
  const childVars: string[] = []
  contentNodes.forEach((node, i) => {
    const v = `${sectionVar}_n${i}`
    if (node.t === 'heading') {
      // Heading level enum only accepts "1".."4"; clamp h5/h6 down to "4".
      const n = parseInt(node.level, 10)
      const level = Number.isFinite(n)
        ? String(Math.min(Math.max(n, 1), 4))
        : '2'
      lines.push(
        `${v} = Heading(${lit(node.text)}, ${lit(level)}, "text-foreground")`,
      )
      childVars.push(v)
    } else if (node.t === 'link') {
      lines.push(`${v} = Button(${lit(node.text)}, "link")`)
      childVars.push(v)
    } else if (node.t === 'row') {
      // A list row: lead text + trailing link on a SINGLE compact line. Keeping
      // them in one horizontal Stack (no per-node vertical padding) preserves the
      // original dense, one-row-per-entry layout instead of exploding each entry
      // into a left Text and a centered Button with a huge gap between them.
      const leadV = `${v}_t`
      const linkV = `${v}_a`
      lines.push(`${leadV} = Text(${lit(node.text)}, "muted")`)
      lines.push(`${linkV} = Button(${lit(node.link)}, "link")`)
      lines.push(`${v} = Stack([${leadV}, ${linkV}], "row", "sm")`)
      childVars.push(v)
    } else {
      lines.push(`${v} = Text(${lit(node.text)}, "muted")`)
      childVars.push(v)
    }
  })
  return { lines, childVars }
}

// Generate a fallback section. Emits ONE variable `section_${kind}_${index}`
// (no root) composed purely from primitive-spine components using theme TOKEN
// CLASSES so the result is themeable and always passes componentNames
// validation.
//
// When the original section HTML is supplied we reconstruct the REAL content
// (headings, paragraphs, list items, links) from the DOM so a failed/empty LLM
// conversion still preserves the page's copy and structure instead of collapsing
// to a single generic heading. Falls back to canned per-kind copy only when no
// usable content can be recovered.
export function generateFallbackSection(
  sectionKind: SectionKind,
  pageUrl: string,
  index: number,
  _tokens: ExtractedTokens,
  sectionHtml?: string,
): ClonedSection {
  // Record the nearest registry block for provenance even though we emit a
  // primitive composition (keeps the program guaranteed-valid against the spine).
  const blockName = findFallbackBlock(sectionKind, index)

  const sectionVar = `section_${sectionKind}_${index}`

  // 1. Try to reconstruct real content from the scraped DOM.
  const contentNodes = sectionHtml ? extractContentNodes(sectionHtml) : []
  let lines: string[] = []
  let childVars: string[] = []

  if (contentNodes.length > 0) {
    ;({ lines, childVars } = emitContentNodes(sectionVar, contentNodes))
  }

  // 2. No recoverable content -> canned per-kind copy (legacy behaviour).
  if (childVars.length === 0) {
    const copy = KIND_COPY[sectionKind] || KIND_COPY.unknown
    const hVar = `${sectionVar}_h`
    const sVar = `${sectionVar}_s`
    const cVar = `${sectionVar}_c`
    if (copy.heading) {
      lines.push(
        `${hVar} = Heading(${lit(copy.heading)}, "2", "text-foreground")`,
      )
      childVars.push(hVar)
    }
    if (copy.sub) {
      lines.push(`${sVar} = Text(${lit(copy.sub)}, "muted")`)
      childVars.push(sVar)
    }
    if (copy.cta) {
      lines.push(`${cVar} = Button(${lit(copy.cta)}, "default")`)
      childVars.push(cVar)
    }
    // Guarantee at least one child so the section is never empty.
    if (childVars.length === 0) {
      lines.push(
        `${hVar} = Text(${lit(copy.sub || 'Content')}, "default", "text-foreground")`,
      )
      childVars.push(hVar)
    }
  }

  // Section(children, className): slot 2 is className. Stack's 2nd positional is
  // `direction` (enum) and 3rd is `gap` (enum) — pass "col"/"md" by NAME, never a
  // raw class string there.
  //
  // DENSITY (structural, no per-site logic). Spacing must follow the CONTENT
  // SHAPE, not a single node-count threshold. Three regimes:
  //  - dense index: many nodes, OR several link/row entries with no media — a
  //    navigation/index/listing band. Tight gap + small padding so it does not
  //    explode into oceans of whitespace.
  //  - hero: a lone heading (optionally + a single CTA/intro) — the only shape
  //    that legitimately wants tall, breathing padding.
  //  - default: ordinary small content block — comfortable but NOT hero-tall, so a
  //    compact "heading + intro + a couple links" page (the big-empty-gap defect)
  //    stays tight instead of leaving most of the viewport blank.
  const linkish = contentNodes.filter(
    (n) => n.t === 'link' || n.t === 'row',
  ).length
  const headings = contentNodes.filter((n) => n.t === 'heading').length
  const hasMedia = /\bImage\(|aspect-video|bg-muted rounded/.test(
    lines.join('\n'),
  )
  const dense = childVars.length >= 8 || (linkish >= 3 && !hasMedia)
  // A hero is a near-bare heading band: 1 heading and at most one extra (a CTA or
  // single intro line), no link index. Only this gets the tall padding.
  const heroLike =
    !dense && headings >= 1 && childVars.length <= 2 && linkish === 0
  const gap = dense ? 'sm' : 'md'
  const pad = dense ? 'py-8 px-4' : heroLike ? 'py-16 px-4' : 'py-10 px-4'
  const program = [
    ...lines,
    `${sectionVar} = Section([Stack([${childVars.join(', ')}], "col", "${gap}")], "bg-background text-foreground ${pad}")`,
  ].join('\n')

  return {
    pageUrl,
    index,
    kind: sectionKind,
    program,
    contentRefs: [],
    assets: [],
    hash: `fallback_${sectionKind}_${index}_${blockName}`,
    source: 'native-fallback',
  }
}
