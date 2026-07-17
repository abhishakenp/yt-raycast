import type { CapturedPage } from './types.ts'
import { assertPublicUrl } from './security.ts'
import { normalizeUrl } from './crawler.ts'

// Per-page Playwright capture: rendered DOM, getComputedStyle, bboxes, section screenshots, asset URLs

// One full-page screenshot (CapturedPage.screenshot) plus, when a vision consumer
// is wired, per-section element screenshots. `sectionScreenshots` is OPTIONAL and
// only populated when `captureSectionShots` is requested — otherwise we skip the
// expensive per-element screenshot pass (it currently has no downstream reader, so
// producing it unconditionally was wasted work / a hung-capture risk).
export interface CapturedPageWithShots extends CapturedPage {
  // base64-encoded PNGs keyed by the same selector id used in bboxes/computedStyles
  sectionScreenshots?: Map<string, string>
}

// Whitelist of style properties relevant to layout/typography reconstruction.
// Capturing all ~350 computed longhands is wasteful; these ~25 carry the signal.
const STYLE_PROPS = [
  'color',
  'backgroundColor',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'padding',
  'margin',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderRadius',
  'display',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'gap',
  'textAlign',
  'boxShadow',
  'width',
  'height',
] as const

const LAYOUT_SELECTOR =
  "header, nav, main, section, article, aside, footer, div[class*='hero'], div[class*='feature'], div[class*='pricing']"

let playwright: typeof import('playwright') | null = null

async function getPlaywright() {
  if (!playwright) {
    playwright = await import('playwright')
  }
  return playwright
}

// Hard ceilings so infinite-scroll / continuously-growing pages cannot hang a
// worker slot. page.goto's timeout does NOT cover the in-page evaluate below.
const AUTO_SCROLL_MAX_STEPS = 60
const AUTO_SCROLL_BUDGET_MS = 12000

