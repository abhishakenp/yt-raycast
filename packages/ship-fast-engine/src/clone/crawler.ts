'use node'

import { URL } from 'url'
import { parseHTML } from 'linkedom'
import type { PageGraph, CloneOptions } from './types.ts'
import { assertPublicUrl } from './security.ts'

// Parallel fan-out crawl; build cycle-safe page graph; URL normalization; depth/page caps; concurrency cap

const MAX_DEPTH_DEFAULT = 3
const MAX_PAGES_DEFAULT = 20
const CONCURRENCY_DEFAULT = 4
const MAX_HTML_SIZE = 10 * 1024 * 1024
const MAX_PAGE_REDIRECTS = 5

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const HTML_CONTENT_TYPES = new Set(['text/html', 'application/xhtml+xml'])

// Normalize URL into canonical form for deduplication (CONTRACT canonical form):
// lowercase host, strip default ports (:80/:443), drop #fragment, sort query params,
// treat `www.host` and `host` as the same site.
// NOTE: trailing-slash is intentionally NOT stripped — the CONTRACT does not mandate
// it, and `/a` vs `/a/` can be distinct resources on some sites (over-merge risk).
export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw)

    // Lowercase host, treat www.host === host
    let host = url.hostname.toLowerCase()
    if (host.startsWith('www.')) {
      host = host.slice(4)
    }
    url.hostname = host

    // Strip default ports
    if (
      (url.protocol === 'http:' && url.port === '80') ||
      (url.protocol === 'https:' && url.port === '443')
    ) {
      url.port = ''
    }

    // Drop fragment
    url.hash = ''

    // Collapse directory-index aliases: a trailing default document — `index.html`
    // (and index.htm/php/aspx/jsp) — addresses the SAME resource the web server
    // serves for that directory, so `/` and `/index.html` (or `/docs/` and
    // `/docs/index.html`) are one page. A single static page that links to itself as
    // both forms otherwise yields two pages -> a fabricated 2-tab PageSwitch with a
    // phantom duplicate. We strip ONLY the default-document filename (leaving the
    // directory slash intact), so this never merges genuinely distinct paths like
    // `/a` vs `/a/` — it only canonicalizes the well-known index alias.
    url.pathname = url.pathname.replace(
      /\/index\.(?:html?|php|aspx?|jsp)$/i,
      '/',
    )

    // Sort query params
    const params = Array.from(url.searchParams.entries()).sort(([a], [b]) =>
      a === b ? 0 : a < b ? -1 : 1,
    )
    url.search = ''
    for (const [key, value] of params) {
      url.searchParams.append(key, value)
    }

    return url.toString()
  } catch {
    return raw
  }
}

// Check if URL is same-domain as seed (using normalized hosts so www === apex)
function isSameDomain(seedUrl: string, targetUrl: string): boolean {
  try {
    const seedHost = new URL(normalizeUrl(seedUrl)).hostname
    const targetHost = new URL(normalizeUrl(targetUrl)).hostname
    return seedHost === targetHost
  } catch {
    return false
  }
}

