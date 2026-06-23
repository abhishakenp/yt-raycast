import { describe, it, expect } from "vitest"
import { selfContainPage, NAV_SHIM_SCRIPT } from "./verbatim.ts"
import type { CapturedPage } from "./types.ts"

// Build a minimal CapturedPage around a body of HTML. The non-html fields are
// unused by selfContainPage but required by the CapturedPage shape.
function makeCaptured(bodyHtml: string, headHtml = ""): CapturedPage {
  const html = `<!DOCTYPE html><html><head><title>Example Home</title>${headHtml}</head><body>${bodyHtml}</body></html>`
  return {
    url: "https://example.com/",
    normalizedUrl: "https://example.com/",
    html,
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls: [],
  }
}

// A canned fetch that serves CSS + font bytes from an in-memory table keyed by url.
function mockFetch(table: Record<string, { body: string | Uint8Array; status?: number }>): typeof fetch {
  const impl = async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
    const entry = table[url]
    if (!entry) {
      return new Response("", { status: 404 })
    }
    const status = entry.status ?? 200
    const body: BodyInit =
      typeof entry.body === "string" ? entry.body : new Uint8Array(entry.body)
    return new Response(body, { status })
  }
  return impl as unknown as typeof fetch
}

describe("selfContainPage", () => {
  const finalUrl = "https://example.com/"

  it("inlines an external stylesheet into a <style> block", async () => {
    const captured = makeCaptured(
      `<h1>Hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      "https://example.com/app.css": { body: "body{color:rebeccapurple}" },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.html).not.toContain("<link")
    expect(out.html).toContain("<style>")
    expect(out.html).toContain("rebeccapurple")
  })

  it("resolves a relative img src to an absolute URL", async () => {
    const captured = makeCaptured(`<img src="/images/logo.png">`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain("https://example.com/images/logo.png")
    expect(out.html).not.toMatch(/src="\/images\/logo\.png"/)
  })

  it("absolutizes srcset candidates", async () => {
    const captured = makeCaptured(`<img src="/a.png" srcset="/a.png 1x, /b.png 2x">`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain("https://example.com/a.png 1x")
    expect(out.html).toContain("https://example.com/b.png 2x")
  })

  it("strips all <script> tags from the source", async () => {
    const captured = makeCaptured(`<div>hi</div><script>window.evil=1</script>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).not.toContain("window.evil")
  })

  it("removes inline on* event handlers", async () => {
    const captured = makeCaptured(`<button onclick="boom()">go</button>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).not.toContain("onclick")
    expect(out.html).not.toContain("boom()")
  })

  it("removes script preload / modulepreload links", async () => {
    const captured = makeCaptured(
      `<p>x</p>`,
      `<link rel="preload" as="script" href="https://example.com/a.js"><link rel="modulepreload" href="https://example.com/b.js">`,
    )
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).not.toContain("a.js")
    expect(out.html).not.toContain("b.js")
  })

  it("rewrites a same-origin <a> into a clone-nav anchor", async () => {
    const captured = makeCaptured(`<a href="/about">About</a>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain('data-clone-path="/about"')
    expect(out.html).toContain('data-clone-abs="https://example.com/about"')
    expect(out.html).toMatch(/href="#"/)
  })

  it("marks an external <a> with target=_blank rel=noopener", async () => {
    const captured = makeCaptured(`<a href="https://other.example.org/x">Out</a>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain('href="https://other.example.org/x"')
    expect(out.html).toContain('target="_blank"')
    expect(out.html).toContain('rel="noopener noreferrer"')
    // The external anchor itself must not be clone-nav rewritten. (The NAV_SHIM
    // source references the data-clone-path attribute name, so assert on the <a>.)
    expect(out.html).not.toMatch(/<a[^>]*data-clone-path/)
  })

  it("leaves mailto:/#/data: anchors untouched", async () => {
    const captured = makeCaptured(`<a href="mailto:hi@example.com">m</a><a href="#top">t</a>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain('href="mailto:hi@example.com"')
    expect(out.html).toContain('href="#top"')
  })

  it("appends the NAV_SHIM_SCRIPT as the only script in body", async () => {
    const captured = makeCaptured(`<p>hi</p>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.html).toContain("ship-clone-nav")
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
    // exactly one <script> (ours) survives
    const scriptCount = (out.html.match(/<script/g) || []).length
    expect(scriptCount).toBe(1)
  })

  it("computes pathname with sorted search params", async () => {
    const captured = makeCaptured(`<p>x</p>`)
    const out = await selfContainPage(captured, {
      finalUrl: "https://example.com/search?b=2&a=1",
      fetchImpl: mockFetch({}),
    })
    expect(out.pathname).toBe("/search?a=1&b=2")
  })

  it("uses document <title> as title and pathname '/' for root", async () => {
    const captured = makeCaptured(`<p>x</p>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.title).toBe("Example Home")
    expect(out.pathname).toBe("/")
  })

  it("inlines a SAME-ORIGIN @font-face font as a data: URI", async () => {
    const css = `@font-face{font-family:"X";src:url(/fonts/x.woff2) format("woff2")}body{font-family:X}`
    const fontBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      "https://example.com/app.css": { body: css },
      "https://example.com/fonts/x.woff2": { body: fontBytes },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.html).toContain("data:font/woff2;base64,")
    expect(out.html).not.toContain("/fonts/x.woff2")
  })

  it("keeps a CROSS-ORIGIN @font-face font as an absolute URL", async () => {
    const css = `@font-face{font-family:"X";src:url(https://cdn.other.org/x.woff2)}`
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      "https://example.com/app.css": { body: css },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.html).toContain("https://cdn.other.org/x.woff2")
    expect(out.html).not.toContain("data:font")
  })

  it("drops a stylesheet whose fetch fails without breaking the page", async () => {
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/missing.css">`,
    )
    // 404 -> safeFetch returns null -> link dropped.
    const fetchImpl = mockFetch({
      "https://example.com/missing.css": { body: "", status: 404 },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.html).not.toContain("missing.css")
    expect(out.html).toContain("<h1>hi</h1>")
  })

  it("triggers truncated=true and drops inlined fonts for a >900KB doc", async () => {
    // A huge font (~1MB) inlined as base64 would blow past the 900KB cap. The
    // size-cap pass must revert the @font-face to its absolute URL and set truncated.
    const bigFont = new Uint8Array(1_000_000).fill(65)
    const css = `@font-face{font-family:"X";src:url(/fonts/big.woff2)}body{font-family:X}`
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      "https://example.com/app.css": { body: css },
      "https://example.com/fonts/big.woff2": { body: bigFont },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.truncated).toBe(true)
    // Font data URI dropped; absolute font URL restored.
    expect(out.html).not.toContain("data:font/woff2;base64,")
    expect(out.html).toContain("https://example.com/fonts/big.woff2")
    expect(out.byteLength).toBeLessThanOrEqual(900_000)
  })

  it("drops the largest <style> when still over cap after font stripping", async () => {
    // A single giant inline <style> with no fonts: only Step 2 (drop largest style)
    // can bring it under the cap.
    const giantCss = "/*" + "x".repeat(1_000_000) + "*/"
    const captured = makeCaptured(`<h1>hi</h1>`, `<style>${giantCss}</style>`)
    const out = await selfContainPage(captured, { finalUrl, fetchImpl: mockFetch({}) })
    expect(out.truncated).toBe(true)
    expect(out.byteLength).toBeLessThanOrEqual(900_000)
    expect(out.html).toContain("<h1>hi</h1>")
  })
})
