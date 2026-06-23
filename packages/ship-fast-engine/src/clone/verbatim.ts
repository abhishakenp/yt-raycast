import { parseHTML } from "linkedom"
import type { CapturedPage } from "./types.ts"
import { assertPublicUrl } from "./security.ts"

// Verbatim self-containment: take a Playwright-rendered CapturedPage and produce a
// single, self-contained, OFFLINE-renderable HTML document suitable for embedding in
// an iframe. We:
//   - absolutize every URL (img/source/link/a/use, inline style url()) against finalUrl
//   - inline external + inline CSS (resolving url()s, data-URI'ing SAME-ORIGIN fonts)
//   - strip ALL scripts / on* handlers / script preloads (only OUR nav shim remains)
//   - rewrite same-origin <a> into clone-nav anchors (data-clone-path + href="#")
//   - mark external <a> as target=_blank rel=noopener
//   - cap the serialized doc at MAX_DOC_BYTES (degrading fonts, then largest <style>)
//
// Generic by design: NO per-site/slug logic. Network access goes through opts.fetchImpl
// (default global fetch) + assertPublicUrl + a per-fetch AbortController timeout.

// Large docs now go to Convex file storage (no 1 MiB doc cap), so this trim cap
// only guards against truly pathological sizes; keep full fidelity well past 1 MiB.
const MAX_DOC_BYTES = 8_000_000
const FETCH_TIMEOUT_MS = 8000

// Font extension -> mime for data: URI embedding of SAME-ORIGIN @font-face sources.
const FONT_MIME: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
}

// Our (and the only) script in the output document. Listens for clicks on
// a[data-clone-path], cancels the default navigation, and forwards the requested
// clone path + absolute href to the parent frame via postMessage so the host app
// can route to the corresponding cloned page. Tiny + self-contained on purpose.
export const NAV_SHIM_SCRIPT: string =
  "(function(){document.addEventListener('click',function(e){" +
  "var t=e.target;while(t&&t!==document){if(t.tagName==='A'&&t.hasAttribute('data-clone-path')){" +
  "e.preventDefault();" +
  "var path=t.getAttribute('data-clone-path');var abs=t.getAttribute('data-clone-abs');" +
  "try{window.parent.postMessage({type:'ship-clone-nav',path:path,abs:abs},'*');}catch(_){}" +
  "return;}t=t.parentNode;}},true);})();"

const TEXT_BYTES = new TextEncoder()
function byteLengthOf(s: string): number {
  return TEXT_BYTES.encode(s).length
}