// Build a structural content signature for a fetched page so near-identical
// bodies collapse into ONE page instead of N pseudo-pages. Many sites (classic
// hyperlinked docs, link hubs, "coming soon" stubs) serve the SAME shell — often
// just a single page-title <h1> with an empty body — under dozens of distinct
// relative URLs. Keying the crawl purely by URL then yields 20 duplicate stubs.
//
// The signature is the normalized visible text plus the ordered tag skeleton of
// block-level elements, so two pages with identical copy AND identical structure
// hash equal, while pages that merely share a header/nav but carry distinct
// bodies stay separate. Domain-agnostic: no host/slug/keyword special-casing.
function contentSignature(html: string): string | null {
  try {
    const { document: doc } = parseHTML(html)
    const body = doc.body
    if (!body) return null
    // Drop non-rendering nodes that add noise (inline scripts/styles vary per build).
    body
      .querySelectorAll('script, style, template, noscript')
      .forEach((n) => n.remove())
    // Normalized visible text (collapse whitespace, lowercase).
    const text = (body.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
    // Ordered skeleton of structural/heading/media tags — captures "shape".
    const skeleton = Array.from(
      body.querySelectorAll(
        'h1,h2,h3,h4,section,article,header,footer,nav,aside,main,img,table,form,ul,ol,p',
      ),
    )
      .map((el) => el.tagName.toLowerCase())
      .join('>')
    // A page with essentially no body text is a STUB; collapse ALL such stubs
    // together (signature keyed only on skeleton) so 16 empty-H1 pages dedupe to one.
    if (text.length < 40) {
      return `stub:${skeleton}`
    }
    return `${skeleton}::${text.slice(0, 4000)}`
  } catch {
    return null
  }
}

// LANGUAGE-INDEPENDENT structural fingerprint. Two pages that are the SAME page
// rendered in different languages (the translated-essay variants a single-page
// site links to: /es, /zh, /fr, /de …) share an IDENTICAL block skeleton and
// near-identical block counts, but their visible TEXT differs entirely — so
// contentSignature (which embeds the text) never collapses them, and they get
// promoted into bogus top-level tabs. This fingerprint hashes ONLY the ordered
// tag skeleton plus per-tag counts and a coarse text-length bucket — no words —
// so translations/variants of one page collapse together. Domain-agnostic:
// keyed purely on DOM shape, never on host/slug/lang attribute/keyword.
function structuralSignature(html: string): string | null {
  try {
    const { document: doc } = parseHTML(html)
    const body = doc.body
    if (!body) return null
    body
      .querySelectorAll('script, style, template, noscript')
      .forEach((n) => n.remove())
    const blocks = Array.from(
      body.querySelectorAll(
        'h1,h2,h3,h4,h5,h6,section,article,header,footer,nav,aside,main,img,table,form,ul,ol,li,p,blockquote',
      ),
    )
    // Require enough structure to make an accidental shape-collision unlikely; a
    // tiny page (just an <h1>) is handled by the stub path in contentSignature.
    if (blocks.length < 6) return null
    const counts = new Map<string, number>()
    const skeleton: string[] = []
    for (const el of blocks) {
      const t = el.tagName.toLowerCase()
      skeleton.push(t)
      counts.set(t, (counts.get(t) || 0) + 1)
    }
    const countKey = Array.from(counts.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([t, n]) => `${t}${n}`)
      .join(',')
    // Coarse length bucket (log scale) so prose vs. its translation — within ~2x
    // length — still bucket together, while a structurally-identical but
    // content-wise much larger page stays distinct.
    const text = (body.textContent || '').replace(/\s+/g, ' ').trim()
    const lenBucket = Math.round(Math.log2(Math.max(1, text.length)))
    return `struct:${skeleton.join('>')}|${countKey}|${lenBucket}`
  } catch {
    return null
  }
}

// NEAR-DUPLICATE TEXT FINGERPRINT. contentSignature requires the skeleton prefix
// AND text prefix to match EXACTLY, and structuralSignature requires an identical
// tag-count shape — so two crawled pages that are the SAME page with only minor
// markup noise (a wrapper div added, an extra <p>, a re-rendered nav) hash
// differently and BOTH survive, then get promoted into fabricated PageSwitch tabs
// whose bodies are near-identical ("home" and "TheProject" both reduced to the same
// intro). This returns the set of normalized word bigrams (shingles) of the visible
// body text. Two pages whose shingle sets have high CONTAINMENT are the same page
// regardless of structural noise. Domain-agnostic: pure text shape, no host/slug.
function textShingles(html: string): Set<string> | null {
  try {
    const { document: doc } = parseHTML(html)
    const body = doc.body
    if (!body) return null
    body
      .querySelectorAll('script, style, template, noscript')
      .forEach((n) => n.remove())
    const words = (body.textContent || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0)
    // Too little text to fingerprint reliably — let the stub path handle it.
    if (words.length < 8) return null
    const shingles = new Set<string>()
    for (let i = 0; i < words.length - 1; i++) {
      shingles.add(`${words[i]} ${words[i + 1]}`)
    }
    return shingles
  } catch {
    return null
  }
}

// CONTAINMENT of the SMALLER shingle set inside the larger: |A∩B| / min(|A|,|B|).
// Containment (not symmetric Jaccard) so a degraded/truncated capture of a page —
// whose text is a near-SUBSET of the fuller capture — still collapses, even though
// its smaller size would drag a symmetric Jaccard score down. Threshold is high
// (0.8) so genuinely distinct pages that merely share a header/nav phrase stay
// separate; only pages that are substantially the SAME prose collapse.
const NEAR_DUP_CONTAINMENT = 0.8

function shingleContainment(a: Set<string>, b: Set<string>): number {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  if (small.size === 0) return 0
  let inter = 0
  for (const s of small) {
    if (large.has(s)) inter++
  }
  return inter / small.size
}

// Extract links from HTML (naive but functional for crawling)
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1]
    try {
      const absolute = new URL(href, baseUrl).toString()
      if (absolute.startsWith('http://') || absolute.startsWith('https://')) {
        links.push(absolute)
      }
    } catch {
      // Skip invalid URLs
    }
  }
  return links
}

