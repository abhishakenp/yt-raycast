import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { runTargetedEdits } from './targeted-edit-pass'

// Server-side clone job: crawl a public site with Playwright, stream a verbatim,
// self-contained multi-page clone into a Convex session (home first so the preview
// paints instantly), then apply prompt-driven targeted text edits to the home page.
//
// Generic by design: no per-site/slug logic. Network egress is SSRF-guarded
// (assertPublicUrl in the crawler, capture, and self-containment layers). The
// browser is launched ONCE and always closed in finally.

const CRAWL_MAX_DEPTH = 3
const CRAWL_MAX_PAGES = 20
const CRAWL_CONCURRENCY = 2
const CAPTURE_CONCURRENCY = 2
// Overall wall-clock budget so a slow/hostile site can never pin a worker forever.
const JOB_TIMEOUT_MS = 180_000
// Use a longer Convex HTTP timeout than the 5s default — clone page docs can be
// near the byte cap and the mutation writes a sizeable html blob.
const CONVEX_HTTP_TIMEOUT_MS = 30_000

type CloneConvexClient = Pick<ConvexHttpClient, 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

interface CloneEngine {
  assertPublicUrl: typeof import('@ship-fast/engine/clone/security.ts').assertPublicUrl
  crawlSite: typeof import('@ship-fast/engine/clone/crawler.ts').crawlSite
  normalizeUrl: typeof import('@ship-fast/engine/clone/crawler.ts').normalizeUrl
  capturePage: typeof import('@ship-fast/engine/clone/capture.ts').capturePage
  selfContainPage: typeof import('@ship-fast/engine/clone/verbatim.ts').selfContainPage
}

// Dynamic import keeps the engine (playwright, provider SDKs) out of the route's
// static module graph.
const loadCloneEngine = async (): Promise<CloneEngine> => {
  const [{ assertPublicUrl }, { crawlSite, normalizeUrl }, { capturePage }, { selfContainPage }] =
    await Promise.all([
      import('@ship-fast/engine/clone/security.ts'),
      import('@ship-fast/engine/clone/crawler.ts'),
      import('@ship-fast/engine/clone/capture.ts'),
      import('@ship-fast/engine/clone/verbatim.ts'),
    ])
  return { assertPublicUrl, crawlSite, normalizeUrl, capturePage, selfContainPage }
}

const loadPlaywright = async () => {
  const pw = await import('playwright')
  return pw
}

// Order crawled pages with HOME (normalized seed) FIRST, then the rest in crawl
// (insertion) order. The crawler keys state.pages by FINAL normalized url; the home
// may have redirected (http->https, www), so fall back to the first page if the
// normalized seed isn't a literal key.
function orderPages(
  pages: Map<string, { html: string; depth: number }>,
  homeNormalized: string,
): string[] {
  const keys = Array.from(pages.keys())
  if (keys.length === 0) return []
  const homeIdx = keys.indexOf(homeNormalized)
  const home = homeIdx >= 0 ? keys[homeIdx] : keys[0]
  const rest = keys.filter((k) => k !== home)
  return [home, ...rest]
}

