import { describe, it, expect } from "vitest"
import { buildCloneBrief } from "./brief.ts"
import type { CapturedPage } from "./types.ts"

function makeCapture(html: string, url = "https://acme.example.com/"): CapturedPage {
  return {
    url,
    normalizedUrl: url,
    html,
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls: [],
  }
}

describe("buildCloneBrief", () => {
  it("captures brand, nav labels, headings and CTA from a normal page", () => {
    const html = `
      <html>
        <head><title>Acme Pricing Co — best widgets</title></head>
        <body>
          <header>
            <nav>
              <a href="/features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <h1>Ship faster with Acme</h1>
            <p>Acme helps your team launch products in record time.</p>
            <h2>Simple pricing for everyone</h2>
            <p>Pick a plan and get started today.</p>
            <button>Get Started Free</button>
          </main>
        </body>
      </html>`
    const brief = buildCloneBrief(makeCapture(html))

    // brand from <title> (leading token before the em-dash)
    expect(brief).toContain("Acme Pricing Co")
    // nav labels
    expect(brief).toContain("Features")
    expect(brief).toContain("Pricing")
    expect(brief).toContain("About")
    // headings
    expect(brief).toContain("Ship faster with Acme")
    expect(brief).toContain("Simple pricing for everyone")
    // lead copy attached under headings
    expect(brief).toContain("launch products in record time")
    // CTA label
    expect(brief).toContain("Get Started Free")
    // structural scaffolding present
    expect(brief).toMatch(/Navigation:/)
    expect(brief).toMatch(/Sections \(in order\):/)
    expect(brief).toMatch(/Primary actions:/)
    // saas kind inferred from pricing / sign-up style keywords
    expect(brief.toLowerCase()).toContain("saas")
  })

  it("returns a non-empty brief for near-empty html (defensive)", () => {
    const brief = buildCloneBrief(makeCapture("<html></html>", "https://fallback-brand.io/"))
    expect(typeof brief).toBe("string")
    expect(brief.length).toBeGreaterThan(0)
    // brand falls back to the url host
    expect(brief).toContain("fallback-brand.io")
    expect(brief).toContain("Reproduce this structure and content faithfully using native sections")
  })

  it("caps the brief at ~6000 chars", () => {
    const manySections = Array.from({ length: 200 }, (_, i) =>
      `<h2>Section heading number ${i}</h2><p>${"lorem ipsum dolor sit amet ".repeat(20)}</p>`,
    ).join("")
    const html = `<html><head><title>Big Site</title></head><body><main>${manySections}</main></body></html>`
    const brief = buildCloneBrief(makeCapture(html))
    expect(brief.length).toBeLessThanOrEqual(6000)
    expect(brief).toContain("Big Site")
  })

  it("does not crash on a completely empty html string", () => {
    const brief = buildCloneBrief(makeCapture("", "https://x.test/"))
    expect(brief.length).toBeGreaterThan(0)
  })
})