// Crawl state for BFS traversal
interface CrawlState {
  queue: Array<{ url: string; depth: number }>
  visited: Set<string>
  graph: PageGraph
  pages: Map<string, { html: string; depth: number }>
  // content-signature -> already-stored normalized url, for cross-URL body dedup
  contentSeen: Map<string, string>
  // language-independent structural fingerprint -> already-stored normalized url.
  // Collapses translation/variant pages of one single-page site (same DOM shape,
  // different language) so they are not promoted into fabricated top-level tabs.
  structuralSeen: Map<string, string>
  // Per stored page: its visible-text shingle set, for near-duplicate collapse of
  // pages that share substantially the SAME prose but differ in markup noise (so
  // neither contentSignature nor structuralSignature catches them).
  shingleSeen: Array<{ url: string; shingles: Set<string> }>
}

async function readHtmlBody(response: Response): Promise<string | null> {
  const contentLength = response.headers.get('content-length')
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength)
    if (Number.isFinite(declaredBytes) && declaredBytes > MAX_HTML_SIZE) {
      return null
    }
  }

  if (!response.body) return null

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let receivedBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    receivedBytes += value.byteLength
    if (receivedBytes > MAX_HTML_SIZE) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString(
    'utf8',
  )
}

function isHtmlDocument(html: string): boolean {
  return /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(html)
}

// Fetch a page while validating every redirect target before network access.
// Returns the FINAL response URL so callers key the page by its canonical target.
async function fetchPage(
  url: string,
  signal?: AbortSignal,
): Promise<{ html: string; finalUrl: string; success: boolean }> {
  const failed = { html: '', finalUrl: url, success: false }

  try {
    const timeoutSignal = AbortSignal.timeout(30000)
    const requestSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal
    let currentUrl = url

    for (let hop = 0; hop <= MAX_PAGE_REDIRECTS; hop++) {
      await assertPublicUrl(currentUrl)
      if (!isSameDomain(url, currentUrl)) return failed

      const response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        signal: requestSignal,
      })

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get('location')
        if (!location) return failed
        currentUrl = new URL(location, currentUrl).toString()
        await response.body?.cancel()
        continue
      }

      if (!response.ok) return failed

      const finalUrl = response.url || currentUrl
      await assertPublicUrl(finalUrl)
      if (!isSameDomain(url, finalUrl)) return failed

      const contentType = response.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase()
      const declaredHtml = contentType
        ? HTML_CONTENT_TYPES.has(contentType)
        : false
      if (contentType && !declaredHtml && contentType !== 'text/plain') {
        return failed
      }

      const html = await readHtmlBody(response)
      if (html === null || (!declaredHtml && !isHtmlDocument(html))) {
        return failed
      }

      return { html, finalUrl, success: true }
    }

    return failed
  } catch {
    return failed
  }
}

