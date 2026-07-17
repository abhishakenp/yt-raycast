import type {
  ClonedPage,
  CloneOptions,
  CloneResult,
  ExtractedTokens,
} from './types.ts'
import { crawlSite, normalizeUrl } from './crawler.ts'
import { capturePages } from './capture.ts'
import type { CapturedPageWithShots } from './capture.ts'
import { segmentPage, extractPageNavLinks } from './segment.ts'
import type { Section } from './segment.ts'
import { dedupSections, applyDedup, hashSection } from './dedup.ts'
import { extractTokens } from './tokens.ts'
import { convertSections } from './convert.ts'
import type { ClonedSectionWithSource } from './convert.ts'
import { downloadPageAssets } from './assets.ts'
import { generateFallbackSection, expectedContentStrings } from './fallback.ts'

// Orchestrates crawl→capture→segment→dedup→convert per page; streams progress; assembles per-page OpenUI-Lang.
// HOME-FIRST: the seed/home page (depth 0 / seedUrl) is converted and emitted FIRST,
// then remaining pages are converted and emitted progressively. Per-page try/catch
// means a single bad page never hard-fails the whole job.

export async function cloneSite(
  seedUrl: string,
  options: CloneOptions,
): Promise<CloneResult> {
  const {
    workspace = '',
    maxDepth = 3,
    maxPages = 20,
    concurrency = 4,
    onEvent,
    signal,
  } = options

  const errors: string[] = []
  const pages: ClonedPage[] = []
  const assets = new Map<string, string>()

  const defaultTokens: ExtractedTokens = {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#3b82f6',
    secondary: '#64748b',
    muted: '#64748b',
    accent: '#8b5cf6',
    border: '#e2e8f0',
    radius: '0.5rem',
    fontFamily: 'sans-serif',
    spacing: '1rem',
  }

  try {
    // Phase 1: Crawl
    onEvent?.({ type: 'crawl_progress', crawled: 0, total: maxPages })
    const { graph, pages: crawledPages } = await crawlSite(seedUrl, {
      maxDepth,
      maxPages,
      concurrency,
      onEvent,
      signal,
    })

    if (crawledPages.size === 0) {
      throw new Error('No pages could be crawled')
    }

    // Identify the HOME page: depth 0, else the normalized seed url, else first crawled.
    const seedNormalized = normalizeUrl(seedUrl)
    let homeUrl: string | undefined
    for (const [url, info] of crawledPages.entries()) {
      if (info.depth === 0) {
        homeUrl = url
        break
      }
    }
    if (!homeUrl && crawledPages.has(seedNormalized)) homeUrl = seedNormalized
    if (!homeUrl) homeUrl = Array.from(crawledPages.keys())[0]

    // Phase 2: Capture pages in parallel.
    const urls = Array.from(crawledPages.keys())
    const rawCapturedPages = await capturePages(urls, concurrency, signal)

    // RESILIENT CAPTURE (general, no per-site logic). A single capture pass can
    // come back empty or missing the HOME page from transient causes — a slow page
    // that overshoots the per-goto timeout, a 429/Too-Many-Requests burst, or a
    // momentary network blip. Treating that as a hard failure ("Clone produced no
    // pages") throws away an otherwise clonable site. We retry the STILL-MISSING
    // urls once (home prioritised), so a flaky first attempt no longer zeroes the
    // whole job. Retry is keyed purely on which urls produced no capture — never on
    // hostname/slug — so it generalises to any target.
    if (!signal?.aborted) {
      const have = new Set<string>()
      for (const c of rawCapturedPages.values()) {
        have.add(c.normalizedUrl || normalizeUrl(c.url))
      }
      const missing = urls.filter((u) => !have.has(normalizeUrl(u)))
      // Always re-attempt home first; cap the retry batch so a huge crawl can't
      // double its capture cost.
      const retryHomeFirst = (a: string, b: string) => {
        const an = normalizeUrl(a) === normalizeUrl(seedUrl) ? -1 : 0
        const bn = normalizeUrl(b) === normalizeUrl(seedUrl) ? -1 : 0
        return an - bn
      }
      const retryUrls = missing
        .sort(retryHomeFirst)
        .slice(0, Math.max(1, Math.min(missing.length, maxPages)))
      if (retryUrls.length > 0) {
        const retried = await capturePages(retryUrls, concurrency, signal)
        for (const [k, v] of retried.entries()) {
          if (!rawCapturedPages.has(k)) rawCapturedPages.set(k, v)
        }
      }
    }

    if (rawCapturedPages.size === 0) {
      throw new Error('No pages could be captured')
    }

    // CANONICAL KEY-SPACE UNIFICATION (fixes HOME-FIRST key mismatch):
    // capturePages keys its result map by the raw playwright `page.url()`
    // (post-redirect but NOT normalized — keeps `www.`, original trailing slash,
    // original param order). crawlSite, `homeUrl`, and `urls` all live in the
    // NORMALIZED key space (normalizeUrl(finalUrl): www-stripped, params sorted).
    // If we leave the captured map raw, `homeUrl` matches NO captured key for any
    // seed with a www host / param / slash delta, silently losing the HOME-FIRST
    // emit order. Re-key by each captured page's already-computed `normalizedUrl`
    // so capture/crawler/home all share ONE canonical space. On collision (two raw
    // urls normalizing to the same key) keep the first.
    const capturedPages = new Map<string, CapturedPageWithShots>()
    for (const captured of rawCapturedPages.values()) {
      const key = captured.normalizedUrl || normalizeUrl(captured.url)
      if (!capturedPages.has(key)) capturedPages.set(key, captured)
    }

    // REAL SITE-NAVIGATION LINK SET (home page only). Extract anchors inside the
    // home page's nav/header LANDMARK regions — the genuine site navigation —
    // resolve each to absolute against the home URL, normalize to the canonical
    // key space, keep only SAME-DOMAIN entries (a nav tab must be an internal page),
    // and dedupe. The assembler builds PageSwitch tabs from THIS set, not from
    // arbitrary in-content links. Structural only: landmarks + anchors + same-domain,
    // no per-site branches. Computed once here so it threads onto the home ClonedPage.
    const homeNavLinks: string[] = []
    {
      const homeCaptured = homeUrl ? capturedPages.get(homeUrl) : undefined
      if (homeUrl && homeCaptured) {
        let homeHost = ''
        try {
          homeHost = new URL(normalizeUrl(homeUrl)).hostname
        } catch {
          homeHost = ''
        }
        const seenNav = new Set<string>()
        for (const rawHref of extractPageNavLinks(homeCaptured)) {
          let normalized: string
          try {
            normalized = normalizeUrl(new URL(rawHref, homeUrl).toString())
          } catch {
            continue
          }
          // Same-domain only (mirrors crawler.isSameDomain: compare normalized hosts).
          let targetHost = ''
          try {
            targetHost = new URL(normalized).hostname
          } catch {
            continue
          }
          if (!homeHost || targetHost !== homeHost) continue
          if (seenNav.has(normalized)) continue
          seenNav.add(normalized)
          homeNavLinks.push(normalized)
        }
      }
    }

    // Phase 3: Segment each page + extract tokens + download assets.
    const pageSections = new Map<string, Section[]>()
    const allTokens: ExtractedTokens[] = []

    // Order so the HOME page is segmented/tokenized first (token baseline = home).
    const capturedEntries = Array.from(capturedPages.entries()).sort(
      ([a], [b]) => {
        if (a === homeUrl) return -1
        if (b === homeUrl) return 1
        return 0
      },
    )

    for (const [url, captured] of capturedEntries) {
      try {
        const sections = segmentPage(captured)
        pageSections.set(url, sections)

        // Token baseline from the HOME page (first in sorted order).
        if (allTokens.length === 0) {
          allTokens.push(extractTokens(captured))
        }

        if (workspace) {
          const pageAssets = await downloadPageAssets(
            captured,
            workspace,
            concurrency,
            signal,
          )
          for (const [original, local] of pageAssets.entries()) {
            assets.set(original, local)
          }
        }
      } catch (error) {
        const msg = `Failed to process page ${url}: ${error}`
        errors.push(msg)
        onEvent?.({ type: 'error', error: msg })
      }
    }

    // REACHABILITY / CONTENT-VALIDITY GATE (structural, no per-site logic).
    // When the target is unreachable, capture frequently still yields *a* DOM —
    // a browser/proxy error page ("This site can't be reached", a captive search
    // box, a parked-domain stub) or an unrelated document the crawler wandered
    // into. Emitting that as a successful clone produces content that has nothing
    // to do with the requested site (the "ok=true but wrong page" failure). We
    // Reject only a capture that yielded essentially NO usable content (a blank
    // shell / failed navigation), never a legitimately minimal page. The signal is
    // structural: the count of distinct extractable content strings (headings,
    // paragraphs, list items, link labels) across the home page's segmented
    // sections. A real but tiny page (e.g. a single hero with a heading + line +
    // link, ~3 strings) is VALID and must clone; only a 0-content capture is a
    // failure. A higher bar false-rejects minimal sites (this regressed example.com).
    // Threshold is content-count based, never a hostname or copy match.
    const HOME_MIN_CONTENT_STRINGS = 1
    const homeSections = (homeUrl && pageSections.get(homeUrl)) || []
    const homeContentCount = new Set(
      homeSections.flatMap((s) => expectedContentStrings(s.html)),
    ).size
    if (homeUrl && homeContentCount < HOME_MIN_CONTENT_STRINGS) {
      const msg =
        `Clone target unreachable or returned no usable homepage content ` +
        `(home page yielded only ${homeContentCount} distinct content string(s); ` +
        `need >= ${HOME_MIN_CONTENT_STRINGS}). The capture is likely a browser/proxy ` +
        `error page or an unrelated document, not the requested site.`
      errors.push(msg)
      onEvent?.({ type: 'error', error: msg })
      onEvent?.({ type: 'done' })
      return {
        success: false,
        pages: [],
        theme: allTokens[0] || defaultTokens,
        assets,
        graph,
        errors,
      }
    }

    // Phase 4: Dedup sections across pages, then ACTUALLY apply it so shared
    // nav/footer (and any repeated structural section) convert exactly once.
    const dedup = dedupSections(pageSections)
    const dedupedPageSections = applyDedup(pageSections, dedup)

    const tokens = allTokens[0] || defaultTokens

    // Cross-page conversion cache keyed by structural hash: a shared section that
    // already converted on the home page (its program built once) is reused on
    // every other page WITHOUT re-invoking the LLM.
    const convertedCache = new Map<string, ClonedSectionWithSource>()

    // CONTRACT INVARIANT (orchestrator.ts assemblePage/assembleClone):
    //   - Each section program defines EXACTLY one top-level variable
    //     `section_${kind}_${index}` where index === ClonedSection.index.
    //   - assembleClone concatenates EVERY page's section programs into ONE
    //     program string, then PageSwitch over per-page Stacks.
    // So the (kind,index) pair — and thus the variable name — must be UNIQUE
    // across the WHOLE clone, not just within a page. Two pages each exposing a
    // shared nav at page-local index 0 would otherwise both define
    // `section_nav_0`, a duplicate top-level definition in the assembled source.
    //
    // We fix both the re-key bug and the cross-page collision bug by assigning
    // every emitted section a GLOBALLY-unique running index and rewriting the
    // (cached or fresh) program's variable name to match. Visual order is
    // preserved by the per-page `sections` array order, not the numeric index
    // value, so a monotonic global counter is safe.
    let globalIndex = 0

    // Rewrite a section program so its single top-level variable becomes
    // `section_${kind}_${newIndex}` (keeping index === ClonedSection.index), and
    // return the re-keyed ClonedSection. Sections never reference each other, so
    // replacing the var's own name globally in the program is sufficient.
    const rekeySection = (
      base: import('./types.ts').ClonedSection,
      kind: string,
      url: string,
      newIndex: number,
    ) => {
      const oldVar = `section_${kind}_${base.index}`
      const newVar = `section_${kind}_${newIndex}`
      // Match the section var AND any derived helper var (`section_kind_N_h`,
      // `_s`, …) by anchoring on the index segment: a word boundary before the
      // prefix, and after the index either a `_` (helper suffix) or a non-word
      // char / end. This keeps all definitions/references for this section in
      // lock-step when re-keying to a globally-unique index.
      const program =
        oldVar === newVar
          ? base.program
          : base.program.replace(
              new RegExp(`\\bsection_${kind}_${base.index}(?=_|\\b)`, 'g'),
              newVar,
            )
      return { ...base, pageUrl: url, index: newIndex, program }
    }

    // Convert one page's deduped sections, reusing the cross-page cache. Cache
    // identity is the structural hash, threaded explicitly per section (no
    // reverse-matching on startIndex for the emit path).
    const convertPage = async (url: string) => {
      const sections = dedupedPageSections.get(url) ?? []

      // Structural hash per section, in page order — the single source of truth
      // for cache identity.
      const hashes = sections.map((s) => hashSection(s))

      // Unique, not-yet-converted sections to send to the LLM this page.
      const toConvert: Section[] = []
      const seenToConvert = new Set<string>()
      sections.forEach((section, i) => {
        const h = hashes[i]
        if (convertedCache.has(h) || seenToConvert.has(h)) return
        seenToConvert.add(h)
        toConvert.push(section)
      })

      const freshlyConverted = await convertSections(
        toConvert,
        url,
        tokens,
        concurrency,
        signal,
      )

      // Cache freshly-converted results by structural hash. convertSection now
      // stamps conv.hash = hashSection(sourceSection), so each result maps back
      // to its source by hash directly — no fragile (startIndex, kind) match,
      // which collided for same-kind sections sharing a startIndex after dedup.
      for (const conv of freshlyConverted) {
        convertedCache.set(conv.hash, conv)
      }

      // Reassemble in page order, pulling shared sections from cache and
      // re-keying every emitted instance to a globally-unique variable index so
      // the assembled multi-page program has no duplicate top-level definitions.
      const converted: ClonedSectionWithSource[] = sections.map(
        (section, i) => {
          const idx = globalIndex++
          const cached = convertedCache.get(hashes[i])
          if (cached) {
            return rekeySection(cached, section.kind, url, idx)
          }
          return {
            ...generateFallbackSection(
              section.kind,
              url,
              idx,
              tokens,
              section.html,
            ),
            sourceHtml: section.html,
          }
        },
      )

      return {
        url,
        normalizedUrl: url,
        title: `Cloned: ${url}`,
        sections: converted,
        failed: false,
        // Real site-nav set on the HOME page only; left undefined elsewhere so the
        // assembler builds PageSwitch tabs from genuine nav, not in-content links.
        ...(url === homeUrl ? { navLinks: homeNavLinks } : {}),
      }
    }

    // HOME-FIRST conversion + progressive emit. Convert & emit home, THEN the rest.
    const orderedUrls = [
      homeUrl,
      ...Array.from(dedupedPageSections.keys()).filter((u) => u !== homeUrl),
    ].filter(
      (u): u is string => Boolean(u) && dedupedPageSections.has(u as string),
    )

    for (const url of orderedUrls) {
      try {
        onEvent?.({
          type: 'page_converting',
          pageUrl: url,
          pageIndex: pages.length,
        })
        const clonedPage = await convertPage(url)
        pages.push(clonedPage)
        onEvent?.({ type: 'page_complete', pageUrl: url })
      } catch (error) {
        // Per-page failure is isolated: emit a fallback page, never hard-fail the job.
        const msg = `Failed to convert sections for ${url}: ${error}`
        errors.push(msg)
        onEvent?.({ type: 'error', error: msg })

        // Fallback sections must also use globally-unique indices, or their
        // `section_${kind}_${index}` vars collide with other pages' sections in
        // the single assembled program.
        const sections = dedupedPageSections.get(url) ?? []
        const fallbackSections = sections.map((section) => ({
          ...generateFallbackSection(
            section.kind,
            url,
            globalIndex++,
            tokens,
            section.html,
          ),
          sourceHtml: section.html,
        }))

        pages.push({
          url,
          normalizedUrl: url,
          title: `Cloned (fallback): ${url}`,
          sections: fallbackSections,
          failed: true,
          error: msg,
          ...(url === homeUrl ? { navLinks: homeNavLinks } : {}),
        })
        onEvent?.({ type: 'page_complete', pageUrl: url })
      }
    }

    onEvent?.({ type: 'done' })

    return {
      success: pages.length > 0,
      pages,
      theme: tokens,
      assets,
      graph,
      errors,
    }
  } catch (error) {
    const msg = `Clone job failed: ${error}`
    errors.push(msg)
    onEvent?.({ type: 'error', error: msg })

    return {
      success: false,
      pages: [],
      theme: defaultTokens,
      assets,
      graph: { nodes: new Map(), edges: [] },
      errors,
    }
  }
}