export async function runCloneJob(input: {
  sessionId: string
  anonymousOwnerSecret?: string
  bearer?: string
  seedUrl: string
  brief: string
}): Promise<void> {
  const { sessionId, anonymousOwnerSecret, bearer, seedUrl, brief } = input

  const engine = await loadCloneEngine()

  // SSRF / scheme guard — throws on private/loopback/blocked hosts. Caller handles.
  await engine.assertPublicUrl(seedUrl)

  const client: CloneConvexClient = createRuntimeConvexHttpClient(CONVEX_HTTP_TIMEOUT_MS)
  if (bearer) client.setAuth?.(bearer)

  const sid = sessionId as Id<'sessions'>
  const writePage = (args: {
    pathname: string
    title?: string
    html: string
    isHome: boolean
    failed: boolean
    order: number
    byteLength: number
    truncated?: boolean
  }) =>
    client.mutation(api.sessions.writeClonePageDoc, {
      sessionId: sid,
      anonymousOwnerSecret,
      ...args,
    })

  const controller = new AbortController()
  const jobTimer = setTimeout(() => controller.abort(), JOB_TIMEOUT_MS)

  const pw = await loadPlaywright()
  const browser = await pw.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let homeHtml = ''
  let finalized = false

  try {
    // 1. Crawl: ordered list of same-domain page urls, HOME first.
    const homeNormalized = engine.normalizeUrl(seedUrl)
    const { pages } = await engine.crawlSite(seedUrl, {
      maxDepth: CRAWL_MAX_DEPTH,
      maxPages: CRAWL_MAX_PAGES,
      concurrency: CRAWL_CONCURRENCY,
      signal: controller.signal,
    })

    let orderedKeys = orderPages(pages, homeNormalized)
    // If the crawl produced nothing (fetch blocked, etc.), still attempt the seed
    // directly so we at least try to clone the home page.
    if (orderedKeys.length === 0) orderedKeys = [homeNormalized]

    // The url we hand to capturePage must be a real, absolute url. crawlSite keys by
    // normalized url which IS absolute; for the seed-fallback use the raw seed.
    const urlFor = (key: string, isHome: boolean): string =>
      isHome && !pages.has(key) ? seedUrl : key

    // 2. Capture HOME FIRST (sequential), self-contain, write, finalize — so the
    //    preview paints the moment home lands, before the rest stream in.
    const homeKey = orderedKeys[0]
    try {
      const captured = await engine.capturePage(browser, urlFor(homeKey, true), {
        signal: controller.signal,
      })
      if (captured) {
        const contained = await engine.selfContainPage(captured, {
          finalUrl: captured.url,
        })
        homeHtml = contained.html
        await writePage({
          pathname: contained.pathname,
          title: contained.title,
          html: contained.html,
          isHome: true,
          failed: false,
          order: 0,
          byteLength: contained.byteLength,
          truncated: contained.truncated,
        })
      } else {
        await writePage({
          pathname: '/',
          html: '',
          isHome: true,
          failed: true,
          order: 0,
          byteLength: 0,
        })
      }
    } catch (err) {
      console.warn(
        `[clone] home capture failed for ${sessionId}:`,
        (err as Error)?.message ?? err,
      )
      await writePage({
        pathname: '/',
        html: '',
        isHome: true,
        failed: true,
        order: 0,
        byteLength: 0,
      }).catch(() => undefined)
    }

    // The MOMENT the home doc is written, finalize so the preview paints instantly.
    try {
      await client.mutation(api.sessions.finalizeClonePreview, {
        sessionId: sid,
        anonymousOwnerSecret,
      })
      finalized = true
    } catch (err) {
      console.warn(
        `[clone] finalizeClonePreview failed for ${sessionId}:`,
        (err as Error)?.message ?? err,
      )
    }

    // 3. Capture the REST in a bounded pool of CAPTURE_CONCURRENCY. capturePages
    //    only returns a final Map (no per-page callback), so to STREAM each page
    //    the moment it completes we drive capturePage directly here. Write each
    //    page as soon as it self-contains; a single capture failure writes a failed
    //    doc and never aborts the batch.
    const restKeys = orderedKeys.slice(1)
    let cursor = 0
    const captureRest = async (): Promise<void> => {
      while (!controller.signal.aborted) {
        const i = cursor++
        if (i >= restKeys.length) return
        const key = restKeys[i]
        const order = i + 1 // home was order 0
        try {
          const captured = await engine.capturePage(browser, urlFor(key, false), {
            signal: controller.signal,
          })
          if (captured) {
            const contained = await engine.selfContainPage(captured, {
              finalUrl: captured.url,
            })
            await writePage({
              pathname: contained.pathname,
              title: contained.title,
              html: contained.html,
              isHome: false,
              failed: false,
              order,
              byteLength: contained.byteLength,
              truncated: contained.truncated,
            })
          } else {
            await writePage({
              pathname: key,
              html: '',
              isHome: false,
              failed: true,
              order,
              byteLength: 0,
            })
          }
        } catch (err) {
          console.warn(
            `[clone] page capture failed for ${sessionId} (${key}):`,
            (err as Error)?.message ?? err,
          )
          await writePage({
            pathname: key,
            html: '',
            isHome: false,
            failed: true,
            order,
            byteLength: 0,
          }).catch(() => undefined)
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(CAPTURE_CONCURRENCY, restKeys.length) },
      () => captureRest(),
    )
    await Promise.all(workers)

    // 4. After the home doc is finalized AND we have home html AND brief is
    //    non-empty → run prompt-driven targeted text edits.
    if (finalized && homeHtml && brief.trim()) {
      try {
        await runTargetedEdits({
          client,
          sessionId,
          anonymousOwnerSecret,
          homeHtml,
          brief,
        })
      } catch (err) {
        console.warn(
          `[clone] targeted edits failed for ${sessionId}:`,
          (err as Error)?.message ?? err,
        )
      }
    }
  } finally {
    clearTimeout(jobTimer)
    await browser.close().catch(() => undefined)
  }
}
