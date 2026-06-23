import { parseHTML } from "linkedom"
import type { CapturedPage } from "./types.ts"

// Turn a SCRAPED page capture into a STRUCTURED TEXT BRIEF suitable as the
// `prompt` for the v2-compose generator. The brief (a) surfaces salient
// keywords so the downstream family shortlist routes to the right section
// family, and (b) carries the source's real brand / nav / headings / lead copy
// / CTAs so the generator reproduces the content natively.
//
// Generic by design: NO per-site/slug logic. We infer a site-kind HINT only by
// surfacing whichever salient keywords actually appear in the scraped copy/nav
// — we never branch on a specific hostname or brief.
//
// Parses HTML with the SAME parser the rest of the clone code uses
// (linkedom parseHTML, as in verbatim.ts) so it runs in Node with no new dep.

const MAX_BRIEF_CHARS = 6000
const MAX_NAV_LABELS = 12
const MAX_HEADINGS = 30
const MAX_CTAS = 8
const MAX_SECTION_LINES = 16
const MAX_LEAD_CHARS = 240

// Collapse whitespace and trim. Visible text only.
function clean(s: string | null | undefined): string {
  return (s || "").replace(/\s+/g, " ").trim()
}

// Truncate to `n` chars on a word boundary where possible, adding an ellipsis.
function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const lastSpace = cut.lastIndexOf(" ")
  const base = lastSpace > n * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${base.trim()}…`
}

// Host of a URL, or "" — used as the brand fallback when nothing else is found.
function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return ""
  }
}

// Site-kind keyword buckets. Surfaced (not branched on): we report which salient
// terms actually appear so the family shortlist can route. Extend freely — the
// engine stays generic because we only echo matches, never special-case sites.
const KIND_KEYWORDS: Record<string, string[]> = {
  government: ["government", "portal", "tender", "ministry", "department", "citizen", "scheme", "gazette", "public notice"],
  saas: ["pricing", "sign up", "signup", "sign in", "log in", "login", "dashboard", "free trial", "get started", "subscribe", "api"],
  ecommerce: ["cart", "checkout", "shop", "buy now", "add to cart", "product", "shipping", "store", "collection"],
  restaurant: ["menu", "reservation", "reserve", "book a table", "dine", "cuisine", "order online"],
  portfolio: ["portfolio", "my work", "case study", "projects", "résumé", "resume", "about me"],
  blog: ["blog", "article", "read more", "posts", "archive", "subscribe to newsletter"],
  agency: ["agency", "our services", "clients", "case studies", "let's talk", "get a quote"],
}

// Scan a haystack for which kind-keywords appear; return the dominant kind label
// and the salient matched keywords. Pure surfacing, no per-site branching.
function inferKindHint(haystack: string): { kind: string; keywords: string[] } {
  const hay = haystack.toLowerCase()
  let bestKind = ""
  let bestCount = 0
  const matched: string[] = []
  for (const [kind, words] of Object.entries(KIND_KEYWORDS)) {
    let count = 0
    for (const w of words) {
      if (hay.includes(w)) {
        count++
        if (!matched.includes(w)) matched.push(w)
      }
    }
    if (count > bestCount) {
      bestCount = count
      bestKind = kind
    }
  }
  return { kind: bestKind, keywords: matched.slice(0, 8) }
}

type DomEl = {
  textContent: string | null
  getAttribute(name: string): string | null
  querySelector(sel: string): DomEl | null
  querySelectorAll(sel: string): ArrayLike<DomEl>
}

function all(node: DomEl | null, sel: string): DomEl[] {
  if (!node) return []
  try {
    return Array.from(node.querySelectorAll(sel))
  } catch {
    return []
  }
}

// Push a cleaned label if non-empty and not a case-insensitive dup; respect cap.
function pushUnique(into: string[], seen: Set<string>, raw: string | null | undefined, cap: number): void {
  if (into.length >= cap) return
  const label = clean(raw)
  if (!label) return
  const key = label.toLowerCase()
  if (seen.has(key)) return
  seen.add(key)
  into.push(label)
}

export function buildCloneBrief(capture: CapturedPage): string {
  const url = capture?.url || ""
  const hostBrand = hostOf(url)

  let document: DomEl | null = null
  try {
    document = parseHTML(capture?.html || "").document as unknown as DomEl
  } catch {
    document = null
  }

  // --- Brand: <title> → og:site_name → most prominent header/logo brand text ---
  let brand = ""
  if (document) {
    brand = clean(document.querySelector("title")?.textContent)
    if (!brand) {
      const og = document.querySelector('meta[property="og:site_name"]')
      brand = clean(og?.getAttribute("content"))
    }
    if (!brand) {
      const logo =
        document.querySelector("header a") ||
        document.querySelector('[class*="logo" i] a') ||
        document.querySelector('[class*="brand" i]') ||
        document.querySelector("header")
      brand = clean(logo?.textContent)
    }
  }
  // Titles often read "Brand — Tagline"; keep the leading brand token but cap length.
  if (brand) brand = truncate(brand.split(/[|–—·:•]/)[0].trim() || brand, 80)
  if (!brand) brand = hostBrand || "this website"

  // --- Nav labels: <a>/<button> inside <header>/<nav> ---
  const navLabels: string[] = []
  const navSeen = new Set<string>()
  if (document) {
    const navRoots = [...all(document, "header"), ...all(document, "nav")]
    for (const root of navRoots) {
      for (const el of [...all(root, "a"), ...all(root, "button")]) {
        pushUnique(navLabels, navSeen, el.textContent, MAX_NAV_LABELS)
      }
    }
  }

  // --- Headings in document order: h1, h2, h3 ---
  const headings: string[] = []
  const headingSeen = new Set<string>()
  if (document) {
    for (const h of all(document, "h1, h2, h3")) {
      pushUnique(headings, headingSeen, h.textContent, MAX_HEADINGS)
    }
  }

  // --- Section lead copy: first <p> following each heading (sibling-walk) ---
  // linkedom supports nextElementSibling; walk forward from each heading to the
  // first paragraph and use it as the heading's lead. Falls back to first <p>
  // overall when a heading has no following paragraph.
  type Lead = { heading: string; lead: string }
  const sectionLines: Lead[] = []
  if (document) {
    const headingEls = all(document, "h1, h2, h3")
    for (const h of headingEls) {
      if (sectionLines.length >= MAX_SECTION_LINES) break
      const headingText = clean(h.textContent)
      if (!headingText) continue
      let lead = ""
      let cursor: DomEl | null = (h as unknown as { nextElementSibling?: DomEl | null }).nextElementSibling ?? null
      let hops = 0
      while (cursor && hops < 6) {
        const tag = (cursor as unknown as { tagName?: string }).tagName?.toLowerCase()
        if (tag === "p") {
          lead = clean(cursor.textContent)
          if (lead) break
        }
        // Stop scanning at the next heading — that's a new section.
        if (tag && /^h[1-6]$/.test(tag)) break
        // Descend into a wrapping container to find its first paragraph.
        if (!lead && (tag === "div" || tag === "section")) {
          const innerP = cursor.querySelector("p")
          if (innerP) {
            lead = clean(innerP.textContent)
            if (lead) break
          }
        }
        cursor = (cursor as unknown as { nextElementSibling?: DomEl | null }).nextElementSibling ?? null
        hops++
      }
      sectionLines.push({ heading: headingText, lead: truncate(lead, MAX_LEAD_CHARS) })
    }
  }

  // --- CTA / button labels: prominent buttons + button-styled links ---
  const ctas: string[] = []
  const ctaSeen = new Set<string>()
  if (document) {
    const ctaEls = [
      ...all(document, "button"),
      ...all(document, '[role="button"]'),
      ...all(document, 'a[class*="btn" i]'),
      ...all(document, 'a[class*="button" i]'),
      ...all(document, 'a[class*="cta" i]'),
    ]
    for (const el of ctaEls) {
      pushUnique(ctas, ctaSeen, el.textContent, MAX_CTAS)
    }
  }

  // --- Inferred site-kind hint from salient keywords in copy + nav ---
  const haystack = [
    brand,
    navLabels.join(" "),
    headings.join(" "),
    sectionLines.map((s) => `${s.heading} ${s.lead}`).join(" "),
    ctas.join(" "),
  ].join(" ")
  const { kind, keywords } = inferKindHint(haystack)

  // --- Compose the structured brief ---
  const lines: string[] = []
  const kindClause = kind
    ? `It appears to be a ${kind} site${keywords.length ? ` (salient: ${keywords.join(", ")})` : ""}.`
    : keywords.length
      ? `Salient terms: ${keywords.join(", ")}.`
      : ""
  // Lead with the REAL brand name as the very first words — the generator
  // derives the site's brand/logo from the start of the prompt, so a label or
  // the word "Rebuild" here would be mistaken for the brand. Put the rebuild
  // instruction at the end (the final "Reproduce this..." line) instead.
  lines.push(`${brand}. ${kindClause}`.trim())

  if (navLabels.length) {
    lines.push(`Navigation: ${navLabels.join(", ")}`)
  }

  if (sectionLines.length) {
    lines.push("Sections (in order):")
    for (const s of sectionLines) {
      lines.push(s.lead ? `- ${s.heading} — ${s.lead}` : `- ${s.heading}`)
    }
  } else if (headings.length) {
    lines.push("Sections (in order):")
    for (const h of headings.slice(0, MAX_SECTION_LINES)) {
      lines.push(`- ${h}`)
    }
  }

  if (ctas.length) {
    lines.push(`Primary actions: ${ctas.join(", ")}`)
  }

  lines.push("Reproduce this structure and content faithfully using native sections.")

  const brief = lines.join("\n")
  return brief.length > MAX_BRIEF_CHARS ? truncate(brief, MAX_BRIEF_CHARS) : brief
}