// Auto-scroll to the bottom in steps so lazy/IntersectionObserver content loads before capture.
async function autoScroll(page: import('playwright').Page): Promise<void> {
  const scrolled = page.evaluate(
    async ({ maxSteps, budgetMs }) => {
      await new Promise<void>((resolve) => {
        const step = Math.max(200, Math.floor(window.innerHeight * 0.8))
        const startedAt = Date.now()
        let total = 0
        let steps = 0
        const timer = setInterval(() => {
          const before = window.scrollY
          window.scrollBy(0, step)
          total += step
          steps += 1
          const atBottom =
            window.scrollY === before ||
            total >= document.body.scrollHeight + window.innerHeight
          // Cap by step count AND wall-clock time so a page that keeps growing
          // (scrollHeight never caught) still terminates.
          if (
            atBottom ||
            steps >= maxSteps ||
            Date.now() - startedAt >= budgetMs
          ) {
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    },
    { maxSteps: AUTO_SCROLL_MAX_STEPS, budgetMs: AUTO_SCROLL_BUDGET_MS },
  )
  // Outer hard budget: if the evaluate itself stalls (e.g. setInterval starved),
  // give up rather than hang the worker indefinitely.
  const guard = new Promise<void>((resolve) =>
    setTimeout(resolve, AUTO_SCROLL_BUDGET_MS + 3000),
  )
  await Promise.race([scrolled.catch(() => {}), guard])
  // settle, then return to top for a clean full-page shot
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {})
  await page.waitForTimeout(200)
}

export interface CapturePageOptions {
  signal?: AbortSignal
  // Capture per-section element screenshots for a vision step. Off by default:
  // no current consumer reads them, and one screenshot per element is expensive.
  captureSectionShots?: boolean
}

export async function capturePage(
  browser: import('playwright').Browser,
  url: string,
  options: CapturePageOptions = {},
): Promise<CapturedPageWithShots | null> {
  const { signal, captureSectionShots = false } = options
  let context: import('playwright').BrowserContext | null = null
  let page: import('playwright').Page | null = null

  // Single guarded teardown so onAbort and finally never double-close.
  let torndown = false
  const teardown = async () => {
    if (torndown) return
    torndown = true
    await page?.close().catch(() => {})
    await context?.close().catch(() => {})
  }

  // Abort handling: register once, always remove in finally (no listener leak).
  const onAbort = () => {
    teardown()
  }
  if (signal) signal.addEventListener('abort', onAbort, { once: true })

  try {
    // SSRF guard INSIDE the try so a private-IP/blocked-host/DNS rejection
    // returns null (per-page isolation) instead of rejecting and hard-failing
    // the whole batch via Promise.race/Promise.all in capturePages.
    await assertPublicUrl(url)

    context = await browser.newContext({
      viewport: { width: 1280, height: 1024 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    page = await context.newPage()

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // SSRF defense-in-depth: page.goto follows 30x hops, and Chromium can be
    // redirected to a private/loopback/metadata host (169.254.169.254) without
    // re-checking. assertPublicUrl above only validated the PRE-redirect url, so
    // re-assert the resolved page.url() (crawler.ts/assets.ts re-assert per hop;
    // mirror that here). On rejection we fall through to the catch -> return null.
    const resolvedUrl = page.url()
    if (resolvedUrl && resolvedUrl !== url) {
      await assertPublicUrl(resolvedUrl)
    }

    // Trigger lazy/IntersectionObserver content before capturing.
    await autoScroll(page)

    // Wait for dynamic content
    await page.waitForTimeout(1000)

    // Inline the ALREADY-RENDERED CSS from the browser's loaded EXTERNAL
    // stylesheets (the `<link>`s). The browser fetched them correctly (real UA,
    // cookies, redirects), so `cssRules` is the full applied CSS as text — far
    // more faithful than re-fetching server-side (blocked/slow on many sites,
    // which is why the layout CSS goes missing). We only take <link> sheets
    // (skip <style> — already inline in the HTML, no duplication) and minify to
    // stay under the ~1 MiB per-page storage limit. Cross-origin sheets throw on
    // cssRules and are skipped (browser still loads their fonts via absolute url).
    await page.evaluate(() => {
      const minify = (css: string) =>
        css
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,>~+])\s*/g, '$1')
          .trim()
      const blocks: string[] = []
      for (const sheet of Array.from(document.styleSheets)) {
        const owner = sheet.ownerNode as Element | null
        if (!owner || owner.tagName !== 'LINK') continue // <style> already inline
        try {
          const text = Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('')
          const min = minify(text)
          if (min.length > 0) blocks.push(min)
        } catch {
          // cross-origin stylesheet — cssRules access is blocked; skip it.
        }
      }
      if (blocks.length === 0) return
      const style = document.createElement('style')
      style.setAttribute('data-clone-inlined-css', '')
      style.textContent = blocks.join('')
      document.head.appendChild(style)
    })

    // Capture HTML (now carries the inlined external CSS as a single <style>)
    const html = await page.content()

    // Capture whitelisted computed styles for key elements (serializable format)
    const computedStyles = new Map<string, Record<string, string>>()
    const styleableElements = await page.$$(LAYOUT_SELECTOR)

    // Suffix index disambiguates same-tag/same-class siblings (e.g. multiple bare
    // <section>) so their style/bbox entries don't overwrite each other (last-writer-wins).
    let styleIdx = 0
    for (const el of styleableElements.slice(0, 50)) {
      const base = await el.evaluate((e) => {
        if (e.id) return `#${e.id}`
        if (e instanceof HTMLElement && e.className)
          return `.${e.className.split(' ')[0]}`
        return e.tagName.toLowerCase()
      })
      const id = `${base}@${styleIdx++}`
      const styles = await el.evaluate(
        (e, props) => {
          const computed = window.getComputedStyle(e)
          const out: Record<string, string> = {}
          for (const prop of props) {
            // Store kebab-case keys (what getPropertyValue uses); tokens.ts reads
            // kebab-case (`background-color`, `font-family`, `border-radius`, …).
            const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
            out[kebab] = computed.getPropertyValue(kebab)
          }
          return out
        },
        [...STYLE_PROPS],
      )
      computedStyles.set(id, styles)
    }

    // tokens.ts uses styles.get("body") as the theme baseline (background,
    // foreground, font-family, border-radius, gap). LAYOUT_SELECTOR does not
    // include <body>, so capture it explicitly under the "body" key.
    const bodyStyles = await page.evaluate(
      (props) => {
        const computed = window.getComputedStyle(document.body)
        const out: Record<string, string> = {}
        for (const prop of props) {
          const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
          out[kebab] = computed.getPropertyValue(kebab)
        }
        return out
      },
      [...STYLE_PROPS],
    )
    computedStyles.set('body', bodyStyles)

    // Capture bounding boxes for layout structure
    const bboxes = new Map<
      string,
      { x: number; y: number; width: number; height: number }
    >()
    const layoutElements = await page.$$(
      'section, header, nav, footer, main, aside',
    )

    // Stable per-element ids: the layoutElements index is shared with the
    // sectionScreenshots pass below so bbox[i] and shot[i] refer to the SAME element
    // even when several share a tag/class (avoids last-writer-wins overwrite).
    const layoutIds: string[] = []
    for (let i = 0; i < layoutElements.length; i++) {
      const el = layoutElements[i]
      const base = await el.evaluate((e) => {
        if (e.id) return `#${e.id}`
        if (e instanceof HTMLElement && e.className)
          return `.${e.className.split(' ')[0]}`
        return e.tagName.toLowerCase()
      })
      const id = `${base}@${i}`
      layoutIds.push(id)
      const box = await el.boundingBox()
      if (box) {
        bboxes.set(id, box)
      }
    }

    // Full-page screenshot (overall layout reference).
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' })

    // Per-section element screenshots for a vision step. Opt-in only: there is no
    // downstream reader today, so producing them unconditionally is wasted work
    // (one screenshot per element). Skip unless the caller explicitly requests it.
    let sectionScreenshots: Map<string, string> | undefined
    if (captureSectionShots) {
      sectionScreenshots = new Map<string, string>()
      for (let i = 0; i < layoutElements.length; i++) {
        const el = layoutElements[i]
        try {
          const box = await el.boundingBox()
          if (!box || box.width < 16 || box.height < 16) continue
          // Reuse the bbox-pass id (index-suffixed) so shot/bbox keys line up 1:1.
          const id = layoutIds[i]
          if (sectionScreenshots.has(id)) continue
          const shot = await el.screenshot({ type: 'png' })
          sectionScreenshots.set(id, shot.toString('base64'))
        } catch {
          // Element may be detached or off-screen; skip it.
        }
      }
    }

    // Extract asset URLs
    const assetUrls = await page.evaluate(() => {
      const urls = new Set<string>()
      document.querySelectorAll('img[src]').forEach((img) => {
        const src = (img as HTMLImageElement).src
        if (src.startsWith('http')) urls.add(src)
      })
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el)
        const bg = style.backgroundImage
        const match = bg.match(/url\(['"]?([^'")]+)['"]?\)/)
        if (match && match[1].startsWith('http')) {
          urls.add(match[1])
        }
      })
      return Array.from(urls)
    })

    // Key by the FINAL response URL (page.goto follows redirects). The requested
    // `url` may be a pre-redirect value; canonicalize the resolved location so the
    // capture layer upholds the "key by final response.url" invariant rather than
    // relying solely on the crawler.
    const finalUrl = page.url() || url
    return {
      url: finalUrl,
      normalizedUrl: normalizeUrl(finalUrl),
      html,
      computedStyles,
      bboxes,
      screenshot,
      sectionScreenshots,
      assetUrls,
    }
  } catch (error) {
    console.error(`Failed to capture page ${url}:`, error)
    return null
  } finally {
    if (signal) signal.removeEventListener('abort', onAbort)
    await teardown()
  }
}

// Batch capture multiple pages: launch ONE browser, reuse across pages, close once in finally.
export async function capturePages(
  urls: string[],
  concurrency = 4,
  signal?: AbortSignal,
  // Default ON so the real pipeline (job.ts calls capturePages(urls, concurrency,
  // signal) with no 4th arg) populates per-section element screenshots for the
  // vision step — mandate item 3 requires full-page AND per-section shots at runtime.
  captureSectionShots = true,
): Promise<Map<string, CapturedPageWithShots>> {
  const results = new Map<string, CapturedPageWithShots>()
  if (urls.length === 0) return results

  const pw = await getPlaywright()
  const browser = await pw.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // Single guarded close (no double-close).
  let closed = false
  const closeBrowser = async () => {
    if (closed) return
    closed = true
    await browser.close().catch(() => {})
  }
  const onAbort = () => {
    closeBrowser()
  }
  if (signal) signal.addEventListener('abort', onAbort, { once: true })

  try {
    const queue = [...urls]
    const running = new Set<Promise<void>>()

    const processNext = async () => {
      if (signal?.aborted) return
      const url = queue.shift()
      if (!url) return
      try {
        // Per-page isolation: swallow ANY rejection (capturePage already returns
        // null on capture failure, but assertPublicUrl/playwright launch paths can
        // still throw). A single bad/blocked URL must never reject this promise and
        // propagate through Promise.race/Promise.all, discarding already-captured pages.
        const captured = await capturePage(browser, url, {
          signal,
          captureSectionShots,
        })
        if (captured) {
          // Key by the NORMALIZED final url so the capture map agrees with the
          // crawler's keying (crawler.ts does state.pages.set(finalNormalized,...))
          // and with the normalized homeUrl job.ts compares against. Keying by the
          // raw post-redirect page.url() would diverge whenever the browser retains
          // www., re-adds a trailing slash, reorders query params, or follows an
          // http->https / path redirect, silently breaking home-first ordering and
          // pageSections lookup. captured.normalizedUrl === normalizeUrl(captured.url).
          results.set(captured.normalizedUrl, captured)
        }
      } catch (error) {
        console.error(`Failed to capture page ${url}:`, error)
      }
    }

    while (queue.length > 0 && !signal?.aborted) {
      while (
        running.size < concurrency &&
        queue.length > 0 &&
        !signal?.aborted
      ) {
        const p = processNext().finally(() => running.delete(p))
        running.add(p)
      }
      if (running.size > 0) {
        await Promise.race(running)
      }
    }

    await Promise.all(running)
    return results
  } finally {
    if (signal) signal.removeEventListener('abort', onAbort)
    await closeBrowser()
  }
}