export async function crawlSite(
  seedUrl: string,
  options: CloneOptions = {},
): Promise<{
  graph: PageGraph
  pages: Map<string, { html: string; depth: number }>
}> {
  const {
    maxDepth = MAX_DEPTH_DEFAULT,
    maxPages = MAX_PAGES_DEFAULT,
    concurrency = CONCURRENCY_DEFAULT,
    onEvent,
    signal,
  } = options

  const state: CrawlState = {
    queue: [{ url: seedUrl, depth: 0 }],
    visited: new Set(),
    graph: { nodes: new Map(), edges: [] },
    pages: new Map(),
    contentSeen: new Map(),
    structuralSeen: new Map(),
    shingleSeen: [],
  }
  const workerCount = Number.isFinite(concurrency)
    ? Math.max(1, Math.floor(concurrency))
    : CONCURRENCY_DEFAULT

  // Atomic page-slot reservation: count SUCCESSFUL pages only, but reserve the
  // slot BEFORE the await so concurrent workers can never overshoot maxPages.
  let reservedPages = 0

  // Helper to add node to graph
  const addNode = (url, normalized) => {
    if (!state.graph.nodes.has(normalized)) {
      state.graph.nodes.set(normalized, {
        url,
        normalizedUrl: normalized,
        outgoing: [],
        incoming: [],
      })
    }
  }

  // Helper to add edge to graph
  const addEdge = (from, to) => {
    state.graph.edges.push({ from, to })
    const fromNode = state.graph.nodes.get(from)
    const toNode = state.graph.nodes.get(to)
    if (fromNode && !fromNode.outgoing.includes(to)) {
      fromNode.outgoing.push(to)
    }
    if (toNode && !toNode.incoming.includes(from)) {
      toNode.incoming.push(from)
    }
  }

  // Process queue with concurrency cap
  const processing = new Set<Promise<void>>()
  let nextIndex = 0

  const processNext = async () => {
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError')
    if (nextIndex >= state.queue.length) {
      return
    }

    // Reserve a page slot atomically before awaiting. If the cap is hit, bail
    // without consuming the queue entry so other workers also stop.
    if (reservedPages >= maxPages) {
      return
    }

    const { url, depth } = state.queue[nextIndex++]
    const normalized = normalizeUrl(url)

    if (depth > maxDepth || state.visited.has(normalized)) {
      return
    }

    state.visited.add(normalized)

    // Reserve the slot synchronously before the fetch await.
    reservedPages++

    onEvent?.({
      type: 'crawl_progress',
      crawled: state.pages.size,
      total: maxPages,
    })

    // Fetch page (follows redirects, returns final url)
    const { html, finalUrl, success } = await fetchPage(url, signal)
    if (!success) {
      // Release the reserved slot — failed fetches must not count toward the cap.
      reservedPages--
      return
    }

    // Key the page/graph by the FINAL url after redirects.
    const finalNormalized = normalizeUrl(finalUrl)

    // If a redirect landed us on an already-visited page, release the slot.
    if (finalNormalized !== normalized && state.pages.has(finalNormalized)) {
      reservedPages--
      return
    }

    // CONTENT-SIGNATURE DEDUP: collapse distinct URLs that serve the SAME body
    // (empty stubs, link-hub shells, "coming soon" pages all sharing one page-title
    // <h1>) into a single canonical page. Without this, a classic hyperlinked site
    // explodes into 20 near-identical pseudo-pages — most of them thin H1-only
    // stubs — that downstream PageSwitch turns into duplicate empty tabs.
    //
    // The depth-0 home page is always KEPT as its own canonical page (it is never
    // dropped as a dup), BUT we still COMPUTE and RECORD its signature so that a
    // descendant URL whose body is byte-identical to the home page collapses INTO
    // home instead of surviving as a second, duplicate "page". A single static page
    // that links to itself (or to an alias of itself) otherwise yields home + p1 as
    // two identical pages, which downstream turns into a fabricated 2-tab PageSwitch.
    const signature = contentSignature(html)
    // Only descendant pages may be DROPPED as a content-duplicate; the home page is
    // recorded (below) but never matched-away here.
    if (signature && depth > 0) {
      const canonical = state.contentSeen.get(signature)
      if (
        canonical &&
        canonical !== finalNormalized &&
        state.pages.has(canonical)
      ) {
        // Already have a page with this exact body. Record the graph node/edge so
        // link structure is preserved, but do NOT store a duplicate page or count
        // it toward the cap.
        addNode(finalUrl, finalNormalized)
        addEdge(canonical, finalNormalized)
        reservedPages--
        return
      }
    }

    // STRUCTURAL-VARIANT DEDUP: collapse a descendant page that is the SAME page in
    // a different language (a translated essay variant the home page links to) into
    // its canonical sibling. contentSignature embeds the visible text, so a
    // translation never matches it; this language-independent shape fingerprint
    // does. Keeps a single-page site SINGLE — its /es, /zh, /fr, /de mirrors do not
    // each become a fabricated top-level PageSwitch tab. Home (depth 0) is recorded
    // below but never dropped here.
    const structSig = structuralSignature(html)
    if (structSig && depth > 0) {
      const canonical = state.structuralSeen.get(structSig)
      if (
        canonical &&
        canonical !== finalNormalized &&
        state.pages.has(canonical)
      ) {
        addNode(finalUrl, finalNormalized)
        addEdge(canonical, finalNormalized)
        reservedPages--
        return
      }
    }

    // NEAR-DUPLICATE TEXT DEDUP: collapse a descendant page whose visible prose is
    // substantially the SAME as an already-stored page but whose markup differs
    // enough that the exact content/structural signatures missed it (a wrapper div,
    // an extra paragraph, a degraded re-capture that drops the body and leaves only
    // the shared intro). Without this, such a page survives and is promoted into a
    // fabricated PageSwitch tab that merely repeats the home page's intro. Home
    // (depth 0) is recorded below but never dropped here.
    const shingles = depth > 0 ? textShingles(html) : null
    if (shingles) {
      for (const prior of state.shingleSeen) {
        if (
          prior.url !== finalNormalized &&
          state.pages.has(prior.url) &&
          shingleContainment(shingles, prior.shingles) >= NEAR_DUP_CONTAINMENT
        ) {
          addNode(finalUrl, finalNormalized)
          addEdge(prior.url, finalNormalized)
          reservedPages--
          return
        }
      }
    }

    addNode(finalUrl, finalNormalized)
    if (finalNormalized !== normalized) {
      // Record the redirect edge so the graph reflects reality.
      addNode(url, normalized)
      addEdge(normalized, finalNormalized)
    }
    state.visited.add(finalNormalized)
    state.pages.set(finalNormalized, { html, depth })
    if (signature) state.contentSeen.set(signature, finalNormalized)
    // Record this page's text shingles (home included) so later near-duplicate
    // descendants collapse into it. Computed for home even though home is never
    // dropped, so a descendant that merely repeats the home intro collapses here.
    {
      const homeOrPageShingles = shingles ?? textShingles(html)
      if (homeOrPageShingles) {
        state.shingleSeen.push({
          url: finalNormalized,
          shingles: homeOrPageShingles,
        })
      }
    }
    // Record the structural fingerprint (home included) so later translation/
    // variant siblings collapse into this canonical page instead of becoming tabs.
    if (structSig && !state.structuralSeen.has(structSig)) {
      state.structuralSeen.set(structSig, finalNormalized)
    }

    onEvent?.({
      type: 'crawl_progress',
      crawled: state.pages.size,
      total: maxPages,
    })

    // Extract links for same-domain crawling
    if (depth < maxDepth) {
      const links = extractLinks(html, finalUrl)
      for (const link of links) {
        if (isSameDomain(seedUrl, link)) {
          const linkNormalized = normalizeUrl(link)
          addNode(link, linkNormalized)
          addEdge(finalNormalized, linkNormalized)
          if (!state.visited.has(linkNormalized)) {
            state.queue.push({ url: link, depth: depth + 1 })
          }
        }
      }
    }
  }

  // Fan out with concurrency cap. Cap on SUCCESSFUL pages (reservedPages).
  while (
    nextIndex < state.queue.length &&
    reservedPages < maxPages &&
    !signal?.aborted
  ) {
    while (
      processing.size < workerCount &&
      nextIndex < state.queue.length &&
      reservedPages < maxPages
    ) {
      const p = processNext().finally(() => processing.delete(p))
      processing.add(p)
    }
    if (processing.size > 0) {
      await Promise.race(processing)
    }
  }

  // Wait for remaining
  await Promise.all(processing)

  onEvent?.({
    type: 'crawl_progress',
    crawled: state.pages.size,
    total: maxPages,
  })

  return { graph: state.graph, pages: state.pages }
}