// Resolve a possibly-relative URL to absolute against `base`. Leaves protocol-less
// in-document / external-scheme refs (data:/#/mailto:/tel:/javascript:/blob:) as-is.
function toAbsolute(url: string, base: string): string {
  const trimmed = url.trim()
  if (!trimmed) return url
  if (/^(data:|#|mailto:|tel:|javascript:|blob:|about:)/i.test(trimmed)) return trimmed
  try {
    return new URL(trimmed, base).toString()
  } catch {
    return url
  }
}

// Resolve every URL candidate inside a srcset value ("a.png 1x, b.png 2x") to absolute,
// preserving each candidate's descriptor (the "1x"/"480w" suffix).
function absolutizeSrcset(srcset: string, base: string): string {
  return srcset
    .split(",")
    .map((part) => {
      const seg = part.trim()
      if (!seg) return ""
      const sp = seg.split(/\s+/)
      const u = sp[0]
      const descriptor = sp.slice(1).join(" ")
      const abs = toAbsolute(u, base)
      return descriptor ? `${abs} ${descriptor}` : abs
    })
    .filter(Boolean)
    .join(", ")
}

// Rewrite every url(...) occurrence inside a CSS string to absolute against `base`.
// Handles single/double/unquoted forms; leaves data: URIs untouched.
function absolutizeCssUrls(css: string, base: string): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, raw) => {
    const u = String(raw).trim()
    if (!u || /^(data:|#)/i.test(u)) return match
    const abs = toAbsolute(u, base)
    return `url(${quote}${abs}${quote})`
  })
}

// Same-origin test: true when `urlStr` shares an origin with `base`.
function isSameOrigin(urlStr: string, base: string): boolean {
  try {
    return new URL(urlStr, base).origin === new URL(base).origin
  } catch {
    return false
  }
}

// Lowercase file extension of a URL pathname (sans query/hash), or "".
function extOf(urlStr: string): string {
  try {
    const path = new URL(urlStr).pathname
    const last = path.split("/").pop() || ""
    const dot = last.lastIndexOf(".")
    return dot >= 0 ? last.slice(dot + 1).toLowerCase() : ""
  } catch {
    return ""
  }
}

type FetchImpl = typeof fetch

// SSRF-guarded fetch with a per-request timeout. Returns null on any failure so a
// single dead stylesheet/font never breaks the whole self-containment.
async function safeFetch(
  url: string,
  fetchImpl: FetchImpl,
): Promise<Response | null> {
  try {
    await assertPublicUrl(url)
  } catch {
    return null
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetchImpl(url, { signal: controller.signal })
    if (!res.ok) return null
    return res
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Fetch a SAME-ORIGIN font and return a base64 data: URI, or null on failure /
// unknown extension.
async function fontToDataUri(
  url: string,
  fetchImpl: FetchImpl,
): Promise<string | null> {
  const ext = extOf(url)
  const mime = FONT_MIME[ext]
  if (!mime) return null
  const res = await safeFetch(url, fetchImpl)
  if (!res) return null
  try {
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

// Process a single CSS body: resolve all url()s against `cssBase`, then inline any
// SAME-ORIGIN @font-face src urls as data: URIs (cross-origin font urls stay absolute).
// `cssBase` is the stylesheet's own URL (so relative url()s resolve correctly); origin
// comparison for fonts is against `finalUrl`.
async function processCss(
  css: string,
  cssBase: string,
  finalUrl: string,
  fetchImpl: FetchImpl,
): Promise<string> {
  // 1. Absolutize all url()s against the stylesheet's own location.
  let out = absolutizeCssUrls(css, cssBase)

  // 2. Inline same-origin @font-face sources. Collect the absolute font urls first
  //    (they are now absolute after step 1), fetch them, then substitute.
  const fontUrls = new Set<string>()
  out.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (_m, _q, raw) => {
    const u = String(raw).trim()
    if (/^(https?:)?\/\//i.test(u) || /^https?:/i.test(u)) {
      if (FONT_MIME[extOf(u)] && isSameOrigin(u, finalUrl)) fontUrls.add(u)
    }
    return _m
  })

  for (const fontUrl of fontUrls) {
    const dataUri = await fontToDataUri(fontUrl, fetchImpl)
    if (!dataUri) continue
    // Replace exact occurrences of url(<fontUrl>) (any quoting) with the data URI.
    const escaped = escapeRegExp(fontUrl)
    const re = new RegExp(`url\\(\\s*(['"]?)${escaped}\\1\\s*\\)`, "gi")
    out = out.replace(re, `url(${dataUri})`)
  }

  return out
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Revert inlined font data: URIs in a CSS string back to their original absolute
// urls — the first size-cap degradation step. We can only revert when we recorded the
// original url; processCss does not keep that map, so instead we strip the data: font
// declarations by re-running on the ORIGINAL css without font inlining. The caller
// handles this by re-processing; see selfContainPage's size-cap branch.

export async function selfContainPage(
  captured: CapturedPage,
  opts: { finalUrl: string; fetchImpl?: FetchImpl },
): Promise<{
  pathname: string
  title: string
  html: string
  byteLength: number
  truncated: boolean
}> {
  const finalUrl = opts.finalUrl
  const fetchImpl: FetchImpl = opts.fetchImpl ?? fetch

  // 1. pathname = path + sorted search params; "/" for root.
  const pathname = computePathname(finalUrl)

  const { document } = parseHTML(captured.html)

  // 2. title.
  const titleEl = document.querySelector("title")
  const title = (titleEl?.textContent || "").trim() || pathname

  let finalHost = ""
  try {
    finalHost = new URL(finalUrl).host
  } catch {
    finalHost = ""
  }

  // 3. Absolutize asset/link/anchor URLs.
  for (const img of Array.from(document.querySelectorAll("img"))) {
    const src = img.getAttribute("src")
    if (src) img.setAttribute("src", toAbsolute(src, finalUrl))
    const srcset = img.getAttribute("srcset")
    if (srcset) img.setAttribute("srcset", absolutizeSrcset(srcset, finalUrl))
  }
  for (const source of Array.from(document.querySelectorAll("source"))) {
    const src = source.getAttribute("src")
    if (src) source.setAttribute("src", toAbsolute(src, finalUrl))
    const srcset = source.getAttribute("srcset")
    if (srcset) source.setAttribute("srcset", absolutizeSrcset(srcset, finalUrl))
  }
  for (const use of Array.from(document.querySelectorAll("use"))) {
    const href = use.getAttribute("href") || use.getAttribute("xlink:href")
    if (href) use.setAttribute("href", toAbsolute(href, finalUrl))
  }
  // Inline style="...url(...)..." on any element.
  for (const el of Array.from(document.querySelectorAll("[style]"))) {
    const style = el.getAttribute("style")
    if (style && style.includes("url(")) {
      el.setAttribute("style", absolutizeCssUrls(style, finalUrl))
    }
  }
  // <link href> absolutized (stylesheet hrefs get inlined below; others just absolute).
  for (const link of Array.from(document.querySelectorAll("link[href]"))) {
    const href = link.getAttribute("href")
    if (href) link.setAttribute("href", toAbsolute(href, finalUrl))
  }

  // 4. Inline CSS: external <link rel=stylesheet> -> fetched <style>; existing <style> processed.
  // Track <style> blocks so the size-cap pass can drop the largest, and keep the
  // ORIGINAL css per style so we can re-process WITHOUT font inlining if we must
  // strip the font data: URIs to fit the byte cap.
  const styleRecords: Array<{
    el: Element
    cssBase: string
    rawCss: string
    hasFontDataUri: boolean
  }> = []

  for (const link of Array.from(document.querySelectorAll("link"))) {
    const rel = (link.getAttribute("rel") || "").toLowerCase()
    if (!rel.split(/\s+/).includes("stylesheet")) continue
    const href = link.getAttribute("href")
    if (!href) {
      link.remove()
      continue
    }
    const res = await safeFetch(href, fetchImpl)
    if (!res) {
      // On fetch failure, drop the link (don't break the page).
      link.remove()
      continue
    }
    let rawCss = ""
    try {
      rawCss = await res.text()
    } catch {
      link.remove()
      continue
    }
    const processed = await processCss(rawCss, href, finalUrl, fetchImpl)
    const styleEl = document.createElement("style")
    styleEl.textContent = processed
    link.replaceWith(styleEl)
    styleRecords.push({
      el: styleEl,
      cssBase: href,
      rawCss,
      hasFontDataUri: processed.includes("base64,") && processed !== absolutizeCssUrls(rawCss, href),
    })
  }

  // Existing inline <style> blocks (skip the ones we just created from links — those
  // are already processed and tracked).
  const trackedStyleEls = new Set(styleRecords.map((r) => r.el))
  for (const styleEl of Array.from(document.querySelectorAll("style"))) {
    if (trackedStyleEls.has(styleEl)) continue
    const rawCss = styleEl.textContent || ""
    const processed = await processCss(rawCss, finalUrl, finalUrl, fetchImpl)
    styleEl.textContent = processed
    styleRecords.push({
      el: styleEl,
      cssBase: finalUrl,
      rawCss,
      hasFontDataUri: processed.includes("base64,") && processed !== absolutizeCssUrls(rawCss, finalUrl),
    })
  }

  // 6. KEEP the site's scripts (absolutize their src) so JS-driven UI — image
  // sliders, carousels, tabs, accordions — renders pixel-faithfully. The preview
  // iframe sandbox is `allow-scripts` WITHOUT allow-top-navigation/allow-same-origin,
  // so these scripts run and manipulate the DOM but CANNOT redirect to the source
  // site or read cookies. (Stripping them is why JS-built sections rendered blank.)
  for (const script of Array.from(document.querySelectorAll("script"))) {
    const src = script.getAttribute("src")
    if (src) script.setAttribute("src", toAbsolute(src, finalUrl))
  }
  for (const link of Array.from(document.querySelectorAll("link"))) {
    const rel = (link.getAttribute("rel") || "").toLowerCase().split(/\s+/)
    const asAttr = (link.getAttribute("as") || "").toLowerCase()
    if (rel.includes("modulepreload")) {
      link.remove()
      continue
    }
    if (rel.includes("preload") && asAttr === "script") {
      link.remove()
    }
  }
  // Remove inline on* event-handler attributes from every element.
  for (const el of Array.from(document.querySelectorAll("*"))) {
    for (const name of el.getAttributeNames()) {
      if (/^on/i.test(name)) el.removeAttribute(name)
    }
  }

  // 7. Internal/external <a href> rewrite.
  for (const a of Array.from(document.querySelectorAll("a[href]"))) {
    const href = a.getAttribute("href")
    if (!href) continue
    const abs = toAbsolute(href, finalUrl)
    if (!/^https?:/i.test(abs)) continue // leave #/mailto:/tel:/data: anchors as-is
    let host = ""
    try {
      host = new URL(abs).host
    } catch {
      continue
    }
    if (finalHost && host === finalHost) {
      a.setAttribute("data-clone-path", computePathname(abs))
      a.setAttribute("data-clone-abs", abs)
      a.setAttribute("href", "#")
    } else {
      a.setAttribute("href", abs)
      a.setAttribute("target", "_blank")
      a.setAttribute("rel", "noopener noreferrer")
    }
  }

  // 8. Append OUR nav shim as the last <script> in <body>.
  const body = document.querySelector("body")
  if (body) {
    const shim = document.createElement("script")
    shim.textContent = NAV_SHIM_SCRIPT
    body.appendChild(shim)
  }

  // 9. Size cap with graded degradation.
  let truncated = false
  let html = serialize(document)
  let byteLength = byteLengthOf(html)

  if (byteLength > MAX_DOC_BYTES) {
    // Step 1: strip inlined font data: URIs — re-process each style WITHOUT font
    // inlining (absolutize url()s only, no @font-face data: substitution), reverting
    // @font-face back to absolute font URLs.
    let degraded = false
    for (const rec of styleRecords) {
      if (!rec.hasFontDataUri) continue
      rec.el.textContent = absolutizeCssUrls(rec.rawCss, rec.cssBase)
      degraded = true
    }
    if (degraded) {
      truncated = true
      html = serialize(document)
      byteLength = byteLengthOf(html)
    }
  }

  if (byteLength > MAX_DOC_BYTES) {
    // Step 2: drop the largest remaining <style> block, repeatedly, until under cap
    // or no styles remain.
    const live = styleRecords.filter((r) => r.el.parentNode)
    live.sort((a, b) => (b.el.textContent || "").length - (a.el.textContent || "").length)
    for (const rec of live) {
      rec.el.remove()
      truncated = true
      html = serialize(document)
      byteLength = byteLengthOf(html)
      if (byteLength <= MAX_DOC_BYTES) break
    }
  }

  return { pathname, title, html, byteLength, truncated }
}

// pathname = URL.pathname + sorted search params; "/" for the bare root.
function computePathname(urlStr: string): string {
  let u: URL
  try {
    u = new URL(urlStr)
  } catch {
    return "/"
  }
  let path = u.pathname || "/"
  if (path === "") path = "/"
  const params = Array.from(u.searchParams.entries())
  if (params.length > 0) {
    params.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])))
    const search = params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
    return `${path}?${search}`
  }
  return path
}

// Serialize the linkedom document to an HTML string. Prefer documentElement so a
// <!doctype>-less fragment still round-trips; fall back to document.toString().
function serialize(document: {
  documentElement?: { outerHTML?: string } | null
  toString(): string
}): string {
  const el = document.documentElement
  if (el && typeof el.outerHTML === "string") {
    return `<!DOCTYPE html>${el.outerHTML}`
  }
  return document.toString()
}
